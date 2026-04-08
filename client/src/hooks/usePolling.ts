import { useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDashboardStore } from '../store/dashboardStore';
import { mockMarketData } from '../utils/mockData';
import type { CrisisSignal, NewsItem } from '../types';

const API_BASE = 'http://localhost:3001/api';

// ---------------------------------------------------------------------------
// Location extraction
// ---------------------------------------------------------------------------
const LOCATION_KEYWORDS: { keywords: string[]; lat: number; lng: number; label: string }[] = [
  { keywords: ['iran', 'tehran', 'iranian'], lat: 35.7, lng: 51.4, label: 'Tehran' },
  { keywords: ['israel', 'gaza', 'tel aviv', 'netanyahu', 'hamas', 'west bank', 'palestine', 'hezbollah'], lat: 31.8, lng: 35.2, label: 'Jerusalem' },
  { keywords: ['ukraine', 'kyiv', 'zelensky', 'ukrainian'], lat: 50.4, lng: 30.5, label: 'Kyiv' },
  { keywords: ['russia', 'moscow', 'kremlin', 'putin'], lat: 55.7, lng: 37.6, label: 'Moscow' },
  { keywords: ['china', 'beijing', 'shanghai', 'chinese', 'hong kong'], lat: 39.9, lng: 116.4, label: 'Beijing' },
  { keywords: ['taiwan', 'taipei'], lat: 25.0, lng: 121.5, label: 'Taipei' },
  { keywords: ['north korea', 'pyongyang', 'kim jong'], lat: 39.0, lng: 125.8, label: 'Pyongyang' },
  { keywords: ['korea', 'seoul'], lat: 37.6, lng: 127.0, label: 'Seoul' },
  { keywords: ['japan', 'tokyo', 'nikkei', 'yen'], lat: 35.7, lng: 139.7, label: 'Tokyo' },
  { keywords: ['india', 'delhi', 'mumbai', 'modi', 'rupee'], lat: 28.6, lng: 77.2, label: 'New Delhi' },
  { keywords: ['pakistan', 'islamabad', 'karachi'], lat: 33.7, lng: 73.1, label: 'Islamabad' },
  { keywords: ['saudi', 'riyadh', 'aramco', 'opec'], lat: 24.7, lng: 46.7, label: 'Riyadh' },
  { keywords: ['iraq', 'baghdad'], lat: 33.3, lng: 44.4, label: 'Baghdad' },
  { keywords: ['middle east'], lat: 29.0, lng: 42.0, label: 'Middle East' },
  { keywords: ['turkey', 'ankara', 'istanbul', 'erdogan'], lat: 39.9, lng: 32.9, label: 'Ankara' },
  { keywords: ['egypt', 'cairo'], lat: 30.0, lng: 31.2, label: 'Cairo' },
  { keywords: ['africa', 'nigeria', 'lagos'], lat: 6.5, lng: 3.4, label: 'Lagos' },
  { keywords: ['south africa', 'johannesburg'], lat: -26.2, lng: 28.0, label: 'Johannesburg' },
  { keywords: ['ethiopia', 'kenya', 'east africa'], lat: 9.0, lng: 38.7, label: 'Addis Ababa' },
  { keywords: ['europe', 'european union', ' eu ', 'ecb', 'eurozone', 'brussels'], lat: 50.8, lng: 4.4, label: 'Brussels' },
  { keywords: ['germany', 'berlin', 'german', 'bundesbank'], lat: 52.5, lng: 13.4, label: 'Berlin' },
  { keywords: ['france', 'paris', 'macron', 'french'], lat: 48.8, lng: 2.3, label: 'Paris' },
  { keywords: ['uk', 'britain', 'british', 'london', 'bank of england', 'pound'], lat: 51.5, lng: -0.1, label: 'London' },
  { keywords: ['new york', 'nyc', 'wall street', 'nasdaq', 'dow jones', 's&p 500', 'goldman', 'jpmorgan'], lat: 40.7, lng: -74.0, label: 'New York' },
  { keywords: ['washington', 'white house', 'pentagon', 'congress', 'senate', 'trump', 'biden'], lat: 38.9, lng: -77.0, label: 'Washington D.C.' },
  { keywords: ['california', 'los angeles', 'san francisco', 'silicon valley'], lat: 37.8, lng: -122.4, label: 'California' },
  { keywords: ['canada', 'ottawa', 'toronto'], lat: 45.4, lng: -75.7, label: 'Ottawa' },
  { keywords: ['mexico', 'mexico city'], lat: 19.4, lng: -99.1, label: 'Mexico City' },
  { keywords: ['brazil', 'são paulo', 'sao paulo', 'brasilia'], lat: -23.5, lng: -46.6, label: 'São Paulo' },
  { keywords: ['argentina', 'buenos aires'], lat: -34.6, lng: -58.4, label: 'Buenos Aires' },
  { keywords: ['colombia', 'bogota'], lat: 4.7, lng: -74.1, label: 'Bogotá' },
  { keywords: ['australia', 'sydney', 'canberra', 'rba'], lat: -33.8, lng: 151.2, label: 'Sydney' },
  { keywords: ['indonesia', 'jakarta'], lat: -6.2, lng: 106.8, label: 'Jakarta' },
  { keywords: ['crypto', 'bitcoin', 'ethereum', 'btc', 'eth', 'blockchain', 'defi', 'coinbase', 'binance'], lat: 37.8, lng: -122.4, label: 'San Francisco' },
  { keywords: ['oil', 'crude', 'energy market', 'brent', 'wti', 'petroleum'], lat: 25.3, lng: 51.5, label: 'Doha' },
  { keywords: ['gold', 'precious metal'], lat: 40.7, lng: -74.0, label: 'New York' },
  { keywords: ['federal reserve', 'powell', 'interest rate', 'inflation', 'cpi', 'fomc'], lat: 38.9, lng: -77.0, label: 'Washington D.C.' },
  { keywords: ['hurricane', 'typhoon', 'cyclone'], lat: 25.0, lng: -80.0, label: 'Caribbean' },
  { keywords: ['earthquake', 'tsunami', 'seismic'], lat: 35.7, lng: 139.7, label: 'Tokyo' },
  { keywords: ['wildfire', 'forest fire'], lat: 34.0, lng: -118.2, label: 'Los Angeles' },
  { keywords: ['flood', 'flooding'], lat: 23.8, lng: 90.4, label: 'Dhaka' },
  { keywords: ['drought', 'famine'], lat: 15.6, lng: 32.5, label: 'Khartoum' },
];

