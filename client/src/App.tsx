import React, { Component, ErrorInfo, ReactNode } from 'react';
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

const GICCContent: React.FC = () => {
  console.log('GICCContent is rendering...');
  usePolling();
  const { signals } = useDashboardStore();
  const timestamp = new Date().toLocaleTimeString();

  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0C14] text-[#EEEEF0] overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Topbar */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#0A0C14]/80 backdrop-blur-md z-40">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">GICC</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-500 uppercase leading-none">Global Intelligence</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mt-0.5">Command Center</span>
          </div>
        </div>

        <FilterTabs />

        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase leading-none">{timestamp}</span>
            <span className="text-[9px] font-bold text-green-500/80 uppercase leading-none mt-0.5 tracking-widest animate-pulse">Live Feed Active</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-black text-white">{signals.length} ACTIVE SIGNALS</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: 3D Globe */}
        <div className="flex-1 relative bg-[radial-gradient(circle_at_50%_50%,rgba(16,24,64,0.15)_0%,rgba(10,12,20,1)_100%)]">
          <Globe3D />
        </div>

        {/* Right Sidebar */}
        <aside className="w-[340px] border-l border-white/5 bg-[#0A0C14]/50 backdrop-blur-sm flex flex-col p-4 space-y-4 overflow-hidden z-30">
          <FearGreedMeter />
          <AssetTicker />
          <NewsFeed />
        </aside>
      </main>

      {/* Bottom Bar: AI Analysis */}
      <footer className="shrink-0 z-40">
        <AIAnalysisBar />
      </footer>

      {/* Global CSS Overlays */}
      <div className="fixed inset-0 pointer-events-none border-[20px] border-[#0A0C14] z-50 opacity-50" />
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
