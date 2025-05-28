import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import TeamSidebar from "@/components/team-sidebar";
import MiniGameCard from "@/components/mini-game-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Trophy, Flame, Medal, Star, Clock, Users, Plus } from "lucide-react";
import { Link } from "wouter";
import type { ChallengeWithAttempts, Team } from "@shared/schema";

// Mock user for demo purposes
const mockUser = {
  id: 1,
  username: "Alex Developer",
  email: "alex@example.com",
  totalPoints: 2847,
  avatar: null
};

export default function Dashboard() {
  const [currentTeam] = useState<Team | null>({
    id: 1,
    name: "Team Alpha",
    description: "Elite coding squad",
    leaderId: 1,
    compatibilityScore: 92,
    totalScore: 8924,
    challengesWon: 23,
    streak: 7,
    rank: 3,
    createdAt: new Date()
  });

  const { data: challenges, isLoading: challengesLoading } = useQuery<ChallengeWithAttempts[]>({
    queryKey: ["/api/challenges"],
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<Team[]>({
    queryKey: ["/api/leaderboard"],
  });

  const activeChallenge = challenges?.find(c => 
    c.attempts?.some(a => a.status === 'in_progress' && a.userId === mockUser.id)
  );

  const challengesByType = challenges?.reduce((acc, challenge) => {
    if (!acc[challenge.type]) acc[challenge.type] = [];
    acc[challenge.type].push(challenge);
    return acc;
  }, {} as Record<string, ChallengeWithAttempts[]>);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              <span className="mr-2">💻</span>Team Hack Simulator
            </h1>
            <span className="text-slate-400 text-sm">Digital Collaboration Lab</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-dark-700 px-3 py-2 rounded-lg">
              <Coins className="w-4 h-4 text-accent-amber" />
              <span className="font-semibold">{mockUser.totalPoints.toLocaleString()}</span>
              <span className="text-slate-400 text-sm">pts</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-semibold">
                {mockUser.username.charAt(0)}
              </div>
              <span className="font-medium">{mockUser.username}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <TeamSidebar team={currentTeam} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {currentTeam?.name || 'Team'}!</h2>
            <p className="text-slate-400">Ready to tackle some collaborative challenges? Your team is on fire! 🔥</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-dark-800 border-dark-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Team Score</p>
                    <p className="text-2xl font-bold text-accent-green">
                      {currentTeam?.totalScore.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-accent-amber" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-800 border-dark-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Challenges Won</p>
                    <p className="text-2xl font-bold text-primary">
                      {currentTeam?.challengesWon || 0}
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-accent-amber" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-800 border-dark-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Streak</p>
                    <p className="text-2xl font-bold text-secondary">
                      {currentTeam?.streak || 0} days
                    </p>
                  </div>
                  <Flame className="w-8 h-8 text-accent-red" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-800 border-dark-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Rank</p>
                    <p className="text-2xl font-bold text-accent-amber">
                      #{currentTeam?.rank || 0}
                    </p>
                  </div>
                  <Medal className="w-8 h-8 text-accent-amber" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Challenge */}
          {activeChallenge && (
            <Card className="bg-gradient-to-r from-primary to-secondary p-6 mb-8 glow-effect">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    🚀 Current Challenge: {activeChallenge.title}
                  </h3>
                  <p className="text-blue-100">{activeChallenge.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg flex items-center">
                    <Clock className="w-5 h-5 mr-1" />
                    00:42:15
                  </div>
                  <div className="text-blue-100 text-sm">Time Remaining</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="text-white font-bold">3/5</div>
                    <div className="text-blue-100 text-sm">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{activeChallenge.points}</div>
                    <div className="text-blue-100 text-sm">Points</div>
                  </div>
                </div>
                
                <Link href={`/challenge/${activeChallenge.id}`}>
                  <Button className="bg-white text-primary hover:bg-blue-50">
                    Continue Challenge
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Mini-Games Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {challengesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-dark-800 p-6 rounded-xl border border-dark-600 animate-pulse">
                  <div className="h-20 bg-dark-700 rounded"></div>
                </div>
              ))
            ) : (
              challenges?.map((challenge) => (
                <MiniGameCard key={challenge.id} challenge={challenge} />
              ))
            )}
          </div>

          {/* Team Performance and Leaderboard */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Team Performance Chart */}
            <Card className="bg-dark-800 border-dark-600">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Team Performance This Week</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Code Challenges</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-32" />
                      <span className="text-accent-green font-semibold">85%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Design Tasks</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={72} className="w-32" />
                      <span className="text-secondary font-semibold">72%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Algorithm Problems</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={91} className="w-32" />
                      <span className="text-accent-amber font-semibold">91%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Collaboration</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={94} className="w-32" />
                      <span className="text-primary font-semibold">94%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Leaderboard */}
            <Card className="bg-dark-800 border-dark-600">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Global Leaderboard</h3>
                
                <div className="space-y-3">
                  {leaderboardLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-dark-700 animate-pulse">
                        <div className="w-8 h-8 bg-dark-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-dark-600 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-dark-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    leaderboard?.slice(0, 5).map((team, index) => (
                      <div 
                        key={team.id} 
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          index === 0 ? 'bg-accent-amber bg-opacity-10 border border-accent-amber' :
                          team.id === currentTeam?.id ? 'bg-primary bg-opacity-20 border border-primary' :
                          'bg-dark-700'
                        }`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          index === 0 ? 'bg-accent-amber text-dark-900' :
                          index === 1 ? 'bg-slate-600 text-white' :
                          team.id === currentTeam?.id ? 'bg-primary text-white' :
                          'bg-dark-600 text-slate-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{team.name}</div>
                          <div className="text-slate-400 text-sm">{team.totalScore.toLocaleString()} points</div>
                        </div>
                        {index === 0 && <span className="text-accent-amber">👑</span>}
                        {team.id === currentTeam?.id && <Star className="w-4 h-4 text-primary" />}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 bg-gradient-to-r from-primary to-secondary hover:scale-110 transition-transform z-50 rounded-full w-16 h-16 glow-effect"
        title="Create New Challenge"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
