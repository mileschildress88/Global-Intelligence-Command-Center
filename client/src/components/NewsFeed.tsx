import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const NewsFeed: React.FC = () => {
  const { newsItems, setSelectedSignal } = useDashboardStore();

  return (
    <div className="bg-[#111320] border border-white/5 rounded-xl p-4 flex flex-col overflow-hidden h-full">
      <h3 className="text-gray-400 text-[10px] uppercase tracking-wider mb-4 font-bold shrink-0">News Feed</h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-3">
          {newsItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white/5 border border-white/5 rounded-lg p-3 hover:bg-white/[0.08] transition-all cursor-pointer group"
              onClick={() => {
                // In a real app, this might convert a news item to a signal
                console.log('News clicked:', item.title);
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                  {item.source}
                </span>
                <span className="text-[9px] text-gray-500">
                  {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h4 className="text-[13px] font-bold text-gray-200 leading-snug group-hover:text-white transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
