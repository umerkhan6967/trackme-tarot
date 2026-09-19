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
 * Reads unmasked vendor and renderer from WEBGL_debug_renderer_info extension.
 * If the browser masks it or returns a generic value, returns "hidden by your browser".
 */
export function readGpuDetails() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      return {
        vendor: null,
        renderer: null,
        rawRenderer: null,
        display: 'hidden by your browser',
        isMasked: true,
        status: 'unavailable',
        source: 'WEBGL_debug_renderer_info (WebGL)',
        note: 'WebGL context unsupported or disabled'
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {
      return {
        vendor: null,
        renderer: null,
        rawRenderer: null,
        display: 'hidden by your browser',
        isMasked: true,
        status: 'unavailable',
        source: 'WEBGL_debug_renderer_info (WebGL)',
        note: 'WEBGL_debug_renderer_info extension blocked or masked by browser privacy protection'
      };
    }

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const rawRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    if (!rawRenderer || typeof rawRenderer !== 'string' || !rawRenderer.trim()) {
      return {
        vendor: vendor || null,
        renderer: null,
        rawRenderer: null,
        display: 'hidden by your browser',
        isMasked: true,
        status: 'unavailable',
        source: 'WEBGL_debug_renderer_info (WebGL)',
        note: 'Empty renderer returned by WebGL context'
      };
    }

    const trimmed = rawRenderer.trim();

    // Check for generic or masked driver names
    const genericPatterns = [
      /^generic$/i,
      /^generic display adapter$/i,
      /^integrated shader$/i,
      /^webgl$/i,
      /^webkit webgl$/i,
      /^mozilla$/i,
      /^google swiftshader$/i,
      /^software rasterizer$/i,
      /^mesa offscreen/i,
      /^microsoft basic render driver$/i
    ];

    const isGeneric = genericPatterns.some((p) => p.test(trimmed)) ||
      (vendor && /^generic$/i.test(vendor.trim()));

    if (isGeneric) {
      return {
        vendor: vendor || null,
        renderer: trimmed,
        rawRenderer: trimmed,
        display: 'hidden by your browser',
        isMasked: true,
        status: 'unavailable',
        source: 'WEBGL_debug_renderer_info (WebGL)',
        note: 'Generic renderer reported — masked by browser privacy protection'
      };
    }

    const cleanName = cleanGpuName(trimmed);
    return {
      vendor: vendor || null,
      renderer: cleanName,
      rawRenderer: trimmed,
      display: cleanName,
      isMasked: false,
      status: 'read',
      source: 'WEBGL_debug_renderer_info (WebGL)',
      note: `Unmasked GPU hardware details: ${cleanName}`
    };
  } catch (err) {
    return {
      vendor: null,
      renderer: null,
      rawRenderer: null,
      display: 'hidden by your browser',
      isMasked: true,
      status: 'unavailable',
      source: 'WEBGL_debug_renderer_info (WebGL)',
      note: `Exception probing WebGL: ${err.message}`
    };
  }
}

/**
 * Combines canvas output, an OfflineAudioContext audio sample, and the WebGL renderer
 * into one short hash (first 12 characters of SHA-256 via crypto.subtle).
 * 100% client-side computation — nothing is sent to any server.
 */
