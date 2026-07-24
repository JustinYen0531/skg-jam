import React from 'react';
import type { MetaWallStage } from '../lib/chapterEnvironment';

type WeatherStage = Exclude<MetaWallStage, 0>;

interface WindowWeatherProfile {
  skyTop: string;
  skyBottom: string;
  cloudCount: number;
  cloudOpacity: number;
  cloudDuration: number;
  rainCount: number;
  rainSpeed: number;
  rainAngle: number;
  rainOpacity: number;
  branchSway: number;
  gustDuration: number;
  darkness: number;
}

/**
 * Five deterministic weather states shared by the same two-chapter cadence as
 * the wall art. Darkness, cloud cover, rain density, and wind all intensify;
 * the values are exported so regression tests can guard that progression.
 */
export const META_WINDOW_WEATHER: Readonly<Record<WeatherStage, WindowWeatherProfile>> = {
  1: {
    skyTop: '#101e32', skyBottom: '#07101d', cloudCount: 1, cloudOpacity: 0.24,
    cloudDuration: 36, rainCount: 0, rainSpeed: 0, rainAngle: 0, rainOpacity: 0,
    branchSway: 0, gustDuration: 0, darkness: 0.28,
  },
  2: {
    skyTop: '#0b1524', skyBottom: '#050b14', cloudCount: 2, cloudOpacity: 0.36,
    cloudDuration: 26, rainCount: 0, rainSpeed: 0, rainAngle: 0, rainOpacity: 0,
    branchSway: 1.2, gustDuration: 9, darkness: 0.42,
  },
  3: {
    skyTop: '#08101b', skyBottom: '#03080e', cloudCount: 3, cloudOpacity: 0.48,
    cloudDuration: 20, rainCount: 6, rainSpeed: 2.15, rainAngle: 3, rainOpacity: 0.42,
    branchSway: 2, gustDuration: 7.5, darkness: 0.58,
  },
  4: {
    skyTop: '#050b13', skyBottom: '#020509', cloudCount: 3, cloudOpacity: 0.58,
    cloudDuration: 14, rainCount: 24, rainSpeed: 1.05, rainAngle: 11, rainOpacity: 0.62,
    branchSway: 3.8, gustDuration: 6, darkness: 0.76,
  },
  5: {
    skyTop: '#02060c', skyBottom: '#010204', cloudCount: 4, cloudOpacity: 0.68,
    cloudDuration: 10, rainCount: 36, rainSpeed: 0.72, rainAngle: 18, rainOpacity: 0.76,
    branchSway: 6, gustDuration: 4.6, darkness: 0.9,
  },
};

const CLOUD_BANDS = [
  { top: 4, scale: 0.86, delay: 0 },
  { top: 25, scale: 1.06, delay: 0.36 },
  { top: 49, scale: 0.92, delay: 0.68 },
  { top: 66, scale: 0.76, delay: 0.2 },
] as const;

const RAIN_DROPS = Array.from({ length: 36 }, (_, index) => ({
  x: 3 + ((index * 37) % 94),
  delay: ((index * 41) % 100) / 100,
  length: 8 + ((index * 17) % 9),
  width: index % 7 === 0 ? 0.62 : 0.36,
}));

