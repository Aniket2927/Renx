import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, Target, BarChart3, PieChart } from "lucide-react";

interface OptimizationResult {
  allocation: Record<string, number>;
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio: number;
  var95: number;
}

interface Position {
  symbol: string;
  name: string;
  weight: number;
  expectedReturn: number;
  risk: number;
  sector: string;
}

export function PortfolioOptimizer() {
  const [positions, setPositions] = useState<Position[]>([
    { symbol: "AAPL", name: "Apple Inc.", weight: 25, expectedReturn: 12.5, risk: 22.1, sector: "Technology" },
    { symbol: "MSFT", name: "Microsoft Corp.", weight: 20, expectedReturn: 11.8, risk: 19.5, sector: "Technology" },
    { symbol: "GOOGL", name: "Alphabet Inc.", weight: 15, expectedReturn: 13.2, risk: 24.3, sector: "Technology" },
    { symbol: "JNJ", name: "Johnson & Johnson", weight: 20, expectedReturn: 8.5, risk: 15.2, sector: "Healthcare" },
    { symbol: "JPM", name: "JPMorgan Chase", weight: 20, expectedReturn: 10.2, risk: 28.7, sector: "Finance" }
  ]);

  const [riskTolerance, setRiskTolerance] = useState([5]);
  const [optimizationObjective, setOptimizationObjective] = useState<"sharpe" | "return" | "risk">("sharpe");
  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [rebalanceRecommendations, setRebalanceRecommendations] = useState<any[]>([]);

  useEffect(() => {
    // Calculate current portfolio metrics
    calculateCurrentMetrics();
  }, [positions]);

  const calculateCurrentMetrics = () => {
    const totalReturn = positions.reduce((sum, pos) => sum + (pos.weight / 100 * pos.expectedReturn), 0);
    const totalRisk = Math.sqrt(
      positions.reduce((sum, pos) => sum + Math.pow(pos.weight / 100 * pos.risk, 2), 0)
    );
    const sharpeRatio = totalRisk > 0 ? totalReturn / totalRisk : 0;
    
    // Simplified VaR calculation
    const var95 = totalRisk * 1.645; // 95% confidence interval
    
    setOptimizationResult({
      allocation: positions.reduce((acc, pos) => ({ ...acc, [pos.symbol]: pos.weight }), {}),
      expectedReturn: totalReturn,
      expectedRisk: totalRisk,
      sharpeRatio,
      var95
    });
  };

  const runOptimization = async () => {
    setLoading(true);
    
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 3344));
      
      // Modern Portfolio Theory optimization simulation
      const optimizedWeights = optimizePortfolio(positions, optimizationObjective, riskTolerance[0]);
      
      const optimizedReturn = optimizedWeights.reduce((sum, weight, i) => 
        sum + (weight / 100 * positions[i].expectedReturn), 0
      );
      
      const optimizedRisk = Math.sqrt(
        optimizedWeights.reduce((sum, weight, i) => 
          sum + Math.pow(weight / 100 * positions[i].risk, 2), 0
        )
      );
      
      const optimizedSharpe = optimizedRisk > 0 ? optimizedReturn / optimizedRisk : 0;
      const optimizedVar = optimizedRisk * 1.645;
      
      const optimizedAllocation = positions.reduce((acc, pos, i) => ({
        ...acc,
        [pos.symbol]: optimizedWeights[i]
      }), {});
      
      setOptimizationResult({
        allocation: optimizedAllocation,
        expectedReturn: optimizedReturn,
        expectedRisk: optimizedRisk,
        sharpeRatio: optimizedSharpe,
        var95: optimizedVar
      });
      
      // Generate rebalancing recommendations
      const recommendations = positions.map((pos, i) => ({
        symbol: pos.symbol,
        currentWeight: pos.weight,
        targetWeight: optimizedWeights[i],
        change: optimizedWeights[i] - pos.weight,
        action: optimizedWeights[i] > pos.weight ? 'Buy' : optimizedWeights[i] < pos.weight ? 'Sell' : 'Hold'
      })).filter(rec => Math.abs(rec.change) > 1);
      
      setRebalanceRecommendations(recommendations);
      
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const optimizePortfolio = (positions: Position[], objective: string, riskTol: number): number[] => {
    // Simplified optimization algorithm (in practice, use quadratic programming)
    const numAssets = positions.length;
    let weights = new Array(numAssets).fill(100 / numAssets);
    
    // Adjust based on objective and risk tolerance
    if (objective === "return") {
      // Favor higher return assets
      positions.forEach((pos, i) => {
        weights[i] *= (1 + pos.expectedReturn / 100);
      });
    } else if (objective === "risk") {
      // Favor lower risk assets
      positions.forEach((pos, i) => {
        weights[i] *= (1 / (1 + pos.risk / 100));
      });
    } else { // sharpe
      // Optimize Sharpe ratio
      positions.forEach((pos, i) => {
        const sharpe = pos.risk > 0 ? pos.expectedReturn / pos.risk : 0;
        weights[i] *= (1 + sharpe);
      });
    }
    
    // Apply risk tolerance constraint
    const riskFactor = riskTol / 10;
    weights = weights.map((w, i) => w * (1 - (1 - riskFactor) * positions[i].risk / 100));
    
    // Normalize to 100%
    const total = weights.reduce((sum, w) => sum + w, 0);
    return weights.map(w => Math.round((w / total) * 100 * 100) / 100);
  };

  const applyOptimization = () => {
    if (optimizationResult) {
      const newPositions = positions.map(pos => ({
        ...pos,
        weight: optimizationResult.allocation[pos.symbol] || 0
      }));
      setPositions(newPositions);
      setRebalanceRecommendations([]);
      alert("Portfolio optimization applied successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Portfolio Optimizer
          </CardTitle>
          <CardDescription>
            Modern Portfolio Theory optimization to maximize risk-adjusted returns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Optimization Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Risk Tolerance</label>
                <div className="space-y-2">
                  <Slider
                    value={riskTolerance}
                    onValueChange={setRiskTolerance}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Conservative</span>
                    <span>Risk Level: {riskTolerance[0]}</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Optimization Objective</label>
                <div className="flex gap-2">
                  <Button
                    variant={optimizationObjective === "sharpe" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOptimizationObjective("sharpe")}
                  >
                    Max Sharpe
                  </Button>
                  <Button
                    variant={optimizationObjective === "return" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOptimizationObjective("return")}
                  >
                    Max Return
                  </Button>
                  <Button
                    variant={optimizationObjective === "risk" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOptimizationObjective("risk")}
                  >
                    Min Risk
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={runOptimization}
            disabled={loading}
            className="w-full flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            {loading ? "Optimizing Portfolio..." : "Run Optimization"}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Allocation</TabsTrigger>
          <TabsTrigger value="optimized">Optimized Results</TabsTrigger>
          <TabsTrigger value="rebalance">Rebalancing</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Current Portfolio Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.symbol} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{position.symbol}</Badge>
                        <span className="text-sm font-medium">{position.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{position.weight}%</div>
                        <div className="text-xs text-gray-500">{position.sector}</div>
                      </div>
                    </div>
                    <Progress value={position.weight} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Expected Return: {position.expectedReturn}%</span>
                      <span>Risk: {position.risk}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimized" className="space-y-6">
          {optimizationResult && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {optimizationResult.expectedReturn.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">Expected Return</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {optimizationResult.expectedRisk.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">Expected Risk</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {optimizationResult.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Sharpe Ratio</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {optimizationResult.var95.toFixed(2)}%
                      </div>
                      <div className="text-sm text-gray-600">VaR (95%)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Optimized Allocation</CardTitle>
                  <CardDescription>
                    Recommended portfolio weights based on {optimizationObjective} optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(optimizationResult.allocation).map(([symbol, weight]) => {
                      const position = positions.find(p => p.symbol === symbol);
                      return (
                        <div key={symbol} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{symbol}</Badge>
                              <span className="text-sm font-medium">{position?.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{weight.toFixed(1)}%</div>
                              <div className="text-xs text-gray-500">
                                {weight > (position?.weight || 0) ? "+" : ""}
                                {(weight - (position?.weight || 0)).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          <Progress value={weight} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="rebalance" className="space-y-6">
          {rebalanceRecommendations.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Rebalancing Recommendations
                </CardTitle>
                <CardDescription>
                  Actions needed to achieve optimized allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rebalanceRecommendations.map((rec) => (
                    <div key={rec.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{rec.symbol}</Badge>
                        <div>
                          <div className="font-medium">{rec.action}</div>
                          <div className="text-sm text-gray-500">
                            {rec.currentWeight}% → {rec.targetWeight}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${rec.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {rec.change > 0 ? '+' : ''}{rec.change.toFixed(1)}%
                        </div>
                        <Badge variant={rec.action === 'Buy' ? 'default' : rec.action === 'Sell' ? 'destructive' : 'secondary'}>
                          {rec.action}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 mt-6">
                  <Button onClick={applyOptimization} className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Apply Optimization
                  </Button>
                  <Button variant="outline">
                    Export Rebalancing Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Run optimization first to see rebalancing recommendations
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PortfolioOptimizer; 