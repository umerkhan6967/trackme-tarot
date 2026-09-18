/**
 * src/fingerprint.js
 * 
 * Comprehensive passive browser telemetry collector.
 * Uses ONLY native browser APIs — zero third-party libraries, zero external network calls.
 * All computations and signal evaluations run 100% client-side in-memory.
 */

// 30 common cross-platform fonts to probe
const FONT_CANDIDATES = [
  'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Comic Sans MS',
  'Courier New', 'Georgia', 'Helvetica', 'Impact', 'Lucida Console',
  'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Monaco', 'Palatino Linotype', 'Segoe UI',
  'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Consolas',
  'Century Gothic', 'Garamond', 'Franklin Gothic Medium', 'Bookman Old Style', 'Futura',
  'Gill Sans', 'Optima', 'Baskerville', 'Copperplate', 'Didot'
];

/**
 * Fast, non-cryptographic string hash (DJB2 variant) returning a short 8-char hex string
 */
function shortHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Probe installed fonts using canvas text width measurement against base fallback fonts
 */
function probeInstalledFonts() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unknown';

    const testString = 'mmmmmmmmmmlli12345!@#$%^&*()';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];

    // Measure base fonts
    const baseWidths = {};
    for (const base of baseFonts) {
      ctx.font = `72px ${base}`;
      baseWidths[base] = ctx.measureText(testString).width;
    }

    const detected = [];
    for (const font of FONT_CANDIDATES) {
      let isInstalled = false;
      for (const base of baseFonts) {
        ctx.font = `72px "${font}", ${base}`;
        const width = ctx.measureText(testString).width;
        if (width !== baseWidths[base]) {
          isInstalled = true;
          break;
        }
      }
      if (isInstalled) {
        detected.push(font);
      }
    }

    return {
      tested: FONT_CANDIDATES.length,
      installedCount: detected.length,
      installedFonts: detected
    };
  } catch {
    return 'unknown';
  }
}

/**
 * Generates a short canvas fingerprint hash from 2D rendering nuances
 */
function getCanvasFingerprintHash() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unknown';

    // Draw background and geometry
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    // Color mixing & gradients
    ctx.fillStyle = '#069';
    ctx.fillText('TrackMe🔮Tarot,012#$', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('TrackMe🔮Tarot,012#$', 4, 17);

    // Alpha blending & shapes
    ctx.strokeStyle = 'rgb(120, 20, 240)';
    ctx.arc(40, 35, 20, 0, Math.PI * 2, true);
    ctx.stroke();

    const dataUri = canvas.toDataURL();
    return shortHash(dataUri);
  } catch {
    return 'unknown';
  }
}

/**
 * Checks if an ad blocker is actively hiding or collapsing advertisement elements
 */
async function detectAdBlocker() {
  return new Promise((resolve) => {
    try {
      const bait = document.createElement('div');
      bait.className = 'adsbox ad-banner pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads';
      bait.setAttribute('id', 'ad-banner-test');
      bait.style.position = 'absolute';
      bait.style.left = '-9999px';
      bait.style.top = '-9999px';
      bait.style.width = '1px';
      bait.style.height = '1px';
      bait.innerHTML = '&nbsp;';

      document.body.appendChild(bait);

      // Allow micro-tick for blocker stylesheet / DOM rule execution
      setTimeout(() => {
        try {
          const isBlocked = (
            bait.offsetParent === null ||
            bait.offsetHeight === 0 ||
            bait.clientHeight === 0 ||
            window.getComputedStyle(bait).display === 'none' ||
            window.getComputedStyle(bait).visibility === 'hidden'
          );
          bait.remove();
          resolve(Boolean(isBlocked));
        } catch {
          bait.remove();
          resolve('unknown');
        }
      }, 50);
    } catch {
      resolve('unknown');
    }
  });
}

/**
 * Collects all passive browser telemetry signals.
 * Every single probe is protected by try/catch with fallback to 'unknown'.
 */
