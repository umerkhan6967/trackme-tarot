/**
 * /api/fortune.js
 * Vercel serverless function using the official @google/genai SDK.
 * 
 * - Loads GEMINI_API_KEY from environment (.env.local / .env).
 * - Reads model from process.env.GEMINI_MODEL (default: "gemini-2.5-flash").
 * - Fallback chain: "gemini-2.5-flash" -> "gemini-2.5-flash-lite" -> "gemini-3.5-flash-lite".
 * - Retries retryable errors at most once with a short backoff.
 * - Enforces total time strictly under 8 seconds.
 * - Returns `model` field in JSON and detailed error messages for ?debug=1 inspection.
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

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed', status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY in environment');
    return res.status(503).json({
      error: 'GEMINI_API_KEY environment variable is not configured on the server.',
      status: 503,
      fallback: true
    });
  }

  const startTime = Date.now();
  const maxTotalTimeMs = 7600; // Stay under 8 seconds total budget

  // Official @google/genai client
  const ai = new GoogleGenAI({ apiKey });

  // 1. Model read from process.env.GEMINI_MODEL (default "gemini-2.5-flash")
  // 2. Fallback chain: "gemini-2.5-flash" -> "gemini-2.5-flash-lite" -> "gemini-3.5-flash-lite"
  const configuredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const rawChain = [
    configuredModel,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash-lite'
  ];
  const modelChain = rawChain.filter((m, i, arr) => arr.indexOf(m) === i);

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  body = body || {};

  const isTestPrompt = typeof body.prompt === 'string' && body.prompt.trim().length > 0;

  let lastStatus = 500;
  let lastErrorText = 'Unknown Gemini API error';
  const attemptHistory = [];
  const retryableStatuses = new Set([429, 500, 502, 503, 504]);

  for (const model of modelChain) {
    const elapsed = Date.now() - startTime;
    if (maxTotalTimeMs - elapsed <= 800) {
      break;
    }

    // Retry each model at most once (max 2 attempts)
    const maxAttemptsPerModel = 2;

    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt++) {
      const remainingTime = maxTotalTimeMs - (Date.now() - startTime);
      if (remainingTime <= 800) {
        break;
      }

      try {
        if (isTestPrompt) {
          const response = await ai.models.generateContent({
            model,
            contents: body.prompt
          });

          return res.status(200).json({
            text: response.text,
            prompt: body.prompt,
            source: 'gemini',
            model
          });
        }

        // Cyber-tarot reading
        const signals = body.signals || body;
        const systemPrompt = `You are a witty tarot reader who reads people from their browser data. Write in English only. Tone: funny, slightly eerie, relatable, Gen-Z internet humour. Do not use Urdu, Hindi or Hinglish words such as bhai, yaar, karo, thori, etc. Return ONLY JSON: { "archetype": "string (a fun card title like 'The 1AM Overthinker')", "fortune": "string (3 short sentences using the specific signals)", "prediction": "string (one absurd prediction for tomorrow)", "vibe_emoji": "string", "exposure_tips": ["string", "string", "string"] }. Never mention exact IP or precise location; keep it playful and non-creepy.`;
        const userPrompt = `Here are the passive browser signals intercepted from this visitor:\n${JSON.stringify(signals, null, 2)}\n\nProvide their cyber-tarot reading strictly in valid JSON format.`;

        const response = await ai.models.generateContent({
          model,
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.85
          }
        });

        const candidateText = response.text;
        if (!candidateText) {
          throw new Error(`Model ${model} returned empty response`);
        }

        const cleaned = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsedFortune = JSON.parse(cleaned);

        // 3. Return the model that answered in the JSON (model field)
        parsedFortune.source = 'gemini';
        parsedFortune.model = model;

        return res.status(200).json(parsedFortune);
      } catch (err) {
        const statusCode = err.status || err.code || 500;
        const errMessage = err.message || String(err);
        lastStatus = typeof statusCode === 'number' ? statusCode : 500;
        lastErrorText = errMessage;

        console.error(`[Gemini API Error] Model: ${model} | Attempt: ${attempt}/${maxAttemptsPerModel} | Status: ${statusCode} | Details:`, errMessage);

        attemptHistory.push({
          model,
          attempt,
          status: lastStatus,
          error: errMessage
        });

        // If 404 (model not found / deprecated for this account), skip immediate retry and move to next model in chain
        if (lastStatus === 404) {
          break;
        }

        // For retryable status codes (429, 500, 502, 503, 504), retry once with short backoff if time permits
        if (retryableStatuses.has(lastStatus) && attempt < maxAttemptsPerModel) {
          const shortBackoff = 300 + Math.floor(Math.random() * 50);
          if (Date.now() - startTime + shortBackoff >= maxTotalTimeMs) {
            break;
          }
          await new Promise((r) => setTimeout(r, shortBackoff));
        } else {
          // If non-retryable or already retried, proceed to next model in fallback chain
          break;
        }
      }
    }
  }

  // 4. Return detailed error message in response so it displays in ?debug=1
  return res.status(lastStatus || 503).json({
    error: `Gemini service unavailable: ${lastErrorText}`,
    status: lastStatus || 503,
    details: lastErrorText,
    attempts: attemptHistory
  });
}
