import {loadFont} from '@remotion/fonts';
import {staticFile, delayRender, continueRender} from 'remotion';

/* ───────────── Colour system ─────────────
   Primary: white + blue. Pale yellow only for research notes/highlights.
   Red only for warnings, restrictions and policy cuts.                   */
export const C = {
  white: '#F7F8FA',
  ink: '#171C24',
  midnight: '#142B49',
  cobalt: '#356CF6',
  grey: '#ADB6C2',
  note: '#F5E8AC',
  coral: '#DE8176',
  silver: '#DCE2EA',
  red: '#C83D49',
  inkSoft: '#2A313D',
  paper: '#FBFBF8',
};

/* ───────────── Typography system ─────────────
   DISPLAY  Inter Tight      – chapter heads, big numbers, statements
   SERIF    Instrument Serif – editorial headlines, quotations, history
   BODY     Source Serif 4   – longer quoted document text
   MONO     IBM Plex Mono    – dates, IDs, policy figures, annotations     */
export const F = {
  display: '"Inter Tight", "Helvetica Neue", Helvetica, Arial, sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
  body: '"Source Serif 4", Georgia, serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
};

let loaded = false;
export const ensureFonts = () => {
  if (loaded) return;
  loaded = true;
  const h = delayRender('fonts');
  const list: Array<[string, string, string, string]> = [
    ['Inter Tight', 'inter-tight-latin-400-normal.woff2', '400', 'normal'],
    ['Inter Tight', 'inter-tight-latin-500-normal.woff2', '500', 'normal'],
    ['Inter Tight', 'inter-tight-latin-600-normal.woff2', '600', 'normal'],
    ['Inter Tight', 'inter-tight-latin-700-normal.woff2', '700', 'normal'],
    ['Inter Tight', 'inter-tight-latin-800-normal.woff2', '800', 'normal'],
    ['Inter Tight', 'inter-tight-latin-900-normal.woff2', '900', 'normal'],
    ['Instrument Serif', 'instrument-serif-latin-400-normal.woff2', '400', 'normal'],
    ['Instrument Serif', 'instrument-serif-latin-400-italic.woff2', '400', 'italic'],
    ['IBM Plex Mono', 'ibm-plex-mono-latin-400-normal.woff2', '400', 'normal'],
    ['IBM Plex Mono', 'ibm-plex-mono-latin-500-normal.woff2', '500', 'normal'],
    ['IBM Plex Mono', 'ibm-plex-mono-latin-600-normal.woff2', '600', 'normal'],
    ['Source Serif 4', 'source-serif-4-latin-400-normal.woff2', '400', 'normal'],
    ['Source Serif 4', 'source-serif-4-latin-400-italic.woff2', '400', 'italic'],
    ['Source Serif 4', 'source-serif-4-latin-600-normal.woff2', '600', 'normal'],
    ['Source Serif 4', 'source-serif-4-latin-600-italic.woff2', '600', 'italic'],
  ];
  Promise.all(
    list.map(([family, file, weight, style]) =>
      loadFont({family, url: staticFile(`fonts/${file}`), weight, style}),
    ),
  ).then(() => continueRender(h));
};

export const W = 1920;
export const H = 1080;
export const FPS = 30;
