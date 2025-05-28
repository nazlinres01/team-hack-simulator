import { 
  User, InsertUser, Team, InsertTeam, TeamMember, InsertTeamMember,
  Challenge, InsertChallenge, ChallengeAttempt, InsertChallengeAttempt,
  GameRoom, InsertGameRoom, TeamWithMembers, ChallengeWithAttempts, UserWithTeam
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getTeamWithMembers(id: number): Promise<TeamWithMembers | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, updates: Partial<Team>): Promise<Team | undefined>;
  getTeamsByUser(userId: number): Promise<Team[]>;
  getLeaderboard(): Promise<Team[]>;
  
  // Team member operations
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: number, userId: number): Promise<boolean>;
  getTeamMembers(teamId: number): Promise<(TeamMember & { user: User })[]>;
  getUserTeam(userId: number): Promise<TeamWithMembers | undefined>;
  
  // Challenge operations
  getChallenge(id: number): Promise<Challenge | undefined>;
  getChallengeWithAttempts(id: number): Promise<ChallengeWithAttempts | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getActiveChallenges(): Promise<ChallengeWithAttempts[]>;
  getChallengesByType(type: string): Promise<Challenge[]>;
  
  // Challenge attempt operations
  createChallengeAttempt(attempt: InsertChallengeAttempt): Promise<ChallengeAttempt>;
  updateChallengeAttempt(id: number, updates: Partial<ChallengeAttempt>): Promise<ChallengeAttempt | undefined>;
  getUserAttempts(userId: number): Promise<ChallengeAttempt[]>;
  getTeamAttempts(teamId: number): Promise<ChallengeAttempt[]>;
  
  // Game room operations
  createGameRoom(room: InsertGameRoom): Promise<GameRoom>;
  getGameRoom(id: number): Promise<GameRoom | undefined>;
  updateGameRoom(id: number, updates: Partial<GameRoom>): Promise<GameRoom | undefined>;
  getActiveGameRooms(): Promise<GameRoom[]>;
  
  // Analytics and scoring
  calculateTeamCompatibility(teamId: number): Promise<number>;
  updateTeamStats(teamId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private teams: Map<number, Team> = new Map();
  private teamMembers: Map<number, TeamMember> = new Map();
  private challenges: Map<number, Challenge> = new Map();
  private challengeAttempts: Map<number, ChallengeAttempt> = new Map();
  private gameRooms: Map<number, GameRoom> = new Map();
  
  private currentUserId = 1;
  private currentTeamId = 1;
  private currentTeamMemberId = 1;
  private currentChallengeId = 1;
  private currentAttemptId = 1;
  private currentRoomId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create sample challenges
    const sampleChallenges = [
      {
        title: "Code Debug Rally",
        description: "Fix syntax errors fast!",
        type: "code",
        difficulty: "easy",
        points: 200,
        timeLimit: 180,
        content: {
          code: `function calculateTotal(items) {\n  let total = 0\n  for (let i=0; i<items.length; i++) {\n    total += items[i].price\n  }\n}`,
          errors: ["Missing semicolons", "Missing return statement"],
          correctCode: `function calculateTotal(items) {\n  let total = 0;\n  for (let i=0; i<items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}`
        }
      },
      {
        title: "Quick Wire Frame",
        description: "Design a mobile login screen",
        type: "wireframe",
        difficulty: "medium",
        points: 150,
        timeLimit: 300,
        content: {
          requirements: ["Login form", "Social login options", "Forgot password link", "Sign up button"],
          constraints: { width: 375, height: 667 }
        }
      },
      {
        title: "Algorithm Race",
        description: "Optimize sorting performance",
        type: "algorithm",
        difficulty: "hard",
        points: 300,
        timeLimit: 600,
        content: {
          problem: "Sort an array of 10,000 integers in the most efficient way possible",
          testCases: [
            { input: [3, 1, 4, 1, 5], output: [1, 1, 3, 4, 5] },
            { input: [9, 8, 7, 6, 5], output: [5, 6, 7, 8, 9] }
          ]
        }
      }
    ];

    sampleChallenges.forEach(challenge => {
      this.createChallenge(challenge as InsertChallenge);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      totalPoints: 0,
      avatar: insertUser.avatar || null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamWithMembers(id: number): Promise<TeamWithMembers | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;

    const members = await this.getTeamMembers(id);
    const leader = this.users.get(team.leaderId);
    if (!leader) return undefined;

    return { ...team, members, leader };
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const team: Team = {
      ...insertTeam,
      id: this.currentTeamId++,
      compatibilityScore: 0,
      totalScore: 0,
      challengesWon: 0,
      streak: 0,
      rank: 0,
      createdAt: new Date(),
    };
    this.teams.set(team.id, team);
    
    // Add leader as team member
    await this.addTeamMember({
      teamId: team.id,
      userId: team.leaderId,
      role: "leader",
      specialty: "management"
    });
    
    return team;
  }

  async updateTeam(id: number, updates: Partial<Team>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;
    
    const updatedTeam = { ...team, ...updates };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async getTeamsByUser(userId: number): Promise<Team[]> {
    const userTeamMembers = Array.from(this.teamMembers.values())
      .filter(member => member.userId === userId);
    
    return userTeamMembers
      .map(member => this.teams.get(member.teamId))
      .filter(team => team !== undefined) as Team[];
  }

  async getLeaderboard(): Promise<Team[]> {
    return Array.from(this.teams.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((team, index) => ({ ...team, rank: index + 1 }));
  }

  // Team member operations
  async addTeamMember(insertMember: InsertTeamMember): Promise<TeamMember> {
    const member: TeamMember = {
      ...insertMember,
      id: this.currentTeamMemberId++,
      joinedAt: new Date(),
    };
    this.teamMembers.set(member.id, member);
    
    // Update team compatibility score
    await this.calculateTeamCompatibility(member.teamId);
    
    return member;
  }

  async removeTeamMember(teamId: number, userId: number): Promise<boolean> {
    const member = Array.from(this.teamMembers.values())
      .find(m => m.teamId === teamId && m.userId === userId);
    
    if (!member) return false;
    
    this.teamMembers.delete(member.id);
    await this.calculateTeamCompatibility(teamId);
    return true;
  }

  async getTeamMembers(teamId: number): Promise<(TeamMember & { user: User })[]> {
    const members = Array.from(this.teamMembers.values())
      .filter(member => member.teamId === teamId);
    
    return members
      .map(member => {
        const user = this.users.get(member.userId);
        return user ? { ...member, user } : null;
      })
      .filter(member => member !== null) as (TeamMember & { user: User })[];
  }

  async getUserTeam(userId: number): Promise<TeamWithMembers | undefined> {
    const member = Array.from(this.teamMembers.values())
      .find(m => m.userId === userId);
    
    if (!member) return undefined;
    
    return this.getTeamWithMembers(member.teamId);
  }

  // Challenge operations
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async getChallengeWithAttempts(id: number): Promise<ChallengeWithAttempts | undefined> {
    const challenge = this.challenges.get(id);
    if (!challenge) return undefined;

    const attempts = Array.from(this.challengeAttempts.values())
      .filter(attempt => attempt.challengeId === id);
    
    const activeParticipants = attempts.filter(attempt => attempt.status === 'in_progress').length;

    return { ...challenge, attempts, activeParticipants };
  }

  async createChallenge(insertChallenge: InsertChallenge): Promise<Challenge> {
    const challenge: Challenge = {
      ...insertChallenge,
      id: this.currentChallengeId++,
      isActive: true,
      createdAt: new Date(),
    };
    this.challenges.set(challenge.id, challenge);
    return challenge;
  }

  async getActiveChallenges(): Promise<ChallengeWithAttempts[]> {
    const activeChallenges = Array.from(this.challenges.values())
      .filter(challenge => challenge.isActive);
    
    const challengesWithAttempts = await Promise.all(
      activeChallenges.map(async challenge => {
        const attempts = Array.from(this.challengeAttempts.values())
          .filter(attempt => attempt.challengeId === challenge.id);
        const activeParticipants = attempts.filter(attempt => attempt.status === 'in_progress').length;
        return { ...challenge, attempts, activeParticipants };
      })
    );

    return challengesWithAttempts;
  }

  async getChallengesByType(type: string): Promise<Challenge[]> {
    return Array.from(this.challenges.values())
      .filter(challenge => challenge.type === type && challenge.isActive);
  }

  // Challenge attempt operations
  async createChallengeAttempt(insertAttempt: InsertChallengeAttempt): Promise<ChallengeAttempt> {
    const attempt: ChallengeAttempt = {
      ...insertAttempt,
      id: this.currentAttemptId++,
      score: 0,
      startedAt: new Date(),
      completedAt: null,
    };
    this.challengeAttempts.set(attempt.id, attempt);
    return attempt;
  }

  async updateChallengeAttempt(id: number, updates: Partial<ChallengeAttempt>): Promise<ChallengeAttempt | undefined> {
    const attempt = this.challengeAttempts.get(id);
    if (!attempt) return undefined;
    
    const updatedAttempt = { ...attempt, ...updates };
    if (updates.status === 'completed' && !attempt.completedAt) {
      updatedAttempt.completedAt = new Date();
    }
    
    this.challengeAttempts.set(id, updatedAttempt);
    
    // Update team stats if challenge completed
    if (updates.status === 'completed') {
      await this.updateTeamStats(attempt.teamId);
    }
    
    return updatedAttempt;
  }

  async getUserAttempts(userId: number): Promise<ChallengeAttempt[]> {
    return Array.from(this.challengeAttempts.values())
      .filter(attempt => attempt.userId === userId);
  }

  async getTeamAttempts(teamId: number): Promise<ChallengeAttempt[]> {
    return Array.from(this.challengeAttempts.values())
      .filter(attempt => attempt.teamId === teamId);
  }

  // Game room operations
  async createGameRoom(insertRoom: InsertGameRoom): Promise<GameRoom> {
    const room: GameRoom = {
      ...insertRoom,
      id: this.currentRoomId++,
      createdAt: new Date(),
    };
    this.gameRooms.set(room.id, room);
    return room;
  }

  async getGameRoom(id: number): Promise<GameRoom | undefined> {
    return this.gameRooms.get(id);
  }

  async updateGameRoom(id: number, updates: Partial<GameRoom>): Promise<GameRoom | undefined> {
    const room = this.gameRooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.gameRooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async getActiveGameRooms(): Promise<GameRoom[]> {
    return Array.from(this.gameRooms.values())
      .filter(room => room.status === 'active' || room.status === 'waiting');
  }

  // Analytics and scoring
  async calculateTeamCompatibility(teamId: number): Promise<number> {
    const members = await this.getTeamMembers(teamId);
    
    if (members.length < 2) return 50;
    
    // Simple compatibility algorithm based on diverse skills and performance
    const specialties = new Set(members.map(m => m.specialty));
    const diversityScore = (specialties.size / members.length) * 100;
    
    // Factor in team performance
    const attempts = await this.getTeamAttempts(teamId);
    const completedAttempts = attempts.filter(a => a.status === 'completed');
    const successRate = completedAttempts.length > 0 ? 
      (completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length) / 100 : 50;
    
    const compatibilityScore = Math.round((diversityScore + successRate) / 2);
    
    await this.updateTeam(teamId, { compatibilityScore });
    return compatibilityScore;
  }

  async updateTeamStats(teamId: number): Promise<void> {
    const attempts = await this.getTeamAttempts(teamId);
    const completedAttempts = attempts.filter(a => a.status === 'completed');
    
    const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const challengesWon = completedAttempts.filter(a => (a.score || 0) >= 80).length;
    
    // Calculate streak (consecutive days with completed challenges)
    const recentAttempts = completedAttempts
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const attempt of recentAttempts) {
      const attemptDate = new Date(attempt.completedAt || 0);
      attemptDate.setHours(0, 0, 0, 0);
      
      if (attemptDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    await this.updateTeam(teamId, { totalScore, challengesWon, streak });
  }
}

export const storage = new MemStorage();
