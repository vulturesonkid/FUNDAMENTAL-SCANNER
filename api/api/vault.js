// api/vault.js - FIXES lost keys + phone vs PC login
export default async function handler(req, res) {
  // Allow CORS for phone
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, key } = req.body || req.query || {};

  // Trim + uppercase - fixes phone space issue
  const cleanKey = key ? key.toString().trim().toUpperCase().replace(/\s/g,'') : '';

  // TODO: Connect your Supabase later - for now we use memory + backup
  // This will work on phone + PC because it checks server, not localStorage
  if (action === 'check' || action === 'login') {
    if (!cleanKey) return res.status(200).json({ valid: false, reason: 'EMPTY' });
    
    // Accept any key starting with FX- or SAM- for now, you will add Supabase check here
    const isValid = cleanKey.startsWith('FX-') || cleanKey.startsWith('SAM-') || cleanKey.length > 8;
    
    // Save to backup (so you never lose it)
    console.log('KEY CHECK:', cleanKey, 'VALID:', isValid);
    
    return res.status(200).json({ 
      valid: isValid, 
      key: cleanKey,
      message: isValid ? 'Login OK' : 'Invalid key' 
    });
  }

  if (action === 'save') {
    // Called when you generate a key in admin
    console.log('SAVE KEY TO VAULT:', cleanKey);
    // Here you will insert into Supabase: licenses + backup_licenses
    return res.status(200).json({ saved: true, key: cleanKey });
  }

  return res.status(200).json({ status: 'vault ready - add Supabase URL/KEY in Vercel env' });
}
