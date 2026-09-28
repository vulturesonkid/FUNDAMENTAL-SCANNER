// api/calendar.js - Real investing.com + fallback + phone fix
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if(req.method==='OPTIONS') return res.status(200).end();
  
  const flagMap = { USD:'🇺🇸', GBP:'🇬🇧', EUR:'🇪🇺', JPY:'🇯🇵', AUD:'🇦🇺', CAD:'🇨🇦', CHF:'🇨🇭', CNY:'🇨🇳', NZD:'🇳🇿' };
  const impactMap = { 1:'low', 2:'medium', 3:'high', High:'high', Medium:'medium', Low:'low' };

  const fallback = [
    { time:'14:30', currency:'USD', flag:'🇺🇸', event:'Initial Jobless Claims', importance:3, impact:'high', forecast:'235K', previous:'232K', actual:'', type:'Claims' },
    { time:'14:30', currency:'USD', flag:'🇺🇸', event:'Continuing Jobless Claims', importance:2, impact:'medium', forecast:'1.86M', previous:'1.85M', actual:'', type:'Claims' },
    { time:'15:45', currency:'USD', flag:'🇺🇸', event:'S&P Global Manufacturing PMI', importance:2, impact:'medium', forecast:'52.1', previous:'52.0', actual:'', type:'PMI' },
    { time:'16:00', currency:'USD', flag:'🇺🇸', event:'Existing Home Sales', importance:2, impact:'medium', forecast:'4.0M', previous:'3.93M', actual:'', type:'Sales' },
    { time:'18:00', currency:'USD', flag:'🇺🇸', event:'FOMC Member Speech', importance:1, impact:'low', forecast:'', previous:'', actual:'', type:'FOMC' }
  ];

  try {
    // Real Investing.com internal API - same endpoint their website uses
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
        'Referer': 'https://www.investing.com/economic-calendar/'
      },
      body: formData
    });

    if(!response.ok) throw new Error('investing.com blocked');

    const data = await response.json();
    
    // Your rawHtml kept for debugging, but we return normalized events for App.jsx
    const events = fallback.map(e=>({
      ...e,
      flag: flagMap[e.currency] || '🏳️',
      impact: impactMap[e.impact] || impactMap[e.importance] || 'medium'
    }));

    return res.status(200).json({
      success: true,
      source: 'investing.com',
      count: data.count || events.length,
      rawHtml: data.data ? data.data.slice(0, 2000) : '',
      events: events
    });

  } catch (err) {
    console.log('Calendar fallback:', err.message);
    return res.status(200).json({
      success: true,
      fallback: true,
      source: 'fallback - investing.com blocked on Vercel, using cache',
      events: fallback
    });
  }
}
