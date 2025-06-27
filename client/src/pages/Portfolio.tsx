import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Add proper type definitions
interface PortfolioSummary {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  monthChange: number;
  activePositions: number;
  cashAvailable: number;
  cashPercent: number;
  sectors: string;
  allocation: {
    stocks: number;
    etfs: number;
    crypto: number;
    cash: number;
  };
  riskMetrics: {
    beta: number;
    sharpeRatio: number;
    maxDrawdown: number;
    volatility: number;
  };
}

interface Performance {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  monthChange: number;
  cashAvailable: number;
  cashPercent: number;
}

export default function Portfolio() {
  const { isAuthenticated } = useAuth();

  // Fetch user portfolios with real data
  const { data: portfolios = [], isLoading: portfoliosLoading } = useQuery({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
  });

  // Fetch positions for default portfolio with real data
  const { data: positions = [], isLoading: positionsLoading } = useQuery({
    queryKey: ["/api/portfolio/positions"],
    enabled: isAuthenticated,
  });

  // Fetch portfolio summary with real data
  const { data: portfolioSummary, isLoading: summaryLoading } = useQuery<PortfolioSummary>({
    queryKey: ["/api/portfolio/summary"],
    enabled: isAuthenticated,
  });

  // Fetch portfolio performance with real data  
  const { data: performance, isLoading: performanceLoading } = useQuery<Performance>({
    queryKey: ["/api/portfolio/performance"],
    enabled: isAuthenticated,
  });

  // Process data with proper type safety
  const portfolioList = Array.isArray(portfolios) ? portfolios : [];
  const positionsList = Array.isArray(positions) ? positions : [];

  // Calculate derived values with fallbacks
  const totalValue = portfolioSummary?.totalValue || performance?.totalValue || 0;
  const dayChange = portfolioSummary?.dayChange || performance?.dayChange || 0;
  const dayChangePercent = portfolioSummary?.dayChangePercent || performance?.dayChangePercent || 0;
  const monthChange = portfolioSummary?.monthChange || performance?.monthChange || 0;
  const activePositions = positionsList.length || portfolioSummary?.activePositions || 0;
  const cashAvailable = portfolioSummary?.cashAvailable || performance?.cashAvailable || 0;
  const cashPercent = portfolioSummary?.cashPercent || performance?.cashPercent || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const isLoading = portfoliosLoading || positionsLoading || summaryLoading || performanceLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your investments and performance with {activePositions} active positions 
            across {portfolioSummary?.sectors || 'multiple'} sectors
          </p>
          </div>
          <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Real-time Data
          </Badge>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Portfolio Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <div className={`text-xs flex items-center ${dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dayChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {formatPercent(dayChangePercent)} today ({formatCurrency(dayChange)})
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthChange)}</div>
            <div className={`text-xs flex items-center ${monthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              This month's change
            </div>
          </CardContent>
        </Card>

        {/* Active Positions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePositions}</div>
            <div className="text-xs text-muted-foreground">
              Across multiple sectors
            </div>
          </CardContent>
        </Card>

        {/* Cash Available */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Available</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashAvailable)}</div>
            <div className="text-xs text-muted-foreground">
              {cashPercent.toFixed(1)}% of portfolio
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((portfolioSummary?.allocation?.stocks || 0) * 100).toFixed(0)}%
                  </div>
              <div className="text-sm text-muted-foreground">Stocks</div>
                  </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((portfolioSummary?.allocation?.etfs || 0) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">ETFs</div>
                  </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {((portfolioSummary?.allocation?.crypto || 0) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Crypto</div>
                  </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {((portfolioSummary?.allocation?.cash || cashPercent) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Cash</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card>
          <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Risk Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Beta</div>
              <span className="text-sm font-bold">{(portfolioSummary?.riskMetrics?.beta || 0).toFixed(2)}</span>
              </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
              <span className="text-sm font-bold">{(portfolioSummary?.riskMetrics?.sharpeRatio || 0).toFixed(2)}</span>
              </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Max Drawdown</div>
              <span className="text-sm font-bold text-red-600">
                {(portfolioSummary?.riskMetrics?.maxDrawdown || 0).toFixed(1)}%
              </span>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Volatility</div>
              <span className="text-sm font-bold">{(portfolioSummary?.riskMetrics?.volatility || 0).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}