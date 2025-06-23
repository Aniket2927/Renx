import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

interface SignalCardProps {
  signal: {
    id: string;
    symbol: string;
    action: 'buy' | 'sell';
    confidence: number;
    price: number;
    reason: string;
    createdAt: string;
  };
}

export default function SignalCard({ signal }: SignalCardProps) {
  const isPositive = signal.action === 'buy';
  
  return (
    <Card className="trading-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{signal.symbol}</CardTitle>
          <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
            {signal.action.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className="text-lg font-semibold">${signal.price}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Confidence: {signal.confidence}%</span>
          <Zap className="h-3 w-3" />
        </div>
        <p className="text-xs mt-2 text-muted-foreground line-clamp-2">
          {signal.reason}
        </p>
      </CardContent>
    </Card>
  );
}