import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  Copy, 
  Star, 
  MessageCircle, 
  Heart, 
  Share, 
  Plus,
  TrendingUp,
  Award,
  Eye
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

export default function Community() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  // Fetch community posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/community/posts"],
    enabled: isAuthenticated,
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest("POST", "/api/community/posts", postData);
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Your post has been shared with the community.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setNewPost({ title: "", content: "", tags: "" });
      setIsPostDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest("PATCH", `/api/community/posts/${postId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    const tags = newPost.tags.split(",").map(tag => tag.trim()).filter(Boolean);
    
    createPostMutation.mutate({
      ...newPost,
      tags,
    });
  };

  const handleLikePost = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  const handleCopyStrategy = (username: string) => {
    toast({
      title: "Strategy Copied",
      description: `Now following ${username}'s trading strategy.`,
    });
  };

  // Mock data for top performers
  const topPerformers = [
    {
      id: "1",
      username: "@AITraderPro",
      initials: "AT",
      followers: 2847,
      return: 47.2,
      winRate: 78,
      trades: 156
    },
    {
      id: "2", 
      username: "@QuantMaster",
      initials: "QM",
      followers: 1923,
      return: 38.5,
      winRate: 72,
      trades: 203
    },
    {
      id: "3",
      username: "@TechAnalyst",
      initials: "TA", 
      followers: 1456,
      return: 34.8,
      winRate: 68,
      trades: 89
    }
  ];

  const communityStats = {
    activeTraders: 12847,
    copyVolume: 2400000,
    topPerformer: 47.2,
    discussions: 234
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Connect with other traders
        </p>
      </div>
      
      <div>
          {/* Community Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="text-primary text-2xl" size={32} />
                  <div>
                    <CardTitle className="text-xl">Active Traders</CardTitle>
                    <p className="text-muted-foreground text-sm">Online now</p>
                  </div>
                </div>
                <p className="text-4xl font-bold">{communityStats.activeTraders.toLocaleString()}</p>
                <p className="text-green-500 text-sm mt-2">+5% vs yesterday</p>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Copy className="text-blue-400 text-2xl" size={32} />
                  <div>
                    <CardTitle className="text-xl">Copy Trades</CardTitle>
                    <p className="text-muted-foreground text-sm">Today's volume</p>
                  </div>
                </div>
                <p className="text-4xl font-bold">${(communityStats.copyVolume / 1000000).toFixed(1)}M</p>
                <p className="text-muted-foreground text-sm mt-2">Across 847 strategies</p>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="text-yellow-400 text-2xl" size={32} />
                  <div>
                    <CardTitle className="text-xl">Top Performer</CardTitle>
                    <p className="text-muted-foreground text-sm">This month</p>
                  </div>
                </div>
                <p className="text-4xl font-bold text-green-500">+{communityStats.topPerformer}%</p>
                <p className="text-muted-foreground text-sm mt-2">@AITraderPro</p>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageCircle className="text-purple-400 text-2xl" size={32} />
                  <div>
                    <CardTitle className="text-xl">Discussions</CardTitle>
                    <p className="text-muted-foreground text-sm">Active threads</p>
                  </div>
                </div>
                <p className="text-4xl font-bold">{communityStats.discussions}</p>
                <p className="text-muted-foreground text-sm mt-2">2,847 messages today</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed">Community Feed</TabsTrigger>
              <TabsTrigger value="performers">Top Performers</TabsTrigger>
              <TabsTrigger value="strategies">Copy Trading</TabsTrigger>
            </TabsList>

            {/* Community Feed */}
            <TabsContent value="feed" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Post */}
                <Card className="trading-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Share with Community</CardTitle>
                      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2" size={16} />
                            New Post
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Post</DialogTitle>
                            <DialogDescription>
                              Share your trading insights with the community.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Input
                                placeholder="Post title (optional)"
                                value={newPost.title}
                                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Textarea
                                placeholder="What's on your mind? Share your trading thoughts..."
                                value={newPost.content}
                                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                                rows={4}
                              />
                            </div>
                            <div>
                              <Input
                                placeholder="Tags (comma separated): #trading, #stocks, #analysis"
                                value={newPost.tags}
                                onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                              />
                            </div>
                            <Button 
                              onClick={handleCreatePost}
                              disabled={createPostMutation.isPending}
                              className="w-full"
                            >
                              {createPostMutation.isPending ? "Posting..." : "Share Post"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user?.profileImageUrl} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        variant="outline" 
                        className="flex-1 justify-start text-muted-foreground"
                        onClick={() => setIsPostDialogOpen(true)}
                      >
                        What's your trading insight today?
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle>Trending Discussions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { topic: "NVDA Earnings Analysis", replies: 45, likes: 128 },
                        { topic: "Fed Rate Decision Impact", replies: 32, likes: 89 },
                        { topic: "AI Stocks Outlook 2024", replies: 28, likes: 156 },
                        { topic: "Crypto Market Recovery", replies: 19, likes: 67 },
                      ].map((discussion, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                          <h4 className="font-medium mb-1">{discussion.topic}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <MessageCircle size={14} />
                              <span>{discussion.replies}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Heart size={14} />
                              <span>{discussion.likes}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Posts Feed */}
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {postsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="loading-spinner"></div>
                      </div>
                    ) : posts && posts.length > 0 ? (
                      posts.map((post: any) => (
                        <div key={post.id} className="border-b border-border pb-6 last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <Avatar>
                              <AvatarImage src={post.user?.profileImageUrl} />
                              <AvatarFallback>
                                {post.user?.firstName?.[0]}{post.user?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium">
                                  {post.user?.firstName} {post.user?.lastName}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              {post.title && (
                                <h4 className="font-semibold mb-2">{post.title}</h4>
                              )}
                              <p className="text-sm mb-3">{post.content}</p>
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {post.tags.map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <button 
                                  className="flex items-center space-x-1 hover:text-red-500"
                                  onClick={() => handleLikePost(post.id)}
                                >
                                  <Heart size={14} />
                                  <span>{post.likes}</span>
                                </button>
                                <button className="flex items-center space-x-1 hover:text-blue-500">
                                  <MessageCircle size={14} />
                                  <span>{post.replies}</span>
                                </button>
                                <button className="flex items-center space-x-1 hover:text-green-500">
                                  <Share size={14} />
                                  <span>{post.shares}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                        <p className="text-sm">Be the first to share your trading insights!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Performers */}
            <TabsContent value="performers" className="space-y-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="text-primary" size={20} />
                    <span>Top Performing Traders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformers.map((trader, index) => (
                      <div key={trader.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                {trader.initials}
                              </AvatarFallback>
                            </Avatar>
                            {index < 3 && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{trader.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {trader.followers.toLocaleString()} followers • {trader.trades} trades
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                              <span>Win Rate: {trader.winRate}%</span>
                              <span>Risk Score: Medium</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-500 font-bold text-lg">+{trader.return}%</p>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCopyStrategy(trader.username)}
                            >
                              <Copy size={14} className="mr-1" />
                              Copy
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye size={14} className="mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Copy Trading */}
            <TabsContent value="strategies" className="space-y-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Copy className="text-primary" size={20} />
                    <span>Copy Trading Strategies</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        name: "AI Momentum Strategy",
                        trader: "@AITraderPro",
                        return: 47.2,
                        drawdown: -8.5,
                        copiers: 234,
                        risk: "Medium"
                      },
                      {
                        name: "Value Growth Combo",
                        trader: "@ValueHunter",
                        return: 32.8,
                        drawdown: -5.2,
                        copiers: 156,
                        risk: "Low"
                      },
                      {
                        name: "Tech Sector Focus",
                        trader: "@TechGuru",
                        return: 28.6,
                        drawdown: -12.1,
                        copiers: 89,
                        risk: "High"
                      },
                      {
                        name: "Dividend Aristocrats",
                        trader: "@DividendKing",
                        return: 18.4,
                        drawdown: -3.8,
                        copiers: 312,
                        risk: "Low"
                      }
                    ].map((strategy, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{strategy.name}</h4>
                          <Badge className={
                            strategy.risk === "Low" ? "bg-green-100 text-green-800" :
                            strategy.risk === "Medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {strategy.risk} Risk
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">by {strategy.trader}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Return</p>
                            <p className="font-bold text-green-500">+{strategy.return}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max Drawdown</p>
                            <p className="font-bold text-red-500">{strategy.drawdown}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Copiers</p>
                            <p className="font-bold">{strategy.copiers}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min Investment</p>
                            <p className="font-bold">$1,000</p>
                          </div>
                        </div>
                        <Button className="w-full">
                          <Copy size={14} className="mr-2" />
                          Copy Strategy
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
