import { useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDashboardStore } from '../store/dashboardStore';
import { mockMarketData } from '../utils/mockData';
import type { CrisisSignal, NewsItem } from '../types';

const API_BASE = 'http://localhost:3001/api';

// ---------------------------------------------------------------------------
// Location extraction — maps keyword patterns to globe coordinates
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
  { keywords: ['middle east', 'iraq', 'baghdad', 'baghdad'], lat: 33.3, lng: 44.4, label: 'Baghdad' },
  { keywords: ['turkey', 'ankara', 'istanbul', 'erdogan'], lat: 39.9, lng: 32.9, label: 'Ankara' },
  { keywords: ['egypt', 'cairo'], lat: 30.0, lng: 31.2, label: 'Cairo' },
  { keywords: ['africa', 'nigeria', 'lagos'], lat: 6.5, lng: 3.4, label: 'Lagos' },
  { keywords: ['south africa', 'johannesburg', 'cape town'], lat: -26.2, lng: 28.0, label: 'Johannesburg' },
  { keywords: ['ethiopia', 'kenya', 'east africa'], lat: 9.0, lng: 38.7, label: 'Addis Ababa' },
  { keywords: ['europe', 'european union', ' eu ', 'ecb', 'eurozone', 'brussels'], lat: 50.8, lng: 4.4, label: 'Brussels' },
  { keywords: ['germany', 'berlin', 'german', 'bundesbank'], lat: 52.5, lng: 13.4, label: 'Berlin' },
  { keywords: ['france', 'paris', 'macron', 'french'], lat: 48.8, lng: 2.3, label: 'Paris' },
  { keywords: ['uk', 'britain', 'british', 'london', 'bank of england', 'pound'], lat: 51.5, lng: -0.1, label: 'London' },
  { keywords: ['new york', 'nyc', 'wall street', 'nasdaq', 'dow jones', 's&p 500', 'goldman', 'jpmorgan'], lat: 40.7, lng: -74.0, label: 'New York' },
  { keywords: ['washington', 'white house', 'pentagon', 'congress', 'senate', 'trump', 'biden'], lat: 38.9, lng: -77.0, label: 'Washington D.C.' },
  { keywords: ['california', 'los angeles', 'san francisco', 'silicon valley', 'tech stock'], lat: 37.8, lng: -122.4, label: 'California' },
  { keywords: ['canada', 'ottawa', 'toronto', 'canadian'], lat: 45.4, lng: -75.7, label: 'Ottawa' },
  { keywords: ['mexico', 'mexico city'], lat: 19.4, lng: -99.1, label: 'Mexico City' },
  { keywords: ['brazil', 'são paulo', 'sao paulo', 'brasilia', 'real currency'], lat: -23.5, lng: -46.6, label: 'São Paulo' },
  { keywords: ['argentina', 'buenos aires', 'peso'], lat: -34.6, lng: -58.4, label: 'Buenos Aires' },
  { keywords: ['venezuela', 'colombia'], lat: 4.7, lng: -74.1, label: 'Bogotá' },
  { keywords: ['australia', 'sydney', 'canberra', 'rba'], lat: -33.8, lng: 151.2, label: 'Sydney' },
  { keywords: ['indonesia', 'jakarta'], lat: -6.2, lng: 106.8, label: 'Jakarta' },
  { keywords: ['crypto', 'bitcoin', 'ethereum', 'btc', 'eth', 'blockchain', 'defi', 'coinbase', 'binance'], lat: 37.8, lng: -122.4, label: 'San Francisco' },
  { keywords: ['oil', 'crude', 'energy market', 'brent', 'wti', 'petroleum'], lat: 25.3, lng: 51.5, label: 'Doha' },
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

