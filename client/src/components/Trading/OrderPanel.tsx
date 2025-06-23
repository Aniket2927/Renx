import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OrderPanelProps {
  symbol: string;
  currentPrice?: number;
  portfolioId?: string;
}

export default function OrderPanel({ symbol, currentPrice, portfolioId }: OrderPanelProps) {
  const [orderData, setOrderData] = useState({
    side: "buy" as "buy" | "sell",
    orderType: "market" as "market" | "limit" | "stop" | "stop_limit",
    quantity: "",
    price: "",
    stopPrice: "",
    timeInForce: "day" as "day" | "gtc" | "ioc" | "fok"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const placeOrderMutation = useMutation({
    mutationFn: async (order: any) => {
      return await apiRequest("POST", "/api/trading/orders", order);
    },
    onSuccess: () => {
      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      setOrderData(prev => ({ ...prev, quantity: "", price: "", stopPrice: "" }));
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!portfolioId) {
      toast({
        title: "Error",
        description: "No portfolio selected",
        variant: "destructive",
      });
      return;
    }

    if (!orderData.quantity || parseFloat(orderData.quantity) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    const order = {
      portfolioId,
      symbol,
      ...orderData,
      price: orderData.orderType === "market" ? undefined : orderData.price,
    };

    placeOrderMutation.mutate(order);
  };

  const estimatedCost = currentPrice && orderData.quantity ? 
    parseFloat(orderData.quantity) * (orderData.price ? parseFloat(orderData.price) : currentPrice) : 0;

  return (
    <Card className="trading-card">
      <CardHeader>
        <Tabs 
          value={orderData.side} 
          onValueChange={(value) => setOrderData(prev => ({ ...prev, side: value as "buy" | "sell" }))}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="data-[state=active]:bg-green-600">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-red-600">
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="orderType">Order Type</Label>
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

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="0"
            value={orderData.quantity}
            onChange={(e) => setOrderData(prev => ({ ...prev, quantity: e.target.value }))}
          />
        </div>

        {(orderData.orderType === "limit" || orderData.orderType === "stop_limit") && (
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              placeholder={currentPrice ? `${currentPrice.toFixed(2)}` : "Market Price"}
              value={orderData.price}
              onChange={(e) => setOrderData(prev => ({ ...prev, price: e.target.value }))}
            />
          </div>
        )}

        {(orderData.orderType === "stop" || orderData.orderType === "stop_limit") && (
          <div>
            <Label htmlFor="stopPrice">Stop Price</Label>
            <Input
              id="stopPrice"
              type="number"
              placeholder="Stop Price"
              value={orderData.stopPrice}
              onChange={(e) => setOrderData(prev => ({ ...prev, stopPrice: e.target.value }))}
            />
          </div>
        )}

        <div>
          <Label htmlFor="timeInForce">Time in Force</Label>
          <Select
            value={orderData.timeInForce}
            onValueChange={(value) => setOrderData(prev => ({ ...prev, timeInForce: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="gtc">GTC</SelectItem>
              <SelectItem value="ioc">IOC</SelectItem>
              <SelectItem value="fok">FOK</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="p-4 bg-muted">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Estimated Cost:</span>
              <span>${estimatedCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Commission:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>${estimatedCost.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={placeOrderMutation.isPending}
          className={`w-full ${orderData.side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {placeOrderMutation.isPending ? "Placing..." : `Place ${orderData.side === 'buy' ? 'Buy' : 'Sell'} Order`}
        </Button>
      </CardContent>
    </Card>
  );
}
