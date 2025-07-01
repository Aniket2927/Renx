import { Switch, Route } from "wouter";
import { Header } from "@/components/Layout/Header";
import { Sidebar } from "@/components/Layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

// UI Components for professional placeholder designs
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch as UISwitch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Gauge, 
  Shield, 
  FileText, 
  Database, 
  Brain, 
  Network, 
  Bell, 
  Activity, 
  DollarSign,
  Settings as SettingsIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Star,
  Clock,
  Users,
  CreditCard
} from "lucide-react";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Trading from "@/pages/Trading";
import Portfolio from "@/pages/Portfolio";
import AISignals from "@/pages/AISignals";
import MarketScanner from "@/pages/MarketScanner";
import Screening from "@/pages/Screening";
import RiskManagement from "@/pages/RiskManagement";
import Backtesting from "@/pages/Backtesting";
import Community from "@/pages/Community";
import News from "@/pages/News";
import Settings from "@/pages/Settings";
import AdvancedAnalytics from "@/pages/AdvancedAnalytics";
import Diagnostics from "@/pages/Diagnostics";
import NotFound from "@/pages/not-found";

// Components for Profile
// @ts-ignore - JSX component without types
import ProfilePage from "@/components/profile/ProfilePage";

// Professional Placeholder Components with Shadcn/UI Design
const ThresholdConfig = () => (
  <div className="p-6 space-y-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Threshold Configuration</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Configure trading thresholds and risk limits per tenant
      </p>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gauge className="text-primary" size={20} />
            <span>Trading Limits</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxOrderSize">Max Order Size</Label>
              <Input id="maxOrderSize" placeholder="$10,000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLeverage">Max Leverage</Label>
              <Input id="maxLeverage" placeholder="10:1" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Position Limits</Label>
              <p className="text-sm text-muted-foreground">Limit maximum position size</p>
            </div>
            <UISwitch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="text-primary" size={20} />
            <span>Risk Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyLoss">Daily Loss Limit</Label>
              <Input id="dailyLoss" placeholder="$5,000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drawdown">Max Drawdown</Label>
              <Input id="drawdown" placeholder="15%" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto Risk Management</Label>
              <p className="text-sm text-muted-foreground">Automatically manage risk exposure</p>
            </div>
            <UISwitch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>

    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <SettingsIcon className="text-primary" size={20} />
          <span>Execution Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="slippage">Slippage Tolerance</Label>
            <Input id="slippage" placeholder="0.5%" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeout">Execution Timeout</Label>
            <Input id="timeout" placeholder="30 seconds" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retries">Max Retries</Label>
            <Input id="retries" placeholder="3" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const Compliance = () => (
  <div className="p-6 space-y-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance & Regulatory</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Compliance monitoring and regulatory reporting tools
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="text-primary" size={20} />
            <span>Trade Surveillance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium">Pattern Detection</h4>
              <p className="text-sm text-muted-foreground">Monitor for unusual trading patterns</p>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={16} />
              <Badge variant="default">Active</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium">Volume Analysis</h4>
              <p className="text-sm text-muted-foreground">Detect suspicious volume spikes</p>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={16} />
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="text-primary" size={20} />
            <span>Regulatory Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Daily Trading Report</span>
              <Badge variant="secondary">Generated</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Risk Assessment</span>
              <Badge variant="secondary">Generated</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Position Report</span>
              <Badge variant="outline">Pending</Badge>
            </div>
          </div>
          <Separator />
          <Button className="w-full">
            <FileText size={16} className="mr-2" />
            Generate Reports
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

const MarketData = () => (
  <div className="p-6 space-y-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Market Data Management</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Real-time and historical market data feeds
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="text-primary" size={20} />
            <span>TwelveData API</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Connection Status</span>
            <Badge className="bg-green-100 text-green-800">Connected</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>API Calls Today</span>
            <span className="font-medium">2,847</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Rate Limit</span>
            <span className="font-medium">5,000/day</span>
          </div>
          <Progress value={57} className="w-full" />
          <p className="text-sm text-muted-foreground">57% of daily limit used</p>
        </CardContent>
      </Card>

      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="text-primary" size={20} />
            <span>Historical Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Data Coverage</span>
            <Badge className="bg-blue-100 text-blue-800">20+ Years</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Symbols Available</span>
            <span className="font-medium">50,000+</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Exchanges</span>
            <span className="font-medium">120+</span>
          </div>
          <Button variant="outline" className="w-full">
            <Database size={16} className="mr-2" />
            Browse Data
          </Button>
        </CardContent>
      </Card>

      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="text-primary" size={20} />
            <span>Real-time Feeds</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Active Streams</span>
            <span className="font-medium">1,247</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Latency</span>
            <span className="font-medium text-green-600">&lt; 50ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Uptime</span>
            <span className="font-medium">99.9%</span>
          </div>
          <div className="text-center py-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-1">Live</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const SentimentAnalysis = () => (
  <div className="p-6 space-y-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sentiment Analysis</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        AI-powered market sentiment analysis and social media monitoring
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="trading-card text-center">
        <CardContent className="p-6">
          <div className="text-4xl font-bold text-green-600 mb-2">72%</div>
          <h3 className="font-semibold mb-1">Bullish Sentiment</h3>
          <p className="text-sm text-muted-foreground">Market optimism index</p>
          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mt-2" />
        </CardContent>
      </Card>

      <Card className="trading-card text-center">
        <CardContent className="p-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">68</div>
          <h3 className="font-semibold mb-1">Fear & Greed Index</h3>
          <p className="text-sm text-muted-foreground">Market emotion gauge</p>
          <Brain className="w-6 h-6 text-blue-600 mx-auto mt-2" />
        </CardContent>
      </Card>

      <Card className="trading-card text-center">
        <CardContent className="p-6">
          <div className="text-4xl font-bold text-purple-600 mb-2">84%</div>
          <h3 className="font-semibold mb-1">AI Confidence</h3>
          <p className="text-sm text-muted-foreground">Model accuracy score</p>
          <Star className="w-6 h-6 text-purple-600 mx-auto mt-2" />
        </CardContent>
      </Card>
    </div>

    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="text-primary" size={20} />
          <span>Sentiment Sources</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium">Social Media</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Twitter/X</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Reddit</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Discord</span>
                <Badge variant="secondary">Monitoring</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">News Sources</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Financial News</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Press Releases</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Analyst Reports</span>
                <Badge variant="secondary">Monitoring</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const CorrelationMatrix = () => (
  <div className="p-6 space-y-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Correlation Analysis</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Asset correlation analysis and portfolio diversification insights
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="text-primary" size={20} />
            <span>Correlation Matrix</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Interactive Matrix</h3>
            <p className="text-sm text-muted-foreground">
              Correlation heatmap will be displayed here
            </p>
            <Button variant="outline" className="mt-4">
              <TrendingUp size={16} className="mr-2" />
              Generate Matrix
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="text-primary" size={20} />
            <span>Diversification Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Portfolio Diversification</span>
              <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
            </div>
            <Progress value={65} className="w-full" />
            <p className="text-sm text-muted-foreground">65% diversified</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium">High Correlation Pairs</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>AAPL - MSFT</span>
                <span className="font-medium">0.78</span>
              </div>
              <div className="flex justify-between">
                <span>JPM - BAC</span>
                <span className="font-medium">0.82</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const Notifications = () => (
  <div className="p-6 space-y-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Center</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Manage alerts, notifications, and communication preferences
      </p>
    </div>

    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="text-primary" size={20} />
          <span>Notifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alerts" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
        <TabsTrigger value="signals">AI Signals</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
      </TabsList>

      <TabsContent value="alerts" className="space-y-4">
        {[
          { type: "Price Alert", message: "AAPL reached target price of $150", time: "2 min ago", status: "new", icon: TrendingUp },
          { type: "Stop Loss", message: "TSLA stop loss triggered at $220", time: "15 min ago", status: "urgent", icon: AlertTriangle },
          { type: "Target Hit", message: "MSFT reached profit target", time: "1 hour ago", status: "read", icon: CheckCircle }
        ].map((notification, i) => (
          <Card key={i} className={`trading-card ${notification.status === 'urgent' ? 'border-red-200' : notification.status === 'new' ? 'border-blue-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <notification.icon className={`w-5 h-5 mt-0.5 ${notification.status === 'urgent' ? 'text-red-500' : notification.status === 'new' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{notification.type}</h4>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="signals" className="space-y-4">
        {[
          { type: "AI Signal", message: "Strong buy signal detected for MSFT", time: "15 min ago", status: "new", confidence: 85 },
          { type: "Pattern Alert", message: "Bullish flag pattern forming on NVDA", time: "1 hour ago", status: "read", confidence: 72 }
        ].map((signal, i) => (
          <Card key={i} className="trading-card">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 mt-0.5 text-purple-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{signal.type}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{signal.confidence}% confidence</Badge>
                      <span className="text-xs text-muted-foreground">{signal.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{signal.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="system" className="space-y-4">
        {[
          { type: "System Update", message: "Platform updated to version 2.1.0", time: "2 hours ago", status: "read" },
          { type: "Maintenance", message: "Scheduled maintenance completed", time: "1 day ago", status: "read" }
        ].map((system, i) => (
          <Card key={i} className="trading-card">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                                 <SettingsIcon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{system.type}</h4>
                    <span className="text-xs text-muted-foreground">{system.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{system.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
      </CardContent>
    </Card>
  </div>
);

const AuditLogs = () => (
  <div className="p-6 space-y-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        System activity logs and security audit trail
      </p>
    </div>

    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="text-primary" size={20} />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { action: "User Login", user: "demo@renx.ai", time: "2024-06-24 10:30:15", details: "IP: 192.168.1.100", status: "success" },
              { action: "Trade Executed", user: "demo@renx.ai", time: "2024-06-24 10:25:42", details: "BUY AAPL 100 shares", status: "success" },
              { action: "Settings Changed", user: "admin@renx.ai", time: "2024-06-24 09:15:33", details: "Risk threshold updated", status: "success" },
              { action: "Login Attempt", user: "unknown", time: "2024-06-24 08:45:12", details: "IP: 203.0.113.1", status: "failed" }
            ].map((log, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell className="text-muted-foreground">{log.time}</TableCell>
                <TableCell className="text-muted-foreground">{log.details}</TableCell>
                <TableCell>
                  <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

const PricingBilling = () => (
  <div className="p-6 space-y-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing & Billing</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Subscription management and billing information
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-center">Free</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold">$0</div>
          <p className="text-muted-foreground">Basic features</p>
          <ul className="text-sm space-y-1 text-left">
            <li>• Basic market data</li>
            <li>• 5 watchlists</li>
            <li>• Standard charts</li>
          </ul>
          <Button variant="outline" className="w-full">Current Plan</Button>
        </CardContent>
      </Card>

      <Card className="trading-card border-2 border-primary relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
        </div>
        <CardHeader>
          <CardTitle className="text-center">Pro</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/month</span></div>
          <p className="text-muted-foreground">Advanced AI features</p>
          <ul className="text-sm space-y-1 text-left">
            <li>• Real-time AI signals</li>
            <li>• Advanced analytics</li>
            <li>• Unlimited watchlists</li>
            <li>• Portfolio optimization</li>
          </ul>
          <Button className="w-full">
            <CreditCard size={16} className="mr-2" />
            Upgrade Now
          </Button>
        </CardContent>
      </Card>

      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-center">Enterprise</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold">$99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
          <p className="text-muted-foreground">Full feature access</p>
          <ul className="text-sm space-y-1 text-left">
            <li>• Multi-tenant support</li>
            <li>• Custom integrations</li>
            <li>• Priority support</li>
            <li>• Advanced compliance</li>
          </ul>
          <Button variant="outline" className="w-full">
            <Users size={16} className="mr-2" />
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>

    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="text-primary" size={20} />
          <span>Billing Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium">Current Subscription</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Plan</span>
                <span className="font-medium">Pro Monthly</span>
              </div>
              <div className="flex justify-between">
                <span>Next Billing</span>
                <span className="font-medium">Dec 24, 2024</span>
              </div>
              <div className="flex justify-between">
                <span>Amount</span>
                <span className="font-medium">$29.00</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Payment Method</h4>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <CreditCard className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/26</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update Payment Method</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading RenX AI Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <>
          {/* Trading Core */}
          <Route path="/" component={Dashboard} />
          <Route path="/trading" component={Trading} />
          <Route path="/portfolio" component={Portfolio} />
          
          {/* AI & Analytics */}
          <Route path="/ai-signals" component={AISignals} />
          <Route path="/advanced-analytics" component={AdvancedAnalytics} />
          <Route path="/market-scanner" component={MarketScanner} />
          <Route path="/screening" component={Screening} />
          <Route path="/backtesting" component={Backtesting} />
          
          {/* Risk & Compliance */}
          <Route path="/risk-management" component={RiskManagement} />
          <Route path="/threshold-config" component={ThresholdConfig} />
          <Route path="/compliance" component={Compliance} />
          
          {/* Market Intelligence */}
          <Route path="/news" component={News} />
          <Route path="/market-data" component={MarketData} />
          <Route path="/sentiment" component={SentimentAnalysis} />
          <Route path="/correlation" component={CorrelationMatrix} />
          
          {/* Enterprise Tools */}
          <Route path="/community" component={Community} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/audit-logs" component={AuditLogs} />
          <Route path="/pricing" component={PricingBilling} />
          
          {/* User Management */}
          <Route path="/profile" component={ProfilePage} />
          <Route path="/settings" component={Settings} />
          
          {/* Development Tools */}
          <Route path="/diagnostics" component={Diagnostics} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && !isLoading ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto bg-background">
              <div className="h-full">
                <Router />
              </div>
            </main>
          </div>
        </div>
      ) : (
        <Router />
      )}
    </div>
  );
}

export default App;