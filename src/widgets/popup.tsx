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
    }, 1000);

    return () => {
      clearInterval(interval);
      console.log('Popup component unmounted.');
    };
  }, []);

  const cardPerMinuteColor =
    cardPerMinute < 3
      ? 'var(--text-danger)'
      : cardPerMinute <= 5
      ? 'var(--text-warning)'
      : 'var(--text-success)';

  const renderArrow = () => {
    return cardPerMinute < 3 ? (
      <span style={{ color: 'var(--text-danger)' }}>↓</span>
    ) : cardPerMinute > 5 ? (
      <span style={{ color: 'var(--text-success)' }}>↑</span>
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
        borderRadius: '10px',
        overflow: 'hidden',
        border: '0.2px solid rgba(128, 128, 128, 0.3)',
        position: 'relative',
        paddingLeft: '10px',
        margin: '0 auto',
        width: '800px',
        background: 'transparent',
      }}
    >
      <div style={{ margin: '0 5px', color: 'var(--text-primary)' }}>
        Clock:{' '}
        <span style={{ fontWeight: 'bold', color: 'var(--text-success)' }}>
          {currentTime.toLocaleTimeString()}
        </span>
      </div>
      <div style={{ margin: '0 5px', color: 'var(--text-primary)' }}>
        Session:{' '}
        <span style={{ fontWeight: 'bold', color: 'var(--text-success)' }}>
          {sessionDuration.toISOString().substr(11, 8)}
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
        </span>
        |
        <span style={{ fontWeight: 'bold', color: 'var(--text-success)' }}>
          {expectedCompletionTime}
        </span>
      </div>
    </div>
  );
}

renderWidget(Popup);
