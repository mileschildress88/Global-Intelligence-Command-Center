import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const FearGreedMeter: React.FC = () => {
  const { fearGreedScore, fearGreedLabel } = useDashboardStore();
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayScore(prev => {
        if (prev < fearGreedScore) return Math.min(prev + 1, fearGreedScore);
        if (prev > fearGreedScore) return Math.max(prev - 1, fearGreedScore);
        return prev;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [fearGreedScore]);

  const getColor = () => {
    if (displayScore < 20) return '#E24B4A';
    if (displayScore < 40) return '#EF9F27';
    if (displayScore < 60) return '#F4C0D1';
    if (displayScore < 80) return '#5DCAA5';
    return '#378ADD';
  };

  return (
    <div className="bg-[#111320]/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <div className="flex items-center space-x-3">
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest shrink-0">Sentiment</span>
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${displayScore}%`, backgroundColor: getColor() }}
          />
        </div>
        <span className="text-[18px] font-black text-white leading-none shrink-0 tabular-nums">{displayScore}</span>
        <span className="text-[9px] font-black uppercase tracking-widest shrink-0" style={{ color: getColor() }}>
          {fearGreedLabel}
        </span>
      </div>
    </div>
  );
};

export default FearGreedMeter;
