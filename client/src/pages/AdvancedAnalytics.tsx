import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, BarChart3, Target, PieChart, Activity } from "lucide-react";

interface RiskMetrics {
  var95: number;
  sharpeRatio: number;
  beta: number;
  alpha: number;
  maxDrawdown: number;
  concentrationRisk: number;
}

interface PortfolioOptimization {
  currentAllocation: Record<string, number>;
  optimizedAllocation: Record<string, number>;
  riskReduction: number;
  returnImprovement: number;
}

interface SentimentData {
  overallSentiment: number;
  bullishPercentage: number;
  bearishPercentage: number;
  fearGreedIndex: number;
  sectorSentiments: Record<string, number>;
}

export function AdvancedAnalytics() {
  const [loading, setLoading] = useState(true);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [portfolioOptimization, setPortfolioOptimization] = useState<PortfolioOptimization | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][] | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading advanced analytics data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data - in real app, fetch from API
      setRiskMetrics({
        var95: 12.5,
        sharpeRatio: 1.42,
        beta: 1.08,
        alpha: 0.15,
        maxDrawdown: -8.3,
        concentrationRisk: 35.2
      });

      setPortfolioOptimization({
        currentAllocation: {
          "Technology": 35,
          "Healthcare": 20,
          "Finance": 25,
          "Consumer": 15,
          "Energy": 5
        },
        optimizedAllocation: {
          "Technology": 28,
          "Healthcare": 25,
          "Finance": 22,
          "Consumer": 18,
          "Energy": 7
        },
        riskReduction: 15.3,
        returnImprovement: 8.7
      });

      setSentimentData({
        overallSentiment: 72,
        bullishPercentage: 68,
        bearishPercentage: 22,
        fearGreedIndex: 71,
        sectorSentiments: {
          "Technology": 78,
          "Healthcare": 65,
          "Finance": 58,
          "Consumer": 72,
          "Energy": 45
        }
      });

      // Generate correlation matrix
      const matrix = Array(5).fill(0).map(() => 
        Array(5).fill(0).map(() => Math.random() * 2 - 1)
      );
      setCorrelationMatrix(matrix);

    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runPortfolioOptimization = async () => {
    try {
      setLoading(true);
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 3344));
      
      // Update with new optimization results
      setPortfolioOptimization(prev => prev ? {
        ...prev,
        riskReduction: prev.riskReduction + 2.1,
        returnImprovement: prev.returnImprovement + 1.3
      } : null);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRiskReport = async () => {
    // Simulate risk report generation
    alert("Risk Assessment Report generated! Check your downloads folder.");
  };

  if (loading && !riskMetrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading Advanced Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Portfolio optimization, risk analysis, and market intelligence
        </p>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="portfolio">Portfolio Optimization</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="sentiment">Market Sentiment</TabsTrigger>
          <TabsTrigger value="correlation">Correlation Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Portfolio Optimization Engine
              </CardTitle>
              <CardDescription>
                Modern Portfolio Theory optimization with risk tolerance adjustment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {portfolioOptimization && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Current Allocation</h3>
                      {Object.entries(portfolioOptimization.currentAllocation).map(([sector, percentage]) => (
                        <div key={sector} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{sector}</span>
                            <span className="text-sm text-gray-600">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Optimized Allocation</h3>
                      {Object.entries(portfolioOptimization.optimizedAllocation).map(([sector, percentage]) => (
                        <div key={sector} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{sector}</span>
                            <span className="text-sm text-gray-600">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            -{portfolioOptimization.riskReduction}%
                          </div>
                          <div className="text-sm text-gray-600">Risk Reduction</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            +{portfolioOptimization.returnImprovement}%
                          </div>
                          <div className="text-sm text-gray-600">Return Improvement</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={runPortfolioOptimization}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <TrendingUp className="h-4 w-4" />
                      {loading ? "Optimizing..." : "Re-optimize Portfolio"}
                    </Button>
                    <Button variant="outline">
                      Apply Recommendations
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment Dashboard
              </CardTitle>
              <CardDescription>
                Comprehensive risk metrics and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riskMetrics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{riskMetrics.var95}%</div>
                          <div className="text-sm text-gray-600">Value at Risk (95%)</div>
                          <Badge variant="secondary" className="mt-2">Daily</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{riskMetrics.sharpeRatio}</div>
                          <div className="text-sm text-gray-600">Sharpe Ratio</div>
                          <Badge variant="default" className="mt-2">Good</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{riskMetrics.maxDrawdown}%</div>
                          <div className="text-sm text-gray-600">Max Drawdown</div>
                          <Badge variant="destructive" className="mt-2">Historical</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{riskMetrics.beta}</div>
                          <div className="text-sm text-gray-600">Portfolio Beta</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{riskMetrics.alpha}</div>
                          <div className="text-sm text-gray-600">Alpha</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{riskMetrics.concentrationRisk}%</div>
                          <div className="text-sm text-gray-600">Concentration Risk</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Button 
                    onClick={generateRiskReport}
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Generate Risk Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Market Sentiment
              </CardTitle>
              <CardDescription>
                AI-powered sentiment analysis from multiple sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentimentData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {sentimentData.overallSentiment}
                          </div>
                          <div className="text-sm text-gray-600">Overall Sentiment Score</div>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Bullish: {sentimentData.bullishPercentage}%</span>
                              <span>Bearish: {sentimentData.bearishPercentage}%</span>
                            </div>
                            <Progress value={sentimentData.bullishPercentage} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {sentimentData.fearGreedIndex}
                          </div>
                          <div className="text-sm text-gray-600">Fear & Greed Index</div>
                          <Badge 
                            variant={sentimentData.fearGreedIndex > 70 ? "default" : 
                                   sentimentData.fearGreedIndex > 30 ? "secondary" : "destructive"}
                            className="mt-2"
                          >
                            {sentimentData.fearGreedIndex > 70 ? "Greed" : 
                             sentimentData.fearGreedIndex > 30 ? "Neutral" : "Fear"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Sector Sentiment Breakdown</h3>
                    {Object.entries(sentimentData.sectorSentiments).map(([sector, sentiment]) => (
                      <div key={sector} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{sector}</span>
                          <span className="text-sm text-gray-600">{sentiment}%</span>
                        </div>
                        <Progress value={sentiment} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Asset Correlation Matrix
              </CardTitle>
              <CardDescription>
                Understand relationships between your portfolio holdings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {correlationMatrix && (
                <div className="space-y-6">
                  <div className="grid grid-cols-5 gap-1 text-xs">
                    {correlationMatrix.map((row, i) =>
                      row.map((value, j) => (
                        <div
                          key={`${i}-${j}`}
                          className={`h-8 w-8 flex items-center justify-center text-white text-xs font-medium rounded ${
                            value > 0.5 ? 'bg-red-500' :
                            value > 0.2 ? 'bg-yellow-500' :
                            value > -0.2 ? 'bg-gray-400' :
                            value > -0.5 ? 'bg-blue-400' : 'bg-green-500'
                          }`}
                        >
                          {value.toFixed(1)}
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Correlation Legend:</strong></p>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Strong Positive (&gt;0.5)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>Weak Positive (0.2-0.5)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-400 rounded"></div>
                        <span>Neutral (-0.2-0.2)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Strong Negative (&lt;-0.5)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdvancedAnalytics; 