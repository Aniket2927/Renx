import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target,
  RefreshCw,
  Brain,
  DollarSign
} from "lucide-react";

interface LiveQuote {
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
  lastUpdate: string;
  source: string;
}

interface OrderData {
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: string;
  price?: string;
  stopPrice?: string;
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
}

export default function LiveTradingWidget() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [quote, setQuote] = useState<LiveQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({
    symbol: "AAPL",
    side: 'buy',
    orderType: 'market',
    quantity: '',
    timeInForce: 'day'
  });
  const [aiAssist, setAiAssist] = useState(true);
  const [riskLevel, setRiskLevel] = useState([3]);
  const [placingOrder, setPlacingOrder] = useState(false);
  
  const { toast } = useToast();

  // Simulate real-time data fetching from TwelveData
  useEffect(() => {
    const fetchRealTimeData = async () => {
      setLoading(true);
      try {
        // Simulate API call to TwelveData - in production this would be real
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        const mockData: LiveQuote = {
          symbol: selectedSymbol,
          price: getRealtimePrice(selectedSymbol),
          bid: getRealtimePrice(selectedSymbol) - 0.05,
          ask: getRealtimePrice(selectedSymbol) + 0.05,
          volume: Math.floor(Math.random() * 10000000),
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
          high: getRealtimePrice(selectedSymbol) * 1.03,
          low: getRealtimePrice(selectedSymbol) * 0.97,
          open: getRealtimePrice(selectedSymbol) * 0.995,
          marketCap: getMarketCap(selectedSymbol),
          lastUpdate: new Date().toISOString(),
          source: 'TwelveData API'
        };
        
        setQuote(mockData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Data Error",
          description: "Failed to fetch real-time data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [selectedSymbol, toast]);

  // Update order symbol when selected symbol changes
  useEffect(() => {
    setOrderData(prev => ({ ...prev, symbol: selectedSymbol }));
  }, [selectedSymbol]);

  const getRealtimePrice = (symbol: string): number => {
    const basePrices: { [key: string]: number } = {
      'AAPL': 189.75,
      'TSLA': 245.30,
      'NVDA': 892.45,
      'MSFT': 378.85,
      'GOOGL': 142.65
    };
    
    const basePrice = basePrices[symbol] || 100;
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    return Math.round((basePrice * (1 + variation)) * 100) / 100;
  };

  const getMarketCap = (symbol: string): number => {
    const marketCaps: { [key: string]: number } = {
      'AAPL': 2940000000000,
      'TSLA': 780000000000,
      'NVDA': 2200000000000,
      'MSFT': 2800000000000,
      'GOOGL': 1750000000000
    };
    
    return marketCaps[symbol] || 500000000000;
  };

  const calculateOrderValue = (): number => {
    if (!orderData.quantity || !quote) return 0;
    
    const quantity = parseFloat(orderData.quantity);
    let price = quote.price;
    
    if (orderData.orderType === 'limit' && orderData.price) {
      price = parseFloat(orderData.price);
    } else if (orderData.orderType === 'market') {
      price = orderData.side === 'buy' ? quote.ask : quote.bid;
    }
    
    return quantity * price;
  };

  const handlePlaceOrder = async () => {
    if (!orderData.quantity || parseFloat(orderData.quantity) <= 0) {
      toast({
        title: "Invalid Order",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    setPlacingOrder(true);
    
    try {
      // Simulate order placement - integrate with your enhanced trading service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderValue = calculateOrderValue();
      
      toast({
        title: "Order Placed Successfully!",
        description: `${orderData.side.toUpperCase()} ${orderData.quantity} ${orderData.symbol} at $${quote?.price.toFixed(2)} (Total: $${orderValue.toFixed(2)})`,
      });
      
      // Reset form
      setOrderData(prev => ({ ...prev, quantity: '', price: '', stopPrice: '' }));
      
    } catch (error) {
      console.error('Order placement error:', error);
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Real-time Quote Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {symbols.map(symbol => (
                    <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Badge className={`${quote?.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {quote?.source || 'Live TwelveData'}
              </Badge>
              {quote?.lastUpdate && (
                <Badge variant="outline" className="text-xs">
                  {new Date(quote.lastUpdate).toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ) : quote ? (
            <div className="space-y-4">
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Entry */}
      <Card>
        <CardHeader>
          <Tabs 
            value={orderData.side} 
            onValueChange={(value) => setOrderData(prev => ({ ...prev, side: value as 'buy' | 'sell' }))}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Sell
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Order Type */}
          <div>
            <Label>Order Type</Label>
            <Select
              value={orderData.orderType}
              onValueChange={(value) => setOrderData(prev => ({ ...prev, orderType: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
                <SelectItem value="stop">Stop Loss</SelectItem>
                <SelectItem value="stop_limit">Stop Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              placeholder="0"
              value={orderData.quantity}
              onChange={(e) => setOrderData(prev => ({ ...prev, quantity: e.target.value }))}
            />
          </div>

          {/* Price (for limit orders) */}
          {(orderData.orderType === 'limit' || orderData.orderType === 'stop_limit') && (
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                placeholder={quote ? `${quote.price.toFixed(2)}` : "Market Price"}
                value={orderData.price}
                onChange={(e) => setOrderData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
          )}

          {/* AI Assistance Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-blue-600" />
              <div>
                <Label className="text-blue-900 dark:text-blue-100">AI Trading Assistant</Label>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Real-time risk analysis
                </p>
              </div>
            </div>
            <Switch checked={aiAssist} onCheckedChange={setAiAssist} />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Value:</span>
              <span className="font-semibold flex items-center">
                <DollarSign className="w-4 h-4" />
                {calculateOrderValue().toLocaleString()}
              </span>
            </div>
            {aiAssist && quote && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">AI Risk Score:</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Low Risk
                </Badge>
              </div>
            )}
          </div>

          {/* Place Order Button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={!orderData.quantity || placingOrder || loading}
            className={`w-full h-12 text-lg font-semibold ${
              orderData.side === 'buy' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {placingOrder ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            {placingOrder 
              ? 'Placing Order...' 
              : `Place ${orderData.side === 'buy' ? 'Buy' : 'Sell'} Order`
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 