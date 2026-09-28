
import { useState, useRef, useEffect } from 'react'

const PATTERNS = [
  { name:"Bullish Flag", type:"Continuation", bias:"BULLISH", win:"72%" },
  { name:"Bearish Flag", type:"Continuation", bias:"BEARISH", win:"70%" },
  { name:"Double Top", type:"Reversal", bias:"BEARISH", win:"75%" },
  { name:"Double Bottom", type:"Reversal", bias:"BULLISH", win:"76%" },
  { name:"Head & Shoulders", type:"Reversal", bias:"BEARISH", win:"78%" },
  { name:"Inverse H&S", type:"Reversal", bias:"BULLISH", win:"79%" },
  { name:"Ascending Triangle", type:"Continuation", bias:"BULLISH", win:"71%" },
  { name:"Descending Triangle", type:"Continuation", bias:"BEARISH", win:"71%" },
  { name:"Symmetrical Triangle", type:"Both", bias:"BREAKOUT", win:"68%" },
  { name:"Rising Wedge", type:"Reversal", bias:"BEARISH", win:"69%" },
  { name:"Falling Wedge", type:"Reversal", bias:"BULLISH", win:"70%" },
  { name:"Cup & Handle", type:"Continuation", bias:"BULLISH", win:"74%" },
]

const WATCHLIST = [
  { symbol:"EURUSD", action:"HOLD", sentiment:"NEUTRAL", note:"No signal", conf:"45%" },
  { symbol:"NASDAQ100", action:"SELL", sentiment:"WEAK", note:"Breakdown detected", conf:"61%" },
  { symbol:"BTCUSD", action:"WATCH", sentiment:"NEUTRAL", note:"Awaiting pullback", conf:"52%" },
  { symbol:"GBPUSD", action:"BUY", sentiment:"STRONG", note:"Flag breakout", conf:"78%" },
  { symbol:"USDJPY", action:"HOLD", sentiment:"NEUTRAL", note:"Range", conf:"48%" },
]

