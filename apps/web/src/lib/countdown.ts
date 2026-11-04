export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

/** Computes a non-negative countdown broken into Persian display-friendly units. */
export function getCountdown(target: string | number | Date, now = Date.now()): CountdownParts {
  const targetTime = target instanceof Date ? target.getTime() : typeof target === 'number' ? target : Date.parse(target);
  const remaining = Math.max(0, targetTime - now);
  const secondsTotal = Math.floor(remaining / 1000);
  return {
    days: Math.floor(secondsTotal / 86_400),
    hours: Math.floor((secondsTotal % 86_400) / 3600),
    minutes: Math.floor((secondsTotal % 3600) / 60),
    seconds: secondsTotal % 60,
    expired: remaining <= 0,
  };
}
