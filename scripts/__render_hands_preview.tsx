/* Throwaway visual-preview script: SSR the meta-scene hands into SVG/PNG so
   their silhouettes can be inspected without a browser. Deleted after use. */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {
  LeftGripBack, LeftGripFront, RightHandBack, RightHandFront,
} from '../src/components/MetaInteractionScene';

const OUT = process.argv[2] ?? path.join(process.cwd(), 'scripts', '__hand_previews');
mkdirSync(OUT, { recursive: true });

/** Pull the inner markup (defs + shapes) out of a component's root <svg>. */
const inner = (node: React.ReactElement): { body: string; viewBox: string } => {
  const markup = renderToStaticMarkup(node);
  const svgMatch = markup.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/);
  if (!svgMatch) throw new Error('no svg found');
  return { viewBox: svgMatch[1], body: svgMatch[2] };
};

const standalone = (node: React.ReactElement, bg: string) => {
  const { viewBox, body } = inner(node);
  const [, , w, h] = viewBox.split(' ').map(Number);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w * 2}" height="${h * 2}"><rect x="-200" y="-200" width="${w + 400}" height="${h + 400}" fill="${bg}"/>${body}</svg>`;
};

const lgb = inner(<LeftGripBack />);
const lgf = inner(<LeftGripFront />);
const rhb = inner(<RightHandBack pressed={false} />);
const rhf = inner(<RightHandFront pressed={false} />);

/* Composite mock of the desk scene (1600x900), phone + hands at the same
   percentage placements the real containers use. */
const composite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <rect width="1600" height="900" fill="#2a2019"/>
  <rect x="0" y="530" width="1600" height="370" fill="#241810"/>

  <!-- back layers (behind phone) -->
  <svg x="-112" y="198" width="464" height="432" viewBox="0 0 340 360">${lgb.body}</svg>
  <g transform="translate(1712, 207) scale(-1 1)">
    <svg x="0" y="0" width="448" height="432" viewBox="0 0 340 360">${lgb.body}</svg>
  </g>
  <svg x="746" y="448" width="180" height="225" viewBox="0 0 230 300">${rhb.body}</svg>

  <!-- phone -->
  <rect x="150" y="96" width="1300" height="620" rx="46" fill="#101216" stroke="#3a4048" stroke-width="6"/>
  <rect x="172" y="118" width="1256" height="576" rx="30" fill="#141c28"/>

  <!-- front layers -->
  <svg x="-160" y="180" width="352" height="234" viewBox="0 0 280 210">${lgf.body}</svg>
  <g transform="translate(1760, 189) scale(-1 1)">
    <svg x="0" y="0" width="336" height="225" viewBox="0 0 280 210">${lgf.body}</svg>
  </g>
  <svg x="746" y="448" width="180" height="225" viewBox="0 0 230 300">${rhf.body}</svg>
  <circle cx="800" cy="450" r="5" fill="#41d0ff"/>
</svg>`;

const jobs: Array<[string, string]> = [
  ['left-grip-back', standalone(<LeftGripBack />, '#2a2019')],
  ['left-grip-front', standalone(<LeftGripFront />, '#141c28')],
  ['tap-hand-back', standalone(<RightHandBack pressed={false} />, '#2a2019')],
  ['tap-hand-front', standalone(<RightHandFront pressed={false} />, '#141c28')],
  ['composite-scene', composite],
];

(async () => {
  for (const [name, svg] of jobs) {
    const file = path.join(OUT, `${name}`);
    writeFileSync(`${file}.svg`, svg);
    await sharp(Buffer.from(svg)).png().toFile(`${file}.png`);
    console.log('wrote', `${file}.png`);
  }
})();
