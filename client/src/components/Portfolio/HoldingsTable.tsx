import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Position } from "@/types/trading";

interface HoldingsTableProps {
  holdings: Position[];
  onTrade?: (symbol: string) => void;
  onAddToWatchlist?: (symbol: string) => void;
}

export default function HoldingsTable({ holdings, onTrade, onAddToWatchlist }: HoldingsTableProps) {
  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
    }).format(value / 100);
  };

  const getPnLColor = (pnl: number | string) => {
    const num = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
    return num >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getPnLIcon = (pnl: number | string) => {
    const num = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
    return num >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
  };

  if (holdings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No holdings found. Start trading to see your positions here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Asset Type</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Avg Cost</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">P&L</TableHead>
            <TableHead className="text-right">%</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding) => {
            const pnl = parseFloat(holding.unrealizedPnL.toString());
            const avgCost = parseFloat(holding.averageCost.toString());
            const currentPrice = parseFloat(holding.currentPrice.toString());
            const pnlPercent = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;

            return (
              <TableRow key={holding.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="font-medium">{holding.symbol}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {holding.assetType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {parseFloat(holding.quantity.toString()).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(avgCost)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(currentPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(holding.marketValue)}
                </TableCell>
                <TableCell className={`text-right ${getPnLColor(pnl)}`}>
                  <div className="flex items-center justify-end space-x-1">
                    {getPnLIcon(pnl)}
                    <span>{formatCurrency(Math.abs(pnl))}</span>
                  </div>
                </TableCell>
                <TableCell className={`text-right ${getPnLColor(pnlPercent)}`}>
                  {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onTrade && (
                        <DropdownMenuItem onClick={() => onTrade(holding.symbol)}>
                          <TrendingUp size={16} className="mr-2" />
                          Trade
                        </DropdownMenuItem>
                      )}
                      {onAddToWatchlist && (
                        <DropdownMenuItem onClick={() => onAddToWatchlist(holding.symbol)}>
                          <Eye size={16} className="mr-2" />
                          Add to Watchlist
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
