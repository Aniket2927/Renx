import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, TrendingUp, ExternalLink, Search, Filter, Clock, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function News() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch latest news
  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ["/api/news"],
    enabled: isAuthenticated,
  });

  // Fetch market news with sentiment
  const { data: marketNews, isLoading: marketNewsLoading } = useQuery({
    queryKey: ["/api/market/news"],
    enabled: isAuthenticated,
  });

  // Mock sentiment data for demonstration
  const sectorSentiments = [
    { name: "Technology", sentiment: 78, color: "bg-green-400" },
    { name: "Healthcare", sentiment: 65, color: "bg-green-400" },
    { name: "Finance", sentiment: 45, color: "bg-yellow-400" },
    { name: "Energy", sentiment: 32, color: "bg-red-400" },
    { name: "Consumer", sentiment: 58, color: "bg-green-400" },
    { name: "Industrial", sentiment: 42, color: "bg-yellow-400" },
  ];

  const trendingTopics = [
    "#Earnings", "#AI", "#FederalReserve", "#Inflation", 
    "#Tesla", "#Apple", "#Crypto", "#Climate"
  ];

  const marketSentiment = {
    overall: "Bullish",
    score: 67,
    change: "+5.2%"
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return 'bg-green-600';
      case 'bearish':
      case 'negative':
        return 'bg-red-600';
      default:
        return 'bg-yellow-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      default:
        return 'bg-blue-600';
    }
  };

  const filterNews = (newsItems: any[]) => {
    if (!newsItems) return [];
    
    let filtered = newsItems;
    
    if (filter !== "all") {
      filtered = filtered.filter(item => item.impact === filter || item.sentiment === filter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symbols?.some((symbol: string) => symbol.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  // Combine news sources
  const newsList = Array.isArray(news) ? news : [];
  const marketNewsList = Array.isArray(marketNews) ? marketNews : [];
  const allNews = [...newsList, ...marketNewsList];
  const filteredNews = filterNews(allNews);

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced News Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Market News & Analysis</h1>
            <p className="text-muted-foreground">Stay informed with real-time market news and AI-powered sentiment analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="badge-success">Live Feed</Badge>
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Global Markets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stat-card group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Market Sentiment</CardTitle>
                <Badge className="badge-success mt-1">Bullish</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{marketSentiment.score}%</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">confidence level</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Newspaper className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">News Articles</CardTitle>
                <Badge className="badge-info mt-1">Today</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">{allNews.length || 24}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">published</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Filter className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">High Impact</CardTitle>
                <Badge className="badge-warning mt-1">Alert</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">8</div>
              <div className="text-sm text-amber-600 dark:text-amber-400 font-semibold">breaking news</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Update</CardTitle>
                <Badge className="badge-success mt-1">Live</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">2m</div>
              <div className="text-sm text-rose-600 dark:text-rose-400 font-semibold">ago</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="trading-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search news, symbols, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="all">All News</option>
                <option value="high">High Impact</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main News Feed */}
        <div className="lg:col-span-3">
          <Card className="trading-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Newspaper className="text-primary" size={20} />
                <span>Latest News</span>
                <Badge className="badge-success ml-auto">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {newsLoading || marketNewsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="loading-spinner"></div>
                  </div>
                ) : filteredNews.length > 0 ? (
                  filteredNews.slice(0, 10).map((article: any, index: number) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={`${getSentimentColor(article.sentiment || 'neutral')} text-white`}>
                              {article.sentiment || 'Neutral'}
                            </Badge>
                            <Badge className={`${getImpactColor(article.impact || 'low')} text-white`}>
                              {article.impact || 'Low'} Impact
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {article.publishedAt ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }) : '2 hours ago'}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                            {article.title || `Breaking: Market Update ${index + 1}`}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {article.summary || 'Market analysis shows significant movement in key sectors with implications for trading strategies.'}
                          </p>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-muted-foreground">
                              Source: {article.source || 'Financial Times'}
                            </span>
                            {article.symbols && (
                              <div className="flex space-x-1">
                                {article.symbols.slice(0, 3).map((symbol: string) => (
                                  <Badge key={symbol} variant="outline" className="text-xs">
                                    {symbol}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-4">
                          <ExternalLink size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    {/* Sample news articles */}
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="badge-success">Positive</Badge>
                            <Badge className="badge-warning">High Impact</Badge>
                            <span className="text-xs text-muted-foreground">2 hours ago</span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">
                            Federal Reserve Signals Potential Rate Cut Amid Economic Stabilization
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Markets rally as Fed officials hint at monetary policy easing in upcoming meetings, citing improved inflation metrics and employment data.
                          </p>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-muted-foreground">Source: Reuters</span>
                            <div className="flex space-x-1">
                              <Badge variant="outline" className="text-xs">SPY</Badge>
                              <Badge variant="outline" className="text-xs">TLT</Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="badge-success">Positive</Badge>
                            <Badge className="badge-info">Medium Impact</Badge>
                            <span className="text-xs text-muted-foreground">4 hours ago</span>
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">
                            Tech Giants Report Strong Q4 Earnings, AI Revenue Surges
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Major technology companies exceed expectations with robust AI-driven revenue growth, signaling strong sector momentum.
                          </p>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-muted-foreground">Source: Bloomberg</span>
                            <div className="flex space-x-1">
                              <Badge variant="outline" className="text-xs">AAPL</Badge>
                              <Badge variant="outline" className="text-xs">MSFT</Badge>
                              <Badge variant="outline" className="text-xs">GOOGL</Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Sector Sentiment */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Sector Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectorSentiments.map((sector) => (
                  <div key={sector.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{sector.name}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={sector.sentiment} className="w-16 h-2" />
                      <span className="text-xs font-semibold w-8">{sector.sentiment}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic) => (
                  <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Market Pulse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Bull/Bear Ratio</span>
                  <span className="text-sm font-bold text-emerald-600">2.3:1</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Fear & Greed Index</span>
                  <span className="text-sm font-bold text-emerald-600">72</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">VIX Level</span>
                  <span className="text-sm font-bold text-amber-600">18.5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}