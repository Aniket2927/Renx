import { Switch, Route } from "wouter";
import { Header } from "@/components/Layout/Header";
import { Sidebar } from "@/components/Layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Trading from "@/pages/Trading";
import Portfolio from "@/pages/Portfolio";
import AISignals from "@/pages/AISignals";
import MarketScanner from "@/pages/MarketScanner";
import Screening from "@/pages/Screening";
import RiskManagement from "@/pages/RiskManagement";
import Backtesting from "@/pages/Backtesting";
import Community from "@/pages/Community";
import News from "@/pages/News";
import Settings from "@/pages/Settings";
import AdvancedAnalytics from "@/pages/AdvancedAnalytics";
import Diagnostics from "@/pages/Diagnostics";
import NotFound from "@/pages/not-found";

// Components for Profile
// @ts-ignore - JSX component without types
import ProfilePage from "@/components/profile/ProfilePage";

// Placeholder components for missing features
const ThresholdConfig = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Threshold Configuration</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 mb-4">Configure trading thresholds and risk limits per tenant.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Trading Limits</h3>
          <p className="text-sm text-gray-600">Max order size, leverage, margin requirements</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Risk Controls</h3>
          <p className="text-sm text-gray-600">Daily loss limits, position size controls</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Execution Settings</h3>
          <p className="text-sm text-gray-600">Slippage tolerance, timing controls</p>
        </div>
      </div>
    </div>
  </div>
);

const Compliance = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Compliance & Regulatory</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 mb-4">Compliance monitoring and regulatory reporting tools.</p>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Trade Surveillance</h3>
            <p className="text-sm text-gray-600">Monitor for unusual trading patterns</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-semibold">Risk Reporting</h3>
            <p className="text-sm text-gray-600">Automated regulatory reports</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
        </div>
      </div>
    </div>
  </div>
);

const MarketData = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Market Data Management</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 mb-4">Real-time and historical market data feeds.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">TwelveData API</h3>
          <p className="text-sm text-gray-600">Real-time stock, crypto, and forex data</p>
          <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Connected</span>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Historical Data</h3>
          <p className="text-sm text-gray-600">Backtesting and analysis datasets</p>
          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Available</span>
        </div>
      </div>
    </div>
  </div>
);

const SentimentAnalysis = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Sentiment Analysis</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 mb-4">AI-powered market sentiment analysis and social media monitoring.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-3xl font-bold text-green-600">72%</div>
          <p className="text-sm text-gray-600">Bullish Sentiment</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-3xl font-bold text-blue-600">68</div>
          <p className="text-sm text-gray-600">Fear & Greed Index</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-3xl font-bold text-purple-600">84%</div>
          <p className="text-sm text-gray-600">AI Confidence</p>
        </div>
      </div>
    </div>
  </div>
);

const CorrelationMatrix = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Correlation Analysis</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 mb-4">Asset correlation analysis and portfolio diversification insights.</p>
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-600">Interactive correlation matrix will be displayed here</p>
      </div>
    </div>
  </div>
);

const Notifications = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Notification Center</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 mb-4">Manage alerts, notifications, and communication preferences.</p>
      <div className="space-y-3">
        {[
          { type: "Price Alert", message: "AAPL reached target price of $150", time: "2 min ago", status: "new" },
          { type: "AI Signal", message: "Strong buy signal detected for MSFT", time: "15 min ago", status: "read" },
          { type: "Risk Alert", message: "Portfolio exposure exceeds limit", time: "1 hour ago", status: "urgent" }
        ].map((notification, i) => (
          <div key={i} className={`p-4 border rounded-lg ${notification.status === 'urgent' ? 'border-red-200 bg-red-50' : notification.status === 'new' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{notification.type}</h4>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
              <span className="text-xs text-gray-500">{notification.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AuditLogs = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Audit Logs</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 mb-4">System activity logs and security audit trail.</p>
      <div className="space-y-2">
        {[
          { action: "User Login", user: "demo@renx.ai", time: "2024-06-24 10:30:15", ip: "192.168.1.100" },
          { action: "Trade Executed", user: "demo@renx.ai", time: "2024-06-24 10:25:42", details: "BUY AAPL 100 shares" },
          { action: "Settings Changed", user: "admin@renx.ai", time: "2024-06-24 09:15:33", details: "Risk threshold updated" }
        ].map((log, i) => (
          <div key={i} className="p-3 border rounded text-sm">
            <div className="grid grid-cols-4 gap-4">
              <span className="font-medium">{log.action}</span>
              <span>{log.user}</span>
              <span className="text-gray-600">{log.time}</span>
              <span className="text-gray-600">{log.ip || log.details}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PricingBilling = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Pricing & Billing</h1>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 mb-4">Subscription management and billing information.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4 text-center">
          <h3 className="font-semibold text-lg">Free</h3>
          <div className="text-2xl font-bold my-2">$0</div>
          <p className="text-sm text-gray-600">Basic features</p>
        </div>
        <div className="border-2 border-blue-500 rounded-lg p-4 text-center relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs">Current</div>
          <h3 className="font-semibold text-lg">Pro</h3>
          <div className="text-2xl font-bold my-2">$29</div>
          <p className="text-sm text-gray-600">Advanced AI features</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <h3 className="font-semibold text-lg">Enterprise</h3>
          <div className="text-2xl font-bold my-2">$99</div>
          <p className="text-sm text-gray-600">Full feature access</p>
        </div>
      </div>
    </div>
  </div>
);

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading RenX AI Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <>
          {/* Trading Core */}
          <Route path="/" component={Dashboard} />
          <Route path="/trading" component={Trading} />
          <Route path="/portfolio" component={Portfolio} />
          
          {/* AI & Analytics */}
          <Route path="/ai-signals" component={AISignals} />
          <Route path="/advanced-analytics" component={AdvancedAnalytics} />
          <Route path="/market-scanner" component={MarketScanner} />
          <Route path="/screening" component={Screening} />
          <Route path="/backtesting" component={Backtesting} />
          
          {/* Risk & Compliance */}
          <Route path="/risk-management" component={RiskManagement} />
          <Route path="/threshold-config" component={ThresholdConfig} />
          <Route path="/compliance" component={Compliance} />
          
          {/* Market Intelligence */}
          <Route path="/news" component={News} />
          <Route path="/market-data" component={MarketData} />
          <Route path="/sentiment" component={SentimentAnalysis} />
          <Route path="/correlation" component={CorrelationMatrix} />
          
          {/* Enterprise Tools */}
          <Route path="/community" component={Community} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/audit-logs" component={AuditLogs} />
          <Route path="/pricing" component={PricingBilling} />
          
          {/* User Management */}
          <Route path="/profile" component={ProfilePage} />
          <Route path="/settings" component={Settings} />
          
          {/* Development Tools */}
          <Route path="/diagnostics" component={Diagnostics} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && !isLoading ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto bg-background">
              <div className="h-full">
                <Router />
              </div>
            </main>
          </div>
        </div>
      ) : (
        <Router />
      )}
    </div>
  );
}

export default App;