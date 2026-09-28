import { useState } from 'react';

export default function App() {
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async (file) => {
    if (!file) return;
    setScanning(true);
    await new Promise(r => setTimeout(r, 2500));

    const hash = file.name + '-' + file.size;
    const cached = localStorage.getItem('scan_' + hash);
    if (cached) {
      setResult(JSON.parse(cached));
      setScanning(false);
      return;
    }

    const form = new FormData();
    form.append('chart', file);
    const visionRes = await fetch('/api/vision', { method: 'POST', body: form });
    const vision = await visionRes.json();

    if (vision.error === 'CANNOT_FETCH') {
      setResult({ error: 'Cannot fetch data - Please upload clearer chart' });
      setScanning(false);
      return;
    }

    const patternRes = await fetch('/api/pattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vision)
    });
    const pattern = await patternRes.json();

    if (pattern.type === 'HOLD') {
      const hold = { pair: 'XAU/USD', type: 'HOLD', note: 'Market tight - HOLD', expiresAt: Date.now() + 86400000 };
      setResult(hold);
      setScanning(false);
      return;
    }

    localStorage.setItem('scan_' + hash, JSON.stringify(pattern));
    setResult(pattern);
    setScanning(false);
  };

  return (
    <div className="card">
      <h2 style={{ margin: 0, color: '#00ff88' }}>SAMUEL FX PRO - SCANNER</h2>
      <p style={{ opacity: 0.7, fontSize: '13px' }}>Upload chart to scan</p>
      <input type="file" accept="image/*" onChange={e => handleScan(e.target.files[0])} />
      {scanning && <div style={{ height: '3px', background: '#00ff88', marginTop: '15px', boxShadow: '0 0 15px #00ff88', animation: 'scanMove 2.5s linear infinite' }}></div>}
      {result &&!result.error && (
        <div style={{ marginTop: '20px', background: 'rgba(0,255,136,0.1)', padding: '15px', borderRadius: '10px' }}>
          <div style={{ fontWeight: 'bold' }}>{result.pattern} • {result.type}</div>
          <div style={{ marginTop: '8px' }}>Entry: {result.entry} | SL: {result.sl} | TP: {result.tp}</div>
          {result.winRate && <div style={{ marginTop: '5px', color: '#00ff88' }}>{result.winRate}% • BULLISH</div>}
        </div>
      )}
      {result?.error && <div style={{ color: '#ff6b6b', marginTop: '20px' }}>{result.error}</div>}
    </div>
  );
}
