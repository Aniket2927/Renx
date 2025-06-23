import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import ThemeSelector from "@/components/Layout/ThemeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { History, Play, TrendingUp, Award, BarChart3, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useRef } from "react";

export default function Backtesting() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const equityChartRef = useRef<HTMLCanvasElement>(null);
  
  const [strategyData, setStrategyData] = useState({
    name: "",
    description: "",
    entryCondition: "rsi_oversold",
    exitCondition: "rsi_overbought",
    timeframe: "1d",
    initialCapital: "100000",
    positionSize: "10",
    commission: "0.1",
    startDate: "",
    endDate: "",
    assetUniverse: "sp500"
  });

  const [isRunning, setIsRunning] = useState(false);

  // Fetch user strategies
  const { data: strategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ["/api/strategies"],
    enabled: isAuthenticated,
  });

  // Mock backtest results for demonstration
  const mockResults = {
    totalReturn: 24.6,
    sharpeRatio: 1.42,
    maxDrawdown: -8.2,
    winRate: 68,
    totalTrades: 147,
    profitFactor: 1.85,
    finalValue: 124600,
    annualizedReturn: 12.3,
    volatility: 15.2,
    beta: 0.89
  };

  // Draw equity curve
  useEffect(() => {
    if (!equityChartRef.current) return;

    const canvas = equityChartRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate mock equity curve data
    const dataPoints = 100;
    const data = [];
    let value = 100000;
    
    for (let i = 0; i < dataPoints; i++) {
      // Simulate strategy performance with some volatility
      const randomReturn = (Math.random() - 0.45) * 0.02; // Slight positive bias
      value *= (1 + randomReturn);
      data.push(value);
    }

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue;

    // Draw grid
    ctx.strokeStyle = "rgba(156, 163, 175, 0.2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Horizontal grid lines
    for (let i = 1; i < 5; i++) {
      const y = (canvas.height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 1; i < 5; i++) {
      const x = (canvas.width / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Draw equity curve
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.3)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0.05)");

    ctx.fillStyle = gradient;
    ctx.strokeStyle = "rgb(16, 185, 129)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    
    const stepX = canvas.width / (dataPoints - 1);
    
    data.forEach((value, index) => {
      const x = index * stepX;
      const y = canvas.height - ((value - minValue) / valueRange) * canvas.height * 0.8 - canvas.height * 0.1;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Create fill area
    const lastX = (dataPoints - 1) * stepX;
    const lastY = canvas.height - ((data[dataPoints - 1] - minValue) / valueRange) * canvas.height * 0.8 - canvas.height * 0.1;
    
    ctx.lineTo(lastX, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Draw line on top
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = index * stepX;
      const y = canvas.height - ((value - minValue) / valueRange) * canvas.height * 0.8 - canvas.height * 0.1;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

  }, []);

  const runBacktest = () => {
    if (!strategyData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a strategy name",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    
    // Simulate backtest running
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "Backtest Complete",
        description: "Strategy backtesting completed successfully",
      });
    }, 3000);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen">
        <Header 
          title="Backtesting" 
          subtitle="Test strategies on historical data"
        />
        
        <div className="p-6">
          <Tabs defaultValue="builder" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="builder">Strategy Builder</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Strategy Builder */}
            <TabsContent value="builder" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Strategy Configuration */}
                <div className="lg:col-span-2">
                  <Card className="trading-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="text-primary" size={20} />
                        <span>Strategy Builder</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="strategyName">Strategy Name</Label>
                          <Input
                            id="strategyName"
                            placeholder="My Strategy"
                            value={strategyData.name}
                            onChange={(e) => setStrategyData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="timeframe">Timeframe</Label>
                          <Select value={strategyData.timeframe} onValueChange={(value) => setStrategyData(prev => ({ ...prev, timeframe: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1d">1 Day</SelectItem>
                              <SelectItem value="1h">1 Hour</SelectItem>
                              <SelectItem value="15m">15 Minutes</SelectItem>
                              <SelectItem value="5m">5 Minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="entryCondition">Entry Condition</Label>
                          <Select value={strategyData.entryCondition} onValueChange={(value) => setStrategyData(prev => ({ ...prev, entryCondition: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rsi_oversold">RSI Oversold (&lt; 30)</SelectItem>
                              <SelectItem value="macd_bullish">MACD Bullish Crossover</SelectItem>
                              <SelectItem value="price_above_ma">Price Above MA(20)</SelectItem>
                              <SelectItem value="volume_spike">Volume Spike</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="exitCondition">Exit Condition</Label>
                          <Select value={strategyData.exitCondition} onValueChange={(value) => setStrategyData(prev => ({ ...prev, exitCondition: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rsi_overbought">RSI Overbought (&gt; 70)</SelectItem>
                              <SelectItem value="macd_bearish">MACD Bearish Crossover</SelectItem>
                              <SelectItem value="profit_target">5% Profit Target</SelectItem>
                              <SelectItem value="stop_loss">3% Stop Loss</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="initialCapital">Initial Capital</Label>
                          <Input
                            id="initialCapital"
                            type="number"
                            placeholder="100000"
                            value={strategyData.initialCapital}
                            onChange={(e) => setStrategyData(prev => ({ ...prev, initialCapital: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="positionSize">Position Size (%)</Label>
                          <Input
                            id="positionSize"
                            type="number"
                            placeholder="10"
                            value={strategyData.positionSize}
                            onChange={(e) => setStrategyData(prev => ({ ...prev, positionSize: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="commission">Commission (%)</Label>
                          <Input
                            id="commission"
                            type="number"
                            placeholder="0.1"
                            step="0.01"
                            value={strategyData.commission}
                            onChange={(e) => setStrategyData(prev => ({ ...prev, commission: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="Strategy description..."
                          value={strategyData.description}
                          onChange={(e) => setStrategyData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <Button 
                        onClick={runBacktest} 
                        disabled={isRunning}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isRunning ? (
                          <>
                            <div className="loading-spinner mr-2" />
                            Running Backtest...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2" size={16} />
                            Run Backtest
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Backtest Settings */}
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle>Backtest Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={strategyData.startDate}
                        onChange={(e) => setStrategyData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={strategyData.endDate}
                        onChange={(e) => setStrategyData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="assetUniverse">Asset Universe</Label>
                      <Select value={strategyData.assetUniverse} onValueChange={(value) => setStrategyData(prev => ({ ...prev, assetUniverse: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sp500">S&P 500 Stocks</SelectItem>
                          <SelectItem value="nasdaq100">NASDAQ 100</SelectItem>
                          <SelectItem value="custom">Custom List</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dataQuality">Data Quality</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="High (Tick Data)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High (Tick Data)</SelectItem>
                          <SelectItem value="medium">Medium (1min bars)</SelectItem>
                          <SelectItem value="standard">Standard (Daily)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {isRunning && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>65%</span>
                        </div>
                        <Progress value={65} />
                        <p className="text-xs text-muted-foreground">Processing historical data...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Results */}
            <TabsContent value="results" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="text-primary" size={20} />
                      <span>Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-muted-foreground text-sm mb-1">Total Return</h4>
                        <p className="text-2xl font-bold text-green-500">{formatPercent(mockResults.totalReturn)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-muted-foreground text-sm mb-1">Sharpe Ratio</h4>
                        <p className="text-2xl font-bold">{mockResults.sharpeRatio}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-muted-foreground text-sm mb-1">Max Drawdown</h4>
                        <p className="text-2xl font-bold text-red-500">{formatPercent(mockResults.maxDrawdown)}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-muted-foreground text-sm mb-1">Win Rate</h4>
                        <p className="text-2xl font-bold text-green-500">{mockResults.winRate}%</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-muted-foreground text-sm mb-1">Total Trades</h4>
                        <p className="text-2xl font-bold">{mockResults.totalTrades}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="text-muted-foreground text-sm mb-1">Profit Factor</h4>
                        <p className="text-2xl font-bold text-green-500">{mockResults.profitFactor}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Equity Curve */}
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="text-primary" size={20} />
                      <span>Equity Curve</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="chart-container">
                      <canvas
                        ref={equityChartRef}
                        className="w-full h-full"
                        style={{ height: "250px" }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Metrics */}
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Risk Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annualized Return</span>
                          <span className="font-medium">{formatPercent(mockResults.annualizedReturn)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Volatility</span>
                          <span className="font-medium">{formatPercent(mockResults.volatility)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Beta</span>
                          <span className="font-medium">{mockResults.beta}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Trading Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Trade Duration</span>
                          <span className="font-medium">3.2 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Best Trade</span>
                          <span className="font-medium text-green-500">+12.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Worst Trade</span>
                          <span className="font-medium text-red-500">-4.2%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Benchmark Comparison</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">S&P 500 Return</span>
                          <span className="font-medium">+18.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Alpha</span>
                          <span className="font-medium text-green-500">+6.4%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Information Ratio</span>
                          <span className="font-medium">1.24</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="space-y-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="text-primary" size={20} />
                    <span>Backtest History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {strategiesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="loading-spinner"></div>
                    </div>
                  ) : strategies && strategies.length > 0 ? (
                    <div className="space-y-4">
                      {strategies.map((strategy: any) => (
                        <div key={strategy.id} className="p-4 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{strategy.name}</h4>
                              <p className="text-sm text-muted-foreground">{strategy.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={strategy.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {strategy.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                Created {new Date(strategy.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History size={48} className="mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No strategies found</h3>
                      <p className="text-sm">Create your first strategy to see backtest results here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
