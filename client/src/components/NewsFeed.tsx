import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const NewsFeed: React.FC = () => {
  const { newsItems, newsIsLive } = useDashboardStore();

  return (
    <div className="bg-[#111320]/80 backdrop-blur-md border border-white/10 rounded-xl p-5 flex flex-col h-full shadow-2xl overflow-hidden">
      <div className="flex justify-between items-center mb-5 shrink-0">
        <h3 className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Intelligence Feed</h3>
        {newsIsLive ? (
          <span className="text-[9px] font-black text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 animate-pulse">
            {newsItems.length} LIVE
          </span>
        ) : (
          <span className="text-[9px] font-black text-yellow-500 uppercase bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
            MOCK DATA
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar min-h-0 touch-pan-y">
        <div className="space-y-4 pb-4">
          {newsItems.length === 0 && (
            <div className="text-center py-10">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Awaiting Data Sync...</span>
            </div>
          )}
          {newsItems.map((item, index) => {
            const isNew = (Date.now() - new Date(item.publishedAt).getTime()) < 1000 * 60 * 30;
            return (
              <div 
                key={item.id}
                className={`bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/[0.08] transition-all cursor-pointer group relative overflow-hidden active:scale-[0.98] border-l-2 ${isNew ? 'border-l-blue-500' : 'border-l-transparent'}`}
                onClick={() => {
                  if (typeof (window as any).runGICCAI === 'function') {
                    (window as any).runGICCAI({ 
                      title: item.title, 
                      body: item.description, 
                      type: 'market', 
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
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">
                    {item.source}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 font-bold">
                    {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-[12px] font-black text-gray-100 leading-snug group-hover:text-white transition-colors tracking-tight">
                  {item.title}
                </h4>
                <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 leading-relaxed font-medium group-hover:text-gray-300 transition-colors">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
