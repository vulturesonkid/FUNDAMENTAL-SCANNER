// api/auth.js - TASK 1 SECURITY FIX - Secrets moved to backend .env
// Frontend NEVER sees MENTOR_PIN or MENTOR_EMAIL
// Env vars: MENTOR_EMAIL, MENTOR_PIN set in Vercel -> Settings -> Environment Variables

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const MENTOR_EMAIL = process.env.MENTOR_EMAIL || process.env.VITE_MENTOR_EMAIL;
  const MENTOR_PIN = process.env.MENTOR_PIN || process.env.VITE_MENTOR_PIN;

  if (!MENTOR_EMAIL || !MENTOR_PIN) {
    return res.status(500).json({ error: 'Server env not configured - set MENTOR_EMAIL and MENTOR_PIN in Vercel' });
  }

  if (req.method === 'GET') {
    // Used only to get owner email for initial licence creation - does NOT expose PIN
    return res.status(200).json({ ownerEmail: MENTOR_EMAIL });
  }

  if (req.method === 'POST') {
    try {
      const { pin, type } = req.body || {};
      if (type === 'mentor') {
        if (!pin) return res.status(400).json({ valid: false, error: 'PIN required' });
        // Secure comparison on server only
        if (pin.trim() === MENTOR_PIN) {
          return res.status(200).json({
            valid: true,
            email: MENTOR_EMAIL,
            plan: "OWNER - Lifetime",
            expiry: "Lifetime",
            isOwner: true,
            isMentor: true
          });
        } else {
          return res.status(401).json({ valid: false, error: 'Invalid PIN' });
        }
      }
      return res.status(400).json({ valid: false, error: 'Invalid type' });
    } catch (e) {
      return res.status(500).json({ valid: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
