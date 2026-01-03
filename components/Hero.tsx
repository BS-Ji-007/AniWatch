
import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import { Anime } from '../types';

interface HeroProps {
  featured: Anime | null;
  onDetailsClick: (id: number) => void;
  onSenseiClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ featured, onDetailsClick, onSenseiClick }) => {
  if (!featured) return <div className="h-[70vh] w-full bg-slate-900 animate-pulse rounded-3xl" />;

  return (
    <div className="relative h-[85vh] w-full rounded-3xl overflow-hidden mb-12 shadow-2xl">
      <img 
        src={featured.images.jpg.large_image_url} 
        alt={featured.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />

      <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-indigo-600/20 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-widest">
            Trending Now
          </span>
          <span className="bg-white/10 text-white/70 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            {featured.aired.string}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-outfit font-bold mb-4 leading-tight">
          {featured.title_english || featured.title}
        </h1>
        
        <p className="text-slate-300 text-sm md:text-base mb-8 line-clamp-3 md:line-clamp-4 leading-relaxed max-w-2xl">
          {featured.synopsis}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => onDetailsClick(featured.mal_id)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Info className="w-5 h-5" />
            View Details
          </button>
          <button 
            onClick={onSenseiClick}
            className="flex items-center gap-2 glass hover:bg-white/10 px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
