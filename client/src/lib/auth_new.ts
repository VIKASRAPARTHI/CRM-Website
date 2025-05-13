import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  pictureUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  checkAuth: async () => false,
  logout: async () => {},
});

export function AuthProvider(props: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      setIsAuthenticated(data.authenticated);
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      
      return data.authenticated;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);
  
  const logout = async (): Promise<void> => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  useEffect(() => {
    // Check authentication status when component mounts
    checkAuth();
  }, [checkAuth]);
  
  const contextValue = {
    isAuthenticated,
    user,
    checkAuth,
    logout,
  };
  
  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    props.children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}