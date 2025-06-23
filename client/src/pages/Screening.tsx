import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import ThemeSelector from "@/components/Layout/ThemeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, TrendingUp, Filter, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Screening() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    marketCap: "all",
    peRatio: "all",
    sector: "all",
    volume: "all",
    aiScore: "all"
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Mock screening results - in real app this would come from the backend
  const mockResults = [
    {
      symbol: "AAPL",
      company: "Apple Inc.",
      price: 175.43,
      change: 2.34,
      volume: 45200000,
      marketCap: "2.8T",
      pe: 28.5,
      aiScore: 92,
      sector: "Technology"
    },
    {
      symbol: "GOOGL", 
      company: "Alphabet Inc.",
      price: 142.56,
      change: 1.87,
      volume: 23400000,
      marketCap: "1.8T",
      pe: 24.2,
      aiScore: 89,
      sector: "Technology"
    },
    {
      symbol: "MSFT",
      company: "Microsoft Corp.",
      price: 378.91,
      change: -1.23,
      volume: 18900000,
      marketCap: "2.9T",
      pe: 31.4,
      aiScore: 87,
      sector: "Technology"
    },
    {
      symbol: "TSLA",
      company: "Tesla Inc.",
      price: 248.45,
      change: 4.67,
      volume: 67800000,
      marketCap: "789B",
      pe: 52.1,
      aiScore: 84,
      sector: "Automotive"
    },
    {
      symbol: "NVDA",
      company: "NVIDIA Corp.",
      price: 485.67,
      change: 8.92,
      volume: 34500000,
      marketCap: "1.2T",
      pe: 45.8,
      aiScore: 95,
      sector: "Technology"
    }
  ];

  const filterResults = (results: any[]) => {
    let filtered = results;

    // Apply filters
    if (filters.sector !== "all") {
      filtered = filtered.filter(stock => stock.sector.toLowerCase() === filters.sector);
    }

    if (filters.aiScore !== "all") {
      const minScore = parseInt(filters.aiScore.replace("+", ""));
      filtered = filtered.filter(stock => stock.aiScore >= minScore);
    }

    if (filters.marketCap !== "all") {
      // Mock filter logic - in real app this would be more sophisticated
      filtered = filtered.filter(stock => {
        if (filters.marketCap === "large") return stock.marketCap.includes("T");
        if (filters.marketCap === "mid") return stock.marketCap.includes("B") && !stock.marketCap.includes("T");
        return true;
      });
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredResults = filterResults(mockResults);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPriceColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleAddToWatchlist = (symbol: string) => {
    toast({
      title: "Added to Watchlist",
      description: `${symbol} has been added to your watchlist.`,
    });
  };

  const handleTrade = (symbol: string) => {
    toast({
      title: "Trade Initiated",
      description: `Opening trading interface for ${symbol}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen">
        <Header 
          title="Stock Screening" 
          subtitle="Find opportunities with AI-powered screening"
        />
        
        <div className="p-6">
          {/* Search and Filters */}
          <Card className="trading-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="text-primary" size={20} />
                <span>Screening Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search stocks by symbol or company name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Market Cap</label>
                  <Select value={filters.marketCap} onValueChange={(value) => setFilters(prev => ({...prev, marketCap: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="large">Large Cap</SelectItem>
                      <SelectItem value="mid">Mid Cap</SelectItem>
                      <SelectItem value="small">Small Cap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">P/E Ratio</label>
                  <Select value={filters.peRatio} onValueChange={(value) => setFilters(prev => ({...prev, peRatio: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="0-15">0-15</SelectItem>
                      <SelectItem value="15-25">15-25</SelectItem>
                      <SelectItem value="25+">25+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sector</label>
                  <Select value={filters.sector} onValueChange={(value) => setFilters(prev => ({...prev, sector: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Volume</label>
                  <Select value={filters.volume} onValueChange={(value) => setFilters(prev => ({...prev, volume: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="1m+">1M+</SelectItem>
                      <SelectItem value="10m+">10M+</SelectItem>
                      <SelectItem value="100m+">100M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">AI Score</label>
                  <Select value={filters.aiScore} onValueChange={(value) => setFilters(prev => ({...prev, aiScore: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="90+">90%+</SelectItem>
                      <SelectItem value="80+">80%+</SelectItem>
                      <SelectItem value="70+">70%+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    <Search className="mr-2" size={16} />
                    Scan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Screening Results */}
          <Card className="trading-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Screening Results</CardTitle>
                <Badge variant="outline">
                  {filteredResults.length} stocks found
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {filteredResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No stocks match your criteria</h3>
                  <p className="text-sm">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                        <TableHead className="text-right">Market Cap</TableHead>
                        <TableHead className="text-right">P/E</TableHead>
                        <TableHead className="text-right">AI Score</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.map((stock) => (
                        <TableRow key={stock.symbol} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="font-medium">{stock.symbol}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-muted-foreground">{stock.company}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(stock.price)}
                          </TableCell>
                          <TableCell className={`text-right ${getPriceColor(stock.change)}`}>
                            {formatPercent(stock.change)}
                          </TableCell>
                          <TableCell className="text-right">
                            {(stock.volume / 1000000).toFixed(1)}M
                          </TableCell>
                          <TableCell className="text-right">
                            {stock.marketCap}
                          </TableCell>
                          <TableCell className="text-right">
                            {stock.pe}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-medium ${getAIScoreColor(stock.aiScore)}`}>
                              {stock.aiScore}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAddToWatchlist(stock.symbol)}
                                title="Add to Watchlist"
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTrade(stock.symbol)}
                                title="Trade"
                                className="text-green-500 hover:text-green-600"
                              >
                                <TrendingUp size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