function extractLocation(text: string): { lat: number; lng: number; label: string } | null {
  const lower = text.toLowerCase();
  for (const entry of LOCATION_KEYWORDS) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return { lat: entry.lat, lng: entry.lng, label: entry.label };
    }
  }
  return null;
}

function classifyArticle(text: string, feedCategory?: string): { type: CrisisSignal['type']; severity: CrisisSignal['severity'] } {
  const lower = text.toLowerCase();

  const criticalWords = ['war', 'attack', 'killed', 'dead', 'collapse', 'crash', 'crisis', 'emergency', 'explosion', 'invasion', 'missile', 'nuclear', 'catastrophe', 'plunge', 'bombing', 'massacre'];
  const warningWords = ['tension', 'threat', 'risk', 'sanction', 'protest', 'unrest', 'decline', 'concern', 'warning', 'volatile', 'drops', 'falls', 'slump', 'dispute', 'arrested', 'detained'];
  const severity: CrisisSignal['severity'] = criticalWords.some(w => lower.includes(w)) ? 'critical'
    : warningWords.some(w => lower.includes(w)) ? 'warning' : 'info';

  // Feed-category feeds get their type directly — most reliable signal
  if (feedCategory === 'environmental') return { type: 'environmental', severity };
  if (feedCategory === 'market')        return { type: 'market', severity };
  if (feedCategory === 'weather')       return { type: 'weather', severity };

  // For 'global' category feeds, use keywords — but default to geopolitical (not environmental)
  const weatherWords = ['hurricane', 'typhoon', 'cyclone', 'tornado', 'storm', 'heatwave', 'blizzard', 'snowstorm', 'flooding rain', 'severe weather'];
  const envWords    = ['climate change', 'wildfire', 'earthquake', 'tsunami', 'drought', 'pollution', 'emissions', 'carbon', 'glacier', 'sea level', 'deforestation', 'flood damage'];
  const marketWords = ['stock market', 'economy', 'gdp', 'federal reserve', 'interest rate', 'crypto', 'bitcoin', 'bank', 'inflation', 'tariff', 'nasdaq', 'dow jones', 'bond yield', 'recession', 'trade war'];

  const type: CrisisSignal['type'] =
    weatherWords.some(w => lower.includes(w)) ? 'weather'
    : envWords.some(w => lower.includes(w))   ? 'environmental'
    : marketWords.some(w => lower.includes(w)) ? 'market'
    : 'geopolitical'; // default for global feeds: elections, crime, military, diplomacy, etc.

  return { type, severity };
}

