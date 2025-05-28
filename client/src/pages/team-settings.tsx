import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Users, Plus, Edit, Trash2, Crown, Shield, User, Save, X } from "lucide-react";
import { useLocation } from "wouter";

// Mock team data for demo
const mockTeam = {
  id: 1,
  name: "Team Alpha",
  description: "Elite coding squad focused on innovative solutions",
  leaderId: 1,
  compatibilityScore: 92,
  totalScore: 8924,
  challengesWon: 23,
  streak: 7,
  rank: 3,
  createdAt: new Date(),
  members: [
    {
      id: 1,
      name: "Alex Developer",
      email: "alex@example.com",
      role: "leader",
      specialty: "Full Stack Development",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
      joinedAt: new Date("2024-01-15"),
      totalPoints: 2847,
      online: true
    },
    {
      id: 2,
      name: "Sarah Designer",
      email: "sarah@example.com",
      role: "member",
      specialty: "UI/UX Design",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face",
      joinedAt: new Date("2024-01-20"),
      totalPoints: 2234,
      online: true
    },
    {
      id: 3,
      name: "Mike Backend",
      email: "mike@example.com",
      role: "member",
      specialty: "Backend Development",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      joinedAt: new Date("2024-01-25"),
      totalPoints: 1998,
      online: false
    },
    {
      id: 4,
      name: "Emma Data",
      email: "emma@example.com",
      role: "member",
      specialty: "Data Analysis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
      joinedAt: new Date("2024-02-01"),
      totalPoints: 1876,
      online: true
    }
  ]
};

export default function TeamSettings() {
  const [, setLocation] = useLocation();
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [teamName, setTeamName] = useState(mockTeam.name);
  const [teamDescription, setTeamDescription] = useState(mockTeam.description);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleSaveTeam = () => {
    // Here you would make an API call to update team info
    setIsEditingTeam(false);
  };

  const handleInviteMember = () => {
    if (inviteEmail) {
      // Here you would make an API call to send invitation
      setInviteEmail("");
      // Show success toast
    }
  };

  const handleRemoveMember = (memberId: number) => {
    // Here you would make an API call to remove member
    console.log("Remove member:", memberId);
  };

  const handlePromoteMember = (memberId: number) => {
    // Here you would make an API call to promote member
    console.log("Promote member:", memberId);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "leader": return <Crown className="w-4 h-4 text-yellow-400" />;
      case "admin": return <Shield className="w-4 h-4 text-blue-400" />;
      default: return <User className="w-4 h-4 text-slate-400" />;
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
                <Settings className="w-6 h-6 mr-2 text-primary" />
                Team Settings
              </h1>
              <p className="text-slate-400 text-sm">Manage your team and collaboration settings</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-accent-green border-accent-green">
              <Users className="w-3 h-3 mr-1" />
              {mockTeam.members.length} Members
            </Badge>
            <Badge variant="outline" className="text-primary border-primary">
              Rank #{mockTeam.rank}
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-dark-800 border border-dark-600">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Team Information
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingTeam(!isEditingTeam)}
                    >
                      {isEditingTeam ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team Name</label>
                    {isEditingTeam ? (
                      <Input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="bg-dark-700 border-dark-600"
                      />
                    ) : (
                      <p className="text-lg font-semibold">{teamName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    {isEditingTeam ? (
                      <Textarea
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(e.target.value)}
                        className="bg-dark-700 border-dark-600"
                        rows={3}
                      />
                    ) : (
                      <p className="text-slate-300">{teamDescription}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Team ID</label>
                    <p className="text-slate-400 font-mono">#{mockTeam.id.toString().padStart(6, '0')}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Created</label>
                    <p className="text-slate-400">{mockTeam.createdAt.toLocaleDateString()}</p>
                  </div>
                  
                  {isEditingTeam && (
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleSaveTeam} className="bg-accent-green hover:bg-accent-green/90">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingTeam(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle>Team Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-accent-green">{mockTeam.totalScore.toLocaleString()}</div>
                      <div className="text-sm text-slate-400">Total Score</div>
                    </div>
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{mockTeam.challengesWon}</div>
                      <div className="text-sm text-slate-400">Challenges Won</div>
                    </div>
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-accent-amber">{mockTeam.streak}</div>
                      <div className="text-sm text-slate-400">Day Streak</div>
                    </div>
                    <div className="text-center p-4 bg-dark-700 rounded-lg">
                      <div className="text-2xl font-bold text-secondary">{mockTeam.compatibilityScore}%</div>
                      <div className="text-sm text-slate-400">Compatibility</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Management */}
          <TabsContent value="members">
            <div className="space-y-6">
              {/* Invite New Member */}
              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle>Invite New Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Input
                      placeholder="Enter email address..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 bg-dark-700 border-dark-600"
                    />
                    <Button onClick={handleInviteMember} className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Send Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Members */}
              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle>Current Members ({mockTeam.members.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTeam.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-4 p-4 bg-dark-700 rounded-lg">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-dark-700 ${
                            member.online ? 'bg-accent-green' : 'bg-slate-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{member.name}</h3>
                            {getRoleIcon(member.role)}
                            <Badge variant="outline" className="text-xs">
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">{member.email}</p>
                          <p className="text-sm text-slate-400">{member.specialty}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-accent-green">
                            {member.totalPoints.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-400">points</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-slate-400">
                            Joined {member.joinedAt.toLocaleDateString()}
                          </div>
                          <div className={`text-xs ${member.online ? 'text-accent-green' : 'text-slate-500'}`}>
                            {member.online ? 'Online' : 'Offline'}
                          </div>
                        </div>
                        
                        {member.role !== "leader" && (
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePromoteMember(member.id)}
                              className="text-primary hover:text-primary/90"
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-accent-red hover:text-accent-red/90"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle>Challenge Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Challenge Types</label>
                    <div className="space-y-2">
                      {["code", "wireframe", "algorithm", "api", "database", "test"].map((type) => (
                        <label key={type} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty Preference</label>
                    <Select defaultValue="mixed">
                      <SelectTrigger className="bg-dark-700 border-dark-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy Only</SelectItem>
                        <SelectItem value="medium">Medium Only</SelectItem>
                        <SelectItem value="hard">Hard Only</SelectItem>
                        <SelectItem value="mixed">Mixed Difficulty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span>New challenge notifications</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Team member activity</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Leaderboard updates</span>
                      <input type="checkbox" className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Challenge reminders</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle>Team Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    📊 Performance chart would be displayed here
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-800 border-dark-600">
                <CardHeader>
                  <CardTitle>Challenge Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "Code Challenges", count: 15, percentage: 35 },
                      { type: "Design Tasks", count: 8, percentage: 25 },
                      { type: "Algorithms", count: 6, percentage: 20 },
                      { type: "API Design", count: 4, percentage: 15 },
                      { type: "Other", count: 2, percentage: 5 }
                    ].map((item) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <span className="text-sm">{item.type}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-dark-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-400 w-8">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}