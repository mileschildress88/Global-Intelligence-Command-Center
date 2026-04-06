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

  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * Math.PI;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const getColor = () => {
    if (displayScore < 20) return '#E24B4A'; // Extreme Fear
    if (displayScore < 40) return '#EF9F27'; // Fear
    if (displayScore < 60) return '#F4C0D1'; // Neutral
    if (displayScore < 80) return '#5DCAA5'; // Greed
    return '#378ADD'; // Extreme Greed
  };

  return (
    <div className="bg-[#111320] border border-white/5 rounded-xl p-4 flex flex-col items-center">
      <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-4 font-bold">Fear & Greed Index</h3>
      
      <div className="relative w-40 h-24 overflow-hidden">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-180 -translate-y-1/2">
          {/* Background Arc */}
          <circle
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset: 0 }}
          />
          {/* Progress Arc */}
          <circle
            stroke={getColor()}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        
        {/* Score Display */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <span className="text-3xl font-black text-white leading-none">{displayScore}</span>
          <span className="text-[10px] font-bold uppercase mt-1" style={{ color: getColor() }}>
            {fearGreedLabel}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-[9px] mt-2">Updated 60s ago</p>
    </div>
  );
};

export default FearGreedMeter;
