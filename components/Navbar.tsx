
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Home, Tv, Moon, Sun, Mic, SlidersHorizontal, X } from 'lucide-react';
import { View, SearchFilters } from '../types';

interface NavbarProps {
  onViewChange: (view: View) => void;
  onSearch: (query: string, filters?: SearchFilters) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onViewChange, onSearch, isDark, onToggleTheme }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: '',
    status: ''
  });
  
  const isMounted = useRef(false);

  // Live search with debounce
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const timer = setTimeout(() => {
      onSearch(searchValue, filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, filters]);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchValue(transcript);
      };
      
      recognition.start();
    } else {
      alert("Voice search is not supported in your browser.");
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ type: '', status: '' });
    setShowFilters(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b px-4 md:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          onClick={() => onViewChange('home')}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 group-hover:rotate-6">
            <Tv className="text-white w-6 h-6" />
          </div>
          <span className="font-outfit font-extrabold text-2xl tracking-tighter hidden sm:block text-slate-900 dark:text-white">
            Ani<span className="text-indigo-500">Watch</span>
          </span>
        </div>

        {/* Search & Filter Section */}
        <div className="flex-1 max-w-xl relative flex items-center gap-2 z-50">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search anime..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-white/40" />
            
            <button 
              onClick={startListening}
              className={`absolute right-3 top-2.5 transition-all hover:scale-110 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 dark:text-white/40 hover:text-indigo-500'}`}
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all ${
              showFilters || (filters.type || filters.status)
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-200/50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-indigo-500'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="absolute top-12 right-0 w-64 glass rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 z-[60]">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Filters</span>
                {(filters.type || filters.status) && (
                  <button onClick={clearFilters} className="text-[10px] text-red-500 hover:text-red-400 font-black uppercase tracking-wider">
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 dark:text-white/50 font-black uppercase tracking-widest">Type</label>
                  <select 
                    value={filters.type}
                    onChange={(e) => updateFilter('type', e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Types</option>
                    <option value="tv" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">TV Series</option>
                    <option value="movie" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Movie</option>
                    <option value="ova" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">OVA</option>
                    <option value="special" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Special</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 dark:text-white/50 font-black uppercase tracking-widest">Status</label>
                  <select 
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Status</option>
                    <option value="airing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Airing</option>
                    <option value="complete" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Complete</option>
                    <option value="upcoming" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Upcoming</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <button 
            onClick={onToggleTheme}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-colors"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-indigo-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
          
          <button 
            onClick={() => onViewChange('home')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-colors group"
          >
            <Home className="w-5 h-5 text-slate-500 dark:text-white/60 group-hover:text-indigo-500" />
          </button>

          <button 
            onClick={() => onViewChange('ai-sensei')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:block uppercase tracking-wider">SENSEI</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
