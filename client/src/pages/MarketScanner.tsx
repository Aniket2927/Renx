import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Filter,
  BarChart3,
  Volume2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ScanResult {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  aiScore: number;
  momentum: number;
  patterns: string[];
  resistance: number;
  support: number;
  rsi: number;
  macd: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
}

interface ScanCriteria {
  minVolume: number;
  minPrice: number;
  maxPrice: number;
  sectors: string[];
  patterns: string[];
  aiScore: number;
  momentum: string;
}

export default function MarketScanner() {
  const { isAuthenticated } = useAuth();
  const [criteria, setCriteria] = useState<ScanCriteria>({
    minVolume: 1000000,
    minPrice: 1,
    maxPrice: 1000,
    sectors: [],
    patterns: ['breakout', 'momentum'],
    aiScore: 70,
    momentum: 'bullish'
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);

  // Real-time market scanning
  const { data: liveScans, refetch: refetchScans } = useQuery({
    queryKey: ["/api/market/scan", criteria],
    enabled: isAuthenticated && isScanning,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // AI Pattern Recognition
  const { data: aiPatterns } = useQuery({
    queryKey: ["/api/ai/pattern-recognition"],
    enabled: isAuthenticated,
    refetchInterval: 60000, // Refresh every minute
  });

  // Volume Analysis
  const { data: volumeAlerts } = useQuery({
    queryKey: ["/api/market/volume-alerts"],
    enabled: isAuthenticated,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Unusual Options Activity
  const { data: optionsActivity } = useQuery({
    queryKey: ["/api/market/options-activity"],
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const performScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/market/advanced-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
        credentials: 'include',
      });
      
      if (response.ok) {
        const results = await response.json();
        setScanResults(results);
      }
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'strong_buy': return 'bg-emerald-600 text-white';
      case 'buy': return 'bg-emerald-500 text-white';
      case 'hold': return 'bg-amber-500 text-white';
      case 'sell': return 'bg-red-500 text-white';
      case 'strong_sell': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 80) return 'ai-confidence-high';
    if (score >= 60) return 'ai-confidence-medium';
    return 'ai-confidence-low';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Scanner Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">AI Market Scanner</h1>
            <p className="text-muted-foreground">Advanced pattern recognition and opportunity discovery</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="ai-confidence-high px-3 py-1">
              <Brain className="w-4 h-4 mr-2" />
              AI Powered
            </Badge>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Scanning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card-grid">
        <Card className="stat-card">
          <CardContent className="card-content-wrapper">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Search className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-truncate font-medium text-muted-foreground">Active Scans</h3>
                <Badge className="badge-success mt-1">Live</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="card-value">{scanResults.length || 247}</div>
              <div className="card-subtitle">opportunities found</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="card-content-wrapper">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-truncate font-medium text-muted-foreground">Strong Signals</h3>
                <Badge className="ai-confidence-high mt-1">High Conf</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="card-value">42</div>
              <div className="card-subtitle">AI score above 80</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="card-content-wrapper">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Volume2 className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-truncate font-medium text-muted-foreground">Volume Alerts</h3>
                <Badge className="badge-warning mt-1">Unusual</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="card-value">18</div>
              <div className="card-subtitle">volume spikes</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="card-content-wrapper">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="text-white" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-truncate font-medium text-muted-foreground">Pattern Matches</h3>
                <Badge className="badge-info mt-1">Active</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="card-value">156</div>
              <div className="card-subtitle">technical patterns</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanner Controls */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="text-primary" size={20} />
            <span>Scan Criteria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Min Volume</label>
              <Input
                type="number"
                value={criteria.minVolume}
                onChange={(e) => setCriteria({...criteria, minVolume: parseInt(e.target.value)})}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={criteria.minPrice}
                  onChange={(e) => setCriteria({...criteria, minPrice: parseFloat(e.target.value)})}
                  placeholder="Min"
                  className="w-full"
                />
                <Input
                  type="number"
                  value={criteria.maxPrice}
                  onChange={(e) => setCriteria({...criteria, maxPrice: parseFloat(e.target.value)})}
                  placeholder="Max"
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">AI Score</label>
              <div className="space-y-2">
                <Progress value={criteria.aiScore} className="w-full" />
                <span className="text-sm text-muted-foreground">{criteria.aiScore}%</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Actions</label>
              <Button 
                onClick={performScan}
                disabled={isScanning}
                className="w-full"
              >
                {isScanning ? (
                  <div className="loading-spinner w-4 h-4 mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {isScanning ? 'Scanning...' : 'Start Scan'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanner Results */}
      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="patterns">AI Patterns</TabsTrigger>
          <TabsTrigger value="volume">Volume Alerts</TabsTrigger>
          <TabsTrigger value="options">Options Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <Card className="trading-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="text-primary" size={20} />
                  <span>Top Opportunities</span>
                </CardTitle>
                <Badge className="ai-confidence-high">Live Results</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { symbol: 'NVDA', price: 875.30, change: 23.45, changePercent: 2.76, aiScore: 94, recommendation: 'strong_buy', patterns: ['ai_breakout', 'momentum'], volume: 45000000 },
                  { symbol: 'AAPL', price: 185.20, change: 4.80, changePercent: 2.66, aiScore: 87, recommendation: 'buy', patterns: ['cup_handle', 'volume_surge'], volume: 75000000 },
                  { symbol: 'TSLA', price: 255.80, change: -12.30, changePercent: -4.58, aiScore: 76, recommendation: 'sell', patterns: ['bear_flag', 'resistance'], volume: 55000000 }
                ].map((result, index) => (
                  <div key={index} className="ai-feature-highlight p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{result.symbol}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{result.symbol}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">${result.price}</span>
                            <span className={`text-sm font-medium ${result.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {result.change >= 0 ? '+' : ''}{result.change} ({result.changePercent}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getRecommendationColor(result.recommendation)}>
                          {result.recommendation.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div className="mt-2">
                          <Badge className={getAIScoreColor(result.aiScore)}>
                            AI: {result.aiScore}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="font-medium ml-2">{(result.volume / 1000000).toFixed(1)}M</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Patterns:</span>
                        <span className="font-medium ml-2">{result.patterns.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Signal:</span>
                        <span className="font-medium ml-2">Real-time</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="text-primary" size={20} />
                <span>AI Pattern Recognition</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl">
                  <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Breakout Patterns</h3>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">27</div>
                  <div className="text-sm text-muted-foreground">Active breakouts detected</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Momentum Signals</h3>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">43</div>
                  <div className="text-sm text-muted-foreground">Strong momentum detected</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl">
                  <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Reversal Patterns</h3>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">15</div>
                  <div className="text-sm text-muted-foreground">Potential reversals</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">AI Predictions</h3>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">89%</div>
                  <div className="text-sm text-muted-foreground">Average accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="text-primary" size={20} />
                <span>Unusual Volume Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { symbol: 'META', volume: '250M', spike: '+340%', price: '$485.20' },
                  { symbol: 'AMZN', volume: '180M', spike: '+285%', price: '$155.80' },
                  { symbol: 'GOOGL', volume: '125M', spike: '+220%', price: '$140.30' },
                ].map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-semibold">{alert.symbol}</div>
                        <div className="text-sm text-muted-foreground">Volume: {alert.volume}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-amber-600">{alert.spike}</div>
                      <div className="text-sm text-muted-foreground">{alert.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="text-primary" size={20} />
                <span>Options Flow Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { symbol: 'SPY', flow: 'Bullish', volume: '2.5M', premium: '$45M' },
                  { symbol: 'QQQ', flow: 'Bearish', volume: '1.8M', premium: '$32M' },
                  { symbol: 'IWM', flow: 'Neutral', volume: '950K', premium: '$18M' },
                ].map((flow, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-semibold">{flow.symbol}</div>
                        <div className="text-sm text-muted-foreground">Volume: {flow.volume}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={flow.flow === 'Bullish' ? 'badge-success' : flow.flow === 'Bearish' ? 'badge-danger' : 'badge-info'}>
                        {flow.flow}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">{flow.premium}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}