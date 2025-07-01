import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Edit, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Crown, 
  TrendingUp, 
  BarChart3, 
  Bell, 
  Settings, 
  Coins,
  Users,
  History,
  Bot,
  Link,
  Unlink,
  Key,
  Power,
  Trash,
  LogOut,
  Plus,
  X,
  Star,
  Copy,
  Share,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = ({ username }) => {
  const { toast } = useToast();
  
  // Mock user data - in a real app, this would come from an API
  const [userData, setUserData] = useState({
    username: username || 'JohnTrader',
    email: 'john.trader@example.com',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1 (555) 123-4567',
    address: '123 Trading Street, Market City, TC 12345',
    profileImage: 'https://i.pravatar.cc/150?img=68', // placeholder image
    joinDate: '2023-01-15',
    tradingExperience: 'Intermediate',
    bio: 'Passionate crypto trader with 5 years of experience in market analysis and algorithmic trading.',
    verificationStatus: 'Tier 1',
    subscriptionPlan: 'Pro',
    nextBillingDate: '2023-12-15',
    usageStats: {
      apiCalls: 2145,
      tradesExecuted: 47,
      predictionsReceived: 89
    },
    aiSettings: {
      riskTolerance: 65,
      strategy: 'Swing',
      confidenceThreshold: 75,
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...userData});
  const [activeTab, setActiveTab] = useState('profile');
  
  const [watchlist, setWatchlist] = useState([
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: 182.63, change: 1.25, alerts: { price: 190, aiEnabled: true } },
    { id: 2, symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.92, change: -0.58, alerts: { price: 390, aiEnabled: true } },
    { id: 3, symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: 2.34, alerts: { rsi: 70, aiEnabled: false } },
    { id: 4, symbol: 'AMZN', name: 'Amazon.com Inc.', price: 184.05, change: 0.87, alerts: { volume: 5000000, aiEnabled: true } }
  ]);
  
  const [connectedBrokers, setConnectedBrokers] = useState([
    { id: 1, name: 'Zerodha', status: 'Connected', lastSync: '2023-11-10 08:45 AM' },
    { id: 2, name: 'Upstox', status: 'Disconnected', lastSync: '2023-10-25 03:12 PM' },
    { id: 3, name: 'Fyers', status: 'Connected', lastSync: '2023-11-12 02:30 PM' }
  ]);
  
  const [referralData, setReferralData] = useState({
    code: 'JOHNT2023',
    earnings: 250.75,
    usersReferred: 12,
    pendingInvites: 5
  });
  
  const [aiTrainingHistory, setAiTrainingHistory] = useState([
    { id: 1, date: '2023-11-05', action: 'Trade Analysis', description: 'AI analyzed 24 of your trades to improve prediction model', feedback: null },
    { id: 2, date: '2023-10-28', action: 'Strategy Calibration', description: 'AI adjusted strategy based on your profit patterns', feedback: 'positive' },
    { id: 3, date: '2023-10-15', action: 'Risk Assessment', description: 'AI evaluated your risk tolerance from trading behavior', feedback: null }
  ]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to an API
    setUserData({...formData});
    setIsEditing(false);
    showNotification('Profile updated successfully!');
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If canceling edit, reset form data to current user data
      setFormData({...userData});
    }
    setIsEditing(!isEditing);
  };

  // Show notification message
  const showNotification = (message) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this file to a server
      // Here we're just creating a local URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profileImage: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // AI Settings Handlers
  const handleAISettingChange = (setting, value) => {
    setFormData({
      ...formData,
      aiSettings: {
        ...formData.aiSettings,
        [setting]: value
      }
    });
  };
  
  // Watchlist Handlers
  const removeFromWatchlist = (id) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
    showNotification('Stock removed from watchlist');
  };
  
  const toggleAIAlert = (id) => {
    setWatchlist(watchlist.map(item => {
      if (item.id === id) {
        return {
          ...item,
          alerts: {
            ...item.alerts,
            aiEnabled: !item.alerts.aiEnabled
          }
        };
      }
      return item;
    }));
  };
  
  // Broker Connection Handlers
  const toggleBrokerConnection = (id) => {
    setConnectedBrokers(connectedBrokers.map(broker => {
      if (broker.id === id) {
        const newStatus = broker.status === 'Connected' ? 'Disconnected' : 'Connected';
        return {
          ...broker,
          status: newStatus,
          lastSync: newStatus === 'Connected' ? new Date().toLocaleString() : broker.lastSync
        };
      }
      return broker;
    }));
    showNotification('Broker connection updated');
  };
  
  // AI Training Feedback
  const provideFeedback = (id, type) => {
    setAiTrainingHistory(aiTrainingHistory.map(item => {
      if (item.id === id) {
        return {
          ...item,
          feedback: type
        };
      }
      return item;
    }));
    showNotification('Feedback submitted. Thank you!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account and trading preferences
            </p>
          </div>
          <Button 
            variant={isEditing ? "default" : "outline"}
            onClick={isEditing ? handleSubmit : toggleEditMode}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="brokers">Brokers</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Image Card */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="text-primary" size={20} />
                  <span>Profile Photo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Avatar className="w-32 h-32 mx-auto">
                  <AvatarImage src={formData.profileImage} alt="Profile" />
                  <AvatarFallback className="text-2xl">
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label htmlFor="profile-image-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Camera className="w-4 h-4 mr-2" />
                          Change Photo
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{userData.firstName} {userData.lastName}</h3>
                  <Badge variant="secondary">@{userData.username}</Badge>
                  <Badge variant="outline" className="ml-2">{userData.tradingExperience}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="trading-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="text-primary" size={20} />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Status */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="text-primary" size={20} />
                  <span>Account Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Verification Status</span>
                  <Badge variant="default">{userData.verificationStatus}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subscription Plan</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    <Crown className="w-3 h-3 mr-1" />
                    {userData.subscriptionPlan}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Member Since</span>
                  <span className="font-medium">{userData.joinDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next Billing</span>
                  <span className="font-medium">{userData.nextBillingDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="text-primary" size={20} />
                  <span>Usage Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>API Calls</span>
                    <span className="font-medium">{userData.usageStats.apiCalls.toLocaleString()}</span>
                  </div>
                  <Progress value={42} className="w-full" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Trades Executed</span>
                    <span className="font-medium">{userData.usageStats.tradesExecuted}</span>
                  </div>
                  <Progress value={78} className="w-full" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>AI Predictions</span>
                    <span className="font-medium">{userData.usageStats.predictionsReceived}</span>
                  </div>
                  <Progress value={65} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Settings Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="text-primary" size={20} />
                <span>AI Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Risk Tolerance: {formData.aiSettings.riskTolerance}%</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.aiSettings.riskTolerance}
                    onChange={(e) => handleAISettingChange('riskTolerance', parseInt(e.target.value))}
                    className="w-full"
                    disabled={!isEditing}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Confidence Threshold: {formData.aiSettings.confidenceThreshold}%</Label>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={formData.aiSettings.confidenceThreshold}
                    onChange={(e) => handleAISettingChange('confidenceThreshold', parseInt(e.target.value))}
                    className="w-full"
                    disabled={!isEditing}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>50%</span>
                    <span>95%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategy">Trading Strategy</Label>
                  <Input
                    id="strategy"
                    value={formData.aiSettings.strategy}
                    onChange={(e) => handleAISettingChange('strategy', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="text-primary" size={20} />
                <span>My Watchlist</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>AI Alerts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchlist.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">{stock.symbol}</TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell>${stock.price}</TableCell>
                      <TableCell className={stock.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={stock.alerts.aiEnabled}
                          onCheckedChange={() => toggleAIAlert(stock.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWatchlist(stock.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brokers Tab */}
        <TabsContent value="brokers" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="text-primary" size={20} />
                <span>Connected Brokers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedBrokers.map((broker) => (
                  <div key={broker.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{broker.name}</h4>
                      <p className="text-sm text-muted-foreground">Last sync: {broker.lastSync}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={broker.status === 'Connected' ? 'default' : 'secondary'}>
                        {broker.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleBrokerConnection(broker.id)}
                      >
                        {broker.status === 'Connected' ? (
                          <Unlink className="w-4 h-4" />
                        ) : (
                          <Link className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="text-primary" size={20} />
                  <span>Referral Program</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Referral Code</span>
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {referralData.code}
                      </code>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Earnings</span>
                    <span className="font-medium text-green-600">${referralData.earnings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Users Referred</span>
                    <span className="font-medium">{referralData.usersReferred}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending Invites</span>
                    <span className="font-medium">{referralData.pendingInvites}</span>
                  </div>
                </div>
                <Separator />
                <Button className="w-full">
                  <Share className="w-4 h-4 mr-2" />
                  Share Referral Link
                </Button>
              </CardContent>
            </Card>

            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="text-primary" size={20} />
                  <span>AI Training History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiTrainingHistory.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{item.action}</h4>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      {item.feedback === null && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => provideFeedback(item.id, 'positive')}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => provideFeedback(item.id, 'negative')}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      {item.feedback && (
                        <Badge variant="secondary" className="text-xs">
                          Feedback: {item.feedback}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
