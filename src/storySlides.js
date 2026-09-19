/**
 * src/storySlides.js
 * 
 * 1080x1920 Vertical Story-Style Share Slides generator using HTML5 Canvas.
 * Generates 3 full-bleed 9:16 slides:
 * - Slide 1: Archetype title, vibe emoji avatar, and "TrackMe Tarot" branding.
 * - Slide 2: Exposure Score gauge, level, and user's assigned Identity Badge + rule.
 * - Slide 3: Tomorrow's prediction rendered as a large readable quote.
 * 
 * Strict rules:
 * - Real client values only.
 * - Small site URL in footer.
 * - ZERO percentage of visitors or ranking claims.
 * - Multi-slide download (3 PNGs) and Web Share API with files (with download fallback).
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
 * Common background and border renderer for 1080x1920 Story slides
 */
function drawStoryBase(ctx, slideNum, totalSlides = 3) {
  // 1. Deep obsidian background
  ctx.fillStyle = '#06070b';
  ctx.fillRect(0, 0, 1080, 1920);

  // Occult ambient glows
  const topGlow = ctx.createRadialGradient(540, 360, 80, 540, 360, 650);
  topGlow.addColorStop(0, 'rgba(176, 38, 255, 0.22)');
  topGlow.addColorStop(1, 'rgba(6, 7, 11, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, 1080, 1000);

  const bottomGlow = ctx.createRadialGradient(540, 1550, 60, 540, 1550, 700);
  bottomGlow.addColorStop(0, 'rgba(0, 255, 157, 0.16)');
  bottomGlow.addColorStop(1, 'rgba(6, 7, 11, 0)');
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, 900, 1080, 1020);

  // Subtle cyber grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let x = 60; x < 1080; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 60);
    ctx.lineTo(x, 1860);
    ctx.stroke();
  }
  for (let y = 60; y < 1920; y += 60) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(1020, y);
    ctx.stroke();
  }

  // Ornate Double Glowing Border
  const pad = 48;
  const cornerR = 24;

  ctx.strokeStyle = 'rgba(176, 38, 255, 0.5)';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = 'rgba(176, 38, 255, 0.4)';
  ctx.shadowBlur = 15;
  roundRect(ctx, pad, pad, 1080 - pad * 2, 1920 - pad * 2, cornerR);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0, 255, 157, 0.35)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, pad + 14, pad + 14, 1080 - (pad + 14) * 2, 1920 - (pad + 14) * 2, cornerR - 8);
  ctx.stroke();

  // Corner Sigil Markers
  ctx.fillStyle = '#00ff9d';
  ctx.font = '22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('◈', pad + 32, pad + 38);
  ctx.fillText('◈', 1080 - (pad + 32), pad + 38);
  ctx.fillText('◈', pad + 32, 1920 - (pad + 20));
  ctx.fillText('◈', 1080 - (pad + 32), 1920 - (pad + 20));

  // Top Slide Progress Dots
  const dotWidth = 80;
  const dotGap = 16;
  const totalDotsW = (dotWidth * totalSlides) + (dotGap * (totalSlides - 1));
  const startDotX = (1080 - totalDotsW) / 2;
  const dotY = 100;

  for (let i = 0; i < totalSlides; i++) {
    const dx = startDotX + i * (dotWidth + dotGap);
    ctx.fillStyle = i === slideNum - 1 ? '#00ff9d' : 'rgba(255, 255, 255, 0.15)';
    roundRect(ctx, dx, dotY, dotWidth, 6, 3);
    ctx.fill();
  }

  // Header Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a855f7';
  ctx.font = '700 18px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('◈ TRACKMETAROT // ZERO-LOGIN DIVINATION ◈', 540, 150);

  // Footer URL Watermark (small)
  const siteUrl = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin.replace(/^https?:\/\//, '') : 'trackmetarot.vercel.app';
  ctx.fillStyle = '#64748b';
  ctx.font = '700 20px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText('◈ TRACKMETAROT ◈', 540, 1810);

  ctx.fillStyle = 'rgba(0, 255, 157, 0.85)';
  ctx.font = '600 16px monospace';
  ctx.letterSpacing = '1.5px';
  ctx.fillText(`THE INTERNET ALREADY KNOWS YOU  //  ${siteUrl.toUpperCase()}`, 540, 1845);
}

