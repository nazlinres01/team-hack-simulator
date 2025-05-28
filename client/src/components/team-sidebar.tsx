import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Settings, Gauge, Gamepad2, Trophy, History, UsersRound, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Team } from "@shared/schema";

interface TeamSidebarProps {
  team: Team | null;
}

// Mock team members for demo
const mockMembers = [
  {
    id: 1,
    name: "Sarah Designer",
    role: "UI/UX Specialist",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face",
    online: true
  },
  {
    id: 2,
    name: "Mike Coder",
    role: "Backend Dev",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    online: true
  },
  {
    id: 3,
    name: "Emma Analyst",
    role: "Data Specialist",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    online: false
  }
];

export default function TeamSidebar({ team }: TeamSidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Gauge, label: "Dashboard", active: location === "/" },
    { href: "/challenges", icon: Gamepad2, label: "Active Challenges" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/history", icon: History, label: "Challenge History" },
    { href: "/profile", icon: User, label: "My Profile" },
    { href: "/team-settings", icon: UsersRound, label: "Team Settings" },
  ];

  return (
    <aside className="w-80 bg-dark-800 border-r border-dark-600 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        {/* Team Overview */}
        <Card className="team-card rounded-xl mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Current Team</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-secondary transition-colors p-1"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {mockMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-dark-800 ${
                      member.online ? 'bg-accent-green' : 'bg-accent-amber'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{member.name}</div>
                    <div className="text-xs text-slate-400">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Team Compatibility Score */}
            <div className="mt-4 p-3 bg-dark-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Team Compatibility</span>
                <span className="text-accent-green font-semibold">
                  {team?.compatibilityScore || 0}%
                </span>
              </div>
              <Progress 
                value={team?.compatibilityScore || 0} 
                className="w-full h-2"
              />
              <p className="text-xs text-slate-400 mt-1">
                {(team?.compatibilityScore || 0) >= 80 
                  ? "Excellent collaboration potential!" 
                  : "Good team dynamics!"}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left ${
                    item.active 
                      ? "bg-primary text-white font-medium" 
                      : "text-slate-300 hover:bg-dark-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
