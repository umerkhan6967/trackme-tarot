/**
 * src/fingerprint.js
 * Passive browser telemetry gatherer without any logins or intrusive permissions.
 * Reads what any ordinary web server / ad tracker can passively observe.
 */

export async function getBrowserFingerprint() {
  const nav = window.navigator;
  const screen = window.screen;

  // Timezone & Locale
  let timezone = 'Unknown';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    timezone = 'UTC';
  }
  const language = nav.language || (nav.languages && nav.languages[0]) || 'en-US';

  // Hardware telemetry
  const cores = nav.hardwareConcurrency || 4;
  const deviceMemory = nav.deviceMemory ? `${nav.deviceMemory} GB` : 'Standard (<=4GB)';
  const maxTouchPoints = nav.maxTouchPoints || 0;
  const isTouchDevice = maxTouchPoints > 0;

  // Screen telemetry
  const resolution = `${screen.width}x${screen.height}`;
  const colorDepth = `${screen.colorDepth}-bit`;
  const pixelRatio = window.devicePixelRatio || 1;

  // Platform & Browser agent detection
  const platform = nav.platform || 'Unknown OS';
  const userAgent = nav.userAgent;
  const doNotTrack = nav.doNotTrack === '1' || window.doNotTrack === '1';

  // Passive GPU detection via WebGL unmasked renderer
  let gpuRenderer = 'Generic Display Adapter';
  let gpuVendor = 'Generic';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown';
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Integrated Shader';
      }
    }
  } catch {
    gpuRenderer = 'Shielded GPU Pipeline';
  }

  // Battery detection (passive if supported by Chromium)
  let batteryStatus = null;
  if ('getBattery' in nav) {
    try {
      const battery = await nav.getBattery();
      batteryStatus = {
        level: Math.round(battery.level * 100),
        charging: battery.charging
      };
    } catch {
      batteryStatus = null;
    }
  }

  // Network connection type (if supported)
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  const connectionType = connection ? (connection.effectiveType || connection.type || 'broadband') : 'Unknown Speed';

  // Form factor deduction
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(userAgent) || (isTouchDevice && screen.width < 768);

  return {
    timezone,
    language,
    cores,
    deviceMemory,
    resolution,
    colorDepth,
    pixelRatio,
    platform,
    gpuRenderer: cleanGpuName(gpuRenderer),
    gpuVendor,
    doNotTrack,
    batteryStatus,
    connectionType,
    isMobile,
    isTouchDevice,
    userAgentSnippet: userAgent.substring(0, 50) + '...'
  };
}

/**
 * Strips overly long strings from WebGL renderer names for clean display
 */
function cleanGpuName(raw) {
  if (!raw) return 'Unknown GPU';
  if (raw.includes('ANGLE (')) {
    const match = raw.match(/ANGLE \((.*?), (.*?),/);
    if (match && match[2]) return match[2].trim();
  }
  return raw.replace(/Direct3D.*?vs_\d+_\d+/, '').trim().slice(0, 32);
}

/**
 * Placeholder hook for future font enumeration or audio fingerprinting modules
 */
export function getInstalledFontsProbe() {
  return ['JetBrains Mono', 'System UI', 'Consolas', 'Courier New', 'Arial'];
}
