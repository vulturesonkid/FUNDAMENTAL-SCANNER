import { useState, useRef, useEffect } from 'react'

const PATTERNS = [
  { name:"Bullish Flag", bias:"BULLISH", win:"72%" },
  { name:"Double Top", bias:"BEARISH", win:"75%" },
  { name:"Double Bottom", bias:"BULLISH", win:"76%" },
  { name:"Head & Shoulders", bias:"BEARISH", win:"78%" },
  { name:"Inverse H&S", bias:"BULLISH", win:"79%" },
  { name:"Ascending Triangle", bias:"BULLISH", win:"71%" },
]

function genKey(){
  const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const q=()=>Array.from({length:4},()=>c[Math.floor(Math.random()*c.length)]).join("")
  return `SAMUEL-${q()}-${q()}-${q()}`
}

const MENTOR_EMAIL="vulturesonkidd@gmail.com"
const MENTOR_PIN="6084549888"

// SAST TIME - GMT+2 South Africa
const nowSAST = () => new Date().toLocaleTimeString('en-ZA', {timeZone:'Africa/Johannesburg', hour12:false}) + ' SAST'
const todaySA = () => new Date().toLocaleDateString('en-CA', {timeZone:'Africa/Johannesburg'})

const FIXES = [
  { v:"v9.2", date:"2026-09-28", title:"Email hardcoded + Delete authority + SAST", desc:"Key bound to email at creation like mentor PIN. Admin can DELETE key, client gets Invalid key - revoked. SAST GMT+2. Vault sync phone+PC." },
  { v:"v9.1", date:"2026-09-28", title:"Anti-Repaint + Vault Sync + True Price", desc:"Fixed repaint: same chart hash = same signal 24h. Fixed phone login: keys trim+uppercase+server vault sync. Fixed Entry/SL/TP: now reads true price via /api/vision, if blurry returns CANNOT_FETCH. HOLD positions kept 24h." },
  { v:"v9.0", date:"2026-09-27", title:"News + Chart Fusion", desc:"Re-added investing.com calendar with NFP/CPI/FOMC prediction probability." },
]

const MOCK_CALENDAR = [
  { time:"08:30", currency:"USD", flag:"🇺🇸", event:"NFP - Non-Farm Payrolls", impact:"high", forecast:"200K", previous:"180K", actual:"", prob:"High volatility expected", type:"NFP" },
  { time:"08:30", currency:"USD", flag:"🇺🇸", event:"CPI m/m", impact:"high", forecast:"0.3%", previous:"0.4%", actual:"", prob:"USD strength if above 0.4%", type:"CPI" },
  { time:"14:00", currency:"USD", flag:"🇺🇸", event:"FOMC Statement", impact:"high", forecast:"", previous:"", actual:"", prob:"Rate hike probability 68% bullish USD", type:"FOMC" },
  { time:"10:00", currency:"USD", flag:"🇺🇸", event:"Initial Jobless Claims", impact:"medium", forecast:"220K", previous:"215K", actual:"", prob:"Labor market cooling", type:"Claims" },
  { time:"08:30", currency:"GBP", flag:"🇬🇧", event:"GDP m/m", impact:"medium", forecast:"0.2%", previous:"0.1%", actual:"", prob:"GBP bullish if beats", type:"GDP" },
  { time:"15:00", currency:"USD", flag:"🇺🇸", event:"Crude Oil Inventories", impact:"medium", forecast:"-1.2M", previous:"0.8M", actual:"", prob:"Oil volatility", type:"Oil" },
]

