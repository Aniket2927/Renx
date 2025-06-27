import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [localUser, setLocalUser] = useState(null);

  // Check for stored user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setLocalUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const { data: serverUser, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (!token) {
        return null;
      }

      const res = await fetch("/api/auth/user", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: "include",
      });
      
      if (res.status === 401) {
        // Clear auth data on 401
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setLocalUser(null);
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      const result = await res.json();
      return result.user || result;
    },
    retry: false,
    enabled: !!(localStorage.getItem('accessToken') || localStorage.getItem('token')),
  });

  const user = serverUser || localUser;

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setLocalUser(null);
    window.location.href = '/login';
  };

  const login = async (tenantId: string, email: string, password: string) => {
    try {
      console.log('Attempting login with:', { tenantId, email, password: '***' });
      const apiUrl = `${window.location.origin}/api/auth/login`;
      console.log('Making request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, email, password })
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed with status:', response.status, 'Error:', errorText);
        return { success: false, message: `Login failed: ${response.status} ${response.statusText}` };
      }
      
      const result = await response.json();
      console.log('Login result:', result);
      
      if (result.success) {
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('token', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        setLocalUser(result.data.user);
        console.log('Login successful, redirecting...');
        return { success: true, user: result.data.user };
      } else {
        console.error('Login failed:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