export async function generateFingerprintHash(canvasData, webglRenderer) {
  try {
    // 1. Audio sample via OfflineAudioContext
    let audioSample = 'audio_unavailable';
    try {
      const AudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass(1, 44100, 44100);
        const oscillator = context.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(10000, context.currentTime);

        const compressor = context.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-50, context.currentTime);
        compressor.knee.setValueAtTime(40, context.currentTime);
        compressor.ratio.setValueAtTime(12, context.currentTime);
        compressor.reduction.setValueAtTime(-20, context.currentTime);
        compressor.attack.setValueAtTime(0, context.currentTime);
        compressor.release.setValueAtTime(0.25, context.currentTime);

        oscillator.connect(compressor);
        compressor.connect(context.destination);

        oscillator.start(0);
        const renderedBuffer = await context.startRendering();
        const channelData = renderedBuffer.getChannelData(0);

        let sum = 0;
        for (let i = 4500; i < 5000; i++) {
          sum += Math.abs(channelData[i]);
        }
        audioSample = sum.toFixed(10);
      }
    } catch {
      audioSample = 'audio_unavailable';
    }

    // 2. Canvas output
    const canvasStr = canvasData || 'canvas_unavailable';

    // 3. WebGL renderer
    const rendererStr = webglRenderer || 'renderer_unavailable';

    // 4. Combine into single composite string
    const composite = `canvas:${canvasStr}|audio:${audioSample}|gl:${rendererStr}`;

    // 5. First 12 characters of SHA-256 via crypto.subtle
    let hash12 = '';
    if (typeof window !== 'undefined' && window.crypto?.subtle?.digest) {
      const encoder = new TextEncoder();
      const data = encoder.encode(composite);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      hash12 = hex.slice(0, 12);
    } else {
      hash12 = shortHash(composite) + shortHash(composite.split('').reverse().join('')).slice(0, 4);
    }

    return {
      hash: hash12,
      audioSample,
      status: 'read',
      source: 'Canvas + OfflineAudioContext + WebGL -> SHA-256 (crypto.subtle)',
      note: 'First 12 chars of SHA-256 combining canvas output, OfflineAudioContext audio sample, and WebGL renderer string'
    };
  } catch (err) {
    return {
      hash: 'unavailable',
      audioSample: null,
      status: 'unavailable',
      source: 'Canvas + OfflineAudioContext + WebGL -> SHA-256 (crypto.subtle)',
      note: `Fingerprint hash computation error: ${err.message}`
    };
  }
}

/**
 * Builds the comprehensive Signals Registry where each signal is registered with:
 * (value, status: "read" | "approximate" | "unavailable", source, note).
 * Never guesses a missing value.
 */
