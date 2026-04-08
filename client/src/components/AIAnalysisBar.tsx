import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const AIAnalysisBar: React.FC = () => {
  const { aiAnalysis, aiLoading, selectedSignal } = useDashboardStore();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(false);
    if (!aiAnalysis) return;

    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < aiAnalysis.length) {
        setDisplayedText(aiAnalysis.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 18);

    return () => {
      clearInterval(interval);
      setIsTyping(false);
    };
  }, [aiAnalysis]);

  const isActive = aiLoading || isTyping;

  return (
    <div className="bg-[#111320] border-t border-white/5 p-4 flex items-start space-x-4 min-h-[5rem] max-h-40">
      {/* Bob */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center pt-0.5">
        <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 shadow-lg shadow-blue-500/10 bg-[#0d0f1c]">
          <img
            src={isActive ? '/textures/robot-idle.gif' : '/textures/robot-idle still.jpg'}
            alt="Bob"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-[9px] text-gray-500 mt-1 uppercase font-black tracking-widest">Bob</span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="flex items-center space-x-2 mb-1 shrink-0">
          <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">
            {selectedSignal ? `Analyzing: ${selectedSignal.title.slice(0, 40)}…` : 'Global Intelligence Analysis'}
          </span>
        </div>
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="text-[13px] text-gray-300 font-medium leading-relaxed">
            {aiLoading ? (
              <div className="flex space-x-1 mt-1">
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            ) : (
              displayedText || 'Awaiting signal input...'
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center">
        <button
          onClick={() => { if ((window as any).runGICCAI) (window as any).runGICCAI(selectedSignal ?? undefined); }}
          className="bg-white/5 hover:bg-white/10 text-gray-400 p-2 rounded-lg transition-colors"
          title="Re-run analysis"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIAnalysisBar;
