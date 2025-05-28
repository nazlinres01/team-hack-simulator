import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Calendar, Clock, Trophy, Star, CheckCircle, XCircle, Pause } from "lucide-react";
import { useLocation } from "wouter";
import type { ChallengeAttempt } from "@shared/schema";

// Mock user for demo
const mockUser = {
  id: 1,
  teamId: 1
};

export default function History() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  const { data: attempts, isLoading } = useQuery<ChallengeAttempt[]>({
    queryKey: [`/api/users/${mockUser.id}/attempts`],
  });

  const { data: teamAttempts } = useQuery<ChallengeAttempt[]>({
    queryKey: [`/api/teams/${mockUser.teamId}/attempts`],
  });

  const filteredAttempts = attempts?.filter(attempt => {
    const matchesStatus = statusFilter === "all" || attempt.status === statusFilter;
    const matchesTime = timeFilter === "all" || isWithinTimeFrame(attempt.startedAt, timeFilter);
    return matchesStatus && matchesTime;
  });

  function isWithinTimeFrame(date: Date | null, timeFrame: string): boolean {
    if (!date) return false;
    const now = new Date();
    const attemptDate = new Date(date);
    
    switch (timeFrame) {
      case "today":
        return attemptDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return attemptDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return attemptDate >= monthAgo;
      default:
        return true;
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-accent-green" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-accent-red" />;
      case "in_progress":
        return <Pause className="w-4 h-4 text-accent-amber" />;
      case "abandoned":
        return <XCircle className="w-4 h-4 text-slate-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-accent-green";
      case "failed":
        return "text-accent-red";
      case "in_progress":
        return "text-accent-amber";
      case "abandoned":
        return "text-slate-400";
      default:
        return "text-slate-400";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-accent-green";
    if (score >= 70) return "text-accent-amber";
    if (score >= 50) return "text-orange-400";
    return "text-accent-red";
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPerformanceStats = () => {
    if (!attempts) return { completed: 0, avgScore: 0, totalTime: 0, bestScore: 0 };
    
    const completed = attempts.filter(a => a.status === "completed");
    const avgScore = completed.length > 0 
      ? Math.round(completed.reduce((sum, a) => sum + (a.score || 0), 0) / completed.length)
      : 0;
    const totalTime = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    const bestScore = Math.max(...completed.map(a => a.score || 0), 0);
    
    return { completed: completed.length, avgScore, totalTime, bestScore };
  };

  const stats = getPerformanceStats();

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
                <Clock className="w-6 h-6 mr-2 text-primary" />
                Challenge History
              </h1>
              <p className="text-slate-400 text-sm">Track your progress and review past challenges</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-accent-green border-accent-green">
              {stats.completed} Completed
            </Badge>
            <Badge variant="outline" className="text-primary border-primary">
              {stats.avgScore}% Avg Score
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-dark-800 border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Challenges Completed</p>
                  <p className="text-2xl font-bold text-accent-green">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-accent-green" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-800 border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Average Score</p>
                  <p className="text-2xl font-bold text-primary">{stats.avgScore}%</p>
                </div>
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-800 border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Best Score</p>
                  <p className="text-2xl font-bold text-accent-amber">{stats.bestScore}%</p>
                </div>
                <Star className="w-8 h-8 text-accent-amber" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-800 border-dark-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Time</p>
                  <p className="text-2xl font-bold text-secondary">{formatDuration(stats.totalTime)}</p>
                </div>
                <Clock className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-dark-700 border-dark-600">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="abandoned">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-40 bg-dark-700 border-dark-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenge History */}
        <Card className="bg-dark-800 border-dark-600">
          <CardHeader>
            <CardTitle>Your Challenge Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-dark-700 animate-pulse">
                    <div className="w-12 h-12 bg-dark-600 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-dark-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-dark-600 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-dark-600 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : filteredAttempts && filteredAttempts.length > 0 ? (
              <div className="space-y-3">
                {filteredAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center space-x-4 p-4 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-dark-600 rounded-lg">
                      {getStatusIcon(attempt.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">Challenge #{attempt.challengeId}</h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(attempt.status)} border-current`}
                        >
                          {attempt.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-400 flex items-center space-x-4">
                        <span>Started: {new Date(attempt.startedAt).toLocaleDateString()}</span>
                        {attempt.completedAt && (
                          <>
                            <span>•</span>
                            <span>Completed: {new Date(attempt.completedAt).toLocaleDateString()}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Duration: {formatDuration(attempt.timeSpent)}</span>
                      </div>
                    </div>
                    
                    {attempt.status === "completed" && (
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(attempt.score || 0)}`}>
                          {attempt.score}%
                        </div>
                        <div className="text-xs text-slate-400">score</div>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(`/challenge/${attempt.challengeId}`)}
                      className="text-primary hover:text-primary/90"
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No challenge history found</h3>
                <p className="text-slate-400 mb-4">
                  {statusFilter !== "all" || timeFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "Start completing challenges to build your history!"}
                </p>
                <Button
                  onClick={() => setLocation("/challenges")}
                  className="bg-primary hover:bg-primary/90"
                >
                  Browse Challenges
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Activity (if available) */}
        {teamAttempts && teamAttempts.length > 0 && (
          <Card className="bg-dark-800 border-dark-600 mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Recent Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teamAttempts.slice(0, 5).map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-2 rounded text-sm">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(attempt.status)}
                      <span>Challenge #{attempt.challengeId}</span>
                      <span className="text-slate-400">by Team Member</span>
                    </div>
                    <div className="text-slate-400">
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}