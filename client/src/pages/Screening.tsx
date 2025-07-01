import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const [selectedSector, setSelectedSector] = useState('all');
  const [minMarketCap, setMinMarketCap] = useState('');
  const [maxPE, setMaxPE] = useState('');
  const [minAIScore, setMinAIScore] = useState(70);

  // Fetch real screening results from backend
  const { data: screeningResults, isLoading, error, refetch } = useQuery({
    queryKey: ['screening-results', selectedSector, minMarketCap, maxPE, minAIScore],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSector !== 'all') params.append('sector', selectedSector);
      if (minMarketCap) params.append('minMarketCap', minMarketCap);
      if (maxPE) params.append('maxPE', maxPE);
      if (minAIScore) params.append('minAIScore', minAIScore.toString());

      const response = await fetch(`/api/screening/stocks?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch screening results');
      }
      
      const data = await response.json();
      return data.results || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const handleScreeningSubmit = (e) => {
    e.preventDefault();
    refetch(); // Trigger a new search
  };

  const getAIScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriceChangeColor = (change) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stock Screening</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Find opportunities with AI-powered screening
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Screening Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Filters</h2>
            
            <form onSubmit={handleScreeningSubmit} className="space-y-4">
              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sector
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                >
                  <option value="all">All Sectors</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Financial">Financial</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Energy">Energy</option>
                  <option value="Automotive">Automotive</option>
                </select>
              </div>

              {/* Market Cap Filter */}
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Market Cap (B)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g. 1"
                  value={minMarketCap}
                  onChange={(e) => setMinMarketCap(e.target.value)}
                />
                </div>

              {/* P/E Ratio Filter */}
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max P/E Ratio
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g. 30"
                  value={maxPE}
                  onChange={(e) => setMaxPE(e.target.value)}
                />
                </div>

              {/* AI Score Filter */}
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min AI Score: {minAIScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full"
                  value={minAIScore}
                  onChange={(e) => setMinAIScore(parseInt(e.target.value))}
                />
                </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Screening...' : 'Apply Filters'}
              </button>
            </form>
          </div>
                </div>

        {/* Results Table */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Screening Results
                {screeningResults && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({screeningResults.length} stocks found)
                  </span>
                )}
              </h2>
                </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-500">Failed to load screening results</div>
                </div>
              ) : screeningResults && screeningResults.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Market Cap
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        P/E
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        AI Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sector
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {screeningResults.map((stock, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {stock.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {stock.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${stock.price?.toFixed(2) || 'N/A'}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPriceChangeColor(stock.change)}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2) || 'N/A'}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {stock.marketCap}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {stock.pe?.toFixed(1) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAIScoreColor(stock.aiScore)}`}>
                            {stock.aiScore || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {stock.sector}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">No stocks found matching your criteria</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
