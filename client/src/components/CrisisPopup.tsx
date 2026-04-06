import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const CrisisPopup: React.FC = () => {
  const { selectedSignal, setSelectedSignal } = useDashboardStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (selectedSignal) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [selectedSignal]);

  if (!selectedSignal || !isVisible) return null;

  const getBorderColor = () => {
    switch (selectedSignal.type) {
      case 'environmental': return selectedSignal.severity === 'critical' ? 'border-red-500' : 'border-orange-500';
      case 'weather': return 'border-pink-300';
      case 'market': return 'border-blue-500';
      default: return 'border-teal-500';
    }
  };

  const getSeverityColor = () => {
    switch (selectedSignal.severity) {
      case 'critical': return 'bg-red-900/40 text-red-400 border-red-500/50';
      case 'warning': return 'bg-orange-900/40 text-orange-400 border-orange-500/50';
      case 'info': return 'bg-teal-900/40 text-teal-400 border-teal-500/50';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 bg-[#111320] border-l-4 ${getBorderColor()} rounded-r-lg shadow-2xl p-4 animate-in fade-in zoom-in duration-200 transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityColor()}`}>
          {selectedSignal.severity}
        </span>
        <button 
          onClick={() => setSelectedSignal(null)}
          className="text-gray-500 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
      
      <h3 className="text-white font-bold text-sm mb-1">{selectedSignal.title}</h3>
      <p className="text-gray-400 text-xs mb-3 leading-relaxed">{selectedSignal.body}</p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {selectedSignal.relatedAssets?.map(asset => (
          <span key={asset} className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/10 uppercase">
            {asset}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center text-[10px] text-gray-500">
        <span>{selectedSignal.source} • {new Date(selectedSignal.timestamp).toLocaleTimeString()}</span>
        <button className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
          Analyze with AI →
        </button>
      </div>
    </div>
  );
};

export default CrisisPopup;
