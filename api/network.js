/**
 * /api/network.js
 * Serverless function for opt-in connection revelation.
 * 
 * - Reads ONLY the request header 'x-vercel-ip-country'.
 * - Returns { country }.
 * - Does NOT read, return, log, or store IP or city.
 * - Sets Cache-Control: no-store.
 */

export default async function handler(req, res) {
  // Cache-Control: no-store
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  // Read ONLY the x-vercel-ip-country header
  const countryHeader = req.headers['x-vercel-ip-country'];
  const country = (typeof countryHeader === 'string' && countryHeader.trim())
    ? countryHeader.trim().toUpperCase()
    : null;

  // Never read, return, log, or store IP or city
  return res.status(200).json({ country });
}
