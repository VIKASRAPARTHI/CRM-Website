import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Link } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: customers, isLoading: isCustomersLoading } = useQuery({
    queryKey: ['/api/customers']
  });
  
  const { data: campaigns, isLoading: isCampaignsLoading } = useQuery({
    queryKey: ['/api/campaigns']
  });
  
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['/api/orders']
  });
  
  // Stats
  const totalCustomers = customers?.length || 0;
  const totalCampaigns = campaigns?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum: number, order: any) => sum + order.amount, 0) || 0;
  
  // Chart data
  const campaignStats = campaigns?.slice(0, 5).map((campaign: any) => ({
    name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
    sent: campaign.sentCount,
    failed: campaign.failedCount,
  })) || [];
  
  const customerStatusData = [
    { name: 'Active', value: customers?.filter((c: any) => c.status === 'active').length || 0 },
    { name: 'Inactive', value: customers?.filter((c: any) => c.status === 'inactive').length || 0 },
  ];
  
  const COLORS = ['#4F46E5', '#EC4899', '#8B5CF6', '#10B981', '#EF4444'];

  return (
    <div className="py-6">
      {/* Page Heading */}
      <div className="px-4 sm:px-6 md:px-8 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.displayName || 'User'}! Here's what's happening with your CRM.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 md:px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {isCustomersLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Campaigns Sent</CardTitle>
            </CardHeader>
            <CardContent>
              {isCampaignsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{totalCampaigns.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {isOrdersLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="px-4 sm:px-6 md:px-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isCampaignsLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : campaignStats.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={campaignStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60} 
                        tick={{fontSize: 12}}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sent" fill="#4F46E5" name="Sent" />
                      <Bar dataKey="failed" fill="#EF4444" name="Failed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center">
                  <span className="material-icons text-gray-400 text-4xl mb-2">campaign</span>
                  <p className="text-gray-500 text-center">No campaign data available</p>
                  <Link href="/campaign-builder">
                    <Button className="mt-4">Create Campaign</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isCustomersLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : customerStatusData.some(item => item.value > 0) ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {customerStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} customers`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center">
                  <span className="material-icons text-gray-400 text-4xl mb-2">people</span>
                  <p className="text-gray-500 text-center">No customer data available</p>
                  <Link href="/customers">
                    <Button className="mt-4">View Customers</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 sm:px-6 md:px-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/campaign-builder">
            <a className="block p-6 bg-white shadow rounded-lg hover:shadow-md transition-shadow">
              <span className="material-icons text-primary-500 text-2xl mb-3">campaign</span>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Create Campaign</h3>
              <p className="text-gray-500 text-sm">Create a new targeted campaign for your customers.</p>
            </a>
          </Link>
          
          <Link href="/customers">
            <a className="block p-6 bg-white shadow rounded-lg hover:shadow-md transition-shadow">
              <span className="material-icons text-primary-500 text-2xl mb-3">person_add</span>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Add Customer</h3>
              <p className="text-gray-500 text-sm">Add new customers to your CRM database.</p>
            </a>
          </Link>
          
          <Link href="/orders">
            <a className="block p-6 bg-white shadow rounded-lg hover:shadow-md transition-shadow">
              <span className="material-icons text-primary-500 text-2xl mb-3">receipt_long</span>
              <h3 className="text-lg font-medium text-gray-900 mb-1">View Orders</h3>
              <p className="text-gray-500 text-sm">See recent order activity and revenue.</p>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
