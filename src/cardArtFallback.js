/**
 * src/cardArtFallback.js
 * 
 * Generates an ornate, cyber-mystic geometric SVG illustration based on the
 * archetype's vibe emoji, theme, and title.
 * Used when the Gemini image API is unavailable, fails, or exceeds 15 seconds.
 * 
 * Rules:
 * - Dark cyber-mystic style: neon green (#00ff9d) and violet (#b026ff) on near-black (#07090e)
 * - Ornate sacred geometry and cyber circuit borders
 * - No text, no letters, no logos, no real people
 * - Deterministic, crisp vector rendering across both Canvas and DOM
 */

export function generateCardArtSvg(vibeEmoji = '🔮', archetype = 'The Digital Wanderer', theme = 'Destiny') {
  const emoji = vibeEmoji || '🔮';

  // Determine geometric variant based on vibe emoji
  let geometryType = 'rings';
  if (['👁️', '👀', '🔍'].includes(emoji)) geometryType = 'eye';
  else if (['💻', '📱', '🖥️', '⌨️'].includes(emoji)) geometryType = 'matrix';
  else if (['⚡', '🔋', '🔌', '💥'].includes(emoji)) geometryType = 'energy';
  else if (['⚖️', '🧭', '📐'].includes(emoji)) geometryType = 'balance';
  else if (['💼', '📊', '📈', '👔'].includes(emoji)) geometryType = 'corporate';
  else if (['🦉', '🌙', '🌌', '⭐'].includes(emoji)) geometryType = 'celestial';
  else if (['👑', '💎', '✨'].includes(emoji)) geometryType = 'crown';
  else if (['👻', '🛡️', '🔒'].includes(emoji)) geometryType = 'shield';

  // Generate specialized geometric path elements based on type
  let centerGeometry = '';

  switch (geometryType) {
    case 'eye':
      centerGeometry = `
        <ellipse cx="200" cy="150" rx="90" ry="50" fill="none" stroke="url(#violetGlow)" stroke-width="2.5" />
        <ellipse cx="200" cy="150" rx="60" ry="34" fill="none" stroke="url(#greenGlow)" stroke-width="2" stroke-dasharray="4,3" />
        <circle cx="200" cy="150" r="28" fill="url(#portalGradient)" stroke="#00ff9d" stroke-width="2" />
        <circle cx="200" cy="150" r="14" fill="#07090e" stroke="#b026ff" stroke-width="2" />
        <line x1="80" y1="150" x2="320" y2="150" stroke="#00ff9d" stroke-width="1" stroke-opacity="0.4" />
        <line x1="200" y1="80" x2="200" y2="220" stroke="#b026ff" stroke-width="1" stroke-opacity="0.4" />
      `;
      break;
    case 'matrix':
      centerGeometry = `
        <rect x="135" y="85" width="130" height="130" rx="10" fill="url(#portalGradient)" stroke="url(#violetGlow)" stroke-width="2" />
        <rect x="150" y="100" width="100" height="100" rx="6" fill="#07090e" stroke="url(#greenGlow)" stroke-width="1.5" stroke-dasharray="6,4" />
        <path d="M 135 150 H 105 M 265 150 H 295 M 200 85 V 55 M 200 215 V 245" stroke="#00ff9d" stroke-width="2" />
        <circle cx="100" cy="150" r="4" fill="#00ff9d" />
        <circle cx="300" cy="150" r="4" fill="#00ff9d" />
        <circle cx="200" cy="50" r="4" fill="#b026ff" />
        <circle cx="200" cy="250" r="4" fill="#b026ff" />
      `;
      break;
    case 'energy':
      centerGeometry = `
        <polygon points="200,60 230,130 300,150 230,170 200,240 170,170 100,150 170,130" fill="url(#portalGradient)" stroke="url(#greenGlow)" stroke-width="2" />
        <circle cx="200" cy="150" r="45" fill="none" stroke="url(#violetGlow)" stroke-width="2" stroke-dasharray="8,4" />
        <polygon points="200,85 218,135 265,150 218,165 200,215 182,165 135,150 182,135" fill="none" stroke="#fbbf24" stroke-width="1.5" />
      `;
      break;
    case 'balance':
      centerGeometry = `
        <polygon points="200,65 285,150 200,235 115,150" fill="url(#portalGradient)" stroke="url(#violetGlow)" stroke-width="2" />
        <circle cx="200" cy="150" r="55" fill="none" stroke="url(#greenGlow)" stroke-width="1.5" stroke-dasharray="5,5" />
        <circle cx="150" cy="150" r="22" fill="#07090e" stroke="#00ff9d" stroke-width="1.5" />
        <circle cx="250" cy="150" r="22" fill="#07090e" stroke="#b026ff" stroke-width="1.5" />
        <line x1="120" y1="150" x2="280" y2="150" stroke="#fbbf24" stroke-width="1.5" />
      `;
      break;
    case 'corporate':
      centerGeometry = `
        <rect x="130" y="80" width="140" height="140" fill="none" stroke="url(#violetGlow)" stroke-width="2" />
        <polygon points="200,80 270,150 200,220 130,150" fill="url(#portalGradient)" stroke="url(#greenGlow)" stroke-width="1.5" />
        <circle cx="200" cy="150" r="40" fill="#07090e" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4" />
        <line x1="130" y1="80" x2="270" y2="220" stroke="#00ff9d" stroke-width="1" stroke-opacity="0.3" />
        <line x1="270" y1="80" x2="130" y2="220" stroke="#b026ff" stroke-width="1" stroke-opacity="0.3" />
      `;
      break;
    case 'celestial':
      centerGeometry = `
        <circle cx="200" cy="150" r="68" fill="url(#portalGradient)" stroke="url(#violetGlow)" stroke-width="2" />
        <path d="M 200 82 A 68 68 0 0 1 200 218 A 50 50 0 0 0 200 82 Z" fill="#b026ff" fill-opacity="0.25" stroke="#c084fc" stroke-width="1.5" />
        <circle cx="200" cy="150" r="48" fill="none" stroke="url(#greenGlow)" stroke-width="1.5" stroke-dasharray="6,4" />
        <circle cx="200" cy="95" r="4" fill="#fbbf24" />
        <circle cx="200" cy="205" r="4" fill="#fbbf24" />
        <circle cx="145" cy="150" r="4" fill="#00ff9d" />
        <circle cx="255" cy="150" r="4" fill="#00ff9d" />
      `;
      break;
    case 'crown':
      centerGeometry = `
        <polygon points="200,60 275,115 245,215 155,215 125,115" fill="url(#portalGradient)" stroke="url(#violetGlow)" stroke-width="2" />
        <polygon points="200,85 250,125 230,195 170,195 150,125" fill="none" stroke="#fbbf24" stroke-width="1.5" />
        <circle cx="200" cy="150" r="38" fill="#07090e" stroke="url(#greenGlow)" stroke-width="2" />
      `;
      break;
    case 'shield':
      centerGeometry = `
        <polygon points="200,65 270,105 270,175 200,235 130,175 130,105" fill="url(#portalGradient)" stroke="url(#greenGlow)" stroke-width="2" />
        <polygon points="200,90 248,118 248,168 200,210 152,168 152,118" fill="none" stroke="url(#violetGlow)" stroke-width="1.5" stroke-dasharray="5,4" />
        <circle cx="200" cy="150" r="32" fill="#07090e" stroke="#00ff9d" stroke-width="2" />
      `;
      break;
    default: // rings
      centerGeometry = `
        <circle cx="200" cy="150" r="75" fill="url(#portalGradient)" stroke="url(#violetGlow)" stroke-width="2" />
        <circle cx="200" cy="150" r="55" fill="none" stroke="url(#greenGlow)" stroke-width="1.5" stroke-dasharray="6,4" />
        <polygon points="200,85 246,118 246,182 200,215 154,182 154,118" fill="none" stroke="#fbbf24" stroke-width="1.5" />
        <circle cx="200" cy="150" r="35" fill="#07090e" stroke="#b026ff" stroke-width="2" />
      `;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" shape-rendering="geometricPrecision">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#140a28" />
      <stop offset="55%" stop-color="#090b14" />
      <stop offset="100%" stop-color="#05060a" />
    </radialGradient>

    <!-- Neon Glow Filters -->
    <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <linearGradient id="violetGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d946ef" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>

    <linearGradient id="greenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00ff9d" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>

    <radialGradient id="portalGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#241242" stop-opacity="0.9" />
      <stop offset="70%" stop-color="#0f172a" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#05070f" stop-opacity="0.95" />
    </radialGradient>
  </defs>

  <!-- Card Canvas Background -->
  <rect x="0" y="0" width="400" height="300" fill="url(#bgGlow)" />

  <!-- Outer Ornate Tarot Border -->
  <rect x="12" y="12" width="376" height="276" rx="8" fill="none" stroke="#251b3d" stroke-width="2" />
  <rect x="18" y="18" width="364" height="264" rx="6" fill="none" stroke="url(#violetGlow)" stroke-width="1.2" stroke-opacity="0.65" />

  <!-- Corner Brackets -->
  <path d="M 14 34 V 14 H 34" fill="none" stroke="#00ff9d" stroke-width="2.5" />
  <path d="M 386 34 V 14 H 366" fill="none" stroke="#00ff9d" stroke-width="2.5" />
  <path d="M 14 266 V 286 H 34" fill="none" stroke="#00ff9d" stroke-width="2.5" />
  <path d="M 386 266 V 286 H 366" fill="none" stroke="#00ff9d" stroke-width="2.5" />

  <!-- Corner Diamond Accents -->
  <polygon points="34,24 40,30 34,36 28,30" fill="#fbbf24" />
  <polygon points="366,24 372,30 366,36 360,30" fill="#fbbf24" />
  <polygon points="34,264 40,270 34,276 28,270" fill="#fbbf24" />
  <polygon points="366,264 372,270 366,276 360,270" fill="#fbbf24" />

  <!-- Ambient Micro-Circuit Lines -->
  <path d="M 45 40 H 90 L 110 60 H 140" fill="none" stroke="#00ff9d" stroke-width="1" stroke-opacity="0.3" />
  <path d="M 355 40 H 310 L 290 60 H 260" fill="none" stroke="#b026ff" stroke-width="1" stroke-opacity="0.3" />
  <path d="M 45 260 H 90 L 110 240 H 140" fill="none" stroke="#b026ff" stroke-width="1" stroke-opacity="0.3" />
  <path d="M 355 260 H 310 L 290 240 H 260" fill="none" stroke="#00ff9d" stroke-width="1" stroke-opacity="0.3" />

  <!-- Cardinal Node Dots -->
  <circle cx="200" cy="28" r="3" fill="#00ff9d" />
  <circle cx="200" cy="272" r="3" fill="#00ff9d" />
  <circle cx="26" cy="150" r="3" fill="#b026ff" />
  <circle cx="374" cy="150" r="3" fill="#b026ff" />

  <!-- Outer Orbiting Dashed Ring -->
  <circle cx="200" cy="150" r="95" fill="none" stroke="url(#violetGlow)" stroke-width="1.2" stroke-dasharray="4,6" stroke-opacity="0.6" filter="url(#neonBlur)" />

  <!-- Center Specialized Geometry -->
  <g filter="url(#neonBlur)">
    ${centerGeometry}
  </g>

  <!-- Central Vibe Emoji Avatar -->
  <g transform="translate(200, 150)">
    <circle cx="0" cy="0" r="26" fill="#05070c" stroke="url(#greenGlow)" stroke-width="1.5" />
    <text x="0" y="8" font-size="28" text-anchor="middle" dominant-baseline="central" style="filter: drop-shadow(0 0 8px rgba(0,255,157,0.7));">${emoji}</text>
  </g>
</svg>
`.trim();
}

/**
 * Returns a data URL string suitable for <img src="..."> or canvas image loading
 */
export function generateCardArtDataUrl(vibeEmoji = '🔮', archetype = 'The Digital Wanderer', theme = 'Destiny') {
  const svg = generateCardArtSvg(vibeEmoji, archetype, theme);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
