import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  totalPoints: integer("total_points").default(0),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  leaderId: integer("leader_id").notNull(),
  compatibilityScore: integer("compatibility_score").default(0),
  totalScore: integer("total_score").default(0),
  challengesWon: integer("challenges_won").default(0),
  streak: integer("streak").default(0),
  rank: integer("rank").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(),
  specialty: text("specialty"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'code', 'wireframe', 'algorithm', 'api', 'database', 'test'
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  points: integer("points").notNull(),
  timeLimit: integer("time_limit"), // in seconds
  content: jsonb("content"), // challenge-specific data
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeAttempts = pgTable("challenge_attempts", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  teamId: integer("team_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // 'in_progress', 'completed', 'failed', 'abandoned'
  score: integer("score").default(0),
  timeSpent: integer("time_spent"), // in seconds
  solution: jsonb("solution"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const gameRooms = pgTable("game_rooms", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  teamId: integer("team_id").notNull(),
  status: text("status").notNull(), // 'waiting', 'active', 'completed'
  participants: jsonb("participants"), // array of user IDs
  gameState: jsonb("game_state"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  totalPoints: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  compatibilityScore: true,
  totalScore: true,
  challengesWon: true,
  streak: true,
  rank: true,
  createdAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertChallengeAttemptSchema = createInsertSchema(challengeAttempts).omit({
  id: true,
  score: true,
  startedAt: true,
  completedAt: true,
});

export const insertGameRoomSchema = createInsertSchema(gameRooms).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type ChallengeAttempt = typeof challengeAttempts.$inferSelect;
export type InsertChallengeAttempt = z.infer<typeof insertChallengeAttemptSchema>;

export type GameRoom = typeof gameRooms.$inferSelect;
export type InsertGameRoom = z.infer<typeof insertGameRoomSchema>;

// Extended types for API responses
export type TeamWithMembers = Team & {
  members: (TeamMember & { user: User })[];
  leader: User;
};

export type ChallengeWithAttempts = Challenge & {
  attempts: ChallengeAttempt[];
  activeParticipants?: number;
};

export type UserWithTeam = User & {
  teamMember?: TeamMember & { team: Team };
};
