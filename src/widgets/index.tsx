import {
  AppEvents,
  declareIndexPlugin,
  QueueInteractionScore,
  QueueItemType,
  ReactRNPlugin,
  WidgetLocation,
} from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';

// Global state to prevent duplicate widgets (shared across all plugin instances)
let globalWidgetUpdateTimer: NodeJS.Timeout | null = null;
let isWidgetCurrentlyOpen = false;

async function onActivate(plugin: ReactRNPlugin) {
  // Register settings
  await plugin.app.registerWidget('popup', WidgetLocation.FloatingWidget, {
    dimensions: {
      width: 1000,
      height: 'auto',
    },
  });

  plugin.event.addListener(AppEvents.QueueEnter, undefined, () => {
    const sessionStartTime = Date.now();
    var startTime = sessionStartTime;
    var totalCardsCompleted = 0;
    var totalTimeSpent = 0;
    var totalAgainCount = 0;
    var cardTimestamps: number[] = [];

    console.log('Queue entered - initializing');

    // Initialize session storage
    plugin.storage.setSession('cardPerMinute', 0);
    plugin.storage.setSession('remainingTime', '∞');
    plugin.storage.setSession('totalCardsCompleted', 0);
    plugin.storage.setSession('totalTimeSpent', 0);
    plugin.storage.setSession('totalAgainCount', 0);
    plugin.storage.setSession('expectedCompletionTime', '');
    plugin.storage.setSession('currentCardAgeMonths', 0);

    async function updateDisplay(
      totalTimeSpent: number,
      totalCardsCompleted: number,
      totalCardsInDeckRemain: number,
      cardAgeMonths: number
    ) {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      const recentCards = cardTimestamps.filter((t) => t >= fiveMinutesAgo);

      const elapsedTimeMinutes = (now - sessionStartTime) / (1000 * 60);
      const timeWindowMinutes = Math.min(elapsedTimeMinutes, 5);

      const cardPerMinute =
        timeWindowMinutes > 0
          ? parseFloat((recentCards.length / timeWindowMinutes).toFixed(2))
          : 0;

      const sessionTimeMinutes = totalTimeSpent / 60;
      const overallCardPerMinute = parseFloat(
        (totalCardsCompleted / sessionTimeMinutes).toFixed(2)
      );
      const remainingMinutes = totalCardsInDeckRemain / overallCardPerMinute;

      let remainingTime = '∞';
      let expectedCompletionTime = '';

      if (isFinite(remainingMinutes)) {
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = Math.floor(remainingMinutes % 60);
        remainingTime = `${hours}H ${minutes}M`;

        const completionDate = new Date();
        completionDate.setMinutes(
          completionDate.getMinutes() + remainingMinutes
        );
        expectedCompletionTime = completionDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      plugin.storage.setSession('cardPerMinute', cardPerMinute);
      plugin.storage.setSession('remainingTime', remainingTime);
      plugin.storage.setSession('totalCardsCompleted', totalCardsCompleted);
      plugin.storage.setSession(
        'totalTimeSpent',
        (totalTimeSpent / 60).toFixed(2)
      );
      plugin.storage.setSession('totalAgainCount', totalAgainCount);
      plugin.storage.setSession(
        'expectedCompletionTime',
        expectedCompletionTime
      );
      plugin.storage.setSession('currentCardAgeMonths', cardAgeMonths);

      // Widget refresh with duplicate prevention using debouncing
      // Cancel any pending widget updates (global timer shared across all instances)
      if (globalWidgetUpdateTimer) {
        clearTimeout(globalWidgetUpdateTimer);
        console.log('Cancelled pending widget update (debouncing)');
      }

      globalWidgetUpdateTimer = setTimeout(async () => {
        try {
          // Safety check: Don't open if widget is already open
          if (isWidgetCurrentlyOpen) {
            console.log('Widget already open, skipping duplicate open');
            globalWidgetUpdateTimer = null;
            return;
          }

          isWidgetCurrentlyOpen = true;
          await plugin.window.closeAllFloatingWidgets();
          await plugin.window.openFloatingWidget(
            'popup',
            { top: -45, left: 0 },
            'rn-queue',
            false
          );
          console.log('Widget opened/refreshed with stats:', {
            cardPerMinute,
            totalCardsCompleted,
            totalAgainCount,
            remainingTime,
            cardAgeMonths
          });
        } catch (error) {
          console.error('Error opening widget:', error);
          isWidgetCurrentlyOpen = false; // Reset flag on error
        } finally {
          globalWidgetUpdateTimer = null;
        }
      }, 100); // Debounce time: 100ms
    }

    plugin.event.addListener(
      AppEvents.RevealAnswer,
      undefined,
      async () => {
        if (startTime) {
          var endTime = Date.now();
          var TimeDiff = (endTime - startTime) / 1000;
          totalTimeSpent = totalTimeSpent + TimeDiff;
          startTime = endTime;
        }
      }
    );

    plugin.event.addListener(
      AppEvents.QueueCompleteCard,
      undefined,
      async (data) => {
        // Debug: Log full event data to see what RemNote provides
        console.log('QueueCompleteCard full event data:', data);
        console.log('QueueCompleteCard data keys:', Object.keys(data));

        // Get current queue item type to filter out non-flashcard items
        const queueItemType = await plugin.queue.getCurrentQueueScreenType();
        const currentCard = await plugin.queue.getCurrentCard();

        // Debug logging
        console.log('QueueCompleteCard event fired:', {
          queueItemType,
          queueItemTypeName: queueItemType ? QueueItemType[queueItemType] : 'undefined',
          score: data.score,
          cardId: currentCard?._id,
          cardType: currentCard?.type,
          remId: currentCard?.remId
        });

        // Only count actual flashcards (not system cards like checkpoints, milestones, etc.)
        const isActualFlashcard = queueItemType === QueueItemType.ForwardCard ||
                                   queueItemType === QueueItemType.BackwardCard ||
                                   queueItemType === QueueItemType.ClozeCard;

        if (!isActualFlashcard) {
          console.log('Skipping non-flashcard queue item:', QueueItemType[queueItemType!]);
          return;
        }

        // Count all cards for speed calculation
        totalCardsCompleted++;
        cardTimestamps.push(Date.now());

        // Track "Again" cards separately for status display
        if (
          (data.score as QueueInteractionScore) === QueueInteractionScore.AGAIN
        ) {
          totalAgainCount++;
        }

        // Calculate card age in months using Rem creation date (more reliable than Card)
        let cardAgeMonths = 0;
        const remId = currentCard?.remId;
        if (remId) {
          const rem = await plugin.rem.findOne(remId);
          if (rem?.createdAt) {
            const ageInMilliseconds = Date.now() - rem.createdAt;
            cardAgeMonths = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 30.44)); // Average month length
            console.log('Card age from Rem:', {
              remId: remId,
              createdAt: new Date(rem.createdAt).toLocaleDateString(),
              ageMonths: cardAgeMonths
            });
          } else {
            console.log('Rem not found or missing createdAt:', remId);
          }
        }

        var totalCardsInDeckRemain =
          await plugin.queue.getNumRemainingCards();
        if (totalCardsInDeckRemain !== undefined)
          updateDisplay(
            totalTimeSpent,
            totalCardsCompleted,
            totalCardsInDeckRemain,
            cardAgeMonths
          );
      }
    );

    plugin.event.addListener(AppEvents.QueueExit, undefined, async () => {
      // Cancel any pending widget updates
      if (globalWidgetUpdateTimer) {
        clearTimeout(globalWidgetUpdateTimer);
        globalWidgetUpdateTimer = null;
      }
      console.log('Queue exited - closing widget');
      await plugin.window.closeAllFloatingWidgets();
      // Reset widget open flag
      isWidgetCurrentlyOpen = false;
    });
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
