import {
  AppEvents,
  declareIndexPlugin,
  QueueInteractionScore,
  ReactRNPlugin,
  WidgetLocation,
} from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';

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
    plugin.storage.setSession('cardPerMinute', 0);
    plugin.storage.setSession('remainingTime', 0);
    plugin.storage.setSession('totalCardsCompleted', 0);
    plugin.storage.setSession('totalTimeSpent', 0);
    plugin.storage.setSession('totalAgainCount', 0);
    plugin.storage.setSession('expectedCompletionTime', '');

    async function updateDisplay(
      totalTimeSpent: number,
      totalCardsCompleted: number,
      totalCardsInDeckRemain: number
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

      setTimeout(async () => {
        await plugin.window.closeAllFloatingWidgets();
        await plugin.window.openFloatingWidget(
          'popup',
          { top: -45, left: 0 },
          'rn-queue',
          false
        );
      }, 25);
    }

    plugin.event.addListener(
      AppEvents.RevealAnswer,
      undefined,
      async (data) => {
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
        // Count all cards for speed calculation
        totalCardsCompleted++;
        cardTimestamps.push(Date.now());

        // Track "Again" cards separately for status display
        if (
          (data.score as QueueInteractionScore) === QueueInteractionScore.AGAIN
        ) {
          totalAgainCount++;
        }

        var totalCardsInDeckRemain =
          await plugin.queue.getNumRemainingCards();
        if (totalCardsInDeckRemain !== undefined)
          updateDisplay(
            totalTimeSpent,
            totalCardsCompleted,
            totalCardsInDeckRemain
          );
      }
    );

    plugin.event.addListener(AppEvents.QueueExit, undefined, async (data) => {
      plugin.window.closeAllFloatingWidgets();
    });
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
