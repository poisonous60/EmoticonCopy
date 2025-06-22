import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmoticonSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get emoticons with optional filtering
  app.get("/api/emoticons", async (req, res) => {
    try {
      const { offset = "0", limit = "20", category, subcategory, search } = req.query;
      
      let emoticons;
      if (search) {
        emoticons = await storage.searchEmoticons(
          search as string,
          parseInt(offset as string),
          parseInt(limit as string)
        );
      } else {
        emoticons = await storage.getEmoticons(
          parseInt(offset as string),
          parseInt(limit as string),
          category as string,
          subcategory as string
        );
      }
      
      res.json(emoticons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emoticons" });
    }
  });

  // Get single emoticon
  app.get("/api/emoticons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const emoticon = await storage.getEmoticonById(id);
      
      if (!emoticon) {
        return res.status(404).json({ error: "Emoticon not found" });
      }
      
      res.json(emoticon);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emoticon" });
    }
  });

  // Create new emoticon
  app.post("/api/emoticons", async (req, res) => {
    try {
      const validatedData = insertEmoticonSchema.parse(req.body);
      const emoticon = await storage.createEmoticon(validatedData);
      res.status(201).json(emoticon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create emoticon" });
    }
  });

  // Get categories (for sidebar)
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = {
        "디시콘": ["게임", "영상", "캐릭터", "기타"],
        "아카콘": ["아프리카TV", "트위치", "유튜브"],
        "카톡이모티콘": ["캐릭터", "동물", "브랜드"],
        "기타": ["인터넷 밈", "반응 짤", "움짤"]
      };
      
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
