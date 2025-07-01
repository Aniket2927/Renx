import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  DollarSign, 
  Zap, 
  Globe,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Save,
  Download,
  Upload
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile Settings
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    timezone: "UTC",
    language: "en",
    avatar: user?.profileImageUrl || ""
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: false,
    tradingSignals: true,
    priceAlerts: true,
    newsUpdates: false,
    portfolioUpdates: true,
    riskAlerts: true,
    communityMessages: false,
    systemUpdates: true
  });

  // Trading Settings
  const [trading, setTrading] = useState({
    defaultOrderType: "market",
    confirmOrders: true,
    autoStopLoss: false,
    stopLossPercentage: 5,
    riskPerTrade: 2,
    maxPositions: 10,
    paperTrading: false,
    autoReinvest: false,
    dividendReinvestment: true
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    biometricLogin: false,
    sessionTimeout: 60,
    loginAlerts: true,
    deviceTracking: true,
    apiAccess: false
  });

  // Display Settings
  const [display, setDisplay] = useState({
    theme: "dark",
    compactMode: false,
    showAdvancedCharts: true,
    defaultChartType: "candlestick",
    currency: "USD",
    numberFormat: "US",
    timeFormat: "24h",
    showProfitLoss: true
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSaveProfile = async () => {
    try {
      // API call would go here
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      // API call would go here
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    }
  };

  const handleSaveTrading = async () => {
    try {
      // API call would go here
      toast({
        title: "Trading Settings Updated",
        description: "Your trading preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update trading settings.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSecurity = async () => {
    try {
      // API call would go here
      toast({
        title: "Security Settings Updated",
        description: "Your security preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings.",
        variant: "destructive",
      });
    }
  };

  const handleSaveDisplay = async () => {
    try {
      // API call would go here
      toast({
        title: "Display Settings Updated",
        description: "Your display preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update display settings.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Data Export Initiated",
      description: "Your data export will be ready in a few minutes. You'll receive an email when it's complete.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Data Import",
      description: "Please contact support for data import assistance.",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account and trading preferences
        </p>
      </div>
      
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User size={16} />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell size={16} />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center space-x-2">
              <DollarSign size={16} />
              <span className="hidden sm:inline">Trading</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield size={16} />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center space-x-2">
              <Palette size={16} />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="text-primary" size={20} />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={profile.timezone} onValueChange={(value) => setProfile({ ...profile, timezone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={profile.language} onValueChange={(value) => setProfile({ ...profile, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                  <Save size={16} className="mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="text-primary" size={20} />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive important notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get real-time push notifications</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Trading Signals</Label>
                      <p className="text-sm text-muted-foreground">AI-generated trading signals and recommendations</p>
                    </div>
                    <Switch
                      checked={notifications.tradingSignals}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, tradingSignals: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Price Alerts</Label>
                      <p className="text-sm text-muted-foreground">Alerts when watchlist prices hit targets</p>
                    </div>
                    <Switch
                      checked={notifications.priceAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, priceAlerts: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Portfolio Updates</Label>
                      <p className="text-sm text-muted-foreground">Daily portfolio performance summaries</p>
                    </div>
                    <Switch
                      checked={notifications.portfolioUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, portfolioUpdates: checked })}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveNotifications} className="w-full md:w-auto">
                  <Save size={16} className="mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Settings */}
          <TabsContent value="trading" className="space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="text-primary" size={20} />
                  <span>Trading Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default Order Type</Label>
                    <Select value={trading.defaultOrderType} onValueChange={(value) => setTrading({ ...trading, defaultOrderType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                        <SelectItem value="stop">Stop Order</SelectItem>
                        <SelectItem value="stop-limit">Stop-Limit Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Per Trade (%)</Label>
                    <Input
                      type="number"
                      value={trading.riskPerTrade}
                      onChange={(e) => setTrading({ ...trading, riskPerTrade: parseFloat(e.target.value) })}
                      min="0.1"
                      max="10"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Open Positions</Label>
                    <Input
                      type="number"
                      value={trading.maxPositions}
                      onChange={(e) => setTrading({ ...trading, maxPositions: parseInt(e.target.value) })}
                      min="1"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stop Loss Percentage</Label>
                    <Input
                      type="number"
                      value={trading.stopLossPercentage}
                      onChange={(e) => setTrading({ ...trading, stopLossPercentage: parseFloat(e.target.value) })}
                      min="1"
                      max="20"
                      step="0.5"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Confirm Orders</Label>
                      <p className="text-sm text-muted-foreground">Require confirmation before placing orders</p>
                    </div>
                    <Switch
                      checked={trading.confirmOrders}
                      onCheckedChange={(checked) => setTrading({ ...trading, confirmOrders: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto Stop Loss</Label>
                      <p className="text-sm text-muted-foreground">Automatically set stop loss on new positions</p>
                    </div>
                    <Switch
                      checked={trading.autoStopLoss}
                      onCheckedChange={(checked) => setTrading({ ...trading, autoStopLoss: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Paper Trading Mode</Label>
                      <p className="text-sm text-muted-foreground">Practice trading without real money</p>
                    </div>
                    <Switch
                      checked={trading.paperTrading}
                      onCheckedChange={(checked) => setTrading({ ...trading, paperTrading: checked })}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveTrading} className="w-full md:w-auto">
                  <Save size={16} className="mr-2" />
                  Save Trading Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="text-primary" size={20} />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={security.twoFactorAuth ? "default" : "secondary"}>
                        {security.twoFactorAuth ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={security.twoFactorAuth}
                        onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                    </div>
                    <Switch
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
                      min="15"
                      max="480"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSecurity} className="w-full md:w-auto">
                  <Save size={16} className="mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="text-primary" size={20} />
                  <span>Display Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={display.theme} onValueChange={(value) => setDisplay({ ...display, theme: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={display.currency} onValueChange={(value) => setDisplay({ ...display, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="BTC">BTC (₿)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Chart Type</Label>
                    <Select value={display.defaultChartType} onValueChange={(value) => setDisplay({ ...display, defaultChartType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candlestick">Candlestick</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="area">Area</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Format</Label>
                    <Select value={display.timeFormat} onValueChange={(value) => setDisplay({ ...display, timeFormat: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Hour</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Reduce spacing and show more data</p>
                    </div>
                    <Switch
                      checked={display.compactMode}
                      onCheckedChange={(checked) => setDisplay({ ...display, compactMode: checked })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Show Advanced Charts</Label>
                      <p className="text-sm text-muted-foreground">Display technical indicators and advanced tools</p>
                    </div>
                    <Switch
                      checked={display.showAdvancedCharts}
                      onCheckedChange={(checked) => setDisplay({ ...display, showAdvancedCharts: checked })}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveDisplay} className="w-full md:w-auto">
                  <Save size={16} className="mr-2" />
                  Save Display Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Management */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleExportData} variant="outline">
                <Download size={16} className="mr-2" />
                Export Data
              </Button>
              <Button onClick={handleImportData} variant="outline">
                <Upload size={16} className="mr-2" />
                Import Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}