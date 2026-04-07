import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const ZONES = [
  { max: 25,  label: 'Extreme Fear', color: '#EF4444' },
  { max: 45,  label: 'Fear',         color: '#F97316' },
  { max: 55,  label: 'Neutral',      color: '#EAB308' },
  { max: 75,  label: 'Greed',        color: '#22C55E' },
  { max: 100, label: 'Extreme Greed',color: '#3B82F6' },
];

function getZone(score: number) {
  return ZONES.find(z => score <= z.max) ?? ZONES[ZONES.length - 1];
}

function trendArrow(current: number, prev: number) {
  if (prev === 0) return { arrow: '—', color: 'text-gray-500' };
  return current > prev
    ? { arrow: '▲', color: 'text-green-400' }
    : current < prev
    ? { arrow: '▼', color: 'text-red-400' }
    : { arrow: '—', color: 'text-gray-500' };
}

const FearGreedMeter: React.FC = () => {
  const { fearGreedScore, fearGreedLabel, fearGreedPrevClose, fearGreedPrevWeek, fearGreedPrevMonth } = useDashboardStore();
  const [displayScore, setDisplayScore] = useState(fearGreedScore);

  useEffect(() => {
    const id = setInterval(() => {
      setDisplayScore(prev => {
        if (prev < fearGreedScore) return Math.min(prev + 1, fearGreedScore);
        if (prev > fearGreedScore) return Math.max(prev - 1, fearGreedScore);
        return prev;
      });
    }, 16);
    return () => clearInterval(id);
  }, [fearGreedScore]);

  const zone = getZone(displayScore);
  const prevCloseArrow  = trendArrow(fearGreedScore, fearGreedPrevClose);
  const prevWeekArrow   = trendArrow(fearGreedScore, fearGreedPrevWeek);
  const prevMonthArrow  = trendArrow(fearGreedScore, fearGreedPrevMonth);

  return (
    <div className="bg-[#111320]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fear & Greed Index</span>
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded border border-white/5">CNN</span>
      </div>

      {/* Score + label */}
      <div className="flex items-center space-x-4 mb-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: `radial-gradient(circle, ${zone.color}22 0%, ${zone.color}11 100%)`, border: `2px solid ${zone.color}55` }}
        >
          <span className="text-[22px] font-black tabular-nums" style={{ color: zone.color }}>
            {displayScore}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-black uppercase tracking-tight mb-1.5" style={{ color: zone.color }}>
            {fearGreedLabel}
          </div>
          {/* Gradient bar */}
          <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6)' }}>
            <div
              className="absolute top-0 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] -translate-x-1/2 transition-all duration-500"
              style={{ left: `${displayScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[7px] font-bold text-red-400 uppercase">Fear</span>
            <span className="text-[7px] font-bold text-gray-500 uppercase">Neutral</span>
            <span className="text-[7px] font-bold text-blue-400 uppercase">Greed</span>
          </div>
        </div>
      </div>

      {/* Previous period comparisons */}
      <div className="grid grid-cols-3 gap-1.5 border-t border-white/5 pt-3">
        {[
          { label: 'PREV CLOSE', score: fearGreedPrevClose, trend: prevCloseArrow },
          { label: 'PREV WEEK',  score: fearGreedPrevWeek,  trend: prevWeekArrow  },
          { label: 'PREV MONTH', score: fearGreedPrevMonth, trend: prevMonthArrow },
        ].map(({ label, score, trend }) => (
          <div key={label} className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
            <div className="text-[7px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">{label}</div>
            <div className="flex items-center justify-center space-x-0.5">
              <span className={`text-[8px] font-black ${trend.color}`}>{trend.arrow}</span>
              <span className="text-[12px] font-black text-gray-300 tabular-nums">{Math.round(score)}</span>
            </div>
            <div className="text-[7px] font-medium mt-0.5" style={{ color: getZone(score).color }}>
              {getZone(score).label.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FearGreedMeter;
