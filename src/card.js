/**
 * src/card.js
 * 
 * High-definition 1080x1350 Tarot Card generator using HTML5 Canvas.
 * Renders the result as a cyber-mystic tarot card with archetype title,
 * vibe emoji, fortune, exposure score, and "trackmetarot" watermark.
 * 
 * Supports instant image downloads and multi-platform sharing (WhatsApp, LinkedIn, Web Share API).
 */

import { generateAllStorySlides, downloadStorySlides, shareStorySlides } from './storySlides.js';
export { generateAllStorySlides, downloadStorySlides, shareStorySlides };

/**
 * Wraps text onto a canvas context across multiple lines.
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight, isCentered = false) {
  const words = (text || '').split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      if (isCentered) {
        ctx.fillText(line.trim(), x, currentY);
      } else {
        ctx.fillText(line.trim(), x, currentY);
      }
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

/**
 * Draws rounded rectangle on 2D context
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generates the full 1080x1350 Tarot Card Canvas
 */
export function generateTarotCardCanvas({ fortune, fingerprint, score }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const cards = Array.isArray(fortune.cards) && fortune.cards.length === 3 ? fortune.cards : [
    {
      title: 'What the internet already knows',
      archetype: fortune.archetype || 'The Digital Phantom',
      reading: fortune.fortune || 'Stable telemetry vectors reveal your exact operating system and screen geometry.',
      vibe_emoji: fortune.vibe_emoji || '🔮'
    },
    {
      title: 'How exposed you are right now',
      archetype: 'The Open Gateway',
      reading: `Exposure Score: ${score?.score ?? 50}/100. Ambient signals broadcast your silicon silhouette.`,
      vibe_emoji: '⚡'
    },
    {
      title: 'What happens if you ignore this',
      archetype: 'The Algorithmic Loop',
      reading: fortune.prediction || 'You will open an empty browser tab tomorrow and forget your intention.',
      vibe_emoji: '🌀'
    }
  ];

  // 1. Background: Deep obsidian with cyber-mystic ambient gradients
  ctx.fillStyle = '#06070b';
  ctx.fillRect(0, 0, 1080, 1350);

  // Radial purple occult glow top center
  const purpleGlow = ctx.createRadialGradient(540, 240, 50, 540, 240, 500);
  purpleGlow.addColorStop(0, 'rgba(176, 38, 255, 0.22)');
  purpleGlow.addColorStop(1, 'rgba(6, 7, 11, 0)');
  ctx.fillStyle = purpleGlow;
  ctx.fillRect(0, 0, 1080, 750);

  // Radial neon emerald glow bottom center
  const greenGlow = ctx.createRadialGradient(540, 1080, 40, 540, 1080, 480);
  greenGlow.addColorStop(0, 'rgba(0, 255, 157, 0.14)');
  greenGlow.addColorStop(1, 'rgba(6, 7, 11, 0)');
  ctx.fillStyle = greenGlow;
  ctx.fillRect(0, 700, 1080, 650);

  // Cyber subtle grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';
  ctx.lineWidth = 1;
  for (let x = 40; x < 1080; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, 1310);
    ctx.stroke();
  }
  for (let y = 40; y < 1350; y += 40) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(1040, y);
    ctx.stroke();
  }

  // 2. Ornate Double Glowing Border
  const pad = 36;
  const cornerR = 20;

  // Outer border
  ctx.strokeStyle = 'rgba(176, 38, 255, 0.55)';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(176, 38, 255, 0.4)';
  ctx.shadowBlur = 12;
  roundRect(ctx, pad, pad, 1080 - pad * 2, 1350 - pad * 2, cornerR);
  ctx.stroke();

  // Inner border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0, 255, 157, 0.35)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, pad + 12, pad + 12, 1080 - (pad + 12) * 2, 1350 - (pad + 12) * 2, cornerR - 6);
  ctx.stroke();

  // Corner Sigil Markers
  ctx.fillStyle = '#00ff9d';
  ctx.font = '20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('◈', pad + 26, pad + 30);
  ctx.fillText('◈', 1080 - (pad + 26), pad + 30);
  ctx.fillText('◈', pad + 26, 1350 - (pad + 16));
  ctx.fillText('◈', 1080 - (pad + 26), 1350 - (pad + 16));

  // 3. Card Header Bar
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a855f7';
  ctx.font = '700 16px monospace';
  ctx.letterSpacing = '2.5px';
  ctx.fillText('◈ TRACKMETAROT // THREE-CARD DIVINATION ◈', 540, 76);

  const badgeObj = fortune.badge || fingerprint.badge;
  const rareArr = Array.isArray(fortune.rareCards) ? fortune.rareCards : (Array.isArray(fingerprint.rareCards) ? fingerprint.rareCards : []);

  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 18px "Cinzel", serif, monospace';
  const badgeLabel = badgeObj ? ` • BADGE: ${badgeObj.name.toUpperCase()}` : '';
  const rareLabel = rareArr.length ? ` • [RARE: ${rareArr[0].title.toUpperCase()}]` : '';
  const themeHeader = `THEME: ${(fortune.theme || 'Destiny & device memory').toUpperCase()}${badgeLabel}${rareLabel}`;
  ctx.fillText(themeHeader, 540, 104);

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.moveTo(120, 118);
  ctx.lineTo(960, 118);
  ctx.stroke();

  // 4. Digital Exposure Score Box
  const scoreBoxY = 132;
  const scoreBoxW = 960;
  const scoreBoxH = 58;
  const scoreBoxX = (1080 - scoreBoxW) / 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  roundRect(ctx, scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(176, 38, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 19px monospace';
  ctx.fillText('DIGITAL EXPOSURE SCORE:', scoreBoxX + 22, scoreBoxY + 36);

  ctx.textAlign = 'right';
  ctx.fillStyle = score.score >= 75 ? '#ff4757' : (score.score >= 50 ? '#f59e0b' : '#00ff9d');
  ctx.font = '900 24px monospace';
  ctx.fillText(`${score.score}/100 [${(score.level || 'HIGH').toUpperCase()}]`, scoreBoxX + scoreBoxW - 22, scoreBoxY + 38);

  // 5. Telemetry Signals Pill Strip
  const telY = 202;
  const telemetryBadges = [
    `${fingerprint.cores || 4} CPU Cores`,
    `${fingerprint.resolution || '1920x1080'}`,
    `${(fingerprint.timezone || 'UTC').replace('_', ' ')}`,
    fingerprint.batteryStatus ? `${fingerprint.batteryStatus.level}% Battery` : 'Shielded Power'
  ];

  ctx.textAlign = 'center';
  const badgeWidth = 230;
  const badgeGap = 13;
  const totalBadgesWidth = (badgeWidth * 4) + (badgeGap * 3);
  const startBadgeX = (1080 - totalBadgesWidth) / 2;

  telemetryBadges.forEach((badge, idx) => {
    const bx = startBadgeX + idx * (badgeWidth + badgeGap);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    roundRect(ctx, bx, telY, badgeWidth, 34, 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 15px monospace';
    ctx.fillText(badge, bx + badgeWidth / 2, telY + 22);
  });

  // 6. The Three Spread Cards Columns (Cards I, II, III)
  const spreadY = 252;
  const spreadH = 630;
  const colW = 306;
  const colGap = 21;
  const startColX = (1080 - (colW * 3 + colGap * 2)) / 2;

  const cardMetaConfigs = [
    {
      numeral: 'CARD I • PAST',
      subrole: 'THE KNOWN',
      borderColor: 'rgba(0, 255, 157, 0.45)',
      glowColor: 'rgba(0, 255, 157, 0.25)',
      accentColor: '#00ff9d'
    },
    {
      numeral: 'CARD II • PRESENT',
      subrole: 'EXPOSURE',
      borderColor: 'rgba(176, 38, 255, 0.55)',
      glowColor: 'rgba(176, 38, 255, 0.3)',
      accentColor: '#c084fc'
    },
    {
      numeral: 'CARD III • FUTURE',
      subrole: 'PROPHECY',
      borderColor: 'rgba(245, 158, 11, 0.5)',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      accentColor: '#fbbf24'
    }
  ];

  cards.forEach((card, idx) => {
    const colX = startColX + idx * (colW + colGap);
    const cfg = cardMetaConfigs[idx] || cardMetaConfigs[0];

    // Card Box Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    roundRect(ctx, colX, spreadY, colW, spreadH, 12);
    ctx.fill();

    // Card border with subtle glow
    ctx.strokeStyle = cfg.borderColor;
    ctx.lineWidth = 1.5;
    roundRect(ctx, colX, spreadY, colW, spreadH, 12);
    ctx.stroke();

    // Top Card Label
    ctx.textAlign = 'center';
    ctx.fillStyle = cfg.accentColor;
    ctx.font = '700 13px monospace';
    ctx.letterSpacing = '1px';
    ctx.fillText(cfg.numeral, colX + colW / 2, spreadY + 28);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 11px monospace';
    ctx.letterSpacing = '1.5px';
    ctx.fillText(cfg.subrole, colX + colW / 2, spreadY + 45);

    // Card Emoji
    ctx.font = '48px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = 16;
    ctx.fillText(card.vibe_emoji || '🔮', colX + colW / 2, spreadY + 104);
    ctx.shadowBlur = 0;

    // Archetype Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 17px "Cinzel", serif, sans-serif';
    const archName = (card.archetype || 'The Voyager').toUpperCase();
    wrapText(ctx, archName, colX + colW / 2, spreadY + 140, colW - 24, 22, true);

    // Inner divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(colX + 24, spreadY + 185);
    ctx.lineTo(colX + colW - 24, spreadY + 185);
    ctx.stroke();

    // Role Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 11px monospace';
    const subTitle = (card.title || '').toUpperCase();
    wrapText(ctx, subTitle, colX + colW / 2, spreadY + 208, colW - 28, 16, true);

    // Reading Text
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    wrapText(ctx, card.reading || '', colX + 16, spreadY + 252, colW - 32, 22, false);
  });

  // 7. Tomorrow's Absurd Prophecy Box
  const propY = 898;
  const propW = 960;
  const propX = (1080 - propW) / 2;
  const propH = 150;

  ctx.fillStyle = 'rgba(176, 38, 255, 0.08)';
  roundRect(ctx, propX, propY, propW, propH, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(176, 38, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#c084fc';
  ctx.font = '700 20px monospace';
  ctx.fillText('🔮 TOMORROW\'S PROPHECY:', propX + 24, propY + 34);

  ctx.fillStyle = '#ffffff';
  ctx.font = '500 22px monospace';
  const predText = fortune.prediction || 'You will open a new browser tab to search something and forget what it was.';
  wrapText(ctx, predText, propX + 24, propY + 70, propW - 48, 30);

  // 8. Exposure Mitigation Protocols Box
  const fixY = 1062;
  const fixH = 150;
  const tips = (fortune.exposure_tips || fortune.tips || []).slice(0, 2);

  ctx.fillStyle = 'rgba(0, 255, 157, 0.04)';
  roundRect(ctx, propX, fixY, propW, fixH, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 255, 157, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 20px monospace';
  ctx.fillText('⚡ KEY EXPOSURE PROTOCOLS:', propX + 24, fixY + 34);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 20px monospace';
  let currentTipY = fixY + 68;
  tips.forEach((tip) => {
    currentTipY = wrapText(ctx, `• ${tip}`, propX + 24, currentTipY, propW - 48, 28);
  });

  // 9. Watermark & Branding at Bottom
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '700 20px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('◈ TRACKMETAROT ◈', 540, 1262);

  ctx.fillStyle = 'rgba(0, 255, 157, 0.85)';
  ctx.font = '600 16px monospace';
  ctx.letterSpacing = '1px';
  ctx.fillText('THE INTERNET ALREADY KNOWS YOU  //  TRACKMETAROT.VERCEL.APP', 540, 1294);

  return canvas;
}

/**
 * Triggers automatic download of the 1080x1350 canvas as PNG
 */
export function downloadTarotCardImage(canvas, filename = 'trackme-tarot.png') {
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates formatted shareable text optimized for WhatsApp, LinkedIn, and Twitter
 */
export function getShareableText(fortune, fingerprint, score) {
  const cards = fortune.cards || [];
  const archetypeTitle = cards[0]?.archetype || fortune.archetype || fortune.title || 'The Digital Phantom';
  const exposureVal = score?.score ?? score?.value ?? 70;
  const themeText = fortune.theme ? ` [${fortune.theme}]` : '';
  const shareUrl = window.location.origin;

  return `The internet revealed my 3-card tarot spread${themeText}: ${archetypeTitle} with ${exposureVal}% exposure. Find yours → ${shareUrl}`;
}

/**
 * Performs social sharing via Web Share API or falls back to clipboard copy
 */
export async function shareTarotReading({ fortune, fingerprint, score, canvas }) {
  const shareText = getShareableText(fortune, fingerprint, score);
  const shareUrl = window.location.origin;
  const title = `TrackMe Tarot — ${fortune.archetype || fortune.title || '3-Card Reading'}`;

  // Try Web Share API with image file if supported
  if (navigator.share) {
    try {
      if (canvas && navigator.canShare) {
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        if (blob) {
          const file = new File([blob], 'trackme-tarot.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title,
              text: shareText,
              files: [file]
            });
            return { shared: true, method: 'native-file' };
          }
        }
      }

      // Fallback native share without file
      await navigator.share({
        title,
        text: shareText,
        url: shareUrl
      });
      return { shared: true, method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') return { cancelled: true };
    }
  }

  // Fallback to clipboard
  await navigator.clipboard.writeText(shareText);
  return { shared: true, method: 'clipboard' };
}

/**
 * Renders the Tarot Card, Exposure Dashboard, and initializes the 1080x1350 canvas preview
 */
export function renderTarotCard(container, { fortune, fingerprint, score }) {
  if (!container) return null;

  // Generate 1080x1350 canvas
  const canvas = generateTarotCardCanvas({ fortune, fingerprint, score });
  const dataUrl = canvas.toDataURL('image/png');

  // Generate 1080x1920 vertical Story slides (3 slides)
  const storySlides = generateAllStorySlides({ fortune, fingerprint, score });
  const storyDataUrls = storySlides.map(s => s.toDataURL('image/png'));

  const isGemini = fortune.source === 'gemini';
  const badgeLabel = isGemini ? '✦ Written live by Gemini AI' : 'Offline mode';
  const oracleBadgeText = `<span class="${isGemini ? 'ai-badge' : 'offline-badge'}">${badgeLabel}</span>`;
  console.log('source:', fortune.source || (isGemini ? 'gemini' : 'fallback'));
  if (fortune.model) {
    console.log('model:', fortune.model);
  }

  // Identity Badge & Rare Cards
  const badge = fortune.badge || fingerprint.badge || {
    id: 'everyday-browser',
    name: 'The Everyday Browser',
    icon: '🧭',
    rule: 'You got this because your browser configuration follows standard everyday defaults.'
  };

  const rareCards = Array.isArray(fortune.rareCards) && fortune.rareCards.length
    ? fortune.rareCards
    : (Array.isArray(fingerprint.rareCards) ? fingerprint.rareCards : []);

  // Standardize 3 cards
  const cards = Array.isArray(fortune.cards) && fortune.cards.length === 3 ? fortune.cards : [
    {
      title: 'What the internet already knows',
      archetype: fortune.archetype || 'The Digital Phantom',
      reading: fortune.fortune || 'Stable telemetry vectors reveal your exact operating system and screen geometry.',
      vibe_emoji: fortune.vibe_emoji || '🔮'
    },
    {
      title: 'How exposed you are right now',
      archetype: 'The Open Gateway',
      reading: `Exposure Score: ${score?.score ?? 50}/100. Ambient signals broadcast your silicon silhouette.`,
      vibe_emoji: '⚡'
    },
    {
      title: 'What happens if you ignore this',
      archetype: 'The Algorithmic Loop',
      reading: fortune.prediction || 'You will open an empty browser tab tomorrow and forget your intention.',
      vibe_emoji: '🌀'
    }
  ];

  // Feature 1 & 2 variables
  const gpuInfo = fingerprint.gpu || { display: fingerprint.gpuRenderer || 'hidden by your browser', isMasked: false };
  const gpuDisplay = gpuInfo.display || 'hidden by your browser';
  const isGpuMasked = gpuDisplay === 'hidden by your browser' || Boolean(gpuInfo.isMasked);
  const fpHash = fingerprint.fingerprintHash || 'unavailable';

  if (fingerprint.registry) {
    console.log('[SIGNALS REGISTRY]', fingerprint.registry);
  }

  // Real signals for the "Signals we read" panel
  const refreshRateDisplay = fingerprint.refreshRateDisplay || `${fingerprint.refreshRate || 60} Hz`;
  const colorDepthDisplay = fingerprint.colorDepth || (window.screen?.colorDepth ? `${window.screen.colorDepth}-bit` : '24-bit');
  const hdrDisplay = fingerprint.hdr || (window.matchMedia?.('(dynamic-range: high)').matches ? 'Supported' : 'Unsupported');
  const gamutDisplay = fingerprint.colorGamut || 'sRGB';

  // Do Not Track and Global Privacy Control: show "off or not reported by this browser" when null or unspecified
  const isGpcOn = fingerprint.gpc === 'on' || fingerprint.gpc === true || fingerprint.gpc === '1' || fingerprint.globalPrivacyControl === 'on' || fingerprint.globalPrivacyControl === true;
  const gpcDisplay = isGpcOn ? 'on' : 'off or not reported by this browser';
  const gpcStatusClass = isGpcOn ? 'read' : 'unavailable';

  const isDntOn = fingerprint.dnt === 'on' || fingerprint.dnt === true || fingerprint.dnt === '1' || fingerprint.doNotTrack === 'on' || fingerprint.doNotTrack === true || fingerprint.doNotTrack === '1';
  const dntDisplay = isDntOn ? 'on' : 'off or not reported by this browser';
  const dntStatusClass = isDntOn ? 'read' : 'unavailable';

  const isLocalhost = Boolean(
    typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'
    )
  );
  // Show latency as "Server response time (includes cold start)" and mark it approximate
  const latencyTitle = 'Server response time (includes cold start)';
  const latencyTag = 'approximate';
  const latencyDisplay = fingerprint.latencyDisplay || (fingerprint.latency !== null && fingerprint.latency !== undefined ? `${fingerprint.latency} ms` : 'unavailable');

  // Output debug info when ?debug=1 is present
  const isDebug = new URLSearchParams(window.location.search).get('debug') === '1';
  let debugHtml = '';
  if (isDebug) {
    debugHtml = `
      <aside class="debug-panel" aria-label="Debug Telemetry Info">
        <div class="debug-header">
          <span>&gt; DEBUG CONSOLE (?debug=1)</span>
          <span>HTTP ${fortune.errorStatus || (isGemini ? 200 : 503)}</span>
        </div>
        <div class="debug-row">Mode: <strong style="color: ${isGemini ? 'var(--neon-green)' : '#f59e0b'};">${isGemini ? 'Live Gemini AI' : 'Offline Fallback'}</strong></div>
        <div class="debug-row">Source: <code>${fortune.source || 'fallback'}</code></div>
        ${fortune.model ? `<div class="debug-row">Model: <strong style="color: #38bdf8;">${fortune.model}</strong></div>` : ''}
        ${!isGemini && fortune.validationFailureReason ? `<div class="debug-row alert" style="color: #fbbf24;">Validation Failure: <code>${fortune.validationFailureReason}</code></div>` : ''}
        ${!isGemini && fortune.errorMessage ? `<div class="debug-row alert" style="color: #ff4757;">Offline Reason: <code>[${fortune.errorStatus || 503}] ${fortune.errorMessage}</code></div>` : ''}
        ${fortune.attempts?.length ? `<div class="debug-row attempts" style="font-size: 0.68rem; color: var(--text-muted);">Attempts Tried: ${fortune.attempts.map(a => `${a.model} (att ${a.attempt}: ${a.status || 'err'})`).join(', ')}</div>` : ''}
      </aside>
    `;
    console.log('[DEBUG 1 OUTPUT]', {
      source: fortune.source,
      model: fortune.model || null,
      errorStatus: fortune.errorStatus || null,
      validationFailureReason: fortune.validationFailureReason || null,
      errorMessage: fortune.errorMessage || null,
      attempts: fortune.attempts || null
    });
  }

  // 1. Top: Small Gemini/Offline Badge above the spread
  const originBadgeEl = document.getElementById('result-origin-badge');
  if (originBadgeEl) {
    originBadgeEl.innerHTML = oracleBadgeText;
  }

  // Rare Card Discovery Banner HTML (ONLY if rare card actually triggered)
  let rareCardsHtml = '';
  if (rareCards.length > 0) {
    rareCardsHtml = `
      <div class="rare-cards-discovery-banner" aria-label="Rare card discovered">
        <div class="rare-cards-banner-top">
          <span class="rare-callout-text">✨ You found a rare card!</span>
          <span class="rare-card-pill">rare card</span>
        </div>
        <div class="rare-cards-list">
          ${rareCards.map(rc => `
            <div class="rare-card-item">
              <span class="rare-card-icon">${rc.icon || '✨'}</span>
              <div class="rare-card-info">
                <div class="rare-card-title-row">
                  <strong class="rare-card-title">${rc.title}</strong>
                  <span class="rare-badge-tag">${rc.label || 'rare card'}</span>
                </div>
                <p class="rare-card-rule-desc">${rc.rule}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 1. Three-Card Tarot Spread HTML (large and readable, body text >= 15px)
  const spreadHtml = `
    <div class="tarot-3card-spread-wrapper" aria-label="Three card spread result">
      ${rareCardsHtml}
      <div class="spread-banner-bar">
        <div class="spread-banner-left">
          <span class="spread-theme-badge">THEME: ${(fortune.theme || 'Destiny & device memory').toUpperCase()}</span>
          <h3 class="spread-headline">THE THREE-CARD SPREAD</h3>
        </div>
        <div class="spread-banner-right">
          ${oracleBadgeText}
        </div>
      </div>

      <div class="tarot-cards-grid">
        <!-- Card 1: Past -->
        <article class="spread-card card-past" aria-label="Card 1: Past - ${cards[0].archetype}">
          <div class="card-timeline-header">
            <span class="card-timeline-num">I</span>
            <span class="card-timeline-tag">PAST • THE KNOWN</span>
          </div>
          <div class="card-avatar-wrap">
            <span class="card-avatar-emoji">${cards[0].vibe_emoji || '🔮'}</span>
          </div>
          <h4 class="card-archetype-title">${cards[0].archetype}</h4>
          <div class="card-role-subtitle">${cards[0].title}</div>
          <div class="card-reading-body">
            <p class="card-reading-text">${cards[0].reading}</p>
          </div>
        </article>

        <!-- Card 2: Present -->
        <article class="spread-card card-present" aria-label="Card 2: Present - ${cards[1].archetype}">
          <div class="card-timeline-header">
            <span class="card-timeline-num">II</span>
            <span class="card-timeline-tag">PRESENT • EXPOSURE</span>
          </div>
          <div class="card-avatar-wrap">
            <span class="card-avatar-emoji">${cards[1].vibe_emoji || '⚡'}</span>
          </div>
          <h4 class="card-archetype-title">${cards[1].archetype}</h4>
          <div class="card-role-subtitle">${cards[1].title}</div>
          <div class="card-score-pill">Exposure Score: <strong>${score.score}/100</strong></div>
          <div class="card-reading-body">
            <p class="card-reading-text">${cards[1].reading}</p>
          </div>
        </article>

        <!-- Card 3: Future -->
        <article class="spread-card card-future" aria-label="Card 3: Future - ${cards[2].archetype}">
          <div class="card-timeline-header">
            <span class="card-timeline-num">III</span>
            <span class="card-timeline-tag">FUTURE • PROPHECY</span>
          </div>
          <div class="card-avatar-wrap">
            <span class="card-avatar-emoji">${cards[2].vibe_emoji || '🌀'}</span>
          </div>
          <h4 class="card-archetype-title">${cards[2].archetype}</h4>
          <div class="card-role-subtitle">${cards[2].title}</div>
          <div class="card-reading-body">
            <p class="card-reading-text">${cards[2].reading}</p>
          </div>
        </article>
      </div>
    </div>
  `;

  const spreadContainer = document.getElementById('tarot-spread-container');
  if (spreadContainer) {
    spreadContainer.innerHTML = spreadHtml;
  }

  // 2. Directly under it, one row: the exposure gauge on left, identity badge on right
  const levelClass = (score.level || 'Medium').toLowerCase().replace(/\s+/g, '-');
  const gaugeColHtml = `
    <div class="exposure-gauge-card" aria-label="Exposure Score ${score.score}/100">
      <div class="gauge-card-header">
        <span class="gauge-card-tag">&gt; EXPOSURE INDEX</span>
        <span class="gauge-level-pill level-${levelClass}">${score.level}</span>
      </div>
      <div class="gauge-container">
        <div class="gauge-svg-wrapper">
          <svg class="gauge-svg" viewBox="0 0 120 120" width="140" height="140">
            <circle class="gauge-bg-circle" cx="60" cy="60" r="48" stroke-width="8" fill="none" />
            <circle
              id="gauge-circle-bar"
              class="gauge-bar-circle ${levelClass}"
              cx="60" cy="60" r="48"
              stroke-width="8"
              stroke-linecap="round"
              fill="none"
              stroke-dasharray="301.59"
              stroke-dashoffset="301.59"
            />
          </svg>
          <div class="gauge-center-content">
            <div class="gauge-score-wrap">
              <span id="gauge-score-number" class="gauge-number">0</span>
              <span class="gauge-max">/100</span>
            </div>
            <span class="gauge-level-text">${score.level}</span>
          </div>
        </div>
      </div>
      <div class="gauge-card-footnote">Calculated from passive browser telemetry</div>
    </div>
  `;

  const badgeColHtml = `
    <div class="identity-badge-card middle-badge-card" aria-label="Identity Badge: ${badge.name}">
      <div class="identity-badge-header">
        <span class="identity-badge-tag">&gt; IDENTITY BADGE</span>
        <span class="identity-badge-icon">${badge.icon}</span>
      </div>
      <h3 class="identity-badge-title">${badge.name}</h3>
      <div class="identity-badge-rule-quote">
        "${badge.rule}"
      </div>
      <div class="identity-badge-sub">
        Assigned from real passive signals. No percentage or ranking claims.
      </div>
    </div>
  `;

  const gaugeColEl = document.getElementById('middle-gauge-col');
  if (gaugeColEl) gaugeColEl.innerHTML = gaugeColHtml;

  const badgeColEl = document.getElementById('middle-badge-col');
  if (badgeColEl) badgeColEl.innerHTML = badgeColHtml;

  // 4. Tab Panels Content
  // Tab 1: Why this score
  const breakdownHtml = (score.breakdown || []).map((item) => `
    <div class="breakdown-item">
      <div class="breakdown-item-header">
        <span class="breakdown-label">${item.label}</span>
        <span class="breakdown-points">${item.points}</span>
      </div>
      <p class="breakdown-why">${item.why}</p>
    </div>
  `).join('');

  const tabWhyEl = document.getElementById('tab-panel-why');
  if (tabWhyEl) {
    tabWhyEl.innerHTML = `
      <div class="tab-panel-inner">
        <div class="tab-panel-header">
          <h4 class="tab-heading">WHY THIS SCORE</h4>
          <p class="tab-sub">Signals contributing to your ${score.score}/100 exposure index.</p>
        </div>
        <div class="breakdown-list">
          ${breakdownHtml}
        </div>
      </div>
    `;
  }

  // Tab 2: Fix it (three fix cards, ensuring Fix 02 replaces "close dormant tabs")
  const tipsRaw = fortune.exposure_tips || fortune.tips || [
    'Enable strict tracking prevention in your browser configuration.',
    'Use a browser or extension that blocks fingerprinting scripts.',
    'Keep your operating system updated to patch exposed hardware telemetry vectors.'
  ];
  const tipsArray = tipsRaw.slice(0, 3).map((tip, idx) => {
    if (idx === 1 || /dormant tabs/i.test(tip)) {
      return 'Use a browser or extension that blocks fingerprinting scripts.';
    }
    return tip;
  });

  const fixItCardsHtml = tipsArray.map((tip, idx) => `
    <div class="fix-it-card">
      <div class="fix-it-header">
        <span class="fix-it-badge">FIX 0${idx + 1}</span>
        <span class="fix-it-icon">🛡️</span>
      </div>
      <p class="fix-it-text">${tip}</p>
    </div>
  `).join('');

  const tabFixEl = document.getElementById('tab-panel-fix');
  if (tabFixEl) {
    tabFixEl.innerHTML = `
      <div class="tab-panel-inner">
        <div class="tab-panel-header">
          <h4 class="tab-heading">MITIGATION PROTOCOLS</h4>
          <p class="tab-sub">Actionable steps to minimize your passive browser footprint.</p>
        </div>
        <div class="fix-it-grid">
          ${fixItCardsHtml}
        </div>
        <div class="privacy-note-card" style="margin-top: 1.25rem;">
          <span class="privacy-icon">🔒</span>
          <p class="privacy-text">Nothing you saw here left your browser except a summary sent to write your fortune. We store nothing.</p>
        </div>
      </div>
    `;
  }

  // Tab 3: What we read (signals list + GPU card + fingerprint hash card)
  const tabSignalsEl = document.getElementById('tab-panel-signals');
  if (tabSignalsEl) {
    tabSignalsEl.innerHTML = `
      <div class="tab-panel-inner">
        <div class="tab-panel-header">
          <h4 class="tab-heading">SIGNALS WE READ</h4>
          <p class="tab-sub">Real environmental and configuration signals queried directly by scripts.</p>
        </div>
        <div class="signals-read-grid">
          <!-- Refresh rate -->
          <div class="signal-read-card" aria-label="Refresh rate">
            <div class="signal-read-top">
              <span class="signal-read-name">Refresh rate</span>
              <span class="signal-read-badge approximate">approximate</span>
            </div>
            <div class="signal-read-value">${refreshRateDisplay}</div>
            <div class="signal-read-source">Average requestAnimationFrame interval over 60 frames</div>
          </div>

          <!-- Colour & Display -->
          <div class="signal-read-card" aria-label="Colour and Display capabilities">
            <div class="signal-read-top">
              <span class="signal-read-name">Colour & Display</span>
              <span class="signal-read-badge read">read</span>
            </div>
            <div class="signal-read-value display-caps-value">
              <span class="color-depth-item">${colorDepthDisplay}</span>
              <span class="caps-sep">•</span>
              <span class="hdr-item">${hdrDisplay}</span>
              <span class="caps-sep">•</span>
              <span class="gamut-item">${gamutDisplay}</span>
            </div>
            <div class="signal-read-source">screen.colorDepth, matchMedia (dynamic-range: high), colour gamut</div>
          </div>

          <!-- Global Privacy Control -->
          <div class="signal-read-card" aria-label="Global Privacy Control">
            <div class="signal-read-top">
              <span class="signal-read-name">Global Privacy Control</span>
              <span class="signal-read-badge ${gpcStatusClass}">${isGpcOn ? 'on' : 'unavailable'}</span>
            </div>
            <div class="signal-read-value status-${gpcStatusClass}">${gpcDisplay}</div>
            <div class="signal-read-source">navigator.globalPrivacyControl</div>
          </div>

          <!-- Do Not Track -->
          <div class="signal-read-card" aria-label="Do Not Track">
            <div class="signal-read-top">
              <span class="signal-read-name">Do Not Track</span>
              <span class="signal-read-badge ${dntStatusClass}">${isDntOn ? 'on' : 'unavailable'}</span>
            </div>
            <div class="signal-read-value status-${dntStatusClass}">${dntDisplay}</div>
            <div class="signal-read-source">navigator.doNotTrack</div>
          </div>

          <!-- Latency -->
          <div class="signal-read-card" aria-label="${latencyTitle}">
            <div class="signal-read-top">
              <span class="signal-read-name">${latencyTitle}</span>
              <span class="signal-read-badge approximate">${latencyTag}</span>
            </div>
            <div class="signal-read-value" id="signal-val-latency">${latencyDisplay}</div>
            <div class="signal-read-source">5-sample median round-trip to /api/ping (approximate)</div>
          </div>

          <!-- Identity Badge Signal -->
          <div class="signal-read-card" aria-label="Identity Badge Signal">
            <div class="signal-read-top">
              <span class="signal-read-name">Identity Badge</span>
              <span class="signal-read-badge read">read</span>
            </div>
            <div class="signal-read-value">${badge.icon} ${badge.name}</div>
            <div class="signal-read-source">${badge.rule}</div>
          </div>

          ${rareCards.length > 0 ? `
            <!-- Rare Card -->
            <div class="signal-read-card" aria-label="Rare Archetype">
              <div class="signal-read-top">
                <span class="signal-read-name">Rare Card</span>
                <span class="signal-read-badge read">rare card</span>
              </div>
              <div class="signal-read-value">${rareCards.map(r => `${r.icon} ${r.title}`).join(', ')}</div>
              <div class="signal-read-source">${rareCards.map(r => r.rule).join('; ')}</div>
            </div>
          ` : ''}
        </div>

        <!-- GPU & Fingerprint Hash Cards -->
        <div class="deep-signals-cards-row">
          <!-- GPU Card -->
          <div class="telemetry-card gpu-card" aria-label="Your graphics card">
            <div class="telemetry-card-header">
              <span class="telemetry-card-badge">WEBGL TELEMETRY</span>
              <span class="telemetry-card-icon">🎮</span>
            </div>
            <h4 class="telemetry-card-title">Your graphics card</h4>
            <div class="telemetry-card-value ${isGpuMasked ? 'is-masked' : ''}">
              ${gpuDisplay}
            </div>
            <p class="telemetry-card-sub">
              ${isGpuMasked ? 'Unmasked vendor & renderer hidden by your browser privacy protections.' : (fingerprint.gpuVendor ? `Vendor: ${fingerprint.gpuVendor}` : 'Extracted via WEBGL_debug_renderer_info')}
            </p>
          </div>

          <!-- Fingerprint Hash Card -->
          <div class="telemetry-card fp-hash-card" aria-label="Identity Signature">
            <div class="telemetry-card-header">
              <span class="telemetry-card-badge">PERSISTENT HASH</span>
              <span class="telemetry-card-icon">🧬</span>
            </div>
            <h4 class="telemetry-card-title">Identity Signature</h4>
            <p class="fp-card-statement">
              Your fingerprint: <strong class="fp-hash-val">${fpHash}</strong>. Open this page in a private window. If the hash is the same, incognito didn't hide you.
            </p>
            <p class="telemetry-card-sub">
              Combined from Canvas 2D + OfflineAudioContext + WebGL. Nothing is sent to any server.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  // Tab 4: Try more (connection reveal & behaviour test)
  const tabMoreEl = document.getElementById('tab-panel-more');
  if (tabMoreEl) {
    tabMoreEl.innerHTML = `
      <div class="tab-panel-inner">
        <div class="tab-panel-header">
          <h4 class="tab-heading">INTERACTIVE DIAGNOSTICS</h4>
          <p class="tab-sub">Optional audits that measure how your active interaction leaks identifiable telemetry.</p>
        </div>

        <div class="try-more-container">
          <!-- Connection Revelation Card -->
          <div class="telemetry-card connection-card" aria-label="Connection Revelation Audit">
            <div class="telemetry-card-header">
              <span class="telemetry-card-badge">OPT-IN REVELATION [approximate]</span>
              <span class="telemetry-card-icon">🌐</span>
            </div>
            <h4 class="telemetry-card-title">Connection Geolocation</h4>
            <p class="telemetry-card-sub" style="margin-bottom: 0.75rem;">
              Query server edge routing headers to compare your connection country against your browser timezone.
            </p>
            <button id="btn-reveal-connection" class="cyber-btn tertiary connection-reveal-btn" type="button">
              <span class="btn-icon">👁️</span> Show what my connection reveals
            </button>
            <div id="connection-reveal-result" class="connection-reveal-result hidden" aria-live="polite"></div>
          </div>

          <!-- 5-Second Behaviour Measurement Test -->
          <div class="telemetry-card behaviour-card" aria-label="Behaviour Measurement Test">
            <div class="telemetry-card-header">
              <span class="telemetry-card-badge">BEHAVIOURAL BIOMETRICS</span>
              <span class="telemetry-card-icon">⚡</span>
            </div>
            <h4 class="telemetry-card-title">Behaviour test</h4>
            <p class="telemetry-card-sub" style="margin-bottom: 0.75rem;">
              Move your mouse (or drag on touch) and type in the box during the 5-second countdown to see how passive biometrics profile you.
            </p>

            <div id="behaviour-test-idle">
              <button id="btn-start-behaviour" class="cyber-btn tertiary behaviour-start-btn" type="button">
                <span class="btn-icon">⏱️</span> Start 5-second test
              </button>
            </div>

            <div id="behaviour-test-active" class="behaviour-test-active hidden">
              <div class="behaviour-timer-row">
                <span class="behaviour-timer-badge">COUNTDOWN</span>
                <span id="behaviour-countdown" class="behaviour-countdown">5.0s</span>
              </div>

              <div id="behaviour-track-zone" class="behaviour-track-zone" tabindex="0">
                <span id="track-zone-hint" class="track-zone-hint">Move mouse / drag pointer here</span>
              </div>

              <div id="behaviour-typing-area" class="behaviour-typing-area">
                <label for="behaviour-input" class="behaviour-input-label">Type in the box:</label>
                <input
                  type="text"
                  id="behaviour-input"
                  class="behaviour-input"
                  placeholder="Type anything here (e.g. quick brown fox)..."
                  autocomplete="off"
                  spellcheck="false"
                />
              </div>
              <div id="touch-skip-notice" class="touch-skip-notice hidden">
                📱 Touch device: touch movement measured (typing skipped)
              </div>
            </div>

            <div id="behaviour-test-results" class="behaviour-test-results hidden" aria-live="polite">
              <div class="behaviour-metrics-grid">
                <div class="behaviour-metric-item">
                  <span id="lbl-mouse-speed" class="metric-label">Mouse Speed</span>
                  <span id="metric-mouse-speed" class="metric-val">0 px/s</span>
                </div>
                <div class="behaviour-metric-item">
                  <span class="metric-label">Pauses (&gt;300ms)</span>
                  <span id="metric-pauses" class="metric-val">0</span>
                </div>
                <div class="behaviour-metric-item">
                  <span class="metric-label">Typing Speed</span>
                  <span id="metric-typing-speed" class="metric-val">0 chars/s</span>
                </div>
                <div class="behaviour-metric-item">
                  <span class="metric-label">Avg Keystroke Gap</span>
                  <span id="metric-keystroke-gap" class="metric-val">0 ms</span>
                </div>
              </div>

              <p class="behaviour-quote">
                "Websites can measure this without asking."
              </p>
              <div class="reveal-footnote">100% in-memory client-side • Text cleared • Nothing leaves the browser</div>
              <!-- Test again button only appears after test has completed -->
              <button id="btn-retry-behaviour" class="cyber-btn text-link retry-behaviour-btn" type="button">
                ↺ Test again
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Debug console injection
  const debugContainer = document.getElementById('debug-container');
  if (debugContainer) {
    debugContainer.innerHTML = debugHtml;
  }

  // Initialize animations and interactive listeners
  animateGauge(score.score);
  initTabs();
  initConnectionReveal();
  initBehaviourTest(fingerprint);
  initShareModal({ canvas, storySlides, fortune, score, fingerprint });

  return canvas;
}

/**
 * Initializes tab switching for the 4 result tabs
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-nav-btn');
  const tabPanels = document.querySelectorAll('.result-tab-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabKey = btn.getAttribute('data-tab');

      // Update button states
      tabButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Update panel visibility
      tabPanels.forEach((panel) => {
        if (panel.id === `tab-panel-${tabKey}`) {
          panel.classList.add('active');
          panel.hidden = false;
        } else {
          panel.classList.remove('active');
          panel.hidden = true;
        }
      });
    });
  });
}

/**
 * Initializes the Share Modal and its 4-slide carousel (previews >= 320px wide)
 */
function initShareModal({ canvas, storySlides, fortune, score, fingerprint }) {
  const modal = document.getElementById('share-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalImg = document.getElementById('modal-carousel-img');
  const modalTitle = document.getElementById('modal-slide-title');
  const modalCounter = document.getElementById('modal-slide-counter');
  const btnPrev = document.getElementById('btn-modal-prev');
  const btnNext = document.getElementById('btn-modal-next');
  const modalDots = document.querySelectorAll('.modal-dot-btn');
  const btnDownloadCurrent = document.getElementById('btn-modal-download-current');
  const btnDownloadAll = document.getElementById('btn-modal-download-all');
  const btnShareNative = document.getElementById('btn-modal-share-native');
  const feedbackEl = document.getElementById('modal-feedback');

  if (!modal || !modalImg) return;

  const cleanArchetype = (fortune.archetype || 'tarot').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const feedDataUrl = canvas.toDataURL('image/png');
  const storyDataUrls = storySlides.map((s) => s.toDataURL('image/png'));

  const slidesData = [
    {
      title: 'Feed Card (1080×1350 HD)',
      dataUrl: feedDataUrl,
      canvas: canvas,
      filename: `trackme-tarot-${cleanArchetype}.png`
    },
    {
      title: 'Story Slide 1 • Arcanum (1080×1920)',
      dataUrl: storyDataUrls[0],
      canvas: storySlides[0],
      filename: `trackme-story-${cleanArchetype}-slide-1.png`
    },
    {
      title: 'Story Slide 2 • Exposure & Badge (1080×1920)',
      dataUrl: storyDataUrls[1],
      canvas: storySlides[1],
      filename: `trackme-story-${cleanArchetype}-slide-2.png`
    },
    {
      title: 'Story Slide 3 • Prophecy (1080×1920)',
      dataUrl: storyDataUrls[2],
      canvas: storySlides[2],
      filename: `trackme-story-${cleanArchetype}-slide-3.png`
    }
  ];

  let currentSlideIndex = 0;

  function renderModalSlide(index) {
    currentSlideIndex = (index + slidesData.length) % slidesData.length;
    const current = slidesData[currentSlideIndex];

    modalImg.src = current.dataUrl;
    modalImg.alt = current.title;

    if (modalTitle) modalTitle.textContent = current.title;
    if (modalCounter) modalCounter.textContent = `${currentSlideIndex + 1} of ${slidesData.length}`;

    modalDots.forEach((dot, dIdx) => {
      dot.classList.toggle('active', dIdx === currentSlideIndex);
    });
  }

  // Initial preview render
  renderModalSlide(0);

  // Carousel navigation
  btnPrev?.addEventListener('click', () => renderModalSlide(currentSlideIndex - 1));
  btnNext?.addEventListener('click', () => renderModalSlide(currentSlideIndex + 1));

  modalDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = Number(dot.getAttribute('data-slide') || 0);
      renderModalSlide(idx);
    });
  });

  // Modal open function
  function openModal() {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderModalSlide(currentSlideIndex);
  }

  // Modal close function
  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Wire Share button to open modal
  const btnShareMain = document.getElementById('btn-share');
  btnShareMain?.addEventListener('click', openModal);

  // Wire close triggers
  btnCloseModal?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Modal download current image
  btnDownloadCurrent?.addEventListener('click', () => {
    const current = slidesData[currentSlideIndex];
    downloadTarotCardImage(current.canvas, current.filename);
    if (feedbackEl) {
      feedbackEl.textContent = `Downloaded ${current.title}!`;
      feedbackEl.classList.remove('hidden');
      setTimeout(() => feedbackEl.classList.add('hidden'), 2500);
    }
  });

  // Modal download all story slides
  btnDownloadAll?.addEventListener('click', () => {
    downloadStorySlides(storySlides, `trackme-story-${cleanArchetype}`);
    if (feedbackEl) {
      feedbackEl.textContent = 'Downloading all 3 Story slides (1080×1920)...';
      feedbackEl.classList.remove('hidden');
      setTimeout(() => feedbackEl.classList.add('hidden'), 2500);
    }
  });

  // Modal native share
  btnShareNative?.addEventListener('click', async () => {
    const current = slidesData[currentSlideIndex];
    const res = await shareTarotReading({
      fortune,
      fingerprint,
      score,
      canvas: current.canvas
    });

    if (feedbackEl) {
      if (res.method === 'clipboard') {
        feedbackEl.textContent = 'Prophecy text copied to clipboard!';
      } else if (res.shared) {
        feedbackEl.textContent = 'Shared successfully!';
      }
      feedbackEl.classList.remove('hidden');
      setTimeout(() => feedbackEl.classList.add('hidden'), 2500);
    }
  });
}

/**
 * Animates the circular gauge SVG and count-up number
 */
export function animateGauge(targetScore) {
  const numberEl = document.getElementById('gauge-score-number');
  const circleEl = document.getElementById('gauge-circle-bar');
  if (!numberEl || !circleEl) return;

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  circleEl.style.strokeDasharray = `${circumference}`;
  circleEl.style.strokeDashoffset = `${circumference}`;

  const duration = 1200;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentScore = Math.round(easeProgress * targetScore);

    numberEl.textContent = currentScore;
    const targetOffset = circumference - (circumference * (easeProgress * targetScore) / 100);
    circleEl.style.strokeDashoffset = targetOffset;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      numberEl.textContent = targetScore;
      circleEl.style.strokeDashoffset = circumference - (circumference * targetScore / 100);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Common timezone to ISO 3166-1 alpha-2 country code mapping
 */
export const TIMEZONE_TO_COUNTRY = {
  // Asia
  'Asia/Karachi': 'PK',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Dhaka': 'BD',
  'Asia/Colombo': 'LK',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Qatar': 'QA',
  'Asia/Muscat': 'OM',
  'Asia/Kuwait': 'KW',
  'Asia/Bahrain': 'BH',
  'Asia/Singapore': 'SG',
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Asia/Hong_Kong': 'HK',
  'Asia/Shanghai': 'CN',
  'Asia/Chongqing': 'CN',
  'Asia/Urumqi': 'CN',
  'Asia/Taipei': 'TW',
  'Asia/Bangkok': 'TH',
  'Asia/Jakarta': 'ID',
  'Asia/Makassar': 'ID',
  'Asia/Jayapura': 'ID',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Kuching': 'MY',
  'Asia/Manila': 'PH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Saigon': 'VN',
  'Asia/Beirut': 'LB',
  'Asia/Tel_Aviv': 'IL',
  'Asia/Jerusalem': 'IL',
  'Asia/Amman': 'JO',
  'Asia/Baghdad': 'IQ',
  'Asia/Tehran': 'IR',
  'Asia/Kabul': 'AF',
  'Asia/Tashkent': 'UZ',
  'Asia/Almaty': 'KZ',
  'Asia/Baku': 'AZ',
  'Asia/Tbilisi': 'GE',
  'Asia/Yerevan': 'AM',

  // Americas
  'America/New_York': 'US',
  'America/Detroit': 'US',
  'America/Kentucky/Louisville': 'US',
  'America/Chicago': 'US',
  'America/Indiana/Indianapolis': 'US',
  'America/Denver': 'US',
  'America/Boise': 'US',
  'America/Phoenix': 'US',
  'America/Los_Angeles': 'US',
  'America/Anchorage': 'US',
  'America/Juneau': 'US',
  'America/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Montreal': 'CA',
  'America/Vancouver': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Halifax': 'CA',
  'America/St_Johns': 'CA',
  'America/Mexico_City': 'MX',
  'America/Cancun': 'MX',
  'America/Monterrey': 'MX',
  'America/Tijuana': 'MX',
  'America/Bogota': 'CO',
  'America/Lima': 'PE',
  'America/Santiago': 'CL',
  'America/Buenos_Aires': 'AR',
  'America/Cordoba': 'AR',
  'America/Sao_Paulo': 'BR',
  'America/Rio_Branco': 'BR',
  'America/Manaus': 'BR',
  'America/Fortaleza': 'BR',
  'America/Caracas': 'VE',
  'America/Guayaquil': 'EC',
  'America/Montevideo': 'UY',
  'America/Asuncion': 'PY',
  'America/La_Paz': 'BO',
  'America/Panama': 'PA',
  'America/Costa_Rica': 'CR',
  'America/Guatemala': 'GT',

  // Europe
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Luxembourg': 'LU',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Zurich': 'CH',
  'Europe/Vienna': 'AT',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Bratislava': 'SK',
  'Europe/Budapest': 'HU',
  'Europe/Lisbon': 'PT',
  'Europe/Athens': 'GR',
  'Europe/Bucharest': 'RO',
  'Europe/Sofia': 'BG',
  'Europe/Belgrade': 'RS',
  'Europe/Zagreb': 'HR',
  'Europe/Kyiv': 'UA',
  'Europe/Kiev': 'UA',
  'Europe/Minsk': 'BY',
  'Europe/Moscow': 'RU',
  'Europe/Istanbul': 'TR',

  // Oceania
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Adelaide': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Darwin': 'AU',
  'Australia/Hobart': 'AU',
  'Pacific/Auckland': 'NZ',
  'Pacific/Chatham': 'NZ',
  'Pacific/Fiji': 'FJ',

  // Africa
  'Africa/Cairo': 'EG',
  'Africa/Johannesburg': 'ZA',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Africa/Casablanca': 'MA',
  'Africa/Algiers': 'DZ',
  'Africa/Tunis': 'TN',
  'Africa/Accra': 'GH',
  'Africa/Addis_Ababa': 'ET'
};

/**
 * Attaches click handler for the opt-in "Show what my connection reveals" button
 */
export function initConnectionReveal() {
  const btn = document.getElementById('btn-reveal-connection');
  const resultContainer = document.getElementById('connection-reveal-result');
  if (!btn || !resultContainer) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.classList.add('loading');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spin-icon">⟳</span> Checking connection headers...';

    try {
      // 1. Query /api/network (reads ONLY x-vercel-ip-country with Cache-Control: no-store)
      const res = await fetch('/api/network', { cache: 'no-store' });
      const data = await res.json().catch(() => ({ country: null }));
      const connCountry = data?.country;

      // 2. Read browser timezone
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
      const timezoneCountryCode = TIMEZONE_TO_COUNTRY[browserTimezone] || null;

      const formatCountry = (code) => {
        if (!code) return 'Not detected';
        try {
          const regionName = new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
          return regionName ? `${regionName} (${code})` : code;
        } catch {
          return code;
        }
      };

      resultContainer.classList.remove('hidden');

      if (!connCountry) {
        // Missing header on localhost or local dev
        resultContainer.innerHTML = `
          <div class="reveal-result-box info">
            <p class="reveal-comparison">
              Connection country: <strong>Not detected</strong>, browser timezone: <strong>${browserTimezone}</strong>
            </p>
            <p class="reveal-verdict neutral">
              Only available on the deployed site.
            </p>
            <div class="reveal-footnote">[approximate]</div>
          </div>
        `;
      } else {
        const isMatch = Boolean(
          timezoneCountryCode && (timezoneCountryCode.toUpperCase() === connCountry.toUpperCase())
        );
        const verdictText = isMatch
          ? 'Your connection and browser agree.'
          : 'This can mean a VPN, a proxy or travel.';
        const verdictClass = isMatch ? 'match' : 'mismatch';

        resultContainer.innerHTML = `
          <div class="reveal-result-box ${verdictClass}">
            <p class="reveal-comparison">
              Connection country: <strong>${formatCountry(connCountry)}</strong>, browser timezone: <strong>${browserTimezone}</strong>
            </p>
            <p class="reveal-verdict ${verdictClass}">
              ${verdictText}
            </p>
            <div class="reveal-footnote">[approximate]</div>
          </div>
        `;
      }
    } catch (err) {
      resultContainer.classList.remove('hidden');
      resultContainer.innerHTML = `
        <div class="reveal-result-box info">
          <p class="reveal-comparison">
            Connection country: <strong>Not detected</strong>, browser timezone: <strong>${Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'}</strong>
          </p>
          <p class="reveal-verdict neutral">
            Only available on the deployed site.
          </p>
          <div class="reveal-footnote">[approximate]</div>
        </div>
      `;
    } finally {
      btn.disabled = false;
      btn.classList.remove('loading');
      btn.innerHTML = originalText;
    }
  });
}

/**
 * 5-second Behaviour Measurement Test
 * Measures mouse/touch movement speed (px/s), pauses (>300ms),
 * typing speed (chars/s), and average gap between keystrokes (ms).
 * Nothing leaves the browser and nothing is stored.
 * The text typed is shown only in the input box and cleared afterwards.
 * Updates fingerprint.registry.behaviour with status "read".
 */
export function initBehaviourTest(fingerprint) {
  const startBtn = document.getElementById('btn-start-behaviour');
  const retryBtn = document.getElementById('btn-retry-behaviour');
  const idleView = document.getElementById('behaviour-test-idle');
  const activeView = document.getElementById('behaviour-test-active');
  const resultsView = document.getElementById('behaviour-test-results');
  const countdownEl = document.getElementById('behaviour-countdown');
  const trackZone = document.getElementById('behaviour-track-zone');
  const trackHint = document.getElementById('track-zone-hint');
  const typingArea = document.getElementById('behaviour-typing-area');
  const inputEl = document.getElementById('behaviour-input');
  const touchSkipNotice = document.getElementById('touch-skip-notice');
  const lblMouseSpeed = document.getElementById('lbl-mouse-speed');
  const valMouseSpeed = document.getElementById('metric-mouse-speed');
  const valPauses = document.getElementById('metric-pauses');
  const valTypingSpeed = document.getElementById('metric-typing-speed');
  const valKeystrokeGap = document.getElementById('metric-keystroke-gap');

  if (!startBtn || !idleView || !activeView || !resultsView) return;

  // Touch device detection (touchscreen without physical mouse/keyboard)
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const hasCoarseOnly = window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches;
  const isTouchOnly = Boolean(isTouchDevice && hasCoarseOnly);

  if (isTouchOnly) {
    if (trackHint) trackHint.textContent = 'Drag finger across this area';
    if (lblMouseSpeed) lblMouseSpeed.textContent = 'Touch Speed';
    if (touchSkipNotice) touchSkipNotice.classList.remove('hidden');
    if (typingArea) typingArea.classList.add('hidden');
  }

  let animationFrameId = null;
  let testActive = false;

  function startTest() {
    if (testActive) return;
    testActive = true;

    // View switching
    idleView.classList.add('hidden');
    resultsView.classList.add('hidden');
    activeView.classList.remove('hidden');

    if (inputEl) {
      inputEl.value = '';
      if (!isTouchOnly) {
        inputEl.focus();
      }
    }

    // Telemetry accumulators
    let totalPointerDistance = 0;
    let lastPointerPos = null;
    let lastPointerTime = null;
    let pauseCount = 0;
    let hasMoved = false;

    let charsTypedCount = 0;
    let lastKeystrokeTime = null;
    const keystrokeGaps = [];

    const duration = 5000; // 5.0 seconds
    const startTime = performance.now();

    // Pointer move listener (mouse + touch)
    function onPointerMove(e) {
      if (!testActive) return;
      const now = performance.now();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (clientX === null || clientY === null) return;

      if (lastPointerPos) {
        const dx = clientX - lastPointerPos.x;
        const dy = clientY - lastPointerPos.y;
        const dist = Math.hypot(dx, dy);
        totalPointerDistance += dist;

        if (lastPointerTime !== null) {
          const dt = now - lastPointerTime;
          if (dt > 300) {
            pauseCount++;
          }
        }
      }
      lastPointerPos = { x: clientX, y: clientY };
      lastPointerTime = now;
      hasMoved = true;
    }

    // Keystroke listeners (only active for devices with keyboard)
    function onKeyDown(e) {
      if (!testActive || isTouchOnly) return;
      const now = performance.now();
      if (lastKeystrokeTime !== null) {
        const gap = now - lastKeystrokeTime;
        keystrokeGaps.push(gap);
      }
      lastKeystrokeTime = now;
    }

    function onInput(e) {
      if (!testActive || isTouchOnly) return;
      if (e.inputType && e.inputType.startsWith('insert')) {
        charsTypedCount += (e.data ? e.data.length : 1);
      } else if (inputEl && inputEl.value) {
        charsTypedCount = Math.max(charsTypedCount, inputEl.value.length);
      }
    }

    // Attach listeners
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    if (inputEl && !isTouchOnly) {
      inputEl.addEventListener('keydown', onKeyDown);
      inputEl.addEventListener('input', onInput);
    }

    function tick() {
      const now = performance.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, duration - elapsed);

      if (countdownEl) {
        countdownEl.textContent = `${(remaining / 1000).toFixed(1)}s`;
      }

      if (remaining > 0) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        finishTest(now);
      }
    }

    function finishTest(endTime) {
      testActive = false;
      cancelAnimationFrame(animationFrameId);

      // Clean up event listeners
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      if (inputEl) {
        inputEl.removeEventListener('keydown', onKeyDown);
        inputEl.removeEventListener('input', onInput);

        // REQUIREMENT: Nothing leaves the browser and nothing is stored.
        // Show the text typed only in that box and clear it afterwards.
        inputEl.value = '';
        inputEl.blur();
      }

      // Check pauses: if user never moved, that is 1 idle pause; if they stopped moving >300ms before test end, count it
      if (!hasMoved) {
        pauseCount = 1;
      } else if (lastPointerTime !== null) {
        const trailingIdle = endTime - lastPointerTime;
        if (trailingIdle > 300) {
          pauseCount++;
        }
      }

      const testDurationSec = 5.0;
      const avgPointerSpeed = Math.round(totalPointerDistance / testDurationSec);
      const typingSpeed = isTouchOnly ? 0 : Number((charsTypedCount / testDurationSec).toFixed(1));
      const avgKeystrokeGap = (!isTouchOnly && keystrokeGaps.length > 0)
        ? Math.round(keystrokeGaps.reduce((sum, g) => sum + g, 0) / keystrokeGaps.length)
        : 0;

      // Update Results Display
      if (valMouseSpeed) {
        valMouseSpeed.textContent = `${avgPointerSpeed} px/s`;
      }
      if (valPauses) {
        valPauses.textContent = `${pauseCount}`;
      }
      if (valTypingSpeed) {
        valTypingSpeed.textContent = isTouchOnly ? 'Skipped (touch)' : `${typingSpeed} chars/s`;
      }
      if (valKeystrokeGap) {
        valKeystrokeGap.textContent = isTouchOnly
          ? 'Skipped (touch)'
          : (keystrokeGaps.length > 0 ? `${avgKeystrokeGap} ms` : '0 ms');
      }

      // Transition views
      activeView.classList.add('hidden');
      resultsView.classList.remove('hidden');

      // REQUIREMENT: Add the results to the signals registry as status "read"
      if (fingerprint && fingerprint.registry) {
        fingerprint.registry.behaviour = {
          value: {
            mouseSpeedPxPerSec: avgPointerSpeed,
            pausesOver300ms: pauseCount,
            typingSpeedCharsPerSec: isTouchOnly ? null : typingSpeed,
            avgKeystrokeGapMs: isTouchOnly ? null : avgKeystrokeGap,
            pointerType: isTouchOnly ? 'touch' : 'mouse'
          },
          status: 'read',
          source: 'Local behavioural biometrics measurement (pointer & keystroke dynamics)',
          note: 'Passive pointer motion and typing dynamics measured locally in 5-second test'
        };
        console.log('[SIGNALS REGISTRY] Updated behaviour telemetry:', fingerprint.registry.behaviour);
      }
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  startBtn.addEventListener('click', startTest);
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      resultsView.classList.add('hidden');
      idleView.classList.remove('hidden');
      if (countdownEl) countdownEl.textContent = '5.0s';
    });
  }
}


