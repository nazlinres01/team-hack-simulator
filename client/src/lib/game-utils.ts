import type { Challenge, ChallengeAttempt, Team, User } from "@shared/schema";

export interface GameStats {
  totalScore: number;
  challengesCompleted: number;
  averageScore: number;
  streakDays: number;
  rank: number;
}

export interface PerformanceMetrics {
  codeAccuracy: number;
  designQuality: number;
  algorithmEfficiency: number;
  collaborationScore: number;
}

export interface LeaderboardEntry {
  team: Team;
  position: number;
  scoreChange: number;
  isCurrentTeam?: boolean;
}

/**
 * Calculate AI-based team compatibility score
 */
export function calculateTeamCompatibility(members: any[], recentAttempts: ChallengeAttempt[]): number {
  if (members.length < 2) return 50;

  // Diversity factor (different specialties)
  const specialties = new Set(members.map(m => m.specialty));
  const diversityScore = (specialties.size / members.length) * 100;

  // Performance factor (recent success rate)
  const completedAttempts = recentAttempts.filter(a => a.status === 'completed');
  const successRate = completedAttempts.length > 0 
    ? (completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length) 
    : 50;

  // Collaboration factor (team participation)
  const activeMembers = new Set(recentAttempts.map(a => a.userId)).size;
  const participationRate = (activeMembers / members.length) * 100;

  // Weighted combination
  return Math.round((diversityScore * 0.3 + successRate * 0.4 + participationRate * 0.3));
}

/**
 * Generate AI scoring for different challenge types
 */
export function generateAIScore(challengeType: string, solution: any, challengeContent: any): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;

  switch (challengeType) {
    case 'code':
      score = scoreCodeChallenge(solution, challengeContent, feedback);
      break;
    case 'wireframe':
      score = scoreWireframeChallenge(solution, challengeContent, feedback);
      break;
    case 'algorithm':
      score = scoreAlgorithmChallenge(solution, challengeContent, feedback);
      break;
    case 'api':
      score = scoreApiChallenge(solution, challengeContent, feedback);
      break;
    case 'database':
      score = scoreDatabaseChallenge(solution, challengeContent, feedback);
      break;
    case 'test':
      score = scoreTestChallenge(solution, challengeContent, feedback);
      break;
    default:
      score = 70 + Math.floor(Math.random() * 30); // 70-100 range
      feedback.push("Solution evaluated with general criteria.");
  }

  return { score: Math.max(0, Math.min(100, score)), feedback };
}

function scoreCodeChallenge(solution: any, challengeContent: any, feedback: string[]): number {
  const { code } = solution;
  const { correctCode, errors } = challengeContent;

  if (!code) {
    feedback.push("No code submitted.");
    return 0;
  }

  let score = 60; // Base score for attempting

  // Check syntax correctness
  const codeLines = code.split('\n').map((line: string) => line.trim());
  const correctLines = correctCode.split('\n').map((line: string) => line.trim());

  // Semicolon checks
  const missingSemicolons = codeLines.filter((line: string) => {
    return line && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') &&
           (line.includes('let ') || line.includes('const ') || line.includes('var ') || 
            line.includes('total +=') || line.includes('return '));
  });

  if (missingSemicolons.length === 0) {
    score += 15;
    feedback.push("✅ All semicolons correctly placed.");
  } else {
    feedback.push(`❌ Missing ${missingSemicolons.length} semicolon(s).`);
  }

  // Return statement check
  if (code.includes('function ') && code.includes('return ')) {
    score += 15;
    feedback.push("✅ Function includes return statement.");
  } else if (code.includes('function ')) {
    feedback.push("❌ Function missing return statement.");
  }

  // Code similarity to correct solution
  const similarity = calculateCodeSimilarity(code, correctCode);
  score += Math.round(similarity * 10); // Up to 10 points for similarity

  if (similarity > 0.9) {
    feedback.push("🎉 Excellent! Code matches expected solution.");
  } else if (similarity > 0.7) {
    feedback.push("👍 Good solution with minor differences.");
  } else {
    feedback.push("💡 Solution needs improvement. Check logic and syntax.");
  }

  return score;
}

