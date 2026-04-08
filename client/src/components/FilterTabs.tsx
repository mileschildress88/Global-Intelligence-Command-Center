import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const FILTERS = [
  {
    id: 'all',
    label: 'All Signals',
    dot: 'bg-blue-400',
    active: 'text-blue-300 bg-blue-500/15 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
    inactive: 'text-white/40 border-transparent hover:text-white/70 hover:bg-white/5',
  },
  {
    id: 'environmental',
    label: 'Environmental',
    dot: 'bg-orange-400',
    active: 'text-orange-300 bg-orange-500/15 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.15)]',
    inactive: 'text-white/40 border-transparent hover:text-white/70 hover:bg-white/5',
  },
  {
    id: 'market',
    label: 'Market',
    dot: 'bg-sky-400',
    active: 'text-sky-300 bg-sky-500/15 border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.15)]',
    inactive: 'text-white/40 border-transparent hover:text-white/70 hover:bg-white/5',
  },
  {
    id: 'weather',
    label: 'Weather',
    dot: 'bg-pink-400',
    active: 'text-pink-300 bg-pink-500/15 border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.15)]',
    inactive: 'text-white/40 border-transparent hover:text-white/70 hover:bg-white/5',
  },
  {
    id: 'geopolitical',
    label: 'Geopolitical',
    dot: 'bg-purple-400',
    active: 'text-purple-300 bg-purple-500/15 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
    inactive: 'text-white/40 border-transparent hover:text-white/70 hover:bg-white/5',
  },
] as const;

const FilterTabs: React.FC = () => {
  const { activeFilter, setActiveFilter } = useDashboardStore();

  return (
    <div className="flex items-center space-x-1">
      {FILTERS.map(f => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as any)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${isActive ? f.active : f.inactive}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${f.dot} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
