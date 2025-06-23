import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Shield, 
  Zap, 
  BarChart3, 
  Activity,
  DollarSign,
  PieChart,
  AlertTriangle,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles
} from "lucide-react";

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface AISignal {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  timestamp: string;
}

interface PortfolioSummary {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: portfolio } = useQuery<PortfolioSummary>({
    queryKey: ['/api/portfolio/summary'],
    queryFn: async () => ({
      totalValue: 247890,
      dayChange: 3245,
      dayChangePercent: 1.33,
      totalReturn: 47890,
      totalReturnPercent: 23.87
    })
  });

  const { data: aiSignals } = useQuery<AISignal[]>({
    queryKey: ['/api/ai/signals/latest'],
    queryFn: async () => [
      {
        id: '1',
        symbol: 'AAPL',
        action: 'buy',
        confidence: 96,
        reasoning: 'Strong technical breakout with high volume confirmation',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        symbol: 'TSLA',
        action: 'sell',
        confidence: 89,
        reasoning: 'Overbought conditions detected, resistance at $250',
        timestamp: new Date().toISOString()
      }
    ]
  });

  const { data: marketData } = useQuery<MarketData[]>({
    queryKey: ['/api/market/indices'],
    queryFn: async () => [
      { symbol: 'SPY', price: 423.15, change: 3.42, changePercent: 0.81 },
      { symbol: 'QQQ', price: 354.22, change: 4.18, changePercent: 1.19 },
      { symbol: 'IWM', price: 198.76, change: -1.23, changePercent: -0.62 }
    ]
  });

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sell': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6 max-w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">AI Trading Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time insights powered by neural networks
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Market Time</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">Portfolio Value</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100 truncate">
                    ${portfolio?.totalValue?.toLocaleString() || '0'}
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                    <span className="text-sm text-green-600 truncate">+{portfolio?.dayChangePercent || 0}%</span>
                  </div>
                </div>
                <DollarSign className="w-6 h-6 text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 truncate">AI Confidence</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">94%</p>
                  <div className="flex items-center mt-1">
                    <Brain className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                    <span className="text-sm text-green-600 truncate">Neural Active</span>
                  </div>
                </div>
                <Sparkles className="w-6 h-6 text-green-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 truncate">Active Signals</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                    {aiSignals?.length || 0}
                  </p>
                  <div className="flex items-center mt-1">
                    <Zap className="w-3 h-3 text-purple-500 mr-1 flex-shrink-0" />
                    <span className="text-sm text-purple-600 truncate">Live Updates</span>
                  </div>
                </div>
                <Bot className="w-6 h-6 text-purple-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 truncate">Risk Score</p>
                  <p className="text-xl font-bold text-orange-900 dark:text-orange-100">Low</p>
                  <div className="flex items-center mt-1">
                    <Shield className="w-3 h-3 text-orange-500 mr-1 flex-shrink-0" />
                    <span className="text-sm text-orange-600 truncate">Protected</span>
                  </div>
                </div>
                <Target className="w-6 h-6 text-orange-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Signals */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Brain className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="truncate">AI Trading Signals</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex-shrink-0">Live</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {aiSignals?.map((signal) => (
                    <div key={signal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <span className="font-semibold text-lg truncate">{signal.symbol}</span>
                          <Badge className={`${getSignalColor(signal.action)} flex-shrink-0`}>
                            {signal.action.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-gray-500">Confidence</p>
                          <p className={`font-bold ${getConfidenceColor(signal.confidence)}`}>
                            {signal.confidence}%
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {signal.reasoning}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">Generated {new Date(signal.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Overview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Activity className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="truncate">Market Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {marketData?.map((data) => (
                    <div key={data.symbol} className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{data.symbol}</p>
                        <p className="text-sm text-gray-500 truncate">${data.price}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`flex items-center ${
                          data.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {data.change >= 0 ? (
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 mr-1" />
                          )}
                          <span className="font-semibold text-sm">
                            {data.changePercent >= 0 ? '+' : ''}{data.changePercent}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {data.change >= 0 ? '+' : ''}${data.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <PieChart className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="truncate">Portfolio Allocation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">Technology</span>
                      <span className="flex-shrink-0">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">Healthcare</span>
                      <span className="flex-shrink-0">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">Finance</span>
                      <span className="flex-shrink-0">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">Energy</span>
                      <span className="flex-shrink-0">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Insights Panel */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <span className="truncate">AI Market Insights</span>
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400 flex-shrink-0">
                Neural Analysis
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="truncate">Market Trend</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Strong bullish momentum detected across tech sector with institutional buying pressure.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  <span className="truncate">Volume Analysis</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Above-average volume in growth stocks suggests continued interest from institutions.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <Target className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                  <span className="truncate">Technical Signals</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Multiple breakout patterns forming in key market leaders with strong momentum.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}