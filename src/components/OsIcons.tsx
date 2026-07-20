import React from 'react';

/**
 * Home-screen icon system — two generations on one screen.
 *
 * MODERN tiles are the phone's native 2026 launcher: flat rounded squares,
 * soft single-hue gradients, white glyphs, a hairline rim. Pleasant,
 * unremarkable, market-designed.
 *
 * LEGACY tiles are LAOS survivors — apps whose assets were carried over in
 * an old-device migration and never re-rendered. They keep the machined
 * bezel, enamel face and pressed-badge glyph of a system that stopped
 * updating twelve years ago. The mismatch is the point: it should read as
 * "this icon is from somewhere else", not as a theme.
 */

const GLYPH = 'rgba(245, 248, 255, 0.94)';
const CUT = 'rgba(9, 13, 21, 0.82)';

/* ------------------------------------------------------------------ */
/* Modern tile: the phone's own design language                        */
/* ------------------------------------------------------------------ */

interface ModernTileProps {
  id: string;
  from: string;
  to: string;
  children: React.ReactNode;
}

const ModernTile: React.FC<ModernTileProps> = ({ id, from, to, children }) => (
  <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={from} />
        <stop offset="1" stopColor={to} />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="46" height="46" rx="13" fill={`url(#${id}-fill)`} />
    <rect
      x="1.5" y="1.5" width="45" height="45" rx="12.6"
      fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1"
    />
    {children}
  </svg>
);

/* ------------------------------------------------------------------ */
/* Legacy tile: LAOS enamel-and-metal, preserved unchanged             */
/* ------------------------------------------------------------------ */

interface LegacyTileProps {
  id: string;
  top: string;
  bottom: string;
  children: React.ReactNode;
}

