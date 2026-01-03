
export interface Anime {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    jpg: {
      large_image_url: string;
    }
  };
  score: number;
  synopsis: string;
  episodes: number;
  status: string;
  genres: Array<{ name: string }>;
  trailer: {
    embed_url: string;
  } | null;
  aired: {
    string: string;
  };
}

export interface RecommendationResponse {
  recommendations: Array<{
    title: string;
    reason: string;
    similarityScore: number;
  }>;
}

export interface SearchFilters {
  type?: string;
  status?: string;
  rating?: string;
}

export interface StreamingSource {
  platform: string;
  url: string;
}

export type View = 'home' | 'details' | 'search' | 'ai-sensei' | 'watch';

export interface AppState {
  currentView: View;
  selectedAnimeId: number | null;
  searchQuery: string;
}