function classifyArticle(text: string): { type: CrisisSignal['type']; severity: CrisisSignal['severity'] } {
  const lower = text.toLowerCase();

  // Severity
  const criticalWords = ['war', 'attack', 'killed', 'dead', 'collapse', 'crash', 'crisis', 'emergency', 'explosion', 'strike', 'invasion', 'missile', 'nuclear', 'catastrophe', 'surge', 'plunge', 'plummets'];
  const warningWords = ['tension', 'threat', 'risk', 'sanction', 'protest', 'unrest', 'decline', 'concern', 'warning', 'volatile', 'drops', 'falls', 'slump', 'dispute'];
  const severity: CrisisSignal['severity'] = criticalWords.some(w => lower.includes(w)) ? 'critical'
    : warningWords.some(w => lower.includes(w)) ? 'warning'
    : 'info';

  // Type
  const marketWords = ['stock', 'market', 'economy', 'gdp', 'fed', 'rate', 'crypto', 'bitcoin', 'bank', 'inflation', 'trade', 'tariff', 'nasdaq', 'dow', 's&p', 'bond', 'yield', 'dollar', 'yen', 'euro', 'pound', 'peso', 'recession'];
  const envWords = ['climate', 'flood', 'wildfire', 'earthquake', 'tsunami', 'drought', 'pollution', 'emissions', 'carbon', 'ice', 'glacier', 'sea level', 'famine'];
  const weatherWords = ['hurricane', 'typhoon', 'cyclone', 'tornado', 'storm', 'heatwave', 'blizzard', 'snowstorm', 'thunder'];

  const type: CrisisSignal['type'] = envWords.some(w => lower.includes(w)) ? 'environmental'
    : weatherWords.some(w => lower.includes(w)) ? 'weather'
    : marketWords.some(w => lower.includes(w)) ? 'market'
    : 'environmental'; // default — geopolitical/conflict events are global environmental threats

  return { type, severity };
}

