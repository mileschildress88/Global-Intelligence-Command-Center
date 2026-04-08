import type { CrisisSignal, MarketData, NewsItem } from '../types';

export const mockSignals: CrisisSignal[] = [
  {
    id: '1',
    type: 'environmental',
    severity: 'critical',
    lat: 34.0522,
    lng: -118.2437,
    title: 'Wildfire Outbreak',
    body: 'Major wildfire detected near Los Angeles. Air quality deteriorating rapidly.',
    source: 'OpenAQ',
    timestamp: new Date(),
    relatedAssets: ['OIL', 'SPY']
  },
  {
    id: '2',
    type: 'market',
    severity: 'warning',
    lat: 51.5074,
    lng: -0.1278,
    title: 'Flash Crash: GBP',
    body: 'Sudden 1.2% drop in GBP/USD following unexpected central bank remarks.',
    source: 'ExchangeRate.host',
    timestamp: new Date(),
    relatedAssets: ['GBP', 'FTSE']
  },
  {
    id: '3',
    type: 'weather',
    severity: 'critical',
    lat: 28.6139,
    lng: 77.2090,
    title: 'Extreme Heatwave',
    body: 'Temperatures in New Delhi exceeding 48°C. Power grid under severe strain.',
    source: 'Open-Meteo',
    timestamp: new Date()
  },
  {
    id: '4',
    type: 'environmental',
    severity: 'info',
    lat: -23.5505,
    lng: -46.6333,
    title: 'Air Quality Alert',
    body: 'PM2.5 levels rising in São Paulo due to industrial emissions.',
    source: 'OpenAQ',
    timestamp: new Date()
  },
  {
    id: '5',
    type: 'market',
    severity: 'critical',
    lat: 40.7128,
    lng: -74.0060,
    title: 'Tech Sell-off',
    body: 'Nasdaq futures drop 2.5% as major tech earnings disappoint.',
    source: 'Alpha Vantage',
    timestamp: new Date(),
    relatedAssets: ['QQQ', 'BTC']
  }
];

export const mockMarketData: MarketData = {
  btc: { price: 65230.5, change24h: 2.45 },
  eth: { price: 3450.12, change24h: -1.2 },
  sol: { price: 145.67, change24h: 5.8 },
  spy: { price: 512.34, change24h: 0.15 },
  qqq: { price: 435.67, change24h: -0.85 },
  vix: { price: 14.5, change24h: 3.2 },
  gold: { price: 3180.0, change24h: 0.52 },
  oil: { price: 110.34, change24h: -2.31 },
  forex: {
    eurUsd: { rate: 1.0854, change24h: 0.12 },
    gbpUsd: { rate: 1.2645, change24h: -0.08 },
    usdJpy: { rate: 151.42, change24h: 0.31 },
    usdChf: { rate: 0.9012, change24h: -0.15 },
    audUsd: { rate: 0.6521, change24h: 0.22 },
    usdCad: { rate: 1.3614, change24h: 0.09 },
  }
};

export const mockNews: NewsItem[] = [
  {
    id: 'n1',
    title: 'OPEC+ Signals Potential Output Cuts',
    description: 'Member nations are discussing a production decrease to stabilize energy prices amidst global economic uncertainty.',
    source: 'Financial Times',
    url: '#',
    publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'n2',
    title: 'Arctic Ice Melt Reaches Historic Levels',
    description: 'New satellite data shows record low ice coverage, potentially disrupting North Atlantic shipping lanes.',
    source: 'National Geographic',
    url: '#',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'n3',
    title: 'Major Solar Flare Could Impact Satellite Comms',
    description: 'NOAA warns of a G4-class geomagnetic storm that may interfere with GPS and telecommunications infrastructure.',
    source: 'Space.com',
    url: '#',
    publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    id: 'n4',
    title: 'Federal Reserve Hints at Extended High Rates',
    description: 'The FOMC minutes suggest a more cautious approach to rate cuts than previously anticipated by the market.',
    source: 'Bloomberg',
    url: '#',
    publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  },
  {
    id: 'n5',
    title: 'South China Sea Tensions Escalate',
    description: 'Naval maneuvers in contested waters trigger concerns over regional trade security and maritime insurance premiums.',
    source: 'Reuters',
    url: '#',
    publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString()
  }
];
