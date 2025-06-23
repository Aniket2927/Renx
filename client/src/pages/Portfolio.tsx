import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Portfolio() {
  const { user, isAuthenticated } = useAuth();

  // Fetch user portfolios
  const { data: portfolios = [] } = useQuery({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
  });

  // Fetch positions for default portfolio
  const { data: positions = [] } = useQuery({
    queryKey: ["/api/positions"],
    enabled: isAuthenticated,
  });

  // Fetch portfolio performance
  const { data: performance = {} } = useQuery({
    queryKey: ["/api/portfolio/performance"],
    enabled: isAuthenticated,
  });

  const portfolioList = Array.isArray(portfolios) ? portfolios : [];
  const defaultPortfolio = portfolioList.find((p: any) => p.isDefault) || portfolioList[0] || null;

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Portfolio Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Overview</h1>
            <p className="text-muted-foreground">Track your investments and performance across all assets</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="badge-success">Real-time</Badge>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last sync</p>
              <p className="text-sm font-medium">Just now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stat-card group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <DollarSign className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
                <Badge className="badge-success mt-1">+20.1%</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">$125,430.67</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">+$20,234 this month</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Day Change</CardTitle>
                <Badge className="badge-success mt-1">+2.4%</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">+$3,024.15</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">vs yesterday</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Positions</CardTitle>
                <Badge className="badge-info mt-1">Live</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">12</div>
              <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold">across 8 sectors</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <PieChart className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Cash Available</CardTitle>
                <Badge className="badge-info mt-1">12.1%</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">$15,240.30</div>
              <div className="text-sm text-amber-600 dark:text-amber-400 font-semibold">of portfolio</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Holdings Section */}
      <Card className="trading-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="text-primary" size={20} />
              <span>Holdings</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className="badge-success">12 positions</Badge>
              <select className="text-xs bg-background border border-border rounded-lg px-2 py-1">
                <option>All Assets</option>
                <option>Stocks</option>
                <option>Crypto</option>
                <option>ETFs</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Sample Holdings */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AAPL</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Apple Inc.</div>
                    <div className="text-sm text-muted-foreground">100 shares • Technology</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">$17,550.00</div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400">+$1,250 (+7.7%)</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TSLA</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Tesla Inc.</div>
                    <div className="text-sm text-muted-foreground">50 shares • Electric Vehicles</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">$12,290.00</div>
                  <div className="text-sm text-red-600 dark:text-red-400">-$890 (-6.8%)</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">MSFT</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Microsoft Corp.</div>
                    <div className="text-sm text-muted-foreground">75 shares • Technology</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">$30,922.50</div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400">+$2,100 (+7.3%)</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="text-primary" size={20} />
              <span>Asset Allocation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">45%</div>
                <div className="text-sm text-muted-foreground">Stocks</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">25%</div>
                <div className="text-sm text-muted-foreground">ETFs</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">20%</div>
                <div className="text-sm text-muted-foreground">Crypto</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">10%</div>
                <div className="text-sm text-muted-foreground">Cash</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="text-primary" size={20} />
              <span>Risk Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Beta</span>
                <span className="text-sm font-bold">1.2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Sharpe Ratio</span>
                <span className="text-sm font-bold">1.8</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Max Drawdown</span>
                <span className="text-sm font-bold text-red-600">-8.5%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Volatility</span>
                <span className="text-sm font-bold">15.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}