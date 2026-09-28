import { useState } from 'react';

export default function App() {
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async (file) => {
    if (!file) return;
    setScanning(true);

    // Laser animation 2.5s
    await new Promise(r => setTimeout(r, 2500));

    // ANTI-REPAINT: same image = same result, no repaint
    const hash = file.name + '-' + file.size;
    const cached = localStorage.getItem('scan_' + hash);
    if (cached) {
      setResult(JSON.parse(cached));
      setScanning(false);
      return;
    }

    // VISION PLUGIN: reads REAL price from image
    const form = new FormData();
    form.append('chart', file);
    const visionRes = await fetch('/api/vision', { method: 'POST', body: form });
    const vision = await visionRes.json();

    if (vision.error === 'CANNOT_FETCH') {
      setResult({ error: 'Cannot fetch data - Please upload clearer chart' });
      setScanning(false);
      return;
    }

    // PATTERN PLUGIN: hidden brain (not on dashboard)
    const patternRes = await fetch('/api/pattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vision)
    });
    const pattern = await patternRes.json();

    // HOLD if market tight - stored 24h in positions tab
    if (pattern.type === 'HOLD') {
      const hold = { pair: 'XAU/USD', type: 'HOLD', note: 'Market tight - HOLD', expiresAt: Date.now() + 86400000 };
      const positions = JSON.parse(localStorage.getItem('fx_positions') || '[]');
      localStorage.setItem('fx_positions', JSON.stringify([...positions, hold]));
      setResult(hold);
      setScanning(false);
      return;
    }

    // Save 24h vault
    const pos = {...pattern, createdAt: Date.now(), expiresAt: Date.now() + 86400000 };
    const positions = JSON.parse(localStorage.getItem('fx_positions') || '[]').filter(p => Date.now() < p.expiresAt);
    localStorage.setItem('fx_positions', JSON.stringify([...positions, pos]));
    localStorage.setItem('scan_' + hash, JSON.stringify(pattern));

    setResult(pattern);
    setScanning(false);
  };

  return (
    <div className="card" style={{ padding: '20px', maxWidth: '600px', margin: '50px auto' }}>
      <h2>SAMUEL FX PRO - SCANNER</h2>
      <input type="file" accept="image/*" onChange={e => handleScan(e.target.files[0])} />
      {scanning && <div style={{ height: '3px', background: '#00ff88', marginTop: '10px', boxShadow: '0 0 10px #00ff88' }}>Scanning...</div>}
      {result &&!result.error && (
        <div style={{ marginTop: '20px' }}>
          <div>{result.pattern} • {result.type}</div>
          <div>Entry: {result.entry}</div>
          <div>SL: {result.sl} TP: {result.tp}</div>
        </div>
      )}
      {result?.error && <div style={{ color: '#ff6b6b', marginTop: '20px' }}>{result.error}</div>}
    </div>
  );
}
