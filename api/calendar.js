// api/calendar.js - TASK 1b FIXED - Faireconomy PRIMARY (works on Vercel) + investing.com secondary
// Fixes: "FALLBACK - APIs blocked" shown in screenshot

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const flagMap = { USD:'🇺🇸', GBP:'🇬🇧', EUR:'🇪🇺', JPY:'🇯🇵', AUD:'🇦🇺', CAD:'🇨🇦', CHF:'🇨🇭', CNY:'🇨🇳', NZD:'🇳🇿' };

  async function fetchFaireconomy(){
    try{
      const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', { 
        headers: { 'User-Agent':'Mozilla/5.0 (FUNDAMENTAL-SCANNER)' },
        next: { revalidate: 60 }
      });
      if(!r.ok) throw new Error(`Faireconomy ${r.status}`);
      const data = await r.json();
      // Filter today + this week, high impact USD/EUR/GBP
      const today = new Date().toLocaleDateString('en-CA', {timeZone:'Africa/Johannesburg'});
      const events = data
        .filter(ev => {
          const country = ev.country || 'USD';
          return ['USD','EUR','GBP','JPY','AUD','CAD'].includes(country);
        })
        .map(ev=>{
          const titleUpper = (ev.title||'').toUpperCase();
          let type='OTHER';
          if(titleUpper.includes('NON-FARM')||titleUpper.includes('NFP')) type='NFP';
          else if(titleUpper.includes('CPI')) type='CPI';
          else if(titleUpper.includes('FOMC')||titleUpper.includes('FED')&&titleUpper.includes('RATE')) type='FOMC';
          else if(titleUpper.includes('GDP')) type='GDP';
          else if(titleUpper.includes('JOBLESS')||titleUpper.includes('CLAIMS')) type='Claims';
          else if(titleUpper.includes('PMI')) type='PMI';
          else if(titleUpper.includes('RETAIL SALES')) type='Sales';
          
          return {
            time: ev.time || 'Tentative',
            currency: ev.country || 'USD',
            flag: flagMap[ev.country] || '🏳️',
            event: ev.title,
            title: ev.title,
            importance: ev.impact==='High'?3: ev.impact==='Medium'?2:1,
            impact: (ev.impact||'Low').toLowerCase(),
            forecast: ev.forecast || '',
            previous: ev.previous || '',
            actual: ev.actual || '',
            type,
            date: ev.date,
            source: 'ForexFactory via Faireconomy - LIVE'
          };
        })
        .slice(0, 25); // Limit to 25 for UI

      if(events.length>0) return events;
      throw new Error('Faireconomy returned 0 events');
    }catch(e){
      console.log('Faireconomy failed:', e.message);
      return null;
    }
  }

  async function fetchInvesting(){
    try{
      const formData = new URLSearchParams({
        'country[]': '25,32,6,37,72,22,17,39,14,10,35,43,56,36,110,11,26,12,4,5',
        'importance[]': '1,2,3',
        'timeZone': '8',
        'timeFilter': 'timeRemain',
        'currentTab': 'today',
        'limit_from': '0'
      });
      const response = await fetch('https://www.investing.com/economic-calendar/Service/getCalendarFilteredData', {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://www.investing.com/economic-calendar/',
          'Origin': 'https://www.investing.com'
        },
        body: formData
      });
      if(!response.ok) throw new Error(`investing ${response.status}`);
      const data = await response.json();
      const html = data.data || '';
      // Simple regex parse
      const events = [];
      const rowRegex = /<tr[^>]*id="eventRowId_\d+"[^>]*>([\s\S]*?)<\/tr>/g;
      let m;
      while((m=rowRegex.exec(html))!==null){
        const row=m[0];
        const timeM=row.match(/class="[^"]*time[^"]*"[^>]*>([^<]+)</i);
        const currM=row.match(/flagCur[^>]*>[\s\S]*?<span[^>]*>([A-Z]{3})<\/span>/i);
        const eventM=row.match(/event[^"]*"[^>]*>[\s\S]*?>([^<]{5,}?)<\/a>/i);
        const foreM=row.match(/event_Forecast_\d+"[^>]*>([^<]*)</i);
        const prevM=row.match(/event_Previous_\d+"[^>]*>([^<]*)</i);
        const impM=row.match(/bull([1-3])/i);
        if(!eventM) continue;
        events.push({
          time: timeM?timeM[1].trim():'All Day',
          currency: currM?currM[1].trim():'USD',
          flag: flagMap[currM?currM[1].trim():'USD']||'🏳️',
          event: eventM[1].trim().replace(/&amp;/g,'&'),
          title: eventM[1].trim().replace(/&amp;/g,'&'),
          forecast: foreM?foreM[1].replace(/&nbsp;/g,'').trim():'',
          previous: prevM?prevM[1].replace(/&nbsp;/g,'').trim():'',
          actual:'',
          importance: impM?parseInt(impM[1]):2,
          impact: impM? (impM[1]==='3'?'high':impM[1]==='2'?'medium':'low'):'medium',
          type:'OTHER',
          source:'investing.com live'
        });
      }
      if(events.length>0) return events;
      return null;
    }catch(e){
      console.log('Investing failed:', e.message);
      return null;
    }
  }

  // TRY FAIRECONOMY FIRST - works on Vercel, investing.com is often blocked
  let events = await fetchFaireconomy();
  let source = 'ForexFactory via Faireconomy - LIVE';
  
  if(!events){
    events = await fetchInvesting();
    source = 'investing.com live';
  }

  if(events && events.length>0){
    return res.status(200).json({
      success: true,
      source,
      count: events.length,
      events,
      fetchedAt: new Date().toISOString(),
      timezone: 'SAST GMT+2'
    });
  }

  // Last resort - return empty with error, NOT fake data
  return res.status(200).json({
    success: false,
    source: 'All APIs blocked - check Vercel logs',
    error: 'Faireconomy and investing.com both failed. Check if Vercel allows fetch to nfs.faireconomy.media',
    events: [],
    fetchedAt: new Date().toISOString()
  });
}