function scoreWireframeChallenge(solution: any, challengeContent: any, feedback: string[]): number {
  const { elements } = solution;
  const { requirements } = challengeContent;

  if (!elements || elements.length === 0) {
    feedback.push("No wireframe elements created.");
    return 0;
  }

  let score = 40; // Base score for attempting

  // Check requirements fulfillment
  const elementTypes = elements.map((el: any) => el.type.toLowerCase());
  const elementLabels = elements.map((el: any) => (el.label || '').toLowerCase());

  let fulfilledRequirements = 0;

  requirements.forEach((req: string) => {
    const reqLower = req.toLowerCase();
    let satisfied = false;

    if (reqLower.includes('login') && reqLower.includes('form')) {
      satisfied = elementTypes.includes('input') && elementTypes.includes('button');
    } else if (reqLower.includes('button')) {
      satisfied = elementTypes.includes('button') || elementLabels.some(label => label.includes('button'));
    } else if (reqLower.includes('input') || reqLower.includes('field')) {
      satisfied = elementTypes.includes('input');
    } else if (reqLower.includes('text') || reqLower.includes('link')) {
      satisfied = elementTypes.includes('text') || elementLabels.some(label => label.includes(reqLower));
    } else {
      satisfied = elementLabels.some(label => label.includes(reqLower));
    }

    if (satisfied) {
      fulfilledRequirements++;
      feedback.push(`✅ Requirement fulfilled: ${req}`);
    } else {
      feedback.push(`❌ Missing requirement: ${req}`);
    }
  });

  // Score based on requirements fulfillment
  const requirementScore = (fulfilledRequirements / requirements.length) * 40;
  score += requirementScore;

  // Bonus points for good design practices
  if (elements.length >= 4) {
    score += 10;
    feedback.push("✅ Good element variety.");
  }

  if (elements.some((el: any) => el.type === 'input') && elements.some((el: any) => el.type === 'button')) {
    score += 10;
    feedback.push("✅ Proper form structure with inputs and buttons.");
  }

  return score;
}

function scoreAlgorithmChallenge(solution: any, challengeContent: any, feedback: string[]): number {
  const { code, approach } = solution;
  
  if (!code && !approach) {
    feedback.push("No solution provided.");
    return 0;
  }

  let score = 50; // Base score

  // Check if solution mentions sorting algorithms
  const text = (code || approach || '').toLowerCase();
  
  if (text.includes('quicksort') || text.includes('mergesort') || text.includes('heapsort')) {
    score += 25;
    feedback.push("✅ Efficient sorting algorithm identified.");
  } else if (text.includes('bubblesort') || text.includes('insertionsort')) {
    score += 10;
    feedback.push("⚠️ Basic sorting algorithm used - consider more efficient options.");
  }

  if (text.includes('o(n log n)') || text.includes('time complexity')) {
    score += 15;
    feedback.push("✅ Time complexity analysis provided.");
  }

  if (text.includes('optimization') || text.includes('efficient')) {
    score += 10;
    feedback.push("✅ Performance optimization considered.");
  }

  return score;
}

function scoreApiChallenge(solution: any, challengeContent: any, feedback: string[]): number {
  const { endpoints, documentation } = solution;
  
  if (!endpoints) {
    feedback.push("No API endpoints defined.");
    return 0;
  }

  let score = 40;

  // Check HTTP methods
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const usedMethods = methods.filter(method => 
    JSON.stringify(endpoints).includes(method)
  );

  score += usedMethods.length * 10;
  feedback.push(`✅ ${usedMethods.length}/4 HTTP methods used: ${usedMethods.join(', ')}`);

  // Check RESTful patterns
  if (JSON.stringify(endpoints).includes('/api/')) {
    score += 10;
    feedback.push("✅ RESTful API structure followed.");
  }

  // Check documentation quality
  if (documentation && documentation.length > 50) {
    score += 20;
    feedback.push("✅ Comprehensive API documentation provided.");
  }

  return score;
}

function scoreDatabaseChallenge(solution: any, challengeContent: any, feedback: string[]): number {
  const { schema, relationships } = solution;
  
  if (!schema) {
    feedback.push("No database schema provided.");
    return 0;
  }

  let score = 50;

  // Check for tables
  const schemaText = JSON.stringify(schema).toLowerCase();
  
  if (schemaText.includes('users') || schemaText.includes('user')) {
    score += 15;
    feedback.push("✅ User table included.");
  }

  if (schemaText.includes('primary key') || schemaText.includes('id')) {
    score += 10;
    feedback.push("✅ Primary keys defined.");
  }

  if (schemaText.includes('foreign key') || schemaText.includes('references')) {
    score += 15;
    feedback.push("✅ Foreign key relationships established.");
  }

  if (relationships && relationships.length > 0) {
    score += 10;
    feedback.push("✅ Table relationships documented.");
  }

  return score;
}

