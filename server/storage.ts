import { emoticons, users, type Emoticon, type InsertEmoticon, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getEmoticons(offset?: number, limit?: number, category?: string, subcategory?: string): Promise<Emoticon[]>;
  getEmoticonById(id: number): Promise<Emoticon | undefined>;
  createEmoticon(emoticon: InsertEmoticon): Promise<Emoticon>;
  searchEmoticons(query: string, offset?: number, limit?: number): Promise<Emoticon[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emoticons: Map<number, Emoticon>;
  private currentUserId: number;
  private currentEmoticonId: number;

  constructor() {
    this.users = new Map();
    this.emoticons = new Map();
    this.currentUserId = 1;
    this.currentEmoticonId = 1;
    
    // Initialize with sample emoticons
    this.initializeEmoticons();
  }

  private initializeEmoticons() {
    const sampleEmoticons: Omit<Emoticon, 'id'>[] = [
      // 디시콘 - 게임
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "디시콘", subcategory: "게임", tags: ["게임", "재미"], title: "게임 이모티콘", createdAt: new Date() },
      { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "디시콘", subcategory: "게임", tags: ["게임", "캐릭터"], title: "게이밍 캐릭터", createdAt: new Date() },
      
      // 디시콘 - 영상
      { url: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "디시콘", subcategory: "영상", tags: ["영상", "밈"], title: "영상 밈", createdAt: new Date() },
      
      // 아카콘 - 아프리카TV
      { url: "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "아카콘", subcategory: "아프리카TV", tags: ["방송", "리액션"], title: "방송 리액션", createdAt: new Date() },
      
      // 카톡이모티콘 - 캐릭터
      { url: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "카톡이모티콘", subcategory: "캐릭터", tags: ["귀여운", "캐릭터"], title: "귀여운 캐릭터", createdAt: new Date() },
      
      // Additional emoticons for variety
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=200&h=200&fit=crop&auto=format&q=80&ixid=eyJhcHBfaWQiOjEyMDd9", category: "디시콘", subcategory: "캐릭터", tags: ["웃음", "행복"], title: "웃는 얼굴", createdAt: new Date() },
      { url: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&w=200&h=200&fit=crop&auto=format&q=80&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", category: "기타", subcategory: "인터넷 밈", tags: ["밈", "재미"], title: "인터넷 밈", createdAt: new Date() },
      { url: "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?ixlib=rb-4.0.3&w=200&h=200&fit=crop&auto=format&q=80", category: "카톡이모티콘", subcategory: "동물", tags: ["동물", "귀여운"], title: "귀여운 동물", createdAt: new Date() },
    ];

    sampleEmoticons.forEach((emoticon) => {
      const id = this.currentEmoticonId++;
      this.emoticons.set(id, { ...emoticon, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getEmoticons(offset = 0, limit = 20, category?: string, subcategory?: string): Promise<Emoticon[]> {
    let filtered = Array.from(this.emoticons.values());
    
    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }
    
    if (subcategory) {
      filtered = filtered.filter(e => e.subcategory === subcategory);
    }
    
    return filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async getEmoticonById(id: number): Promise<Emoticon | undefined> {
    return this.emoticons.get(id);
  }

  async createEmoticon(insertEmoticon: InsertEmoticon): Promise<Emoticon> {
    const id = this.currentEmoticonId++;
    const emoticon: Emoticon = { 
      ...insertEmoticon, 
      id,
      createdAt: new Date()
    };
    this.emoticons.set(id, emoticon);
    return emoticon;
  }

  async searchEmoticons(query: string, offset = 0, limit = 20): Promise<Emoticon[]> {
    const filtered = Array.from(this.emoticons.values()).filter(emoticon => 
      emoticon.title?.toLowerCase().includes(query.toLowerCase()) ||
      emoticon.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      emoticon.category.toLowerCase().includes(query.toLowerCase()) ||
      emoticon.subcategory.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }
}

export const storage = new MemStorage();
