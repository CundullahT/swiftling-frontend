import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  learningLanguage: text("learning_language").default("Spanish"),
  proficiencyLevel: text("proficiency_level").default("Beginner"),
  streakDays: integer("streak_days").default(0),
  dailyGoalMinutes: integer("daily_goal_minutes").default(15),
});

export const phrases = pgTable("phrases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  phrase: text("phrase").notNull(),
  translation: text("translation").notNull(),
  category: text("category").notNull(),
  notes: text("notes"),
  context: text("context"),
  proficiency: integer("proficiency").default(0),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  learningLanguage: true,
});

export const insertPhraseSchema = createInsertSchema(phrases).pick({
  phrase: true,
  translation: true,
  category: true,
  notes: true,
  context: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPhrase = z.infer<typeof insertPhraseSchema>;
export type Phrase = typeof phrases.$inferSelect;
