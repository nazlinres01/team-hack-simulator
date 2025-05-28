import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Clock, Users, Star, Code, Palette, Brain, Plug, Database, FlaskConical } from "lucide-react";
import { Link, useLocation } from "wouter";
import MiniGameCard from "@/components/mini-game-card";
import type { ChallengeWithAttempts } from "@shared/schema";

export default function Challenges() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const { data: challenges, isLoading } = useQuery<ChallengeWithAttempts[]>({
    queryKey: ["/api/challenges"],
  });

  const challengeTypes = [
    { value: "all", label: "All Types", icon: Star },
    { value: "code", label: "Code Challenges", icon: Code },
    { value: "wireframe", label: "Design & UX", icon: Palette },
    { value: "algorithm", label: "Algorithms", icon: Brain },
    { value: "api", label: "API Design", icon: Plug },
    { value: "database", label: "Database", icon: Database },
    { value: "test", label: "Testing", icon: FlaskConical },
  ];

  const filteredChallenges = challenges?.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || challenge.type === selectedType;
    const matchesDifficulty = selectedDifficulty === "all" || challenge.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const getTypeStats = () => {
    if (!challenges) return {};
    
    return challenges.reduce((acc, challenge) => {
      acc[challenge.type] = (acc[challenge.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const typeStats = getTypeStats();

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
              <h1 className="text-2xl font-bold">🎮 Active Challenges</h1>
              <p className="text-slate-400 text-sm">Choose your next challenge and start competing!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-accent-green border-accent-green">
              {challenges?.length || 0} Available
            </Badge>
            <Badge variant="outline" className="text-accent-amber border-accent-amber">
              {challenges?.reduce((sum, c) => sum + (c.activeParticipants || 0), 0) || 0} Active Players
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Filters */}
        <Card className="bg-dark-800 border-dark-600 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search challenges..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-dark-700 border-dark-600"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48 bg-dark-700 border-dark-600">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {challengeTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <Icon className="w-4 h-4 mr-2" />
                            {type.label}
                            {type.value !== "all" && typeStats[type.value] && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {typeStats[type.value]}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-40 bg-dark-700 border-dark-600">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">🟢 Easy</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="hard">🔴 Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenge Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {challengeTypes.slice(1).map((type) => {
            const Icon = type.icon;
            const count = typeStats[type.value] || 0;
            return (
              <Card key={type.value} className="bg-dark-800 border-dark-600">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs text-slate-400">{type.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Challenges Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-dark-800 p-6 rounded-xl border border-dark-600 animate-pulse">
                <div className="h-20 bg-dark-700 rounded mb-4"></div>
                <div className="h-16 bg-dark-700 rounded mb-4"></div>
                <div className="h-8 bg-dark-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredChallenges && filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <MiniGameCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          <Card className="bg-dark-800 border-dark-600">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No challenges found</h3>
              <p className="text-slate-400 mb-4">
                {searchTerm || selectedType !== "all" || selectedDifficulty !== "all"
                  ? "Try adjusting your search filters to find more challenges."
                  : "No challenges are currently available. Check back soon!"}
              </p>
              {(searchTerm || selectedType !== "all" || selectedDifficulty !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                    setSelectedDifficulty("all");
                  }}
                  className="border-dark-600 hover:bg-dark-700"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {filteredChallenges && filteredChallenges.length > 0 && (
          <Card className="bg-dark-800 border-dark-600 mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Challenge Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-accent-green">
                    {filteredChallenges.filter(c => c.difficulty === 'easy').length}
                  </div>
                  <div className="text-sm text-slate-400">Easy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent-amber">
                    {filteredChallenges.filter(c => c.difficulty === 'medium').length}
                  </div>
                  <div className="text-sm text-slate-400">Medium</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent-red">
                    {filteredChallenges.filter(c => c.difficulty === 'hard').length}
                  </div>
                  <div className="text-sm text-slate-400">Hard</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {filteredChallenges.reduce((sum, c) => sum + c.points, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Total Points</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}