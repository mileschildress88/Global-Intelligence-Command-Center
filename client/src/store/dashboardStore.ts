import { create } from 'zustand';
import type { CrisisSignal, MarketData, NewsItem } from '../types';
import { mockSignals, mockMarketData, mockNews } from '../utils/mockData';

interface DashboardStore {
  signals: CrisisSignal[];
  signalsIsLive: boolean;
  selectedSignal: CrisisSignal | null;
  selectedCluster: CrisisSignal[] | null;
  fearGreedScore: number;
  fearGreedLabel: string;
  fearGreedPrevClose: number;
  fearGreedPrevWeek: number;
  fearGreedPrevMonth: number;
  marketData: MarketData;
  marketIsLive: boolean;
  newsItems: NewsItem[];
  newsIsLive: boolean;
  activeFilter: 'all' | 'environmental' | 'market' | 'weather' | 'geopolitical';
  aiAnalysis: string;
  aiLoading: boolean;
  lastAIUpdate: Date | null;
  priceHistory: Record<string, number[]>;
  setSignals: (signals: CrisisSignal[], isLive?: boolean) => void;
  setSelectedSignal: (signal: CrisisSignal | null) => void;
  setSelectedCluster: (signals: CrisisSignal[] | null) => void;
  setMarketData: (data: MarketData, isLive?: boolean) => void;
  setNewsItems: (items: NewsItem[], isLive?: boolean) => void;
  setActiveFilter: (filter: 'all' | 'environmental' | 'market' | 'weather' | 'geopolitical') => void;
  setAIAnalysis: (text: string) => void;
  setAILoading: (loading: boolean) => void;
  appendPriceHistory: (asset: string, price: number) => void;
  updateFearGreed: (score: number, label: string, prevClose?: number, prevWeek?: number, prevMonth?: number) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  signals: mockSignals,
  signalsIsLive: false,
  selectedSignal: null,
  selectedCluster: null,
  fearGreedScore: 50,
  fearGreedLabel: 'Neutral',
  fearGreedPrevClose: 0,
  fearGreedPrevWeek: 0,
  fearGreedPrevMonth: 0,
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
  // Clearing cluster when signal selected and vice versa keeps state clean
  setSelectedSignal: (selectedSignal) => set({ selectedSignal, selectedCluster: null }),
  setSelectedCluster: (selectedCluster) => set({ selectedCluster, selectedSignal: null }),
  setMarketData: (marketData, isLive = false) => set({ marketData, marketIsLive: isLive }),
  setNewsItems: (newsItems, isLive = false) => set({ newsItems, newsIsLive: isLive }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setAIAnalysis: (aiAnalysis) => set({ aiAnalysis, lastAIUpdate: new Date() }),
  setAILoading: (aiLoading) => set({ aiLoading }),
  appendPriceHistory: (asset, price) => set((state) => {
    const history = state.priceHistory[asset] || [];
    return { priceHistory: { ...state.priceHistory, [asset]: [...history, price].slice(-20) } };
  }),
  updateFearGreed: (score, label, prevClose = 0, prevWeek = 0, prevMonth = 0) =>
    set({ fearGreedScore: score, fearGreedLabel: label, fearGreedPrevClose: prevClose, fearGreedPrevWeek: prevWeek, fearGreedPrevMonth: prevMonth }),
}));
