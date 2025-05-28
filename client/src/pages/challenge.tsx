import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Users, Trophy, CheckCircle } from "lucide-react";
import CodeEditor from "@/components/code-editor";
import WireframeBuilder from "@/components/wireframe-builder";
import ChallengeTimer from "@/components/challenge-timer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChallengeWithAttempts, ChallengeAttempt } from "@shared/schema";

// Mock user for demo
const mockUser = {
  id: 1,
  teamId: 1
};

export default function Challenge() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [solution, setSolution] = useState<any>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState<ChallengeAttempt | null>(null);

  const { data: challenge, isLoading } = useQuery<ChallengeWithAttempts>({
    queryKey: [`/api/challenges/${id}`],
    enabled: !!id,
  });

  const startChallengeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/challenges/${id}/attempts`, {
        teamId: mockUser.teamId,
        userId: mockUser.id,
      });
    },
    onSuccess: async (response) => {
      const attempt = await response.json();
      setCurrentAttempt(attempt);
      toast({
        title: "Challenge Started!",
        description: "Good luck! Timer has started.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start challenge",
        variant: "destructive",
      });
    }
  });

  const submitSolutionMutation = useMutation({
    mutationFn: async () => {
      // First, get AI score
      const scoreResponse = await apiRequest("POST", "/api/ai/score-solution", {
        challengeType: challenge?.type,
        solution,
        challengeContent: challenge?.content,
      });
      const { score, feedback } = await scoreResponse.json();

      // Then update the attempt
      return apiRequest("PATCH", `/api/attempts/${currentAttempt?.id}`, {
        status: 'completed',
        score,
        timeSpent,
        solution: { ...solution, feedback },
      });
    },
    onSuccess: async (response) => {
      const updatedAttempt = await response.json();
      toast({
        title: "Challenge Completed!",
        description: `Score: ${updatedAttempt.score}/100`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      setTimeout(() => setLocation("/"), 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit solution",
        variant: "destructive",
      });
    }
  });

  // Start challenge automatically when page loads
  useEffect(() => {
    if (challenge && !currentAttempt) {
      const existingAttempt = challenge.attempts?.find(
        a => a.userId === mockUser.id && a.status === 'in_progress'
      );
      
      if (existingAttempt) {
        setCurrentAttempt(existingAttempt);
      } else {
        startChallengeMutation.mutate();
      }
    }
  }, [challenge]);

  const handleSubmit = () => {
    if (!currentAttempt) return;
    submitSolutionMutation.mutate();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-accent-green';
      case 'medium': return 'bg-accent-amber';
      case 'hard': return 'bg-accent-red';
      default: return 'bg-primary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return '💻';
      case 'wireframe': return '🎨';
      case 'algorithm': return '🧮';
      case 'api': return '🔌';
      case 'database': return '🗃️';
      case 'test': return '🧪';
      default: return '⚡';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Card className="bg-dark-800 border-dark-600">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Challenge Not Found</h2>
            <p className="text-slate-400 mb-4">The challenge you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/")} className="bg-primary hover:bg-primary/90">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getTypeIcon(challenge.type)}</span>
              <div>
                <h1 className="text-xl font-bold">{challenge.title}</h1>
                <p className="text-sm text-slate-400">{challenge.description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty.toUpperCase()}
            </Badge>
            <div className="flex items-center space-x-2 bg-dark-700 px-3 py-2 rounded-lg">
              <Trophy className="w-4 h-4 text-accent-amber" />
              <span className="font-semibold">{challenge.points}</span>
              <span className="text-slate-400 text-sm">pts</span>
            </div>
            <div className="flex items-center space-x-2 bg-dark-700 px-3 py-2 rounded-lg">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm">{challenge.activeParticipants || 0} playing</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Challenge Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Timer and Progress */}
            {currentAttempt && (
              <Card className="bg-dark-800 border-dark-600 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <ChallengeTimer
                        timeLimit={challenge.timeLimit}
                        onTimeUpdate={setTimeSpent}
                        onTimeUp={() => handleSubmit()}
                      />
                      <div className="text-sm text-slate-400">
                        Started: {new Date(currentAttempt.startedAt).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleSubmit}
                      disabled={submitSolutionMutation.isPending}
                      className="bg-accent-green hover:bg-accent-green/90"
                    >
                      {submitSolutionMutation.isPending ? (
                        <>Submitting...</>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submit Solution
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Challenge Interface */}
            {challenge.type === 'code' && (
              <CodeEditor
                challenge={challenge}
                solution={solution}
                onSolutionChange={setSolution}
              />
            )}

            {challenge.type === 'wireframe' && (
              <WireframeBuilder
                challenge={challenge}
                solution={solution}
                onSolutionChange={setSolution}
              />
            )}

            {/* Other challenge types - simplified implementation */}
            {!['code', 'wireframe'].includes(challenge.type) && (
              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle>Challenge Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-slate-300">{challenge.description}</p>
                    
                    {challenge.content && (
                      <div className="bg-dark-700 p-4 rounded-lg">
                        <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                          {JSON.stringify(challenge.content, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium mb-2">Your Solution:</label>
                      <textarea
                        className="w-full h-32 bg-dark-700 border border-dark-600 rounded-lg p-3 text-white resize-none"
                        placeholder="Enter your solution here..."
                        value={solution.text || ''}
                        onChange={(e) => setSolution({ text: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar with hints and participants */}
        <div className="w-80 bg-dark-800 border-l border-dark-600 p-6">
          <div className="space-y-6">
            {/* Challenge Info */}
            <Card className="bg-dark-700 border-dark-600">
              <CardHeader>
                <CardTitle className="text-sm">Challenge Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Limit:</span>
                  <span className="text-white">
                    {challenge.timeLimit ? `${Math.floor(challenge.timeLimit / 60)}m` : 'Unlimited'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Points:</span>
                  <span className="text-accent-amber font-semibold">{challenge.points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Difficulty:</span>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Hints */}
            <Card className="bg-dark-700 border-dark-600">
              <CardHeader>
                <CardTitle className="text-sm">💡 Hints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-300">
                  {challenge.type === 'code' && (
                    <>
                      <p>• Check for missing semicolons</p>
                      <p>• Ensure all functions return values</p>
                      <p>• Validate variable declarations</p>
                    </>
                  )}
                  {challenge.type === 'wireframe' && (
                    <>
                      <p>• Include all required elements</p>
                      <p>• Consider mobile-first design</p>
                      <p>• Maintain proper spacing</p>
                    </>
                  )}
                  {!['code', 'wireframe'].includes(challenge.type) && (
                    <>
                      <p>• Read the requirements carefully</p>
                      <p>• Consider edge cases</p>
                      <p>• Test your solution</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Participants */}
            <Card className="bg-dark-700 border-dark-600">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Active Players ({challenge.activeParticipants || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {challenge.attempts?.filter(a => a.status === 'in_progress').map((attempt, index) => (
                    <div key={attempt.id} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                      <span className="text-sm text-slate-300">Player {index + 1}</span>
                    </div>
                  ))}
                  {(challenge.activeParticipants || 0) === 0 && (
                    <p className="text-sm text-slate-400">No other players currently active</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
