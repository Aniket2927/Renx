import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  Brain, 
  Activity, 
  Target,
  Shield,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Bot,
  Layers,
  Eye,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw
} from "lucide-react";

interface Quote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  marketCap?: number;
}

interface Order {
  id?: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
  status?: 'pending' | 'filled' | 'cancelled' | 'rejected';
  filledQuantity?: number;
  avgFillPrice?: number;
  timestamp?: string;
}

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  dayPL: number;
  dayPLPercent: number;
}

interface TradingBot {
  id: string;
  name: string;
  strategy: string;
  status: 'running' | 'paused' | 'stopped';
  performance: number;
  trades: number;
  winRate: number;
}

export default function Trading() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop' | 'stop_limit'>('market');
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [timeInForce, setTimeInForce] = useState<'day' | 'gtc' | 'ioc' | 'fok'>('day');
  const [aiAssist, setAiAssist] = useState(true);
  const [riskLevel, setRiskLevel] = useState([3]);
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();

  const { data: quote, isLoading: quoteLoading } = useQuery<Quote>({
    queryKey: ['/api/market/quote', selectedSymbol],
    queryFn: async () => ({
      symbol: selectedSymbol,
      price: selectedSymbol === 'AAPL' ? 189.75 : selectedSymbol === 'TSLA' ? 245.30 : 892.45,
      bid: selectedSymbol === 'AAPL' ? 189.70 : selectedSymbol === 'TSLA' ? 245.25 : 892.40,
      ask: selectedSymbol === 'AAPL' ? 189.80 : selectedSymbol === 'TSLA' ? 245.35 : 892.50,
      volume: Math.floor(Math.random() * 10000000),
      change: selectedSymbol === 'AAPL' ? 2.45 : selectedSymbol === 'TSLA' ? -3.20 : 12.80,
      changePercent: selectedSymbol === 'AAPL' ? 1.31 : selectedSymbol === 'TSLA' ? -1.29 : 1.45,
      high: selectedSymbol === 'AAPL' ? 191.20 : selectedSymbol === 'TSLA' ? 248.90 : 895.60,
      low: selectedSymbol === 'AAPL' ? 188.40 : selectedSymbol === 'TSLA' ? 243.10 : 887.20,
      open: selectedSymbol === 'AAPL' ? 187.30 : selectedSymbol === 'TSLA' ? 248.50 : 879.65,
      marketCap: selectedSymbol === 'AAPL' ? 2940000000000 : selectedSymbol === 'TSLA' ? 780000000000 : 2200000000000
    }),
    refetchInterval: 1000
  });

  const { data: positions } = useQuery<Position[]>({
    queryKey: ['/api/positions'],
    queryFn: async () => [
      {
        symbol: 'AAPL',
        quantity: 100,
        avgPrice: 185.20,
        marketValue: 18975,
        unrealizedPL: 455,
        unrealizedPLPercent: 2.46,
        dayPL: 245,
        dayPLPercent: 1.31
      },
      {
        symbol: 'TSLA',
        quantity: 50,
        avgPrice: 248.50,
        marketValue: 12265,
        unrealizedPL: -160,
        unrealizedPLPercent: -1.29,
        dayPL: -160,
        dayPLPercent: -1.29
      }
    ]
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    queryFn: async () => [
      {
        id: '1',
        symbol: 'NVDA',
        side: 'buy',
        type: 'limit',
        quantity: 25,
        price: 890.00,
        timeInForce: 'gtc',
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    ]
  });

  const { data: tradingBots } = useQuery<TradingBot[]>({
    queryKey: ['/api/trading-bots'],
    queryFn: async () => [
      {
        id: '1',
        name: 'AI Momentum Bot',
        strategy: 'Neural Momentum',
        status: 'running',
        performance: 18.7,
        trades: 247,
        winRate: 73.2
      },
      {
        id: '2',
        name: 'Risk Arbitrage Bot',
        strategy: 'Statistical Arbitrage',
        status: 'paused',
        performance: 12.4,
        trades: 89,
        winRate: 68.5
      }
    ]
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (order: Order) => {
      // Simulate API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/positions'] });
      // Reset form
      setQuantity("");
      setPrice("");
      setStopPrice("");
      setNotes("");
    }
  });

  const handlePlaceOrder = () => {
    if (!quote || !quantity) return;

    const order: Order = {
      symbol: selectedSymbol,
      side: orderSide,
      type: orderType,
      quantity: parseInt(quantity),
      price: orderType !== 'market' ? parseFloat(price) : undefined,
      stopPrice: (orderType === 'stop' || orderType === 'stop_limit') ? parseFloat(stopPrice) : undefined,
      timeInForce
    };

    placeOrderMutation.mutate(order);
  };

  const getOrderValue = () => {
    if (!quote || !quantity) return 0;
    const qty = parseInt(quantity);
    const orderPrice = orderType === 'market' ? quote.price : parseFloat(price || '0');
    return qty * orderPrice;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'stopped': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'filled': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6 max-w-full">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI-Powered Trading</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Execute trades with neural network assistance and real-time market data
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Markets Open
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <Brain className="w-3 h-3 mr-1" />
              AI Active
            </Badge>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Entry Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span>Order Entry</span>
                  {aiAssist && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      AI Assist
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Symbol Search */}
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AAPL">AAPL - Apple Inc.</SelectItem>
                      <SelectItem value="TSLA">TSLA - Tesla Inc.</SelectItem>
                      <SelectItem value="NVDA">NVDA - NVIDIA Corp.</SelectItem>
                      <SelectItem value="MSFT">MSFT - Microsoft Corp.</SelectItem>
                      <SelectItem value="GOOGL">GOOGL - Alphabet Inc.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Type and Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Order Side</Label>
                    <Tabs value={orderSide} onValueChange={(v) => setOrderSide(v as 'buy' | 'sell')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="buy" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
                          Buy
                        </TabsTrigger>
                        <TabsTrigger value="sell" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
                          Sell
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="space-y-2">
                    <Label>Order Type</Label>
                    <Select value={orderType} onValueChange={(v) => setOrderType(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                        <SelectItem value="stop">Stop</SelectItem>
                        <SelectItem value="stop_limit">Stop Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  {orderType !== 'market' && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Stop Price for Stop Orders */}
                {(orderType === 'stop' || orderType === 'stop_limit') && (
                  <div className="space-y-2">
                    <Label htmlFor="stopPrice">Stop Price ($)</Label>
                    <Input
                      id="stopPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={stopPrice}
                      onChange={(e) => setStopPrice(e.target.value)}
                    />
                  </div>
                )}

                {/* Time in Force */}
                <div className="space-y-2">
                  <Label>Time in Force</Label>
                  <Select value={timeInForce} onValueChange={(v) => setTimeInForce(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="gtc">Good Till Cancelled</SelectItem>
                      <SelectItem value="ioc">Immediate or Cancel</SelectItem>
                      <SelectItem value="fok">Fill or Kill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* AI Assistance Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <div>
                      <Label className="text-blue-900 dark:text-blue-100">AI Trading Assistant</Label>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Get real-time risk analysis and optimization suggestions
                      </p>
                    </div>
                  </div>
                  <Switch checked={aiAssist} onCheckedChange={setAiAssist} />
                </div>

                {/* Risk Level Slider */}
                {aiAssist && (
                  <div className="space-y-3">
                    <Label>Risk Tolerance</Label>
                    <div className="px-3">
                      <Slider
                        value={riskLevel}
                        onValueChange={setRiskLevel}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Conservative</span>
                        <span>Moderate</span>
                        <span>Aggressive</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this trade..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Value:</span>
                    <span className="font-semibold">${getOrderValue().toLocaleString()}</span>
                  </div>
                  {aiAssist && quote && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">AI Risk Score:</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Low
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!quantity || placeOrderMutation.isPending}
                  className={`w-full h-12 text-lg font-semibold ${
                    orderSide === 'buy' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {placeOrderMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Target className="w-4 h-4 mr-2" />
                  )}
                  {orderSide === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                </Button>
              </CardContent>
            </Card>

            {/* AI Trading Bots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  <span>AI Trading Bots</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tradingBots?.map((bot) => (
                    <div key={bot.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{bot.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{bot.strategy}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs">
                          <span className="text-green-600">+{bot.performance}%</span>
                          <span className="text-gray-500">{bot.trades} trades</span>
                          <span className="text-blue-600">{bot.winRate}% win rate</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(bot.status)}>
                          {bot.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {bot.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Data & Positions */}
          <div className="space-y-6">
            {/* Real-time Quote */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <span>{selectedSymbol}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quoteLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ) : quote ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${quote.price.toFixed(2)}
                        </span>
                        <div className={`flex items-center ${quote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {quote.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="ml-1 font-semibold">
                            {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Bid</span>
                        <p className="font-semibold">${quote.bid.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Ask</span>
                        <p className="font-semibold">${quote.ask.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">High</span>
                        <p className="font-semibold">${quote.high.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Low</span>
                        <p className="font-semibold">${quote.low.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Volume</span>
                        <p className="font-semibold">{quote.volume.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Market Cap</span>
                        <p className="font-semibold">
                          ${quote.marketCap ? (quote.marketCap / 1000000000).toFixed(1) + 'B' : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Current Positions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <span>Positions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {positions?.map((position) => (
                    <div key={position.symbol} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{position.symbol}</span>
                        <span className="text-sm text-gray-500">{position.quantity} shares</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Market Value</span>
                          <p className="font-semibold">${position.marketValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Unrealized P&L</span>
                          <p className={`font-semibold ${position.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${position.unrealizedPL} ({position.unrealizedPLPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Open Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span>Open Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders?.length ? orders.map((order) => (
                    <div key={order.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold">{order.symbol}</span>
                          <Badge className={`ml-2 ${getStatusColor(order.status || 'pending')}`}>
                            {order.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {order.side.toUpperCase()} {order.quantity} @ ${order.price?.toFixed(2)} ({order.type})
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">No open orders</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}