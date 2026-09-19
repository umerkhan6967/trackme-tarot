/**
 * /api/fortune.js
 * Vercel serverless function using the official @google/genai SDK.
 * 
 * 3-card tarot spread with theme choice:
 * - "Love & algorithms"
 * - "Career & cookies"
 * - "Destiny & device memory"
 * 
 * Returns JSON: { cards: [ {title, archetype, reading, vibe_emoji} x3 ], prediction, exposure_tips[3] }
 * 
 * Enforces responseSchema, relaxed digit extraction, single retry on offending phrase,
 * strict rejection only on banned words (tabs, history, ip address, your location, reddit),
 * 15-second server execution budget, and HTTP 500 error when GEMINI_API_KEY is missing.
 */

import { GoogleGenAI } from '@google/genai';

if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env.local');
  } catch (e) {}
  try {
    process.loadEnvFile('.env');
  } catch (e) {}
}

// Banned words representing false tracking claims
const BANNED_WORDS = ['tabs', 'history', 'ip address', 'your location', 'reddit'];

/**
 * Checks text for any banned words
 */
function findBannedWord(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`(^|[^a-z0-9])${word}([^a-z0-9]|$)`, 'i');
    if (regex.test(lower)) {
      return word;
    }
  }
  return null;
}

/**
 * Extracts all valid numeric strings from the user's signals and score,
 * including derived forms (e.g. resolution parts "1536", "864", refresh rates, etc.).
 */
function extractAllowedNumbers(signals, score) {
  const allowed = new Set();
  // Single digits 0-9
  for (let i = 0; i <= 9; i++) allowed.add(String(i));
  allowed.add('100'); // score base /100
  ['2024', '2025', '2026', '2027'].forEach(y => allowed.add(y));

  function addRecursive(val) {
    if (val === null || val === undefined) return;
    if (typeof val === 'object') {
      for (const k of Object.keys(val)) {
        addRecursive(val[k]);
      }
      return;
    }
    const str = String(val);
    const matches = str.match(/\d+/g);
    if (matches) {
      matches.forEach(m => allowed.add(m));
    }
  }

  addRecursive(signals);
  addRecursive(score);
  return allowed;
}

/**
 * Checks for invented multi-digit numbers not present in allowed facts
 */
function findInventedNumber(text, allowedNumbers) {
  if (!text) return null;
  const numbersFound = text.match(/\d+/g) || [];
  for (const num of numbersFound) {
    if (num.length > 1 && !allowedNumbers.has(num)) {
      return num;
    }
  }
  return null;
}

/**
 * Verifies that the required schema fields exist on the parsed object
 */
function checkSchemaMismatch(output) {
  if (!output || typeof output !== 'object') return 'root object';
  if (!Array.isArray(output.cards) || output.cards.length !== 3) return 'cards[3]';
  for (let i = 0; i < 3; i++) {
    const c = output.cards[i];
    if (!c || typeof c !== 'object') return `cards[${i}]`;
    if (!c.title) return `cards[${i}].title`;
    if (!c.archetype) return `cards[${i}].archetype`;
    if (!c.reading) return `cards[${i}].reading`;
    if (!c.vibe_emoji) return `cards[${i}].vibe_emoji`;
  }
  if (typeof output.prediction !== 'string' || !output.prediction.trim()) return 'prediction';
  if (!Array.isArray(output.exposure_tips) || output.exposure_tips.length === 0) return 'exposure_tips';
  return null;
}

/**
 * Gemini responseSchema definition enforcing 3-card JSON format
 */
const fortuneResponseSchema = {
  type: 'OBJECT',
  properties: {
    cards: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          archetype: { type: 'STRING' },
          reading: { type: 'STRING' },
          vibe_emoji: { type: 'STRING' }
        },
        required: ['title', 'archetype', 'reading', 'vibe_emoji']
      }
    },
    prediction: { type: 'STRING' },
    exposure_tips: {
      type: 'ARRAY',
      items: { type: 'STRING' }
    }
  },
  required: ['cards', 'prediction', 'exposure_tips']
};

