/**
 * src/identity.js
 * 
 * Evaluates Identity Badges and Rare Archetypes from REAL client signals only.
 * 
 * Strict constraints:
 * - NO percentage (%) or rank claims ("top X%"), as no visitor dataset exists.
 * - Show the badge with the exact rule that triggered it.
 * - Rare cards are labeled "rare card" (NOT a percentage).
 */

/**
 * Normalizes input signals whether flat or nested
 */
function normalizeSignals(signals = {}) {
  const s = signals.signals ? signals.signals : signals;

  // Privacy signals
  const dnt = (s.privacy?.dnt ?? s.privacy?.doNotTrack ?? s.dnt ?? s.doNotTrack ?? 'unavailable');
  const isDntOn = dnt === 'on' || dnt === true || dnt === '1' || dnt === 1;

  const gpc = (s.privacy?.gpc ?? s.privacy?.globalPrivacyControl ?? s.gpc ?? s.globalPrivacyControl ?? 'unavailable');
  const isGpcOn = gpc === 'on' || gpc === true || gpc === '1' || gpc === 1;

  const adBlocker = Boolean(s.privacy?.adBlockerDetected ?? s.adBlockerDetected);
  
  const cookiesRestricted = Boolean(
    s.privacy?.cookiesRestricted ??
    s.cookiesRestricted ??
    (s.privacy?.cookiesEnabled === false) ??
    (s.cookiesEnabled === false)
  );

  const canvasBlockedOrRandomised = Boolean(
    s.privacy?.canvasProtected ??
    s.privacy?.canvasBlocked ??
    s.privacy?.canvasRandomised ??
    s.canvasBlocked ??
    s.canvasRandomised ??
    s.canvasProtected
  );

  // Hardware signals
  const cores = Number(s.hardware?.cores ?? s.cores ?? 0);
  const memoryRaw = s.hardware?.deviceMemory ?? s.deviceMemory ?? '';
  let memoryGb = 0;
  if (typeof memoryRaw === 'number') {
    memoryGb = memoryRaw;
  } else if (typeof memoryRaw === 'string') {
    const match = memoryRaw.match(/(\d+)/);
    if (match) memoryGb = Number(match[1]);
  }

  // Fonts
  const fontsCount = Number(s.fonts?.installedCount ?? s.fontsInstalledCount ?? 0);

  // Temporal
  let hour = s.temporal?.localHour ?? s.localHour;
  const timezone = s.temporal?.timezone ?? s.timezone ?? (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');
  if (hour === undefined || hour === null) {
    if (timezone) {
      try {
        const nowStr = new Date().toLocaleTimeString('en-US', { timeZone: timezone, hour12: false, hour: 'numeric' });
        const parsedHour = parseInt(nowStr, 10);
        if (!isNaN(parsedHour)) hour = parsedHour;
      } catch {}
    }
  }
  if (hour === undefined || hour === null) {
    hour = new Date().getHours();
  }

  // Screen & touch
  const hasTouch = Boolean(
    s.preferences?.touchSupport ??
    s.touchSupport ??
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
  );

  let screenWidth = 1920;
  let screenHeight = 1080;
  const res = s.screen?.resolution ?? s.resolution;
  if (typeof res === 'string' && res.includes('x')) {
    const parts = res.split('x').map(p => Number(p.trim()));
    screenWidth = parts[0] || screenWidth;
    screenHeight = parts[1] || screenHeight;
  } else if (typeof window !== 'undefined' && window.screen) {
    screenWidth = window.screen.width || screenWidth;
    screenHeight = window.screen.height || screenHeight;
  }

  const isSmallScreen = Math.min(screenWidth, screenHeight) <= 768;

  // Automation / Webdriver
  const webdriver = Boolean(
    s.automation?.webdriver ??
    s.webdriver ??
    (typeof navigator !== 'undefined' && navigator.webdriver)
  );
  const isHeadless = Boolean(
    s.automation?.isHeadless ??
    s.isHeadless ??
    (typeof navigator !== 'undefined' && /headlesschrome|phantomjs|puppeteer|playwright|selenium/i.test(navigator.userAgent || ''))
  );

  return {
    isDntOn,
    isGpcOn,
    adBlocker,
    cookiesRestricted,
    canvasBlockedOrRandomised,
    cores,
    memoryGb,
    fontsCount,
    hour: Number(hour),
    timezone,
    hasTouch,
    isSmallScreen,
    webdriver,
    isHeadless
  };
}

/**
 * Determines identity badge (assigns the first that matches, otherwise "The Everyday Browser")
 * 
 * Rules:
 * 1. "The Privacy Monk": Do Not Track or Global Privacy Control on, ad blocker detected, and cookies restricted.
 * 2. "The Data Royal": 16 or more CPU cores or 8 GB memory reported, and many of the tested fonts installed.
 * 3. "The Night Owl": local hour between 0 and 4.
 * 4. "The Pocket Wanderer": touch device with a small screen.
 * Default: "The Everyday Browser"
 */
export function determineIdentityBadge(signals = {}) {
  const s = normalizeSignals(signals);

  // 1. The Privacy Monk
  if ((s.isDntOn || s.isGpcOn) && s.adBlocker && s.cookiesRestricted) {
    const trackerProtocol = s.isDntOn && s.isGpcOn ? 'Do Not Track and Global Privacy Control are on' : (s.isDntOn ? 'Do Not Track is on' : 'Global Privacy Control is on');
    return {
      id: 'privacy-monk',
      name: 'The Privacy Monk',
      icon: '🧘‍♂️',
      rule: `You got this because ${trackerProtocol}, an ad blocker was detected, and cookies are restricted.`
    };
  }

  // 2. The Data Royal (16+ CPU cores or 8+ GB RAM, and many tested fonts installed: >= 10)
  if ((s.cores >= 16 || s.memoryGb >= 8) && s.fontsCount >= 10) {
    const hwSpec = s.cores >= 16 && s.memoryGb >= 8
      ? '16 or more CPU cores and 8 GB or more memory'
      : (s.cores >= 16 ? '16 or more CPU cores' : '8 GB or more memory');
    return {
      id: 'data-royal',
      name: 'The Data Royal',
      icon: '👑',
      rule: `You got this because your system reported ${hwSpec}, and many of the tested fonts installed.`
    };
  }

  // 3. The Night Owl (local hour between 0 and 4)
  if (s.hour >= 0 && s.hour <= 4) {
    return {
      id: 'night-owl',
      name: 'The Night Owl',
      icon: '🦉',
      rule: `You got this because your local hour is ${s.hour}, between 0 and 4.`
    };
  }

  // 4. The Pocket Wanderer (touch device with a small screen)
  if (s.hasTouch && s.isSmallScreen) {
    return {
      id: 'pocket-wanderer',
      name: 'The Pocket Wanderer',
      icon: '📱',
      rule: 'You got this because you are using a touch device with a small screen.'
    };
  }

  // Fallback: The Everyday Browser
  return {
    id: 'everyday-browser',
    name: 'The Everyday Browser',
    icon: '🧭',
    rule: 'You got this because your browser configuration follows everyday browsing defaults.'
  };
}

/**
 * Detects rare cards (only when the condition is genuinely true, labeled "rare card", NOT a percentage)
 * 
 * Rules:
 * 1. "The Ghost": DNT or GPC on, ad blocker detected, and canvas output blocked or randomised.
 * 2. "The Lab Rat": navigator.webdriver is true, or the user agent shows a headless browser.
 * 3. "The Time Traveler": local time is between 3:00 and 3:59 in the timezone reported.
 */
export function detectRareCards(signals = {}) {
  const s = normalizeSignals(signals);
  const rareCards = [];

  // 1. The Ghost
  if ((s.isDntOn || s.isGpcOn) && s.adBlocker && s.canvasBlockedOrRandomised) {
    rareCards.push({
      id: 'the-ghost',
      title: 'The Ghost',
      label: 'rare card',
      icon: '👻',
      rule: 'Do Not Track or Global Privacy Control is on, an ad blocker was detected, and canvas output is blocked or randomised.',
      callout: 'You found a rare card!'
    });
  }

  // 2. The Lab Rat
  if (s.webdriver || s.isHeadless) {
    rareCards.push({
      id: 'the-lab-rat',
      title: 'The Lab Rat',
      label: 'rare card',
      icon: '🧪',
      rule: 'navigator.webdriver is true, or the user agent shows a headless browser.',
      callout: 'You found a rare card!'
    });
  }

  // 3. The Time Traveler (local time is between 3:00 and 3:59 in the timezone reported)
  if (s.hour === 3) {
    rareCards.push({
      id: 'the-time-traveler',
      title: 'The Time Traveler',
      label: 'rare card',
      icon: '⏳',
      rule: `Local time is between 3:00 and 3:59 in the timezone reported (${s.timezone}).`,
      callout: 'You found a rare card!'
    });
  }

  return rareCards;
}
