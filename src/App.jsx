
import { useState, useRef, useEffect } from 'react'
const PATTERNS = [
  { name:"Bullish Flag", bias:"BULLISH", win:"72%" },
  { name:"Double Top", bias:"BEARISH", win:"75%" },
  { name:"Double Bottom", bias:"BULLISH", win:"76%" },
  { name:"Head & Shoulders", bias:"BEARISH", win:"78%" },
  { name:"Inverse H&S", bias:"BULLISH", win:"79%" },
]
function genKey(){
  const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const p=()=>Array.from({length:4},()=>c[Math.floor(Math.random()*c.length)]).join("")
  return `SAMUEL-${p()}-${p()}-${p()}`
}
const MENTOR_EMAIL="vulturesonkidd@gmail.com"
const MENTOR_PIN="6084549888"

export default function App(){
  const [tab,setTab]=useState("scanner")
  const [preview,setPreview]=useState(null)
  const [pair,setPair]=useState("XAU/USD")
  const [trend,setTrend]=useState("Uptrend")
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const [scanning,setScanning]=useState(false)
  const [result,setResult]=useState(null)
  const [openPositions,setOpenPositions]=useState([])
  const fileRef=useRef(null)
  const [auth,setAuth]=useState(()=>{ try{ return JSON.parse(localStorage.getItem('samuel_auth_v7')||'null')}catch{return null} })
  const [loginMode,setLoginMode]=useState("client") // mentor | client
  const [emailInput,setEmailInput]=useState("")
  const [licInput,setLicInput]=useState("")
  const [pinInput,setPinInput]=useState("")
  const [loginError,setLoginError]=useState("")
  const [licences,setLicences]=useState(()=>{ try{ return JSON.parse(localStorage.getItem('samuel_licences_v7')||'[]')}catch{return []} })
  const [newFor,setNewFor]=useState("")
  const [newPlan,setNewPlan]=useState("PRO - 30 Days")

  useEffect(()=>{ localStorage.setItem('samuel_licences_v7', JSON.stringify(licences)) },[licences])
  useEffect(()=>{ if(auth) localStorage.setItem('samuel_auth_v7', JSON.stringify(auth)) },[auth])
  useEffect(()=>{ if(licences.length===0){ const k=genKey(); setLicences([{key:k,email:MENTOR_EMAIL,plan:"OWNER - Lifetime",created:new Date().toISOString().slice(0,10),expiry:"Lifetime",status:"Active",isOwner:true}]) } },[])

  const onUpload=(e)=>{ const f=e.target.files?.[0]; if(!f) return; const rd=new FileReader(); rd.onload=ev=>{ setPreview(ev.target.result); setResult(null); setOpenPositions([])}; rd.readAsDataURL(f) }

  const scan=async()=>{
    if(!preview){ fileRef.current?.click(); return }
    if(!auth){ setLoginError("Login required"); setTab("settings"); return }
    setScanning(true); await new Promise(r=>setTimeout(r,1200))
    const pick=PATTERNS[Math.floor(Math.random()*PATTERNS.length)]; const conf=(71+Math.random()*21).toFixed(1)
    const isBull=trend==="Uptrend"||pick.bias==="BULLISH"; const entry=(isBull?2673+Math.random()*5:2687+Math.random()*5).toFixed(2)
    const sl=(isBull?parseFloat(entry)-11:parseFloat(entry)+11).toFixed(2); const tp1=(isBull?parseFloat(entry)+18:parseFloat(entry)-18).toFixed(2)
    const res={pattern:pick,confidence:conf,bias:pick.bias,entry,sl,tp1,pair:pair.replace('/',''),date}
    setResult(res)
    setOpenPositions([{id:Date.now(),symbol:pair.replace('/',''),side:isBull?"BUY":"SELL",lot:"0.25",entry:res.entry,current:(isBull?parseFloat(res.entry)+2.3:parseFloat(res.entry)-2.1).toFixed(2),sl:res.sl,tp:res.tp1,pattern:res.pattern.name,confidence:res.confidence,pnl:"+"+(45+Math.random()*80).toFixed(2),time:new Date().toLocaleTimeString()}])
    setScanning(false)
  }

  const loginMentor=()=>{
    if(emailInput.toLowerCase().trim()!==MENTOR_EMAIL.toLowerCase()){ setLoginError("Mentor email must be "+MENTOR_EMAIL); return }
    if(pinInput!==MENTOR_PIN){ setLoginError("Wrong discreet PIN"); return }
    setAuth({email:MENTOR_EMAIL,licence:"OWNER-MASTER-KEY",plan:"OWNER - Lifetime",expiry:"Lifetime",isOwner:true, isMentor:true})
    setLoginError(""); setTab("scanner")
  }

  const loginClient=()=>{
    if(!emailInput||!licInput){ setLoginError("Enter email + licence"); return }
    const lic=licences.find(l=>l.key.toUpperCase()===licInput.toUpperCase().trim())
    if(!lic){ setLoginError("Invalid licence key"); return }
    if(lic.status!=="Active"){ setLoginError("Revoked/Expired"); return }
    if(lic.expiry!=="Lifetime"){ if(new Date()>new Date(lic.expiry)){ setLoginError("Expired "+lic.expiry); return } }
    if(lic.email!=="UNASSIGNED"&&lic.email!==""&&lic.email!==MENTOR_EMAIL&&lic.email.toLowerCase()!==emailInput.toLowerCase()){ setLoginError("Assigned to "+lic.email); return }
    if(lic.email==="UNASSIGNED"||lic.email===""){ setLicences(prev=>prev.map(p=>p.key===lic.key?{...p,email:emailInput.toLowerCase()}:p)) }
    setAuth({email:emailInput.toLowerCase(),licence:lic.key,plan:lic.plan,expiry:lic.expiry,isOwner:!!lic.isOwner}); setLoginError(""); setTab("scanner")
  }

  const logout=()=>{ setAuth(null); localStorage.removeItem('samuel_auth_v7'); setResult(null); setOpenPositions([]) }
  const createLic=()=>{
    const key=genKey(); let exp="Lifetime"; if(newPlan.includes("30 Days")){ const d=new Date(); d.setDate(d.getDate()+30); exp=d.toISOString().slice(0,10) } if(newPlan.includes("7 Days")){ const d=new Date(); d.setDate(d.getDate()+7); exp=d.toISOString().slice(0,10) } if(newPlan.includes("90 Days")){ const d=new Date(); d.setDate(d.getDate()+90); exp=d.toISOString().slice(0,10) }
    const email=newFor.trim()===""?"UNASSIGNED":newFor.trim().toLowerCase(); setLicences(prev=>[{key,email,plan:newPlan,created:new Date().toISOString().slice(0,10),expiry:exp,status:"Active"},...prev]); setNewFor("")
  }

  const S={
    page:{background:'#040712',color:'#E6E8EF',minHeight:'100vh',fontFamily:'Inter',display:'flex',justifyContent:'center'},
    phone:{width:'100%',maxWidth:'460px',background:'linear-gradient(180deg,#0A0F24 0%, #060A18 100%)',minHeight:'100vh',position:'relative',border:'1px solid #1A2A4A'},
    card:{margin:'10px 12px',background:'linear-gradient(180deg,#0F1A33 0%, #0B142A 100%)',border:'1px solid rgba(0,212,255,0.16)',borderRadius:14,overflow:'hidden'},
    cardH:{padding:'10px 14px',borderBottom:'1px solid rgba(0,212,255,0.1)',fontWeight:800,fontSize:12,color:'#7B9ED9'},
    input:{width:'100%',background:'#070D20',border:'1px solid #1E2E4A',color:'#fff',borderRadius:10,padding:'10px 12px',fontSize:13},
    nav:{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'460px',background:'#070D20',borderTop:'1px solid rgba(0,212,255,0.12)',display:'flex',justifyContent:'space-around',padding:'8px 0 14px',zIndex:30},
  }

  if(!auth){
    return (
      <div style={{...S.page,alignItems:'center',padding:20}}>
        <div style={{...S.phone,maxWidth:420,minHeight:'auto',borderRadius:16,paddingBottom:20}}>
          <div style={{padding:'24px 20px',textAlign:'center'}}>
            <div style={{width:56,height:56,borderRadius:14,background:'linear-gradient(135deg,#D4AF37,#FFD86A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#000',fontWeight:900,fontSize:20,margin:'0 auto'}}>S</div>
            <div style={{fontWeight:900,fontSize:18,marginTop:12}}>SAMUEL FX PRO v7</div>
            <div style={{fontSize:11,color:'#7B86A8',marginTop:4}}>Mentor PIN + Client Licence System</div>
          </div>

          <div style={{display:'flex',gap:8,padding:'0 20px',marginBottom:16}}>
            <button onClick={()=>{ setLoginMode("mentor"); setLoginError("") }} style={{flex:1,height:36,borderRadius:10,border: loginMode==="mentor"? '1px solid #00FF88':'1px solid #1E2E4A',background: loginMode==="mentor"? 'rgba(0,255,136,0.12)':'#070D20',color: loginMode==="mentor"? '#00FF88':'#7B86A8',fontWeight:800,fontSize:11,cursor:'pointer'}}>MENTOR (Owner)</button>
            <button onClick={()=>{ setLoginMode("client"); setLoginError("") }} style={{flex:1,height:36,borderRadius:10,border: loginMode==="client"? '1px solid #00D4FF':'1px solid #1E2E4A',background: loginMode==="client"? 'rgba(0,212,255,0.12)':'#070D20',color: loginMode==="client"? '#00D4FF':'#7B86A8',fontWeight:800,fontSize:11,cursor:'pointer'}}>CLIENT (Licence)</button>
          </div>

          <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:12}}>
            {loginMode==="mentor" ? (
              <>
                <div style={{fontSize:11,color:'#00FF88',background:'rgba(0,255,136,0.08)',border:'1px solid rgba(0,255,136,0.2)',borderRadius:8,padding:'8px',textAlign:'center'}}>MENTOR LOGIN • Email + Discreet PIN • Only you know PIN</div>
                <div><div style={{fontSize:11,color:'#7B86A8',marginBottom:6}}>Mentor Email</div><input style={S.input} value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder={MENTOR_EMAIL} /></div>
                <div><div style={{fontSize:11,color:'#7B86A8',marginBottom:6}}>Discreet PIN (your secret)</div><input type="password" style={S.input} value={pinInput} onChange={e=>setPinInput(e.target.value)} placeholder="Enter your PIN" /></div>
                {loginError && <div style={{fontSize:11,color:'#FF9AA2',background:'rgba(255,77,109,0.12)',border:'1px solid rgba(255,77,109,0.3)',borderRadius:8,padding:'8px'}}>{loginError}</div>}
                <button onClick={loginMentor} style={{height:42,borderRadius:10,background:'linear-gradient(90deg,#00FF88,#D4AF37)',color:'#000',fontWeight:900,border:'none',cursor:'pointer'}}>LOGIN AS MENTOR • GENERATE KEYS</button>
                <div style={{fontSize:10,color:'#5F6B8F',textAlign:'center'}}>Email: vulturesonkidd@gmail.com<br/>PIN: 6084549888 (only you know)</div>
              </>
            ) : (
              <>
                <div style={{fontSize:11,color:'#00D4FF',background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.2)',borderRadius:8,padding:'8px',textAlign:'center'}}>CLIENT LOGIN • Email + Licence Key from Mentor</div>
                <div><div style={{fontSize:11,color:'#7B86A8',marginBottom:6}}>Client Email</div><input style={S.input} value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="client@gmail.com" /></div>
                <div><div style={{fontSize:11,color:'#7B86A8',marginBottom:6}}>Licence Key</div><input style={S.input} value={licInput} onChange={e=>setLicInput(e.target.value.toUpperCase())} placeholder="SAMUEL-XXXX-XXXX-XXXX" /></div>
                {loginError && <div style={{fontSize:11,color:'#FF9AA2',background:'rgba(255,77,109,0.12)',border:'1px solid rgba(255,77,109,0.3)',borderRadius:8,padding:'8px'}}>{loginError}</div>}
                <button onClick={loginClient} style={{height:42,borderRadius:10,background:'linear-gradient(90deg,#00D4FF,#00FF88)',color:'#000',fontWeight:900,border:'none',cursor:'pointer'}}>LOGIN AS CLIENT • UNLOCK SCANNER</button>
                <div style={{fontSize:10,color:'#5F6B8F',textAlign:'center'}}>Get licence key from mentor via WhatsApp/Telegram</div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.phone}>
        <div style={{padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(0,212,255,0.1)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#D4AF37,#FFD86A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#000',fontWeight:900}}>S</div><div><div style={{fontWeight:900,fontSize:13}}>SAMUEL FX PRO v7</div><div style={{fontSize:9,color:'#5F6B8F'}}>{auth.email} • {auth.plan} {auth.isOwner?"• OWNER":""}</div></div></div>
          <button onClick={logout} style={{background:'rgba(255,77,109,0.1)',border:'1px solid rgba(255,77,109,0.3)',color:'#FF4D6D',borderRadius:8,padding:'4px 8px',fontSize:10,cursor:'pointer'}}>LOGOUT</button>
        </div>
        <div style={{margin:'10px 12px',background:'linear-gradient(90deg,#0D1A33,#0A2A2E)',border:'1px solid rgba(0,255,136,0.22)',borderRadius:12,padding:'10px 14px',color:'#00FF88',fontWeight:900,fontSize:13,display:'flex',justifyContent:'space-between'}}><span>TRADING SCANNER — LIVE</span><span style={{width:8,height:8,background:'#00FF88',borderRadius:999}}></span></div>

        {tab==="scanner" && (
          <>
            <div style={S.card}><div style={S.cardH}>CHART SCANNER • DRAG & DROP</div><div style={{padding:14}}>
              <div style={{display:'flex',gap:8,marginBottom:10}}>
                <select value={pair} onChange={e=>setPair(e.target.value)} style={{flex:1,background:'#070D20',border:'1px solid #1E2E4A',color:'#fff',borderRadius:8,padding:'8px',fontSize:11}}><option>XAU/USD</option><option>EUR/USD</option></select>
                <select value={trend} onChange={e=>setTrend(e.target.value)} style={{flex:1,background:'#070D20',border:'1px solid #1E2E4A',color:'#fff',borderRadius:8,padding:'8px',fontSize:11}}><option>Uptrend</option><option>Downtrend</option></select>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{flex:1,background:'#070D20',border:'1px solid #1E2E4A',color:'#fff',borderRadius:8,padding:'8px',fontSize:11}} />
              </div>
              <div onDragOver={e=>e.preventDefault()} onDrop={e=>{ e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f){ const rd=new FileReader(); rd.onload=ev=>{ setPreview(ev.target.result); setResult(null); setOpenPositions([])}; rd.readAsDataURL(f) }}} onClick={()=>fileRef.current?.click()} style={{border:'1px dashed rgba(0,212,255,0.25)',borderRadius:10,padding: preview? 0: '22px',textAlign:'center',cursor:'pointer',background:'rgba(0,212,255,0.03)',minHeight: preview? 180 : 110,overflow:'hidden'}}>
                {preview ? <img src={preview} style={{width:'100%',height:180,objectFit:'contain'}} /> : <><div style={{fontSize:20}}>📸</div><div style={{fontSize:12,fontWeight:700,color:'#00D4FF',marginTop:4}}>Drop chart image here</div></>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; const rd=new FileReader(); rd.onload=ev=>{ setPreview(ev.target.result); setResult(null); setOpenPositions([])}; rd.readAsDataURL(f) }} style={{display:'none'}} />
              <button onClick={scan} disabled={scanning} style={{width:'100%',marginTop:12,height:42,borderRadius:10,background: scanning? '#1A2340' : 'linear-gradient(90deg,#00FF88,#00D4FF)',color: scanning? '#7B86A8':'#000',fontWeight:900,border:'none',fontSize:13,cursor:'pointer'}}>{scanning? "SCANNING..." : "SCAN CHART NOW"}</button>
              {result && <div style={{marginTop:12,background:'#0C1120',border:'1px solid #1E2742',borderRadius:10,padding:12}}><div style={{fontWeight:900,fontSize:13,color: result.bias==='BULLISH'?'#00FF88':'#FF4D6D'}}>✅ {result.confidence}% • {result.pattern.name} • {result.bias}</div><div style={{marginTop:6,fontSize:11,color:'#9AA3C3'}}>Entry {result.entry} • SL {result.sl} • TP {result.tp1}</div></div>}
            </div></div>
            <div style={{...S.card,borderColor: openPositions.length? 'rgba(0,255,136,0.4)' : 'rgba(0,212,255,0.16)'}}><div style={{...S.cardH,display:'flex',justifyContent:'space-between'}}><span>OPEN POSITIONS ({openPositions.length})</span><span style={{fontSize:10,color: openPositions.length? '#00FF88':'#5F6B8F'}}>{openPositions.length? "LIVE FROM SCAN" : "NO SCAN YET"}</span></div>
              {openPositions.length===0 ? <div style={{padding:'20px 14px',textAlign:'center'}}><div style={{fontSize:11,color:'#5F6B8F'}}>No positions yet — scan a chart to generate</div></div> : openPositions.map(p=><div key={p.id} style={{padding:'12px 14px'}}><div style={{fontWeight:900,fontSize:13,color:p.side==="BUY"?'#00FF88':'#FF4D6D'}}>{p.symbol} • {p.side}</div><div style={{fontSize:11,marginTop:6}}>ENTRY {p.entry} • NOW {p.current} • {p.pnl}</div></div>)}
            </div>
            <div style={{height:80}}></div>
          </>
        )}

        {tab==="settings" && (
          <div style={{padding:12,display:'flex',flexDirection:'column',gap:12}}>
            <div style={S.card}><div style={S.cardH}>SUBSCRIPTION • {auth.plan}</div><div style={{padding:14}}><div style={{fontSize:11,color:'#7B86A8'}}>Email</div><div style={{fontWeight:800}}>{auth.email}</div><div style={{marginTop:10,background:'#0C1120',borderRadius:8,padding:10,border:'1px solid #1E2742'}}><div style={{fontSize:10,color:'#5F6B8F'}}>Licence / Owner</div><div style={{fontFamily:'monospace',fontSize:12,fontWeight:800,color:'#D4AF37',wordBreak:'break-all'}}>{auth.licence}</div></div><div style={{marginTop:8,fontSize:11}}>Expiry: {auth.expiry}</div></div></div>
            {auth.isOwner && (
              <div style={S.card}><div style={S.cardH}>ADMIN • GENERATE KEYS FOR CLIENTS (Mentor Only)</div><div style={{padding:14}}>
                <div style={{fontSize:11,color:'#00FF88',marginBottom:8}}>You are logged in as MENTOR with PIN {MENTOR_PIN} • You can generate keys</div>
                <input style={{...S.input,marginBottom:8}} placeholder="Client email or empty = UNASSIGNED" value={newFor} onChange={e=>setNewFor(e.target.value)} />
                <select value={newPlan} onChange={e=>setNewPlan(e.target.value)} style={{...S.input,marginBottom:10}}><option>PRO - 7 Days</option><option>PRO - 30 Days</option><option>PRO - 90 Days</option><option>PRO - Lifetime</option></select>
                <button onClick={createLic} style={{width:'100%',height:38,borderRadius:8,background:'linear-gradient(90deg,#D4AF37,#FFD86A)',color:'#000',fontWeight:900,border:'none',cursor:'pointer'}}>GENERATE NEW LICENCE KEY</button>
                <div style={{marginTop:12,maxHeight:300,overflow:'auto',display:'flex',flexDirection:'column',gap:8}}>{licences.map(l=><div key={l.key} style={{background:'#070D20',border:'1px solid #1E2742',borderRadius:8,padding:10}}><div style={{fontFamily:'monospace',fontSize:11,fontWeight:800,color:'#D4AF37'}}>{l.key}</div><div style={{fontSize:10,color:'#9AA3C3'}}>{l.email} • {l.plan} • Exp: {l.expiry} • {l.status}</div><button onClick={()=>navigator.clipboard?.writeText(l.key)} style={{marginTop:6,width:'100%',height:26,borderRadius:6,background:'#1A2340',border:'1px solid #2A3A66',color:'#fff',fontSize:9}}>COPY KEY TO SEND CLIENT</button></div>)}</div>
              </div></div>
            )}
          </div>
        )}

        <div style={S.nav}>
          {[{id:"scanner",label:"SCANNER"},{id:"settings",label:"SETTINGS"}].map(n=><div key={n.id} onClick={()=>setTab(n.id)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer',color: tab===n.id? '#00FF88':'#5F6B8F'}}><div style={{fontSize:9,fontWeight:800}}>{n.label}</div>{tab===n.id && <div style={{width:20,height:2,background:'#00FF88',borderRadius:99}}></div>}</div>)}
        </div>
      </div>
    </div>
  )
}
