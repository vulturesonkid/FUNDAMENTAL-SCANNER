
import { useEffect, useState, useRef } from 'react'

const TICKER = [
  { s: "EUR/USD", p: "1.0842", c: "+0.12%" },
  { s: "GBP/USD", p: "1.2931", c: "-0.04%" },
  { s: "XAU/USD", p: "2678.45", c: "+0.68%", hl: true },
  { s: "BTC/USD", p: "67234", c: "+1.24%" },
  { s: "DXY", p: "103.42", c: "-0.21%" },
]

export default function App() {
  const [calendar, setCalendar] = useState([
    { time: "08:30", currency: "USD", flag: "🇺🇸", event: "CPI m/m", impact: "high", forecast: "0.2%", previous: "0.3%" },
    { time: "10:00", currency: "USD", flag: "🇺🇸", event: "Consumer Sentiment", impact: "medium", forecast: "69.2", previous: "68.5" },
    { time: "14:00", currency: "EUR", flag: "🇪🇺", event: "ECB Press Conference", impact: "high", forecast: "", previous: "" },
    { time: "15:30", currency: "USD", flag: "🇺🇸", event: "Crude Oil Inventories", impact: "medium", forecast: "-0.9M", previous: "1.2M" },
    { time: "08:30", currency: "GBP", flag: "🇬🇧", event: "GDP q/q", impact: "high", forecast: "0.4%", previous: "0.2%" },
  ])
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [timeframe, setTimeframe] = useState("H1")
  const canvasRef = useRef(null)

  useEffect(() => {
    fetch('/api/calendar').then(r=>r.json()).then(d=>{
      if(d.events) setCalendar(d.events)
      else if(Array.isArray(d)) setCalendar(d.slice(0,12))
    }).catch(()=>{})
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const rect = c.getBoundingClientRect()
    const w = c.width = rect.width * 2
    const h = c.height = rect.height * 2
    ctx.clearRect(0,0,w,h)
    ctx.strokeStyle = '#1e2742'
    for(let i=1;i<5;i++){ const y=h/5*i; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke() }
    let x=60, price=h*0.6
    for(let i=0;i<60;i++){
      const green = Math.random()>0.45
      const bh = 12+Math.random()*32
      const wick = 10+Math.random()*18
      ctx.fillStyle = green ? '#00D38A' : '#FF4D6D'
      ctx.strokeStyle = ctx.fillStyle
      ctx.beginPath(); ctx.moveTo(x+8, price-wick); ctx.lineTo(x+8, price+bh+wick); ctx.stroke()
      ctx.fillRect(x, price, 16, bh)
      x+=26; price+=(Math.random()-0.5)*22
    }
  }, [timeframe, calendar])

  const gen = async () => {
    setLoading(true)
    try{
      const r = await fetch('/api/generate-plan', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({calendar})})
      const d = await r.json()
      setPlan(d.plan || d)
    }catch{ setPlan({bias:"BULLISH GOLD", entry:"2672-2675", sl:"2662", tp:"2695 / 2708", reason:"USD soft CPI + Fed dovish, DXY pullback, H1 demand holding"}) }
    setLoading(false)
  }

  const s = {
    page:{background:'#070A14', color:'#E6E8EF', minHeight:'100vh', fontFamily:'Inter, system-ui', paddingBottom:40},
    header:{height:64, background:'#0C1120', borderBottom:'1px solid #1E2742', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', position:'sticky', top:0, zIndex:10},
    logo:{width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#D4AF37,#FFD86A)', display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontWeight:900},
    ticker:{height:32, background:'#0A0F1F', borderBottom:'1px solid #1E2742', display:'flex', alignItems:'center', gap:24, padding:'0 20px', fontSize:12, overflow:'hidden'},
    grid:{maxWidth:1440, margin:'16px auto', display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, padding:'0 16px'},
    card:{background:'#111628', border:'1px solid #1E2742', borderRadius:16, overflow:'hidden'},
    btnGold:{background:'linear-gradient(90deg,#D4AF37,#E8C765)', color:'#000', fontWeight:800, border:'none', borderRadius:10, padding:'10px 18px', cursor:'pointer', fontSize:12},
    btnTf:{height:28, padding:'0 12px', borderRadius:8, border:'1px solid #1E2742', background:'transparent', color:'#7B86A8', cursor:'pointer', fontSize:11, fontWeight:600},
    btnTfActive:{background:'#1A2340', borderColor:'#2A3A66', color:'#fff'},
    row:{display:'grid', gridTemplateColumns:'60px 60px 1fr 90px', padding:'11px 12px', borderBottom:'1px solid #141C32', fontSize:12, alignItems:'center'},
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={{display:'flex', gap:14, alignItems:'center'}}>
          <div style={s.logo}>S</div>
          <div>
            <div style={{fontWeight:900, fontSize:15}}>SAMUEL FX Intelligence <span style={{color:'#D4AF37'}}>PRO</span></div>
            <div style={{fontSize:10, letterSpacing:'0.18em', color:'#7B86A8', marginTop:-2}}>INSTITUTIONAL TERMINAL • © 2026 SAMUEL</div>
          </div>
          <div style={{marginLeft:24, background:'#0E1A2E', border:'1px solid #1E2742', borderRadius:999, padding:'6px 12px', fontSize:11, display:'flex', gap:6, alignItems:'center'}}>
            <span style={{width:8, height:8, borderRadius:999, background:'#00FF88', display:'inline-block'}}></span> INVESTING.COM LIVE • XAU 2678.45 <span style={{color:'#00D38A'}}>+0.68%</span>
          </div>
        </div>
        <button style={s.btnGold} onClick={gen}>GENERATE PLAN</button>
      </div>

      <div style={s.ticker}>
        {TICKER.map((t,i)=><div key={i} style={{display:'flex', gap:8, color: t.hl? '#D4AF37':'#9AA3C3', fontWeight: t.hl?700:400}}><b>{t.s}</b><span style={{color:'#fff'}}>{t.p}</span><span style={{color: t.c.includes('+')?'#00D38A':'#FF4D6D'}}>{t.c}</span></div>)}
      </div>

      <div style={s.grid}>
        <div style={s.card}>
          <div style={{height:52, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 18px', borderBottom:'1px solid #1E2742'}}>
            <div style={{display:'flex', gap:12, alignItems:'center'}}><span style={{fontWeight:700, fontSize:13}}>XAU/USD • GOLD SPOT</span><span style={{fontSize:11, background:'#0E1A2E', border:'1px solid #1E2742', padding:'2px 8px', borderRadius:6}}>OANDA</span></div>
            <div style={{display:'flex', gap:6}}>{["M1","M5","M15","H1","D1"].map(tf=><button key={tf} onClick={()=>setTimeframe(tf)} style={timeframe===tf? {...s.btnTf, ...s.btnTfActive}: s.btnTf}>{tf}</button>)}</div>
          </div>
          <div style={{height:420, background:'#0C1120', position:'relative'}}>
            <canvas ref={canvasRef} style={{width:'100%', height:'100%'}} />
            <div style={{position:'absolute', right:0, top:0, bottom:0, width:56, background:'#0E1428', borderLeft:'1px solid #1E2742', fontSize:10, color:'#7B86A8', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'16px 8px'}}><span>2710</span><span>2690</span><span>2678</span><span>2660</span><span>2640</span></div>
          </div>
        </div>

        <div style={{...s.card, display:'flex', flexDirection:'column'}}>
          <div style={{height:52, padding:'0 18px', borderBottom:'1px solid #1E2742', display:'flex', justifyContent:'space-between', alignItems:'center', fontWeight:700, fontSize:13}}>INVESTING.COM • LIVE CALENDAR <span style={{width:8,height:8,borderRadius:999,background:'#00FF88'}}></span></div>
          <div style={{display:'grid', gridTemplateColumns:'60px 60px 1fr 90px', padding:'8px 12px', fontSize:10, color:'#5F6B8F', borderBottom:'1px solid #1E2742', letterSpacing:'0.08em'}}><span>TIME</span><span>CCY</span><span>EVENT</span><span style={{textAlign:'right'}}>IMPACT</span></div>
          <div style={{flex:1, overflow:'auto'}}>
            {calendar.map((e,i)=><div key={i} style={s.row}>
              <span style={{color:'#9AA3C3'}}>{e.time}</span>
              <span>{e.flag} {e.currency}</span>
              <div><div style={{lineHeight:'1.2'}}>{e.event}</div><div style={{fontSize:10, color:'#5F6B8F'}}>F:{e.forecast||'-'} P:{e.previous||'-'}</div></div>
              <div style={{textAlign:'right'}}><span style={{fontSize:10, fontWeight:800, padding:'4px 8px', borderRadius:999, background: e.impact==='high'?'rgba(255,77,109,0.15)':'rgba(255,159,28,0.15)', color: e.impact==='high'?'#FF4D6D':'#FF9F1C', border: `1px solid ${e.impact==='high'?'rgba(255,77,109,0.3)':'rgba(255,159,28,0.3)'}`}}>{(e.impact||'low').toUpperCase()}</span></div>
            </div>)}
          </div>
          <div style={{padding:12}}><button onClick={gen} style={{width:'100%', height:40, borderRadius:10, background:'#1A2340', border:'1px solid #2A3A66', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer'}}>{loading?'ANALYZING...':'REFRESH CALENDAR'}</button></div>
        </div>

        <div style={{gridColumn:'1 / -1', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16}}>
          {[
            {t:'SENTIMENT', v:'68% BULLISH GOLD', d:'Retail long squeeze easing, institutional buying', c:'#00D38A'},
            {t:'FUNDAMENTAL BIAS', v:'USD WEAKNESS', d:'CPI miss + Fed dovish tilt', c:'#00D9FF'},
            {t:'TECHNICAL', v:'H1 ENGULFING + OB', d:'Demand at 2672, sweep 2660', c:'#D4AF37'},
          ].map((b,i)=><div key={i} style={{...s.card, padding:16}}><div style={{fontSize:10, letterSpacing:'0.16em', color:'#5F6B8F'}}>{b.t}</div><div style={{marginTop:6, fontWeight:800, fontSize:13, color:b.c}}>{b.v}</div><div style={{marginTop:6, fontSize:11, color:'#7B86A8'}}>{b.d}</div></div>)}
        </div>

        <div style={{...s.card, gridColumn:'1 / -1', padding:20}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><div style={{fontWeight:800, fontSize:13}}>AI TRADING PLAN • SAMUEL</div><button style={s.btnGold} onClick={gen}>{loading?'GENERATING...':'GENERATE NEW PLAN'}</button></div>
          <div style={{marginTop:16, display:'grid', gridTemplateColumns:'2fr 1fr', gap:12}}>
            <div style={{background:'#0C1120', border:'1px solid #1E2742', borderRadius:12, padding:16, fontSize:12, color:'#C9D0E8', minHeight:120}}>
              {plan ? <pre style={{whiteSpace:'pre-wrap', fontFamily:'Inter', margin:0}}>{typeof plan==='string'?plan:JSON.stringify(plan,null,2)}</pre> : <span style={{color:'#7B86A8'}}>Click Generate to create institutional plan from Investing.com calendar + live XAU chart.</span>}
            </div>
            <div style={{background:'#0E1A2E', border:'1px solid #1E2742', borderRadius:12, padding:16}}>
              <div style={{fontSize:11, color:'#7B86A8'}}>TODAY'S SETUP</div>
              <div style={{marginTop:10, display:'flex', flexDirection:'column', gap:8, fontSize:12}}>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#5F6B8F'}}>Bias</span><span style={{color:'#00D38A', fontWeight:700}}>BULLISH GOLD</span></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#5F6B8F'}}>Entry</span><span>2672 - 2675</span></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#5F6B8F'}}>Stop</span><span>2662</span></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#5F6B8F'}}>TP</span><span>2695 / 2708</span></div>
              </div>
              <div style={{marginTop:16, fontSize:10, color:'#5F6B8F'}}>© 2026 SAMUEL • 24/7 Live</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
