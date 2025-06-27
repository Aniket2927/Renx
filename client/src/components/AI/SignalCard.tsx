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
  const confidenceLevel = signal.confidence >= 80 ? 'high' : signal.confidence >= 60 ? 'medium' : 'low';
  
  return (
    <div className="ai-card fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="heading-4 market-ticker">{signal.symbol}</h3>
        <span className={`status-${isPositive ? 'positive' : 'negative'}`}>
          {signal.action.toUpperCase()}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 mb-3">
        {isPositive ? (
          <TrendingUp className="h-5 w-5 text-success-600" />
        ) : (
          <TrendingDown className="h-5 w-5 text-error-600" />
        )}
        <span className="heading-3 market-ticker">${signal.price}</span>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <span className={`ai-confidence-${confidenceLevel}`}>
          Confidence: {signal.confidence}%
        </span>
        <Zap className="h-4 w-4 text-accent-500" />
      </div>
      
      <p className="body-small text-neutral-600 dark:text-neutral-400 line-clamp-2">
        {signal.reason}
      </p>
    </div>
  );
}