import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Code, TrendingUp, BarChart3, Settings } from "lucide-react";

interface IndicatorParameter {
  name: string;
  type: "number" | "select" | "boolean";
  value: any;
  options?: string[];
  min?: number;
  max?: number;
  description?: string;
}

interface CustomIndicator {
  id: string;
  name: string;
  description: string;
  category: "trend" | "momentum" | "volatility" | "volume" | "custom";
  parameters: IndicatorParameter[];
  formula: string;
  code: string;
  isActive: boolean;
}

interface IndicatorPreset {
  name: string;
  description: string;
  parameters: IndicatorParameter[];
  formula: string;
  code: string;
}

const INDICATOR_PRESETS: Record<string, IndicatorPreset> = {
  customMA: {
    name: "Custom Moving Average",
    description: "Weighted moving average with custom weights",
    parameters: [
      { name: "period", type: "number", value: 20, min: 1, max: 200, description: "Lookback period" },
      { name: "weight_type", type: "select", value: "linear", options: ["linear", "exponential", "triangular"], description: "Weight distribution" }
    ],
    formula: "SUM(price[i] * weight[i]) / SUM(weight[i])",
    code: `
function customMA(prices, period, weightType) {
  const weights = generateWeights(period, weightType);
  const result = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    let weightedSum = 0;
    let weightSum = 0;
    
    for (let j = 0; j < period; j++) {
      weightedSum += prices[i - j] * weights[j];
      weightSum += weights[j];
    }
    
    result.push(weightedSum / weightSum);
  }
  
  return result;
}
    `
  },
  priceVelocity: {
    name: "Price Velocity",
    description: "Rate of price change with acceleration",
    parameters: [
      { name: "velocity_period", type: "number", value: 10, min: 1, max: 50, description: "Velocity calculation period" },
      { name: "smooth_period", type: "number", value: 3, min: 1, max: 20, description: "Smoothing period" },
      { name: "show_acceleration", type: "boolean", value: true, description: "Show acceleration line" }
    ],
    formula: "(price[n] - price[n-period]) / period",
    code: `
function priceVelocity(prices, velocityPeriod, smoothPeriod, showAcceleration) {
  const velocity = [];
  const acceleration = [];
  
  for (let i = velocityPeriod; i < prices.length; i++) {
    const vel = (prices[i] - prices[i - velocityPeriod]) / velocityPeriod;
    velocity.push(vel);
    
    if (showAcceleration && velocity.length > 1) {
      const acc = velocity[velocity.length - 1] - velocity[velocity.length - 2];
      acceleration.push(acc);
    }
  }
  
  return { velocity: smoothArray(velocity, smoothPeriod), acceleration };
}
    `
  },
  adaptiveRSI: {
    name: "Adaptive RSI",
    description: "RSI with dynamic period based on volatility",
    parameters: [
      { name: "base_period", type: "number", value: 14, min: 5, max: 50, description: "Base RSI period" },
      { name: "volatility_factor", type: "number", value: 0.1, min: 0.01, max: 1, description: "Volatility adjustment factor" },
      { name: "min_period", type: "number", value: 5, min: 2, max: 20, description: "Minimum period" },
      { name: "max_period", type: "number", value: 30, min: 10, max: 100, description: "Maximum period" }
    ],
    formula: "RSI with period = base_period ± (volatility * factor)",
    code: `
function adaptiveRSI(prices, basePeriod, volatilityFactor, minPeriod, maxPeriod) {
  const volatility = calculateVolatility(prices, 20);
  const result = [];
  
  for (let i = maxPeriod; i < prices.length; i++) {
    const vol = volatility[i - maxPeriod];
    const adaptedPeriod = Math.max(minPeriod, 
      Math.min(maxPeriod, basePeriod + Math.round(vol * volatilityFactor * basePeriod)));
    
    const rsi = calculateRSI(prices.slice(i - adaptedPeriod, i + 1), adaptedPeriod);
    result.push(rsi);
  }
  
  return result;
}
    `
  }
};

