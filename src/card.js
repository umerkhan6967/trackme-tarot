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

  // 1. Background: Deep obsidian with cyber-mystic ambient gradients
  ctx.fillStyle = '#06070b';
  ctx.fillRect(0, 0, 1080, 1350);

  // Radial purple occult glow top center
  const purpleGlow = ctx.createRadialGradient(540, 260, 50, 540, 260, 500);
  purpleGlow.addColorStop(0, 'rgba(176, 38, 255, 0.25)');
  purpleGlow.addColorStop(1, 'rgba(6, 7, 11, 0)');
  ctx.fillStyle = purpleGlow;
  ctx.fillRect(0, 0, 1080, 750);

  // Radial neon emerald glow bottom center
  const greenGlow = ctx.createRadialGradient(540, 1050, 40, 540, 1050, 480);
  greenGlow.addColorStop(0, 'rgba(0, 255, 157, 0.15)');
  greenGlow.addColorStop(1, 'rgba(6, 7, 11, 0)');
  ctx.fillStyle = greenGlow;
  ctx.fillRect(0, 700, 1080, 650);

  // Cyber subtle grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
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
  const pad = 44;
  const cornerR = 24;

  // Outer border
  ctx.strokeStyle = 'rgba(176, 38, 255, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(176, 38, 255, 0.5)';
  ctx.shadowBlur = 15;
  roundRect(ctx, pad, pad, 1080 - pad * 2, 1350 - pad * 2, cornerR);
  ctx.stroke();

  // Inner border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0, 255, 157, 0.4)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, pad + 14, pad + 14, 1080 - (pad + 14) * 2, 1350 - (pad + 14) * 2, cornerR - 8);
  ctx.stroke();

  // Corner Sigil Markers
  ctx.fillStyle = '#00ff9d';
  ctx.font = '22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('◈', pad + 32, pad + 36);
  ctx.fillText('◈', 1080 - (pad + 32), pad + 36);
  ctx.fillText('◈', pad + 32, 1350 - (pad + 20));
  ctx.fillText('◈', 1080 - (pad + 32), 1350 - (pad + 20));

  // 3. Card Header Bar
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a855f7';
  ctx.font = '700 20px monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('◈ TRACKMETAROT // ZERO-LOGIN DIVINATION ◈', 540, 100);

  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 24px "Cinzel", serif, monospace';
  const headerMeta = `ARCANUM ${fortune.numeral || 'VII'}  •  ${fortune.suit || 'SUIT OF CIPHERS'}`;
  ctx.fillText(headerMeta, 540, 138);

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.moveTo(140, 160);
  ctx.lineTo(940, 160);
  ctx.stroke();

  // 4. Large Vibe Emoji Avatar
  const emoji = fortune.vibe_emoji || fortune.avatar || '🔮';
  ctx.font = '115px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 255, 157, 0.4)';
  ctx.shadowBlur = 30;
  ctx.fillText(emoji, 540, 280);
  ctx.shadowBlur = 0;

  // 5. Archetype Title
  const title = (fortune.archetype || fortune.title || 'THE DIGITAL PHANTOM').toUpperCase();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px "Cinzel", serif, sans-serif';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
  ctx.shadowBlur = 16;
  ctx.fillText(title, 540, 350);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.fillStyle = '#00ff9d';
  ctx.font = '600 20px monospace';
  ctx.fillText(fortune.subtitle || `Aura: ${emoji} // Certified Footprint`, 540, 388);

  // 6. Digital Exposure Score Box
  const scoreBoxY = 422;
  const scoreBoxW = 760;
  const scoreBoxH = 68;
  const scoreBoxX = (1080 - scoreBoxW) / 2;

  // Score Box Background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  roundRect(ctx, scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(176, 38, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Score text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 18px monospace';
  ctx.fillText('DIGITAL EXPOSURE SCORE:', scoreBoxX + 24, scoreBoxY + 41);

  ctx.textAlign = 'right';
  ctx.fillStyle = score.score >= 75 ? '#ff4757' : (score.score >= 50 ? '#f59e0b' : '#00ff9d');
  ctx.font = '900 26px monospace';
  ctx.fillText(`${score.score}/100 [${(score.level || 'HIGH').toUpperCase()}]`, scoreBoxX + scoreBoxW - 24, scoreBoxY + 43);

  // 7. Telemetry Signals Pill Strip
  const telY = 520;
  const telemetryBadges = [
    `${fingerprint.cores || 4} CPU Cores`,
    `${fingerprint.resolution || '1920x1080'}`,
    `${(fingerprint.timezone || 'UTC').replace('_', ' ')}`,
    fingerprint.batteryStatus ? `${fingerprint.batteryStatus.level}% Battery` : 'Shielded Power'
  ];

  ctx.textAlign = 'center';
  const badgeWidth = 205;
  const badgeGap = 16;
  const totalBadgesWidth = (badgeWidth * 4) + (badgeGap * 3);
  const startBadgeX = (1080 - totalBadgesWidth) / 2;

  telemetryBadges.forEach((badge, idx) => {
    const bx = startBadgeX + idx * (badgeWidth + badgeGap);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    roundRect(ctx, bx, telY, badgeWidth, 38, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 14px monospace';
    ctx.fillText(badge, bx + badgeWidth / 2, telY + 24);
  });

  // 8. The Fortune Reading
  const quoteBoxY = 595;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 500 24px monospace';
  ctx.textAlign = 'center';
  const fortuneText = `"${fortune.fortune || fortune.quote || ''}"`;
  const nextY = wrapText(ctx, fortuneText, 540, quoteBoxY + 36, 880, 36, true);

  // 9. Tomorrow's Absurd Prophecy Box
  const propY = Math.max(nextY + 25, 785);
  const propW = 880;
  const propX = (1080 - propW) / 2;
  const propH = 180;

  ctx.fillStyle = 'rgba(176, 38, 255, 0.08)';
  roundRect(ctx, propX, propY, propW, propH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(176, 38, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#c084fc';
  ctx.font = '700 17px monospace';
  ctx.fillText('🔮 TOMORROW\'S PROPHECY:', propX + 28, propY + 38);

  ctx.fillStyle = '#ffffff';
  ctx.font = '500 20px monospace';
  const predText = fortune.prediction || 'You will open a new browser tab to search something and forget what it was.';
  wrapText(ctx, predText, propX + 28, propY + 75, propW - 56, 30);

  // 10. Exposure Mitigation Protocols (Fix-it) summary
  const fixY = propY + propH + 28;
  const tips = (fortune.exposure_tips || fortune.tips || []).slice(0, 2);
  if (tips.length) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00ff9d';
    ctx.font = '700 15px monospace';
    ctx.fillText('⚡ KEY EXPOSURE PROTOCOL:', propX + 28, fixY + 16);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px monospace';
    ctx.fillText(`• ${tips[0]}`, propX + 28, fixY + 44);
    if (tips[1]) {
      ctx.fillText(`• ${tips[1]}`, propX + 28, fixY + 72);
    }
  }

  // 11. Watermark & Branding at Bottom
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '700 18px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('◈ TRACKMETAROT ◈', 540, 1240);

  ctx.fillStyle = 'rgba(0, 255, 157, 0.8)';
  ctx.font = '600 15px monospace';
  ctx.fillText('THE INTERNET ALREADY KNOWS YOU  //  TRACKMETAROT.VERCEL.APP', 540, 1272);

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
  const archetypeTitle = fortune.archetype || fortune.title || 'The Digital Phantom';
  const exposureVal = score?.score ?? score?.value ?? 70;
  const shareUrl = window.location.origin;

  return `The internet says I'm '${archetypeTitle}' with ${exposureVal}% exposure. Find yours → ${shareUrl}`;
}

/**
 * Performs social sharing via Web Share API or falls back to clipboard copy
 */
export async function shareTarotReading({ fortune, fingerprint, score, canvas }) {
  const shareText = getShareableText(fortune, fingerprint, score);
  const shareUrl = window.location.origin;
  const title = `TrackMe Tarot — ${fortune.archetype || fortune.title}`;

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

  const batteryDisplay = fingerprint.batteryStatus 
    ? `${fingerprint.batteryStatus.level}% ${fingerprint.batteryStatus.charging ? '(charging)' : ''}` 
    : 'Shielded';

  const oracleBadgeText = fortune.isAiGenerated 
    ? '<span class="ai-badge">✦ GEMINI NEURAL DIVINATION</span>' 
    : '<span class="local-badge">◈ CIPHER MATRIX DECODED</span>';

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

  const cardHtml = `
    <!-- 1. High-Res 1080x1350 Tarot Canvas Preview Card -->
    <article class="tarot-card-canvas-wrap" id="active-tarot-card" aria-label="Tarot Card: ${fortune.archetype || fortune.title}">
      <div class="card-preview-header">
        <span class="preview-tag">ARCANUM ${fortune.numeral || 'VII'}</span>
        <span class="preview-origin">${oracleBadgeText}</span>
        <span class="preview-res">1080×1350 HD</span>
      </div>
      <div class="canvas-image-container">
        <img class="tarot-canvas-img" src="${dataUrl}" alt="TrackMe Tarot Card - ${fortune.archetype || fortune.title}" id="tarot-rendered-image" />
      </div>
    </article>

    <!-- 2. Exposure Score & Circular Gauge Section -->
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

  container.innerHTML = cardHtml;

  // Trigger smooth gauge animation
  animateGauge(score.score);

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
