import LiveTradingWidget from "@/components/Trading/LiveTradingWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Shield,
  Target
} from "lucide-react";

export default function TradingDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            AI-Powered Trading Platform
          </h1>
          <p className="text-gray-300 text-lg">
            Execute trades with neural network assistance and real-time market data from TwelveData API
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge className="bg-green-600 text-white">
              <Zap className="w-4 h-4 mr-1" />
              Markets Open
            </Badge>
            <Badge className="bg-blue-600 text-white">
              <Brain className="w-4 h-4 mr-1" />
              AI Active
            </Badge>
          </div>
        </div>

        {/* Main Trading Interface */}
        <LiveTradingWidget />

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <TrendingUp className="w-5 h-5" />
                <span>Real-Time Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Live market data powered by TwelveData API with real-time price updates, 
                volume tracking, and market cap calculations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-400">
                <Brain className="w-5 h-5" />
                <span>AI Assistant</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Neural network-powered trading assistant provides real-time risk analysis 
                and optimization suggestions for your trades.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <Shield className="w-5 h-5" />
                <span>Risk Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Advanced risk management with AI-powered position sizing, 
                stop-loss optimization, and portfolio balance monitoring.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span>Live Positions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <div>
                    <span className="font-semibold">AAPL</span>
                    <p className="text-sm text-gray-400">100 shares</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$18,975</p>
                    <p className="text-green-400 text-sm">+$455 (2.46%)</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                  <div>
                    <span className="font-semibold">TSLA</span>
                    <p className="text-sm text-gray-400">50 shares</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$12,265</p>
                    <p className="text-red-400 text-sm">-$160 (-1.29%)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-orange-500" />
                <span>AI Trading Signals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-900/20 border border-green-500/20 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">NVDA</span>
                    <Badge className="bg-green-600">Strong Buy</Badge>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    AI confidence: 87% • Target: $920
                  </p>
                </div>
                <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">MSFT</span>
                    <Badge className="bg-blue-600">Hold</Badge>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    AI confidence: 72% • Target: $385
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Integration Status */}
        <Card className="bg-slate-800 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle>TwelveData API Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">✓ Connected</div>
                <p className="text-gray-400">API Status</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">5s</div>
                <p className="text-gray-400">Update Interval</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">Real-time</div>
                <p className="text-gray-400">Data Quality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 