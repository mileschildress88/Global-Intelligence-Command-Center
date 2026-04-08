import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import Globe3D from './components/Globe3D';
import FearGreedMeter from './components/FearGreedMeter';
import AssetTicker from './components/AssetTicker';
import NewsFeed from './components/NewsFeed';
import AIAnalysisBar from './components/AIAnalysisBar';
import FilterTabs from './components/FilterTabs';
import { usePolling } from './hooks/usePolling';
import { useDashboardStore } from './store/dashboardStore';
import type { CrisisSignal } from './types';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(_: Error) { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('GICC ERROR:', error, info); }
  render() {
    if (this.state.hasError) return <div className="h-screen bg-red-950 text-white p-8 font-mono">GICC CRASHED. CHECK CONSOLE.</div>;
    return this.props.children;
  }
}

const severityConfig: Record<string, { badge: string; border: string; bg: string }> = {
  critical: {
    badge: 'text-red-300 bg-red-500/15 border-red-500/40',
    border: 'border-l-red-500',
    bg: 'bg-red-500/[0.04]',
  },
  warning: {
    badge: 'text-amber-300 bg-amber-500/15 border-amber-500/40',
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/[0.03]',
  },
  info: {
    badge: 'text-teal-300 bg-teal-500/15 border-teal-500/30',
    border: 'border-l-teal-500/60',
    bg: 'bg-white/[0.02]',
  },
};

const typeConfig: Record<string, { text: string; dot: string }> = {
  environmental: { text: 'text-orange-400', dot: 'bg-orange-400' },
  market:        { text: 'text-sky-400',    dot: 'bg-sky-400'    },
  weather:       { text: 'text-pink-400',   dot: 'bg-pink-400'   },
  geopolitical:  { text: 'text-purple-400', dot: 'bg-purple-400' },
};

