/**
 * src/card.js
 * 
 * High-definition 1080x1350 Tarot Card generator using HTML5 Canvas.
 * Renders the result as a cyber-mystic tarot card with archetype title,
 * vibe emoji, fortune, exposure score, and "trackmetarot" watermark.
 * 
 * Supports instant image downloads and multi-platform sharing (WhatsApp, LinkedIn, Web Share API).
 */

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

  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 20px "Cinzel", serif, monospace';
  const themeHeader = `THEME: ${(fortune.theme || 'Destiny & device memory').toUpperCase()}`;
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

  const isGemini = fortune.source === 'gemini';
  const badgeLabel = isGemini ? '✦ Written live by Gemini AI' : 'Offline mode';
  const oracleBadgeText = `<span class="${isGemini ? 'ai-badge' : 'offline-badge'}">${badgeLabel}</span>`;
  console.log('source:', fortune.source || (isGemini ? 'gemini' : 'fallback'));
  if (fortune.model) {
    console.log('model:', fortune.model);
  }

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
  const gpcStatus = fingerprint.gpc || fingerprint.globalPrivacyControl || 'unavailable';
  const dntStatus = fingerprint.dnt || fingerprint.doNotTrack || 'unavailable';
  const isLocalhost = Boolean(
    typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'
    )
  );
  const latencyTag = fingerprint.latencyTag || (isLocalhost ? 'local test' : 'approximate');
  const latencyDisplay = fingerprint.latencyDisplay || (fingerprint.latency !== null && fingerprint.latency !== undefined ? `${fingerprint.latency} ms` : 'unavailable');

  // Output debug info when ?debug=1 is present
  const isDebug = new URLSearchParams(window.location.search).get('debug') === '1';
  let debugHtml = '';
  if (isDebug) {
    debugHtml = `
      <aside class="debug-panel" aria-label="Debug Telemetry Info" style="margin-top: 1rem; width: 100%; max-width: 520px; padding: 0.85rem 1rem; background: rgba(5, 7, 12, 0.95); border: 1px dashed ${isGemini ? 'var(--neon-green)' : '#f59e0b'}; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.75rem; color: #cbd5e1; box-shadow: 0 4px 15px rgba(0,0,0,0.6);">
        <div style="color: ${isGemini ? 'var(--neon-green)' : '#f59e0b'}; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 0.4rem; display: flex; justify-content: space-between;">
          <span>&gt; DEBUG CONSOLE (?debug=1)</span>
          <span style="opacity: 0.8;">HTTP ${fortune.errorStatus || 200}</span>
        </div>
        <div>Mode: <strong style="color: ${isGemini ? 'var(--neon-green)' : '#f59e0b'};">${isGemini ? 'Live Gemini AI' : 'Offline Fallback'}</strong></div>
        <div>Source: <code>${fortune.source}</code></div>
        ${fortune.model ? `<div>Model: <strong style="color: #38bdf8;">${fortune.model}</strong></div>` : ''}
        ${fortune.errorMessage ? `<div style="color: #ff4757; margin-top: 0.35rem; line-height: 1.35;">Offline Reason: <code>[${fortune.errorStatus || 503}] ${fortune.errorMessage}</code></div>` : ''}
        ${fortune.attempts?.length ? `<div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 0.35rem;">Attempts Tried: ${fortune.attempts.map(a => `${a.model} (att ${a.attempt}: ${a.status || 'err'})`).join(', ')}</div>` : ''}
      </aside>
    `;
    console.log('[DEBUG 1 OUTPUT]', {
      source: fortune.source,
      model: fortune.model || null,
      errorStatus: fortune.errorStatus || null,
      errorMessage: fortune.errorMessage || null,
      attempts: fortune.attempts || null
    });
  }

  // 1. Three-Card Tarot Spread Triptych HTML (Interactive cards flipping in sequentially)
  const spreadHtml = `
    <div class="tarot-3card-spread-wrapper" aria-label="Three card spread result">
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

  // Inject the spread into tarot-spread-container
  const spreadContainer = document.getElementById('tarot-spread-container');
  if (spreadContainer) {
    spreadContainer.innerHTML = spreadHtml;
  }

  // 2. High-Res 1080x1350 Tarot Canvas Preview Card (Left Column)
  const cardOnlyHtml = `
    <article class="tarot-card-canvas-wrap" id="active-tarot-card" aria-label="Shareable 3-Card Tarot Card">
      <div class="card-preview-header">
        <span class="preview-tag">SHAREABLE 3-CARD TRIPTYCH</span>
        <span class="preview-origin">${oracleBadgeText}</span>
        <span class="preview-res">1080×1350 HD</span>
      </div>
      <div class="canvas-image-container">
        <img class="tarot-canvas-img" src="${dataUrl}" alt="TrackMe Tarot 3-Card Spread - ${cards[0].archetype}, ${cards[1].archetype}, ${cards[2].archetype}" id="tarot-rendered-image" />
      </div>
    </article>
    ${debugHtml}
  `;

  // Fix-it cards from exposure tips
  const tipsArray = (fortune.exposure_tips || fortune.tips || [
    'Use privacy-preserving browser extensions.',
    'Enable tracking protection in your browser settings.',
    'Clear cookies and cache regularly.'
  ]).slice(0, 3);

  const fixItCardsHtml = tipsArray.map((tip, idx) => `
    <div class="fix-it-card">
      <div class="fix-it-header">
        <span class="fix-it-badge">FIX 0${idx + 1}</span>
        <span class="fix-it-icon">🛡️</span>
      </div>
      <p class="fix-it-text">${tip}</p>
    </div>
  `).join('');

  // Why this score breakdown items
  const breakdownHtml = (score.breakdown || []).map((item) => `
    <div class="breakdown-item">
      <div class="breakdown-item-header">
        <span class="breakdown-label">${item.label}</span>
        <span class="breakdown-points">${item.points}</span>
      </div>
      <p class="breakdown-why">${item.why}</p>
    </div>
  `).join('');

  const levelClass = (score.level || 'Medium').toLowerCase().replace(/\s+/g, '-');

  // 2. Exposure Score & Circular Gauge Section (Right Column)
  const dashboardHtml = `
    <section class="exposure-dashboard" aria-label="Exposure Score Analysis">
      <div class="dashboard-header">
        <span class="dashboard-tag">&gt; TELEMETRY EXPOSURE AUDIT</span>
        <h3 class="dashboard-title">DIGITAL EXPOSURE INDEX</h3>
      </div>

      <!-- Circular Animated Gauge -->
      <div class="gauge-container">
        <div class="gauge-svg-wrapper">
          <svg class="gauge-svg" viewBox="0 0 120 120" width="160" height="160">
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
            <span class="gauge-level-badge level-${levelClass}">${score.level}</span>
          </div>
        </div>
      </div>

      <!-- Hardware & Fingerprint Telemetry Cards (Feature 1 & Feature 2) -->
      <div class="telemetry-cards-container">
        <!-- Feature 1: Your graphics card -->
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

        <!-- Feature 2: Fingerprint Hash -->
        <div class="telemetry-card fp-hash-card" aria-label="Fingerprint Hash">
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

        <!-- Feature 3: Opt-in Connection Revelation -->
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

        <!-- Feature 4: 5-Second Behaviour Measurement Test -->
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
            <button id="btn-retry-behaviour" class="cyber-btn text-link retry-behaviour-btn" type="button">
              ↺ Test again
            </button>
          </div>
        </div>
      </div>

      <!-- Signals we read Panel -->
      <div class="signals-we-read-container" id="signals-we-read-panel" aria-label="Signals we read">
        <div class="signals-panel-header">
          <div class="signals-header-left">
            <span class="signals-panel-badge">&gt; PASSIVE AUDIT</span>
            <h4 class="signals-panel-title">Signals we read</h4>
          </div>
          <span class="signals-panel-meta">BROWSER EXPOSURE SPECTRUM</span>
        </div>
        <p class="signals-panel-sub">
          Real environmental and configuration signals queried directly by scripts without prompting for user permission.
        </p>

        <div class="signals-read-grid">
          <!-- Signal 1: Refresh rate -->
          <div class="signal-read-card" aria-label="Refresh rate">
            <div class="signal-read-top">
              <span class="signal-read-name">Refresh rate</span>
              <span class="signal-read-badge approximate">approximate</span>
            </div>
            <div class="signal-read-value" id="signal-val-refresh-rate">${refreshRateDisplay}</div>
            <div class="signal-read-source">Average requestAnimationFrame interval over 60 frames</div>
          </div>

          <!-- Signal 2: Colour depth, HDR support & colour gamut -->
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

          <!-- Signal 3a: Global Privacy Control -->
          <div class="signal-read-card" aria-label="Global Privacy Control">
            <div class="signal-read-top">
              <span class="signal-read-name">Global Privacy Control</span>
              <span class="signal-read-badge ${gpcStatus}">${gpcStatus}</span>
            </div>
            <div class="signal-read-value status-${gpcStatus}">${gpcStatus}</div>
            <div class="signal-read-source">navigator.globalPrivacyControl (${gpcStatus})</div>
          </div>

          <!-- Signal 3b: Do Not Track -->
          <div class="signal-read-card" aria-label="Do Not Track">
            <div class="signal-read-top">
              <span class="signal-read-name">Do Not Track</span>
              <span class="signal-read-badge ${dntStatus}">${dntStatus}</span>
            </div>
            <div class="signal-read-value status-${dntStatus}">${dntStatus}</div>
            <div class="signal-read-source">navigator.doNotTrack (${dntStatus})</div>
          </div>

          <!-- Signal 4: Latency -->
          <div class="signal-read-card" aria-label="Round-trip latency">
            <div class="signal-read-top">
              <span class="signal-read-name">Latency</span>
              <span class="signal-read-badge ${latencyTag === 'local test' ? 'local-test' : 'approximate'}">${latencyTag}</span>
            </div>
            <div class="signal-read-value" id="signal-val-latency">${latencyDisplay}</div>
            <div class="signal-read-source">5-sample median round-trip to /api/ping (${latencyTag})</div>
          </div>
        </div>
      </div>

      <!-- Why This Score List -->
      <div class="why-score-container">
        <h4 class="why-title">WHY THIS SCORE</h4>
        <div class="breakdown-list">
          ${breakdownHtml}
        </div>
      </div>

      <!-- 3. Fix It Cards from AI Exposure Tips -->
      <div class="fix-it-container">
        <h4 class="fix-it-heading">FIX IT: MITIGATION PROTOCOLS</h4>
        <div class="fix-it-grid">
          ${fixItCardsHtml}
        </div>
      </div>

      <!-- 4. Privacy Guarantee Note -->
      <div class="privacy-note-card">
        <span class="privacy-icon">🔒</span>
        <p class="privacy-text">Nothing you saw here left your browser except a summary sent to write your fortune. We store nothing.</p>
      </div>
    </section>
  `;

  // Inject card into tarot-card-container
  container.innerHTML = cardOnlyHtml;

  // Inject dashboard into exposure-dashboard-container
  const dashboardContainer = document.getElementById('exposure-dashboard-container');
  if (dashboardContainer) {
    dashboardContainer.innerHTML = dashboardHtml;
  } else {
    container.insertAdjacentHTML('beforeend', dashboardHtml);
  }

  // Trigger smooth gauge animation
  animateGauge(score.score);

  // Initialize opt-in connection reveal listener
  initConnectionReveal();

  // Initialize 5-second behaviour measurement test
  initBehaviourTest(fingerprint);

  return canvas;
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


