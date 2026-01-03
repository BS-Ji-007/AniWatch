
import React from 'react';
import { Star, PlayCircle } from 'lucide-react';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
  onClick: (id: number) => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  return (
    <div 
      onClick={() => onClick(anime.mal_id)}
      className="group relative bg-slate-900 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 border border-white/5 shadow-xl"
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={anime.images.jpg.large_image_url} 
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        
        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="w-12 h-12 text-white/80" />
        </div>

        {/* Score Badge */}
        {anime.score && (
          <div className="absolute top-2 right-2 bg-indigo-600 px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-bold shadow-lg">
            <Star className="w-3 h-3 fill-current" />
            {anime.score.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-outfit font-semibold text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors">
          {anime.title_english || anime.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-white/40 uppercase tracking-wider font-bold">
          <span>{anime.episodes || '?'} EP</span>
          <span className="w-1 h-1 bg-white/20 rounded-full" />
          <span>{anime.status}</span>
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;