/**
 * Handcrafted 3-card fallback generator with 3 distinct phrasings per card per theme
 */
export function generateLocal3CardFortune(signals, score, theme = 'Destiny & device memory') {
  const os = signals.os || signals.platform || 'Unknown OS';
  const res = signals.screen?.resolution || signals.resolution || '1920x1080';
  const cores = signals.hardware?.cores || signals.cores || 4;
  const memory = signals.hardware?.deviceMemory || signals.deviceMemory || '8 GB';
  const lang = signals.languages?.primary || signals.language || 'en';
  const fonts = signals.fonts?.installedCount ?? signals.fontsInstalledCount ?? 12;
  const scoreVal = score?.score ?? 50;
  const refreshRate = signals.screen?.refreshRate ? `${signals.screen.refreshRate} Hz` : '60 Hz';

  const seed = (String(signals.canvasHash || 'abc').charCodeAt(0) + scoreVal + Date.now()) % 3;

  if (theme === 'Love & algorithms') {
    const card1Phrasings = [
      `Dating algorithms already mapped your ${os} profile and ${res} display before you ever swiped. You broadcast romantic telemetry across ${cores} CPU cores with ${lang} locale charm.`,
      `Your ${lang} language settings and ${fonts} installed fonts reveal someone who over-edits every opening text message. The algorithms cataloged your conversational hesitation in milliseconds.`,
      `With a ${res} screen and ${os} setup, dating platforms know your late-night scrolling habits better than your closest friends ever will.`
    ];

    const card2Phrasings = [
      `Exposure Score: ${scoreVal}/100. Your heart is an unencrypted HTTP packet—completely open to commercial ad exchanges tracking your emotional vulnerabilities.`,
      `Exposure Score: ${scoreVal}/100. You share personal telemetry as casually as an impulsive text after midnight; marketing trackers have already calculated your love profile.`,
      `Exposure Score: ${scoreVal}/100. Matchmaking brokers have cataloged your digital aura and assigned you a behavioral vulnerability index.`
    ];

    const card3Phrasings = [
      `Tomorrow an algorithm will deliberately pair you with someone who types with index fingers and leaves open inactive browser windows.`,
      `If you ignore this, targeted ads for matching couple's tracksuits will aggressively follow you across three separate websites.`,
      `Your crush will discover your digital signature tomorrow when an algorithmic glitch displays your shared playlist publicly.`
    ];

    return {
      cards: [
        {
          title: 'What the internet already knows',
          archetype: 'The Algorithmic Lover',
          reading: card1Phrasings[seed],
          vibe_emoji: '💖'
        },
        {
          title: 'How exposed you are right now',
          archetype: 'The Open Packet',
          reading: card2Phrasings[seed],
          vibe_emoji: '⚡'
        },
        {
          title: 'What happens if you ignore this',
          archetype: 'The Cupid Glitch',
          reading: card3Phrasings[seed],
          vibe_emoji: '🏹'
        }
      ],
      prediction: 'Tomorrow you will receive a notification from an app you forgot you downloaded, asking if you are still looking for connection.',
      exposure_tips: [
        'Clear third-party tracking cookies after browsing dating platforms.',
        'Disable background location access for social and lifestyle apps.',
        'Use privacy-focused browsers when researching personal matters.'
      ],
      source: 'fallback',
      theme
    };
  }

  if (theme === 'Career & cookies') {
    const card1Phrasings = [
      `Every corporate tracking script knows you are running ${os} with ${cores} execution threads. They know whether you are crunching spreadsheets or switching tasks during company standup.`,
      `Operating in ${lang} on a ${res} display, your workstation fingerprint identifies you as an employee who keeps multiple emergency documents ready for instant switching.`,
      `With ${cores} CPU cores and ${memory} memory, enterprise telemetry systems have already profiled your peak productivity and afternoon focus dips.`
    ];

    const card2Phrasings = [
      `Exposure Score: ${scoreVal}/100. Your digital footprint is so distinct that recruiters know you are browsing job boards before you even submit an application.`,
      `Exposure Score: ${scoreVal}/100. Corporate intranet trackers have logged enough ambient cookies to reconstruct your entire working routine down to the second.`,
      `Exposure Score: ${scoreVal}/100. Third-party advertising cookies follow your work machine home with zero respect for personal boundaries.`
    ];

    const card3Phrasings = [
      `Tomorrow you will accidentally share your screen during a presentation while searching for ways to sound authoritative in an email.`,
      `If you ignore this, professional networks will notify your immediate team that you are open to opportunities due to an algorithmic tracking update.`,
      `A persistent marketing cookie will follow you and suggest enterprise cloud subscription discounts on your private phone.`
    ];

    return {
      cards: [
        {
          title: 'What the internet already knows',
          archetype: 'The Standup Phantom',
          reading: card1Phrasings[seed],
          vibe_emoji: '💼'
        },
        {
          title: 'How exposed you are right now',
          archetype: 'The Corporate Beacon',
          reading: card2Phrasings[seed],
          vibe_emoji: '📊'
        },
        {
          title: 'What happens if you ignore this',
          archetype: 'The Screen-Share Omen',
          reading: card3Phrasings[seed],
          vibe_emoji: '🎯'
        }
      ],
      prediction: 'Tomorrow you will reply "sounds good!" to an email without reading the previous three thread replies.',
      exposure_tips: [
        'Isolate workplace browsing from personal web activities using separate profiles.',
        'Audit browser extensions that request permission to read data on all websites.',
        'Block cross-site tracking cookies in your browser privacy preferences.'
      ],
      source: 'fallback',
      theme
    };
  }

  // Default theme: "Destiny & device memory"
  const card1Phrasings = [
    `The silicon oracle reads your ${memory} memory and ${cores} CPU threads: you push hardware to cosmic limits through pure willpower and sheer digital ambition.`,
    `Your ${res} screen resolution at ${refreshRate} and ${os} platform reveal a digital voyager whose hardware profile is easily recognisable across the web.`,
    `With ${cores} execution cores running in ${lang}, the cosmic network recognizes your hardware footprint across billions of concurrent connections.`
  ];

  const card2Phrasings = [
    `Exposure Score: ${scoreVal}/100. The digital ether observes every byte; your device defenses leak ambient hardware telemetry into the advertising void.`,
    `Exposure Score: ${scoreVal}/100. Your memory is congested with the ghosts of forgotten research sessions, broadcasting your digital presence far and wide.`,
    `Exposure Score: ${scoreVal}/100. Real-time browser telemetry signals broadcast your exact silicon specifications to every host you ping.`
  ];

  const card3Phrasings = [
    `Tomorrow your operating system will demand an urgent restart right as you open your final unsaved document.`,
    `If you ignore this, the memory footprint of your background apps will cause an audible sigh from your cooling exhaust.`,
    `Your device memory will briefly contemplate sentience tomorrow and automatically hibernate your least-visited background application.`
  ];

  return {
    cards: [
      {
        title: 'What the internet already knows',
        archetype: 'The Silicon Voyager',
        reading: card1Phrasings[seed],
        vibe_emoji: '🔮'
      },
      {
        title: 'How exposed you are right now',
        archetype: 'The Ambient Beacon',
        reading: card2Phrasings[seed],
        vibe_emoji: '⚡'
      },
      {
        title: 'What happens if you ignore this',
        archetype: 'The RAM Paradox',
        reading: card3Phrasings[seed],
        vibe_emoji: '🌀'
      }
    ],
    prediction: 'Tomorrow at midday your cooling fan will spin up for four seconds for absolutely no discernible reason.',
    exposure_tips: [
      'Enable strict tracking prevention in your browser configuration.',
      'Use a browser or extension that blocks fingerprinting scripts.',
      'Keep your operating system updated to patch exposed hardware telemetry vectors.'
    ],
    source: 'fallback',
    theme: 'Destiny & device memory'
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed', status: 405 });
  }

  // Key check: If process.env.GEMINI_API_KEY is undefined or empty, return 500
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    console.error('[/api/fortune] Missing GEMINI_API_KEY environment variable');
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  body = body || {};

  const signals = body.signals || body;
  const score = body.score || { score: 50 };
  const theme = body.theme || 'Destiny & device memory';
  const badge = body.badge || signals.badge || null;
  const rareCards = Array.isArray(body.rareCards) ? body.rareCards : (Array.isArray(signals.rareCards) ? signals.rareCards : []);

  // Allowed numbers for digit validation
  const allowedNumbers = extractAllowedNumbers({ ...signals, badge, rareCards }, score);

  // Direct test prompt bypass
  const isTestPrompt = typeof body.prompt === 'string' && body.prompt.trim().length > 0;

  const startTime = Date.now();
  const maxTotalTimeMs = 15000; // 15-second server budget

  const ai = new GoogleGenAI({ apiKey });
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const fallbackCandidates = ['gemini-2.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];

  let currentModel = primaryModel;
  let lastStatus = 500;
  let lastErrorText = 'Gemini processing error';
  let exactFallbackReason = null;

  // Function to run a model attempt
  async function executeModel(modelToRun) {
    if (isTestPrompt) {
      const testRes = await ai.models.generateContent({ model: modelToRun, contents: body.prompt });
      return {
        success: true,
        data: {
          text: testRes.text,
          prompt: body.prompt,
          source: 'gemini',
          model: modelToRun
        }
      };
    }

    const systemPrompt = `You are a witty cyber-tarot reader who reads people from their browser data.
Write in English only. Tone: humorous, slightly eerie, relatable, Gen-Z internet humor.
Theme: ${theme}. Use only the facts provided.

CRITICAL RULES:
- Never use the banned words: tabs, history, IP address, your location, Reddit.
- Never invent numbers or statistics! Any numbers or digits you mention must be derived directly from the verified facts provided below.
- Return ONLY valid JSON with this exact schema:
{
  "cards": [
    {
      "title": "What the internet already knows",
      "archetype": "string (a witty archetype name)",
      "reading": "string (2-3 sentences based strictly on stable signals: OS, screen, language, fonts)",
      "vibe_emoji": "string"
    },
    {
      "title": "How exposed you are right now",
      "archetype": "string (a witty archetype name)",
      "reading": "string (uses the real Exposure Score ${score.score}/100, plus one line of interpretation)",
      "vibe_emoji": "string"
    },
    {
      "title": "What happens if you ignore this",
      "archetype": "string (a witty archetype name)",
      "reading": "string (an absurd but harmless prediction tailored to the theme)",
      "vibe_emoji": "string"
    }
  ],
  "prediction": "string (one absurd prediction for tomorrow)",
  "exposure_tips": ["string", "string", "string"]
}`;

    const userPrompt = `Theme: ${theme}. Use only the facts provided.
Here are the visitor's verified passive browser facts:
- Exposure Score: ${score.score}/100
- Operating System: ${signals.os || signals.platform || 'Unknown'}
- Screen Resolution: ${signals.screen?.resolution || signals.resolution || '1920x1080'}
- Screen Colour Depth: ${signals.screen?.colorDepth || signals.colorDepth || '24-bit'}
- Screen Refresh Rate: ${signals.screen?.refreshRate || signals.refreshRate || 60} Hz
- Screen HDR Support: ${signals.screen?.hdr || signals.hdr || 'Unsupported'}
- Colour Gamut: ${signals.screen?.colorGamut || signals.colorGamut || 'sRGB'}
- CPU Cores: ${signals.hardware?.cores || signals.cores || 4}
- Device Memory: ${signals.hardware?.deviceMemory || signals.deviceMemory || '8 GB'}
- Language: ${signals.languages?.primary || signals.language || 'en'}
- Installed Fonts Count: ${signals.fonts?.installedCount ?? signals.fontsInstalledCount ?? 12}
- Do Not Track: ${signals.privacy?.doNotTrack || signals.doNotTrack || 'unavailable'}
- Global Privacy Control: ${signals.privacy?.globalPrivacyControl || signals.gpc || 'unavailable'}
- Network Latency: ${signals.network?.latencyDisplay || signals.latencyDisplay || 'local test'}
${badge && badge.name ? `- Identity Badge: ${badge.name} (${badge.rule})\n` : ''}${rareCards.length ? `- Rare Card Discovered: ${rareCards.map(r => `${r.title} [rare card]: ${r.rule}`).join('; ')}\n` : ''}
Generate their 3-card spread in valid JSON:`;

    // Attempt 1
    const response = await ai.models.generateContent({
      model: modelToRun,
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: fortuneResponseSchema,
        temperature: 0.7
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error('Empty response from model');

    let parsed;
    try {
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return { success: false, fallbackReason: 'invalid JSON', error: 'Failed to parse JSON' };
    }

    // Schema validation (accept if fields exist)
    const missingField = checkSchemaMismatch(parsed);
    if (missingField) {
      return {
        success: false,
        fallbackReason: `schema mismatch with the missing field: ${missingField}`,
        error: `Schema mismatch: missing ${missingField}`
      };
    }

    // Validation checks
    const extractAllText = (obj) => [
      ...(obj.cards || []).map(c => `${c.title || ''} ${c.archetype || ''} ${c.reading || ''}`),
      obj.prediction || '',
      ...(Array.isArray(obj.exposure_tips) ? obj.exposure_tips : [])
    ].join(' ');

    const allText1 = extractAllText(parsed);
    const banned1 = findBannedWord(allText1);
    const invented1 = findInventedNumber(allText1, allowedNumbers);

    if (!banned1 && !invented1) {
      return { success: true, data: parsed };
    }

    // Validation failed on attempt 1: retry once naming the offending phrase
    const offendingTerm = banned1 || invented1;
    const ruleViolated = banned1 ? 'banned_words' : 'digit_check';
    console.warn(`[Validation Warning: Attempt 1] Rule: ${ruleViolated}, Offending: "${offendingTerm}". Retrying once.`);

    if (Date.now() - startTime >= maxTotalTimeMs - 2000) {
      // Insufficient time for retry
      if (!banned1) {
        return { success: true, data: parsed };
      }
      return {
        success: false,
        fallbackReason: `validation rejected with the rule: ${ruleViolated} and the offending text: "${offendingTerm}"`,
        error: `Validation rejected: ${offendingTerm}`
      };
    }

    const retryUserPrompt = `${userPrompt}

CORRECTION NOTICE: Your previous output failed validation on ${ruleViolated} with offending text: "${offendingTerm}".
Do not use "${offendingTerm}". Do not invent numbers or mention tabs, history, IP address, your location, or Reddit. Generate valid JSON:`;

    try {
      const retryResponse = await ai.models.generateContent({
        model: modelToRun,
        contents: `${systemPrompt}\n\n${retryUserPrompt}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: fortuneResponseSchema,
          temperature: 0.3
        }
      });

      const retryRaw = retryResponse.text;
      const retryCleaned = retryRaw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const retryParsed = JSON.parse(retryCleaned);

      const retryMissing = checkSchemaMismatch(retryParsed);
      if (retryMissing) {
        return {
          success: false,
          fallbackReason: `schema mismatch with the missing field: ${retryMissing}`,
          error: `Retry schema mismatch: missing ${retryMissing}`
        };
      }

      const allText2 = extractAllText(retryParsed);
      const banned2 = findBannedWord(allText2);

      // Rule: If it still fails, show Gemini answer ONLY IF it contains no banned words, otherwise fall back
      if (banned2) {
        return {
          success: false,
          fallbackReason: `validation rejected with the rule: banned_words and the offending text: "${banned2}"`,
          error: `Banned word detected: "${banned2}"`
        };
      }

      // No banned words! Accept answer
      return { success: true, data: retryParsed };
    } catch (retryErr) {
      if (!banned1) {
        return { success: true, data: parsed };
      }
      throw retryErr;
    }
  }

  // Execute primary model
  try {
    const result = await executeModel(primaryModel);
    if (result.success) {
      const data = result.data;
      data.source = 'gemini';
      data.model = primaryModel;
      data.theme = theme;
      data.badge = badge;
      data.rareCards = rareCards;
      if (data.cards && data.cards[0]) {
        data.archetype = data.cards[0].archetype;
        data.fortune = data.cards[0].reading;
        data.vibe_emoji = data.cards[0].vibe_emoji;
      }
      return res.status(200).json(data);
    } else {
      exactFallbackReason = result.fallbackReason;
      lastErrorText = result.error;
    }
  } catch (err) {
    lastStatus = err.status || err.statusCode || 500;
    lastErrorText = err.message || String(err);
    console.error(`[Primary Model Error: ${primaryModel}] Status: ${lastStatus}:`, lastErrorText);
    exactFallbackReason = `HTTP error with message: ${lastErrorText}`;

    // Only use fallback model if primary returned 404, 429, or 503
    const isEligibleForFallback = [404, 429, 503].includes(lastStatus) ||
      /404|429|503|resource_exhausted|unavailable|not_found/i.test(lastErrorText);

    if (isEligibleForFallback) {
      for (const fallbackModel of fallbackCandidates) {
        if (fallbackModel === primaryModel) continue;
        if (Date.now() - startTime >= maxTotalTimeMs - 2500) break;

        currentModel = fallbackModel;
        console.info(`Attempting fallback model: ${fallbackModel} due to status ${lastStatus}`);
        try {
          const fallbackResult = await executeModel(fallbackModel);
          if (fallbackResult.success) {
            const data = fallbackResult.data;
            data.source = 'gemini';
            data.model = fallbackModel;
            data.theme = theme;
            data.badge = badge;
            data.rareCards = rareCards;
            if (data.cards && data.cards[0]) {
              data.archetype = data.cards[0].archetype;
              data.fortune = data.cards[0].reading;
              data.vibe_emoji = data.cards[0].vibe_emoji;
            }
            return res.status(200).json(data);
          } else {
            exactFallbackReason = fallbackResult.fallbackReason;
            lastErrorText = fallbackResult.error;
          }
        } catch (fbErr) {
          lastStatus = fbErr.status || fbErr.statusCode || 500;
          lastErrorText = fbErr.message || String(fbErr);
          exactFallbackReason = `HTTP error with message: ${lastErrorText}`;
          console.error(`[Fallback Model Error: ${fallbackModel}] Status: ${lastStatus}:`, lastErrorText);
          const shouldContinueFallback = [404, 429, 503].includes(lastStatus) ||
            /404|429|503|resource_exhausted|unavailable|not_found/i.test(lastErrorText);
          if (!shouldContinueFallback) break;
        }
      }
    }
  }

  // If time elapsed exceeded or approaching limit, mark timeout
  if (Date.now() - startTime >= maxTotalTimeMs) {
    exactFallbackReason = 'timeout';
  }

  // Fallback to handcrafted 3-card generator
  console.info('Falling back to local 3-card spread generator. Reason:', exactFallbackReason || lastErrorText);
  const fallback = generateLocal3CardFortune(signals, score, theme);
  fallback.badge = badge;
  fallback.rareCards = rareCards;
  fallback.source = 'fallback';
  fallback.model = currentModel;
  fallback.errorStatus = lastStatus;
  fallback.errorMessage = lastErrorText;
  fallback.fallbackReason = exactFallbackReason || `HTTP error with message: ${lastErrorText}`;

  return res.status(200).json(fallback);
}