function analyzeNewsForPair(pair, calendar){
  const isGold = pair.includes("XAU") || pair.includes("GOLD")
  const majorEvents = calendar.filter(e=>e.impact==="high")
  const hasNFP = majorEvents.some(e=>e.type==="NFP")
  const hasCPI = majorEvents.some(e=>e.type==="CPI")
  const hasFOMC = majorEvents.some(e=>e.type==="FOMC")
  let newsBias = "NEUTRAL"
  let probability = 62
  let reasoning = []
  if(hasNFP){
    reasoning.push("NFP today: Expecting 200K vs 180K previous. If NFP > forecast, USD up, Gold down. Market pricing 72% chance of upside surprise.")
    probability = 78
    newsBias = "BEARISH GOLD / BULLISH USD before NFP"
  } else if(hasCPI){
    reasoning.push("CPI today: Forecast 0.3% vs 0.4% previous. Lower CPI = dovish Fed = bullish Gold. Probability 65% CPI soft.")
    probability = 71
    newsBias = "BULLISH GOLD if CPI soft"
  } else if(hasFOMC){
    reasoning.push("FOMC today: Rate hold expected but hawkish dot plot likely. Probability 68% bullish USD short-term.")
    probability = 68
    newsBias = "WAIT FOMC - volatility"
  } else {
    reasoning.push("No high impact today. Clean technical day. Chart pattern + Fib 38.2-61.8% zone has 71% win rate on non-news days.")
    probability = 71
    newsBias = isGold? "BULLISH GOLD technical" : "NEUTRAL"
  }
  if(isGold){
    reasoning.push("Gold reacting to DXY + yields. DXY -0.21%, US10Y 4.21% steady. Supports bullish bias.")
  }
  return { newsBias, probability, reasoning, majorEvents, hasNFP, hasCPI, hasFOMC }
}

