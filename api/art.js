/**
 * /api/art.js
 * 
 * Generates an AI tarot card illustration for the reading using Gemini image generation,
 * with a high-fidelity cyber-mystic SVG fallback if the API call fails, is unavailable,
 * or exceeds 15 seconds.
 * 
 * Rules:
 * - Only archetype title, vibe and theme in the prompt:
 *   "Tarot card illustration, dark cyber-mystic style, neon green and violet on near-black, ornate border, no text, no letters, no logos, no real people"
 * - Never include personal data or visitor signals in the prompt.
 * - Return image as base64 data URL.
 * - Cache-Control: no-store.
 * - 15-second execution budget.
 */

import { GoogleGenAI } from '@google/genai';
import { generateCardArtDataUrl } from '../src/cardArtFallback.js';

if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env.local');
  } catch (e) {}
  try {
    process.loadEnvFile('.env');
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
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

  // Extract ONLY archetype title, vibe, and theme (NEVER personal visitor data)
  const rawArchetype = typeof body.archetype === 'string' ? body.archetype.trim() : 'The Digital Wanderer';
  const rawVibe = typeof body.vibe === 'string' ? body.vibe.trim() : (typeof body.vibe_emoji === 'string' ? body.vibe_emoji.trim() : '🔮');
  const rawTheme = typeof body.theme === 'string' ? body.theme.trim() : 'Destiny & device memory';

  // Sanitize input to only alpha-numeric and standard symbols (no prompt injections)
  const archetype = rawArchetype.slice(0, 60).replace(/[^\w\s\-&]/g, '');
  const vibe = rawVibe.slice(0, 10);
  const theme = rawTheme.slice(0, 50).replace(/[^\w\s\-&]/g, '');

  const prompt = `Tarot card illustration, dark cyber-mystic style, neon green and violet on near-black, ornate border, no text, no letters, no logos, no real people. Archetype: ${archetype}, Theme: ${theme}, Vibe: ${vibe}`;

  const apiKey = process.env.GEMINI_API_KEY;

  // Function to return immediate SVG fallback
  const sendSvgFallback = (reason = 'fallback') => {
    console.info(`[/api/art] Returning SVG fallback (reason: ${reason}) for archetype: "${archetype}"`);
    const svgDataUrl = generateCardArtDataUrl(vibe, archetype, theme);
    return res.status(200).json({
      image: svgDataUrl,
      source: 'svg-fallback',
      archetype,
      vibe,
      fallbackReason: reason
    });
  };

  if (!apiKey || !apiKey.trim()) {
    return sendSvgFallback('missing_api_key');
  }

  const ai = new GoogleGenAI({ apiKey });

  // 15-second timeout budget
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Image generation timed out after 15 seconds')), 15000);
  });

  const imageGenerationPromise = async () => {
    // Model candidates: gemini-2.5-flash-image, imagen-3.0-generate-002
    const models = ['gemini-2.5-flash-image', 'imagen-3.0-generate-002'];

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt
        });

        // Search for inlineData image in candidate parts
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            const base64Img = `data:${mime};base64,${part.inlineData.data}`;
            return {
              image: base64Img,
              source: 'gemini',
              model,
              archetype,
              vibe
            };
          }
        }
      } catch (err) {
        console.warn(`[/api/art] Model ${model} failed:`, err.message || err);
        // Continue to next model or fallback
      }
    }

    throw new Error('All image models failed or returned no image parts');
  };

  try {
    const result = await Promise.race([imageGenerationPromise(), timeoutPromise]);
    return res.status(200).json(result);
  } catch (err) {
    console.warn('[/api/art] AI image generation unsuccessful:', err.message || err);
    return sendSvgFallback(err.message || 'error');
  }
}
