import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";
import { insertEmoticonSchema } from "@shared/schema";
import { z } from "zod";
import { seedDatabase } from "./seed";

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static('uploads'));
  
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

  // Create new emoticon with file upload
  app.post("/api/emoticons", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      const { category = "기타", subcategory, title, tags } = req.body;
      
      const emoticon = await storage.createEmoticon({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        category,
        subcategory: subcategory || null,
        title: title || req.file.originalname.split('.')[0],
        tags: tags ? JSON.parse(tags) : [req.file.originalname.split('.')[0].toLowerCase()],
      });
      
      res.status(201).json(emoticon);
    } catch (error) {
      console.error("Error creating emoticon:", error);
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

  // Seed database route
  app.post("/api/seed", async (req, res) => {
    try {
      await seedDatabase();
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seeding error:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
