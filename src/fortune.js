/**
 * src/fortune.js
 * 
 * Fetches AI-powered tarot prophecy from the serverless /api/fortune endpoint (Gemini API)
 * with an 8-second timeout.
 * 
 * If the API call fails, times out, or has no configured API key, it seamlessly falls back
 * to a local rule-based engine featuring 13 handcrafted archetypes infused with Gen-Z/Hinglish humor
 * so the demo NEVER breaks under any circumstances.
 */

// 13 handcrafted local fallback archetypes
const FALLBACK_ARCHETYPES = [
  {
    id: 'late-night-overthinker',
    numeral: 'XVIII',
    suit: 'SUIT OF SHADOWS',
    archetype: 'The 1AM Overthinker',
    vibe_emoji: '🦉',
    condition: (s) => {
      const h = s.temporal?.localHour ?? s.localHour ?? new Date().getHours();
      return h >= 23 || h < 5;
    },
    fortune: 'Your system clock confirms it is the dead of night, yet here you are letting a website read your digital soul. At least 14 tabs of existential questions and dead Reddit threads are open right now. Go to sleep, the tracking algorithms will still be here waiting for you in the morning.',
    prediction: 'Tomorrow at 1:14 PM you will completely zone out during a serious conversation thinking about a random meme from 2019.',
    exposure_tips: [
      'Close that 3-week-old tab you promised yourself you would read.',
      'Drink some water and dim your screen brightness.',
      'Turn on Night Light before your retinas officially file a complaint.'
    ]
  },
  {
    id: 'low-battery-daredevil',
    numeral: 'XVI',
    suit: 'SUIT OF VOLTS',
    archetype: 'The 8% Daredevil',
    vibe_emoji: '🪫',
    condition: (s) => {
      const lvl = s.battery?.level ?? s.batteryStatus?.level;
      const charging = s.battery?.charging ?? s.batteryStatus?.charging;
      return typeof lvl === 'number' && lvl < 22 && !charging;
    },
    fortune: 'Your battery level is screaming in red, yet you are out here casually inspecting cyber-tarot fortunes with zero charger in sight. Absolute chaotic energy, living life on 1% battery and pure hopium. You truly thrive on low-voltage adrenaline.',
    prediction: 'Your device will shut down mid-sentence while you are typing "on my way".',
    exposure_tips: [
      'Find a charging cable before your phone slips into a permanent coma.',
      'Stop streaming 4K video with 7% battery remaining.',
      'Low power mode is not an excuse for reckless living.'
    ]
  },
  {
    id: 'typography-snob',
    numeral: 'III',
    suit: 'SUIT OF GLYPHS',
    archetype: 'The Font Hoarder',
    vibe_emoji: '🎨',
    condition: (s) => {
      const count = s.fonts?.installedCount ?? s.fontsInstalledCount ?? 0;
      return count >= 16;
    },
    fortune: 'Over 16 custom system fonts detected on this canvas fingerprint. You definitely spend 45 minutes agonizing between Helvetica Neue and Inter for a simple to-do list. Graphic design isn’t just your passion, it is your personal digital hazard.',
    prediction: 'You will judge a restaurant’s food tomorrow solely based on their menu font choice.',
    exposure_tips: [
      'Nobody on your team can tell the difference between your 4 versions of Roboto.',
      'Delete the 30 fonts you downloaded for that one freelance client 2 years ago.',
      'Comic Sans is secretly watching your every move.'
    ]
  },
  {
    id: 'adblock-phantom',
    numeral: 'IX',
    suit: 'SUIT OF CIPHERS',
    archetype: 'The Adblock Phantom',
    vibe_emoji: '🥷',
    condition: (s) => s.privacy?.adBlockerDetected === true || s.adBlockerDetected === true,
    fortune: 'Bait ad container status: completely vaporized into quantum dust. You think you are invisible behind your custom DNS filters and privacy extensions. But your canvas fingerprint just broadcast your identity to the entire server room anyway.',
    prediction: 'You will accidentally click "Accept All Cookies" on an obscure recipe blog out of pure exhaustion.',
    exposure_tips: [
      'Your ad-blocker is great, but your screen geometry still gives you away.',
      'Stop clicking "Manage Options" on sites with 400 vendor checkmarks.',
      'Clear your browser cache once in a while, paranoid friend.'
    ]
  },
  {
    id: 'potato-rig-survivor',
    numeral: '0',
    suit: 'SUIT OF RESISTANCE',
    archetype: 'The Potato Rig Veteran',
    vibe_emoji: '🥔',
    condition: (s) => {
      const cores = s.hardware?.cores ?? s.cores;
      return cores <= 2 || (s.hardware?.deviceMemory && s.hardware.deviceMemory.includes('<=2GB'));
    },
    fortune: 'Barely 2 CPU threads detected and your device memory is fighting for its life in the trenches. Every time you open 3 browser tabs simultaneously, your cooling fan sounds like an aircraft engine preparing for takeoff. Respect for the hustle though, this machine is a certified survivor.',
    prediction: 'Opening a Google Docs tab tomorrow will cause your cursor to freeze for 5 uncomfortable seconds.',
    exposure_tips: [
      'Disable hardware acceleration in heavy apps immediately.',
      'Restart your browser, it has been suffering in silence since Tuesday.',
      'Give your laptop a gentle pat on the casing for surviving another day.'
    ]
  },
  {
    id: 'overclocked-sultan',
    numeral: 'VII',
    suit: 'SUIT OF SILICON',
    archetype: 'The Overclocked Sultan',
    vibe_emoji: '🚀',
    condition: (s) => {
      const cores = s.hardware?.cores ?? s.cores ?? 4;
      const gpu = (s.gpuRenderer || '').toLowerCase();
      return cores >= 12 || gpu.includes('nvidia') || gpu.includes('rtx');
    },
    fortune: 'Incredible: 12+ execution threads and enough compute power to simulate orbital rocket trajectories. And yet 92% of this horsepower is dedicated to watching 1080p YouTube videos and hoarding 38 inactive tabs. High-end hardware with very questionable life balance.',
    prediction: 'You will browse the web tonight for another mechanical keyboard or desk accessory you 100% do not need.',
    exposure_tips: [
      'Actually utilize those extra CPU cores for something productive once.',
      'Clean out the RGB dust filters, your fans are suffocating.',
      'Stop running benchmark tests just to stare at the score.'
    ]
  },
  {
    id: 'doomscroll-deity',
    numeral: 'V',
    suit: 'SUIT OF GLASS',
    archetype: 'The Doomscroll Deity',
    vibe_emoji: '📱',
    condition: (s) => (s.deviceType === 'mobile' || s.isMobile || s.preferences?.touchSupport === true),
    fortune: 'Capacitive touch points detected: pure mobile reflex conditioning. You originally unlocked your device to check the weather and suddenly 45 minutes evaporated into an algorithmic vortex. Your thumb has logged more cardio mileage this week than your legs.',
    prediction: 'You will accidentally double-tap and like a 5-year-old Instagram post at 2:30 AM.',
    exposure_tips: [
      'Fix your neck posture right now—slouched spine detected.',
      'Put the phone face-down and look at a real-life window.',
      'Disable push notifications for shopping apps trying to drain your wallet.'
    ]
  },
  {
    id: 'dark-mode-vampire',
    numeral: 'XIII',
    suit: 'SUIT OF OBSIDIAN',
    archetype: 'The Dark Mode Vampire',
    vibe_emoji: '🦇',
    condition: (s) => s.preferences?.darkMode === true,
    fortune: 'System dark mode preference: strictly enforced. If a website accidentally renders a pure white background, you hiss at the screen like an ancient creature dragged into midday sunlight. Real sunlight is considered an unwanted third-party dependency.',
    prediction: 'A coworker will screen-share an un-themed light-mode spreadsheet tomorrow and flashbang your soul.',
    exposure_tips: [
      'Step outdoors for 10 minutes of genuine natural daylight.',
      'Wipe down the fingerprints from your matte display.',
      'Not every single software application needs an AMOLED pitch-black theme.'
    ]
  },
  {
    id: 'ultrawide-overlord',
    numeral: 'IV',
    suit: 'SUIT OF RESOLUTION',
    archetype: 'The Canvas Overlord',
    vibe_emoji: '🖥️',
    condition: (s) => {
      const res = s.screen?.resolution ?? s.resolution ?? '';
      const w = parseInt(res.split('x')[0], 10) || 0;
      return w >= 2560;
    },
    fortune: 'Screen width exceeds 2560 pixels! You are browsing the web in panoramic cinema format. You have enough screen real estate to run three full applications side-by-side, yet your attention remains locked onto one tiny chat window waiting for a typing indicator.',
    prediction: 'You will lose your cursor on your own screen tomorrow and spend 8 seconds shaking it violently.',
    exposure_tips: [
      'Use window-snapping keyboard shortcuts instead of manual dragging.',
      'Your neck is getting a heavy workout panning from left to right.',
      'Stop maximizing your browser to the full ultrawide width, it looks ridiculous.'
    ]
  },
  {
    id: 'dnt-hopium-believer',
    numeral: 'II',
    suit: 'SUIT OF ILLUSION',
    archetype: 'The DNT Hopium Believer',
    vibe_emoji: '🛡️',
    condition: (s) => s.privacy?.doNotTrack === true || s.doNotTrack === true,
    fortune: 'Do-Not-Track header is proudly set to 1. How innocent! Commercial ad networks receive that flag, smile politely, and catalog your device canvas hash with 99.4% precision anyway. Your optimism is truly commendable.',
    prediction: 'You will receive an eerily specific Instagram sponsored post about something you only mentioned out loud.',
    exposure_tips: [
      'The Do-Not-Track header is ignored by 99% of ad networks—use script blockers.',
      'Do not connect to public coffee shop Wi-Fi without DNS encryption.',
      'Accept that data brokers already know your preferred midnight snack.'
    ]
  },
  {
    id: 'polyglot-nomad',
    numeral: 'XI',
    suit: 'SUIT OF TONGUES',
    archetype: 'The Polyglot Nomad',
    vibe_emoji: '🌍',
    condition: (s) => {
      const langs = s.languages?.all || [];
      return Array.isArray(langs) && langs.length >= 3;
    },
    fortune: 'Three or more active language locales detected in your headers. You switch between multiple languages and internet slang mid-sentence, and your autocorrect has completely given up trying to understand your grammar. Truly international aura with global emotional stress.',
    prediction: 'You will accidentally type an entire paragraph in the wrong keyboard layout and hit send before noticing.',
    exposure_tips: [
      'Add your favorite slang to your personal dictionary.',
      'Clear out unused keyboard language packs taking up background memory.',
      'Remember which language keyboard is currently active before typing passwords.'
    ]
  },
  {
    id: 'sensory-zen-master',
    numeral: 'XIV',
    suit: 'SUIT OF SERENITY',
    archetype: 'The Sensory Minimalist',
    vibe_emoji: '🧘',
    condition: (s) => s.preferences?.reducedMotion === true,
    fortune: 'Reduced motion preference active! You have zero tolerance for spinning 3D cubes or frivolous bouncing banners. Pure utilitarian speed and tranquility, like a silent server room at midnight.',
    prediction: 'A flashy WebGL startup landing page will test your inner serenity tomorrow.',
    exposure_tips: [
      'Keep the reduced motion flag enabled, it legitimately conserves battery life.',
      'Avoid modern web pages that hijack native mouse scroll behavior.',
      'Maintain your digital peace and let the chaos scroll past you.'
    ]
  },
  {
    id: 'algorithmic-baseline',
    numeral: 'XXI',
    suit: 'SUIT OF THE WORLD',
    archetype: 'The Algorithmic Baseline',
    vibe_emoji: '🌐',
    condition: () => true, // default universal fallback
    fortune: 'Your browser signals are so impeccably average that data brokers use your profile as the statistical baseline for the human race. Zero suspicious flags, zero unusual fonts, just pure unseasoned consumer stability. Completely standard.',
    prediction: 'You will open a fresh browser tab to search for something important, stare at the blank screen, and immediately forget what it was.',
    exposure_tips: [
      'Install at least one privacy extension to give yourself some personality.',
      'Switch your default search engine occasionally to keep the algorithms guessing.',
      'Stop reusing the same variation of your 2017 password everywhere.'
    ]
  }
];

