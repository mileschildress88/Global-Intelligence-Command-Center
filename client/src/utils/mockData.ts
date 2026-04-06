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
  eurUsd: 1.0854,
  gbpUsd: 1.2645
};

export const mockNews: NewsItem[] = [
  {
    id: 'n1',
    title: 'Global Markets Brace for Inflation Data',
    description: 'Investors are cautious ahead of the upcoming CPI release...',
    source: 'Reuters',
    url: '#',
    publishedAt: new Date().toISOString()
  },
  {
    id: 'n2',
    title: 'Amazon Basin Sees Record Deforestation',
    description: 'New satellite data shows a concerning spike in land clearing...',
    source: 'GNews',
    url: '#',
    publishedAt: new Date().toISOString()
  }
];
