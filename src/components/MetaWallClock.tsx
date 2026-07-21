import React from 'react';

export interface MetaClockHandAngles {
  hour: number;
  minute: number;
}

export function getMetaClockHandAngles(clock: string): MetaClockHandAngles {
  const match = /^(\d{2}):(\d{2})$/.exec(clock);
  if (!match) return { hour: 0, minute: 0 };

  const hours = Number(match[1]) % 12;
  const minutes = Number(match[2]);
  return {
    hour: hours * 30 + minutes * 0.5,
    minute: minutes * 6,
  };
}

/** Hands only: the supplied wall artwork already contains the clock face. */
export const MetaWallClock: React.FC<{ time: string }> = ({ time }) => {
  const angles = getMetaClockHandAngles(time);

  return (
    <svg
      className="pointer-events-none absolute left-[30.8%] top-[26.2%] z-[2] h-[10.2%] w-[9.6%] -translate-x-1/2 -translate-y-1/2"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      data-clock-time={time}
      data-hour-angle={angles.hour}
      data-minute-angle={angles.minute}
      data-meta-clock-source="chapter-phone-widget"
      id="meta-wall-clock-hands"
      aria-hidden="true"
    >
      <defs>
        <filter id="meta-clock-hand-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0.7" dy="1.1" stdDeviation="0.8" floodColor="#000" floodOpacity="0.72" />
        </filter>
      </defs>
      <g filter="url(#meta-clock-hand-shadow)" stroke="#28231f" strokeLinecap="round">
        <line x1="50" y1="54" x2="50" y2="24" strokeWidth="5.2" transform={`rotate(${angles.hour} 50 50)`} />
        <line x1="50" y1="55" x2="50" y2="10" strokeWidth="3.1" transform={`rotate(${angles.minute} 50 50)`} />
      </g>
      <circle cx="50" cy="50" r="4.2" fill="#302924" stroke="#b6a58e" strokeWidth="1.2" />
    </svg>
  );
};
