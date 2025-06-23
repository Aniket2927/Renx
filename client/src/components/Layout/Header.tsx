import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Search, TrendingUp, TrendingDown, Brain, Zap, Settings, User, LogOut, Palette, AlertCircle, BarChart3, Target } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

export function Header() {
  const { user } = useAuth();
  const [aiMode, setAiMode] = useState("active");

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getDisplayName = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return "User";
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Brand & AI Status */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RenX AI</h1>
              <p className="text-xs text-gray-500">Neural Trading Platform</p>
            </div>
          </div>

          {/* AI Status & Market Data */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">AI Active</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">S&P 500</p>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-sm font-semibold text-green-600">4,231</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">NASDAQ</p>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-sm font-semibold text-green-600">13,542</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">AI Confidence</p>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600">94%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Brain className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
            <input
              type="text"
              placeholder="Ask AI Assistant or search symbols..."
              className="w-96 pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right: Controls & User */}
        <div className="flex items-center space-x-4">
          {/* Portfolio Summary */}
          <div className="hidden xl:flex items-center space-x-4 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500">Portfolio</p>
              <p className="text-sm font-semibold text-green-600">$247,890</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Day P&L</p>
              <p className="text-sm font-semibold text-green-600">+$3,245</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Return</p>
              <p className="text-sm font-semibold text-green-600">+18.7%</p>
            </div>
          </div>

          {/* AI Mode Selector */}
          <Select value={aiMode} onValueChange={setAiMode}>
            <SelectTrigger className="w-36 h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <Brain className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">🤖 AI Active</SelectItem>
              <SelectItem value="learning">📚 Learning</SelectItem>
              <SelectItem value="conservative">🛡️ Conservative</SelectItem>
              <SelectItem value="aggressive">⚡ Aggressive</SelectItem>
            </SelectContent>
          </Select>

          <ThemeSelector />

          {/* AI Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                  5
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96" align="end">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>AI Alerts & Notifications</span>
                <Badge variant="destructive">5 new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto space-y-1">
                <DropdownMenuItem className="flex items-start space-x-3 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Brain className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">AI Signal Generated</p>
                    <p className="text-xs text-gray-500">Strong BUY signal for AAPL - 96% confidence</p>
                    <p className="text-xs text-blue-600">2 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start space-x-3 p-4 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Risk Alert</p>
                    <p className="text-xs text-gray-500">Portfolio concentration in tech sector detected</p>
                    <p className="text-xs text-amber-600">5 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start space-x-3 p-4 hover:bg-green-50 dark:hover:bg-green-900/20">
                  <Target className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Target Hit</p>
                    <p className="text-xs text-gray-500">TSLA reached your profit target of $250</p>
                    <p className="text-xs text-green-600">10 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start space-x-3 p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <BarChart3 className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Market Pattern</p>
                    <p className="text-xs text-gray-500">Bullish flag pattern detected in QQQ</p>
                    <p className="text-xs text-purple-600">15 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start space-x-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <TrendingDown className="h-4 w-4 text-red-500 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Stop Loss Triggered</p>
                    <p className="text-xs text-gray-500">Position closed: NVDA at $890</p>
                    <p className="text-xs text-red-600">30 minutes ago</p>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                View All Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={(user as any)?.profileImageUrl || undefined} 
                    alt={getDisplayName((user as any)?.firstName, (user as any)?.lastName)}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {getInitials((user as any)?.firstName, (user as any)?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getInitials((user as any)?.firstName, (user as any)?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold leading-none">
                        {getDisplayName((user as any)?.firstName, (user as any)?.lastName)}
                      </p>
                      <p className="text-xs leading-none text-gray-500 mt-1">
                        {(user as any)?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500">Trading Level</span>
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">AI Pro Trader</Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <User className="mr-3 h-4 w-4" />
                <span>Profile & Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <BarChart3 className="mr-3 h-4 w-4" />
                <span>Trading Performance</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Brain className="mr-3 h-4 w-4" />
                <span>AI Assistant Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Settings className="mr-3 h-4 w-4" />
                <span>Platform Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => {
                  window.location.href = "/api/logout";
                }}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}