export const MetaWindowScene: React.FC<{
  stage: MetaWallStage;
  reducedMotion: boolean;
  context?: 'room' | 'widget';
}> = ({ stage, reducedMotion, context = 'room' }) => {
  if (stage === 0) return null;

  const profile = META_WINDOW_WEATHER[stage];
  const animate = !reducedMotion;
  const isWidget = context === 'widget';
  const sceneId = isWidget ? 'widget-weather-scene' : 'meta-window-scene';
  const clouds = CLOUD_BANDS.slice(0, profile.cloudCount);
  const drops = RAIN_DROPS.slice(0, profile.rainCount);

  return (
    <div
      className={isWidget
        ? 'pointer-events-none absolute inset-[-8%] z-0 overflow-hidden opacity-80'
        : 'pointer-events-none absolute left-[68%] top-[14%] z-[1] h-[34%] w-[25%] overflow-hidden'}
      style={isWidget ? {
        filter: 'blur(1.1px) saturate(0.82)',
        maskImage: 'radial-gradient(ellipse at center, black 38%, rgba(0,0,0,0.82) 68%, transparent 100%)',
        transform: 'scale(1.06)',
      } : undefined}
      data-window-stage={stage}
      data-window-context={context}
      data-window-darkness={profile.darkness}
      data-window-rain-count={profile.rainCount}
      data-window-rain-angle={profile.rainAngle}
      id={sceneId}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${profile.skyTop}, ${profile.skyBottom})` }}
        id={`${sceneId}-sky`}
      />

      <svg className="absolute inset-x-0 bottom-0 h-[29%] w-full opacity-55" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path d="M0 30V18H13V12H21V19H34V9H45V18H57V14H68V21H81V11H91V18H100V30Z" fill="rgba(1,4,8,0.78)" />
      </svg>

      {clouds.map((cloud, index) => (
        <svg
          key={index}
          className="absolute -left-[58%] w-[58%] overflow-visible"
          viewBox="0 0 120 50"
          style={{
            top: `${cloud.top}%`,
            opacity: profile.cloudOpacity,
            filter: 'blur(1.5px)',
            '--mw-cloud-scale': cloud.scale,
            transform: reducedMotion ? `translateX(${30 + index * 48}%) scale(${cloud.scale})` : `scale(${cloud.scale})`,
            animation: animate ? `mw-cloud-drift ${profile.cloudDuration}s linear -${profile.cloudDuration * cloud.delay}s infinite` : undefined,
          } as React.CSSProperties}
          data-window-cloud={index + 1}
        >
          <path
            d="M8 40C15 28 25 25 36 29C41 14 57 9 70 19C82 13 100 20 102 33C111 34 116 38 118 44H6C5 43 6 41 8 40Z"
            fill={stage >= 4 ? '#718095' : '#8391a3'}
            stroke="rgba(207,220,235,0.08)"
            strokeWidth="0.8"
          />
        </svg>
      ))}

      {profile.rainCount > 0 && (
        <svg
          className="absolute inset-[-12%] h-[124%] w-[124%] overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ transform: `rotate(${profile.rainAngle}deg) scale(1.08)` }}
          id={`${sceneId}-rain`}
        >
          {drops.map((drop, index) => (
            <g
              key={index}
              style={{
                animation: animate ? `mw-rain-fall ${profile.rainSpeed}s linear -${profile.rainSpeed * drop.delay}s infinite` : undefined,
                transform: reducedMotion ? `translateY(${(index * 23) % 92}px)` : undefined,
                transformBox: 'view-box',
              }}
            >
              <line
                x1={drop.x}
                x2={drop.x}
                y1={-18 - (index % 5) * 17}
                y2={-18 - (index % 5) * 17 + drop.length}
                stroke={`rgba(184,205,228,${profile.rainOpacity})`}
                strokeWidth={drop.width}
                strokeLinecap="round"
              />
            </g>
          ))}
        </svg>
      )}

      {stage >= 3 && (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" id={`${sceneId}-water-traces`}>
          <path className={animate ? 'mw-water-trace' : ''} d="M28 -8C27 15 30 31 28 49C26 67 30 83 29 108" fill="none" stroke="rgba(203,219,235,0.2)" strokeWidth="0.7" />
          <path className={animate ? 'mw-water-trace mw-water-trace-delayed' : ''} d="M67 -5C64 17 69 38 66 58C64 75 67 89 66 108" fill="none" stroke="rgba(203,219,235,0.15)" strokeWidth="0.55" />
        </svg>
      )}

      {stage >= 2 && (
        <svg
          className="absolute -left-[4%] -top-[3%] h-[62%] w-[57%] overflow-visible"
          viewBox="0 0 100 100"
          style={{
            '--mw-branch-sway': `${profile.branchSway}deg`,
            '--mw-branch-recoil': `${profile.branchSway * -0.42}deg`,
            '--mw-branch-settle': `${profile.branchSway * 0.28}deg`,
            animation: animate ? `mw-branch-gust ${profile.gustDuration}s ease-in-out infinite` : undefined,
            transformOrigin: '0% 0%',
          } as React.CSSProperties}
          id={`${sceneId}-branch`}
        >
          <path
            d="M-8 6C17 13 35 13 53 28C62 35 70 35 84 48M31 16C36 9 43 7 50 6M53 28C61 22 69 22 78 25M64 36C70 30 78 31 84 33"
            fill="none"
            stroke={`rgba(2,4,8,${stage >= 4 ? 0.72 : 0.48})`}
            strokeWidth={stage >= 4 ? 3.4 : 2.6}
            strokeLinecap="round"
          />
        </svg>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.045),transparent_25%,transparent_76%,rgba(255,255,255,0.025))]" />
      <div className="absolute inset-0 shadow-[inset_0_0_9px_rgba(0,0,0,0.45)]" />

      <style>{`
        @keyframes mw-cloud-drift {
          from { transform: translateX(0) scale(var(--mw-cloud-scale, 1)); }
          to { transform: translateX(320%) scale(var(--mw-cloud-scale, 1)); }
        }
        @keyframes mw-rain-fall {
          from { transform: translateY(-18%); opacity: 0; }
          8% { opacity: 1; }
          90% { opacity: 1; }
          to { transform: translateY(138%); opacity: 0; }
        }
        @keyframes mw-water-slide {
          0%, 16% { opacity: 0; transform: translateY(-9%); }
          28% { opacity: 0.8; }
          78% { opacity: 0.55; }
          100% { opacity: 0; transform: translateY(14%); }
        }
        @keyframes mw-branch-gust {
          0%, 18%, 100% { transform: rotate(0deg); }
          43% { transform: rotate(var(--mw-branch-sway)); }
          58% { transform: rotate(var(--mw-branch-recoil)); }
          72% { transform: rotate(var(--mw-branch-settle)); }
        }
        .mw-water-trace { animation: mw-water-slide 7.5s ease-in-out infinite; }
        .mw-water-trace-delayed { animation-delay: -3.1s; animation-duration: 10.5s; }
      `}</style>
    </div>
  );
};
