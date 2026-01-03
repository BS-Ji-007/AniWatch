
import { Anime, SearchFilters } from '../types';

const BASE_URL = 'https://api.jikan.moe/v4';

// Utility inspired by anime-mapper to generate slugs for streaming APIs
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-')         // spaces to hyphens
    .replace(/-+/g, '-');         // remove double hyphens
};

export const getTrendingAnime = async (page: number = 1): Promise<Anime[]> => {
  const response = await fetch(`${BASE_URL}/top/anime?page=${page}&limit=20`);
  const data = await response.json();
  return data.data;
};

export const getTopMovies = async (): Promise<Anime[]> => {
  const response = await fetch(`${BASE_URL}/top/anime?type=movie&limit=5`);
  const data = await response.json();
  return data.data;
};

export const searchAnime = async (query: string, filters?: SearchFilters): Promise<Anime[]> => {
  let url = `${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=24&order_by=score&sort=desc`;
  
  if (filters) {
    if (filters.type) url += `&type=${filters.type}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.rating) url += `&rating=${filters.rating}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  return data.data || [];
};

export const getAnimeById = async (id: number): Promise<Anime> => {
  const response = await fetch(`${BASE_URL}/anime/${id}/full`);
  const data = await response.json();
  return data.data;
};

export const getSeasonNow = async (): Promise<Anime[]> => {
  const response = await fetch(`${BASE_URL}/seasons/now?limit=10`);
  const data = await response.json();
  return data.data;
};
