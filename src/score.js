/**
 * src/score.js
 * Computes an "Uniqueness / Trackability Score" (0 - 100)
 * reflecting how identifiable a visitor's configuration is to advertising trackers.
 */

export function calculateTrackabilityScore(fingerprint) {
  let score = 40; // baseline score for any modern web browser

  // High hardware concurrency is rare on standard consumer boxes
  if (fingerprint.cores >= 16) score += 12;
  else if (fingerprint.cores >= 8) score += 8;

  // Screen resolution uniqueness
  const [w, h] = fingerprint.resolution.split('x').map(Number);
  if (w > 1920 || h > 1080) {
    score += 10; // Ultrawide or 4K setups are very distinctive
  } else if (fingerprint.pixelRatio > 1.5) {
    score += 6; // Retina / HiDPI
  }

  // Device memory reporting
  if (fingerprint.deviceMemory && !fingerprint.deviceMemory.includes('<=4GB')) {
    score += 6;
  }

  // GPU specificity
  if (fingerprint.gpuRenderer && !fingerprint.gpuRenderer.includes('Generic')) {
    score += 14;
  }

  // Battery API availability (leaks exact charge cycle and level)
  if (fingerprint.batteryStatus !== null) {
    score += 10;
  }

  // Do Not Track flag (ironically makes users more unique because few turn it on)
  if (fingerprint.doNotTrack) {
    score += 5;
  }

  // Mobile vs Desktop
  if (fingerprint.isMobile) {
    score += 4;
  }

  // Clamp score between 15 and 99
  score = Math.min(99, Math.max(25, score));

  let label = 'MODERATE EXPOSURE';
  let tier = 'common';

  if (score >= 80) {
    label = 'CRITICAL DIGITAL FOOTPRINT';
    tier = 'hyper-unique';
  } else if (score >= 60) {
    label = 'DISTINCTIVE SIGNAL';
    tier = 'elevated';
  } else {
    label = 'MASS-MARKET PROFILE';
    tier = 'standard';
  }

  return {
    value: score,
    label,
    tier,
    uniquenessPercent: `${score}% identifiable`
  };
}
