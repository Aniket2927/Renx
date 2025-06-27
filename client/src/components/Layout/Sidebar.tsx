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
  Activity,
  UserCircle,
  BookOpen,
  LineChart,
  Cpu,
  TrendingDown,
  Globe,
  DollarSign,
  AlertTriangle,
  Database,
  Layers,
  Cog,
  Bell,
  FileText,
  BarChart2,
  Gauge,
  Sparkles,
  Network,
  Timer,
  ChartLine
} from "lucide-react";

const navigationItems = [
  // Trading Core
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
    section: "trading"
  },
  {
    title: "Trading",
    href: "/trading",
    icon: TrendingUp,
    section: "trading"
  },
  {
    title: "Portfolio",
    href: "/portfolio",
    icon: PieChart,
    section: "trading"
  },
  
  // AI & Analytics
  {
    title: "AI Signals",
    href: "/ai-signals",
    icon: Zap,
    section: "ai"
  },
  {
    title: "Advanced Analytics",
    href: "/advanced-analytics",
    icon: BarChart2,
    section: "ai"
  },
  {
    title: "Market Scanner",
    href: "/market-scanner",
    icon: Search,
    section: "ai"
  },
  {
    title: "Screening",
    href: "/screening",
    icon: BarChart3,
    section: "ai"
  },
  {
    title: "Backtesting",
    href: "/backtesting",
    icon: TestTube,
    section: "ai"
  },
  
  // Risk & Management
  {
    title: "Risk Management",
    href: "/risk-management",
    icon: Shield,
    section: "risk"
  },
  {
    title: "Threshold Config",
    href: "/threshold-config",
    icon: Gauge,
    section: "risk"
  },
  {
    title: "Compliance",
    href: "/compliance",
    icon: FileText,
    section: "risk"
  },
  
  // Market Intelligence
  {
    title: "News & Analysis",
    href: "/news",
    icon: Newspaper,
    section: "market"
  },
  {
    title: "Market Data",
    href: "/market-data",
    icon: Database,
    section: "market"
  },
  {
    title: "Sentiment Analysis",
    href: "/sentiment",
    icon: Brain,
    section: "market"
  },
  {
    title: "Correlation Matrix",
    href: "/correlation",
    icon: Network,
    section: "market"
  },
  
  // Enterprise Tools
  {
    title: "Community",
    href: "/community",
    icon: Users,
    section: "enterprise"
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    section: "enterprise"
  },
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: Activity,
    section: "enterprise"
  },
  {
    title: "Pricing & Billing",
    href: "/pricing",
    icon: DollarSign,
    section: "enterprise"
  },
  
  // User Management
  {
    title: "Profile",
    href: "/profile",
    icon: UserCircle,
    section: "user"
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    section: "user"
  },
  
  // Development Tools
  {
    title: "System Diagnostics",
    href: "/diagnostics",
    icon: Activity,
    section: "dev"
  }
];

const sectionConfig = {
  trading: {
    title: "Trading Core",
    color: "blue"
  },
  ai: {
    title: "AI & Analytics",
    color: "purple"
  },
  risk: {
    title: "Risk & Compliance",
    color: "orange"
  },
  market: {
    title: "Market Intelligence", 
    color: "green"
  },
  enterprise: {
    title: "Enterprise Tools",
    color: "indigo"
  },
  user: {
    title: "User Management",
    color: "gray"
  },
  dev: {
    title: "Development Tools",
    color: "red"
  }
};

export function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigationItems>);

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive 
        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500"
        : "hover:bg-blue-50 dark:hover:bg-blue-900/10",
      purple: isActive
        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-l-4 border-purple-500"
        : "hover:bg-purple-50 dark:hover:bg-purple-900/10",
      orange: isActive
        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-l-4 border-orange-500"
        : "hover:bg-orange-50 dark:hover:bg-orange-900/10",
      green: isActive
        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-l-4 border-green-500"
        : "hover:bg-green-50 dark:hover:bg-green-900/10",
      indigo: isActive
        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-500"
        : "hover:bg-indigo-50 dark:hover:bg-indigo-900/10",
      gray: isActive
        ? "bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-l-4 border-gray-500"
        : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

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
              <p className="text-xs text-gray-500">Enterprise Platform</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-white dark:bg-gray-950 shadow-md"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-6 px-3">
          {Object.entries(groupedItems).map(([section, items]) => {
            const config = sectionConfig[section as keyof typeof sectionConfig] || sectionConfig.user;
            
            return (
              <div key={section}>
                {/* Section Header */}
                {!isCollapsed && (
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {config.title}
                    </h3>
                  </div>
                )}
                
                {/* Section Items */}
                <div className="space-y-1">
                  {items.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={cn(
                            "group flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer relative",
                            isActive
                              ? getColorClasses(config.color, true)
                              : cn(
                                  "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
                                  getColorClasses(config.color, false)
                                ),
                            isCollapsed && "justify-center"
                          )}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 flex-shrink-0",
                            isActive 
                              ? `text-${config.color}-600 dark:text-${config.color}-400` 
                              : "text-gray-500"
                          )} />
                          {!isCollapsed && (
                            <span className="text-sm font-medium flex-1">{item.title}</span>
                          )}
                          
                          {/* Tooltip for collapsed state */}
                          {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                              {item.title}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <Sparkles className="h-4 w-4" />
            <span>Multi-Tenant • RBAC Enabled</span>
          </div>
        </div>
      )}
    </div>
  );
}