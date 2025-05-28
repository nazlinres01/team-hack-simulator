import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChallengeTimerProps {
  timeLimit?: number; // in seconds
  onTimeUpdate?: (timeSpent: number) => void;
  onTimeUp?: () => void;
}

export default function ChallengeTimer({ timeLimit, onTimeUpdate, onTimeUp }: ChallengeTimerProps) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setTimeSpent((prevTime) => {
          const newTime = prevTime + 1;
          onTimeUpdate?.(newTime);
          
          // Check if time limit exceeded
          if (timeLimit && newTime >= timeLimit) {
            setIsActive(false);
            onTimeUp?.();
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLimit, onTimeUpdate, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = () => {
    if (!timeLimit) return null;
    return Math.max(0, timeLimit - timeSpent);
  };

  const timeRemaining = getTimeRemaining();
  const isNearlyUp = timeRemaining !== null && timeRemaining <= 300; // 5 minutes
  const isUrgent = timeRemaining !== null && timeRemaining <= 60; // 1 minute

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Clock className={`w-5 h-5 ${isUrgent ? 'text-accent-red' : isNearlyUp ? 'text-accent-amber' : 'text-slate-400'}`} />
        <div className="text-sm">
          <div className="font-semibold">
            {timeLimit ? `Time Left: ${formatTime(timeRemaining || 0)}` : `Elapsed: ${formatTime(timeSpent)}`}
          </div>
          {timeLimit && (
            <div className="text-xs text-slate-400">
              Total: {formatTime(timeLimit)}
            </div>
          )}
        </div>
      </div>

      {timeLimit && (
        <Badge 
          variant={isUrgent ? "destructive" : isNearlyUp ? "default" : "outline"}
          className={
            isUrgent ? "bg-accent-red animate-pulse" : 
            isNearlyUp ? "bg-accent-amber" : 
            "border-dark-600"
          }
        >
          {isUrgent && <AlertTriangle className="w-3 h-3 mr-1" />}
          {Math.round(((timeLimit - timeSpent) / timeLimit) * 100)}%
        </Badge>
      )}
    </div>
  );
}
