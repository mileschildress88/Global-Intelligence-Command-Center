import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useDashboardStore } from '../store/dashboardStore';
import { mockMarketData } from '../utils/mockData';

const API_BASE = 'http://localhost:3001/api';

export const usePolling = () => {
  const { 
    setMarketData, 
    appendPriceHistory, 
    setSignals, 
    setNewsItems, 
    updateFearGreed,
    setAIAnalysis,
    setAILoading,
    signals,
    marketData,
    newsItems
  } = useDashboardStore();

  const fetchMarket = async () => {
    try {
      const crypto = await axios.get(`${API_BASE}/market/crypto`);
      const stocks = await axios.get(`${API_BASE}/market/stocks`);
      
      const newData = {
        btc: { price: crypto.data.bitcoin.usd, change24h: crypto.data.bitcoin.usd_24h_change },
        eth: { price: crypto.data.ethereum.usd, change24h: crypto.data.ethereum.usd_24h_change },
        sol: { price: crypto.data.solana.usd, change24h: crypto.data.solana.usd_24h_change },
        spy: { price: parseFloat(stocks.data.SPY['05. price']), change24h: parseFloat(stocks.data.SPY['10. change percent']) },
        qqq: { price: parseFloat(stocks.data.QQQ['05. price']), change24h: parseFloat(stocks.data.QQQ['10. change percent']) },
        vix: { price: parseFloat(stocks.data['^VIX']['05. price']), change24h: parseFloat(stocks.data['^VIX']['10. change percent']) },
        eurUsd: 1.08, // Fallback for FX
        gbpUsd: 1.26
      };

      setMarketData(newData);
      ['btc', 'eth', 'sol', 'spy', 'qqq', 'vix'].forEach(asset => {
        appendPriceHistory(asset.toUpperCase(), (newData as any)[asset].price);
      });
      calculateFearGreed(newData);
    } catch (e) {
      console.warn('Market API failed, using mock data');
      setMarketData(mockMarketData);
    }
  };

  const calculateFearGreed = (data: any) => {
    const vix = data.vix.price;
    const btcChange = data.btc.change24h;
    const spyChange = data.spy.change24h;
    
    // Simplified Fear/Greed math
    const score = Math.round(
      ((btcChange + 5) / 10 * 30) + 
      (Math.max(0, 50 - vix)) + 
      ((spyChange + 2) / 4 * 20) + 20
    );
    
    const label = score < 30 ? 'Extreme Fear' : score < 45 ? 'Fear' : score < 55 ? 'Neutral' : score < 75 ? 'Greed' : 'Extreme Greed';
    updateFearGreed(Math.min(100, Math.max(0, score)), label);
  };

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/news`);
      const items = res.data.articles.map((a: any, i: number) => ({
        id: `news-${i}`,
        title: a.title,
        description: a.description,
        source: a.source.name,
        publishedAt: a.publishedAt,
        url: a.url
      }));
      setNewsItems(items);
    } catch (e) {
      console.warn('News API failed');
    }
  };

  const runAIAnalysis = async () => {
    setAILoading(true);
    try {
      const prompt = `Identify the single most important non-obvious connection between an environmental signal and a market signal based on current global data. In 4 sentences. Confident analyst tone.`;
      const res = await axios.post(`${API_BASE}/ai/analyze`, { prompt });
      const text = res.data.candidates[0].content.parts[0].text;
      setAIAnalysis(text);
    } catch (e) {
      setAIAnalysis("Market volatility remains correlated with regional climate anomalies. Predictive modeling suggests increased exposure in energy-dependent sectors. Strategic diversification into resilient infrastructure is advised to mitigate cascading risks from extreme weather events.");
    } finally {
      setAILoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
    fetchNews();
    runAIAnalysis();

    const marketInterval = setInterval(fetchMarket, 60000);
    const newsInterval = setInterval(fetchNews, 300000);
    const aiInterval = setInterval(runAIAnalysis, 300000);

    return () => {
      clearInterval(marketInterval);
      clearInterval(newsInterval);
      clearInterval(aiInterval);
    };
  }, []);
};
