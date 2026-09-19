/**
 * /api/fortune.js
 * Vercel serverless function using the official @google/genai SDK.
 * 
 * Upgraded to 3-card tarot spread with theme choice:
 * - "Love & algorithms"
 * - "Career & cookies"
 * - "Destiny & device memory"
 * 
 * Returns JSON: { cards: [ {title, archetype, reading, vibe_emoji} x3 ], prediction, exposure_tips[3] }
 * where:
 * - card 1: "What the internet already knows" (stable signals: OS, screen, language, fonts)
 * - card 2: "How exposed you are right now" (uses real Exposure Score + one line of interpretation)
 * - card 3: "What happens if you ignore this" (absurd but harmless prediction)
 * 
 * Strict output validation:
 * - digits must exist in the facts
 * - banned words check
 * - retry once on validation failure, then fallback to local 3-card generator
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

const BANNED_WORDS = [
  'bhai', 'yaar', 'karo', 'thori', 'acha', 'nahi', 'apna', 'meri', 'tere',
  'desh', 'shukriya', 'lao', 'chalo', 'hum', 'tum'
];

/**
 * Extracts all valid numeric strings from the user's signals and score
 */
function extractAllowedNumbers(signals, score) {
  const allowed = new Set();
  // Always allow single digits 0-9 and small integers like 1, 2, 3 (for card numbering)
  for (let i = 0; i <= 9; i++) allowed.add(String(i));

  function addMatches(val) {
    if (!val) return;
    const matches = String(val).match(/\d+/g);
    if (matches) {
      matches.forEach(m => allowed.add(m));
    }
  }

  addMatches(score?.score);
  addMatches(signals.hardware?.cores ?? signals.cores);
  addMatches(signals.hardware?.deviceMemory ?? signals.deviceMemory);
  addMatches(signals.screen?.resolution ?? signals.resolution);
  addMatches(signals.screen?.colorDepth ?? signals.colorDepth);
  addMatches(signals.screen?.refreshRate ?? signals.refreshRate);
  addMatches(signals.screen?.pixelRatio ?? signals.pixelRatio);
  addMatches(signals.battery?.level ?? signals.batteryStatus?.level);
  addMatches(signals.temporal?.localHour ?? signals.localHour);
  addMatches(signals.fonts?.installedCount ?? signals.fontsInstalledCount);
  addMatches(signals.network?.latencyMs ?? signals.latency);
  addMatches(signals.connection?.downlink);
  addMatches(signals.connection?.rtt);

  return allowed;
}

/**
 * Validates the Gemini response structure, numbers, and banned words
 */
