import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const AIAnalysisBar: React.FC = () => {
  const { aiAnalysis, aiLoading, selectedSignal } = useDashboardStore();
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    if (!aiAnalysis) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < aiAnalysis.length) {
        setDisplayedText(aiAnalysis.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [aiAnalysis]);

  return (
    <div className="bg-[#111320] border-t border-white/5 p-4 flex items-start space-x-4 min-h-[5rem] max-h-40">
      <div className="flex-shrink-0 flex flex-col items-center justify-center pt-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-blue-500/20">
          AI
        </div>
        <span className="text-[9px] text-gray-500 mt-1 uppercase font-bold">Analysis</span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="flex items-center space-x-2 mb-1 shrink-0">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">
            {selectedSignal ? `Analyzing Signal: ${selectedSignal.title}` : 'Global Market Sentiment Analysis'}
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

      <div className="flex-shrink-0 flex items-center space-x-3">
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
