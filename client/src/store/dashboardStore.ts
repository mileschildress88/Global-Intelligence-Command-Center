import { create } from 'zustand';
import type { CrisisSignal, MarketData, NewsItem } from '../types';
import { mockSignals, mockMarketData, mockNews } from '../utils/mockData';

interface DashboardStore {
  signals: CrisisSignal[];
  signalsIsLive: boolean;
  selectedSignal: CrisisSignal | null;
  fearGreedScore: number;
  fearGreedLabel: string;
  marketData: MarketData;
  marketIsLive: boolean;
  newsItems: NewsItem[];
  newsIsLive: boolean;
  activeFilter: 'all' | 'environmental' | 'market' | 'weather';
  aiAnalysis: string;
  aiLoading: boolean;
  lastAIUpdate: Date | null;
  priceHistory: Record<string, number[]>;
  setSignals: (signals: CrisisSignal[], isLive?: boolean) => void;
  setSelectedSignal: (signal: CrisisSignal | null) => void;
  setMarketData: (data: MarketData, isLive?: boolean) => void;
  setNewsItems: (items: NewsItem[], isLive?: boolean) => void;
  setActiveFilter: (filter: 'all' | 'environmental' | 'market' | 'weather') => void;
  setAIAnalysis: (text: string) => void;
  setAILoading: (loading: boolean) => void;
  appendPriceHistory: (asset: string, price: number) => void;
  updateFearGreed: (score: number, label: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  signals: mockSignals,
  signalsIsLive: false,
  selectedSignal: null,
  fearGreedScore: 50,
  fearGreedLabel: 'Neutral',
  marketData: mockMarketData,
  marketIsLive: false,
  newsItems: mockNews,
  newsIsLive: false,
  activeFilter: 'all',
  aiAnalysis: '',
  aiLoading: false,
  lastAIUpdate: null,
  priceHistory: {},
  setSignals: (signals, isLive = false) => set({ signals, signalsIsLive: isLive }),
  setSelectedSignal: (selectedSignal) => set({ selectedSignal }),
  setMarketData: (marketData, isLive = false) => set({ marketData, marketIsLive: isLive }),
  setNewsItems: (newsItems, isLive = false) => set({ newsItems, newsIsLive: isLive }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setAIAnalysis: (aiAnalysis) => set({ aiAnalysis, lastAIUpdate: new Date() }),
  setAILoading: (aiLoading) => set({ aiLoading }),
  appendPriceHistory: (asset, price) => set((state) => {
    const history = state.priceHistory[asset] || [];
    const newHistory = [...history, price].slice(-20);
    return { priceHistory: { ...state.priceHistory, [asset]: newHistory } };
  }),
  updateFearGreed: (score, label) => set({ fearGreedScore: score, fearGreedLabel: label })
}));