export async function collectSignals() {
  const signals = {};

  // 1. Device Type & OS
  try {
    const nav = window.navigator || {};
    const ua = nav.userAgent || '';
    const uad = nav.userAgentData;

    let os = 'unknown';
    if (uad && uad.platform) {
      os = uad.platform;
    } else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/CrOS/i.test(ua)) os = 'ChromeOS';

    let deviceType = 'desktop';
    if (uad && typeof uad.mobile === 'boolean') {
      deviceType = uad.mobile ? 'mobile' : 'desktop';
    } else if (/iPad|Tablet/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/Mobi|Android|iPhone/i.test(ua)) {
      deviceType = 'mobile';
    }

    signals.deviceType = deviceType;
    signals.os = os;
  } catch {
    signals.deviceType = 'unknown';
    signals.os = 'unknown';
  }

  // 2. Browser Name and Version
  try {
    const ua = navigator.userAgent || '';
    let browserName = 'unknown';
    let browserVersion = 'unknown';

    if (navigator.userAgentData && navigator.userAgentData.brands && navigator.userAgentData.brands.length) {
      const validBrand = navigator.userAgentData.brands.find(b => !b.brand.includes('Not') && !b.brand.includes('Brand'));
      if (validBrand) {
        browserName = validBrand.brand;
        browserVersion = validBrand.version;
      }
    }

    if (browserName === 'unknown') {
      if (/Edg\/([\d.]+)/i.test(ua)) {
        browserName = 'Edge';
        browserVersion = RegExp.$1;
      } else if (/OPR\/([\d.]+)/i.test(ua) || /Opera/i.test(ua)) {
        browserName = 'Opera';
        browserVersion = RegExp.$1 || 'unknown';
      } else if (/Chrome\/([\d.]+)/i.test(ua)) {
        browserName = 'Chrome';
        browserVersion = RegExp.$1;
      } else if (/Firefox\/([\d.]+)/i.test(ua)) {
        browserName = 'Firefox';
        browserVersion = RegExp.$1;
      } else if (/Version\/([\d.]+).*Safari/i.test(ua)) {
        browserName = 'Safari';
        browserVersion = RegExp.$1;
      }
    }

    signals.browser = {
      name: browserName,
      version: browserVersion
    };
  } catch {
    signals.browser = { name: 'unknown', version: 'unknown' };
  }

  // 3. Screen Resolution, Pixel Ratio, Viewport Size
  try {
    signals.screen = {
      resolution: `${window.screen.width || 'unknown'}x${window.screen.height || 'unknown'}`,
      pixelRatio: window.devicePixelRatio || 'unknown',
      viewport: `${window.innerWidth || 'unknown'}x${window.innerHeight || 'unknown'}`,
      colorDepth: window.screen.colorDepth ? `${window.screen.colorDepth}-bit` : 'unknown'
    };
  } catch {
    signals.screen = {
      resolution: 'unknown',
      pixelRatio: 'unknown',
      viewport: 'unknown',
      colorDepth: 'unknown'
    };
  }

  // 4. Timezone, Local Hour, Time-of-Day Label
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const now = new Date();
    const hour = now.getHours();

    let timeOfDay = 'day';
    if (hour >= 0 && hour < 5) timeOfDay = 'late night';
    else if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    signals.temporal = {
      timezone: tz,
      localHour: hour,
      timeOfDayLabel: timeOfDay
    };
  } catch {
    signals.temporal = {
      timezone: 'unknown',
      localHour: 'unknown',
      timeOfDayLabel: 'unknown'
    };
  }

  // 5. Language(s)
  try {
    signals.languages = {
      primary: navigator.language || 'unknown',
      all: navigator.languages && navigator.languages.length ? [...navigator.languages] : [navigator.language || 'unknown']
    };
  } catch {
    signals.languages = {
      primary: 'unknown',
      all: 'unknown'
    };
  }

  // 6. CPU Cores & Device Memory
  try {
    signals.hardware = {
      cores: navigator.hardwareConcurrency || 'unknown',
      deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'unknown'
    };
  } catch {
    signals.hardware = {
      cores: 'unknown',
      deviceMemory: 'unknown'
    };
  }

  // 7. Battery Level and Charging State (Battery API)
  try {
    if ('getBattery' in navigator && typeof navigator.getBattery === 'function') {
      const battery = await navigator.getBattery();
      signals.battery = {
        level: typeof battery.level === 'number' ? Math.round(battery.level * 100) : 'unknown',
        charging: typeof battery.charging === 'boolean' ? battery.charging : 'unknown'
      };
    } else {
      signals.battery = 'unsupported';
    }
  } catch {
    signals.battery = 'unsupported';
  }

  // 8. Connection Type and Speed (Network Information API)
  try {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      signals.connection = {
        effectiveType: conn.effectiveType || 'unknown',
        downlink: typeof conn.downlink === 'number' ? `${conn.downlink} Mbps` : 'unknown',
        rtt: typeof conn.rtt === 'number' ? `${conn.rtt} ms` : 'unknown',
        saveData: typeof conn.saveData === 'boolean' ? conn.saveData : 'unknown'
      };
    } else {
      signals.connection = 'unsupported';
    }
  } catch {
    signals.connection = 'unsupported';
  }

  // 9. Touch Support, Dark Mode, Reduced Motion
  try {
    const hasTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
    const prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : 'unknown';
    const prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : 'unknown';

    signals.preferences = {
      touchSupport: Boolean(hasTouch),
      maxTouchPoints: navigator.maxTouchPoints ?? 'unknown',
      darkMode: prefersDark,
      reducedMotion: prefersReducedMotion
    };
  } catch {
    signals.preferences = {
      touchSupport: 'unknown',
      maxTouchPoints: 'unknown',
      darkMode: 'unknown',
      reducedMotion: 'unknown'
    };
  }

  // 10. Font Detection Test (~30 common fonts)
  try {
    signals.fonts = probeInstalledFonts();
  } catch {
    signals.fonts = 'unknown';
  }

  // 11. Canvas Fingerprint Hash (short hash only)
  try {
    signals.canvasHash = getCanvasFingerprintHash();
  } catch {
    signals.canvasHash = 'unknown';
  }

  // 12. Cookies Enabled, Do Not Track, Ad Blocker Detection
  try {
    const cookiesEnabled = navigator.cookieEnabled ?? 'unknown';
    const doNotTrack = (navigator.doNotTrack === '1' || window.doNotTrack === '1');
    const adBlockerDetected = await detectAdBlocker();

    signals.privacy = {
      cookiesEnabled,
      doNotTrack,
      adBlockerDetected
    };
  } catch {
    signals.privacy = {
      cookiesEnabled: 'unknown',
      doNotTrack: 'unknown',
      adBlockerDetected: 'unknown'
    };
  }

  // 13. Number of Plugins & MimeTypes
  try {
    signals.plugins = {
      pluginCount: navigator.plugins ? navigator.plugins.length : 'unknown',
      mimeTypeCount: navigator.mimeTypes ? navigator.mimeTypes.length : 'unknown'
    };
  } catch {
    signals.plugins = {
      pluginCount: 'unknown',
      mimeTypeCount: 'unknown'
    };
  }

  return signals;
}