const LegacyTile: React.FC<LegacyTileProps> = ({ id, top, bottom, children }) => (
  <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
    <defs>
      {/* Machined metal bezel: bright milled edge on top, dark below */}
      <linearGradient id={`${id}-frame`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7d879e" />
        <stop offset="0.16" stopColor="#454e63" />
        <stop offset="0.8" stopColor="#1a202e" />
        <stop offset="1" stopColor="#3a4356" />
      </linearGradient>
      {/* Enamel face */}
      <linearGradient id={`${id}-base`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
      {/* Depth: face darkens toward the bottom of the recess */}
      <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.55" stopColor="rgba(0,0,0,0)" />
        <stop offset="1" stopColor="rgba(0,0,0,0.4)" />
      </linearGradient>
      <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="rgba(255,255,255,0.3)" />
        <stop offset="1" stopColor="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>

    {/* Silhouette outline — note the older, tighter corner radius */}
    <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="10.5" fill="#05070c" />
    {/* Metal bezel */}
    <rect x="1.7" y="1.7" width="44.6" height="44.6" rx="9.6" fill={`url(#${id}-frame)`} />
    {/* Milled catch-light along the bezel top */}
    <rect x="4" y="2.4" width="40" height="1.5" rx="0.75" fill="rgba(255,255,255,0.3)" />
    {/* Recess seam between bezel and enamel */}
    <rect x="4.7" y="4.7" width="38.6" height="38.6" rx="7" fill="#04060a" />
    {/* Enamel face + depth + glass sheen */}
    <rect x="5.6" y="5.6" width="36.8" height="36.8" rx="6.2" fill={`url(#${id}-base)`} />
    <rect x="5.6" y="5.6" width="36.8" height="36.8" rx="6.2" fill={`url(#${id}-floor)`} />
    <rect x="6.6" y="6.4" width="34.8" height="12.5" rx="6" fill={`url(#${id}-sheen)`} />
    {/* Glyphs are authored on the full 48 grid; enlarge slightly so they
        dominate the recessed enamel face like pressed hardware badges. */}
    <g transform="translate(24 24.5) scale(1.12) translate(-24 -24.5)">{children}</g>
  </svg>
);

/* ------------------------------------------------------------------ */
/* Story apps                                                          */
/* ------------------------------------------------------------------ */

/** Flappy Something / Skyline 256 — the migrated game. Always legacy:
 *  its icon asset survived the transfer and was never regenerated. */
export const IconFlappy: React.FC = () => (
  <LegacyTile id="os-ic-flappy" top="#e2b44a" bottom="#7c4a0c">
    <path d="M16.5 28.5 Q12.5 26.5 14 23 Q18.5 23.6 20 26.6 Z" fill="#f8bbd0" stroke="#3d1020" strokeWidth="1" />
    <circle cx="23.5" cy="27" r="8.2" fill="#ee6395" stroke="#3d1020" strokeWidth="1.2" />
    <path d="M30.5 26.5 L36.2 28.4 L30.2 30.8 Z" fill="#ffd54f" stroke="#3d1020" strokeWidth="1" />
    <circle cx="26.3" cy="24.4" r="2.7" fill="#ffffff" />
    <circle cx="27.1" cy="24.8" r="1.1" fill="#161616" />
  </LegacyTile>
);

/** ViewTube — modern play badge. */
export const IconViewTube: React.FC = () => (
  <ModernTile id="os-ic-viewtube" from="#e0493a" to="#a32218">
    <rect x="10" y="15" width="28" height="18.5" rx="5.5" fill={GLYPH} />
    <path d="M21.4 20 L28.4 24.2 L21.4 28.4 Z" fill="#a32218" />
  </ModernTile>
);

/** AmazeMart — modern shopping bag. */
export const IconAmazeMart: React.FC = () => (
  <ModernTile id="os-ic-amazemart" from="#efa63a" to="#b96712">
    <path d="M18.5 20 Q18.5 14 24 14 Q29.5 14 29.5 20" fill="none" stroke={GLYPH} strokeWidth="2.4" strokeLinecap="round" />
    <path d="M13.5 19.5 H34.5 Q36 19.5 35.8 21 L34 33.8 Q33.8 35.4 32.1 35.4 H15.9 Q14.2 35.4 14 33.8 L12.2 21 Q12 19.5 13.5 19.5 Z" fill={GLYPH} />
    <circle cx="19.6" cy="24.4" r="1.5" fill="#b96712" />
    <circle cx="28.4" cy="24.4" r="1.5" fill="#b96712" />
  </ModernTile>
);

/** Wayback — modern clock wound backwards. */
export const IconWayback: React.FC = () => (
  <ModernTile id="os-ic-wayback" from="#31a5bd" to="#116075">
    <circle cx="24.5" cy="26" r="9.2" fill="none" stroke={GLYPH} strokeWidth="2.3" />
    <path d="M24.5 20.5 V26 L28.8 28.6" fill="none" stroke={GLYPH} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.6 20.5 A11.6 11.6 0 0 1 24.5 14.5" fill="none" stroke={GLYPH} strokeWidth="2" strokeLinecap="round" />
    <path d="M17.2 15.4 L15.3 21 L20.8 21.6" fill="none" stroke={GLYPH} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </ModernTile>
);

/** FaceSpace — modern twin profiles. */
export const IconFaceSpace: React.FC = () => (
  <ModernTile id="os-ic-facespace" from="#4a86d8" to="#1c3f7d">
    <circle cx="29.5" cy="19.5" r="3.9" fill={GLYPH} opacity="0.72" />
    <path d="M24.5 33.5 Q24.5 25.8 30.5 25.8 Q36.5 25.8 36.5 32.4 Q36.5 34 35 34 H26 Z" fill={GLYPH} opacity="0.72" />
    <circle cx="19" cy="20.5" r="4.8" fill={GLYPH} />
    <path d="M10.8 33.6 Q10.8 27 19 27 Q27.2 27 27.2 33.6 Q27.2 35.2 25.6 35.2 H12.4 Q10.8 35.2 10.8 33.6 Z" fill={GLYPH} />
  </ModernTile>
);

/** Messages — modern speech bubble. The Silver Kite mark inside is faint:
 *  migrated conversation data still lives underneath the new client. */
export const IconMessages: React.FC = () => (
  <ModernTile id="os-ic-messages" from="#43b768" to="#15703a">
    <path d="M13 14.5 H35 Q37.5 14.5 37.5 17 V28.5 Q37.5 31 35 31 H22.5 L16 36.4 Q14.5 37.6 14.5 35.6 V31 H13 Q10.5 31 10.5 28.5 V17 Q10.5 14.5 13 14.5 Z" fill={GLYPH} />
    <path d="M24 17.8 L28.2 22.6 L24 27.4 L19.8 22.6 Z" fill="#15703a" opacity="0.4" />
  </ModernTile>
);

/** Schematics — the extracted Lumen Arc folder. Modern placeholder until the
 *  legacy package arrives; pass `legacy` once the residue has spread. */
export const IconSchematics: React.FC<{ legacy?: boolean }> = ({ legacy = false }) =>
  legacy ? (
    <LegacyTile id="os-ic-schematics" top="#96773f" bottom="#443016">
      <path d="M11 18.5 Q11 16.5 13 16.5 H19.8 L22.4 19.5 H35 Q37 19.5 37 21.5 V33 Q37 35 35 35 H13 Q11 35 11 33 Z" fill={GLYPH} />
      <line x1="15.5" y1="24" x2="32.5" y2="24" stroke={CUT} strokeWidth="1.2" />
      <line x1="15.5" y1="27.5" x2="32.5" y2="27.5" stroke={CUT} strokeWidth="1.2" />
      <line x1="15.5" y1="31" x2="25" y2="31" stroke={CUT} strokeWidth="1.2" />
      <circle cx="30.2" cy="30.2" r="2.5" fill="none" stroke={CUT} strokeWidth="1.2" />
    </LegacyTile>
  ) : (
    <ModernTile id="os-ic-schematics-m" from="#8a7a55" to="#4c3d22">
      <path d="M11 18.5 Q11 16.5 13 16.5 H19.8 L22.4 19.5 H35 Q37 19.5 37 21.5 V33 Q37 35 35 35 H13 Q11 35 11 33 Z" fill={GLYPH} />
      <line x1="15.5" y1="24.5" x2="32.5" y2="24.5" stroke="#4c3d22" strokeWidth="1.4" opacity="0.5" />
      <line x1="15.5" y1="28.5" x2="27" y2="28.5" stroke="#4c3d22" strokeWidth="1.4" opacity="0.5" />
    </ModernTile>
  );

/** Concept — the Silver Kite, kept quiet and neutral. */
export const IconConcept: React.FC = () => (
  <ModernTile id="os-ic-concept" from="#5f6a85" to="#272e45">
    <path d="M24 11.5 L32.8 22.5 L24 33.5 L15.2 22.5 Z" fill={GLYPH} />
    <path d="M24 11.5 V33.5 M15.2 22.5 H32.8" stroke="#272e45" strokeWidth="1.3" opacity="0.55" />
    <path d="M24 33.5 Q21.8 35.8 24.2 36.9 Q26.8 38 25.8 35.4" fill="none" stroke={GLYPH} strokeWidth="1.6" strokeLinecap="round" />
  </ModernTile>
);

/* ------------------------------------------------------------------ */
/* Ambient utility apps (decorative, sell the OS as a real device)     */
/* ------------------------------------------------------------------ */

/** VoiceLog — modern waveform. */
export const IconVoiceLog: React.FC = () => (
  <ModernTile id="os-ic-voicelog" from="#8a63b8" to="#3f2766">
    <g stroke={GLYPH} strokeWidth="2.4" strokeLinecap="round">
      <line x1="14" y1="21" x2="14" y2="27" />
      <line x1="19" y1="17" x2="19" y2="31" />
      <line x1="24" y1="13.5" x2="24" y2="34.5" />
      <line x1="29" y1="18" x2="29" y2="30" />
      <line x1="34" y1="22" x2="34" y2="26" />
    </g>
  </ModernTile>
);

/** FileBox — modern archive drawer. */
export const IconFileBox: React.FC = () => (
  <ModernTile id="os-ic-filebox" from="#96774e" to="#46311b">
    <rect x="12" y="14.5" width="24" height="9.2" rx="2.5" fill={GLYPH} />
    <rect x="12" y="26" width="24" height="9.2" rx="2.5" fill={GLYPH} />
    <rect x="20.5" y="17.8" width="7" height="2.4" rx="1.2" fill="#46311b" opacity="0.55" />
    <rect x="20.5" y="29.3" width="7" height="2.4" rx="1.2" fill="#46311b" opacity="0.55" />
  </ModernTile>
);

/** Gallery — modern photo frame. */
export const IconGallery: React.FC = () => (
  <ModernTile id="os-ic-gallery" from="#4f8cb2" to="#1d3f55">
    <rect x="11" y="14.5" width="26" height="19.5" rx="4" fill={GLYPH} />
    <path d="M13.5 30 L20.5 22.5 L25 27.2 L28 24.2 L34.5 30.5 Q34.5 32 33 32 H15 Q13.5 32 13.5 30.5 Z" fill="#1d3f55" opacity="0.55" />
    <circle cx="29.4" cy="20.6" r="2" fill="#1d3f55" opacity="0.55" />
  </ModernTile>
);

/** Terminal — modern prompt. */
export const IconTerminal: React.FC = () => (
  <ModernTile id="os-ic-terminal" from="#3d454f" to="#15191f">
    <path d="M15 19 L21 24.2 L15 29.4" fill="none" stroke={GLYPH} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="24.5" y1="30" x2="33" y2="30" stroke={GLYPH} strokeWidth="2.4" strokeLinecap="round" />
  </ModernTile>
);

/** Controls — modern sliders. */
export const IconControls: React.FC = () => (
  <ModernTile id="os-ic-controls" from="#6b7a9e" to="#2b3450">
    <g stroke={GLYPH} strokeWidth="2.2" strokeLinecap="round">
      <line x1="14" y1="18" x2="34" y2="18" />
      <line x1="14" y1="24.5" x2="34" y2="24.5" />
      <line x1="14" y1="31" x2="34" y2="31" />
    </g>
    <circle cx="20" cy="18" r="2.9" fill={GLYPH} stroke="#2b3450" strokeWidth="1" />
    <circle cx="29" cy="24.5" r="2.9" fill={GLYPH} stroke="#2b3450" strokeWidth="1" />
    <circle cx="17" cy="31" r="2.9" fill={GLYPH} stroke="#2b3450" strokeWidth="1" />
  </ModernTile>
);
