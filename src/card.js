/**
 * src/card.js
 * Renders the Tarot Card component into the DOM with glowing borders and cyber-arcane motifs.
 */

export function renderTarotCard(container, { fortune, fingerprint, score }) {
  if (!container) return;

  const batteryDisplay = fingerprint.batteryStatus 
    ? `${fingerprint.batteryStatus.level}% ${fingerprint.batteryStatus.charging ? '(charging)' : ''}` 
    : 'Shielded';

  const cardHtml = `
    <article class="tarot-card" id="active-tarot-card" aria-label="Tarot Card: ${fortune.title}">
      <div class="card-inner">
        <!-- Header -->
        <div class="card-header-bar">
          <span class="card-numeral">ARCANUM ${fortune.numeral}</span>
          <span class="card-suit">${fortune.suit}</span>
        </div>

        <!-- Visual / Symbol -->
        <div class="card-visual">
          <div class="card-avatar-icon">${fortune.avatar}</div>
          <h3 class="card-title">${fortune.title}</h3>
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
            <span class="telemetry-value">${fingerprint.timezone}</span>
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
          <p class="fortune-quote">"${fortune.quote}"</p>
          <p class="fortune-warning">${fortune.warning}</p>
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
  return [
    `🔮 TRACKME TAROT READING`,
    `Arcanum ${fortune.numeral}: ${fortune.title}`,
    `Suit: ${fortune.suit}`,
    `Trackability Index: ${score.value}/100 (${score.label})`,
    `Identified: ${fingerprint.cores} Cores | ${fingerprint.resolution} | ${fingerprint.timezone}`,
    `"${fortune.quote}"`,
    `${fortune.warning}`,
    `— Divined via TrackMe Tarot`
  ].join('\n\n');
}
