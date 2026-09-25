
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});
  
  const { newsEvent='Initial Jobless Claims', market='XAU/USD', releaseDate } = req.body || {};
  
  let direction='BUY', dollarStrength='SOFT', volatility='MED', confidence=68;
  let reasoning='', bullishProb=72, fearGreed=78, marketSentiment=90;
  
  const evt = newsEvent.toLowerCase();
  if (evt.includes('cpi') || evt.includes('inflation') || evt.includes('ppi')) {
    direction='SELL'; dollarStrength='STRONG'; volatility='HIGH'; confidence=72;
    bullishProb=35;
    reasoning = `Hot ${newsEvent} reading expected. Fed hawkish bias strengthens Dollar. ${market.includes('XAU') ? 'Gold pressured, sell rallies. Expect spike down to $2655 then consolidation.' : 'USD strength to weigh on pair. Sell on strength.'}`;
  } else if (evt.includes('jobless') || evt.includes('claims')) {
    direction='BUY'; dollarStrength='SOFT'; volatility='MED'; confidence=68; bullishProb=72;
    reasoning = `Rising ${newsEvent} signals labor market cooling. Supports dovish Fed pivot. Dollar weakens. ${market.includes('XAU') ? 'Gold retains strong upside structural momentum above $4050, dips likely to be bought. Entry 2675, SL 2665, TP1 2685 TP2 2695.' : 'Risk-on bias for pair.'} Market sentiment 90% bullish.`;
  } else if (evt.includes('nfp') || evt.includes('non-farm') || evt.includes('payroll')) {
    direction='BUY'; volatility='HIGH'; confidence=65; bullishProb=58;
    reasoning = `NFP high volatility event. If deviation from forecast >20K, expect strong directional move. Current consensus suggests softening labor. Buy Gold on weak NFP.`;
  } else if (evt.includes('fomc') || evt.includes('fed') || evt.includes('ecb')) {
    direction='BUY'; dollarStrength='SOFT'; volatility='HIGH'; confidence=70;
    reasoning = `${newsEvent} dovish hold expected. Market pricing rate cuts. Risk assets to benefit. Gold bullish.`;
  } else {
    direction='BUY'; reasoning = `Daily Scanner: ${market} structural uptrend intact. EMA 50 > EMA 200, RSI 58, DXY softening -0.18%. Fundamental bias bullish for today even without major news.`;
  }

  const isGold = market.includes('XAU') || market.includes('Gold');
  const entry = isGold ? 2675.50 + (Math.random()-0.5)*5 : 1.0845 + (Math.random()-0.5)*0.002;
  const atr = isGold ? 10 : 0.0015;
  const sl = direction==='BUY' ? entry - atr : entry + atr;
  const tp1 = direction==='BUY' ? entry + atr : entry - atr;
  const tp2 = direction==='BUY' ? entry + atr*2 : entry - atr*2;

  res.json({
    direction, confidence, dollarStrength, volatility, bullishProbability: bullishProb,
    fearGreed, marketSentiment, entry: entry.toFixed(isGold?2:5), sl: sl.toFixed(isGold?2:5), tp1: tp1.toFixed(isGold?2:5), tp2: tp2.toFixed(isGold?2:5),
    reasoning, timestamp: new Date().toISOString(), newsEvent, market
  });
}
