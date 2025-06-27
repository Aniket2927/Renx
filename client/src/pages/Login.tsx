import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    tenantId: "demo_tenant",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const demoUsers = [
    { email: "superadmin@renx.ai", password: "admin123", role: "Super Admin" },
    { email: "admin@renx.ai", password: "admin123", role: "Admin" },
    { email: "demo@renx.ai", password: "admin123", role: "Demo User" },
    { email: "trader@renx.ai", password: "trader123", role: "Trader" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(formData.tenantId, formData.email, formData.password);
      
      if (result.success) {
        setLocation("/");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoUser: any) => {
    setFormData({
      tenantId: "demo_tenant",
      email: demoUser.email,
      password: demoUser.password
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RenX AI
                </h1>
                <p className="text-xs text-gray-500">Neural Trading Platform</p>
              </div>
            </div>
            
            <Button variant="outline" onClick={() => setLocation("/")} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
              🚀 Access Your Trading Dashboard
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sign in to RenX AI
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter your credentials to access the platform
            </p>
          </div>

          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Use your RenX AI credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="tenantId">Tenant ID</Label>
                  <Input
                    id="tenantId"
                    type="text"
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Users */}
          <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-400">Demo Accounts</CardTitle>
              <CardDescription>
                Quick access to test accounts for demonstration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demoUsers.map((user, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => handleDemoLogin(user)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.role}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {user.password}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 RenX AI. All rights reserved. Built with advanced neural networks.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 