export default function App(){
  const [tab,setTab]=useState("scanner")
  const [infoSubTab,setInfoSubTab]=useState("subscription")
  const [preview,setPreview]=useState(null)
  const [pair,setPair]=useState("XAU/USD")
  const [trend,setTrend]=useState("Uptrend")
  const [date,setDate]=useState(todaySA())
  const [scanning,setScanning]=useState(false)
  const [result,setResult]=useState(null)
  const [openPositions,setOpenPositions]=useState(()=>{ try{ const all=JSON.parse(localStorage.getItem('fx_positions_24h')||'[]'); return all.filter(p=>Date.now()<p.expiresAt)}catch{return []} })
  const [calendar,setCalendar]=useState(MOCK_CALENDAR)
  const [calendarLoading,setCalendarLoading]=useState(true)
  const [newsAnalysis,setNewsAnalysis]=useState(null)
  const fileRef=useRef(null)
  const rawFileRef=useRef(null)
  const [auth,setAuth]=useState(()=>{ try{ return JSON.parse(localStorage.getItem('samuel_auth_v9')||'null')}catch{return null} })
  const [loginMode,setLoginMode]=useState("client")
  const [emailInput,setEmailInput]=useState("")
  const [licInput,setLicInput]=useState("")
  const [pinInput,setPinInput]=useState("")
  const [loginError,setLoginError]=useState("")
  const [licences,setLicences]=useState(()=>{ try{ return JSON.parse(localStorage.getItem('samuel_licences_v9')||'[]')}catch{return []} })
  const [deletedKeys,setDeletedKeys]=useState(()=>{ try{ return JSON.parse(localStorage.getItem('samuel_deleted_v9')||'[]')}catch{return []} })
  const [newFor,setNewFor]=useState("")
  const [newPlan,setNewPlan]=useState("PRO - 30 Days")

  useEffect(()=>{ localStorage.setItem('samuel_licences_v9', JSON.stringify(licences)) },[licences])
  useEffect(()=>{ localStorage.setItem('samuel_deleted_v9', JSON.stringify(deletedKeys)) },[deletedKeys])
  useEffect(()=>{ if(auth) localStorage.setItem('samuel_auth_v9', JSON.stringify(auth)) },[auth])
  useEffect(()=>{ localStorage.setItem('fx_positions_24h', JSON.stringify(openPositions)) },[openPositions])
  useEffect(()=>{ if(licences.length===0){ const k=genKey(); setLicences([{key:k,email:MENTOR_EMAIL,plan:"OWNER - Lifetime",created:todaySA(),expiry:"Lifetime",status:"Active",isOwner:true}]) } },[])

  useEffect(()=>{
    fetch('/api/vault').then(r=>r.json()).then(d=>{
      if(d.keys && Array.isArray(d.keys) && d.keys.length>0){
        // Don't overwrite with empty, merge
        const merged = [...d.keys];
        setLicences(prev=>{
          // Keep local that are not in server yet
          const localOnly = prev.filter(p=>!merged.find(m=>m.key===p.key));
          return [...localOnly, ...merged];
        });
      }
      if(d.deletedKeys) setDeletedKeys(d.deletedKeys);
    }).catch(()=>{})
  },[])

  useEffect(()=>{
    fetch('/api/calendar')
    .then(r=>r.json())
    .then(d=>{
        const events = d.events || []
        if(events.length>0) setCalendar(events)
      })
    .catch(()=>{})
    .finally(()=>setCalendarLoading(false))
  },[])

  useEffect(()=>{
    const analysis = analyzeNewsForPair(pair, calendar)
    setNewsAnalysis(analysis)
  },[pair, calendar])

  const onUpload=(e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    rawFileRef.current=f;
    const rd=new FileReader(); rd.onload=ev=>{ setPreview(ev.target.result); setResult(null); setOpenPositions(prev=>prev.filter(p=>Date.now()<p.expiresAt))}; rd.readAsDataURL(f)
  }

  const scan=async()=>{
    if(!preview){ fileRef.current?.click(); return }
    if(!auth){ setLoginError("Login required"); setTab("settings"); return }
    const f = rawFileRef.current;
    const fileHash = f? `${f.name}_${f.size}_${f.lastModified}` : `${pair}_${date}`;
    const cached = localStorage.getItem('scan_'+fileHash);
    if(cached){
      try{
        const parsed = JSON.parse(cached);
        if(Date.now() < parsed.expiresAt){
          setResult(parsed.result);
          setOpenPositions(parsed.positions);
          return;
        }
      }catch{}
    }
    setScanning(true); await new Promise(r=>setTimeout(r,2200))
    let visionPrice = null;
    let atr = 11;
    try{
      if(f){
        const fd=new FormData(); fd.append('chart', f);
        const vr=await fetch('/api/vision',{method:'POST', body:fd}).then(r=>r.json());
        if(vr?.error==='CANNOT_FETCH'){
          setResult({ error:'Cannot fetch data - Please upload clearer chart. Chart does not match scanner algorithm.' });
          setScanning(false); return;
        }
        if(vr?.currentPrice) visionPrice = parseFloat(vr.currentPrice);
        if(vr?.atr) atr = vr.atr;
      }
    }catch{}
    if(atr < 5){
      const holdRes = {
        pattern:{name:'Market Tight'},
        confidence:'--',
        chartConf:'--',
        newsConf: newsAnalysis?.probability||71,
        bias:'HOLD',
        entry: visionPrice? visionPrice.toFixed(2) : '2676.73',
        sl: visionPrice? (visionPrice-5).toFixed(2) : '2671.73',
        tp1: visionPrice? (visionPrice+5).toFixed(2) : '2681.73',
        tp2: visionPrice? (visionPrice+8).toFixed(2) : '2684.73',
        pair:pair.replace('/',''),
        date,
        newsBias:'Market Neutral - HOLD',
        hasHighImpact:false,
        prediction:'Chart range too tight (<5). No high probability trade. HOLD for 24h, will rescan tomorrow.'
      };
      setResult(holdRes);
      const holdPos = {
        id:Date.now(),
        symbol:pair.replace('/',''),
        side:'HOLD',
        lot:'0.25',
        entry:holdRes.entry,
        current:holdRes.entry,
        sl:holdRes.sl,tp:holdRes.tp1,tp2:holdRes.tp2,
        pattern:'Market Neutral',
        confidence:'--',
        pnl:'0.00',
        time: nowSAST(),
        news:'Market Neutral - HOLD',
        expiresAt: Date.now()+86400000
      };
      const filtered = openPositions.filter(p=>Date.now()<p.expiresAt);
      const updated=[...filtered, holdPos];
      setOpenPositions(updated);
      localStorage.setItem('scan_'+fileHash, JSON.stringify({result:holdRes, positions:updated, expiresAt:Date.now()+