function newsToSignals(items: NewsItem[]): CrisisSignal[] {
  const signals: CrisisSignal[] = [];
  const usedCoords = new Set<string>();

  for (const item of items) {
    const text = `${item.title} ${item.description || ''}`;
    const loc = extractLocation(text);
    if (!loc) continue;

    // Slightly jitter if two articles map to identical coords, so pins don't stack
    let { lat, lng } = loc;
    const coordKey = `${lat.toFixed(1)},${lng.toFixed(1)}`;
    if (usedCoords.has(coordKey)) {
      lat += (Math.random() - 0.5) * 4;
      lng += (Math.random() - 0.5) * 4;
    }
    usedCoords.add(coordKey);

    const { type, severity } = classifyArticle(text);

    signals.push({
      id: `news-signal-${item.id}`,
      type,
      severity,
      lat,
      lng,
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
    setMarketData,
    appendPriceHistory,
    setNewsItems,
    setSignals,
    updateFearGreed,
    setAIAnalysis,
    setAILoading,
    selectedSignal
  } = useDashboardStore();

  const isInitialized = useRef(false);
  const lastAICallRef = useRef(0);
  const aiInFlightRef = useRef(false);
  const AI_COOLDOWN_MS = 5000;

  // --- CNN Fear & Greed ---
  const fetchFearGreed = async () => {
    try {
      const res = await axios.get(`${API_BASE}/feargreed`);
      const { score, rating } = res.data;
      const label = rating.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      updateFearGreed(score, label);
    } catch (e) {
      console.warn('Fear & Greed fetch failed');
    }
  };

  // --- Market: crypto and stocks independent ---
  const fetchMarket = async () => {
    let cryptoData: any = null;
    let stocksData: any = null;

    try {
      const res = await axios.get(`${API_BASE}/market/crypto`);
      cryptoData = res.data;
    } catch (e) {
      console.warn('Crypto API failed, using mock');
    }

    try {
      const res = await axios.get(`${API_BASE}/market/stocks`);
      stocksData = res.data;
    } catch (e) {
      console.warn('Stocks API failed, using mock');
    }

    const mock = mockMarketData;
    const newData = {
      btc: cryptoData?.bitcoin ? { price: cryptoData.bitcoin.usd, change24h: cryptoData.bitcoin.usd_24h_change } : mock.btc,
      eth: cryptoData?.ethereum ? { price: cryptoData.ethereum.usd, change24h: cryptoData.ethereum.usd_24h_change } : mock.eth,
      sol: cryptoData?.solana ? { price: cryptoData.solana.usd, change24h: cryptoData.solana.usd_24h_change } : mock.sol,
      spy: stocksData?.SPY?.['05. price'] ? { price: parseFloat(stocksData.SPY['05. price']), change24h: parseFloat(stocksData.SPY['10. change percent']) } : mock.spy,
      qqq: stocksData?.QQQ?.['05. price'] ? { price: parseFloat(stocksData.QQQ['05. price']), change24h: parseFloat(stocksData.QQQ['10. change percent']) } : mock.qqq,
      vix: stocksData?.['^VIX']?.['05. price'] ? { price: parseFloat(stocksData['^VIX']['05. price']), change24h: parseFloat(stocksData['^VIX']['10. change percent']) } : mock.vix,
      eurUsd: 1.08,
      gbpUsd: 1.26,
    };

    setMarketData(newData, cryptoData !== null);
    ['BTC', 'ETH', 'SOL', 'SPY', 'QQQ', 'VIX'].forEach(asset => {
      appendPriceHistory(asset, (newData as any)[asset.toLowerCase()].price);
    });
  };

  // --- News + signals from news ---
  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/news`);
      const items: NewsItem[] = res.data.articles.map((a: any, i: number) => ({
        id: `news-${i}`,
        title: a.title,
        description: a.description,
        source: a.source.name,
        publishedAt: a.publishedAt,
        url: a.url
      }));

      if (items.length > 0) {
        setNewsItems(items, true);
        const signals = newsToSignals(items);
        if (signals.length > 0) setSignals(signals, true);
      }
    } catch (e) {
      console.warn('News API failed');
    }
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
      const btcPrice = state.marketData?.btc?.price || 'Loading...';
      const btcChange = state.marketData?.btc?.change24h || 'N/A';
      const sentiment = state.fearGreedLabel || 'Analyzing...';
      const topNews = state.newsItems.slice(0, 3).map(n => n.title).join('; ') || 'Awaiting headlines...';

      let prompt = '';
      if (signal) {
        prompt = `You are a geopolitical intelligence analyst. Respond in plain text only — no markdown, no asterisks, no bullet points, no headers.

EVENT: ${signal.title}
DETAILS: ${signal.body}
LOCATION: (${signal.lat}, ${signal.lng})
MARKET CONTEXT: Bitcoin $${btcPrice}, Sentiment: ${sentiment}

Write 3-4 sentences of authoritative analysis. Explain how this event impacts regional economic stability and asset valuations. Be decisive and direct.`;
      } else {
        prompt = `You are a global market intelligence analyst. Respond in plain text only — no markdown, no asterisks, no bullet points, no headers.

BTC: $${btcPrice} (${btcChange}% 24h)
HEADLINES: ${topNews}

Write 4 authoritative sentences synthesizing current market conditions. Identify a non-obvious connection between these headlines and asset volatility. End with a specific actionable recommendation.`;
      }

      const res = await axios.post(`${API_BASE}/ai/analyze`, { prompt });
      if (res.data?.choices?.[0]?.message?.content) {
        setAIAnalysis(res.data.choices[0].message.content);
      } else {
        throw new Error('Incomplete response');
      }
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
      if ((window as any).giccFlyTo) {
        (window as any).giccFlyTo(selectedSignal.lat, selectedSignal.lng);
      }
    }
  }, [selectedSignal, runAIAnalysis]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      await Promise.all([fetchFearGreed(), fetchMarket(), fetchNews()]);
      runAIAnalysis();
    };
    init();

    const marketInterval = setInterval(() => { fetchMarket(); fetchFearGreed(); }, 60000);
    const newsInterval = setInterval(fetchNews, 300000);
    const aiInterval = setInterval(() => runAIAnalysis(), 300000);

    return () => {
      clearInterval(marketInterval);
      clearInterval(newsInterval);
      clearInterval(aiInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runAIAnalysis]);
};
