import { emoticons, users, type Emoticon, type InsertEmoticon, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, desc, and } from "drizzle-orm";

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
    const sampleEmoticons: Array<{
      url: string;
      category: string;
      subcategory: string;
      tags: string[];
      title: string;
    }> = [
      // 디시콘 - 게임
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "디시콘", subcategory: "게임", tags: ["게임", "재미"], title: "게임 이모티콘" },
      { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "디시콘", subcategory: "게임", tags: ["게임", "캐릭터"], title: "게이밍 캐릭터" },
      { url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "디시콘", subcategory: "게임", tags: ["게임", "액션"], title: "액션 게임" },
      
      // 디시콘 - 영상
      { url: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "디시콘", subcategory: "영상", tags: ["영상", "밈"], title: "영상 밈" },
      { url: "https://images.unsplash.com/photo-1574068468668-a05a11f871da?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "디시콘", subcategory: "영상", tags: ["영상", "웃김"], title: "웃긴 영상" },
      
      // 디시콘 - 캐릭터
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=200&h=200&fit=crop&sig=1", category: "디시콘", subcategory: "캐릭터", tags: ["웃음", "행복"], title: "웃는 얼굴" },
      { url: "https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "디시콘", subcategory: "캐릭터", tags: ["캐릭터", "귀여움"], title: "귀여운 캐릭터" },
      
      // 아카콘 - 아프리카TV
      { url: "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "아카콘", subcategory: "아프리카TV", tags: ["방송", "리액션"], title: "방송 리액션" },
      { url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "아카콘", subcategory: "아프리카TV", tags: ["스트리밍", "방송"], title: "스트리밍" },
      
      // 아카콘 - 트위치
      { url: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "아카콘", subcategory: "트위치", tags: ["트위치", "게임"], title: "트위치 게임" },
      { url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "아카콘", subcategory: "트위치", tags: ["스트리머", "반응"], title: "스트리머 반응" },
      
      // 카톡이모티콘 - 캐릭터
      { url: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "카톡이모티콘", subcategory: "캐릭터", tags: ["귀여운", "캐릭터"], title: "귀여운 캐릭터" },
      { url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "카톡이모티콘", subcategory: "동물", tags: ["고양이", "귀여운"], title: "귀여운 고양이" },
      { url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "카톡이모티콘", subcategory: "동물", tags: ["강아지", "귀여운"], title: "귀여운 강아지" },
      
      // 기타 - 인터넷 밈
      { url: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&w=200&h=200&fit=crop&sig=2", category: "기타", subcategory: "인터넷 밈", tags: ["밈", "재미"], title: "인터넷 밈" },
      { url: "https://images.unsplash.com/photo-1574068468668-a05a11f871da?ixlib=rb-4.0.3&w=200&h=200&fit=crop&sig=1", category: "기타", subcategory: "반응 짤", tags: ["반응", "웃김"], title: "반응 짤" },
      
      // More emoticons for testing grid layout
      { url: "https://images.unsplash.com/photo-1526660690293-f5d24c6d4d19?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "디시콘", subcategory: "기타", tags: ["기타", "디시"], title: "디시 기타" },
      { url: "https://images.unsplash.com/photo-1572635196184-84e35138cf62?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "아카콘", subcategory: "유튜브", tags: ["유튜브", "영상"], title: "유튜브 영상" },
      { url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "카톡이모티콘", subcategory: "브랜드", tags: ["브랜드", "로고"], title: "브랜드 로고" },
      { url: "https://images.unsplash.com/photo-1546422401-d022f9a79e30?ixlib=rb-4.0.3&w=200&h=200&fit=crop", category: "기타", subcategory: "움짤", tags: ["움짤", "애니메이션"], title: "움짤 애니메이션" },
    ];

    sampleEmoticons.forEach((emoticon) => {
      const id = this.currentEmoticonId++;
      const fullEmoticon: Emoticon = {
        ...emoticon,
        id,
        createdAt: new Date(Date.now() - id * 1000 * 60),
      };
      this.emoticons.set(id, fullEmoticon);
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
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(offset, offset + limit);
  }

  async getEmoticonById(id: number): Promise<Emoticon | undefined> {
    return this.emoticons.get(id);
  }

  async createEmoticon(insertEmoticon: InsertEmoticon): Promise<Emoticon> {
    const id = this.currentEmoticonId++;
    const emoticon: Emoticon = { 
      id,
      url: insertEmoticon.url,
      category: insertEmoticon.category,
      subcategory: insertEmoticon.subcategory,
      tags: insertEmoticon.tags || null,
      title: insertEmoticon.title || null,
      createdAt: new Date()
    };
    this.emoticons.set(id, emoticon);
    return emoticon;
  }

  async searchEmoticons(query: string, offset = 0, limit = 20): Promise<Emoticon[]> {
    const filtered = Array.from(this.emoticons.values()).filter(emoticon => 
      emoticon.title?.toLowerCase().includes(query.toLowerCase()) ||
      (emoticon.tags && emoticon.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) ||
      emoticon.category.toLowerCase().includes(query.toLowerCase()) ||
      emoticon.subcategory.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(offset, offset + limit);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getEmoticons(offset = 0, limit = 20, category?: string, subcategory?: string): Promise<Emoticon[]> {
    let query = db.select().from(emoticons);
    
    if (category && subcategory) {
      query = query.where(and(eq(emoticons.category, category), eq(emoticons.subcategory, subcategory)));
    } else if (category) {
      query = query.where(eq(emoticons.category, category));
    } else if (subcategory) {
      query = query.where(eq(emoticons.subcategory, subcategory));
    }
    
    const result = await query
      .orderBy(desc(emoticons.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result;
  }

  async getEmoticonById(id: number): Promise<Emoticon | undefined> {
    const [emoticon] = await db.select().from(emoticons).where(eq(emoticons.id, id));
    return emoticon || undefined;
  }

  async createEmoticon(insertEmoticon: InsertEmoticon): Promise<Emoticon> {
    const [emoticon] = await db
      .insert(emoticons)
      .values(insertEmoticon)
      .returning();
    return emoticon;
  }

  async searchEmoticons(query: string, offset = 0, limit = 20): Promise<Emoticon[]> {
    const searchPattern = `%${query.toLowerCase()}%`;
    
    const result = await db
      .select()
      .from(emoticons)
      .where(
        or(
          ilike(emoticons.title, searchPattern),
          ilike(emoticons.category, searchPattern),
          ilike(emoticons.subcategory, searchPattern)
        )
      )
      .orderBy(desc(emoticons.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result;
  }
}

export const storage = new DatabaseStorage();