function computeThreatLevel(signals: CrisisSignal[]) {
  const critical = signals.filter(s => s.severity === 'critical').length;
  const warning  = signals.filter(s => s.severity === 'warning').length;
  if (critical >= 6)                 return { label: 'CRITICAL', color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',       dot: 'bg-red-500'    };
  if (critical >= 3)                 return { label: 'HIGH',     color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', dot: 'bg-orange-500' };
  if (critical >= 1 || warning >= 8) return { label: 'ELEVATED', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', dot: 'bg-yellow-400' };
  return                                    { label: 'LOW',      color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',   dot: 'bg-green-500'  };
}

const SignalCard: React.FC<{ signal: CrisisSignal; onClick: () => void }> = ({ signal, onClick }) => {
  const sev = severityConfig[signal.severity] ?? severityConfig.info;
  const typ = typeConfig[signal.type] ?? { text: 'text-gray-400', dot: 'bg-gray-400' };
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-3 border border-l-2 border-white/[0.06] ${sev.border} ${sev.bg} hover:bg-white/[0.06] transition-all duration-200 group active:scale-[0.98] cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${sev.badge}`}>
          {signal.severity}
        </span>
        <div className="flex items-center space-x-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${typ.dot}`} />
          <span className={`text-[8px] font-black uppercase tracking-wider ${typ.text}`}>{signal.type}</span>
        </div>
      </div>
      <p className="text-[11px] font-bold text-white/85 leading-snug group-hover:text-white transition-colors tracking-tight line-clamp-2">{signal.title}</p>
      <p className="text-[9px] text-blue-400/50 mt-1 font-mono tracking-tight">{signal.lat.toFixed(2)}°, {signal.lng.toFixed(2)}°</p>
    </button>
  );
};

// Sidebar section header
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center space-x-2 mb-2">
    <span className="text-[8px] font-black text-white/25 uppercase tracking-[0.18em]">{children}</span>
    <div className="flex-1 h-px bg-white/[0.06]" />
  </div>
);

const GICCContent: React.FC = () => {
  usePolling();
  const {
    signals, signalsIsLive,
    selectedSignal, setSelectedSignal,
    selectedCluster, setSelectedCluster,
  } = useDashboardStore();
  const [sidebarTab, setSidebarTab] = useState<'news' | 'signals'>('news');
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const threat = computeThreatLevel(signals);
  const showSignalDetail  = !!selectedSignal;
  const showClusterDetail = !!selectedCluster && !selectedSignal;
  const showNormal        = !showSignalDetail && !showClusterDetail;

  return (
    <div className="flex flex-col h-screen w-full bg-[#080A12] text-white overflow-hidden font-sans selection:bg-blue-500/30 relative">

      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(59,130,246,0.08)_0%,transparent_60%)]" />

      {/* ── Header ── */}
      <header className="h-14 border-b border-white/[0.07] flex items-center justify-between px-5 shrink-0 bg-[#080A12]/98 backdrop-blur-xl z-50 relative">
        {/* Left — logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="relative flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
              <div className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" />
            </div>
            <span className="text-[22px] font-black tracking-tighter text-white uppercase italic leading-none">GICC</span>
          </div>
          <div className="h-5 w-px bg-white/10" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Global Intelligence</span>
            <span className="text-[8px] font-semibold text-white/25 uppercase tracking-widest mt-0.5">Command Center v1.1</span>
          </div>
        </div>

        {/* Right — status widgets */}
        <div className="flex items-center space-x-3">
          {/* Threat level */}
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${threat.bg}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${threat.dot} animate-pulse`} />
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Threat</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${threat.color}`}>{threat.label}</span>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-white/[0.07]" />

          {/* Clock */}
          <div className="flex flex-col items-end leading-none">
            <span className="text-[13px] font-black text-white/90 tabular-nums font-mono tracking-wider">
              {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[8px] font-bold text-blue-400/60 uppercase tracking-[0.15em]">Live Feed</span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-white/[0.07]" />

          {/* Signal count */}
          <div className="flex items-center space-x-2 bg-red-500/[0.08] px-3 py-1.5 rounded-lg border border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse" />
            <span className="text-[13px] font-black text-white tabular-nums">{signals.length}</span>
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Signals</span>
          </div>
        </div>
      </header>

      {/* ── Filter bar ── */}
      <div className="h-10 border-b border-white/[0.06] flex items-center justify-center px-5 shrink-0 bg-[#080A12]/95 backdrop-blur-xl z-40">
        <FilterTabs />
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 flex overflow-hidden relative z-10">

        {/* Globe */}
        <div className="flex-1 relative overflow-hidden">
          <Globe3D />
        </div>

        {/* ── Sidebar ── */}
        <aside className="w-[390px] h-full border-l border-white/[0.07] bg-[#0C0E1A]/98 backdrop-blur-2xl overflow-y-auto custom-scrollbar z-50 flex flex-col">

          {/* Persistent top widgets */}
          <div className="p-4 pb-0 space-y-3 shrink-0">
            <FearGreedMeter />
            <AssetTicker />
          </div>

          {/* ── SIGNAL DETAIL VIEW ── */}
          {showSignalDetail && (
            <div className="p-4 pt-3 flex-1 animate-fade-in-up">
              <button
                onClick={() => setSelectedSignal(null)}
                className="flex items-center space-x-1.5 text-[9px] font-black text-white/40 hover:text-white/80 uppercase tracking-widest transition-colors group mb-3 cursor-pointer"
              >
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                <span>Back to Feed</span>
              </button>

              <div className={`rounded-xl border border-l-2 border-white/[0.07] p-4 space-y-3 ${severityConfig[selectedSignal!.severity]?.border ?? ''} ${severityConfig[selectedSignal!.severity]?.bg ?? ''}`}>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${severityConfig[selectedSignal!.severity]?.badge}`}>
                    {selectedSignal!.severity}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${typeConfig[selectedSignal!.type]?.dot ?? 'bg-gray-400'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-wider ${typeConfig[selectedSignal!.type]?.text ?? 'text-gray-400'}`}>
                      {selectedSignal!.type}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-white/20 ml-auto">{selectedSignal!.source}</span>
                </div>

                <h2 className="text-[13px] font-black text-white leading-tight tracking-tight">{selectedSignal!.title}</h2>
                <div className="h-px w-8 bg-blue-500/60" />
                <p className="text-[11px] text-white/55 leading-relaxed font-medium">{selectedSignal!.body}</p>

                <div className="flex items-center justify-between text-[9px] font-mono text-white/25 pt-1 border-t border-white/[0.06]">
                  <span>{selectedSignal!.lat.toFixed(3)}°, {selectedSignal!.lng.toFixed(3)}°</span>
                  <span>{new Date(selectedSignal!.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {selectedSignal!.relatedAssets && selectedSignal!.relatedAssets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSignal!.relatedAssets.map(a => (
                      <span key={a} className="text-[8px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase">{a}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/[0.07] p-3 text-center">
                <p className="text-[9px] text-white/25 mb-2 tracking-wide">AI analysis appears in the bar below</p>
                <button
                  onClick={() => { if ((window as any).runGICCAI) (window as any).runGICCAI(selectedSignal); }}
                  className="text-[9px] font-black bg-blue-600 hover:bg-blue-500 text-white px-5 py-1.5 rounded-lg uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/25 active:scale-95 hover:shadow-blue-500/40"
                >
                  Analyze with AI ↓
                </button>
              </div>
            </div>
          )}

          {/* ── CLUSTER LIST VIEW ── */}
          {showClusterDetail && (
            <div className="p-4 pt-3 flex-1 animate-fade-in-up">
              <button
                onClick={() => setSelectedCluster(null)}
                className="flex items-center space-x-1.5 text-[9px] font-black text-white/40 hover:text-white/80 uppercase tracking-widest mb-3 transition-colors group cursor-pointer"
              >
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                <span>Back to Feed</span>
              </button>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[11px] font-black text-white uppercase tracking-tight">
                    {selectedCluster!.length} Signals
                  </span>
                </div>
                <span className="text-[8px] text-white/30 font-mono uppercase tracking-widest">Click to analyze</span>
              </div>

              <div className="space-y-2">
                {selectedCluster!.map(signal => (
                  <SignalCard key={signal.id} signal={signal} onClick={() => setSelectedSignal(signal)} />
                ))}
              </div>
            </div>
          )}

          {/* ── NORMAL TABS VIEW ── */}
          {showNormal && (
            <div className="p-4 pt-3 flex-1">
              {/* Tab switcher */}
              <div className="flex space-x-1 mb-3 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
                <button
                  onClick={() => setSidebarTab('news')}
                  className={`flex-1 text-[9px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    sidebarTab === 'news'
                      ? 'bg-blue-500/20 text-blue-300 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]'
                      : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  Intel Feed
                </button>
                <button
                  onClick={() => setSidebarTab('signals')}
                  className={`flex-1 text-[9px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    sidebarTab === 'signals'
                      ? 'bg-blue-500/20 text-blue-300 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]'
                      : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  Signals ({signals.length})
                </button>
              </div>

              {sidebarTab === 'news' ? (
                <NewsFeed />
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[8px] text-white/30 font-black uppercase tracking-[0.18em]">{signals.length} active events</span>
                    {signalsIsLive ? (
                      <span className="text-[8px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 animate-pulse">LIVE</span>
                    ) : (
                      <span className="text-[8px] font-black text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">MOCK</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {signals.map(signal => (
                      <SignalCard key={signal.id} signal={signal} onClick={() => setSelectedSignal(signal)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </main>

      {/* ── AI Footer ── */}
      <footer className="shrink-0 z-[100] border-t border-white/[0.07]">
        <AIAnalysisBar />
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <GICCContent />
  </ErrorBoundary>
);

export default App;
