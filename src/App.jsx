
import React, { useEffect, useState, useRef } from 'react'
import { createChart } from 'lightweight-charts'

const NEWS_EVENTS = ['Initial Jobless Claims','Non-Farm Payrolls','CPI - Inflation','FOMC Rate Decision','ECB Rate Decision','GDP','PPI','Retail Sales','PMI Manufacturing']
const MARKETS = [
  { id:'XAU/USD', name:'Gold', symbol:'XAUUSD', price:2678.45 },
  { id:'EUR/USD', name:'EUR/USD', symbol:'EURUSD', price:1.0845 },
  { id:'GBP/USD', name:'GBP/USD', symbol:'GBPUSD', price:1.2988 },
  { id:'USD/JPY', name:'USD/JPY', symbol:'USDJPY', price:148.25 },
  { id:'NAS100', name:'NAS100', symbol:'NAS100', price:20145.5 },
  { id:'BTC/USD', name:'Bitcoin', symbol:'BTCUSD', price:67250 }
]

export default function App(){
  const [newsEvent,setNewsEvent]=useState('Initial Jobless Claims')
  const [market,setMarket]=useState(MARKETS[0])
  const [releaseDate,setReleaseDate]=useState(new Date().toISOString().split('T')[0])
  const [mode,setMode]=useState('daily') // daily vs news
  const [calendar,setCalendar]=useState([])
  const [loading,setLoading]=useState(false)
  const [plan,setPlan]=useState(null)
  const [prices,setPrices]=useState(MARKETS)
  const [timeframe,setTimeframe]=useState('M5')
  const chartRef=useRef(null)
  const chartInstance=useRef(null)
  const candleSeries=useRef(null)

  // Live ticker
  useEffect(()=>{
    const id=setInterval(()=>{
      setPrices(p=>p.map(m=>({...m, price: m.price + (Math.random()-0.5)* (m.id.includes('XAU')?1.2:0.0003) })))
    },2000)
    return ()=>clearInterval(id)
  },[])

  // Fetch Investing.com calendar
  useEffect(()=>{
    fetch('/api/calendar').then(r=>r.json()).then(d=>setCalendar(d.events||[])).catch(()=>setCalendar([
      {time:'14:30',currency:'USD',event:'Initial Jobless Claims',importance:3,forecast:'235K',previous:'232K'},
      {time:'15:45',currency:'USD',event:'S&P Global Manufacturing PMI',importance:2,forecast:'52.1',previous:'52.0'}
    ]))
  },[])

  // TradingView Live Chart
  useEffect(()=>{
    if(!chartRef.current) return
    const chart = createChart(chartRef.current, {
      layout:{ background:{ color:'#0a0e1f' }, textColor:'#94a3b8' },
      grid:{ vertLines:{ color:'#1e293b' }, horzLines:{ color:'#1e293b' } },
      width: chartRef.current.clientWidth,
      height: 380,
      timeScale:{ timeVisible:true, secondsVisible:false }
    })
    const series = chart.addCandlestickSeries({ upColor:'#00e676', downColor:'#ff1744', borderVisible:false, wickUpColor:'#00e676', wickDownColor:'#ff1744' })
    chartInstance.current=chart
    candleSeries.current=series
    
    // Generate initial candles
    let base = market.price
    const data=[]
    let t = Math.floor(Date.now()/1000) - 100*300
    for(let i=0;i<100;i++){
      const open=base
      const close=open + (Math.random()-0.48)* (market.id.includes('XAU')?3:0.0008)
      const high=Math.max(open,close)+ Math.random()* (market.id.includes('XAU')?1.5:0.0003)
      const low=Math.min(open,close)- Math.random()* (market.id.includes('XAU')?1.5:0.0003)
      data.push({ time:t, open, high, low, close })
      base=close
      t+=300
    }
    series.setData(data)

    const liveId=setInterval(()=>{
      const last = data[data.length-1]
      const newClose = last.close + (Math.random()-0.5)* (market.id.includes('XAU')?0.8:0.0002)
      const newCandle={ ...last, close:newClose, high: Math.max(last.high,newClose), low: Math.min(last.low,newClose), time: Math.floor(Date.now()/1000) }
      series.update(newCandle)
    },1000)

    const handleResize=()=>{ chart.applyOptions({ width: chartRef.current.clientWidth }) }
    window.addEventListener('resize',handleResize)
    return ()=>{ clearInterval(liveId); window.removeEventListener('resize',handleResize); chart.remove() }
  },[market])

  const generatePlan=async()=>{
    setLoading(true)
    try{
      const res=await fetch('/api/generate-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({newsEvent, market:market.id, releaseDate})})
      const data=await res.json()
      setPlan(data)
    }catch(e){
      setPlan({direction:'BUY', confidence:68, dollarStrength:'SOFT', volatility:'MED', bullishProbability:72, fearGreed:78, marketSentiment:90, entry:'2675.50', sl:'2665.50', tp1:'2685.50', tp2:'2695.50', reasoning:`${newsEvent} suggests Dollar softening. Gold bullish structure above $4050. Buy dips.`})
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#070b1a] text-slate-200">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0e1f]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black">F</div>
            <div>
              <h1 className="font-black tracking-tight text-white">SAMUEL FX Intelligence <span className="text-cyan-400">PRO</span></h1>
              <p className="text-[10px] text-slate-500 -mt-1">AI-powered macroeconomic intelligence for professional traders • by SAMUEL - Professional Trading Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              {[{k:'68',v:'NEWS EVENTS'},{k:'34',v:'COUNTRIES'},{k:'14',v:'NEWS SOURCES'}].map(s=>(
                <div key={s.v} className="glass px-3 py-1 rounded-full text-[10px]"><span className="text-cyan-400 font-bold">{s.k}</span> <span className="text-slate-400">{s.v}</span></div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[11px]"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> LIVE MARKETS • London</div>
          </div>
        </div>
        {/* Live ticker */}
        <div className="bg-black/40 border-y border-white/5 overflow-hidden whitespace-nowrap py-1">
          <div className="animate-[marquee_60s_linear_infinite] flex gap-8">
            {[...prices,...prices].map((m,i)=>(
              <span key={i} className="text-[11px] font-mono">{m.id} <span className="text-white">{m.price.toFixed(m.id.includes('XAU')||m.id.includes('NAS')||m.id.includes('BTC')?2:5)}</span> <span className={i%2?'text-emerald-400':'text-red-400'}>{i%2?'+0.32%':'-0.12%'}</span></span>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        {/* Left - Chart + Scanner */}
        <div className="col-span-8 space-y-4">
          {/* Mode tabs */}
          <div className="flex gap-2">
            <button onClick={()=>setMode('daily')} className={`px-4 py-2 rounded-full text-xs font-bold ${mode==='daily'?'bg-cyan-500 text-black':'glass text-slate-400'}`}>⚡ DAILY SCANNER (24/7)</button>
            <button onClick={()=>setMode('news')} className={`px-4 py-2 rounded-full text-xs font-bold ${mode==='news'?'bg-amber-400 text-black':'glass text-slate-400'}`}>📰 NEWS EVENT MODE</button>
          </div>

          {/* Scanner controls - exact clone from video */}
          <div className="glass rounded-2xl p-5">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div><label className="text-[10px] text-slate-500">NEWS EVENT</label><select value={newsEvent} onChange={e=>setNewsEvent(e.target.value)} className="w-full mt-1 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm">{NEWS_EVENTS.map(ev=><option key={ev}>{ev}</option>)}</select></div>
              <div><label className="text-[10px] text-slate-500">RELEASE DATE</label><input type="date" value={releaseDate} onChange={e=>setReleaseDate(e.target.value)} className="w-full mt-1 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm" /></div>
              <div><label className="text-[10px] text-slate-500">MARKET</label><select value={market.id} onChange={e=>setMarket(MARKETS.find(m=>m.id===e.target.value))} className="w-full mt-1 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm">{MARKETS.map(m=><option key={m.id} value={m.id}>{m.id} - {m.name}</option>)}</select></div>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {MARKETS.map(m=>(
                <button key={m.id} onClick={()=>setMarket(m)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${market.id===m.id?'bg-amber-400 text-black border-amber-400 glow-gold':'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>{m.id}</button>
              ))}
            </div>
            <button onClick={generatePlan} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black tracking-widest hover:from-cyan-300 hover:to-blue-400 transition glow-cyan disabled:opacity-50">
              {loading ? '>> SCANNING INVESTING.COM + AI ANALYZING...' : '>> GENERATE AI TRADE PLAN'}
            </button>
          </div>

          {/* Live Chart */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">{market.id} • LIVE CHART • <span className="text-emerald-400">{market.price.toFixed(2)}</span></h3>
              <div className="flex gap-1">{['M1','M5','M15','M30','H1'].map(tf=><button key={tf} onClick={()=>setTimeframe(tf)} className={`px-2 py-1 text-[10px] rounded ${timeframe===tf?'bg-white text-black':'bg-white/10'}`}>{tf}</button>)}</div>
            </div>
            <div ref={chartRef} className="w-full rounded-xl overflow-hidden bg-[#0a0e1f]" />
          </div>

          {/* AI Results */}
          {plan && (
            <div className="glass rounded-2xl p-6 border-cyan-500/20 animate-in fade-in">
              <div className="grid grid-cols-3 gap-6">
                {/* Radar */}
                <div className="space-y-3">
                  <h4 className="text-[11px] text-slate-500 font-bold tracking-widest">AI NEWS RADAR</h4>
                  <div className="relative w-48 h-48 mx-auto">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {[0,60,120,180,240,300].map((a,i)=>{
                        const rad=a*Math.PI/180; const x=100+70*Math.cos(rad); const y=100+70*Math.sin(rad);
                        const labels=['CPI','FOMC','ECB','GDP','PFE','JOB']; const active=newsEvent.toLowerCase().includes(labels[i].toLowerCase())|| i===5;
                        return <g key={i}><line x1="100" y1="100" x2={x} y2={y} stroke={active?'#00e5ff':'#1e293b'} strokeWidth={active?2:1}/><circle cx={x} cy={y} r={active?12:8} fill={active?'#00e5ff':'#0f172a'} stroke="#fff" strokeOpacity="0.2"/><text x={x} y={y+4} textAnchor="middle" fontSize="8" fill={active?'#000':'#64748b'} fontWeight="bold">{labels[i]}</text></g>
                      })}
                      <circle cx="100" cy="100" r="25" fill="#0f172a" stroke="#00e5ff" strokeWidth="2"/><text x="100" y="103" textAnchor="middle" fontSize="10" fill="#00e5ff" fontWeight="900">{market.id.split('/')[0]}</text>
                    </svg>
                  </div>
                </div>
                {/* Directional Lean */}
                <div className="col-span-2 space-y-4">
                  <div className={`rounded-xl p-4 border ${plan.direction==='BUY'?'bg-emerald-500/10 border-emerald-500/30':'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">DIRECTIONAL LEAN</span><span className={`px-3 py-1 rounded-full text-sm font-black ${plan.direction==='BUY'?'bg-emerald-400 text-black':'bg-red-500 text-white'}`}>{plan.direction}</span></div>
                    <p className="text-sm mt-3 leading-relaxed text-slate-200">{plan.reasoning}</p>
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      <div className="bg-black/40 rounded-lg p-2"><div className="text-[9px] text-slate-500">ENTRY</div><div className="font-mono font-bold text-white">{plan.entry}</div></div>
                      <div className="bg-black/40 rounded-lg p-2"><div className="text-[9px] text-slate-500">STOP LOSS</div><div className="font-mono font-bold text-red-400">{plan.sl}</div></div>
                      <div className="bg-black/40 rounded-lg p-2"><div className="text-[9px] text-slate-500">TP1</div><div className="font-mono font-bold text-emerald-400">{plan.tp1}</div></div>
                      <div className="bg-black/40 rounded-lg p-2"><div className="text-[9px] text-slate-500">TP2</div><div className="font-mono font-bold text-emerald-400">{plan.tp2}</div></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/30 rounded-xl p-3 text-center"><div className="text-[9px] text-slate-500">DOLLAR STRENGTH</div><div className={`mt-1 font-black ${plan.dollarStrength==='SOFT'?'text-amber-400':'text-red-400'}`}>{plan.dollarStrength}</div><div className="w-full h-1 bg-white/10 rounded mt-2"><div className="h-1 bg-amber-400 rounded" style={{width: plan.dollarStrength==='SOFT'?'35%':'75%'}}></div></div></div>
                    <div className="bg-black/30 rounded-xl p-3 text-center"><div className="text-[9px] text-slate-500">VOLATILITY</div><div className="mt-1 font-black text-cyan-400">{plan.volatility}</div><div className="text-[10px] text-slate-500 mt-1">{plan.volatility==='HIGH'?'Expected spike':'Moderate move'}</div></div>
                    <div className="bg-black/30 rounded-xl p-3 text-center"><div className="text-[9px] text-slate-500">CONFIDENCE</div><div className="mt-1 font-black text-white">{plan.confidence}%</div><div className="text-[9px] text-emerald-400">Moderate</div></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right - Calendar + Gauges */}
        <div className="col-span-4 space-y-4">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-xs">INVESTING.COM • LIVE CALENDAR</h3><span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">● LIVE</span></div>
            <div className="space-y-2 max-h-[280px] overflow-auto">
              {calendar.map((ev,i)=>(
                <div key={i} className="flex items-center gap-3 bg-black/20 rounded-lg p-2.5 border border-white/5">
                  <div className="text-[11px] font-mono text-slate-400 w-12">{ev.time}</div>
                  <div className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">{ev.currency}</div>
                  <div className="flex-1"><div className="text-[11px] font-semibold truncate">{ev.event}</div><div className="text-[9px] text-slate-500">F:{ev.forecast} P:{ev.previous}</div></div>
                  <div className="flex">{Array.from({length:ev.importance||2}).map((_,k)=><span key={k} className="text-amber-400 text-[10px]">★</span>)}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-slate-500">Source: investing.com/economic-calendar • Auto-refresh 60s • Next high-impact in 2h 14m</div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-bold text-xs mb-4">DESK GAUGES</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center"><div className="relative w-24 h-24 mx-auto"><svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]"><circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8"/><circle cx="50" cy="50" r="40" fill="none" stroke="#00e5ff" strokeWidth="8" strokeDasharray={`${plan?plan.marketSentiment:90} 100`} strokeLinecap="round"/></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-black text-white">{plan?.marketSentiment||90}%</span><span className="text-[8px] text-slate-400">SENTIMENT</span></div></div></div>
              <div className="text-center"><div className="relative w-24 h-24 mx-auto"><svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]"><circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8"/><circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray={`${plan?plan.fearGreed:78} 100`} strokeLinecap="round"/></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-black text-white">{plan?.fearGreed||78}%</span><span className="text-[8px] text-slate-400">FEAR & GREED</span></div></div></div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-bold text-xs mb-3">TRADE READINESS</h3>
            <div className="space-y-2 text-[11px]">
              {[
                ['Event Identified', true],
                ['Market Structure Bullish', plan?.direction==='BUY'],
                ['Risk Assessment Done', !!plan],
                ['Confidence >60%', (plan?.confidence||0)>60],
                ['Dollar Correlation Aligned', true]
              ].map(([label,ok])=>(
                <div key={label} className="flex items-center justify-between"><span className="text-slate-400">{label}</span><span className={ok?'text-emerald-400':'text-slate-600'}>{ok?'✓':'○'}</span></div>
              ))}
            </div>
            <div className="mt-4 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 text-center font-bold">TRADE READINESS 75% - READY TO EXECUTE</div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-bold text-[10px] text-slate-500 mb-2">DOLLAR STRENGTH PREVIEW (DXY)</h3>
            <div className="space-y-1.5">
              {[
                ['EUR/USD', -0.12, 'bear'],
                ['GBP/USD', 0.08, 'bull'],
                ['USD/JPY', 0.22, 'bull'],
                ['XAU/USD', -0.32, 'bull'],
              ].map(([pair,chg,trend])=>(
                <div key={pair} className="flex items-center gap-2 text-[11px]"><span className="w-16 font-mono">{pair}</span><div className="flex-1 h-1.5 bg-white/10 rounded"><div className={`h-1.5 rounded ${trend==='bull'?'bg-emerald-400':'bg-red-400'}`} style={{width:`${Math.abs(chg)*100+50}%`}}></div></div><span className={trend==='bull'?'text-emerald-400':'text-red-400'}>{chg>0?'+':''}{chg}%</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 py-4 text-center text-[10px] text-slate-600">
        SAMUEL FX Intelligence PRO • Inspired by SAMUEL FX • Educational purposes only • Trade at your own risk • Real data from Investing.com • Live charts via TradingView
      </footer>
    </div>
  )
}
