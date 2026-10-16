// api/calendar.js - FIXED - Real investing.com parsing + Faireconomy fallback + phone fix
// No more deceiving mock - returns REAL live events

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if(req.method==='OPTIONS') return res.status(200).end();
  
  const flagMap = { USD:'🇺🇸', GBP:'🇬🇧', EUR:'🇪🇺', JPY:'🇯🇵', AUD:'🇦🇺', CAD:'🇨🇦', CHF:'🇨🇭', CNY:'🇨🇳', NZD:'🇳🇿', EUR:'🇪🇺' };
  const impactMap = { 1:'low', 2:'medium', 3:'high', High:'high', Medium:'medium', Low:'low' };

  // Real parser for investing.com HTML
  function parseInvestingHTML(html){
    const events = [];
    try{
      // investing.com returns <tr id="eventRowId_..."> with data attributes
      const rowRegex = /<tr[^>]*id="eventRowId_\d+"[^>]*>([\s\S]*?)<\/tr>/g;
      let match;
      while((match = rowRegex.exec(html)) !== null){
        const row = match[0];
        const timeMatch = row.match(/class="[^"]*time[^"]*"[^>]*>([^<]+)</i);
        const currencyMatch = row.match(/class="[^"]*flagCur[^"]*"[^>]*>[\s\S]*?<span[^>]*>([A-Z]{3})<\/span>/i) || row.match(/<td[^>]*class="[^"]*flagCur[^"]*"[^>]*>\s*([A-Z]{3})/i);
        const eventMatch = row.match(/class="[^"]*event[^"]*"[^>]*>[\s\S]*?>([^<]{5,}?)<\/a>/i) || row.match(/event[^>]*>([^<]{5,})</i);
        const forecastMatch = row.match(/id="event_Forecast_\d+"[^>]*>([^<]*)</i);
        const previousMatch = row.match(/id="event_Previous_\d+"[^>]*>([^<]*)</i);
        const actualMatch = row.match(/id="event_Actual_\d+"[^>]*>([^<]*)</i);
        const importanceMatch = row.match(/<td[^>]*class="[^"]*sentiment[^"]*"[^>]*title="[^"]*([1-3])[^"]*"/i) || row.match(/data-img_key="[^"]*bull([1-3])/i);

        const time = timeMatch ? timeMatch[1].trim() : '';
        const currency = currencyMatch ? currencyMatch[1].trim().toUpperCase() : 'USD';
        const eventTitle = eventMatch ? eventMatch[1].trim().replace(/&amp;/g,'&') : '';
        if(!eventTitle) continue;

        const forecast = forecastMatch ? forecastMatch[1].trim().replace(/&nbsp;/g,'').replace(/<[^>]*>/g,'').trim() : '';
        const previous = previousMatch ? previousMatch[1].trim().replace(/&nbsp;/g,'').replace(/<[^>]*>/g,'').trim() : '';
        const actual = actualMatch ? actualMatch[1].trim().replace(/&nbsp;/g,'').replace(/<[^>]*>/g,'').trim() : '';
        const importance = importanceMatch ? parseInt(importanceMatch[1]) : 1;

        let type = 'OTHER';
        const upper = eventTitle.toUpperCase();
        if(upper.includes('NON-FARM') || upper.includes('NFP')) type='NFP';
        else if(upper.includes('CPI')) type='CPI';
        else if(upper.includes('FOMC') || (upper.includes('FED') && upper.includes('RATE'))) type='FOMC';
        else if(upper.includes('GDP')) type='GDP';
        else if(upper.includes('JOBLESS') || upper.includes('CLAIMS')) type='Claims';
        else if(upper.includes('PMI')) type='PMI';
        else if(upper.includes('OIL') || upper.includes('CRUDE') || upper.includes('INVENTORIES')) type='Oil';
        else if(upper.includes('SALES')) type='Sales';

        events.push({
          time: time || 'All Day',
          currency,
          flag: flagMap[currency] || '🏳️',
          event: eventTitle,
          title: eventTitle,
          importance,
          impact: impactMap[importance] || 'low',
          forecast,
          previous,
          actual,
          type,
          source: 'investing.com live'
        });
      }
    }catch(e){
      console.log('Parse error', e.message);
    }
    return events;
  }

  async function fetchFaireconomy(){
    try{
      const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', { headers: { 'User-Agent':'Mozilla/5.0' } });
      const data = await r.json();
      return data.map(ev=>{
        let isoDate = ev.date;
        try{ const d=new Date(ev.date); isoDate=d.toISOString().slice(0,10);}catch{}
        const titleUpper = (ev.title||'').toUpperCase();
        let type='OTHER';
        if(titleUpper.includes('NON-FARM')||titleUpper.includes('NFP')) type='NFP';
        else if(titleUpper.includes('CPI')) type='CPI';
        else if(titleUpper.includes('FOMC')) type='FOMC';
        return {
          time: ev.time || '',
          currency: ev.country || 'USD',
          flag: flagMap[ev.country] || '🏳️',
          event: ev.title,
          title: ev.title,
          importance: ev.impact==='High'?3: ev.impact==='Medium'?2:1,
          impact: (ev.impact||'low').toLowerCase(),
          forecast: ev.forecast||'',
          previous: ev.previous||'',
          actual: ev.actual||'',
          type,
          date: isoDate,
          source: 'ForexFactory via Faireconomy'
        };
      });
    }catch{ return [] }
  }

  try {
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

    if(!response.ok) throw new Error(`investing.com ${response.status}`);

    const data = await response.json();
    const html = data.data || '';

    // FIX: Actually parse the HTML instead of ignoring it
    const realEvents = parseInvestingHTML(html);

    if(realEvents.length>0){
      return res.status(200).json({
        success: true,
        source: 'investing.com live',
        count: realEvents.length,
        events: realEvents,
        fetchedAt: new Date().toISOString(),
        timezone: 'SAST GMT+2'
      });
    }

    // If parsing returned 0 but API returned html, try Faireconomy fallback
    const faire = await fetchFaireconomy();
    if(faire.length>0){
      return res.status(200).json({
        success: true,
        source: 'ForexFactory via Faireconomy (investing.com returned empty)',
        count: faire.length,
        events: faire,
        rawHtmlSample: html.slice(0,500),
        fetchedAt: new Date().toISOString()
      });
    }

    throw new Error('Both sources empty');

  } catch (err) {
    console.log('Calendar primary failed, trying Faireconomy:', err.message);
    const faire = await fetchFaireconomy();
    if(faire.length>0){
      return res.status(200).json({
        success: true,
        fallback: false,
        source: 'ForexFactory via Faireconomy - reliable fallback',
        count: faire.length,
        events: faire,
        fetchedAt: new Date().toISOString()
      });
    }

    // Last resort: dynamic fallback with TODAY'S date so it's not deceiving old data
    const today = new Date().toLocaleDateString('en-CA', {timeZone:'Africa/Johannesburg'});
    const fallback = [
      { time:'14:30', currency:'USD', flag:'🇺🇸', event:'Initial Jobless Claims (FALLBACK - APIs blocked)', importance:3, impact:'high', forecast:'235K', previous:'232K', actual:'', type:'Claims', date: today, source:'fallback' },
    ];
    return res.status(200).json({
      success: false,
      fallback: true,
      source: 'fallback - investing.com blocked on Vercel + Faireconomy failed',
      error: err.message,
      events: fallback,
      fetchedAt: new Date().toISOString()
    });
  }
}
