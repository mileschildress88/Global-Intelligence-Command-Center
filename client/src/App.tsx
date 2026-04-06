import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import Globe3D from './components/Globe3D';
import FearGreedMeter from './components/FearGreedMeter';
import AssetTicker from './components/AssetTicker';
import NewsFeed from './components/NewsFeed';
import AIAnalysisBar from './components/AIAnalysisBar';
import FilterTabs from './components/FilterTabs';
import { usePolling } from './hooks/usePolling';
import { useDashboardStore } from './store/dashboardStore';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error) { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('GICC ERROR:', error, errorInfo); }
  render() {
    if (this.state.hasError) return <div className="h-screen bg-red-950 text-white p-8">GICC CRASHED. CHECK CONSOLE.</div>;
    return this.props.children;
  }
}

const severityColor: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  warning: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  info: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
};

const GICCContent: React.FC = () => {
  console.log('GICCContent is rendering...');
  usePolling();
  const { signals, signalsIsLive, setSelectedSignal } = useDashboardStore();
  const [sidebarTab, setSidebarTab] = useState<'news' | 'signals'>('news');
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0C14] text-[#EEEEF0] overflow-hidden font-sans selection:bg-blue-500/30 relative">
      {/* Background Effects - Lower z-index */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(rgba(18,16,16,0)_0,rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%,rgba(0,0,0,0.25)_100%)] bg-[length:100%_4px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(10,12,20,0.8)_100%)] shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
      </div>

      {/* Topbar - High z-index */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-[#0A0C14]/95 backdrop-blur-xl z-50 shadow-2xl">
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping opacity-75" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic drop-shadow-lg">GICC</span>
          </div>
          <div className="h-5 w-px bg-white/15" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Global Intelligence</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1 leading-none">Command Center v1.0.4</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 opacity-60">Intelligence Filters</span>
          <FilterTabs />
        </div>

        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest leading-none tabular-nums font-mono">{timestamp}</span>
            <div className="flex items-center space-x-1 mt-1">
              <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-bold text-blue-400/80 uppercase tracking-widest animate-pulse">Data Sync Active</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] font-black text-white tracking-widest uppercase">{signals.length} ACTIVE SIGNALS</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        {/* Left: 3D Globe */}
        <div className="flex-1 relative bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.15)_0%,rgba(10,12,20,1)_100%)] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none" />
          <Globe3D />
        </div>

        {/* Right Sidebar */}
        <aside className="w-[400px] h-full border-l border-white/10 bg-[#111320]/95 backdrop-blur-2xl flex flex-col overflow-hidden shadow-2xl z-50">
          {/* Fixed top panels */}
          <div className="shrink-0 p-5 pb-0 space-y-4">
            <FearGreedMeter />
            <AssetTicker />
          </div>
          {/* Tab switcher */}
          <div className="shrink-0 px-5 pt-3 flex space-x-1">
            <button
              onClick={() => setSidebarTab('news')}
              className={`flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-all ${sidebarTab === 'news' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Intel Feed
            </button>
            <button
              onClick={() => setSidebarTab('signals')}
              className={`flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-all ${sidebarTab === 'signals' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Signals ({signals.length})
            </button>
          </div>

          {/* Tab content — fills remaining space */}
          <div className="flex-1 min-h-0 p-5 pt-3 flex flex-col">
            {sidebarTab === 'news' ? (
              <NewsFeed />
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-2 shrink-0">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{signals.length} active events</span>
                  {signalsIsLive ? (
                    <span className="text-[9px] font-black text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 animate-pulse">LIVE</span>
                  ) : (
                    <span className="text-[9px] font-black text-yellow-500 uppercase bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">MOCK</span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {signals.map(signal => (
                  <button
                    key={signal.id}
                    onClick={() => setSelectedSignal(signal)}
                    className="w-full text-left bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/[0.08] transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${severityColor[signal.severity]}`}>
                        {signal.severity}
                      </span>
                      <span className="text-[9px] font-bold text-gray-500 uppercase">{signal.type}</span>
                    </div>
                    <p className="text-[12px] font-black text-gray-100 leading-snug group-hover:text-white tracking-tight">{signal.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{signal.body}</p>
                    <p className="text-[9px] text-blue-400/60 mt-1 font-mono">{signal.lat.toFixed(2)}°, {signal.lng.toFixed(2)}°</p>
                  </button>
                ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Bottom Bar: AI Analysis - Topmost Layer */}
      <footer className="shrink-0 z-[100] border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <AIAnalysisBar />
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GICCContent />
    </ErrorBoundary>
  );
};

export default App;
