import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target moment has passed. */
  elapsed: boolean;
}

function diff(target: Date, now: Date): Countdown {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: true };
  }

  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    elapsed: false,
  };
}

/**
 * Live countdown to `target`, re-computed every second.
 *
 * The remaining time is always derived from the current clock rather than by
 * decrementing a counter, so the display stays correct when the timer is
 * throttled in the background. Returns null when there is no target.
 */
export function useCountdown(target: Date | undefined): Countdown | null {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!target) return;

    const tick = () => setNow(new Date());

    const interval = setInterval(tick, 1000);

    // iOS suspends timers while backgrounded; re-sync on the way back so the
    // first visible frame is not a stale value from minutes ago.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [target]);

  if (!target) return null;
  return diff(target, now);
}
