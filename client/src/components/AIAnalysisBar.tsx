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
    }, 16);

    return () => { clearInterval(interval); setIsTyping(false); };
  }, [aiAnalysis]);

  const isActive = aiLoading || isTyping;

  return (
    <div className="relative bg-[#0C0E1A] min-h-[5.5rem] max-h-44 flex items-start">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="flex items-start space-x-4 w-full p-4">
        {/* Bob avatar */}
        <div className="flex-shrink-0 flex flex-col items-center pt-0.5">
          <div className={`w-14 h-14 rounded-xl overflow-hidden border transition-all duration-500 ${
            isActive
              ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.35)]'
              : 'border-white/10 shadow-none'
          }`}>
            <img
              src={isActive ? '/textures/robot-idle.gif' : '/textures/robot-idle still.jpg'}
              alt="Bob"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[7px] text-white/25 mt-1 uppercase font-black tracking-[0.2em]">Bob</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Label row */}
          <div className="flex items-center space-x-2 mb-1.5 shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isActive ? 'bg-blue-400 animate-pulse' : 'bg-white/20'}`} />
            <span className="text-[8px] text-white/35 font-black uppercase tracking-[0.18em] truncate">
              {selectedSignal ? `Analyzing: ${selectedSignal.title.slice(0, 45)}…` : 'Global Intelligence Briefing'}
            </span>
            {isActive && (
              <span className="text-[7px] text-blue-400/70 font-mono uppercase tracking-widest animate-pulse ml-auto shrink-0">
                {aiLoading ? 'Querying...' : 'Streaming...'}
              </span>
            )}
          </div>

          {/* Analysis text */}
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <div className="text-[12px] text-white/65 font-medium leading-relaxed tracking-tight">
              {aiLoading ? (
                <div className="flex items-center space-x-1.5 mt-1">
                  <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <span>
                  {displayedText || <span className="text-white/25 italic">Awaiting signal input — select a pin or click Analyze...</span>}
                  {isTyping && <span className="inline-block w-0.5 h-3 bg-blue-400 ml-0.5 animate-pulse align-middle" />}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Re-run button */}
        <div className="flex-shrink-0 flex items-center pt-1">
          <button
            onClick={() => { if ((window as any).runGICCAI) (window as any).runGICCAI(selectedSignal ?? undefined); }}
            className="bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] hover:border-white/20 text-white/50 hover:text-white/80 p-2 rounded-lg transition-all duration-200 cursor-pointer"
            title="Re-run analysis"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisBar;
