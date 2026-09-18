/**
 * src/card.js
 * 
 * Renders the Tarot Card, Animated Circular Exposure Gauge,
 * "Why this score" breakdown, 3 "Fix it" cards, and privacy note.
 */

export function renderTarotCard(container, { fortune, fingerprint, score }) {
  if (!container) return;

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

  // Level color class
  const levelClass = (score.level || 'Medium').toLowerCase().replace(/\s+/g, '-');

  const cardHtml = `
    <!-- 1. The Mystical Tarot Card -->
    <article class="tarot-card" id="active-tarot-card" aria-label="Tarot Card: ${fortune.archetype || fortune.title}">
      <div class="card-inner">
        <!-- Header -->
        <div class="card-header-bar">
          <span class="card-numeral">ARCANUM ${fortune.numeral || 'VII'}</span>
          <div class="card-oracle-origin">${oracleBadgeText}</div>
          <span class="card-suit">${fortune.suit || 'SUIT OF SILICON'}</span>
        </div>

        <!-- Visual / Symbol -->
        <div class="card-visual">
          <div class="card-avatar-icon">${fortune.vibe_emoji || fortune.avatar || '🔮'}</div>
          <h3 class="card-title">${fortune.archetype || fortune.title}</h3>
          <div class="card-subtitle">${fortune.subtitle || 'Digital Footprint Revelation'}</div>
        </div>

        <!-- Telemetry Intercepts -->
        <div class="card-telemetry">
          <div class="telemetry-row">
            <span class="telemetry-label">Temporal Anchor</span>
            <span class="telemetry-value">${fingerprint.timezone} (${fingerprint.timeOfDayLabel || 'live'})</span>
          </div>
          <div class="telemetry-row">
            <span class="telemetry-label">Screen Geometry</span>
            <span class="telemetry-value">${fingerprint.resolution} (${fingerprint.colorDepth})</span>
          </div>
          <div class="telemetry-row">
            <span class="telemetry-label">Compute Core</span>
            <span class="telemetry-value">${fingerprint.cores} Threads // ${fingerprint.deviceMemory}</span>
          </div>
          <div class="telemetry-row">
            <span class="telemetry-label">Visual Silicon</span>
            <span class="telemetry-value">${fingerprint.gpuRenderer}</span>
          </div>
          <div class="telemetry-row">
            <span class="telemetry-label">Energy State</span>
            <span class="telemetry-value">${batteryDisplay}</span>
          </div>
        </div>

        <!-- The Fortune Reading -->
        <div class="card-fortune-section">
          <p class="fortune-quote">"${fortune.fortune || fortune.quote}"</p>
          
          <div class="prediction-box">
            <span class="prediction-title">🔮 TOMORROW'S PROPHECY:</span>
            <p class="prediction-text">${fortune.prediction}</p>
          </div>
        </div>
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
            <!-- Background Track -->
            <circle
              class="gauge-bg-circle"
              cx="60" cy="60" r="48"
              stroke-width="8"
              fill="none"
            />
            <!-- Animated Progress Bar -->
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
}

/**
 * Animates the circular gauge SVG and count-up number
 */
export function animateGauge(targetScore) {
  const numberEl = document.getElementById('gauge-score-number');
  const circleEl = document.getElementById('gauge-circle-bar');
  if (!numberEl || !circleEl) return;

  const radius = 48;
  const circumference = 2 * Math.PI * radius; // ~301.59
  circleEl.style.strokeDasharray = `${circumference}`;
  circleEl.style.strokeDashoffset = `${circumference}`;

  const duration = 1200;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
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
 * Generates formatted text version of the card suitable for clipboard sharing
 */
export function getShareableText(fortune, fingerprint, score) {
  const tips = (fortune.exposure_tips || fortune.tips || []).map((t, i) => `  ${i + 1}. ${t}`).join('\n');
  return [
    `🔮 TRACKME TAROT READING`,
    `${fortune.vibe_emoji || '⚡'} Arcanum ${fortune.numeral || 'VII'}: ${fortune.archetype || fortune.title}`,
    `Suit: ${fortune.suit || 'SUIT OF SILICON'}`,
    `Exposure Score: ${score.score}/100 (${score.level} Exposure)`,
    `Identified: ${fingerprint.cores} Cores | ${fingerprint.resolution} | ${fingerprint.timezone}`,
    `"${fortune.fortune || fortune.quote}"`,
    `🔮 Tomorrow's Prophecy: ${fortune.prediction}`,
    tips ? `🛡️ Fix It Protocols:\n${tips}` : '',
    `— Divined via TrackMe Tarot`
  ].filter(Boolean).join('\n\n');
}
