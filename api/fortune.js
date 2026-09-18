/**
 * /api/fortune.js
 * Vercel-compatible serverless function that receives browser telemetry signals
 * and invokes the Google Gemini API with retries and fallback models.
 * 
 * Environment variables:
 * - GEMINI_API_KEY: Secret key, never exposed to the client.
 * - GEMINI_MODEL: Primary model override (default: "gemini-2.5-flash").
 */

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed', status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY environment variable is not configured on the server.',
      status: 503,
      fallback: true
    });
  }

  const startTime = Date.now();
  const maxTotalTimeMs = 7600; // Stay strictly under 8 seconds total

  // Model fallback chain: GEMINI_MODEL (default "gemini-2.5-flash") -> "gemini-2.5-flash-lite" -> "gemini-2.0-flash"
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const defaultChain = [primaryModel, 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
  const modelChain = defaultChain.filter((m, i, arr) => arr.indexOf(m) === i);

  const retryableStatuses = new Set([429, 500, 502, 503, 504]);
  const nonRetryableStatuses = new Set([400, 401, 403]);

  let lastStatus = 500;
  let lastErrorText = 'Unknown Gemini API error';
  const attemptHistory = [];

  try {
    const signals = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    const systemPrompt = `You are a witty tarot reader who reads people from their browser data. Write in English only. Tone: funny, slightly eerie, relatable, Gen-Z internet humour. Do not use Urdu, Hindi or Hinglish words such as bhai, yaar, karo, thori, etc. Return ONLY JSON: { "archetype": "string (a fun card title like 'The 1AM Overthinker')", "fortune": "string (3 short sentences using the specific signals)", "prediction": "string (one absurd prediction for tomorrow)", "vibe_emoji": "string", "exposure_tips": ["string", "string", "string"] }. Never mention exact IP or precise location; keep it playful and non-creepy.`;

    const userPrompt = `Here are the passive browser signals intercepted from this visitor:
${JSON.stringify(signals, null, 2)}

Provide their cyber-tarot reading strictly in valid JSON format.`;

    const payload = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.85,
        responseMimeType: 'application/json'
      }
    });

    for (const model of modelChain) {
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const elapsed = Date.now() - startTime;
        const timeLeft = maxTotalTimeMs - elapsed;
        if (timeLeft <= 700) {
          // Not enough time left for a safe request
          break;
        }

        try {
          const controller = new AbortController();
          const requestTimeout = Math.min(timeLeft - 200, 3500);
          const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: payload,
              signal: controller.signal
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!candidateText) {
              throw new Error(`Model ${model} returned empty candidate parts`);
            }

            const cleaned = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            const parsedFortune = JSON.parse(cleaned);

            parsedFortune.source = 'gemini';
            parsedFortune.model = model;

            return res.status(200).json(parsedFortune);
          }

          // Error response handling
          lastStatus = response.status;
          const errBody = await response.text();
          lastErrorText = errBody;

          // Requirement 5: Log the full error body with console.error so it can be read in the terminal
          console.error(`[Gemini API Error] Model: ${model} | Attempt: ${attempt}/${maxAttempts} | Status: ${response.status} | Full body:`, errBody);

          attemptHistory.push({
            model,
            attempt,
            status: response.status,
            error: errBody
          });

          // Do not retry on 400, 401 or 403
          if (nonRetryableStatuses.has(response.status) || (!retryableStatuses.has(response.status) && response.status < 500)) {
            return res.status(response.status).json({
              error: `Gemini API client error (${response.status})`,
              status: response.status,
              details: errBody,
              model,
              attempts: attemptHistory
            });
          }

          // If retryable (429, 500, 502, 503, 504), apply exponential backoff (500ms, then 1500ms) + small random jitter
          if (attempt < maxAttempts) {
            const baseBackoff = attempt === 1 ? 500 : 1500;
            const jitter = Math.floor(Math.random() * 120); // 0-120ms jitter
            const backoffDelay = baseBackoff + jitter;

            if (Date.now() - startTime + backoffDelay >= maxTotalTimeMs) {
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          }
        } catch (fetchErr) {
          lastErrorText = fetchErr.message;
          console.error(`[Gemini API Exception] Model: ${model} | Attempt: ${attempt}/${maxAttempts} | Error:`, fetchErr);

          attemptHistory.push({
            model,
            attempt,
            status: fetchErr.name === 'AbortError' ? 408 : 503,
            error: fetchErr.message
          });

          if (attempt < maxAttempts) {
            const baseBackoff = attempt === 1 ? 500 : 1500;
            const jitter = Math.floor(Math.random() * 120);
            const backoffDelay = baseBackoff + jitter;
            if (Date.now() - startTime + backoffDelay >= maxTotalTimeMs) {
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          }
        }
      }

      // If time exhausted, stop model loop
      if (Date.now() - startTime >= maxTotalTimeMs) {
        break;
      }
    }

    // Requirement 3: Return real error status and message so client falls back and shows why in ?debug=1
    return res.status(lastStatus || 503).json({
      error: `Gemini service unavailable after retries: ${lastErrorText}`,
      status: lastStatus || 503,
      details: lastErrorText,
      attempts: attemptHistory
    });

  } catch (outerErr) {
    console.error('Unhandled fortune handler exception:', outerErr);
    return res.status(500).json({
      error: outerErr.message || 'Internal server error processing tarot fortune',
      status: 500,
      details: String(outerErr)
    });
  }
}