function newsToSignals(items: NewsItem[]): CrisisSignal[] {
  const signals: CrisisSignal[] = [];
  const usedCoords = new Set<string>();
  for (const item of items) {
    const text = `${item.title} ${item.description || ''}`;
    const loc = extractLocation(text);
    if (!loc) continue;
    let { lat, lng } = loc;
    const coordKey = `${lat.toFixed(1)},${lng.toFixed(1)}`;
    if (usedCoords.has(coordKey)) {
      lat += (Math.random() - 0.5) * 4;
      lng += (Math.random() - 0.5) * 4;
    }
    usedCoords.add(coordKey);
    const { type, severity } = classifyArticle(text, item.category);
    signals.push({
      id: `news-signal-${item.id}`,
      type, severity, lat, lng,
      title: item.title.length > 80 ? item.title.slice(0, 77) + '…' : item.title,
      body: item.description || item.title,
      source: item.source,
      timestamp: new Date(item.publishedAt),
    });
  }
  return signals;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const usePolling = () => {
  const {
    setMarketData, appendPriceHistory, setNewsItems, setSignals,
    updateFearGreed, setAIAnalysis, setAILoading, selectedSignal,
  } = useDashboardStore();

  const isInitialized = useRef(false);
  const lastAICallRef = useRef(0);
  const aiInFlightRef = useRef(false);
  const AI_COOLDOWN_MS = 5000;

  // Refs to hold latest data so both can merge into one marketData update
  const latestCryptoRef = useRef<any>(null);
  const latestStocksRef = useRef<any>(null);
  const latestCommoditiesRef = useRef<any>(null);
  const latestForexRef = useRef<any>(null);

  // Refs to hold latest signals from each source so they can be merged
  const newsSignalsRef = useRef<CrisisSignal[]>([]);
  const earthquakeSignalsRef = useRef<CrisisSignal[]>([]);
  const gdeltSignalsRef = useRef<CrisisSignal[]>([]);

  const mergeAndSetSignals = () => {
    const combined = [...newsSignalsRef.current, ...earthquakeSignalsRef.current, ...gdeltSignalsRef.current];
    if (combined.length > 0) setSignals(combined, true);
  };

  // --- Market data merge ---
  const applyMarketData = (crypto: any, stocks: any, commodities: any, forex: any) => {
    const mock = mockMarketData;
    const newData = {
      btc: crypto?.bitcoin ? { price: crypto.bitcoin.usd, change24h: crypto.bitcoin.usd_24h_change } : mock.btc,
      eth: crypto?.ethereum ? { price: crypto.ethereum.usd, change24h: crypto.ethereum.usd_24h_change } : mock.eth,
      sol: crypto?.solana ? { price: crypto.solana.usd, change24h: crypto.solana.usd_24h_change } : mock.sol,
      spy: stocks?.SPY?.['05. price'] ? { price: parseFloat(stocks.SPY['05. price']), change24h: parseFloat(stocks.SPY['10. change percent']) } : mock.spy,
      qqq: stocks?.QQQ?.['05. price'] ? { price: parseFloat(stocks.QQQ['05. price']), change24h: parseFloat(stocks.QQQ['10. change percent']) } : mock.qqq,
      vix: stocks?.['^VIX']?.['05. price'] ? { price: parseFloat(stocks['^VIX']['05. price']), change24h: parseFloat(stocks['^VIX']['10. change percent']) } : mock.vix,
      gold: commodities?.gold ?? mock.gold,
      oil: commodities?.oil ?? mock.oil,
      forex: (forex && Object.keys(forex).length > 0) ? forex : mock.forex,
    };
    setMarketData(newData, crypto !== null || commodities?.gold !== null);
    ['BTC', 'ETH', 'SOL', 'SPY', 'QQQ', 'VIX'].forEach(asset => {
      appendPriceHistory(asset, (newData as any)[asset.toLowerCase()].price);
    });
  };

  // CoinGecko — every 2 min
  const fetchCrypto = async () => {
    try {
      const res = await axios.get(`${API_BASE}/market/crypto`);
      latestCryptoRef.current = res.data;
    } catch (e) { console.warn('Crypto API failed'); }
    applyMarketData(latestCryptoRef.current, latestStocksRef.current, latestCommoditiesRef.current, latestForexRef.current);
  };

  // Alpha Vantage — every 4 hours (25 req/day limit)
  const fetchStocks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/market/stocks`);
      latestStocksRef.current = res.data;
    } catch (e) { console.warn('Stocks API failed'); }
    applyMarketData(latestCryptoRef.current, latestStocksRef.current, latestCommoditiesRef.current, latestForexRef.current);
  };

  // Commodities (gold via CoinGecko PAXG + WTI via Yahoo Finance) — every 5 min
  const fetchCommodities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/market/commodities`);
      latestCommoditiesRef.current = res.data;
    } catch (e) { console.warn('Commodities API failed'); }
    applyMarketData(latestCryptoRef.current, latestStocksRef.current, latestCommoditiesRef.current, latestForexRef.current);
  };

  // Forex (Yahoo Finance v7 batch — 6 major pairs) — every 5 min
  const fetchForex = async () => {
    try {
      const res = await axios.get(`${API_BASE}/market/forex`);
      latestForexRef.current = res.data;
    } catch (e) { console.warn('Forex API failed'); }
    applyMarketData(latestCryptoRef.current, latestStocksRef.current, latestCommoditiesRef.current, latestForexRef.current);
  };

  // GDELT Conflict Events — free, no key, 65k+ global sources — every 15 min
  const fetchGdelt = async () => {
    try {
      const res = await axios.get(`${API_BASE}/gdelt`);
      const articles: any[] = Array.isArray(res.data) ? res.data : [];
      const signals: CrisisSignal[] = [];
      const usedCoords = new Set<string>();

      for (const article of articles) {
        if (!article.title) continue;
        const loc = extractLocation(article.title);
        if (!loc) continue;
        let { lat, lng } = loc;
        const coordKey = `${lat.toFixed(1)},${lng.toFixed(1)}`;
        if (usedCoords.has(coordKey)) {
          lat += (Math.random() - 0.5) * 4;
          lng += (Math.random() - 0.5) * 4;
        }
        usedCoords.add(coordKey);
        const { type, severity } = classifyArticle(article.title, 'global');
        // Parse GDELT date format: "20240407T120000Z"
        const raw = article.seendate ?? '';
        const timestamp = raw.length >= 15
          ? new Date(`${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}T${raw.slice(9,11)}:${raw.slice(11,13)}:${raw.slice(13,15)}Z`)
          : new Date();
        signals.push({
          id: `gdelt-${article.url?.slice(-24) ?? Math.random()}`,
          type,
          severity,
          lat, lng,
          title: article.title.length > 80 ? article.title.slice(0, 77) + '…' : article.title,
          body: `Reported by ${article.domain || 'international media'}.`,
          source: article.domain || 'GDELT',
          timestamp,
        });
      }
      gdeltSignalsRef.current = signals;
      mergeAndSetSignals();
    } catch (e) { console.warn('GDELT fetch failed'); }
  };

  const fetchMarket = async () => {
    await Promise.all([fetchCrypto(), fetchStocks(), fetchCommodities(), fetchForex()]);
  };

  // --- CNN Fear & Greed ---
  const fetchFearGreed = async () => {
    try {
      const res = await axios.get(`${API_BASE}/feargreed`);
      const { score, rating, previousClose, previousWeek, previousMonth } = res.data;
      const label = rating.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      updateFearGreed(score, label, previousClose ?? 0, previousWeek ?? 0, previousMonth ?? 0);
    } catch (e) { console.warn('Fear & Greed fetch failed'); }
  };

  // --- News + signals ---
  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/news`);
      const items: NewsItem[] = res.data.articles.map((a: any, i: number) => ({
        id: `news-${i}`,
        title: a.title,
        description: a.description,
        source: a.source.name,
        publishedAt: a.publishedAt,
        url: a.url,
        category: a.category,
      }));
      if (items.length > 0) {
        setNewsItems(items, true);
        newsSignalsRef.current = newsToSignals(items);
        mergeAndSetSignals();
      }
    } catch (e) { console.warn('News API failed'); }
  };

  // --- USGS Earthquakes ---
  const fetchEarthquakes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/earthquakes`);
      const features: any[] = res.data?.features ?? [];
      const signals: CrisisSignal[] = features
        .filter(f => f.properties?.mag >= 2.5 && f.geometry?.coordinates)
        .map(f => {
          const mag: number = f.properties.mag;
          const [lng, lat] = f.geometry.coordinates;
          const place: string = f.properties.place || 'Unknown location';
          const severity: CrisisSignal['severity'] = mag >= 7.0 ? 'critical' : mag >= 5.0 ? 'warning' : 'info';
          return {
            id: `quake-${f.id}`,
            type: 'environmental' as const,
            severity,
            lat, lng,
            title: `M${mag.toFixed(1)} Earthquake — ${place}`,
            body: `Magnitude ${mag.toFixed(1)} seismic event detected ${place}. ${mag >= 6.0 ? 'Potential for significant damage and aftershocks.' : mag >= 5.0 ? 'Felt widely, minor damage possible.' : 'Minor event, unlikely to cause damage.'}`,
            source: 'USGS',
            timestamp: new Date(f.properties.time),
          };
        });
      earthquakeSignalsRef.current = signals;
      mergeAndSetSignals();
    } catch (e) { console.warn('Earthquake fetch failed:', e); }
  };

  // --- AI Analysis ---
  const runAIAnalysis = useCallback(async (signal?: any) => {
    const now = Date.now();
    if (aiInFlightRef.current || now - lastAICallRef.current < AI_COOLDOWN_MS) return;
    aiInFlightRef.current = true;
    lastAICallRef.current = now;
    setAILoading(true);
    try {
      const state = useDashboardStore.getState();
      const btcPrice = state.marketData?.btc?.price || 'N/A';
      const btcChange = state.marketData?.btc?.change24h || 'N/A';
      const goldPrice = state.marketData?.gold?.price || 'N/A';
      const sentiment = state.fearGreedLabel || 'Analyzing...';
      const topNews = state.newsItems.slice(0, 3).map(n => n.title).join('; ') || 'Awaiting headlines...';
      const allSignals = state.signals;
      const criticalSignals = allSignals.filter(s => s.severity === 'critical').slice(0, 3);
      const warningSignals = allSignals.filter(s => s.severity === 'warning').slice(0, 2);
      const topSignals = [...criticalSignals, ...warningSignals];
      const signalSummary = topSignals.map(s => `[${s.severity.toUpperCase()}] ${s.title}`).join('; ') || 'No active alerts';

      const forex = state.marketData?.forex;
      const fxStr = forex ? `EUR/USD ${forex.eurUsd.rate.toFixed(4)} | GBP/USD ${forex.gbpUsd.rate.toFixed(4)} | USD/JPY ${forex.usdJpy.rate.toFixed(2)}` : '';
      const oilPrice = state.marketData?.oil?.price || 'N/A';

      let prompt = '';
      if (signal) {
        prompt = `You are a geopolitical intelligence analyst named Bob. Respond in plain text only — no markdown, no asterisks, no bullet points, no headers.

EVENT: ${signal.title}
DETAILS: ${signal.body}
LOCATION: (${signal.lat.toFixed(2)}, ${signal.lng.toFixed(2)})
MARKET CONTEXT: BTC $${btcPrice} | Gold $${goldPrice}/oz | Oil $${oilPrice}/bbl | Sentiment: ${sentiment}${fxStr ? `\nFOREX: ${fxStr}` : ''}

Write 3-4 sentences of authoritative analysis. Explain how this event impacts regional stability and asset valuations. Be decisive and direct.`;
      } else {
        prompt = `You are Bob, an elite global intelligence analyst briefing an operations center. Respond in plain text only — no markdown, no asterisks, no bullet points, no headers.

MARKET SNAPSHOT: BTC $${btcPrice} (${btcChange}% 24h) | Gold $${goldPrice}/oz | Oil $${oilPrice}/bbl | Sentiment: ${sentiment}${fxStr ? `\nFOREX: ${fxStr}` : ''}
TOP ACTIVE SIGNALS: ${signalSummary}
KEY HEADLINES: ${topNews}

Deliver a 4-sentence global intelligence briefing. Identify the single most significant geopolitical or market risk active right now. Highlight a non-obvious connection between current signals and market conditions. End with a specific watch item for the next 24 hours.`;
      }

      const res = await axios.post(`${API_BASE}/ai/analyze`, { prompt });
      if (res.data?.choices?.[0]?.message?.content) {
        setAIAnalysis(res.data.choices[0].message.content);
      } else throw new Error('Incomplete response');
    } catch (e) {
      console.error('GICC AI Error:', e);
      setAIAnalysis("Strategic intelligence indicates heightened sensitivity in commodities and energy markets due to environmental-geopolitical coupling. Maintain exposure to non-correlated defensive assets until the next sync cycle completes.");
    } finally {
      setAILoading(false);
      aiInFlightRef.current = false;
    }
  }, [setAILoading, setAIAnalysis]);

  useEffect(() => {
    (window as any).runGICCAI = runAIAnalysis;
    return () => { delete (window as any).runGICCAI; };
  }, [runAIAnalysis]);

  useEffect(() => {
    if (selectedSignal) {
      runAIAnalysis(selectedSignal);
      if ((window as any).giccFlyTo) (window as any).giccFlyTo(selectedSignal.lat, selectedSignal.lng);
    }
  }, [selectedSignal, runAIAnalysis]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      await Promise.all([fetchFearGreed(), fetchMarket(), fetchNews(), fetchEarthquakes(), fetchGdelt()]);
      runAIAnalysis();
    };
    init();

    const cryptoInterval      = setInterval(fetchCrypto,       2 * 60 * 1000);
    const stocksInterval      = setInterval(fetchStocks,       4 * 60 * 60 * 1000);
    const commoditiesInterval = setInterval(fetchCommodities,  5 * 60 * 1000);
    const forexInterval       = setInterval(fetchForex,        5 * 60 * 1000);
    const fearGreedInterval   = setInterval(fetchFearGreed,    10 * 60 * 1000);
    const newsInterval        = setInterval(fetchNews,         5 * 60 * 1000);
    const quakeInterval       = setInterval(fetchEarthquakes,  10 * 60 * 1000);
    const gdeltInterval       = setInterval(fetchGdelt,        15 * 60 * 1000); // GDELT updates every 15 min
    const aiInterval          = setInterval(() => runAIAnalysis(), 5 * 60 * 1000);

    return () => {
      clearInterval(cryptoInterval);
      clearInterval(stocksInterval);
      clearInterval(commoditiesInterval);
      clearInterval(forexInterval);
      clearInterval(fearGreedInterval);
      clearInterval(newsInterval);
      clearInterval(quakeInterval);
      clearInterval(gdeltInterval);
      clearInterval(aiInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runAIAnalysis]);
};
