/**
 * /api/fortune.js
 * Vercel-compatible serverless function that receives browser telemetry signals
 * and invokes the Google Gemini API to divine a personalized cyber-tarot fortune.
 * 
 * Environment variables:
 * - GEMINI_API_KEY: Secret key, never exposed to the client.
 */

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY environment variable is not configured on the server.',
      fallback: true
    });
  }

  try {
    const signals = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    const systemPrompt = `You are a witty tarot reader who reads people from their browser data. Write in English only. Tone: funny, slightly eerie, relatable, Gen-Z internet humour. Do not use Urdu, Hindi or Hinglish words such as bhai, yaar, karo, thori, etc. Return ONLY JSON: { "archetype": "string (a fun card title like 'The 1AM Overthinker')", "fortune": "string (3 short sentences using the specific signals)", "prediction": "string (one absurd prediction for tomorrow)", "vibe_emoji": "string", "exposure_tips": ["string", "string", "string"] }. Never mention exact IP or precise location; keep it playful and non-creepy.`;

    const userPrompt = `Here are the passive browser signals intercepted from this visitor:
${JSON.stringify(signals, null, 2)}

Provide their cyber-tarot reading strictly in valid JSON format.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.85,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API returned error:', response.status, errText);
      return res.status(502).json({ error: 'Gemini API failed', details: errText });
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('No candidate content received from Gemini API');
    }

    // Parse JSON cleanly even if wrapped in markdown code blocks
    const cleaned = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsedFortune = JSON.parse(cleaned);
    parsedFortune.source = 'gemini';

    return res.status(200).json(parsedFortune);
  } catch (error) {
    console.error('Fortune API handler error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error processing tarot fortune'
    });
  }
}
