import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  return (
    <header className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button 
        type="button" 
        className="md:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="material-icons">menu</span>
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <div className="max-w-2xl w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-400">search</span>
              </div>
              <input 
                id="search" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                placeholder="Search" 
                type="search"
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notification dropdown */}
          <div className="relative">
            <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="material-icons">notifications</span>
            </button>
          </div>

          {/* Help button */}
          <button className="ml-3 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <span className="material-icons">help_outline</span>
          </button>

          {/* Profile dropdown */}
          <div className="ml-3 relative">
            <div>
              <button 
                type="button" 
                className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img 
                  className="h-8 w-8 rounded-full" 
                  src={user?.pictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                  alt="Profile picture" 
                />
              </button>
            </div>
            
            {isProfileOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                <Link href="/profile">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                </Link>
                <Link href="/settings">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
