// api/vault.js - Email hardcoded to key + delete authority
let MEMORY_KEYS = globalThis._VAULT_KEYS || [];
globalThis._VAULT_KEYS = MEMORY_KEYS;
let DELETED_KEYS = globalThis._DELETED_KEYS || [];
globalThis._DELETED_KEYS = DELETED_KEYS;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body || {};
  if (typeof body === 'string') { try{ body = JSON.parse(body); }catch{} }
  const action = body.action || req.query.action || '';
  const key = body.key || req.query.key || '';
  const email = (body.email || req.query.email || 'UNASSIGNED').toString().toLowerCase().trim();
  const plan = body.plan || 'PRO - 30 Days';
  const expiry = body.expiry || 'Lifetime';

  const cleanKey = key ? key.toString().trim().toUpperCase().replace(/\s+/g,'') : '';
  MEMORY_KEYS = globalThis._VAULT_KEYS || [];
  DELETED_KEYS = globalThis._DELETED_KEYS || [];

  // DELETE - you have authority
  if(action==='delete'){
    if(!cleanKey) return res.status(200).json({deleted:false});
    MEMORY_KEYS = MEMORY_KEYS.filter(k=>k.key!==cleanKey);
    DELETED_KEYS = [...new Set([...DELETED_KEYS, cleanKey])];
    globalThis._VAULT_KEYS = MEMORY_KEYS;
    globalThis._DELETED_KEYS = DELETED_KEYS;
    console.log('DELETED:', cleanKey);
    return res.status(200).json({deleted:true, keys:MEMORY_KEYS, deletedKeys:DELETED_KEYS});
  }

  // SAVE - hardcode email to key at creation
  if(action==='save'){
    if(!cleanKey) return res.status(200).json({saved:false});
    // If previously deleted, remove from deleted
    DELETED_KEYS = DELETED_KEYS.filter(k=>k!==cleanKey);
    MEMORY_KEYS = MEMORY_KEYS.filter(k=>k.key!==cleanKey);
    const entry = {
      key: cleanKey,
      email: email, // HARDCODED EMAIL TO KEY
      plan, expiry,
      status:'Active',
      created: new Date().toISOString().slice(0,10),
      isOwner: email==='vulturesonkidd@gmail.com'
    };
    MEMORY_KEYS.unshift(entry);
    globalThis._VAULT_KEYS = MEMORY_KEYS;
    globalThis._DELETED_KEYS = DELETED_KEYS;
    return res.status(200).json({saved:true, keys:MEMORY_KEYS});
  }

  // CHECK - if deleted => invalid key
  if(action==='check' || action==='login'){
    if(!cleanKey) return res.status(200).json({valid:false, reason:'EMPTY'});
    if(DELETED_KEYS.includes(cleanKey)){
      return res.status(200).json({valid:false, reason:'DELETED', message:'Invalid key - revoked by admin'});
    }
    const found = MEMORY_KEYS.find(k=>k.key===cleanKey);
    if(found){
      // Email hardcoded check: if UNASSIGNED allow first login, then bind
      if(found.email==='unassigned' || found.email==='' || found.email===email || email==='vulturesonkidd@gmail.com'){
        return res.status(200).json({valid:true, licence:found, keys:MEMORY_KEYS});
      } else {
        return res.status(200).json({valid:false, reason:'EMAIL_MISMATCH', message:'Key assigned to '+found.email});
      }
    }
    // Fallback for old keys still valid if format SAMUEL-
    if(cleanKey.startsWith('SAMUEL-') && cleanKey.length>=14){
      return res.status(200).json({valid:true, licence:{key:cleanKey, email, plan:'PRO', expiry:'Lifetime', status:'Active'}});
    }
    return res.status(200).json({valid:false, reason:'NOT_FOUND'});
  }

  if(action==='list'){
    return res.status(200).json({keys:MEMORY_KEYS, deletedKeys:DELETED_KEYS});
  }

  return res.status(200).json({keys:MEMORY_KEYS, deletedKeys:DELETED_KEYS, status:'vault ready'});
}
