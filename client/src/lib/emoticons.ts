import type { Emoticon } from "@shared/schema";

// Utility functions for emoticon handling
export const generateMockEmoticons = (count: number, startId: number = 1): Emoticon[] => {
  const categories = ["디시콘", "아카콘", "카톡이모티콘", "기타"];
  const subcategories = {
    "디시콘": ["게임", "영상", "캐릭터", "기타"],
    "아카콘": ["아프리카TV", "트위치", "유튜브"],
    "카톡이모티콘": ["캐릭터", "동물", "브랜드"],
    "기타": ["인터넷 밈", "반응 짤", "움짤"]
  };

  const emoticons: Emoticon[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const subArray = subcategories[category as keyof typeof subcategories];
    const subcategory = subArray[Math.floor(Math.random() * subArray.length)];
    
    emoticons.push({
      id,
      url: `https://images.unsplash.com/photo-${1578662996442 + i}?ixlib=rb-4.0.3&w=200&h=200&fit=crop`,
      category,
      subcategory,
      tags: [category, subcategory],
      title: `${category} ${subcategory} ${id}`,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60) // Stagger creation times
    });
  }
  
  return emoticons;
};

export const filterEmoticons = (
  emoticons: Emoticon[], 
  query: string, 
  category?: string, 
  subcategory?: string
): Emoticon[] => {
  return emoticons.filter(emoticon => {
    const matchesQuery = !query || 
      emoticon.title?.toLowerCase().includes(query.toLowerCase()) ||
      emoticon.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
    
    const matchesCategory = !category || emoticon.category === category;
    const matchesSubcategory = !subcategory || emoticon.subcategory === subcategory;
    
    return matchesQuery && matchesCategory && matchesSubcategory;
  });
};

export const getEmoticonsByCategory = (emoticons: Emoticon[], category: string): Emoticon[] => {
  return emoticons.filter(emoticon => emoticon.category === category);
};

export const getEmoticonsBySubcategory = (emoticons: Emoticon[], subcategory: string): Emoticon[] => {
  return emoticons.filter(emoticon => emoticon.subcategory === subcategory);
};