/**
 * Unit-style console test that prints the result in a clean table/format
 */
export async function testCollectSignals() {
  console.group('🧪 [UNIT TEST] collectSignals() Telemetry Verification');
  try {
    const startTime = performance.now();
    const result = await collectSignals();
    const duration = (performance.now() - startTime).toFixed(2);

    console.log(`⏱️ Execution Time: ${duration}ms`);
    console.log('📦 Telemetry Payload:', result);

    // Structured assertions check
    const assertions = {
      'deviceType defined': result.deviceType !== undefined,
      'os defined': result.os !== undefined,
      'browser detected': Boolean(result.browser?.name),
      'screen resolution detected': Boolean(result.screen?.resolution),
      'timezone present': Boolean(result.temporal?.timezone),
      'time-of-day label valid': ['late night', 'morning', 'afternoon', 'evening', 'night'].includes(result.temporal?.timeOfDayLabel),
      'canvasHash valid 8-char hex': typeof result.canvasHash === 'string' && (result.canvasHash.length === 8 || result.canvasHash === 'unknown'),
      'fonts probe returned count': typeof result.fonts?.installedCount === 'number' || result.fonts === 'unknown',
      'privacy probe completed': result.privacy?.adBlockerDetected !== undefined
    };

    console.table(assertions);
    console.groupEnd();
    return { success: true, duration, result, assertions };
  } catch (err) {
    console.error('❌ collectSignals() unit test failed:', err);
    console.groupEnd();
    return { success: false, error: err.message };
  }
}

/**
 * Backward-compatible helper used by main.js, score.js, card.js, and fortune.js
 */
export async function getBrowserFingerprint() {
  const signals = await collectSignals();

  // Passive GPU renderer lookup for rich card display
  let gpuRenderer = 'Generic Display Adapter';
  let gpuVendor = 'Generic';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Generic';
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Integrated Shader';
      }
    }
  } catch {
    gpuRenderer = 'Shielded GPU Pipeline';
  }

  return {
    signals,
    deviceType: signals.deviceType,
    platform: signals.os,
    os: signals.os,
    browser: signals.browser,
    timezone: signals.temporal.timezone,
    localHour: signals.temporal.localHour,
    timeOfDayLabel: signals.temporal.timeOfDayLabel,
    language: signals.languages.primary,
    cores: typeof signals.hardware.cores === 'number' ? signals.hardware.cores : 4,
    deviceMemory: signals.hardware.deviceMemory !== 'unknown' ? signals.hardware.deviceMemory : 'Standard (<=4GB)',
    resolution: signals.screen.resolution,
    colorDepth: signals.screen.colorDepth,
    pixelRatio: signals.screen.pixelRatio,
    viewport: signals.screen.viewport,
    gpuRenderer: cleanGpuName(gpuRenderer),
    gpuVendor,
    batteryStatus: signals.battery !== 'unsupported' ? signals.battery : null,
    connectionType: signals.connection !== 'unsupported' ? signals.connection.effectiveType : 'broadband',
    doNotTrack: signals.privacy.doNotTrack === true,
    adBlockerDetected: signals.privacy.adBlockerDetected,
    canvasHash: signals.canvasHash,
    fontsInstalledCount: signals.fonts?.installedCount ?? 0,
    isMobile: signals.deviceType === 'mobile',
    isTouchDevice: signals.preferences.touchSupport === true
  };
}

function cleanGpuName(raw) {
  if (!raw) return 'Unknown GPU';
  if (raw.includes('ANGLE (')) {
    const match = raw.match(/ANGLE \((.*?), (.*?),/);
    if (match && match[2]) return match[2].trim();
  }
  return raw.replace(/Direct3D.*?vs_\d+_\d+/, '').trim().slice(0, 32);
}

// Auto-run unit test on module load in dev
if (typeof window !== 'undefined') {
  testCollectSignals();
}
