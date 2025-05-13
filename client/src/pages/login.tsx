import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { GoogleAuthButton } from '@/components/auth/GoogleAuth';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const { isAuthenticated, checkAuth } = useAuth();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Handler for email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful
      console.log('Login successful, processing response');
      console.log('Login response data:', data);

      if (data.authenticated) {
        // Update auth state directly
        toast({
          title: 'Login Successful',
          description: 'You have been successfully logged in.',
        });

        console.log('Redirecting to home page');
        // Use window.location for a full page refresh to ensure all components recognize the auth state
        window.location.href = '/';
      } else {
        // Double-check auth status
        console.log('Authentication flag not found in response, checking auth status');
        const isAuth = await checkAuth();
        console.log('Auth check result:', isAuth);

        if (isAuth) {
          console.log('Auth check successful, redirecting to home page');
          window.location.href = '/';
        } else {
          throw new Error('Authentication check failed after login');
        }
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter username, email, and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      console.log('Registration successful, processing response');
      console.log('Registration response data:', data);

      toast({
        title: 'Success!',
        description: 'Account created successfully. Redirecting to dashboard...',
      });

      if (data.authenticated) {
        console.log('Redirecting to home page');
        // Use window.location for a full page refresh to ensure all components recognize the auth state
        window.location.href = '/';
      } else {
        // Double-check auth status
        console.log('Authentication flag not found in response, checking auth status');
        const isAuth = await checkAuth();
        console.log('Auth check result:', isAuth);

        if (isAuth) {
          console.log('Auth check successful, redirecting to home page');
          window.location.href = '/';
        } else {
          throw new Error('Authentication check failed after registration');
        }
      }
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between login and register modes
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setAuthError(null);
  };

  useEffect(() => {
    // Extract error from URL query params if present
    const params = new URLSearchParams(location.split('?')[1]);
    const error = params.get('error');

    if (error) {
      console.log('Auth error:', error);
      setAuthError(error);

      // Show error toast
      toast({
        title: 'Authentication Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      setLocation('/');
    } else {
      // Check authentication status
      checkAuth();
    }
  }, [isAuthenticated, checkAuth, setLocation, location, toast]);

  // Helper function to get a user-friendly error message
  function getErrorMessage(errorCode: string): string {
    switch(errorCode) {
      case 'authentication_failed':
        return 'Authentication failed. Please try again.';
      case 'user_not_found':
        return 'User not found. Please check your credentials.';
      case 'login_failed':
        return 'Login failed. Please try again.';
      case 'access_denied':
        return 'Access was denied by Google. Please try again.';
      default:
        return `Error: ${errorCode}`;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="material-icons text-primary-600 text-3xl">lock</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Xeno CRM</CardTitle>
            <CardDescription className="text-gray-500">
              Sign in to access your CRM platform and manage your campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {authError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>
                    {getErrorMessage(authError)}
                  </AlertDescription>
                </Alert>
              )}

              <GoogleAuthButton />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <form onSubmit={mode === 'login' ? handleEmailLogin : handleRegister} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'login' ? "current-password" : "new-password"}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      mode === 'login' ? 'Sign in' : 'Create account'
                    )}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                  >
                    {mode === 'login'
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </form>
            </div>
          </CardContent>
          <CardFooter className="text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </CardFooter>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Demo version for Xeno SDE Internship Assignment
          </p>
        </div>
      </div>
    </div>
  );
}
