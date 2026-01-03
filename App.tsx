
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AnimeCard from './components/AnimeCard';
import { Anime, View, RecommendationResponse, SearchFilters } from './types';
import { getTrendingAnime, searchAnime, getAnimeById, getTopMovies, generateSlug } from './services/animeService';
import { getAiRecommendations, askAnimeSensei, findStreamingSources } from './services/geminiService';
import { 
  Sparkles, ChevronLeft, Send, BrainCircuit, Loader2, Play, Star, 
  TrendingUp, Tv, Film, Search, ExternalLink, Info, MonitorPlay, 
  Maximize2, Server, Volume2, Zap, ShieldCheck, Activity, Layers, AlertCircle, RefreshCw, Cpu
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [trending, setTrending] = useState<Anime[]>([]);
  const [topMovies, setTopMovies] = useState<Anime[]>([]);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [activeServer, setActiveServer] = useState<string>('hianime');
  const [playerError, setPlayerError] = useState(false);
  
  // AI & Streaming States
  const [aiInput, setAiInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiRecs, setAiRecs] = useState<RecommendationResponse | null>(null);
  const [moodInput, setMoodInput] = useState('');
  const [streamingInfo, setStreamingInfo] = useState<{text: string, sources: any[]} | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [trendingData, movieData] = await Promise.all([
          getTrendingAnime(1),
          getTopMovies()
        ]);
        setTrending(trendingData);
        setTopMovies(movieData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleSearch = async (query: string, filters?: SearchFilters) => {
    setSearchQuery(query);
    setView('search');
    const hasFilters = filters && (filters.type || filters.status);
    if (!query.trim() && !hasFilters) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchAnime(query, filters);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleAnimeClick = async (id: number) => {
    setLoading(true);
    setStreamingInfo(null);
    try {
      const anime = await getAnimeById(id);
      setSelectedAnime(anime);
      setView('details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Failed to load anime details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchClick = (anime: Anime) => {
    setSelectedAnime(anime);
    setActiveServer('hianime');
    setPlayerError(false);
    setView('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFindStreaming = async () => {
    if (!selectedAnime) return;
    setIsAiThinking(true);
    try {
      const res = await findStreamingSources(selectedAnime.title_english || selectedAnime.title);
      setStreamingInfo(res);
      if (view === 'watch') {
        const userMsg = `Find live streams for "${selectedAnime.title_english || selectedAnime.title}" using HiAnime/Consumet protocol.`;
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatHistory(prev => [...prev, { role: 'ai', content: res.text }]);
      }
    } catch (error) {
      console.error("Failed to find sources:", error);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleAskSensei = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiInput('');
    setIsAiThinking(true);
    try {
      const response = await askAnimeSensei(userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "Sensei is busy. Try again!" }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleGetRecs = async () => {
    if (!moodInput.trim()) return;
    setIsAiThinking(true);
    try {
      const liked = trending.slice(0, 3).map(a => a.title);
      const res = await getAiRecommendations(moodInput, liked);
      setAiRecs(res);
    } catch (error) {
      console.error("Recs failed:", error);
    } finally {
      setIsAiThinking(false);
    }
  };

  const renderHome = () => (
    <div className="animate-in fade-in duration-700 space-y-16">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <Film className="text-indigo-500 w-8 h-8" />
          <h2 className="text-3xl font-outfit font-bold">Cinema Spotlight</h2>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
          {topMovies.map(movie => (
            <div 
              key={movie.mal_id}
              onClick={() => handleAnimeClick(movie.mal_id)}
              className="flex-shrink-0 w-[300px] md:w-[450px] group cursor-pointer snap-start relative"
            >
              <div className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 bg-slate-900">
                <img src={movie.images.jpg.large_image_url} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                   <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)] border-4 border-white/20">
                      <Play className="w-10 h-10 text-white fill-current" />
                   </div>
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20">4K Ultra</span>
                    <div className="flex items-center gap-1 text-yellow-500 font-bold bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-md">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs">{movie.score}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black font-outfit line-clamp-1 group-hover:text-indigo-400 transition-colors drop-shadow-lg">{movie.title_english || movie.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Hero 
        featured={trending[0]} 
        onDetailsClick={handleAnimeClick} 
        onSenseiClick={() => setView('ai-sensei')}
      />
      
      <section>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-outfit font-bold flex items-center gap-3">
            <TrendingUp className="text-indigo-500 w-8 h-8" />
            Trending Worldwide
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {trending.map(anime => (
            <AnimeCard key={anime.mal_id} anime={anime} onClick={handleAnimeClick} />
          ))}
        </div>
      </section>
    </div>
  );

  const renderDetails = () => {
    if (!selectedAnime) return null;
    return (
      <div className="animate-in slide-in-from-bottom-12 duration-500">
        <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 mb-10 transition-colors font-black uppercase tracking-[0.3em] text-[10px]">
          <ChevronLeft className="w-4 h-4" /> Return to Sanctuary
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-8">
              <div className="relative group overflow-hidden rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                <img src={selectedAnime.images.jpg.large_image_url} alt={selectedAnime.title} className="w-full transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[3rem]" />
              </div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => handleWatchClick(selectedAnime)}
                  className="w-full py-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-[1.5rem] font-black flex items-center justify-center gap-4 shadow-2xl shadow-indigo-600/30 transition-all hover:-translate-y-1 active:scale-95 group"
                >
                  <Play className="w-6 h-6 fill-current group-hover:animate-pulse" />
                  WATCH NOW FULL HD
                </button>
                <button 
                  onClick={handleFindStreaming}
                  className="w-full py-4 glass border border-white/5 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95"
                >
                  <MonitorPlay className="w-5 h-5 text-indigo-500" />
                  SOURCE FINDER
                </button>
              </div>

              {streamingInfo && (
                <div className="glass p-8 rounded-[2rem] border border-indigo-500/10 animate-in fade-in slide-in-from-top-4">
                  <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Live Source Map
                  </h4>
                  <div className="space-y-3">
                    {streamingInfo.sources.length > 0 ? streamingInfo.sources.slice(0, 5).map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-indigo-600/20 rounded-2xl border border-white/5 transition-all group"
                      >
                        <span className="text-xs font-bold line-clamp-1">{source.title}</span>
                        <ExternalLink className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                      </a>
                    )) : (
                      <div className="flex items-center gap-3 text-slate-500 italic text-xs py-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Scanning digital ether...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-12 pt-4">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-indigo-500/20 shadow-lg">
                  {selectedAnime.status}
                </span>
                <div className="flex items-center gap-2 text-yellow-500 font-black bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{selectedAnime.score || '8.5+'}</span>
                </div>
              </div>
              <h1 className="text-6xl md:text-8xl font-outfit font-black mb-6 leading-[0.9] tracking-tighter">
                {selectedAnime.title_english || selectedAnime.title}
              </h1>
              <p className="text-indigo-500 font-black text-2xl mb-10 tracking-tight opacity-90">{selectedAnime.title}</p>
              
              <div className="flex flex-wrap gap-3">
                {selectedAnime.genres.map(g => (
                  <span key={g.name} className="px-7 py-3 glass border border-white/5 rounded-full text-xs font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer uppercase tracking-widest">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 shadow-inner">
               <h3 className="text-3xl font-black flex items-center gap-4 font-outfit">
                 <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                    <Info className="w-6 h-6 text-indigo-500" />
                 </div>
                 The Lore
               </h3>
               <p className="text-xl text-slate-400 leading-relaxed font-medium">
                 {selectedAnime.synopsis || "Plot summary missing. Prepare for a mysterious journey."}
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWatch = () => {
    if (!selectedAnime) return null;
    
    const getEmbedUrl = () => {
      const id = selectedAnime.mal_id;
      const slug = generateSlug(selectedAnime.title_english || selectedAnime.title);
      
      // Integration of HiAnime, Zoro, and Consumet logic
      switch(activeServer) {
        case 'hianime': return `https://vidsrc.to/embed/anime/${id}`; // HiAnime/AniWatch source
        case 'zoro': return `https://vidlink.pro/embed/anime/${id}`;   // High-speed VidLink (Zoro style)
        case 'consumet': return `https://vidsrc.xyz/embed/anime/${id}`; // XYZ cluster (Consumet)
        case 'cloud': return `https://vidsrc.cc/v3/embed/anime/${id}`;  // V3 Cloud engine
        default: return `https://vidsrc.me/embed/anime/${id}`;
      }
    };

    return (
      <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-white/5">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setView('details')}
                className="flex items-center gap-2 text-indigo-500 font-black uppercase tracking-[0.2em] text-[10px] group py-2"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Library
              </button>
              <div className="h-6 w-px bg-white/10 hidden md:block" />
              <h2 className="text-xl font-black font-outfit line-clamp-1 flex items-center gap-3">
                <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
                {selectedAnime.title_english || selectedAnime.title}
              </h2>
           </div>
           
           <div className="flex items-center bg-black/40 p-1.5 rounded-[1.2rem] border border-white/5 backdrop-blur-xl">
             <button 
               onClick={() => {setActiveServer('hianime'); setPlayerError(false);}}
               className={`px-5 py-2.5 rounded-[0.8rem] text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeServer === 'hianime' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-500'}`}
             >
               <Tv className="w-3 h-3" /> HiAnime
             </button>
             <button 
               onClick={() => {setActiveServer('zoro'); setPlayerError(false);}}
               className={`px-5 py-2.5 rounded-[0.8rem] text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeServer === 'zoro' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-500'}`}
             >
               <Zap className="w-3 h-3" /> Zoro
             </button>
             <button 
               onClick={() => {setActiveServer('consumet'); setPlayerError(false);}}
               className={`px-5 py-2.5 rounded-[0.8rem] text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeServer === 'consumet' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-500'}`}
             >
               <Cpu className="w-3 h-3" /> Consumet
             </button>
             <button 
               onClick={() => {setActiveServer('cloud'); setPlayerError(false);}}
               className={`px-5 py-2.5 rounded-[0.8rem] text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeServer === 'cloud' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-500'}`}
             >
               <Layers className="w-3 h-3" /> Cloud
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.8rem] blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border border-white/10 ring-1 ring-white/5 flex items-center justify-center">
                 {!playerError ? (
                   <iframe 
                    src={getEmbedUrl()} 
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                    title="AniWatch Cinema Player"
                  />
                 ) : (
                   <div className="text-center p-12 space-y-6">
                      <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter">Stream Offline</h3>
                        <p className="text-slate-400 font-bold max-w-sm mx-auto">This title is currently unavailable on this server node. Switching to alternate route...</p>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <button onClick={() => setPlayerError(false)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black flex items-center gap-2 transition-all">
                          <RefreshCw className="w-4 h-4" /> RE-INIT
                        </button>
                        <button onClick={handleFindStreaming} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/30">
                          <BrainCircuit className="w-4 h-4" /> SCAN NEURAL
                        </button>
                      </div>
                   </div>
                 )}
              </div>
            </div>

            <div className="glass p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 border border-white/5">
               <div className="space-y-3 text-center md:text-left">
                  <h4 className="font-black text-3xl font-outfit flex items-center gap-3 justify-center md:justify-start">
                    <Volume2 className="w-8 h-8 text-indigo-500" />
                    HiAnime Protocol
                  </h4>
                  <p className="text-slate-400 font-bold max-w-lg">Using HiAnime-API2 & Mapper logic. If Server 1 is slow, use Zoro or Consumet engines above.</p>
               </div>
               <div className="flex gap-4">
                  <button 
                    onClick={handleFindStreaming}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-[1.2rem] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3"
                  >
                    <Maximize2 className="w-5 h-5" /> SENSEI SCAN
                  </button>
               </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
             <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                <h5 className="font-black uppercase text-[10px] tracking-[0.2em] text-indigo-500 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Network Vitals
                </h5>
                
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Node</span>
                      <span className="text-xs font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded uppercase">Verified</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Bypass</span>
                      <span className="text-xs font-black text-indigo-400">ACTIVE</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Engine</span>
                      <span className="text-xs font-black text-white uppercase">{activeServer}</span>
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Override</p>
                   <button onClick={() => setPlayerError(!playerError)} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase transition-all border border-white/5">
                     Force Buffer Reset
                   </button>
                   <button onClick={() => setView('ai-sensei')} className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase transition-all border border-indigo-500/10">
                     Ask Sensei to Patch
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSearch = () => (
    <div className="animate-in fade-in duration-500">
      {!searchQuery.trim() && !searchResults.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center opacity-60">
            <Search className="w-20 h-20 mb-6 text-indigo-500/20" />
            <h2 className="text-3xl font-outfit font-black mb-2 uppercase tracking-tighter">Your Journey Starts Here</h2>
            <p className="text-slate-400 font-medium">Discover your next obsession with AI-Guided Search.</p>
        </div>
      ) : (
        <>
            <div className="mb-10 flex items-end justify-between">
                <div>
                  <h2 className="text-5xl font-outfit font-black mb-2 tracking-tighter">Results</h2>
                  <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                    Searching for <span className="text-indigo-500">"{searchQuery || 'Filtered Selection'}"</span>
                  </div>
                </div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  {searchResults.length} Titles Found
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                {searchResults.map(anime => (
                <AnimeCard key={anime.mal_id} anime={anime} onClick={handleAnimeClick} />
                ))}
            </div>
        </>
      )}
    </div>
  );

  function renderSensei() {
    return (
      <div className="max-w-6xl mx-auto space-y-16 animate-in slide-in-from-bottom-12 duration-700">
        <div className="text-center space-y-8">
          <div className="w-32 h-32 bg-indigo-600/20 rounded-[3rem] flex items-center justify-center mx-auto border border-indigo-500/20 animate-float shadow-[0_0_80px_rgba(79,70,229,0.2)] relative group">
            <Sparkles className="w-16 h-16 text-indigo-500 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-indigo-500/30 blur-[60px] opacity-50" />
          </div>
          <div className="space-y-2">
            <h1 className="text-7xl md:text-9xl font-outfit font-black tracking-tighter uppercase leading-[0.8]">Sensei <span className="text-gradient">AI</span></h1>
            <p className="text-slate-400 max-w-lg mx-auto font-black text-xl uppercase tracking-tighter opacity-80 italic">"Whisper your mood, discover your destiny."</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 glass rounded-[3.5rem] p-12 flex flex-col h-[700px] border border-white/5 shadow-2xl relative group overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-10 mb-8 pr-6 custom-scrollbar scroll-smooth">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 space-y-8">
                  <Tv className="w-24 h-24 text-indigo-500" />
                  <div className="space-y-2">
                    <p className="font-black text-3xl tracking-tighter uppercase">Initialize Consciousness</p>
                    <p className="text-sm font-bold uppercase tracking-widest">Ask about any anime, movie, or character.</p>
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-10 py-6 rounded-[2.5rem] text-sm font-bold leading-relaxed shadow-2xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white border border-indigo-400/30 rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 dark:text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 px-10 py-6 rounded-[2.5rem] rounded-tl-none">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleAskSensei} className="relative mt-auto">
              <input 
                type="text" 
                placeholder="Message Sensei Protocol..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="w-full bg-[#020617] border border-white/5 rounded-3xl py-6 pl-10 pr-20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-black text-lg shadow-inner"
              />
              <button 
                type="submit"
                disabled={isAiThinking}
                className="absolute right-5 top-5 p-5 bg-indigo-600 text-white rounded-2xl disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-2xl active:scale-95"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-12">
            <div className="glass rounded-[3.5rem] p-12 border border-white/5 shadow-2xl space-y-10 bg-indigo-600/[0.03]">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                  <BrainCircuit className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-4xl font-black font-outfit uppercase tracking-tighter">Mood Sync</h3>
              </div>
              
              <div className="space-y-8">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">State of consciousness</p>
                <textarea 
                  placeholder="I want to watch something intense like Psycho-Pass with mind-blowing twists..."
                  value={moodInput}
                  onChange={(e) => setMoodInput(e.target.value)}
                  className="w-full h-48 bg-[#020617] border border-white/5 rounded-[2rem] p-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-sm font-bold leading-relaxed shadow-inner"
                />
                <button 
                  onClick={handleGetRecs}
                  disabled={isAiThinking || !moodInput.trim()}
                  className="w-full py-6 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-[2rem] font-black hover:opacity-90 transition-all flex items-center justify-center gap-5 shadow-2xl shadow-indigo-600/40 disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]"
                >
                  {isAiThinking ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                  GENERATE DESTINY
                </button>
              </div>

              {aiRecs && (
                <div className="pt-10 space-y-8 animate-in slide-in-from-top-6 duration-500">
                  <h4 className="font-black text-indigo-500 uppercase text-[10px] tracking-[0.4em] border-b border-indigo-500/20 pb-4">Targets Acquired</h4>
                  <div className="space-y-5 max-h-[350px] overflow-y-auto no-scrollbar pr-4">
                    {aiRecs.recommendations.map((rec, i) => (
                      <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-indigo-600/10 transition-all group cursor-pointer relative overflow-hidden active:scale-95">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-black text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{rec.title}</span>
                          <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">{Math.floor(rec.similarityScore * 100)}% Match</span>
                        </div>
                        <p className="text-[12px] text-slate-500 leading-relaxed font-bold italic opacity-80 group-hover:opacity-100 group-hover:text-slate-300 transition-all">"{rec.reason}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'dark bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar onViewChange={setView} onSearch={handleSearch} isDark={isDark} onToggleTheme={toggleTheme} />
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-32">
        {loading ? (
          <div className="h-[75vh] flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl animate-pulse" />
            </div>
            <p className="font-outfit text-slate-500 animate-pulse tracking-[0.4em] uppercase text-[10px] font-black">Decrypting Multiverse...</p>
          </div>
        ) : (
          <>
            {view === 'home' && renderHome()}
            {view === 'search' && renderSearch()}
            {view === 'details' && renderDetails()}
            {view === 'watch' && renderWatch()}
            {view === 'ai-sensei' && renderSensei()}
          </>
        )}
      </main>
      <footer className="border-t border-white/5 py-24 bg-slate-950/40 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="md:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                <Tv className="w-7 h-7 text-white" />
              </div>
              <span className="font-outfit font-black text-3xl tracking-tighter uppercase">AniWatch <span className="text-indigo-500">AI</span></span>
            </div>
            <p className="text-slate-500 text-lg font-bold max-w-sm leading-relaxed">The premier destination for anime culture. Driven by Gemini AI to find exactly what you love, instantly.</p>
          </div>
          <div className="space-y-6">
            <h5 className="uppercase text-[10px] tracking-[0.3em] text-indigo-500 font-black">Portal</h5>
            <ul className="space-y-4 font-black uppercase text-[11px] text-slate-400">
               <li><button onClick={() => setView('home')} className="hover:text-indigo-400 transition-colors">Home Base</button></li>
               <li><button onClick={() => setView('search')} className="hover:text-indigo-400 transition-colors">The Vault</button></li>
               <li><button onClick={() => setView('ai-sensei')} className="hover:text-indigo-400 transition-colors">Ask Sensei</button></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="uppercase text-[10px] tracking-[0.3em] text-indigo-500 font-black">Connect</h5>
            <ul className="space-y-4 font-black uppercase text-[11px] text-slate-400">
               <li><a href="#" className="hover:text-indigo-400 transition-colors">Discord Hub</a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors">Neural Net</a></li>
               <li><a href="#" className="hover:text-indigo-400 transition-colors">API Docs</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
