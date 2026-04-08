import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const RowLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center space-x-2 mb-1.5">
    <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">{children}</span>
    <div className="flex-1 h-px bg-white/[0.05]" />
  </div>
);

const AssetCard: React.FC<{
  label: string;
  data: { price: number; change24h: number };
  prefix?: string;
  suffix?: string;
  decimals?: number;
}> = ({ label, data, prefix = '$', suffix = '', decimals }) => {
  const isPos = data.change24h >= 0;
  const maxDec = decimals ?? (label === 'VIX' ? 2 : label === 'BTC' ? 0 : label === 'ETH' ? 0 : 2);
  return (
    <div className="bg-white/[0.03] hover:bg-white/[0.055] border border-white/[0.06] rounded-lg px-2.5 py-2 transition-all duration-200 group">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] font-black text-white/40 tracking-wider">{label}</span>
        <span className={`text-[8px] font-black ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPos ? '▲' : '▼'}{Math.abs(data.change24h).toFixed(2)}%
        </span>
      </div>
      <div className="text-[11px] font-black text-white/90 tracking-tight tabular-nums">
        {prefix}{data.price.toLocaleString(undefined, { minimumFractionDigits: maxDec, maximumFractionDigits: maxDec })}{suffix}
      </div>
    </div>
  );
};

const ForexCard: React.FC<{ label: string; rate: number; change24h: number; decimals: number }> = ({ label, rate, change24h, decimals }) => {
  const isPos = change24h >= 0;
  return (
    <div className="bg-white/[0.03] hover:bg-white/[0.055] border border-white/[0.06] rounded-lg px-2.5 py-2 transition-all duration-200">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[8px] font-black text-white/35 tracking-tight">{label}</span>
        <span className={`text-[7px] font-black ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPos ? '▲' : '▼'}{Math.abs(change24h).toFixed(2)}%
        </span>
      </div>
      <div className="text-[11px] font-black text-white/90 tabular-nums tracking-tight">
        {rate.toFixed(decimals)}
      </div>
    </div>
  );
};

const AssetTicker: React.FC = () => {
  const { marketData, marketIsLive } = useDashboardStore();
  const fx = marketData.forex;

  const forexPairs = fx ? [
    { label: 'EUR/USD', rate: fx.eurUsd.rate, change24h: fx.eurUsd.change24h, decimals: 4 },
    { label: 'GBP/USD', rate: fx.gbpUsd.rate, change24h: fx.gbpUsd.change24h, decimals: 4 },
    { label: 'USD/JPY', rate: fx.usdJpy.rate, change24h: fx.usdJpy.change24h, decimals: 2 },
    { label: 'USD/CHF', rate: fx.usdChf.rate, change24h: fx.usdChf.change24h, decimals: 4 },
    { label: 'AUD/USD', rate: fx.audUsd.rate, change24h: fx.audUsd.change24h, decimals: 4 },
    { label: 'USD/CAD', rate: fx.usdCad.rate, change24h: fx.usdCad.change24h, decimals: 4 },
  ] : [];

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-3.5">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[8px] font-black text-white/25 uppercase tracking-[0.18em]">Asset Intelligence</span>
        {marketIsLive ? (
          <span className="text-[7px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 animate-pulse">LIVE</span>
        ) : (
          <span className="text-[7px] font-black text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">MOCK</span>
        )}
      </div>

      <RowLabel>Crypto</RowLabel>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <AssetCard label="BTC" data={marketData.btc} decimals={0} />
        <AssetCard label="ETH" data={marketData.eth} decimals={0} />
        <AssetCard label="SOL" data={marketData.sol} decimals={2} />
      </div>

      <RowLabel>Indices</RowLabel>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <AssetCard label="SPY" data={marketData.spy} decimals={2} />
        <AssetCard label="QQQ" data={marketData.qqq} decimals={2} />
        <AssetCard label="VIX" data={marketData.vix} prefix="" decimals={2} />
      </div>

      <RowLabel>Commodities</RowLabel>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <AssetCard label="GOLD" data={marketData.gold} suffix="/oz" decimals={0} />
        <AssetCard label="WTI"  data={marketData.oil}  suffix="/bbl" decimals={2} />
      </div>

      {forexPairs.length > 0 && (
        <>
          <RowLabel>Forex</RowLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {forexPairs.map(p => <ForexCard key={p.label} {...p} />)}
          </div>
        </>
      )}
    </div>
  );
};

export default AssetTicker;
