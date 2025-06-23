import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface TradingChartProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

const timeframes = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "1h", label: "1h" },
  { value: "1d", label: "1d" },
];

const symbols = [
  { value: "AAPL", label: "AAPL - Apple Inc." },
  { value: "TSLA", label: "TSLA - Tesla Inc." },
  { value: "GOOGL", label: "GOOGL - Alphabet Inc." },
  { value: "MSFT", label: "MSFT - Microsoft Corp." },
];

export default function TradingChart({ symbol, onSymbolChange }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: quote, isLoading } = useQuery({
    queryKey: ["/api/market/quote", symbol],
    enabled: !!symbol,
  });

  useEffect(() => {
    if (!canvasRef.current || !quote) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = "var(--card)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate mock price data for demonstration
    const dataPoints = 50;
    const data = [];
    let price = quote.price;
    
    for (let i = 0; i < dataPoints; i++) {
      price += (Math.random() - 0.5) * 2;
      data.push(price);
    }

    // Draw price line
    ctx.strokeStyle = quote.change >= 0 ? "#10b981" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const stepX = canvas.width / (dataPoints - 1);
    const minPrice = Math.min(...data);
    const maxPrice = Math.max(...data);
    const priceRange = maxPrice - minPrice;

    data.forEach((price, index) => {
      const x = index * stepX;
      const y = canvas.height - ((price - minPrice) / priceRange) * canvas.height * 0.8 - canvas.height * 0.1;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = "var(--border)";
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
    for (let i = 1; i < 10; i++) {
      const x = (canvas.width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }, [quote]);

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={symbol} onValueChange={onSymbolChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {symbols.map((sym) => (
                  <SelectItem key={sym.value} value={sym.value}>
                    {sym.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {quote && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">${quote.price.toFixed(2)}</span>
                <span className={`${quote.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={tf.value === "1m" ? "default" : "outline"}
                size="sm"
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="chart-container">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ height: "400px" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
