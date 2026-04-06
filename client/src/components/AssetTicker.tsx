import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const AssetTicker: React.FC = () => {
  const { marketData, marketIsLive } = useDashboardStore();

  const assets = [
    { label: 'BTC', data: marketData.btc },
    { label: 'ETH', data: marketData.eth },
    { label: 'SOL', data: marketData.sol },
    { label: 'SPY', data: marketData.spy },
    { label: 'QQQ', data: marketData.qqq },
    { label: 'VIX', data: marketData.vix },
  ];

  return (
    <div className="bg-[#111320]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Asset Intelligence</h3>
        {marketIsLive ? (
          <span className="text-[9px] font-black text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 animate-pulse">LIVE</span>
        ) : (
          <span className="text-[9px] font-black text-yellow-500 uppercase bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">MOCK</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {assets.map((asset) => {
          const isPositive = asset.data.change24h >= 0;
          return (
            <div key={asset.label} className="bg-white/5 rounded-lg px-2.5 py-2 border border-white/5">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-black text-gray-400">{asset.label}</span>
                <span className={`text-[8px] font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '▲' : '▼'}{Math.abs(asset.data.change24h).toFixed(1)}%
                </span>
              </div>
              <div className="text-[11px] font-black text-white tracking-tight">
                ${asset.data.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetTicker;
