import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

type SidebarNavItemProps = {
  href: string;
  icon: string;
  children: React.ReactNode;
};

function SidebarNavItem({ href, icon, children }: SidebarNavItemProps) {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link href={href}>
      <a
        className={`sidebar-nav-item flex items-center px-2 py-2 text-sm font-medium rounded-md ${
          isActive
            ? "text-primary-600 bg-primary-50 border-l-2 border-primary-600"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <span className={`material-icons mr-3 ${isActive ? "text-primary-500" : "text-gray-400"}`}>
          {icon}
        </span>
        {children}
      </a>
    </Link>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  
  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h1 className="font-bold text-xl text-primary-600">Xeno CRM</h1>
        </div>
        
        <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Main
            </div>
            <nav className="flex-1 space-y-1">
              <SidebarNavItem href="/" icon="dashboard">
                Dashboard
              </SidebarNavItem>
              <SidebarNavItem href="/customers" icon="people">
                Customers
              </SidebarNavItem>
              <SidebarNavItem href="/orders" icon="receipt_long">
                Orders
              </SidebarNavItem>
              <SidebarNavItem href="/campaign-builder" icon="campaign">
                Campaigns
              </SidebarNavItem>
              <SidebarNavItem href="/campaign-history" icon="history">
                Campaign History
              </SidebarNavItem>
            </nav>
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-4">
              Settings
            </div>
            <nav className="flex-1 space-y-1">
              <SidebarNavItem href="/settings/general" icon="settings">
                General
              </SidebarNavItem>
              <SidebarNavItem href="/settings/api" icon="api">
                API Settings
              </SidebarNavItem>
            </nav>
          </div>
        </div>
        
        {/* Profile section */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <Link href="/profile">
            <a className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <img 
                    className="inline-block h-9 w-9 rounded-full" 
                    src={user?.pictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                    alt="Profile picture" 
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.displayName || user?.username || 'User'}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    View profile
                  </p>
                </div>
              </div>
            </a>
          </Link>
        </div>
      </div>
    </aside>
  );
}
