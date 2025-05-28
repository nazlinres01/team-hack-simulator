import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Medal, Crown, TrendingUp, Star, Users, Calendar, Award } from "lucide-react";
import { useLocation } from "wouter";
import type { Team } from "@shared/schema";

// Mock current team for demo
const mockCurrentTeam = {
  id: 1,
  name: "Team Alpha"
};

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState("all-time");

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["/api/leaderboard"],
  });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-slate-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-slate-500 font-bold">#{position}</span>;
    }
  };

  const getRankBgColor = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case 2: return "bg-gradient-to-r from-slate-500/20 to-slate-400/20 border-slate-400/30";
      case 3: return "bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-500/30";
      default: return "bg-dark-800 border-dark-600";
    }
  };

  const getTeamAvatar = (teamName: string) => {
    const avatars = [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=40&h=40&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=40&h=40&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=40&h=40&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=40&h=40&fit=crop&crop=faces",
    ];
    return avatars[teamName.length % avatars.length];
  };

  const mockTopPerformers = [
    { name: "Sarah Chen", team: "Team Alpha", specialty: "Frontend", score: 2847, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face" },
    { name: "Alex Rodriguez", team: "Code Warriors", specialty: "Backend", score: 2654, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" },
    { name: "Emma Thompson", team: "Dev Squad", specialty: "Full Stack", score: 2431, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" },
    { name: "Mike Johnson", team: "Bug Hunters", specialty: "QA Engineer", score: 2298, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                Global Leaderboard
              </h1>
              <p className="text-slate-400 text-sm">See how your team ranks against the competition</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-accent-green border-accent-green">
              <Users className="w-3 h-3 mr-1" />
              {teams?.length || 0} Teams Competing
            </Badge>
            <Badge variant="outline" className="text-primary border-primary">
              <Calendar className="w-3 h-3 mr-1" />
              Season 2024
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="mb-6">
          <TabsList className="bg-dark-800 border border-dark-600">
            <TabsTrigger value="all-time">All Time</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="daily">Today</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPeriod}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Main Leaderboard */}
              <div className="xl:col-span-2">
                <Card className="bg-dark-800 border-dark-600">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                      Team Rankings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-dark-700 animate-pulse">
                            <div className="w-8 h-8 bg-dark-600 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-dark-600 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-dark-600 rounded w-1/2"></div>
                            </div>
                            <div className="h-6 bg-dark-600 rounded w-16"></div>
                          </div>
                        ))}
                      </div>
                    ) : teams && teams.length > 0 ? (
                      <div className="space-y-3">
                        {teams.map((team, index) => {
                          const position = index + 1;
                          const isCurrentTeam = team.id === mockCurrentTeam.id;
                          
                          return (
                            <div
                              key={team.id}
                              className={`flex items-center space-x-4 p-4 rounded-lg border transition-all hover:scale-[1.02] ${
                                getRankBgColor(position)
                              } ${isCurrentTeam ? 'ring-2 ring-primary' : ''}`}
                            >
                              <div className="flex items-center justify-center w-8 h-8">
                                {getRankIcon(position)}
                              </div>
                              
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={getTeamAvatar(team.name)} />
                                <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold">{team.name}</h3>
                                  {isCurrentTeam && (
                                    <Badge className="bg-primary text-white text-xs">
                                      <Star className="w-3 h-3 mr-1" />
                                      Your Team
                                    </Badge>
                                  )}
                                  {position <= 3 && (
                                    <Badge className="bg-accent-amber text-dark-900 text-xs">
                                      Top 3
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-slate-400 flex items-center space-x-4">
                                  <span>{team.challengesWon || 0} challenges won</span>
                                  <span>•</span>
                                  <span>{team.streak || 0} day streak</span>
                                  {team.compatibilityScore && (
                                    <>
                                      <span>•</span>
                                      <span>{team.compatibilityScore}% compatibility</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-lg font-bold text-accent-green">
                                  {(team.totalScore || 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-400">points</div>
                              </div>
                              
                              {position <= 10 && (
                                <div className="flex items-center text-accent-green">
                                  <TrendingUp className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No teams on leaderboard yet</h3>
                        <p className="text-slate-400">Complete some challenges to appear on the leaderboard!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar with additional stats */}
              <div className="space-y-6">
                {/* Top Performers */}
                <Card className="bg-dark-800 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-sm">🌟 Top Individual Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockTopPerformers.map((performer, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-700 transition-colors">
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={performer.avatar} />
                              <AvatarFallback>{performer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Crown className="w-2 h-2 text-dark-900" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{performer.name}</div>
                            <div className="text-xs text-slate-400">{performer.specialty}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-accent-green">
                              {performer.score.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Achievement Categories */}
                <Card className="bg-dark-800 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-sm">🏆 Achievement Leaders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-accent-green/20 rounded-lg flex items-center justify-center">
                            <span className="text-accent-green">💻</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Code Master</div>
                            <div className="text-xs text-slate-400">Team Alpha</div>
                          </div>
                        </div>
                        <Badge className="bg-accent-green text-dark-900">23 wins</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
                            <span className="text-secondary">🎨</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Design Guru</div>
                            <div className="text-xs text-slate-400">Creative Minds</div>
                          </div>
                        </div>
                        <Badge className="bg-secondary text-white">18 wins</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-accent-amber/20 rounded-lg flex items-center justify-center">
                            <span className="text-accent-amber">🧮</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Algorithm Expert</div>
                            <div className="text-xs text-slate-400">Logic Lords</div>
                          </div>
                        </div>
                        <Badge className="bg-accent-amber text-dark-900">15 wins</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-dark-800 border-dark-600">
                  <CardHeader>
                    <CardTitle className="text-sm">📊 Competition Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Teams</span>
                        <span className="font-semibold">{teams?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Players</span>
                        <span className="font-semibold">142</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Challenges Completed</span>
                        <span className="font-semibold">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Points Awarded</span>
                        <span className="font-semibold text-accent-green">234,891</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}