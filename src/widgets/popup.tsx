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
  const [currentCardAgeMonths, setCurrentCardAgeMonths] = useSessionStorageState(
    'currentCardAgeMonths',
    0
  );
  const [loaded, setLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setLoaded(true);
    console.log('Popup component mounted.');

    // Update clock every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

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

  // Generate color for card age (newer = green, older = red)
  const getCardAgeColor = (ageMonths: number): string => {
    let hue: number;
    if (ageMonths <= 2.5) {
      // Below 2.5 months: Green
      hue = 120;
    } else if (ageMonths >= 4) {
      // 4+ months: Red
      hue = 0;
    } else {
      // 2.5 to 4 months: Gradient from green (120) to red (0)
      // Linear interpolation from hue 120 (green) to 0 (red) over range 2.5-4
      const progress = (ageMonths - 2.5) / (4 - 2.5); // 0 to 1
      hue = 120 - (progress * 120); // 120 down to 0
    }

    return `hsl(${hue}, 85%, 50%)`;
  };

  const cardAgeColor = getCardAgeColor(currentCardAgeMonths);

  // Format card age as years, months, or days
  const formatCardAge = (ageMonths: number): string => {
    // For cards less than 1 month old, show days instead
    if (ageMonths < 1) {
      const ageDays = Math.floor(ageMonths * 30.44); // Convert fraction of month to days
      return `${ageDays}d`;
    }

    // For cards less than a year old, show months
    if (ageMonths < 12) {
      return `${ageMonths}mo`;
    }

    // For cards over a year old, show years and months
    const years = Math.floor(ageMonths / 12);
    const remainingMonths = ageMonths % 12;

    if (remainingMonths === 0) {
      return `${years}y`;
    }

    return `${years}y ${remainingMonths}mo`;
  };

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
      {/* <div style={{ margin: '0 5px', color: 'var(--text-primary)' }}>
        Expected:{' '}
        <span style={{ fontWeight: 'bold', color: 'var(--text-success)' }}>
          {remainingTime}
        </span>{' '}
        |{' '}
        <span style={{ fontWeight: 'bold', color: 'var(--text-success)' }}>
          {expectedCompletionTime}
        </span>
      </div> */}
      <div style={{ margin: '0 5px', color: 'var(--text-primary)' }}>
        Card Age:{' '}
        <span style={{ fontWeight: 'bold', color: cardAgeColor }}>
          {formatCardAge(currentCardAgeMonths)}
        </span>
      </div>
    </div>
  );
}

renderWidget(Popup);
