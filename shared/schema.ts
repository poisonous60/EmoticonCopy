import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const emoticons = pgTable("emoticons", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  category: text("category").notNull(), // 디시콘, 아카콘, 카톡이모티콘, 기타
  subcategory: text("subcategory"), // 게임, 영상, 캐릭터, etc.
  tags: text("tags").array().default([]),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emoticonRelations = {
  // Add relations here if needed in the future
};

export const insertEmoticonSchema = createInsertSchema(emoticons).omit({
  id: true,
  createdAt: true,
});

export type InsertEmoticon = z.infer<typeof insertEmoticonSchema>;
export type Emoticon = typeof emoticons.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
