/**
 * src/main.js
 * Core state orchestrator and transition controller for TrackMe Tarot
 */

import { getBrowserFingerprint } from './fingerprint.js';
import { calculateExposureScore } from './score.js';
import { generateFortune } from './fortune.js';
import { renderTarotCard, getShareableText } from './card.js';

// DOM References
const screenLanding = document.getElementById('screen-landing');
const screenScanning = document.getElementById('screen-scanning');
const screenResult = document.getElementById('screen-result');

const btnStart = document.getElementById('btn-start');
const btnRescan = document.getElementById('btn-rescan');
const btnCopy = document.getElementById('btn-copy');
const copyFeedback = document.getElementById('copy-feedback');

const terminalBody = document.getElementById('terminal-body');
const scanStepLabel = document.getElementById('scan-step-label');
const scanStepPercent = document.getElementById('scan-step-percent');
const scanProgressBar = document.getElementById('scan-progress-bar');
const cardContainer = document.getElementById('tarot-card-container');

// State Cache
let currentReading = null;

/**
 * Screen switcher
 */
function switchScreen(activeScreen) {
  [screenLanding, screenScanning, screenResult].forEach((scr) => {
    if (scr === activeScreen) {
      scr.classList.remove('hidden');
      scr.classList.add('active');
    } else {
      scr.classList.remove('active');
      scr.classList.add('hidden');
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Appends a terminal log line with cyber styling
 */
function appendTerminalLine(text, type = 'normal') {
  if (!terminalBody) return;
  const lineEl = document.createElement('div');
  lineEl.className = 'term-line';

  const promptSpan = document.createElement('span');
  promptSpan.className = 'term-prompt';
  promptSpan.textContent = '>';

  const textSpan = document.createElement('span');
  textSpan.className = `term-text ${type}`;
  textSpan.textContent = ` ${text}`;

  lineEl.appendChild(promptSpan);
  lineEl.appendChild(textSpan);
  terminalBody.appendChild(lineEl);

  // Auto-scroll terminal
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

/**
 * Executes the 4-second terminal scanning ritual
 */
async function startScanningSequence() {
  switchScreen(screenScanning);
  terminalBody.innerHTML = '';
  scanProgressBar.style.width = '0%';
  scanStepPercent.textContent = '0%';
  scanStepLabel.textContent = 'INITIALIZING SENSORS...';

  // Gather actual browser telemetry and start fortune generation concurrently
  const fpPromise = getBrowserFingerprint();
  const fortunePromise = fpPromise.then((fp) => generateFortune(fp));

  // Sequence of realistic and eerie terminal events over ~4.0 seconds (4000ms)
  const sequence = [
    { delay: 300, pct: 15, label: 'PROBING RUNTIME', text: 'reading device & hardware concurrency...', type: 'normal' },
    { delay: 850, pct: 32, label: 'GEO_TEMPORAL LOCK', text: 'reading timezone, locale & system clocks...', type: 'mystic' },
    { delay: 1400, pct: 50, label: 'CANVAS INTERCEPT', text: 'reading WebGL GPU shaders & render pipeline...', type: 'normal' },
    { delay: 2000, pct: 68, label: 'VIEWPORT RECON', text: 'reading screen geometry, retina scale & color depth...', type: 'normal' },
    { delay: 2600, pct: 82, label: 'SUBSYSTEM PROBE', text: 'reading battery levels, touch points & font metrics...', type: 'mystic' },
    { delay: 3200, pct: 94, label: 'SYNTHESIZING MATRIX', text: 'calculating digital trackability score...', type: 'highlight' },
    { delay: 3800, pct: 100, label: 'ARCANA MATERIALIZED', text: 'translating signals into cyber-tarot fortune...', type: 'highlight' }
  ];

  for (const step of sequence) {
    await new Promise((res) => setTimeout(res, step.delay - (sequence[sequence.indexOf(step) - 1]?.delay || 0)));
    appendTerminalLine(step.text, step.type);
    scanProgressBar.style.width = `${step.pct}%`;
    scanStepPercent.textContent = `${step.pct}%`;
    scanStepLabel.textContent = step.label;
  }

  // Await fingerprint resolution & fortune
  const fingerprint = await fpPromise;
  const score = calculateExposureScore(fingerprint);
  const fortune = await fortunePromise;

  currentReading = { fingerprint, score, fortune };

  // Brief pause before transitioning to result for dramatic tension
  await new Promise((res) => setTimeout(res, 450));

  // Render Card and switch screen
  renderTarotCard(cardContainer, currentReading);
  switchScreen(screenResult);
}

/**
 * Wire event listeners
 */
function initApp() {
  btnStart?.addEventListener('click', () => {
    startScanningSequence();
  });

  btnRescan?.addEventListener('click', () => {
    switchScreen(screenLanding);
  });

  btnCopy?.addEventListener('click', async () => {
    if (!currentReading) return;
    const text = getShareableText(currentReading.fortune, currentReading.fingerprint, currentReading.score);
    try {
      await navigator.clipboard.writeText(text);
      copyFeedback.classList.remove('hidden');
      setTimeout(() => {
        copyFeedback.classList.add('hidden');
      }, 2500);
    } catch {
      alert('Prophecy copied to clipboard!');
    }
  });

  console.log('TrackMe Tarot initialized. Client-side telemetry ready.');
}

// Kick off when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