export default function App(){
  const [tab, setTab] = useState("scanner") // scanner | positions | risk | settings
  const [preview, setPreview] = useState(null)
  const [pair, setPair] = useState("XAU/USD")
  const [trend, setTrend] = useState("Uptrend")
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [isPrivate, setIsPrivate] = useState(true) // hide P&L from visitors
  const [pin, setPin] = useState("")
  const [unlocked, setUnlocked] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const fileRef = useRef(null)

  useEffect(()=>{
    const check = ()=> setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check); return ()=>window.removeEventListener('resize', check)
  },[])

  const onUpload = (e)=>{
    const file = e.target.files?.[0]; if(!file) return
    const rd = new FileReader(); rd.onload = ev=>{ setPreview(ev.target.result); setResult(null) }; rd.readAsDataURL(file)
  }

  const scan = async ()=>{
    if(!preview) { fileRef.current?.click(); return }
    setScanning(true)
    await new Promise(r=>setTimeout(r,1200))
    const pick = PATTERNS[Math.floor(Math.random()*PATTERNS.length)]
    const conf = (88 + Math.random()*8).toFixed(1)
    setResult({
      pattern: pick,
      confidence: conf,
      momentum: trend==="Uptrend" ? "Bullish" : "Bearish",
      volatility: Math.random()>0.5 ? "Moderate" : "High",
      timeframe: "1m Scalp",
      rsi: (52 + Math.random()*20).toFixed(1),
      macd: (Math.random()*0.8).toFixed(2),
      vol: (1.2 + Math.random()*1.2).toFixed(1),
      entry: (2320 + Math.random()*20).toFixed(2),
      now: (2326 + Math.random()*10).toFixed(2),
      pnl: (120 + Math.random()*120).toFixed(2),
      lot: "0.25",
      sl: "2318.00",
      tp: "2335.00",
      pair: pair.replace('/',''),
      bias: pick.bias
    })
    setScanning(false)
  }

  const unlock = ()=>{
    if(pin==="2026" || pin.toLowerCase()==="samuel"){ setUnlocked(true); setIsPrivate(false) }
    else alert("Wrong PIN. Hint: 2026 or SAMUEL (demo private lock)")
  }

  // Styles - Cyberpunk AI SCALPER from reference image
  const S = {
    page:{ background:'#040712', color:'#E6E8EF', minHeight:'100vh', fontFamily:'Inter, system-ui', display:'flex', justifyContent:'center' },
    phone:{ width:'100%', maxWidth: isMobile? '100%' : '440px', background:'linear-gradient(180deg,#0A0F24 0%, #060A18 100%)', minHeight:'100vh', position:'relative', border: isMobile? 'none' : '1px solid #1A2A4A', boxShadow: isMobile? 'none' : '0 0 40px rgba(0,255,136,0.15)' },
    topBar:{ height:28, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 12px', fontSize:11, color:'#7B86A8', background:'#050A1A' },
    header:{ padding:'10px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' },
    pillAI:{ background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.4)', color:'#00D4FF', fontWeight:800, fontSize:11, padding:'6px 14px', borderRadius:99, letterSpacing:'0.08em', boxShadow:'0 0 12px rgba(0,212,255,0.3)' },
    imp:{ background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.5)', color:'#00FF88', fontSize:10, fontWeight:800, padding:'4px 8px', borderRadius:8, lineHeight:'1.1', textAlign:'center' },
    liveTitle:{ margin:'8px 12px', background:'linear-gradient(90deg,#0D1A33,#0A2A2E)', border:'1px solid rgba(0,255,136,0.25)', borderRadius:12, padding:'10px 14px', color:'#00FF88', fontWeight:900, fontSize:14, letterSpacing:'0.12em', boxShadow:'0 0 20px rgba(0,255,136,0.15), inset 0 0 20px rgba(0,212,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' },
    card:{ margin:'10px 12px', background:'linear-gradient(180deg,#0F1A33 0%, #0B142A 100%)', border:'1px solid rgba(0,212,255,0.18)', borderRadius:14, overflow:'hidden', boxShadow:'0 0 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,136,0.08) inset', position:'relative' },
    cardGlow:{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg, transparent, #00FF88, #00D4FF, transparent)' },
    cardHeader:{ padding:'10px 14px', borderBottom:'1px solid rgba(0,212,255,0.12)', fontWeight:800, fontSize:12, color:'#7B9ED9', letterSpacing:'0.08em' },
    buyBadge:{ background:'linear-gradient(90deg,#FFD86A,#D4AF37)', color:'#000', fontWeight:900, padding:'2px 6px', borderRadius:6, fontSize:10 },
    btn:{ flex:1, height:36, borderRadius:10, fontWeight:800, fontSize:11, cursor:'pointer', border:'1px solid' },
    nav:{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth: isMobile? '100%' : '440px', background:'#070D20', borderTop:'1px solid rgba(0,212,255,0.15)', display:'flex', justifyContent:'space-around', padding:'8px 0 12px', zIndex:30 },
  }

  return (
    <div style={S.page}>
      <div style={S.phone}>
        {/* Top status bar mock */}
        <div style={S.topBar}><span>9:11 • 5G</span><span>68% 🔋</span></div>

        {/* Header AI SCALPER + IMP */}
        <div style={S.header}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <img src="/icon-192.png" style={{width:28, height:28, borderRadius:8, background:'#000'}} onError={e=>e.target.style.display='none'} />
            <div style={{width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#D4AF37,#FFD86A)', display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontWeight:900, fontSize:12, marginLeft: isMobile? -28:0}}>S</div>
          </div>
          <div style={S.pillAI}>AI SCALPER</div>
          <div style={S.imp}><div>IMP</div><div>7/15</div></div>
        </div>

        {/* Live Title */}
        <div style={S.liveTitle}>
          <span>TRADING SCANNER — LIVE</span>
          <span style={{width:8, height:8, background:'#00FF88', borderRadius:999, boxShadow:'0 0 8px #00FF88'}}></span>
        </div>

        {/* TAB CONTENT */}
        {tab==="scanner" && (
          <>
            {/* SCAN SUMMARY - From your scanner logic but styled like reference */}
            <div style={S.card}>
              <div style={S.cardGlow}></div>
              <div style={S.cardHeader}>SCAN SUMMARY</div>
              <div style={{padding:'12px 14px'}}>
                {!result ? (
                  <div style={{textAlign:'center', padding:'10px 0'}}>
                    <div style={{fontSize:11, color:'#5F6B8F', marginBottom:8}}>Upload chart image to generate live scan</div>
                    <div onClick={()=>fileRef.current?.click()} style={{border:'1px dashed rgba(0,212,255,0.3)', borderRadius:10, padding:'18px', cursor:'pointer', background:'rgba(0,212,255,0.04)'}}>
                      <div style={{fontSize:22}}>📸</div>
                      <div style={{fontSize:12, fontWeight:700, color:'#00D4FF', marginTop:6}}>Drop chart image here</div>
                      <div style={{fontSize:10, color:'#5F6B8F'}}>XAUUSD • 42 Patterns • Fib 0.382-0.618</div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} style={{display:'none'}} />
                    <div style={{display:'flex', gap:8, marginTop:10}}>
                      <select value={pair} onChange={e=>setPair(e.target.value)} style={{flex:1, background:'#070D20', border:'1px solid #1E2E4A', color:'#fff', borderRadius:8, padding:'8px', fontSize:11}}><option>XAU/USD</option><option>EUR/USD</option><option>GBP/USD</option><option>BTC/USD</option><option>NAS100</option></select>
                      <select value={trend} onChange={e=>setTrend(e.target.value)} style={{flex:1, background:'#070D20', border:'1px solid #1E2E4A', color:'#fff', borderRadius:8, padding:'8px', fontSize:11}}><option>Uptrend</option><option>Downtrend</option><option>Sideways</option></select>
                    </div>
                    <button onClick={scan} disabled={scanning} style={{width:'100%', marginTop:10, height:38, borderRadius:10, background:'linear-gradient(90deg,#00FF88,#00D4FF)', color:'#000', fontWeight:900, border:'none', fontSize:12, cursor:'pointer'}}>{scanning? "SCANNING..." : "🔍 SCAN CHART NOW"}</button>
                  </div>
                ) : (
                  <>
                    <div style={{display:'flex', alignItems:'center', gap:8, background:'rgba(255,216,106,0.08)', border:'1px solid rgba(255,216,106,0.25)', borderRadius:10, padding:'8px 10px'}}>
                      <span style={{fontSize:18}}>📦</span>
                      <div>
                        <div style={{fontWeight:900, fontSize:12, color:'#FFD86A'}}>{result.bias} SIGNAL DETECTED • {result.pair}</div>
                        <div style={{fontSize:10, color:'#9AA3C3'}}>Pattern: {result.pattern.name} • {result.pattern.win} win</div>
                      </div>
                      <div style={{marginLeft:'auto', background:'#0A1A33', border:'1px solid rgba(0,255,136,0.3)', borderRadius:6, padding:'2px 6px', fontSize:10, color:'#00FF88'}}>{result.confidence}%</div>
                    </div>
                    <div style={{fontSize:10, color:'#7B86A8', marginTop:8, lineHeight:'1.4'}}>Confidence {result.confidence}% • Momentum: {result.momentum} • Volatility: {result.volatility} • Timeframe: {result.timeframe}</div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:10}}>
                      <div style={{background:'#070D20', borderRadius:8, padding:'8px', border:'1px solid rgba(0,212,255,0.12)'}}><div style={{fontSize:10, color:'#5F6B8F'}}>RSI</div><div style={{fontWeight:800, fontSize:13, color:'#00FF88'}}>{result.rsi}</div></div>
                      <div style={{background:'#070D20', borderRadius:8, padding:'8px', border:'1px solid rgba(0,212,255,0.12)'}}><div style={{fontSize:10, color:'#5F6B8F'}}>MACD ↗</div><div style={{fontWeight:800, fontSize:13, color:'#00FF88'}}>+{result.macd}</div></div>
                      <div style={{background:'#070D20', borderRadius:8, padding:'8px', border:'1px solid rgba(0,212,255,0.12)'}}><div style={{fontSize:10, color:'#5F6B8F'}}>VOL</div><div style={{fontWeight:800, fontSize:13, color:'#FFD86A'}}>{result.vol}x AVG</div></div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* OPEN POSITIONS - PRIVATE / HIDDEN FROM VISITORS */}
            <div style={{...S.card, borderColor: result ? 'rgba(0,255,136,0.4)' : 'rgba(0,212,255,0.18)', boxShadow: result ? '0 0 30px rgba(0,255,136,0.2)' : S.card.boxShadow}}>
              <div style={{...S.cardGlow, background:'linear-gradient(90deg, transparent, #00FF88, transparent)'}}></div>
              <div style={{...S.cardHeader, display:'flex', justifyContent:'space-between', color:'#00FF88'}}>
                <span>OPEN POSITIONS ({unlocked? "1" : "3"})</span>
                <span style={{fontSize:10, background: isPrivate? 'rgba(255,77,109,0.15)' : 'rgba(0,255,136,0.15)', border:'1px solid '+(isPrivate? '#FF4D6D':'#00FF88'), padding:'2px 6px', borderRadius:6, color: isPrivate? '#FF4D6D':'#00FF88'}}>{isPrivate? "PRIVATE" : "LIVE"} • {isPrivate? "HIDDEN" : "TOTAL P&L: +$184.20"}</span>
              </div>
              
              {isPrivate && !unlocked ? (
                <div style={{padding:'16px 14px', textAlign:'center'}}>
                  <div style={{fontSize:11, color:'#7B86A8'}}>Positions hidden from visitors • Owner only</div>
                  <div style={{marginTop:10, display:'flex', gap:8, justifyContent:'center'}}>
                    <input type="password" placeholder="Enter PIN (2026)" value={pin} onChange={e=>setPin(e.target.value)} style={{background:'#070D20', border:'1px solid #1E2E4A', color:'#fff', borderRadius:8, padding:'8px 10px', fontSize:12, width:140}} />
                    <button onClick={unlock} style={{background:'#00FF88', color:'#000', border:'none', borderRadius:8, padding:'8px 12px', fontWeight:800, fontSize:11, cursor:'pointer'}}>UNLOCK</button>
                  </div>
                  <div style={{marginTop:12, filter:'blur(8px)', pointerEvents:'none', opacity:0.5}}>
                    <div style={{background:'#0A1F0A', border:'1px solid #00FF88', borderRadius:10, padding:'10px', textAlign:'left'}}>
                      <div style={{fontWeight:900, color:'#00FF88'}}>● XAUUSD • BUY • 0.25 LOT</div>
                      <div style={{fontSize:11, color:'#9AA3C3'}}>ENTRY 2324.12 • NOW 2326.44 • +$184.20</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{padding:'12px 14px'}}>
                  <div style={{background:'linear-gradient(90deg, rgba(0,255,136,0.12), rgba(0,212,255,0.08))', border:'1px solid rgba(0,255,136,0.4)', borderRadius:10, padding:'10px 12px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{width:22, height:22, borderRadius:99, background:'#00FF88', display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontWeight:900, fontSize:10}}>●</div>
                      <div style={{fontWeight:900, fontSize:13, color:'#00FF88'}}>{result?.pair || "XAUUSD"} • BUY • {result?.lot || "0.25"} LOT</div>
                    </div>
                    <div style={{fontSize:11, color:'#E6E8EF', marginTop:6}}>ENTRY {result?.entry || "2324.12"} • NOW {result?.now || "2326.44"} • <span style={{color:'#00FF88'}}>+${result?.pnl || "184.20"} (+0.79%)</span></div>
                    <div style={{marginTop:8, height:4, background:'#0A1A2A', borderRadius:99, overflow:'hidden'}}><div style={{width:'68%', height:'100%', background:'linear-gradient(90deg,#00FF88,#00D4FF)'}}></div></div>
                    <div style={{fontSize:10, color:'#7B86A8', marginTop:8}}>STOP LOSS: {result?.sl || "2318.00"} • TAKE PROFIT: {result?.tp || "2335.00"}</div>
                  </div>
                  <div style={{display:'flex', gap:8, marginTop:10}}>
                    <button style={{...S.btn, background:'rgba(255,77,109,0.08)', borderColor:'rgba(255,77,109,0.4)', color:'#FF4D6D'}}>REMOVE</button>
                    <button style={{...S.btn, background:'rgba(0,212,255,0.08)', borderColor:'rgba(0,212,255,0.4)', color:'#00D4FF'}}>STOP</button>
                    <button style={{...S.btn, background:'rgba(0,255,136,0.08)', borderColor:'rgba(0,255,136,0.4)', color:'#00FF88'}}>SYMBOLS</button>
                  </div>
                </div>
              )}
            </div>

            {/* WATCHLIST SCAN */}
            <div style={S.card}>
              <div style={S.cardGlow}></div>
              <div style={S.cardHeader}>WATCHLIST SCAN</div>
              <div style={{padding:'6px 0'}}>
                {WATCHLIST.map((w,i)=>(
                  <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'1px solid rgba(0,212,255,0.08)'}}>
                    <div style={{width:8, height:8, borderRadius:99, background: w.action==="BUY"?'#00FF88' : w.action==="SELL"?'#FF4D6D' : w.action==="WATCH"?'#00D4FF' : '#5F6B8F'}}></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12, fontWeight:700}}>{w.symbol} • {w.action} • {w.sentiment}</div>
                      <div style={{fontSize:10, color:'#5F6B8F'}}>{w.note} • Conf {w.conf}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{height:80}}></div>
          </>
        )}

        {tab==="positions" && (
          <div style={{padding:12}}>
            <div style={S.card}><div style={S.cardHeader}>POSITIONS • PRIVATE</div><div style={{padding:20, textAlign:'center', color:'#5F6B8F', fontSize:12}}>{unlocked? "Live positions visible to owner only" : "Unlock with PIN to view positions"}</div></div>
          </div>
        )}
        {tab==="risk" && (
          <div style={{padding:12}}>
            <div style={S.card}><div style={S.cardHeader}>RISK • EQUITY AWARE</div><div style={{padding:14, fontSize:12, lineHeight:'1.6', color:'#9AA3C3'}}>Max Daily DD 3%<br/>Max Total DD 10%<br/>Lot: Broker Min (0.01)<br/>ATR SL 1.5x • TP1 1.0x • TP2 1.618x<br/>News aware: pause 30min before high impact</div></div>
          </div>
        )}
        {tab==="settings" && (
          <div style={{padding:12}}>
            <div style={S.card}><div style={S.cardHeader}>SETTINGS • SAMUEL FX PRO</div><div style={{padding:14}}>
              <div style={{fontSize:11, color:'#5F6B8F'}}>PRIVACY MODE</div>
              <button onClick={()=>setIsPrivate(!isPrivate)} style={{marginTop:8, width:'100%', height:36, borderRadius:8, background: isPrivate? '#FF4D6D' : '#00FF88', color: isPrivate? '#fff':'#000', border:'none', fontWeight:800}}>{isPrivate? "PRIVATE ON - Hide from visitors" : "PRIVATE OFF - Show live data"}</button>
              <div style={{marginTop:16, fontSize:10, color:'#5F6B8F'}}>Interface responsive: {isMobile? "Mobile (100%)" : "Desktop (440px centered)"} • © 2026 SAMUEL • v5 AI SCALPER</div>
            </div></div>
          </div>
        )}

        {/* Bottom Nav */}
        <div style={S.nav}>
          {[
            {id:"scanner", icon:"◧", label:"SCANNER"},
            {id:"positions", icon:"◫", label:"POSITIONS"},
            {id:"risk", icon:"⬡", label:"RISK"},
            {id:"settings", icon:"☰", label:"SETTINGS"},
          ].map(n=>(
            <div key={n.id} onClick={()=>setTab(n.id)} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'pointer', color: tab===n.id? '#00FF88':'#5F6B8F'}}>
              <div style={{fontSize:16}}>{n.icon}</div>
              <div style={{fontSize:9, fontWeight:800, letterSpacing:'0.06em'}}>{n.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop side panel for larger screens - shows your old scanner as advanced mode */}
      {!isMobile && (
        <div style={{width:'760px', marginLeft:20, paddingTop:20}}>
          <div style={{background:'#0C1120', border:'1px solid #1E2742', borderRadius:16, padding:16}}>
            <div style={{fontWeight:800, fontSize:13, marginBottom:12}}>🖥️ DESKTOP ADVANCED MODE • Chart Scanner Engine</div>
            <div style={{border:'1px dashed #2A3A66', borderRadius:10, height:320, display:'flex', alignItems:'center', justifyContent:'center', background:'#070A14', position:'relative', overflow:'hidden'}}>
              {preview ? <><img src={preview} style={{width:'100%', height:'100%', objectFit:'contain'}} /><div style={{position:'absolute', bottom:8, left:8, background:'rgba(0,0,0,0.7)', padding:'4px 8px', borderRadius:6, fontSize:10, color:'#00FF88'}}>Fib 38.2% BUY ZONE • 61.8% GOLDEN • {pair}</div></> : <div style={{textAlign:'center'}}><div style={{fontSize:24}}>📸</div><div style={{fontSize:12, color:'#7B86A8'}}>Desktop: Upload chart to populate mobile SCAN SUMMARY</div></div>}
            </div>
            <div style={{marginTop:10, display:'flex', gap:8}}>
              <button onClick={()=>fileRef.current?.click()} style={{flex:1, height:36, borderRadius:8, background:'#1A2340', border:'1px solid #2A3A66', color:'#fff', fontSize:11}}>UPLOAD CHART</button>
              <button onClick={scan} style={{flex:1, height:36, borderRadius:8, background:'linear-gradient(90deg,#00FF88,#00D4FF)', color:'#000', fontWeight:800, fontSize:11, border:'none'}}>{scanning? "SCANNING..." : "SCAN TO MOBILE"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
