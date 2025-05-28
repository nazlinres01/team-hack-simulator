import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, User, Edit, Save, Camera, Trophy, Code, Palette, Brain, Star, Calendar, Clock, Target } from "lucide-react";
import { useLocation } from "wouter";

// Mock user data
const mockUser = {
  id: 1,
  name: "Alex Developer",
  email: "alex@example.com",
  username: "alexdev",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  bio: "Full-stack developer passionate about creating innovative solutions and mentoring others.",
  location: "Istanbul, Turkey",
  website: "https://alexdev.com",
  github: "alexdev",
  linkedin: "alex-developer",
  joinedAt: new Date("2024-01-15"),
  totalPoints: 8924,
  challengesCompleted: 47,
  teamRank: 3,
  globalRank: 15,
  streak: 12,
  badges: [
    { id: 1, name: "Code Master", icon: "💻", description: "Completed 25+ code challenges", earned: true },
    { id: 2, name: "Speed Demon", icon: "⚡", description: "Completed 10 challenges under time limit", earned: true },
    { id: 3, name: "Team Player", icon: "🤝", description: "Active team collaboration", earned: true },
    { id: 4, name: "Bug Hunter", icon: "🐛", description: "Found and fixed 50+ bugs", earned: false },
    { id: 5, name: "Design Guru", icon: "🎨", description: "Mastered UI/UX challenges", earned: false },
    { id: 6, name: "Algorithm Expert", icon: "🧮", description: "Solved complex algorithms", earned: true }
  ],
  skills: [
    { name: "JavaScript", level: 92, category: "Programming" },
    { name: "React", level: 88, category: "Frontend" },
    { name: "Node.js", level: 85, category: "Backend" },
    { name: "TypeScript", level: 90, category: "Programming" },
    { name: "UI/UX Design", level: 75, category: "Design" },
    { name: "Database Design", level: 80, category: "Backend" },
    { name: "API Development", level: 87, category: "Backend" },
    { name: "Testing", level: 78, category: "Quality Assurance" }
  ],
  recentActivity: [
    { date: "2024-05-28", action: "Completed", target: "React Component Bug Hunt", points: 270 },
    { date: "2024-05-27", action: "Started", target: "Algorithm Challenge", points: 0 },
    { date: "2024-05-26", action: "Completed", target: "Mobile Login Design", points: 250 },
    { date: "2024-05-25", action: "Joined", target: "Team Alpha", points: 0 },
    { date: "2024-05-24", action: "Completed", target: "Code Debug Rally", points: 200 }
  ]
};

export default function Profile() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(mockUser);

  const handleSaveProfile = () => {
    // API call would go here
    setIsEditing(false);
  };

  const getSkillColor = (level: number) => {
    if (level >= 90) return "bg-green-500";
    if (level >= 80) return "bg-blue-500";
    if (level >= 70) return "bg-yellow-500";
    if (level >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Programming": return <Code className="w-4 h-4" />;
      case "Frontend": return <Palette className="w-4 h-4" />;
      case "Backend": return <Brain className="w-4 h-4" />;
      case "Design": return <Palette className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

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
                <User className="w-6 h-6 mr-2 text-primary" />
                My Profile
              </h1>
              <p className="text-slate-400 text-sm">Manage your account and track your progress</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-accent-green border-accent-green">
              Rank #{userInfo.globalRank}
            </Badge>
            <Badge variant="outline" className="text-primary border-primary">
              {userInfo.totalPoints.toLocaleString()} Points
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="xl:col-span-1 bg-dark-800 border-dark-600">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage src={userInfo.avatar} />
                    <AvatarFallback className="text-2xl">{userInfo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-2"
                    disabled={!isEditing}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                      className="bg-dark-700 border-dark-600"
                    />
                    <Input
                      value={userInfo.username}
                      onChange={(e) => setUserInfo({...userInfo, username: e.target.value})}
                      className="bg-dark-700 border-dark-600"
                      placeholder="Username"
                    />
                    <Textarea
                      value={userInfo.bio}
                      onChange={(e) => setUserInfo({...userInfo, bio: e.target.value})}
                      className="bg-dark-700 border-dark-600"
                      rows={3}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{userInfo.name}</h2>
                    <p className="text-primary">@{userInfo.username}</p>
                    <p className="text-slate-300 text-sm">{userInfo.bio}</p>
                  </div>
                )}
                
                <div className="flex justify-center space-x-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSaveProfile} className="bg-accent-green hover:bg-accent-green/90">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="xl:col-span-2">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="bg-dark-800 border border-dark-600">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-4 text-center">
                      <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-accent-green">{userInfo.totalPoints.toLocaleString()}</div>
                      <div className="text-sm text-slate-400">Total Points</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-4 text-center">
                      <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-primary">{userInfo.challengesCompleted}</div>
                      <div className="text-sm text-slate-400">Challenges</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-4 text-center">
                      <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-secondary">#{userInfo.globalRank}</div>
                      <div className="text-sm text-slate-400">Global Rank</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-dark-800 border-dark-600">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-accent-amber">{userInfo.streak}</div>
                      <div className="text-sm text-slate-400">Day Streak</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Information */}
                <Card className="bg-dark-800 border-dark-600">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-slate-400">Email</Label>
                      <p className="font-medium">{userInfo.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-400">Location</Label>
                      <p className="font-medium">{userInfo.location}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-400">Website</Label>
                      <p className="font-medium text-primary">{userInfo.website}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-400">Joined</Label>
                      <p className="font-medium">{userInfo.joinedAt.toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills">
                <Card className="bg-dark-800 border-dark-600">
                  <CardHeader>
                    <CardTitle>Skill Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userInfo.skills.map((skill, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getCategoryIcon(skill.category)}
                              <span className="font-medium">{skill.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {skill.category}
                              </Badge>
                            </div>
                            <span className="text-sm font-bold">{skill.level}%</span>
                          </div>
                          <Progress 
                            value={skill.level} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Badges Tab */}
              <TabsContent value="badges">
                <Card className="bg-dark-800 border-dark-600">
                  <CardHeader>
                    <CardTitle>Achievement Badges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userInfo.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className={`p-4 rounded-lg border-2 ${
                            badge.earned 
                              ? 'bg-primary/10 border-primary' 
                              : 'bg-dark-700 border-dark-600 opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">{badge.icon}</div>
                            <div>
                              <h4 className="font-semibold">{badge.name}</h4>
                              <p className="text-sm text-slate-400">{badge.description}</p>
                              {badge.earned && (
                                <Badge className="mt-2 bg-accent-green text-xs">
                                  ✓ Earned
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card className="bg-dark-800 border-dark-600">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userInfo.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-dark-700 rounded-lg">
                          <div className="flex-shrink-0">
                            <Calendar className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium text-primary">{activity.action}</span>
                              <span className="text-slate-300"> {activity.target}</span>
                            </p>
                            <p className="text-xs text-slate-400">{activity.date}</p>
                          </div>
                          {activity.points > 0 && (
                            <Badge className="bg-accent-green">
                              +{activity.points} pts
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}