import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function GoogleAuthButton() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = '/api/auth/google';
  };

  return (
    <Button
      className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      onClick={handleGoogleLogin}
      disabled={isAuthenticated}
    >
      <img 
        src="https://developers.google.com/identity/images/g-logo.png" 
        alt="Google logo" 
        className="w-5 h-5 mr-2" 
      />
      Sign in with Google
    </Button>
  );
}

export function GoogleAuthStatus() {
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Success',
        description: 'You have been logged out successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center p-4 bg-yellow-50 rounded-md">
        <span className="material-icons text-yellow-500 mr-2">warning</span>
        <p className="text-sm text-yellow-700">You are not signed in. Please sign in to continue.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-green-50 rounded-md">
      <div className="flex items-center">
        <img 
          src={user.pictureUrl || "https://ui-avatars.com/api/?name=" + user.displayName} 
          alt="Profile" 
          className="w-10 h-10 rounded-full mr-3" 
        />
        <div>
          <h3 className="text-sm font-medium text-green-800">Signed in as {user.displayName || user.email}</h3>
          <p className="text-xs text-green-600">{user.email}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        Sign Out
      </Button>
    </div>
  );
}

export default function GoogleAuth() {
  const { isAuthenticated, checkAuth } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status when component mounts
    checkAuth().catch((error) => {
      toast({
        title: 'Authentication Error',
        description: 'Failed to verify authentication status.',
        variant: 'destructive',
      });
    });
  }, [checkAuth, toast]);

  return (
    <div className="space-y-4">
      {!isAuthenticated && <GoogleAuthButton />}
      <GoogleAuthStatus />
    </div>
  );
}