export function CustomIndicatorBuilder() {
  const [activeTab, setActiveTab] = useState("builder");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customIndicators, setCustomIndicators] = useState<CustomIndicator[]>([]);
  const [currentIndicator, setCurrentIndicator] = useState<CustomIndicator>({
    id: "",
    name: "",
    description: "",
    category: "custom",
    parameters: [],
    formula: "",
    code: "",
    isActive: false
  });

  const [testData, setTestData] = useState<number[]>([]);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    // Generate sample price data for testing
    const sampleData = [];
    let price = 100;
    for (let i = 0; i < 100; i++) {
      price += (Math.random() - 0.5) * 2;
      sampleData.push(Math.round(price * 100) / 100);
    }
    setTestData(sampleData);
  }, []);

  const loadPreset = (presetKey: string) => {
    const preset = INDICATOR_PRESETS[presetKey];
    if (preset) {
      setCurrentIndicator({
        id: `custom_${Date.now()}`,
        name: preset.name,
        description: preset.description,
        category: "custom",
        parameters: [...preset.parameters],
        formula: preset.formula,
        code: preset.code,
        isActive: false
      });
    }
  };

  const addParameter = () => {
    const newParam: IndicatorParameter = {
      name: `param_${currentIndicator.parameters.length + 1}`,
      type: "number",
      value: 0,
      description: ""
    };
    setCurrentIndicator(prev => ({
      ...prev,
      parameters: [...prev.parameters, newParam]
    }));
  };

  const updateParameter = (index: number, field: keyof IndicatorParameter, value: any) => {
    setCurrentIndicator(prev => ({
      ...prev,
      parameters: prev.parameters.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  const removeParameter = (index: number) => {
    setCurrentIndicator(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
  };

  const testIndicator = async () => {
    try {
      // Simulate indicator calculation
      const mockResults = {
        values: testData.slice(-20).map((_, i) => Math.random() * 100),
        signals: ["BUY", "HOLD", "SELL"][Math.floor(Math.random() * 3)],
        performance: {
          accuracy: Math.round((Math.random() * 30 + 60) * 100) / 100,
          profitability: Math.round((Math.random() * 20 + 5) * 100) / 100,
          maxDrawdown: Math.round((Math.random() * 10 + 2) * 100) / 100
        }
      };
      setTestResults(mockResults);
    } catch (error) {
      console.error("Test failed:", error);
    }
  };

  const saveIndicator = () => {
    if (currentIndicator.name && currentIndicator.formula) {
      const newIndicator = {
        ...currentIndicator,
        id: currentIndicator.id || `custom_${Date.now()}`
      };
      
      setCustomIndicators(prev => {
        const existing = prev.findIndex(ind => ind.id === newIndicator.id);
        if (existing >= 0) {
          return prev.map((ind, i) => i === existing ? newIndicator : ind);
        }
        return [...prev, newIndicator];
      });
      
      // Reset form
      setCurrentIndicator({
        id: "",
        name: "",
        description: "",
        category: "custom",
        parameters: [],
        formula: "",
        code: "",
        isActive: false
      });
      
      alert("Indicator saved successfully!");
    }
  };

  const toggleIndicator = (id: string) => {
    setCustomIndicators(prev => 
      prev.map(ind => 
        ind.id === id ? { ...ind, isActive: !ind.isActive } : ind
      )
    );
  };

  const deleteIndicator = (id: string) => {
    setCustomIndicators(prev => prev.filter(ind => ind.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Custom Indicator Builder
          </CardTitle>
          <CardDescription>
            Create and customize technical indicators for your trading strategy
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="test">Test & Validate</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Basic Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="indicator-name">Indicator Name</Label>
                  <Input
                    id="indicator-name"
                    value={currentIndicator.name}
                    onChange={(e) => setCurrentIndicator(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Indicator"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indicator-description">Description</Label>
                  <Textarea
                    id="indicator-description"
                    value={currentIndicator.description}
                    onChange={(e) => setCurrentIndicator(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this indicator does..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={currentIndicator.category} 
                    onValueChange={(value: any) => setCurrentIndicator(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trend">Trend</SelectItem>
                      <SelectItem value="momentum">Momentum</SelectItem>
                      <SelectItem value="volatility">Volatility</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Parameters
                  </span>
                  <Button size="sm" onClick={addParameter}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentIndicator.parameters.map((param, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <Input
                        value={param.name}
                        onChange={(e) => updateParameter(index, "name", e.target.value)}
                        placeholder="Parameter name"
                        className="w-32"
                      />
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => removeParameter(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select 
                        value={param.type} 
                        onValueChange={(value: any) => updateParameter(index, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>

                      {param.type === "number" && (
                        <Input
                          type="number"
                          value={param.value}
                          onChange={(e) => updateParameter(index, "value", parseFloat(e.target.value))}
                          placeholder="Default value"
                        />
                      )}
                      
                      {param.type === "boolean" && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={param.value}
                            onCheckedChange={(checked) => updateParameter(index, "value", checked)}
                          />
                          <Label>Enabled</Label>
                        </div>
                      )}
                    </div>

                    <Input
                      value={param.description || ""}
                      onChange={(e) => updateParameter(index, "description", e.target.value)}
                      placeholder="Parameter description"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Formula and Code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mathematical Formula</CardTitle>
                <CardDescription>
                  Describe the mathematical formula for your indicator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentIndicator.formula}
                  onChange={(e) => setCurrentIndicator(prev => ({ ...prev, formula: e.target.value }))}
                  placeholder="e.g., SMA(n) = (P1 + P2 + ... + Pn) / n"
                  rows={5}
                  className="font-mono"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Implementation Code</CardTitle>
                <CardDescription>
                  JavaScript implementation of your indicator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentIndicator.code}
                  onChange={(e) => setCurrentIndicator(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="function myIndicator(data, params) { ... }"
                  rows={10}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button onClick={saveIndicator} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Save Indicator
            </Button>
            <Button variant="outline" onClick={testIndicator}>
              Test Indicator
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(INDICATOR_PRESETS).map(([key, preset]) => (
              <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{preset.name}</CardTitle>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Parameters:</strong> {preset.parameters.length}
                    </div>
                    <div className="text-xs font-mono bg-gray-50 p-2 rounded">
                      {preset.formula}
                    </div>
                    <Button 
                      onClick={() => loadPreset(key)}
                      className="w-full"
                      size="sm"
                    >
                      Load Preset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Test & Validation
              </CardTitle>
              <CardDescription>
                Test your indicator against historical data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Button onClick={testIndicator}>Run Backtest</Button>
                <Button variant="outline">Use Real Data</Button>
              </div>

              {testResults && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {testResults.performance.accuracy}%
                        </div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {testResults.performance.profitability}%
                        </div>
                        <div className="text-sm text-gray-600">Profitability</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {testResults.performance.maxDrawdown}%
                        </div>
                        <div className="text-sm text-gray-600">Max Drawdown</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Custom Indicators</CardTitle>
              <CardDescription>
                Manage and deploy your custom indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customIndicators.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No custom indicators yet. Create one using the Builder tab.
                </div>
              ) : (
                <div className="space-y-4">
                  {customIndicators.map((indicator) => (
                    <div key={indicator.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{indicator.name}</h3>
                            <Badge variant={indicator.isActive ? "default" : "secondary"}>
                              {indicator.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{indicator.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{indicator.description}</p>
                          <div className="text-xs text-gray-500">
                            Parameters: {indicator.parameters.length}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={indicator.isActive ? "destructive" : "default"}
                            onClick={() => toggleIndicator(indicator.id)}
                          >
                            {indicator.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setCurrentIndicator(indicator)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteIndicator(indicator.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CustomIndicatorBuilder; 