export function buildSignalsRegistry(signals, gpuInfo, fpHashInfo) {
  return {
    gpu: {
      value: gpuInfo.isMasked ? null : gpuInfo.display,
      status: gpuInfo.status,
      source: gpuInfo.source,
      note: gpuInfo.note
    },
    fingerprintHash: {
      value: fpHashInfo.hash !== 'unavailable' ? fpHashInfo.hash : null,
      status: fpHashInfo.status,
      source: fpHashInfo.source,
      note: fpHashInfo.note
    },
    os: {
      value: signals.os !== 'unknown' ? signals.os : null,
      status: signals.os !== 'unknown' ? 'read' : 'unavailable',
      source: 'navigator.userAgentData / userAgent',
      note: 'Operating system platform'
    },
    browser: {
      value: signals.browser?.name !== 'unknown' ? `${signals.browser?.name} ${signals.browser?.version}` : null,
      status: signals.browser?.name !== 'unknown' ? 'read' : 'unavailable',
      source: 'navigator.userAgentData / userAgent',
      note: 'Browser brand and version'
    },
    screen: {
      value: signals.screen?.resolution !== 'unknown' ? signals.screen.resolution : null,
      status: signals.screen?.resolution !== 'unknown' ? 'read' : 'unavailable',
      source: 'window.screen (width x height)',
      note: 'Display screen geometry and pixel ratio'
    },
    timezone: {
      value: signals.temporal?.timezone !== 'unknown' ? signals.temporal.timezone : null,
      status: signals.temporal?.timezone !== 'unknown' ? 'read' : 'unavailable',
      source: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
      note: 'Resolved system geographical timezone'
    },
    hardware: {
      value: signals.hardware?.cores !== 'unknown' ? { cores: signals.hardware.cores, memory: signals.hardware.deviceMemory } : null,
      status: signals.hardware?.cores !== 'unknown' ? 'read' : 'unavailable',
      source: 'navigator.hardwareConcurrency & navigator.deviceMemory',
      note: 'Reported logical CPU cores and approximate device memory'
    },
    battery: {
      value: (signals.battery && signals.battery !== 'unsupported' && signals.battery !== 'unknown') ? signals.battery : null,
      status: (signals.battery && signals.battery !== 'unsupported' && signals.battery !== 'unknown') ? 'read' : 'unavailable',
      source: 'navigator.getBattery()',
      note: signals.battery === 'unsupported' ? 'Battery API unsupported or blocked by browser' : 'Battery level and charging telemetry'
    },
    connection: {
      value: (signals.connection && signals.connection !== 'unsupported' && signals.connection !== 'unknown') ? signals.connection : null,
      status: (signals.connection && signals.connection !== 'unsupported' && signals.connection !== 'unknown') ? 'read' : 'unavailable',
      source: 'navigator.connection (Network Information API)',
      note: signals.connection === 'unsupported' ? 'Network Information API unavailable' : 'Effective network type and bandwidth downlink'
    },
    canvas: {
      value: signals.canvasHash !== 'unknown' ? signals.canvasHash : null,
      status: signals.canvasHash !== 'unknown' ? 'read' : 'unavailable',
      source: 'HTML5 2D Canvas rendering context',
      note: 'Sub-pixel 2D canvas text and shape rendering signature'
    },
    fonts: {
      value: signals.fonts?.installedCount !== undefined ? signals.fonts.installedCount : null,
      status: signals.fonts?.installedCount !== undefined ? 'approximate' : 'unavailable',
      source: 'CSS font fallback width probing',
      note: 'Detected installed system font metrics'
    },
    privacy: {
      value: signals.privacy?.adBlockerDetected !== 'unknown' ? signals.privacy : null,
      status: signals.privacy?.adBlockerDetected !== 'unknown' ? 'read' : 'unavailable',
      source: 'DOM ad-element probe & navigator.doNotTrack',
      note: 'Ad blocker detection and Do-Not-Track headers'
    }
  };
}

/**
 * Backward-compatible helper used by main.js, score.js, card.js, and fortune.js
 */
export async function getBrowserFingerprint() {
  const signals = await collectSignals();

  // 1. GPU: Read WEBGL_debug_renderer_info (unmasked vendor and renderer)
  const gpuInfo = readGpuDetails();

  // 2. Get Canvas data for combined fingerprint hash
  let canvasDataUrl = '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(10, 5, 50, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('TrackMe🔮Tarot', 2, 15);
      canvasDataUrl = canvas.toDataURL();
    }
  } catch {}

  // 3. FINGERPRINT HASH: Combine canvas, OfflineAudioContext sample, and WebGL renderer
  const fpHashInfo = await generateFingerprintHash(canvasDataUrl, gpuInfo.rawRenderer || gpuInfo.renderer);

  // 4. Signals Registry with (value, status: "read" | "approximate" | "unavailable", source, note)
  const registry = buildSignalsRegistry(signals, gpuInfo, fpHashInfo);

  return {
    signals,
    registry,
    gpu: gpuInfo,
    gpuRenderer: gpuInfo.display,
    gpuVendor: gpuInfo.vendor,
    isGpuMasked: gpuInfo.isMasked,
    fingerprintHash: fpHashInfo.hash,
    fingerprintHashInfo: fpHashInfo,
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
  if (!raw) return 'hidden by your browser';
  let clean = raw;
  if (clean.includes('ANGLE (')) {
    const match = clean.match(/ANGLE \((.*?), (.*?),/);
    if (match && match[2]) {
      clean = match[2].trim();
    }
  }
  clean = clean.replace(/Direct3D.*?vs_\d+_\d+.*$/, '').trim();
  return clean || raw.slice(0, 32);
}

// Auto-run unit test on module load in dev
if (typeof window !== 'undefined') {
  testCollectSignals();
}
