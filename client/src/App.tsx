
import { Switch, Route } from "wouter";
import { Header } from "@/components/Layout/Header";
import { Sidebar } from "@/components/Layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Landing from "@/pages/Landing";
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
import NotFound from "@/pages/not-found";

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
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/trading" component={Trading} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/ai-signals" component={AISignals} />
          <Route path="/market-scanner" component={MarketScanner} />
          <Route path="/screening" component={Screening} />
          <Route path="/risk-management" component={RiskManagement} />
          <Route path="/backtesting" component={Backtesting} />
          <Route path="/community" component={Community} />
          <Route path="/news" component={News} />
          <Route path="/settings" component={Settings} />
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