function scoreTestChallenge(solution: any, challengeContent: any, feedback: string[]): number {
  const { testCases, coverage } = solution;
  
  if (!testCases) {
    feedback.push("No test cases provided.");
    return 0;
  }

  let score = 40;

  // Check test case variety
  const testText = JSON.stringify(testCases).toLowerCase();
  
  if (testText.includes('should')) {
    score += 15;
    feedback.push("✅ Descriptive test cases with 'should' statements.");
  }

  if (testText.includes('edge case') || testText.includes('boundary')) {
    score += 15;
    feedback.push("✅ Edge cases considered.");
  }

  if (testText.includes('expect') || testText.includes('assert')) {
    score += 15;
    feedback.push("✅ Proper assertions used.");
  }

  if (coverage && coverage > 80) {
    score += 15;
    feedback.push("✅ High test coverage achieved.");
  }

  return score;
}

function calculateCodeSimilarity(code1: string, code2: string): number {
  const normalize = (code: string) => 
    code.replace(/\s+/g, ' ').trim().toLowerCase();
  
  const norm1 = normalize(code1);
  const norm2 = normalize(code2);
  
  if (norm1 === norm2) return 1.0;
  
  // Simple similarity based on common tokens
  const tokens1 = norm1.split(/\W+/).filter(t => t.length > 0);
  const tokens2 = norm2.split(/\W+/).filter(t => t.length > 0);
  const commonTokens = tokens1.filter(token => tokens2.includes(token));
  
  return commonTokens.length / Math.max(tokens1.length, tokens2.length);
}

/**
 * Calculate time bonus based on completion speed
 */
export function calculateTimeBonus(timeSpent: number, timeLimit?: number): number {
  if (!timeLimit) return 0;
  
  const timeRatio = timeSpent / timeLimit;
  
  if (timeRatio <= 0.5) return 20; // Completed in first half
  if (timeRatio <= 0.75) return 10; // Completed in first 3/4
  if (timeRatio <= 1.0) return 5; // Completed within time limit
  
  return 0; // Overtime
}

/**
 * Generate performance insights for teams
 */
export function generatePerformanceInsights(attempts: ChallengeAttempt[]): PerformanceMetrics {
  const completedAttempts = attempts.filter(a => a.status === 'completed');
  
  if (completedAttempts.length === 0) {
    return {
      codeAccuracy: 0,
      designQuality: 0,
      algorithmEfficiency: 0,
      collaborationScore: 0
    };
  }

  // Group by challenge type
  const byType = completedAttempts.reduce((acc, attempt) => {
    // We would need challenge data to determine type, for now use mock data
    const type = 'code'; // This would come from joined data in real implementation
    if (!acc[type]) acc[type] = [];
    acc[type].push(attempt.score || 0);
    return acc;
  }, {} as Record<string, number[]>);

  const avgScore = (scores: number[]) => 
    scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

  return {
    codeAccuracy: avgScore(byType.code || []),
    designQuality: avgScore(byType.wireframe || []),
    algorithmEfficiency: avgScore(byType.algorithm || []),
    collaborationScore: Math.min(100, completedAttempts.length * 5) // Based on participation
  };
}

/**
 * Format time duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Get challenge difficulty multiplier for scoring
 */
export function getDifficultyMultiplier(difficulty: string): number {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 1.0;
    case 'medium': return 1.5;
    case 'hard': return 2.0;
    default: return 1.0;
  }
}

/**
 * Calculate streak bonus points
 */
export function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 100;
  if (streakDays >= 14) return 50;
  if (streakDays >= 7) return 25;
  if (streakDays >= 3) return 10;
  return 0;
}

/**
 * Determine user skill level based on performance
 */
export function getUserSkillLevel(totalPoints: number, challengesCompleted: number): {
  level: string;
  badge: string;
  nextLevelPoints: number;
} {
  const levels = [
    { min: 0, level: 'Beginner', badge: '🌱', next: 1000 },
    { min: 1000, level: 'Developer', badge: '💻', next: 3000 },
    { min: 3000, level: 'Expert', badge: '⭐', next: 7000 },
    { min: 7000, level: 'Master', badge: '🏆', next: 15000 },
    { min: 15000, level: 'Legend', badge: '👑', next: Infinity }
  ];

  const currentLevel = levels.findLast(l => totalPoints >= l.min) || levels[0];
  
  return {
    level: currentLevel.level,
    badge: currentLevel.badge,
    nextLevelPoints: currentLevel.next
  };
}
