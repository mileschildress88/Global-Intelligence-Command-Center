export type CrisisSignal = {
  id: string;
  type: 'environmental' | 'market' | 'weather' | 'geopolitical';
  severity: 'critical' | 'warning' | 'info';
  lat: number;
  lng: number;
  title: string;
  body: string;
  source: string;
  timestamp: Date;
  relatedAssets?: string[];
};

export type AssetData = {
  price: number;
  change24h: number;
};

export type ForexPair = {
  rate: number;
  change24h: number;
};

export type ForexData = {
  eurUsd: ForexPair;
  gbpUsd: ForexPair;
  usdJpy: ForexPair;
  usdChf: ForexPair;
  audUsd: ForexPair;
  usdCad: ForexPair;
};

export type MarketData = {
  btc: AssetData;
  eth: AssetData;
  sol: AssetData;
  spy: AssetData;
  qqq: AssetData;
  vix: AssetData;
  gold: AssetData;
  oil: AssetData;
  forex: ForexData;
};

export type NewsItem = {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  image?: string;
  publishedAt: string;
  category?: string;
};
