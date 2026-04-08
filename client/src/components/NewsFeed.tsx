import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const CATEGORY_STYLES: Record<string, { badge: string; border: string }> = {
  environmental: { badge: 'text-orange-400 bg-orange-500/10 border-orange-500/30', border: 'border-l-orange-500/60' },
  market:        { badge: 'text-sky-400 bg-sky-500/10 border-sky-500/30',          border: 'border-l-sky-500/60'   },
  weather:       { badge: 'text-pink-400 bg-pink-500/10 border-pink-500/30',       border: 'border-l-pink-500/60'  },
  global:        { badge: 'text-purple-400 bg-purple-500/10 border-purple-500/30', border: 'border-l-purple-500/60'},
};

const CATEGORY_LABELS: Record<string, string> = {
  environmental: 'ENV',
  market:        'MKT',
  weather:       'WX',
  global:        'GEO',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const NewsFeed: React.FC = () => {
  const { newsItems, newsIsLive, activeFilter } = useDashboardStore();

  const filtered = activeFilter === 'all'
    ? newsItems
    : newsItems.filter(n => n.category === activeFilter);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-[8px] font-black text-white/25 uppercase tracking-[0.18em]">Intelligence Feed</span>
          <span className="text-[8px] text-white/20 font-mono">{filtered.length}</span>
        </div>
        {newsIsLive ? (
          <span className="text-[8px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 animate-pulse">LIVE</span>
        ) : (
          <span className="text-[8px] font-black text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">MOCK</span>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-2 pb-4">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Awaiting Data Sync...</span>
          </div>
        )}
        {filtered.map((item) => {
          const isNew = (Date.now() - new Date(item.publishedAt).getTime()) < 1000 * 60 * 30;
          const cat = item.category || 'global';
          const style = CATEGORY_STYLES[cat] ?? CATEGORY_STYLES.global;
          const label = CATEGORY_LABELS[cat] ?? 'GEO';

          return (
            <div
              key={item.id}
              onClick={() => {
                if (typeof (window as any).runGICCAI === 'function') {
                  (window as any).runGICCAI({
                    title: item.title,
                    body: item.description,
                    type: item.category || 'market',
                    severity: 'info',
                    lat: 0, lng: 0,
                  });
                }
              }}
              className={`relative rounded-xl border border-l-2 border-white/[0.06] ${style.border} bg-white/[0.025] hover:bg-white/[0.05] transition-all duration-200 cursor-pointer group overflow-hidden active:scale-[0.99] p-3`}
            >
              {/* NEW badge */}
              {isNew && (
                <div className="absolute top-0 right-0 bg-blue-600 text-[7px] font-black px-1.5 py-0.5 rounded-bl-lg tracking-widest text-white">NEW</div>
              )}

              {/* Meta row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border tracking-widest ${style.badge}`}>
                    {label}
                  </span>
                  <span className="text-[8px] font-black text-white/35 uppercase tracking-tight">{item.source}</span>
                </div>
                <span className="text-[8px] font-mono text-white/25">{timeAgo(item.publishedAt)}</span>
              </div>

              {/* Title */}
              <h4 className="text-[11px] font-bold text-white/80 leading-snug group-hover:text-white transition-colors tracking-tight line-clamp-2">
                {item.title}
              </h4>

              {/* Description */}
              {item.description && (
                <p className="text-[10px] text-white/35 mt-1.5 line-clamp-2 leading-relaxed group-hover:text-white/50 transition-colors">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsFeed;
