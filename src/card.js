/**
 * src/card.js
 * Renders the Tarot Card component into the DOM with glowing borders,
 * cyber-arcane motifs, absurd predictions, and exposure mitigation tips.
 */

export function renderTarotCard(container, { fortune, fingerprint, score }) {
  if (!container) return;

  const batteryDisplay = fingerprint.batteryStatus 
    ? `${fingerprint.batteryStatus.level}% ${fingerprint.batteryStatus.charging ? '(charging)' : ''}` 
    : 'Shielded';

  const tipsHtml = Array.isArray(fortune.exposure_tips) && fortune.exposure_tips.length
    ? fortune.exposure_tips.map(tip => `<li><span class="tip-marker">⚡</span> ${tip}</li>`).join('')
    : (fortune.tips ? fortune.tips.map(tip => `<li><span class="tip-marker">⚡</span> ${tip}</li>`).join('') : '');

  const oracleBadgeText = fortune.isAiGenerated 
    ? '<span class="ai-badge">✦ GEMINI NEURAL DIVINATION</span>' 
    : '<span class="local-badge">◈ CIPHER MATRIX DECODED</span>';

  const cardHtml = `
    <article class="tarot-card" id="active-tarot-card" aria-label="Tarot Card: ${fortune.archetype || fortune.title}">
      <div class="card-inner">
        <!-- Header -->
        <div class="card-header-bar">
          <span class="card-numeral">ARCANUM ${fortune.numeral}</span>
          <div class="card-oracle-origin">${oracleBadgeText}</div>
          <span class="card-suit">${fortune.suit}</span>
        </div>

        <!-- Visual / Symbol -->
        <div class="card-visual">
          <div class="card-avatar-icon">${fortune.vibe_emoji || fortune.avatar}</div>
          <h3 class="card-title">${fortune.archetype || fortune.title}</h3>
          <div class="card-subtitle">${fortune.subtitle}</div>
        </div>

        <!-- Trackability Score -->
        <div class="card-score-box">
          <div class="score-meta-row">
            <span class="score-title">TRACKABILITY INDEX</span>
            <span class="score-val">${score.value} / 100</span>
          </div>
          <div class="score-bar-bg">
            <div class="score-bar-fill" style="width: ${score.value}%"></div>
          </div>
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

          ${tipsHtml ? `
            <div class="tips-box">
              <span class="tips-title">EXPOSURE MITIGATION PROTOCOLS:</span>
              <ul class="tips-list">
                ${tipsHtml}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    </article>
  `;

  container.innerHTML = cardHtml;
}

/**
 * Generates formatted text version of the card suitable for clipboard sharing
 */
export function getShareableText(fortune, fingerprint, score) {
  const tips = (fortune.exposure_tips || fortune.tips || []).map(t => `  • ${t}`).join('\n');
  return [
    `🔮 TRACKME TAROT READING`,
    `${fortune.vibe_emoji || '⚡'} Arcanum ${fortune.numeral}: ${fortune.archetype || fortune.title}`,
    `Suit: ${fortune.suit}`,
    `Trackability Index: ${score.value}/100 (${score.label})`,
    `Identified: ${fingerprint.cores} Cores | ${fingerprint.resolution} | ${fingerprint.timezone}`,
    `"${fortune.fortune || fortune.quote}"`,
    `🔮 Tomorrow's Prophecy: ${fortune.prediction}`,
    tips ? `🛡️ Exposure Mitigation:\n${tips}` : '',
    `— Divined via TrackMe Tarot`
  ].filter(Boolean).join('\n\n');
}
