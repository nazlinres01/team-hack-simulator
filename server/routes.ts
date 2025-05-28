import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertTeamSchema, insertChallengeAttemptSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket temporarily disabled in development to avoid conflicts with Vite
  if (process.env.NODE_ENV !== 'development') {
    const wss = new WebSocketServer({ 
      server: httpServer,
      path: '/api/ws'
    });
    
    wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('WebSocket message received:', data.type);
          
          // Broadcast to all connected clients for real-time updates
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify(data));
            }
          });
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user", error });
    }
  });

  app.get("/api/users/:id/team", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const team = await storage.getUserTeam(userId);
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user team", error });
    }
  });

  // Team routes
  app.post("/api/teams", async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(teamData);
      const teamWithMembers = await storage.getTeamWithMembers(team.id);
      res.json(teamWithMembers);
    } catch (error) {
      res.status(400).json({ message: "Invalid team data", error });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeamWithMembers(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to get team", error });
    }
  });

  app.post("/api/teams/:id/members", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const { userId, role, specialty } = req.body;
      
      const member = await storage.addTeamMember({
        teamId,
        userId,
        role: role || "member",
        specialty: specialty || "general"
      });
      
      res.json(member);
    } catch (error) {
      res.status(400).json({ message: "Failed to add team member", error });
    }
  });

  app.delete("/api/teams/:teamId/members/:userId", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const userId = parseInt(req.params.userId);
      
      const success = await storage.removeTeamMember(teamId, userId);
      if (!success) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove team member", error });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard", error });
    }
  });

  // Challenge routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const { type } = req.query;
      
      if (type) {
        const challenges = await storage.getChallengesByType(type as string);
        res.json(challenges);
      } else {
        const challenges = await storage.getActiveChallenges();
        res.json(challenges);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get challenges", error });
    }
  });

  app.get("/api/challenges/:id", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallengeWithAttempts(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: "Failed to get challenge", error });
    }
  });

  // Challenge attempt routes
  app.post("/api/challenges/:id/attempts", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const attemptData = {
        ...req.body,
        challengeId,
        status: 'in_progress'
      };
      
      const validatedData = insertChallengeAttemptSchema.parse(attemptData);
      const attempt = await storage.createChallengeAttempt(validatedData);
      res.json(attempt);
    } catch (error) {
      res.status(400).json({ message: "Failed to start challenge", error });
    }
  });

  app.patch("/api/attempts/:id", async (req, res) => {
    try {
      const attemptId = parseInt(req.params.id);
      const updates = req.body;
      
      const attempt = await storage.updateChallengeAttempt(attemptId, updates);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      
      // Broadcast real-time update
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'attempt_updated',
            data: attempt
          }));
        }
      });
      
      res.json(attempt);
    } catch (error) {
      res.status(500).json({ message: "Failed to update attempt", error });
    }
  });

  app.get("/api/users/:id/attempts", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const attempts = await storage.getUserAttempts(userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user attempts", error });
    }
  });

  app.get("/api/teams/:id/attempts", async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const attempts = await storage.getTeamAttempts(teamId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get team attempts", error });
    }
  });

  // Game room routes
  app.post("/api/game-rooms", async (req, res) => {
    try {
      const roomData = req.body;
      const room = await storage.createGameRoom(roomData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: "Failed to create game room", error });
    }
  });

  app.get("/api/game-rooms/:id", async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const room = await storage.getGameRoom(roomId);
      
      if (!room) {
        return res.status(404).json({ message: "Game room not found" });
      }
      
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game room", error });
    }
  });

  app.patch("/api/game-rooms/:id", async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const updates = req.body;
      
      const room = await storage.updateGameRoom(roomId, updates);
      if (!room) {
        return res.status(404).json({ message: "Game room not found" });
      }
      
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game room", error });
    }
  });

  app.get("/api/game-rooms", async (req, res) => {
    try {
      const rooms = await storage.getActiveGameRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game rooms", error });
    }
  });

  // AI scoring simulation
  app.post("/api/ai/score-solution", async (req, res) => {
    try {
      const { challengeType, solution, challengeContent } = req.body;
      
      // Simulate AI scoring based on challenge type
      let score = 0;
      const feedback: string[] = [];
      
      if (challengeType === 'code') {
        // Simple code evaluation
        const { code } = solution;
        const { correctCode } = challengeContent;
        
        if (code && correctCode) {
          // Basic similarity check
          const similarity = calculateSimilarity(code, correctCode);
          score = Math.round(similarity * 100);
          
          if (score >= 90) {
            feedback.push("Excellent! Code is correct and well-formatted.");
          } else if (score >= 70) {
            feedback.push("Good solution with minor issues.");
          } else {
            feedback.push("Solution needs improvement. Check syntax and logic.");
          }
        }
      } else if (challengeType === 'wireframe') {
        // Wireframe evaluation based on requirements
        const { elements } = solution;
        const { requirements } = challengeContent;
        
        if (elements && requirements) {
          const completedReqs = requirements.filter((req: string) => 
            elements.some((el: any) => el.type?.toLowerCase().includes(req.toLowerCase()))
          );
          score = Math.round((completedReqs.length / requirements.length) * 100);
          
          feedback.push(`Completed ${completedReqs.length}/${requirements.length} requirements.`);
        }
      } else {
        // Default scoring for other challenges
        score = Math.floor(Math.random() * 40) + 60; // 60-100 range
        feedback.push("Solution evaluated successfully.");
      }
      
      res.json({ score, feedback });
    } catch (error) {
      res.status(500).json({ message: "AI scoring failed", error });
    }
  });

  return httpServer;
}

// Helper function for code similarity
function calculateSimilarity(code1: string, code2: string): number {
  const normalize = (code: string) => code.replace(/\s+/g, ' ').trim().toLowerCase();
  const norm1 = normalize(code1);
  const norm2 = normalize(code2);
  
  if (norm1 === norm2) return 1.0;
  
  // Simple similarity based on common words
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  
  return commonWords.length / Math.max(words1.length, words2.length);
}
