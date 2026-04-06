import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useDashboardStore } from '../store/dashboardStore';

const AssetTicker: React.FC = () => {
  const { marketData, priceHistory } = useDashboardStore();

  const assets = [
    { label: 'BTC', data: marketData.btc },
    { label: 'ETH', data: marketData.eth },
    { label: 'SOL', data: marketData.sol },
    { label: 'SPY', data: marketData.spy },
    { label: 'QQQ', data: marketData.qqq },
    { label: 'VIX', data: marketData.vix },
  ];

  return (
    <div className="bg-[#111320] border border-white/5 rounded-xl p-4 overflow-hidden">
      <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-4 font-bold">Market Assets</h3>
      <div className="grid grid-cols-2 gap-3">
        {assets.map((asset) => {
          const isPositive = asset.data.change24h >= 0;
          const color = isPositive ? '#5DCAA5' : '#E24B4A';
          const history = (priceHistory[asset.label] || []).map((p, i) => ({ value: p, index: i }));

          return (
            <div key={asset.label} className="bg-white/5 rounded-lg p-2 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gray-300">{asset.label}</span>
                <span className={`text-[10px] font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{asset.data.change24h}%
                </span>
              </div>
              <div className="text-sm font-black text-white mb-2">
                ${asset.data.price.toLocaleString()}
              </div>
              <div className="h-6 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history.length > 0 ? history : [{ value: 10, index: 0 }, { value: 20, index: 1 }]}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetTicker;
