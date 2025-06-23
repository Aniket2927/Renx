import { useState } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  TrendingUp,
  PieChart,
  Zap,
  Search,
  BarChart3,
  Shield,
  TestTube,
  Users,
  Newspaper,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  Bot,
  Target,
  Activity
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Trading",
    href: "/trading",
    icon: TrendingUp,
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    icon: PieChart,
  },
  {
    title: "AI Signals",
    href: "/ai-signals",
    icon: Zap,
  },
  {
    title: "Market Scanner",
    href: "/market-scanner",
    icon: Search,
  },
  {
    title: "Screening",
    href: "/screening",
    icon: BarChart3,
  },
  {
    title: "Risk Management",
    href: "/risk-management",
    icon: Shield,
  },
  {
    title: "Backtesting",
    href: "/backtesting",
    icon: TestTube,
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
  },
  {
    title: "News",
    href: "/news",
    icon: Newspaper,
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header Section */}
      {!isCollapsed && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">RenX AI</h2>
              <p className="text-xs text-gray-500">Neural Platform</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {/* Trading Section */}
          {!isCollapsed && (
            <div className="px-3 py-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trading</h3>
            </div>
          )}
          
          {navigationItems.slice(0, 4).map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer relative",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500"
                  )} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium flex-1">{item.title}</span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* AI Analytics Section */}
          {!isCollapsed && (
            <div className="px-3 py-3 mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Analytics</h3>
            </div>
          )}
          
          {navigationItems.slice(4, 8).map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer relative",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500"
                  )} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium flex-1">{item.title}</span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Social & Tools Section */}
          {!isCollapsed && (
            <div className="px-3 py-3 mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Social & Tools</h3>
            </div>
          )}
          
          {navigationItems.slice(8).map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer relative",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500"
                  )} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium flex-1">{item.title}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* AI Assistant Quick Access */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">AI Assistant</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Get instant market insights and trading recommendations
            </p>
            <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Ask AI
            </Button>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        <Link href="/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-10 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50",
              isCollapsed && "justify-center px-0",
              location === "/settings" && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
            )}
          >
            <Settings className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </Button>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 p-0 shadow-md hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}