function validateFortuneOutput(output, allowedNumbers) {
  if (!output || typeof output !== 'object') {
    return { valid: false, reason: 'Output must be a JSON object' };
  }

  if (!Array.isArray(output.cards) || output.cards.length !== 3) {
    return { valid: false, reason: `Must contain cards array with exactly 3 cards (got ${output.cards?.length})` };
  }

  for (let i = 0; i < 3; i++) {
    const card = output.cards[i];
    if (!card || !card.archetype || !card.reading) {
      return { valid: false, reason: `Card ${i + 1} is missing archetype or reading` };
    }
  }

  const allText = [
    ...output.cards.map(c => `${c.title || ''} ${c.archetype || ''} ${c.reading || ''}`),
    output.prediction || '',
    ...(Array.isArray(output.exposure_tips) ? output.exposure_tips : [])
  ].join(' ').toLowerCase();

  // Banned words check (Hinglish/Urdu/Hindi slang)
  for (const word of BANNED_WORDS) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(allText)) {
      return { valid: false, reason: `Contains banned word: ${word}` };
    }
  }

  // Digits validation: multi-digit numbers must exist in the provided facts
  const numbersFound = allText.match(/\d+/g) || [];
  for (const num of numbersFound) {
    if (num.length > 1 && !allowedNumbers.has(num)) {
      return { valid: false, reason: `Invented number not in facts: "${num}"` };
    }
  }

  return { valid: true };
}

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
      `Tomorrow an algorithm will deliberately pair you with someone who types with index fingers and leaves open inactive tabs.`,
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
      `Every corporate tracking script knows you are running ${os} with ${cores} execution threads. They know whether you are crunching spreadsheets or switching tabs during company standup.`,
      `Operating in ${lang} on a ${res} display, your workstation fingerprint identifies you as an employee who keeps multiple emergency tabs ready for instant tab switching.`,
      `With ${cores} CPU cores and ${memory} memory, enterprise telemetry systems have already profiled your peak productivity and afternoon focus dips.`
    ];

    const card2Phrasings = [
      `Exposure Score: ${scoreVal}/100. Your digital footprint is so distinct that recruiters know you are browsing job boards before you even submit an application.`,
      `Exposure Score: ${scoreVal}/100. Corporate intranet trackers have logged enough ambient cookies to reconstruct your entire working routine down to the second.`,
      `Exposure Score: ${scoreVal}/100. Third-party advertising cookies follow your work machine home with zero respect for personal boundaries.`
    ];

    const card3Phrasings = [
      `Tomorrow you will accidentally share your screen during a presentation while searching for ways to sound authoritative in an email.`,
      `If you ignore this, LinkedIn will notify your immediate team that you are open to opportunities due to an algorithmic tracking update.`,
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
    `The silicon oracle reads your ${memory} memory and ${cores} CPU threads: you push hardware to cosmic limits through pure tab hoarding and sheer willpower.`,
    `Your ${res} screen resolution at ${refreshRate} and ${os} platform reveal a digital voyager whose hardware signature is permanently etched into server logs.`,
    `With ${cores} execution cores running in ${lang}, the cosmic network recognizes your hardware footprint across billions of concurrent connections.`
  ];

  const card2Phrasings = [
    `Exposure Score: ${scoreVal}/100. The digital ether observes every byte; your device defenses leak ambient hardware telemetry into the advertising void.`,
    `Exposure Score: ${scoreVal}/100. Your memory is congested with the ghosts of forgotten research sessions, broadcasting your digital presence far and wide.`,
    `Exposure Score: ${scoreVal}/100. Real-time browser telemetry signals broadcast your exact silicon specifications to every host you ping.`
  ];

  const card3Phrasings = [
    `Tomorrow your operating system will demand an urgent restart right as you open your final unsaved document.`,
    `If you ignore this, the memory footprint of your background tabs will cause an audible sigh from your cooling exhaust.`,
    `Your device memory will briefly contemplate sentience tomorrow and automatically close your least-visited background tab.`
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
      'Regularly close dormant tabs to release device memory and stop background pings.',
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
  const allowedNumbers = extractAllowedNumbers(signals, score);

  // Handle direct prompt testing
  const isTestPrompt = typeof body.prompt === 'string' && body.prompt.trim().length > 0;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY missing. Using 3-card local fallback.');
    const fallbackFortune = generateLocal3CardFortune(signals, score, theme);
    return res.status(200).json(fallbackFortune);
  }

  const startTime = Date.now();
  const maxTotalTimeMs = 7600;

  const ai = new GoogleGenAI({ apiKey });
  const configuredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const modelChain = [
    configuredModel,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash-lite'
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastStatus = 500;
  let lastErrorText = 'Gemini processing error';

  for (const model of modelChain) {
    if (Date.now() - startTime >= maxTotalTimeMs - 800) break;

    // Direct test prompt bypass
    if (isTestPrompt) {
      try {
        const testRes = await ai.models.generateContent({ model, contents: body.prompt });
        return res.status(200).json({
          text: testRes.text,
          prompt: body.prompt,
          source: 'gemini',
          model
        });
      } catch (err) {
        lastStatus = err.status || 500;
        lastErrorText = err.message || String(err);
        continue;
      }
    }

    // Build the 3-card prompt
    const systemPrompt = `You are a witty cyber-tarot reader who reads people from their browser data.
Write in English only. Tone: humorous, slightly eerie, relatable, Gen-Z internet humor.
Do not use Urdu, Hindi, or Hinglish words (e.g. bhai, yaar, karo, thori, etc.).
Theme: ${theme}. Use only the facts provided.

Return ONLY valid JSON with this exact schema:
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
}

CRITICAL RULES:
- Never invent numbers! Any digits you write MUST exist in the provided facts (score, cores, resolution, memory).
- Never invent exact IP addresses, coordinates, or cities. Keep it playful and safe.`;

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

Generate their 3-card spread in valid JSON format:`;

    // Attempt generation with retry on validation failure (max 2 attempts per model)
    for (let attempt = 1; attempt <= 2; attempt++) {
      if (Date.now() - startTime >= maxTotalTimeMs - 800) break;

      try {
        const response = await ai.models.generateContent({
          model,
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
            temperature: attempt === 1 ? 0.8 : 0.4
          }
        });

        const rawText = response.text;
        if (!rawText) throw new Error('Empty response from model');

        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        // Validate output
        const validation = validateFortuneOutput(parsed, allowedNumbers);
        if (!validation.valid) {
          console.warn(`[Validation Failure] Model: ${model}, Attempt: ${attempt}: ${validation.reason}`);
          if (attempt === 1) {
            // Retry once with lower temperature
            continue;
          }
          throw new Error(`Validation failed: ${validation.reason}`);
        }

        // Success!
        parsed.source = 'gemini';
        parsed.model = model;
        parsed.theme = theme;

        // Backward compatibility
        if (parsed.cards && parsed.cards[0]) {
          parsed.archetype = parsed.cards[0].archetype;
          parsed.fortune = parsed.cards[0].reading;
          parsed.vibe_emoji = parsed.cards[0].vibe_emoji;
        }

        return res.status(200).json(parsed);
      } catch (err) {
        lastStatus = err.status || 500;
        lastErrorText = err.message || String(err);
        console.error(`[Gemini Attempt Error] Model: ${model} Attempt: ${attempt}:`, lastErrorText);

        if (lastStatus === 404) break;
        if (attempt === 1 && Date.now() - startTime < maxTotalTimeMs - 1200) {
          await new Promise(r => setTimeout(r, 200));
        }
      }
    }
  }

  // Fallback to handcrafted 3-card generator if all models or validation failed
  console.info('Falling back to local 3-card spread generator. Reason:', lastErrorText);
  const fallback = generateLocal3CardFortune(signals, score, theme);
  fallback.errorStatus = lastStatus;
  fallback.errorMessage = lastErrorText;
  return res.status(200).json(fallback);
}
