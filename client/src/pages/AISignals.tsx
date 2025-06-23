import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Filter,
  Bot,
  Sparkles,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Eye,
  Star,
  Layers,
  Network
} from "lucide-react";

interface AISignal {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  reasoning: string;
  technicalIndicators: {
    rsi: number;
    macd: number;
    volume: number;
    bollinger: string;
  };
  marketSentiment: number;
  riskLevel: 'low' | 'medium' | 'high';
  aiModel: string;
  expectedReturn: number;
  maxDrawdown: number;
  timestamp: string;
  status: 'active' | 'executed' | 'expired';
}

interface NeuralMetrics {
  totalSignals: number;
  activeSignals: number;
  successRate: number;
  avgConfidence: number;
  modelAccuracy: number;
  processingSpeed: number;
}

export default function AISignals() {
  const [timeframe, setTimeframe] = useState("1d");
  const [riskFilter, setRiskFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");

  const { data: signals, isLoading } = useQuery<AISignal[]>({
    queryKey: ['/api/ai/signals', timeframe, riskFilter, modelFilter],
    queryFn: async () => [
      {
        id: '1',
        symbol: 'AAPL',
        action: 'buy',
        confidence: 96,
        targetPrice: 195.50,
        stopLoss: 185.20,
        timeframe: '1d',
        reasoning: 'Neural pattern recognition detected strong bullish divergence with institutional accumulation. Volume profile shows significant buying pressure at key support levels.',
        technicalIndicators: {
          rsi: 58.4,
          macd: 2.34,
          volume: 89.2,
          bollinger: 'middle'
        },
        marketSentiment: 78,
        riskLevel: 'low',
        aiModel: 'DeepTrade V3.2',
        expectedReturn: 8.5,
        maxDrawdown: 3.2,
        timestamp: new Date().toISOString(),
        status: 'active'
      },
      {
        id: '2',
        symbol: 'TSLA',
        action: 'sell',
        confidence: 89,
        targetPrice: 240.00,
        stopLoss: 255.80,
        timeframe: '4h',
        reasoning: 'Advanced momentum algorithms identified overbought conditions with weakening institutional support. Risk-reward ratio favors short position.',
        technicalIndicators: {
          rsi: 78.2,
          macd: -1.45,
          volume: 145.8,
          bollinger: 'upper'
        },
        marketSentiment: 34,
        riskLevel: 'medium',
        aiModel: 'Quantum Alpha',
        expectedReturn: 6.2,
        maxDrawdown: 4.8,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'active'
      },
      {
        id: '3',
        symbol: 'NVDA',
        action: 'buy',
        confidence: 94,
        targetPrice: 920.00,
        stopLoss: 845.00,
        timeframe: '1d',
        reasoning: 'Multi-layer neural network detected AI sector rotation with strong earnings momentum. Semiconductor cycle analysis shows bullish reversal.',
        technicalIndicators: {
          rsi: 64.7,
          macd: 5.67,
          volume: 167.3,
          bollinger: 'middle'
        },
        marketSentiment: 85,
        riskLevel: 'low',
        aiModel: 'NeuralNet Pro',
        expectedReturn: 12.8,
        maxDrawdown: 5.1,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'active'
      }
    ]
  });

  const { data: metrics } = useQuery<NeuralMetrics>({
    queryKey: ['/api/ai/metrics'],
    queryFn: async () => ({
      totalSignals: 247,
      activeSignals: 18,
      successRate: 94.2,
      avgConfidence: 87.5,
      modelAccuracy: 96.8,
      processingSpeed: 0.34
    })
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sell': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getConfidenceBar = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredSignals = signals?.filter(signal => {
    if (riskFilter !== 'all' && signal.riskLevel !== riskFilter) return false;
    if (modelFilter !== 'all' && !signal.aiModel.toLowerCase().includes(modelFilter.toLowerCase())) return false;
    return true;
  }) || [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6 max-w-full">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Trading Signals</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Advanced neural network analysis with real-time market insights
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Neural Networks Active
            </Badge>
          </div>
        </div>

        {/* AI Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Signals</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {metrics?.activeSignals || 0}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {metrics?.totalSignals || 0} total generated
                  </p>
                </div>
                <Brain className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Success Rate</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {metrics?.successRate || 0}%
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    AI Model Accuracy: {metrics?.modelAccuracy || 0}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg Confidence</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {metrics?.avgConfidence || 0}%
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    High precision signals
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Processing Speed</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {metrics?.processingSpeed || 0}ms
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Real-time analysis
                  </p>
                </div>
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span>Signal Filters & Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeframe:</span>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Minute</SelectItem>
                    <SelectItem value="5m">5 Minutes</SelectItem>
                    <SelectItem value="15m">15 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="4h">4 Hours</SelectItem>
                    <SelectItem value="1d">1 Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Level:</span>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Model:</span>
                <Select value={modelFilter} onValueChange={setModelFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    <SelectItem value="deeptrade">DeepTrade V3.2</SelectItem>
                    <SelectItem value="quantum">Quantum Alpha</SelectItem>
                    <SelectItem value="neural">NeuralNet Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="btn-ai ml-auto">
                <Bot className="w-4 h-4 mr-2" />
                Generate New Signals
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Signals Grid */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Processing neural networks...</p>
            </div>
          ) : (
            filteredSignals.map((signal) => (
              <Card key={signal.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Signal Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{signal.symbol}</span>
                            <Badge className={getActionColor(signal.action)}>
                              {signal.action.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Network className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{signal.aiModel}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-500">Confidence</span>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {signal.confidence}%
                            </Badge>
                          </div>
                          <Progress value={signal.confidence} className={`w-24 h-2 ${getConfidenceBar(signal.confidence)}`} />
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {signal.reasoning}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Target Price</p>
                          <p className="font-semibold text-green-600">${signal.targetPrice}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Stop Loss</p>
                          <p className="font-semibold text-red-600">${signal.stopLoss}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Expected Return</p>
                          <p className="font-semibold text-blue-600">{signal.expectedReturn}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Max Drawdown</p>
                          <p className="font-semibold text-orange-600">{signal.maxDrawdown}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Date(signal.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Risk:</span>
                            <span className={`text-sm font-medium ${getRiskColor(signal.riskLevel)}`}>
                              {signal.riskLevel.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>

                    {/* Technical Indicators */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Technical Analysis
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">RSI</span>
                          <span className="font-medium">{signal.technicalIndicators.rsi}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">MACD</span>
                          <span className={`font-medium ${signal.technicalIndicators.macd > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {signal.technicalIndicators.macd}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Volume</span>
                          <span className="font-medium">{signal.technicalIndicators.volume}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Bollinger</span>
                          <span className="font-medium capitalize">{signal.technicalIndicators.bollinger}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Market Sentiment</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={signal.marketSentiment} className="w-16 h-2" />
                            <span className="text-sm font-medium">{signal.marketSentiment}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Neural Network Insights */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span>Neural Network Insights</span>
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400">
                Deep Learning
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patterns" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="patterns">Pattern Recognition</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
                <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
                <TabsTrigger value="correlation">Market Correlation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="patterns" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                      Bullish Patterns
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Detected 23 bullish reversal patterns across tech sector with high conviction scores.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <BarChart3 className="w-4 h-4 text-blue-500 mr-2" />
                      Breakout Signals
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      AI identified 7 potential breakouts with volume confirmation and momentum support.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <Target className="w-4 h-4 text-purple-500 mr-2" />
                      Support/Resistance
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dynamic S/R levels calculated using neural networks show key inflection points.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="sentiment" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Overall Market Sentiment</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">Bullish trend detected across multiple timeframes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">+68%</p>
                      <p className="text-sm text-green-500">Confidence: 94%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-3">Sector Sentiment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Technology</span>
                          <span className="text-sm font-semibold text-green-600">+72%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Healthcare</span>
                          <span className="text-sm font-semibold text-green-600">+45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Finance</span>
                          <span className="text-sm font-semibold text-yellow-600">+12%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Social Indicators</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Reddit Mentions</span>
                          <Badge className="bg-green-100 text-green-800">+24%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Twitter Sentiment</span>
                          <Badge className="bg-blue-100 text-blue-800">Positive</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="volume" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Volume Profile Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">Institutional Flow</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">Large block trades detected in growth stocks</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-purple-900 dark:text-purple-100">Smart Money Flow</p>
                          <p className="text-sm text-purple-700 dark:text-purple-300">AI tracking unusual options activity</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Volume Indicators</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Daily Volume</span>
                        <span className="text-sm font-semibold">+34% above normal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Dark Pool Activity</span>
                        <span className="text-sm font-semibold text-yellow-600">Elevated</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Put/Call Ratio</span>
                        <span className="text-sm font-semibold text-green-600">0.67 (Bullish)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="correlation" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-3">Market Correlations</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">SPY Correlation</span>
                          <span className="text-sm font-semibold">0.85</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">VIX Inverse</span>
                          <span className="text-sm font-semibold">-0.72</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Dollar Strength</span>
                          <span className="text-sm font-semibold">-0.43</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Sector Rotation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Into Tech</span>
                          <Badge className="bg-green-100 text-green-800">Strong</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Out of Utilities</span>
                          <Badge className="bg-red-100 text-red-800">Moderate</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}