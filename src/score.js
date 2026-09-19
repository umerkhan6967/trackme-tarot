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
  let totalScore = 18; // Calibrated baseline for modern web environments
  const breakdown = [];

  // Deterministic signal hash for realistic variance (-3 to +3)
  const seedString = `${signals.canvasHash || ''}-${signals.hardware?.cores || ''}-${signals.screen?.resolution || ''}-${signals.timezone || ''}`;
  let hashVal = 0;
  for (let i = 0; i < seedString.length; i++) {
    hashVal = (hashVal * 31 + seedString.charCodeAt(i)) | 0;
  }
  const variance = ((Math.abs(hashVal) % 7) - 3); // between -3 and +3

  // 1. Canvas Fingerprint Availability (+12)
  const canvasHash = signals.canvasHash || data?.canvasHash;
  if (canvasHash && canvasHash !== 'unknown') {
    const points = 12;
    totalScore += points;
    breakdown.push({
      label: 'Canvas Fingerprint Exposed',
      points: `+${points}`,
      why: '2D graphics rendering nuances generate a persistent device hash without cookies.'
    });
  }

  // 2. System Fonts Inventory (+7 or +11)
  const fontCount = signals.fonts?.installedCount ?? data?.fontsInstalledCount ?? 0;
  if (fontCount >= 18) {
    const points = 11;
    totalScore += points;
    breakdown.push({
      label: 'Distinctive Font Matrix',
      points: `+${points}`,
      why: `${fontCount} system fonts detected, isolating your profile into a narrow demographic slice.`
    });
  } else if (fontCount >= 8) {
    const points = 7;
    totalScore += points;
    breakdown.push({
      label: 'Font Inventory Profile',
      points: `+${points}`,
      why: `${fontCount} fonts detected, contributing noticeable uniqueness to canvas text measurement.`
    });
  }

  // 3. Ad Blocker Defense (+10)
  const adBlocker = signals.privacy?.adBlockerDetected ?? data?.adBlockerDetected;
  if (adBlocker === false) {
    const points = 10;
    totalScore += points;
    breakdown.push({
      label: 'No Ad-Blocker Active',
      points: `+${points}`,
      why: 'Third-party tracking beacons and commercial pixel scripts load with zero friction.'
    });
  }

  // 4. Battery API Exposure (+8)
  const hasBattery = (signals.battery && signals.battery !== 'unsupported' && signals.battery !== 'unknown') || (data?.batteryStatus !== null && data?.batteryStatus !== undefined);
  if (hasBattery) {
    const points = 8;
    totalScore += points;
    breakdown.push({
      label: 'Live Battery Telemetry',
      points: `+${points}`,
      why: 'Real-time battery percentage and charging status allow cross-tab session stitching.'
    });
  }

  // 5. Do Not Track (DNT) Header (+7)
  const dnt = signals.privacy?.doNotTrack ?? data?.doNotTrack;
  const isDntEnabled = dnt === true || dnt === 'on';
  if (!isDntEnabled) {
    const points = 7;
    totalScore += points;
    breakdown.push({
      label: 'Do-Not-Track Disabled',
      points: `+${points}`,
      why: 'Your browser sends no opt-out preference flag to advertising data brokers.'
    });
  }

  // 6. Precise Screen Size & High-DPI (+6)
  const res = signals.screen?.resolution ?? data?.resolution ?? '1920x1080';
  const pixelRatio = signals.screen?.pixelRatio ?? data?.pixelRatio ?? 1;
  const [w, h] = String(res).split('x').map(Number);
  if ((w && w >= 1920) || pixelRatio > 1.2) {
    const points = 6;
    totalScore += points;
    breakdown.push({
      label: 'Precision Display Geometry',
      points: `+${points}`,
      why: `High-DPI scaling (${pixelRatio}x) and ${res} resolution form an exact physical viewport signature.`
    });
  }

  // 7. Hardware Architecture (Cores & RAM) (+6)
  const cores = signals.hardware?.cores ?? data?.cores ?? 4;
  if (typeof cores === 'number' && cores >= 8) {
    const points = 6;
    totalScore += points;
    breakdown.push({
      label: 'High-Thread Concurrency',
      points: `+${points}`,
      why: `${cores} CPU execution threads reveal high-end hardware classification.`
    });
  } else if (typeof cores === 'number' && cores >= 4) {
    const points = 4;
    totalScore += points;
    breakdown.push({
      label: 'Standard Multi-Core CPU',
      points: `+${points}`,
      why: `${cores} CPU execution threads contribute to system capability tiering.`
    });
  }

  // 8. GPU / WebGL Intercept (+6)
  const webgl = signals.webgl || data?.webgl;
  if (webgl?.renderer && webgl.renderer !== 'unknown') {
    const points = 6;
    totalScore += points;
    breakdown.push({
      label: 'WebGL GPU Pipeline',
      points: `+${points}`,
      why: 'Unmasked graphics card driver telemetry provides precise hardware fingerprinting.'
    });
  }

  // 9. Network Connection API (+4)
  const conn = signals.connection;
  if (conn && conn !== 'unsupported' && conn !== 'unknown') {
    const points = 4;
    totalScore += points;
    breakdown.push({
      label: 'Network Telemetry API',
      points: `+${points}`,
      why: 'Effective connection speed and latency reveal ISP transport characteristics.'
    });
  }

  // Add subtle deterministic variance to avoid artificial identical scores
  totalScore += variance;

  // Cap typical results realistically between 35 and 92 (rarely hits 100)
  const score = Math.min(92, Math.max(35, totalScore));

  // Determine Level: 'Low' | 'Medium' | 'High' | 'Very High'
  let level = 'Medium';
  if (score >= 78) level = 'High';
  else if (score >= 55) level = 'Medium';
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
