import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const CATEGORY_STYLES: Record<string, string> = {
  environmental: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  market:        'text-blue-400 bg-blue-500/10 border-blue-500/30',
  weather:       'text-pink-400 bg-pink-500/10 border-pink-500/30',
  global:        'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

const CATEGORY_LABELS: Record<string, string> = {
  environmental: 'ENV',
  market:        'MKT',
  weather:       'WX',
  global:        'GEO',
};

const NewsFeed: React.FC = () => {
  const { newsItems, newsIsLive, activeFilter } = useDashboardStore();

  const filtered = activeFilter === 'all'
    ? newsItems
    : newsItems.filter(n => n.category === activeFilter);

  return (
    <div className="bg-[#111320]/80 backdrop-blur-md border border-white/10 rounded-xl p-5 flex flex-col shadow-2xl overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Intelligence Feed</h3>
          <span className="text-[9px] text-gray-600 font-mono">{filtered.length} articles</span>
        </div>
        {newsIsLive ? (
          <span className="text-[9px] font-black text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 animate-pulse">
            LIVE
          </span>
        ) : (
          <span className="text-[9px] font-black text-yellow-500 uppercase bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
            MOCK DATA
          </span>
        )}
      </div>

      <div className="overflow-y-auto pr-1 custom-scrollbar touch-pan-y">
        <div className="space-y-3 pb-4">
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Awaiting Data Sync...</span>
            </div>
          )}
          {filtered.map((item) => {
            const isNew = (Date.now() - new Date(item.publishedAt).getTime()) < 1000 * 60 * 30;
            const catStyle = CATEGORY_STYLES[item.category || 'global'] || CATEGORY_STYLES.global;
            const catLabel = CATEGORY_LABELS[item.category || 'global'] || 'GEO';
            return (
              <div
                key={item.id}
                className={`bg-white/5 border border-white/5 rounded-xl p-3.5 hover:bg-white/[0.08] transition-all cursor-pointer group relative overflow-hidden active:scale-[0.98] border-l-2 ${isNew ? 'border-l-blue-500' : 'border-l-transparent'}`}
                onClick={() => {
                  if (typeof (window as any).runGICCAI === 'function') {
                    (window as any).runGICCAI({
                      title: item.title,
                      body: item.description,
                      type: item.category || 'market',
                      severity: 'info',
                      lat: 0,
                      lng: 0
                    });
                  }
                }}
              >
                {isNew && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-blue-600 text-[8px] font-black px-2 py-0.5 rounded-bl-lg tracking-tighter shadow-lg">LATEST</div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border tracking-widest ${catStyle}`}>
                      {catLabel}
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                      {item.source}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 font-bold">
                    {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-[11px] font-black text-gray-100 leading-snug group-hover:text-white transition-colors tracking-tight">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed font-medium group-hover:text-gray-300 transition-colors">
                    {item.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
