import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import ThemeSelector from "@/components/Layout/ThemeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, AlertTriangle, TrendingDown, Settings, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";

export default function RiskManagement() {
  const { isAuthenticated } = useAuth();
  const riskChartRef = useRef<HTMLCanvasElement>(null);

  // Fetch portfolios
  const { data: portfolios } = useQuery({
    queryKey: ["/api/portfolios"],
    enabled: isAuthenticated,
  });

  // Fetch positions for default portfolio
  const defaultPortfolio = portfolios?.find((p: any) => p.isDefault) || portfolios?.[0];
  
  const { data: positions } = useQuery({
    queryKey: ["/api/portfolios", defaultPortfolio?.id, "positions"],
    enabled: !!defaultPortfolio?.id,
  });

  const { data: riskMetrics } = useQuery({
    queryKey: ["/api/portfolios", defaultPortfolio?.id, "risk"],
    enabled: !!defaultPortfolio?.id,
  });

  const { data: riskAnalysis } = useQuery({
    queryKey: ["/api/ai/portfolio-risk", defaultPortfolio?.id],
    enabled: !!defaultPortfolio?.id,
  });

  // Draw risk radar chart
  useEffect(() => {
    if (!riskChartRef.current || !riskMetrics) return;

    const canvas = riskChartRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Clear canvas
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Risk categories and values (0-10 scale)
    const riskData = [
      { label: "Volatility", value: 6 },
      { label: "Concentration", value: riskMetrics.concentrationRisk / 10 },
      { label: "Correlation", value: 7 },
      { label: "Liquidity", value: 3 },
      { label: "Credit", value: 2 },
    ];

    const angleStep = (2 * Math.PI) / riskData.length;

    // Draw grid circles
    ctx.strokeStyle = "rgba(156, 163, 175, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw grid lines
    riskData.forEach((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw risk polygon
    ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
    ctx.strokeStyle = "rgb(245, 158, 11)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    riskData.forEach((risk, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const distance = (risk.value / 10) * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = "var(--foreground)";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";

    riskData.forEach((risk, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const labelDistance = radius + 20;
      const x = centerX + Math.cos(angle) * labelDistance;
      const y = centerY + Math.sin(angle) * labelDistance;
      
      ctx.fillText(risk.label, x, y);
    });

  }, [riskMetrics]);

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { level: "Low", color: "text-green-500", bg: "bg-green-100" };
    if (score <= 6) return { level: "Medium", color: "text-yellow-500", bg: "bg-yellow-100" };
    return { level: "High", color: "text-red-500", bg: "bg-red-100" };
  };

  const mockPositions = positions || [
    {
      id: "1",
      symbol: "AAPL",
      quantity: "100",
      averageCost: "165.50",
      currentPrice: "175.43",
      marketValue: "17543.00",
      unrealizedPnL: "993.00",
      assetType: "stock"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen">
        <Header 
          title="Risk Management" 
          subtitle="Monitor and control your trading risks"
        />
        
        <div className="p-6">
          {/* Risk Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="text-green-400 text-2xl" size={32} />
                  <div>
                    <CardTitle className="text-xl">Risk Score</CardTitle>
                    <p className="text-muted-foreground text-sm">Portfolio risk level</p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-yellow-500">Medium</p>
                <p className="text-muted-foreground text-sm mt-2">Risk score: 6/10</p>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingDown className="text-red-400 text-2xl" size={32} />
                  <div>
                    <CardTitle className="text-xl">VaR (1 Day)</CardTitle>
                    <p className="text-muted-foreground text-sm">Value at Risk</p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-red-400">
                  {riskMetrics?.var95 ? formatCurrency(riskMetrics.var95) : "-$2,456"}
                </p>
                <p className="text-muted-foreground text-sm mt-2">95% confidence</p>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold">β</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">Beta</CardTitle>
                    <p className="text-muted-foreground text-sm">Market correlation</p>
                  </div>
                </div>
                <p className="text-4xl font-bold">
                  {riskMetrics?.beta ? riskMetrics.beta.toFixed(2) : "0.89"}
                </p>
                <p className="text-green-400 text-sm mt-2">Less volatile than market</p>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="text-yellow-400 text-2xl" size={32} />
                  <div>
                    <CardTitle className="text-xl">Alerts</CardTitle>
                    <p className="text-muted-foreground text-sm">Active warnings</p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-yellow-400">3</p>
                <p className="text-muted-foreground text-sm mt-2">2 position, 1 market</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Controls and Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Automated Risk Controls */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="text-primary" size={20} />
                  <span>Automated Risk Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">Portfolio Stop Loss</h4>
                      <p className="text-sm text-muted-foreground">Automatic liquidation at -15%</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500" size={16} />
                      <Switch checked={true} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">Position Size Limit</h4>
                      <p className="text-sm text-muted-foreground">Max 5% per single position</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500" size={16} />
                      <Switch checked={true} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">Margin Monitoring</h4>
                      <p className="text-sm text-muted-foreground">Alert at 80% margin usage</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500" size={16} />
                      <Switch checked={true} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">Correlation Alerts</h4>
                      <p className="text-sm text-muted-foreground">Warn on high correlation risk</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="text-red-500" size={16} />
                      <Switch checked={false} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Analysis Chart */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="chart-container">
                  <canvas
                    ref={riskChartRef}
                    className="w-full h-full"
                    style={{ height: "250px" }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Risk Recommendations */}
          {riskAnalysis && (
            <Card className="trading-card mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="text-primary" size={20} />
                  <span>AI Risk Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Risk Assessment</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Overall Risk Score</span>
                        <Badge className={getRiskLevel(riskAnalysis.riskScore).bg}>
                          {getRiskLevel(riskAnalysis.riskScore).level}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Diversification Score</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(riskAnalysis.diversificationScore / 10) * 100} className="w-20" />
                          <span className="text-sm">{riskAnalysis.diversificationScore}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {riskAnalysis.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="text-sm p-2 bg-muted rounded flex items-start space-x-2">
                          <AlertTriangle size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Position Risk Table */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Position Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead className="text-right">Position Size</TableHead>
                      <TableHead className="text-right">% of Portfolio</TableHead>
                      <TableHead className="text-right">Risk Score</TableHead>
                      <TableHead className="text-right">VaR</TableHead>
                      <TableHead className="text-right">Stop Loss</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPositions.map((position) => {
                      const marketValue = parseFloat(position.marketValue);
                      const portfolioTotal = defaultPortfolio?.totalValue || 100000;
                      const portfolioPercent = (marketValue / portfolioTotal) * 100;
                      const var95 = marketValue * 0.05; // Mock 5% VaR
                      const stopLoss = parseFloat(position.currentPrice) * 0.95;
                      
                      return (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">{position.symbol}</TableCell>
                          <TableCell className="text-right">{formatCurrency(marketValue)}</TableCell>
                          <TableCell className="text-right">{portfolioPercent.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                          </TableCell>
                          <TableCell className="text-right text-red-400">
                            -{formatCurrency(var95)}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(stopLoss)}</TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-green-600 text-white">Normal</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
