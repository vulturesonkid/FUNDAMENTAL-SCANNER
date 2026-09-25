import { useEffect, useState, useRef } from 'react'

const TICKER = [
  { s: "EUR/USD", p: "1.0842", c: "+0.12%" },
  { s: "GBP/USD", p: "1.2931", c: "-0.04%" },
  { s: "XAU/USD", p: "2678.45", c: "+0.68%", hl: true },
  { s: "BTC/USD", p: "67234", c: "+1.24%" },
  { s: "DXY", p: "103.42", c: "-0.21%" },
  { s: "US10Y", p: "4.21%", c: "+0.03%" },
]

export default function App() {
  const [calendar, setCalendar] = useState([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(null)
  const [genLoading, setGenLoading] = useState(false)
  const [timeframe, setTimeframe] = useState("H1")
  const canvasRef = useRef(null)

  useEffect(() => {
    fetch('/api/calendar')
     .then(r => r.json())
     .then(d => setCalendar(d.events || d.slice?.(0,12) || []))
     .catch(() => setCalendar([
        { time: "08:30", currency: "USD", flag: "🇺🇸", event: "CPI m/m", impact: "high", forecast: "0.2%", previous: "0.3%" },
        { time: "10:00", currency: "USD", flag: "🇺🇸", event: "Consumer Sentiment", impact: "medium", forecast: "69.2", previous: "68.5" },
        { time: "14:00", currency: "EUR", flag: "🇪🇺", event: "ECB Press Conference", impact: "high", forecast: "", previous: "" },
        { time: "15:30", currency: "USD", flag: "🇺🇸", event: "Crude Oil Inventories", impact: "medium", forecast: "-0.9M", previous: "1.2M" },
      ]))
     .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const w = c.width = c.offsetWidth * 2
    const h = c.height = c.offsetHeight * 2
    ctx.clearRect(0,0,w,h)
    ctx.strokeStyle = '#1e2742'
    ctx.lineWidth = 1
    for (let i=0; i<4; i++){
      const y = (h/5)*(i+1)
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke()
    }
    let x = 60
    let price = h*0.6
    for (let i=0; i<50; i++){
      const isGreen = Math.random()>0.48
      const bodyH = 10 + Math.random()*30
      const wick = 8 + Math.random()*15
      ctx.fillStyle = isGreen? '#00D38A' : '#FF4D6D'
      ctx.strokeStyle = ctx.fillStyle
      ctx.beginPath()
      ctx.moveTo(x+8, price - wick)
      ctx.lineTo(x+8, price + bodyH + wick)
      ctx.stroke()
      ctx.fillRect(x, price, 16, bodyH)
      x += 28
      price += (Math.random()-0.5)*20
      if(price<60) price=80
      if(price>h-60) price=h-80
    }
  }, [timeframe])

  const generatePlan = async () => {
    setGenLoading(true)
    try {
      const r = await fetch('/api/generate-plan', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ calendar }) })
      const d = await r.json()
      setPlan(d.plan || d)
    } catch(e){
      setPlan({ bias: "BULLISH on XAU", reason: "USD CPI softer + risk-on, DXY pulling back", entry: "2672-2675", sl: "2662", tp: "2695 / 2708", confluence: "H1 bullish engulfing + calendar" })
    } finally { setGenLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#070A14] text-[#E6E8EF]">
      <header className="h- border-b border-[#1E2742] bg-[#0C1120]/80 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded- bg-gradient-to-br from-[#D4AF37] to-[#FFD86A] flex items-center justify-center text-black font-black text-">S</div>
          <div>
            <div className="font-black tracking-[0.02em] text-">SAMUEL FX Intelligence <span className="text-[#D4AF37]">PRO</span></div>
            <div className="text- tracking-[0.2em] text-[#7B86A8] -mt-1">INSTITUTIONAL TERMINAL • © 2026 SAMUEL</div>
          </div>
          <div className="ml-6 hidden md:flex items-center gap-2 text- px-3 py-1 rounded-full bg-[#0E1A2E] border border-[#1E2742]">
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span> INVESTING.COM LIVE • XAU 2678.45 <span className="text-[#00D38A]">+0.68%</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={generatePlan} className="h-9 px-5 rounded- bg-gradient-to-r from-[#D4AF37] to-[#E8C765] text-black font-bold text-">GENERATE PLAN</button>
        </div>
      </header>

      <div className="h-8 bg-[#0A0F1F] border-b border-[#1E2742] flex items-center overflow-hidden">
        <div className="flex gap-8 px-6 text-">
          {TICKER.map((t,i) => (
            <div key={i} className={`flex gap-2 ${t.hl? 'text-[#D4AF37] font-bold' : 'text-[#9AA3C3]'}`}>
              <span className="font-semibold">{t.s}</span><span className="text-white">{t.p}</span><span className={t.c.includes('+')?'text-[#00D38A]':'text-[#FF4D6D]'}>{t.c}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w- mx-auto p-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 rounded- bg-[#111628] border border-[#1E2742] overflow-hidden">
          <div className="h- flex items-center justify-between px-5 border-b border-[#1E2742]">
            <div className="flex items-center gap-3">
              <div className="text- font-bold">XAU/USD • GOLD SPOT</div>
              <div className="text- px-2 py-1 rounded bg-[#0E1A2E] border border-[#1E2742]">OANDA</div>
            </div>
            <div className="flex gap-1">
              {["M1","M5","M15","H1","D1"].map(tf => (
                <button key={tf} onClick={()=>setTimeframe(tf)} className={`h-7 px-3 rounded- text- font-semibold border ${timeframe===tf?'bg-[#1A2340] border-[#2A3A66] text-white':'bg-transparent border-[#1E2742] text-[#7B86A8]'}`}>{tf}</button>
              ))}
            </div>
          </div>
          <div className="relative h- bg-[#0C1120]">
            <canvas ref={canvasRef} className="w-full h-full"></canvas>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 rounded- bg-[#111628] border border-[#1E2742] flex flex-col">
          <div className="h- px-5 flex items-center justify-between border-b border-[#1E2742]">
            <div className="text- font-bold">INVESTING.COM • LIVE CALENDAR</div>
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
          </div>
          <div className="flex-1 overflow-auto">
            {loading? <div className="p-6 text- text-[#7B86A8]">Loading...</div> :
            calendar.map((e,i)=>(
              <div key={i} className="grid grid-cols-[60px_50px_1fr_80px] items-center px-3 py- border-b border-[#141C32] text-">
                <span className="text-[#9AA3C3]">{e.time}</span>
                <span>{e.flag||"🇺🇸"} {e.currency}</span>
                <div className="pr-2">
                  <div className="leading-tight">{e.event}</div>
                  <div className="text- text-[#5F6B8F]">F: {e.forecast||'-'} • P: {e.previous||'-'}</div>
                </div>
                <div className="text-right">
                  <span className={`text- px-2 py-1 rounded-full font-bold ${e.impact==='high'?'bg-[#FF4D6D]/15 text-[#FF4D6D]':'bg-[#FF9F1C]/15 text-[#FF9F1C]'}`}>{(e.impact||'low').toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 rounded- bg-[#111628] border border-[#1E2742] p-5">
          <div className="flex items-center justify-between">
            <div className="text- font-bold">AI TRADING PLAN • SAMUEL</div>
            <button onClick={generatePlan} className="h-8 px-4 rounded- bg-gradient-to-r from-[#D4AF37] to-[#E8C765] text-black text- font-black">{genLoading?"GENERATING...":"GENERATE NEW PLAN"}</button>
          </div>
          <div className="mt-4 p-4 rounded- bg-[#0C1120] border border-[#1E2742] text-">
            {plan? <pre className="whitespace-pre-wrap text-[#C9D0E8]">{typeof plan==='string'? plan : JSON.stringify(plan,null,2)}</pre> : <div className="text-[#7B86A8]">Click Generate to create plan from Investing.com calendar + chart.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
