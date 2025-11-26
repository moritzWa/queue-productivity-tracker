import { renderWidget, useSessionStorageState } from '@remnote/plugin-sdk';
import React, { useEffect, useState } from 'react';

function Popup() {
  const [cardPerMinute, setCardPerMinute] = useSessionStorageState(
    'cardPerMinute',
    0
  );
  const [remainingTime, setRemainingTime] = useSessionStorageState(
    'remainingTime',
    '∞'
  );
  const [totalCardsCompleted, setTotalCardsCompleted] = useSessionStorageState(
    'totalCardsCompleted',
    0
  );
  const [totalTimeSpent, setTotalTimeSpent] = useSessionStorageState(
    'totalTimeSpent',
    0
  );
  const [totalAgainCount, setTotalAgainCount] = useSessionStorageState(
    'totalAgainCount',
    0
  );
  const [expectedCompletionTime, setExpectedCompletionTime] =
    useSessionStorageState('expectedCompletionTime', '');
  const [loaded, setLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setLoaded(true);
    console.log('Popup component mounted.');

    const interval = setInterval(() => {
      setCurrentTime(new Date());

      // Check if queue element exists, if not, we've left the queue
      const queueElement = document.querySelector('.rn-queue');
      if (!queueElement) {
        console.log('Queue element not found, closing widget.');
        window.close();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      console.log('Popup component unmounted.');
    };
  }, []);

  // Generate color based on continuous gradient
  const getCardPerMinuteColor = (value: number): string => {
    // Clamp the value between 0 and 6 for the gradient
    const clampedValue = Math.max(0, Math.min(6, value));

    // Map 0-1 to red, 1-5 to red→green gradient, 5+ to green
    let hue: number;
    if (clampedValue <= 1) {
      hue = 0; // Red
    } else if (clampedValue >= 5) {
      hue = 120; // Green
    } else {
      // Linear interpolation from hue 0 (red) to 120 (green) over range 1-5
      hue = ((clampedValue - 1) / 4) * 120;
    }

    return `hsl(${hue}, 85%, 50%)`;
  };

  const cardPerMinuteColor = getCardPerMinuteColor(cardPerMinute);

  const renderArrow = () => {
    return cardPerMinute < 3 ? (
      <span style={{ color: getCardPerMinuteColor(cardPerMinute) }}>↓</span>
    ) : cardPerMinute > 5 ? (
      <span style={{ color: getCardPerMinuteColor(cardPerMinute) }}>↑</span>
    ) : null;
  };

  // Calculate session time
  const sessionStartTime = new Date();
  sessionStartTime.setSeconds(
    sessionStartTime.getSeconds() - totalTimeSpent * 60
  );
  const sessionDuration = new Date(
    currentTime.getTime() - sessionStartTime.getTime()
  );

  return (
    <div
      id="card-stats"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        whiteSpace: 'nowrap',
        overflowX: 'auto',
        fontFamily: 'Bookerly, "Segoe UI", sans-serif',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 2s',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '0.2px solid rgba(128, 128, 128, 0.3)',
        position: 'relative',
        margin: '0 auto',
        width: '800px',
        background: 'transparent',
      }}
    >
      <div style={{ margin: '0 5px', color: 'var(--text-primary)' }}>
        Clock:{' '}
        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {currentTime.toLocaleTimeString()}
        </span>
      </div>
      <div style={{ margin: '0 5px', color: 'var(--text-primary)' }}>
        Session:{' '}
        <span style={{ fontWeight: 'bold', color: 'var(--text-success)' }}>
          {sessionDuration.toISOString().substr(14, 5)}
        </span>
      </div>
      <div style={{ margin: '0 5px', color: 'var(--text-primary)' }}>
        Speed:{' '}
        <span style={{ fontWeight: 'bold', color: cardPerMinuteColor }}>
          {cardPerMinute} card/m
        </span>{' '}
        {renderArrow()}
      </div>
      <div style={{ margin: '0 5px', color: 'var(--text-primary)' }}>
        Status: [
        <span style={{ fontWeight: 'bold', color: 'var(--text-success)' }}>
          {totalCardsCompleted}
        </span>
        ] [
        <span style={{ fontWeight: 'bold', color: 'var(--text-success)' }}>
          {totalCardsCompleted - totalAgainCount}
        </span>
        /
        <span style={{ fontWeight: 'bold', color: 'var(--text-danger)' }}>
          {totalAgainCount}
        </span>
        ]
      </div>
      <div style={{ margin: '0 5px', color: 'var(--text-primary)' }}>
        Expected:{' '}
        <span style={{ fontWeight: 'bold', color: 'var(--text-success)' }}>
          {remainingTime}
        </span>{' '}
        |{' '}
        <span style={{ fontWeight: 'bold', color: 'var(--text-success)' }}>
          {expectedCompletionTime}
        </span>
      </div>
    </div>
  );
}

renderWidget(Popup);
