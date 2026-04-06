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
    <div className={`absolute top-[40%] left-[60%] z-[100] w-80 bg-[#111320]/90 backdrop-blur-xl border border-white/10 border-l-4 ${getBorderColor()} rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full border uppercase ${getSeverityColor()}`}>
            {selectedSignal.severity}
          </span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full">
            {selectedSignal.type}
          </span>
        </div>
        <button 
          onClick={() => setSelectedSignal(null)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <span className="text-lg leading-none">&times;</span>
        </button>
      </div>
      
      <h3 className="text-white font-black text-lg mb-2 leading-tight tracking-tight italic uppercase">{selectedSignal.title}</h3>
      <div className="h-px w-12 bg-blue-500 mb-3" />
      <p className="text-gray-300 text-xs mb-5 leading-relaxed font-medium">{selectedSignal.body}</p>
      
      <div className="flex flex-wrap gap-1.5 mb-5">
        {selectedSignal.relatedAssets?.map(asset => (
          <span key={asset} className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 uppercase tracking-tighter shadow-inner">
            {asset}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{selectedSignal.source}</span>
          <span className="text-[9px] font-medium text-gray-600 mt-0.5 uppercase tracking-tighter font-mono">
            {new Date(selectedSignal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <button 
          onClick={() => {
            if ((window as any).runGICCAI) {
              (window as any).runGICCAI(selectedSignal);
            }
          }}
          className="text-[10px] font-black bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all cursor-pointer uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95"
        >
          Analyze AI →
        </button>
      </div>
    </div>
  );
};

export default CrisisPopup;
