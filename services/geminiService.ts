
import { GoogleGenAI, Type } from "@google/genai";
import { RecommendationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getAiRecommendations = async (mood: string, likedAnimes: string[]): Promise<RecommendationResponse> => {
  const prompt = `Based on a user who is feeling "${mood}" and likes "${likedAnimes.join(', ')}", provide 5 anime recommendations. 
  Include a brief reason for each recommendation. Return valid JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                reason: { type: Type.STRING },
                similarityScore: { type: Type.NUMBER }
              },
              required: ["title", "reason", "similarityScore"]
            }
          }
        },
        required: ["recommendations"]
      }
    }
  });

  return JSON.parse(response.text) as RecommendationResponse;
};

export const askAnimeSensei = async (question: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: question,
    config: {
      systemInstruction: "You are 'AniGemini Sensei', a wise and enthusiastic anime expert. You know everything about Japanese animation history, characters, tropes, and industry news. Keep your tone helpful and engaging.",
    }
  });
  return response.text;
};

export const findStreamingSources = async (animeTitle: string) => {
  const prompt = `Where can I officially stream the anime/movie "${animeTitle}"? List the platforms and direct URLs if possible.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Watch Link',
    uri: chunk.web?.uri
  })).filter((c: any) => c.uri) || [];

  return {
    text: response.text,
    sources: urls
  };
};
