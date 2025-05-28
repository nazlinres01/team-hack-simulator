import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Code, Palette, Brain, Plug, Database, FlaskConical } from "lucide-react";
import { Link } from "wouter";
import type { ChallengeWithAttempts } from "@shared/schema";

interface MiniGameCardProps {
  challenge: ChallengeWithAttempts;
}

export default function MiniGameCard({ challenge }: MiniGameCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return Code;
      case 'wireframe': return Palette;
      case 'algorithm': return Brain;
      case 'api': return Plug;
      case 'database': return Database;
      case 'test': return FlaskConical;
      default: return Code;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'code': return 'text-accent-green bg-accent-green/20';
      case 'wireframe': return 'text-secondary bg-secondary/20';
      case 'algorithm': return 'text-accent-amber bg-accent-amber/20';
      case 'api': return 'text-blue-400 bg-blue-400/20';
      case 'database': return 'text-red-400 bg-red-400/20';
      case 'test': return 'text-pink-400 bg-pink-400/20';
      default: return 'text-primary bg-primary/20';
    }
  };

  const getTypeEmoji = (type: string) => {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-accent-green';
      case 'medium': return 'text-accent-amber';
      case 'hard': return 'text-accent-red';
      default: return 'text-primary';
    }
  };

  const Icon = getTypeIcon(challenge.type);
  const typeColor = getTypeColor(challenge.type);
  const emoji = getTypeEmoji(challenge.type);
  const difficultyColor = getDifficultyColor(challenge.difficulty);

  return (
    <Link href={`/challenge/${challenge.id}`}>
      <Card className="mini-game-card p-6 border-dark-600 cursor-pointer group">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${typeColor} rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold group-hover:text-primary transition-colors">
                  {challenge.title}
                </h4>
                <p className="text-slate-400 text-sm">{challenge.description}</p>
              </div>
            </div>
            <span className={`${difficultyColor} text-sm font-medium`}>
              +{challenge.points} pts
            </span>
          </div>
          
          {/* Challenge Preview */}
          <div className="bg-dark-700 p-3 rounded-lg mb-4 min-h-[80px] flex items-center justify-center">
            {challenge.type === 'code' && (
              <div className="code-editor text-sm font-mono w-full">
                <div className="text-accent-green">// Sample challenge preview</div>
                <div className="text-blue-300">function <span className="text-yellow-300">calculateTotal</span>(<span className="text-orange-300">items</span>) {`{`}</div>
                <div className="text-red-400 ml-4">let total = 0</div>
                <div className="text-slate-300 ml-4">for (let i=0; i&lt;items.length; i++) {`{`}</div>
                <div className="text-red-400 ml-8">total += items[i].price</div>
                <div className="text-slate-300 ml-4">{`}`}</div>
                <div className="text-slate-300">{`}`}</div>
              </div>
            )}
            
            {challenge.type === 'wireframe' && (
              <div className="w-full border-2 border-dashed border-dark-600 p-4 rounded">
                <div className="space-y-2">
                  <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                  <div className="h-8 bg-slate-500 rounded"></div>
                  <div className="h-8 bg-slate-500 rounded"></div>
                  <div className="h-6 bg-primary rounded w-1/2"></div>
                </div>
              </div>
            )}
            
            {!['code', 'wireframe'].includes(challenge.type) && (
              <div className="text-6xl">{emoji}</div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-slate-400 text-sm">
                <Clock className="w-3 h-3" />
                <span>
                  {challenge.timeLimit ? `${Math.floor(challenge.timeLimit / 60)}m` : 'No limit'}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {challenge.difficulty}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1 text-slate-400 text-sm">
              <Users className="w-3 h-3" />
              <span>
                {challenge.activeParticipants || 0 > 0 
                  ? `${challenge.activeParticipants}/4 playing`
                  : 'Ready to start'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
