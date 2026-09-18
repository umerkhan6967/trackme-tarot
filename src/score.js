/**
 * src/score.js
 * 
 * Computes an "Exposure Score" (0 to 100) based on passive browser signals.
 * Evaluates how identifiable and unshielded a visitor's browser footprint is to trackers.
 * 
 * Returns:
 * {
 *   score: number (0-100),
 *   level: 'Low' | 'Medium' | 'High' | 'Very High',
 *   breakdown: Array<{ label: string, points: number, why: string }>
 * }
 */

export function calculateExposureScore(data) {
  const signals = data?.signals || data || {};
  let totalScore = 10; // Baseline entry score for standard browser runtime
  const breakdown = [];

  // 1. Canvas Fingerprint Availability
  const canvasHash = signals.canvasHash || data?.canvasHash;
  if (canvasHash && canvasHash !== 'unknown') {
    const points = 18;
    totalScore += points;
    breakdown.push({
      label: 'Canvas Fingerprint Exposed',
      points: `+${points}`,
      why: '2D graphics rendering nuances generate an instant device hash without cookies.'
    });
  }

  // 2. System Fonts Inventory
  const fontCount = signals.fonts?.installedCount ?? data?.fontsInstalledCount ?? 0;
  if (fontCount >= 18) {
    const points = 16;
    totalScore += points;
    breakdown.push({
      label: 'Distinctive Font Matrix',
      points: `+${points}`,
      why: `${fontCount} common system fonts detected, isolating your profile into a narrow demographic slice.`
    });
  } else if (fontCount >= 10) {
    const points = 10;
    totalScore += points;
    breakdown.push({
      label: 'Font Inventory Profile',
      points: `+${points}`,
      why: `${fontCount} fonts detected, contributing noticeable uniqueness to canvas text measurement.`
    });
  }

  // 3. Battery API Exposure
  const hasBattery = (signals.battery && signals.battery !== 'unsupported' && signals.battery !== 'unknown') || (data?.batteryStatus !== null && data?.batteryStatus !== undefined);
  if (hasBattery) {
    const points = 14;
    totalScore += points;
    breakdown.push({
      label: 'Live Battery Telemetry',
      points: `+${points}`,
      why: 'Real-time battery percentage and charging cycles allow cross-tab session stitching.'
    });
  }

  // 4. Ad Blocker Defense
  const adBlocker = signals.privacy?.adBlockerDetected ?? data?.adBlockerDetected;
  if (adBlocker === false) {
    const points = 15;
    totalScore += points;
    breakdown.push({
      label: 'No Ad-Blocker Active',
      points: `+${points}`,
      why: 'Third-party tracking beacons and commercial pixel scripts load with zero friction.'
    });
  }

  // 5. Do Not Track (DNT) Header
  const dnt = signals.privacy?.doNotTrack ?? data?.doNotTrack;
  if (dnt !== true) {
    const points = 10;
    totalScore += points;
    breakdown.push({
      label: 'Do-Not-Track Disabled',
      points: `+${points}`,
      why: 'Your browser sends no opt-out preference flag to advertising data brokers.'
    });
  }

  // 6. Precise Screen Size & Retina DPI
  const res = signals.screen?.resolution ?? data?.resolution ?? '1920x1080';
  const pixelRatio = signals.screen?.pixelRatio ?? data?.pixelRatio ?? 1;
  const [w, h] = res.split('x').map(Number);
  if ((w && w >= 1920) || pixelRatio > 1.2) {
    const points = 10;
    totalScore += points;
    breakdown.push({
      label: 'Precision Display Geometry',
      points: `+${points}`,
      why: `High-DPI scaling (${pixelRatio}x) and ${res} resolution form an exact physical viewport signature.`
    });
  }

  // 7. Hardware Architecture (Cores & RAM)
  const cores = signals.hardware?.cores ?? data?.cores ?? 4;
  if (typeof cores === 'number' && cores >= 8) {
    const points = 8;
    totalScore += points;
    breakdown.push({
      label: 'High-Thread Concurrency',
      points: `+${points}`,
      why: `${cores} CPU execution threads reveal high-end hardware classification.`
    });
  }

  // 8. Network Connection API
  const conn = signals.connection;
  if (conn && conn !== 'unsupported' && conn !== 'unknown') {
    const points = 5;
    totalScore += points;
    breakdown.push({
      label: 'Network Information API',
      points: `+${points}`,
      why: 'Effective connection speed and latency reveal ISP transport characteristics.'
    });
  }

  // Clamp score between 0 and 100
  const score = Math.min(100, Math.max(0, totalScore));

  // Determine Level: 'Low' | 'Medium' | 'High' | 'Very High'
  let level = 'Medium';
  if (score >= 80) level = 'Very High';
  else if (score >= 60) level = 'High';
  else if (score >= 35) level = 'Medium';
  else level = 'Low';

  return {
    score,
    level,
    breakdown,
    // Backward compatibility aliases
    value: score,
    label: `${level.toUpperCase()} EXPOSURE`,
    tier: level.toLowerCase()
  };
}

// Backward-compatible alias
export const calculateTrackabilityScore = calculateExposureScore;