/**
 * Executes local rule-based fortune determination
 */
function getLocalFallbackFortune(signals) {
  const match = FALLBACK_ARCHETYPES.find((arc) => arc.condition(signals)) || FALLBACK_ARCHETYPES[FALLBACK_ARCHETYPES.length - 1];

  return {
    archetype: match.archetype,
    fortune: match.fortune,
    prediction: match.prediction,
    vibe_emoji: match.vibe_emoji,
    exposure_tips: match.exposure_tips,
    numeral: match.numeral,
    suit: match.suit,
    isAiGenerated: false,
    source: 'fallback'
  };
}

/**
 * Primary fortune generation entry point.
 * Attempts to invoke /api/fortune (Gemini) with an 8-second timeout.
 * Seamlessly falls back to the handcrafted local generator on timeout/error.
 */
export async function generateFortune(signals) {
  // Normalize signals for the API
  const payload = signals.signals ? signals.signals : signals;

  let fortuneData = null;
  let apiError = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('/api/fortune', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.archetype && data.fortune) {
        // AI generated successfully
        fortuneData = {
          archetype: data.archetype,
          fortune: data.fortune,
          prediction: data.prediction || 'Tomorrow will test your patience with at least one software update.',
          vibe_emoji: data.vibe_emoji || '🔮',
          exposure_tips: Array.isArray(data.exposure_tips) && data.exposure_tips.length ? data.exposure_tips : [
            'Clear browser cookies periodically.',
            'Keep your OS security patches updated.',
            'Review active browser extensions.'
          ],
          numeral: 'XII',
          suit: 'SUIT OF CIPHERS',
          isAiGenerated: true,
          source: data.source || 'gemini',
          model: data.model || 'gemini-2.5-flash'
        };
      }
    } else {
      const errJson = await response.json().catch(() => null);
      const errMsg = errJson?.error || `HTTP ${response.status}`;
      console.warn(`⚠️ [/api/fortune] API returned error status ${response.status}:`, errMsg);
      apiError = {
        status: response.status,
        message: errMsg,
        details: errJson?.details,
        attempts: errJson?.attempts
      };
    }
  } catch (err) {
    console.info('⚠️ [/api/fortune] Gemini API unavailable or timed out (>8s). Engaging local cyber-tarot fallback.', err.name === 'AbortError' ? '(Timed out after 8s)' : err.message);
    apiError = {
      status: err.name === 'AbortError' ? 408 : 503,
      message: err.name === 'AbortError' ? 'Request timed out (>8s)' : err.message
    };
  }

  // Fallback if AI was unavailable or invalid
  if (!fortuneData) {
    fortuneData = getLocalFallbackFortune(signals);
    if (apiError) {
      fortuneData.errorStatus = apiError.status;
      fortuneData.errorMessage = apiError.message;
      fortuneData.attempts = apiError.attempts;
    }
  }

  // Console.log the source as requested
  console.log('source:', fortuneData.source);
  if (fortuneData.model) {
    console.log('model:', fortuneData.model);
  }

  // Add backward-compatible aliases so existing components don't break
  return {
    ...fortuneData,
    title: fortuneData.archetype,
    subtitle: `Vibe: ${fortuneData.vibe_emoji} // Arcanum ${fortuneData.numeral}`,
    quote: fortuneData.fortune,
    warning: `🔮 Oracle Prediction: ${fortuneData.prediction}`,
    avatar: fortuneData.vibe_emoji,
    tips: fortuneData.exposure_tips
  };
}
