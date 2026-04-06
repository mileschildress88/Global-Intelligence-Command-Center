import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const FilterTabs: React.FC = () => {
  const { activeFilter, setActiveFilter } = useDashboardStore();

  const tabs = [
    { id: 'all', label: 'ALL' },
    { id: 'environmental', label: 'ENV' },
    { id: 'market', label: 'MKT' },
    { id: 'weather', label: 'WXR' }
  ];

  return (
    <div className="flex bg-white/5 border border-white/5 p-1 rounded-lg backdrop-blur-md">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveFilter(tab.id as any)}
          className={`px-4 py-1 rounded text-[10px] font-black transition-all ${
            activeFilter === tab.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