/**
 * Slide 1: Archetype Title, Vibe Emoji, and "TrackMe Tarot"
 */
export function generateSlide1Canvas({ fortune, fingerprint, score, cardArtImage }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  drawStoryBase(ctx, 1, 3);

  const cards = fortune.cards || [];
  const card1 = cards[0] || {};
  const emoji = card1.vibe_emoji || fortune.vibe_emoji || '🔮';
  const archetype = (card1.archetype || fortune.archetype || fortune.title || 'The Digital Voyager').toUpperCase();
  const theme = fortune.theme || 'Destiny & device memory';

  // Subheader
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 24px "Cinzel", serif, monospace';
  ctx.fillText('SLIDE 1 OF 3 • ARCANUM PROFILE', 540, 280);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 18px monospace';
  ctx.letterSpacing = '2px';
  ctx.fillText(`THEME: ${theme.toUpperCase()}`, 540, 320);

  const hasArtImage = Boolean(cardArtImage && typeof ctx.drawImage === 'function' && (cardArtImage.complete || cardArtImage.naturalWidth || cardArtImage.width));

  if (hasArtImage) {
    const artW = 680;
    const artH = 360;
    const artX = (1080 - artW) / 2;
    const artY = 360;

    // Glowing ornate frame
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0, 255, 157, 0.4)';
    ctx.shadowBlur = 18;
    roundRect(ctx, artX, artY, artW, artH, 14);
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (typeof ctx.save === 'function' && typeof ctx.clip === 'function') {
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, artX + 2, artY + 2, artW - 4, artH - 4, 12);
      ctx.clip();
      ctx.drawImage(cardArtImage, artX + 2, artY + 2, artW - 4, artH - 4);
      ctx.restore();
    } else {
      ctx.drawImage(cardArtImage, artX + 2, artY + 2, artW - 4, artH - 4);
    }

    // AI art pill badge
    ctx.fillStyle = 'rgba(6, 8, 14, 0.85)';
    roundRect(ctx, artX + 16, artY + 16, 175, 30, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 157, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#00ff9d';
    ctx.font = '700 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✦ AI-GENERATED ART', artX + 16 + 175 / 2, artY + 36);

    // Archetype Title directly below art
    ctx.fillStyle = '#ffffff';
    let titleSize = 48;
    ctx.font = `900 ${titleSize}px "Cinzel", serif, sans-serif`;
    while (ctx.measureText(archetype).width > 900 && titleSize > 30) {
      titleSize -= 2;
      ctx.font = `900 ${titleSize}px "Cinzel", serif, sans-serif`;
    }
    wrapText(ctx, archetype, 540, 765, 920, titleSize + 10, true);
  } else {
    // Large Vibe Emoji Avatar
    ctx.font = '150px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.shadowColor = 'rgba(0, 255, 157, 0.5)';
    ctx.shadowBlur = 40;
    ctx.fillText(emoji, 540, 570);
    ctx.shadowBlur = 0;

    // Archetype Title
    ctx.fillStyle = '#ffffff';
    let titleSize = 56;
    ctx.font = `900 ${titleSize}px "Cinzel", serif, sans-serif`;
    while (ctx.measureText(archetype).width > 900 && titleSize > 34) {
      titleSize -= 2;
      ctx.font = `900 ${titleSize}px "Cinzel", serif, sans-serif`;
    }
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 20;
    wrapText(ctx, archetype, 540, 720, 920, titleSize + 12, true);
    ctx.shadowBlur = 0;
  }

  // Prominent "TrackMe Tarot" Ribbon Box
  const brandBoxY = 880;
  const brandBoxW = 760;
  const brandBoxH = 85;
  const brandBoxX = (1080 - brandBoxW) / 2;

  ctx.fillStyle = 'rgba(176, 38, 255, 0.14)';
  roundRect(ctx, brandBoxX, brandBoxY, brandBoxW, brandBoxH, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(176, 38, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px "Cinzel", serif, monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('TRACKME TAROT', 540, brandBoxY + 54);

  // Reading Text Box (What the internet already knows)
  const readBoxY = 1040;
  const readBoxW = 900;
  const readBoxH = 580;
  const readBoxX = (1080 - readBoxW) / 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  roundRect(ctx, readBoxX, readBoxY, readBoxW, readBoxH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 22px monospace';
  ctx.fillText('◈ WHAT THE INTERNET ALREADY KNOWS:', readBoxX + 36, readBoxY + 56);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '400 28px "JetBrains Mono", monospace';
  const readingText = card1.reading || fortune.fortune || 'Stable telemetry vectors broadcast your exact silicon specifications to every host you ping.';
  wrapText(ctx, readingText, readBoxX + 36, readBoxY + 120, readBoxW - 72, 46, false);

  // Telemetry Pills at bottom of box
  const pillY = readBoxY + readBoxH - 85;
  const pills = [
    `${fingerprint.cores || 4} Cores`,
    `${fingerprint.resolution || '1920x1080'}`,
    `${(fingerprint.os || 'OS').slice(0, 10)}`
  ];
  const pW = 240;
  const pGap = 20;
  const totalPillsW = pW * 3 + pGap * 2;
  const startPX = (1080 - totalPillsW) / 2;

  pills.forEach((p, idx) => {
    const px = startPX + idx * (pW + pGap);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    roundRect(ctx, px, pillY, pW, 46, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 18px monospace';
    ctx.fillText(p, px + pW / 2, pillY + 30);
  });

  return canvas;
}

/**
 * Slide 2: Exposure Score Gauge, Level, and the User's Badge
 */
export function generateSlide2Canvas({ fortune, fingerprint, score }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  drawStoryBase(ctx, 2, 3);

  const badge = fortune.badge || fingerprint.badge || {
    name: 'The Everyday Browser',
    icon: '🧭',
    rule: 'You got this because your browser configuration follows standard everyday defaults.'
  };

  const scoreVal = score?.score ?? 50;
  const level = (score?.level || 'Medium').toUpperCase();

  // Subheader
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 24px "Cinzel", serif, monospace';
  ctx.fillText('SLIDE 2 OF 3 • EXPOSURE AUDIT', 540, 280);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 18px monospace';
  ctx.letterSpacing = '2px';
  ctx.fillText('TELEMETRY EXPOSURE INDEX & IDENTITY BADGE', 540, 320);

  // Large Circular Exposure Gauge
  const gaugeCenterX = 540;
  const gaugeCenterY = 560;
  const gaugeRadius = 160;
  const strokeW = 20;

  // Background track circle
  ctx.beginPath();
  ctx.arc(gaugeCenterX, gaugeCenterY, gaugeRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = strokeW;
  ctx.stroke();

  // Progress Arc
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (Math.PI * 2 * (scoreVal / 100));
  const gaugeColor = scoreVal >= 75 ? '#ff4757' : (scoreVal >= 50 ? '#f59e0b' : '#00ff9d');

  ctx.beginPath();
  ctx.arc(gaugeCenterX, gaugeCenterY, gaugeRadius, startAngle, endAngle);
  ctx.strokeStyle = gaugeColor;
  ctx.lineWidth = strokeW;
  ctx.lineCap = 'round';
  ctx.shadowColor = gaugeColor;
  ctx.shadowBlur = 25;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Score Number in Gauge Center
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 84px "Cinzel", serif, monospace';
  ctx.fillText(`${scoreVal}`, gaugeCenterX, gaugeCenterY + 15);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 24px monospace';
  ctx.fillText('/ 100', gaugeCenterX, gaugeCenterY + 60);

  // Level Badge Pill under gauge
  const lvlY = 780;
  const lvlW = 340;
  const lvlH = 56;
  const lvlX = (1080 - lvlW) / 2;

  ctx.fillStyle = scoreVal >= 75 ? 'rgba(255, 71, 87, 0.18)' : (scoreVal >= 50 ? 'rgba(245, 158, 11, 0.18)' : 'rgba(0, 255, 157, 0.18)');
  roundRect(ctx, lvlX, lvlY, lvlW, lvlH, 12);
  ctx.fill();
  ctx.strokeStyle = gaugeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = gaugeColor;
  ctx.font = '900 24px monospace';
  ctx.letterSpacing = '2px';
  ctx.fillText(`${level} EXPOSURE`, 540, lvlY + 36);

  // Identity Badge Card Section
  const badgeBoxY = 900;
  const badgeBoxW = 920;
  const badgeBoxH = 680;
  const badgeBoxX = (1080 - badgeBoxW) / 2;

  ctx.fillStyle = 'rgba(176, 38, 255, 0.08)';
  roundRect(ctx, badgeBoxX, badgeBoxY, badgeBoxW, badgeBoxH, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(176, 38, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Badge Tag
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c084fc';
  ctx.font = '800 20px monospace';
  ctx.letterSpacing = '2px';
  ctx.fillText('◈ ASSIGNED IDENTITY BADGE ◈', 540, badgeBoxY + 54);

  // Badge Icon
  ctx.font = '90px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.shadowColor = 'rgba(176, 38, 255, 0.5)';
  ctx.shadowBlur = 30;
  ctx.fillText(badge.icon || '🧭', 540, badgeBoxY + 175);
  ctx.shadowBlur = 0;

  // Badge Name
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px "Cinzel", serif, sans-serif';
  wrapText(ctx, (badge.name || 'The Everyday Browser').toUpperCase(), 540, badgeBoxY + 250, badgeBoxW - 60, 52, true);

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.moveTo(badgeBoxX + 60, badgeBoxY + 300);
  ctx.lineTo(badgeBoxX + badgeBoxW - 60, badgeBoxY + 300);
  ctx.stroke();

  // Exact Rule Statement
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 22px monospace';
  ctx.fillText('TRIGGER RULE // NO ESTIMATES', 540, badgeBoxY + 345);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 26px "JetBrains Mono", monospace';
  const ruleText = `"${badge.rule || 'You got this because your browser configuration follows standard everyday defaults.'}"`;
  wrapText(ctx, ruleText, 540, badgeBoxY + 400, badgeBoxW - 80, 42, true);

  // Footnote note inside badge card
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 18px monospace';
  ctx.fillText('Real client signals only • Zero population percentage claims', 540, badgeBoxY + badgeBoxH - 45);

  return canvas;
}

/**
 * Slide 3: Tomorrow's Prediction as a Large Quote
 */
export function generateSlide3Canvas({ fortune, fingerprint, score }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  drawStoryBase(ctx, 3, 3);

  const prediction = fortune.prediction || 'You will open a new browser tab to search something and forget what it was.';
  const theme = fortune.theme || 'Destiny & device memory';
  const tips = fortune.exposure_tips || fortune.tips || [
    'Enable tracking protection in your browser settings.',
    'Clear cookies and cache regularly.'
  ];

  // Subheader
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 24px "Cinzel", serif, monospace';
  ctx.fillText('SLIDE 3 OF 3 • TOMORROW\'S PROPHECY', 540, 280);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 18px monospace';
  ctx.letterSpacing = '2px';
  ctx.fillText(`DERIVED FROM ${theme.toUpperCase()}`, 540, 320);

  // Giant Occult Crystal Ball Icon
  ctx.font = '110px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.shadowColor = 'rgba(176, 38, 255, 0.6)';
  ctx.shadowBlur = 40;
  ctx.fillText('🔮', 540, 480);
  ctx.shadowBlur = 0;

  // Large Quote Box
  const quoteBoxY = 560;
  const quoteBoxW = 920;
  const quoteBoxH = 780;
  const quoteBoxX = (1080 - quoteBoxW) / 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  roundRect(ctx, quoteBoxX, quoteBoxY, quoteBoxW, quoteBoxH, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(176, 38, 255, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Quotation Marks
  ctx.fillStyle = 'rgba(176, 38, 255, 0.35)';
  ctx.font = '900 120px "Cinzel", serif, sans-serif';
  ctx.fillText('“', quoteBoxX + 80, quoteBoxY + 120);

  // Prediction Quote Text (Large, Readable)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 500 38px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  const predQuote = `"${prediction}"`;
  wrapText(ctx, predQuote, 540, quoteBoxY + 220, quoteBoxW - 120, 62, true);

  ctx.fillStyle = 'rgba(176, 38, 255, 0.35)';
  ctx.font = '900 120px "Cinzel", serif, sans-serif';
  ctx.fillText('”', quoteBoxX + quoteBoxW - 80, quoteBoxY + quoteBoxH - 60);

  // Key Mitigation Protocols Box (Bottom of Slide 3)
  const fixBoxY = 1400;
  const fixBoxW = 920;
  const fixBoxH = 290;
  const fixBoxX = (1080 - fixBoxW) / 2;

  ctx.fillStyle = 'rgba(0, 255, 157, 0.05)';
  roundRect(ctx, fixBoxX, fixBoxY, fixBoxW, fixBoxH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 255, 157, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#00ff9d';
  ctx.font = '700 22px monospace';
  ctx.fillText('⚡ KEY MITIGATION PROTOCOL:', fixBoxX + 36, fixBoxY + 50);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 24px monospace';
  let tipY = fixBoxY + 105;
  tips.slice(0, 2).forEach((tip) => {
    tipY = wrapText(ctx, `• ${tip}`, fixBoxX + 36, tipY, fixBoxW - 72, 38, false);
  });

  return canvas;
}

/**
 * Generates all 3 1080x1920 Story slide canvases
 */
export function generateAllStorySlides({ fortune, fingerprint, score, cardArtImage }) {
  return [
    generateSlide1Canvas({ fortune, fingerprint, score, cardArtImage }),
    generateSlide2Canvas({ fortune, fingerprint, score }),
    generateSlide3Canvas({ fortune, fingerprint, score })
  ];
}

/**
 * Triggers sequential download of all 3 Story slides as PNGs
 */
export function downloadStorySlides(slides, baseFilename = 'trackme-story') {
  if (!Array.isArray(slides)) return;

  slides.forEach((canvas, idx) => {
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `${baseFilename}-slide-${idx + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, idx * 300);
  });
}

/**
 * Shares story slides via Web Share API with files if supported, falling back to download
 */
export async function shareStorySlides({ slides, fortune, score }) {
  const title = `TrackMe Tarot — ${fortune.archetype || 'My Story Reading'}`;
  const text = `The internet revealed my digital tarot story. Find yours → ${typeof window !== 'undefined' ? window.location.origin : ''}`;
  const url = typeof window !== 'undefined' ? window.location.origin : '';

  if (navigator.share && navigator.canShare && Array.isArray(slides)) {
    try {
      const files = await Promise.all(
        slides.map(async (canvas, idx) => {
          const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
          return new File([blob], `trackme-story-slide-${idx + 1}.png`, { type: 'image/png' });
        })
      );

      if (navigator.canShare({ files })) {
        await navigator.share({
          title,
          text,
          files
        });
        return { shared: true, method: 'web-share-files' };
      }
    } catch (err) {
      if (err.name === 'AbortError') return { cancelled: true };
      console.warn('Web Share API with files failed, falling back to download:', err);
    }
  }

  // Fallback: trigger download of the 3 slides
  downloadStorySlides(slides);
  return { shared: false, method: 'download-fallback' };
}
