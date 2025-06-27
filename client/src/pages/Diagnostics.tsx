import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface FeatureTest {
  name: string;
  endpoint?: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  category: string;
}

export default function Diagnostics() {
  const [tests, setTests] = useState<FeatureTest[]>([
    // Backend API Tests - Public Endpoints
    { name: "Health Check", endpoint: "/health", status: 'pending', message: '', category: 'Core API' },
    { name: "Market Data", endpoint: "/api/market/quote/AAPL", status: 'pending', message: '', category: 'Market Data' },
    { name: "Market News", endpoint: "/api/market/news", status: 'pending', message: '', category: 'Market Data' },
    { name: "AI Signals", endpoint: "/api/ai/signals", status: 'pending', message: '', category: 'AI Services' },
    { name: "Market Insights", endpoint: "/api/ai/market-insights", status: 'pending', message: '', category: 'AI Services' },
    { name: "Sentiment Analysis", endpoint: "/api/ai/sentiment-analysis", status: 'pending', message: '', category: 'AI Services' },
    { name: "News Feed", endpoint: "/api/news", status: 'pending', message: '', category: 'Market Data' },
    { name: "Community Posts", endpoint: "/api/community/posts", status: 'pending', message: '', category: 'Social' },
    
    // Authenticated API Tests
    { name: "User Authentication", endpoint: "/api/auth/user", status: 'pending', message: '', category: 'Core API' },
    { name: "Portfolio Summary", endpoint: "/api/portfolio/summary", status: 'pending', message: '', category: 'Portfolio' },
    { name: "Trades Data", endpoint: "/api/trades", status: 'pending', message: '', category: 'Trading' },
    { name: "Watchlist", endpoint: "/api/watchlists", status: 'pending', message: '', category: 'Market Data' },
    { name: "User Notifications", endpoint: "/api/notifications", status: 'pending', message: '', category: 'Enterprise' },
    
    // Configuration & Admin Tests
    { name: "Threshold Config", endpoint: "/api/config/thresholds/defaults", status: 'pending', message: '', category: 'Configuration' },
    { name: "AI Predictions", endpoint: "/api/ai/predictions/AAPL", status: 'pending', message: '', category: 'AI Services' },
    { name: "AI Analysis", endpoint: "/api/ai/analysis/AAPL", status: 'pending', message: '', category: 'AI Services' },
    { name: "Pricing Plans", endpoint: "/api/pricing/plans", status: 'pending', message: '', category: 'Enterprise' },
    { name: "Audit Logs", endpoint: "/api/audit/logs", status: 'pending', message: '', category: 'Enterprise' },
    
    // AI Backend Tests  
    { name: "AI Backend Health", endpoint: "http://localhost:8181/health", status: 'pending', message: '', category: 'AI Backend' },
    { name: "Anomaly Detection", endpoint: "http://localhost:8181/anomalies/AAPL", status: 'pending', message: '', category: 'AI Backend' },
    
    // Frontend Component Tests
    { name: "Sidebar Navigation", status: 'pending', message: '', category: 'UI Components' },
    { name: "Dashboard Components", status: 'pending', message: '', category: 'UI Components' },
    { name: "Trading Charts", status: 'pending', message: '', category: 'UI Components' },
    { name: "Profile Page", status: 'pending', message: '', category: 'UI Components' },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const testEndpoint = async (endpoint: string): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header for all non-AI backend endpoints
      if (token && !endpoint.includes('localhost:8181')) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, { 
        method: 'GET',
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check if response contains error messages even with 200 status
        if (data.message && data.message.includes('Failed')) {
          return { success: false, message: `API Error: ${data.message}` };
        } else if (data.error) {
          return { success: false, message: `API Error: ${data.error.message || data.error}` };
        } else if (Array.isArray(data) && data.length === 0) {
          return { success: true, message: `Status: ${response.status} - Empty array (no data)` };
        } else {
          return { success: true, message: `Status: ${response.status} - ${JSON.stringify(data).substring(0, 100)}...` };
        }
      } else if (response.status === 401) {
        return { success: false, message: `Authentication required (401) - ${token ? 'Token may be invalid' : 'No token found'}` };
      } else if (response.status === 403) {
        return { success: false, message: `Access forbidden (403) - Insufficient permissions` };
      } else {
        const errorText = await response.text();
        return { success: false, message: `HTTP ${response.status}: ${errorText.substring(0, 100)}` };
      }
    } catch (error: any) {
      return { success: false, message: `Network Error: ${error.message}` };
    }
  };

  const testUIComponent = async (name: string): Promise<{ success: boolean; message: string }> => {
    try {
      switch (name) {
        case 'Sidebar Navigation':
          const sidebar = document.querySelector('[data-testid="sidebar"]') || document.querySelector('nav');
          return { 
            success: !!sidebar, 
            message: sidebar ? 'Sidebar found and rendered' : 'Sidebar not found in DOM' 
          };
        
        case 'Dashboard Components':
          const dashboard = document.querySelector('[data-testid="dashboard"]') || document.querySelector('main');
          return { 
            success: !!dashboard, 
            message: dashboard ? 'Dashboard components rendered' : 'Dashboard not found' 
          };
        
        case 'Trading Charts':
          const charts = document.querySelectorAll('canvas, svg[class*="chart"], [class*="trading-chart"]');
          return { 
            success: charts.length > 0, 
            message: `Found ${charts.length} chart elements` 
          };
        
        case 'Profile Page':
          try {
            // Test if ProfilePage component can be loaded
            // @ts-ignore - JSX component without types
            const ProfilePage = await import('@/components/profile/ProfilePage');
            return { 
              success: !!ProfilePage.default, 
              message: 'ProfilePage component available' 
            };
          } catch (e) {
            return { success: false, message: 'ProfilePage component not found' };
          }
        
        default:
          return { success: false, message: 'Unknown UI test' };
      }
    } catch (error: any) {
      return { success: false, message: `UI Test Error: ${error.message}` };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      setTests(prev => prev.map((t, idx) => 
        idx === i ? { ...t, status: 'pending', message: 'Testing...' } : t
      ));

      let result;
      if (test.endpoint) {
        result = await testEndpoint(test.endpoint);
      } else {
        result = await testUIComponent(test.name);
      }

      setTests(prev => prev.map((t, idx) => 
        idx === i ? { 
          ...t, 
          status: result.success ? 'success' : 'error',
          message: result.message 
        } : t
      ));

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const groupedTests = tests.reduce((acc, test) => {
    if (!acc[test.category]) acc[test.category] = [];
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, FeatureTest[]>);

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const totalTests = tests.length;

  // Authentication status
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const isAuthenticated = !!token;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Diagnostics</h1>
        <p className="text-muted-foreground">
          Comprehensive testing of all integrated RenX features
        </p>
      </div>

      {/* Authentication Status */}
      <Card className={`border-l-4 ${isAuthenticated ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {isAuthenticated ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Authentication Status
              </h3>
              <p className="text-sm text-gray-600">
                {isAuthenticated 
                  ? `Authenticated - Token: ${token?.substring(0, 20)}...`
                  : 'Not authenticated - Some tests may fail'
                }
              </p>
            </div>
            {!isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/login'}
              >
                Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
            <p className="text-sm text-gray-600">Total Tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <p className="text-sm text-gray-600">Passing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <p className="text-sm text-gray-600">Failing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{totalTests - successCount - errorCount}</div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTests).map(([category, categoryTests]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category}
                <Badge variant="outline">
                  {categoryTests.filter(t => t.status === 'success').length}/{categoryTests.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryTests.map((test, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        {test.endpoint && (
                          <div className="text-xs text-gray-500">{test.endpoint}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(test.status) as any}>
                        {test.status}
                      </Badge>
                      {test.message && (
                        <div className="text-xs text-gray-600 max-w-md truncate">
                          {test.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 