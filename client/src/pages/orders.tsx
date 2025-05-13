import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Order, Customer } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function OrdersPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newOrder, setNewOrder] = useState({
    customerId: '',
    amount: '',
    status: 'completed',
    items: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: orders, isLoading: isOrdersLoading } = useQuery({ 
    queryKey: ['/api/orders']
  });

  const { data: customers, isLoading: isCustomersLoading } = useQuery({ 
    queryKey: ['/api/customers']
  });

  const filteredOrders = searchTerm && orders
    ? orders.filter((order: Order) => 
        String(order.id).includes(searchTerm) ||
        String(order.customerId).includes(searchTerm) ||
        String(order.amount).includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : orders;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOrder({ ...newOrder, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewOrder({ ...newOrder, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newOrder.customerId || !newOrder.amount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const orderData = {
        customerId: parseInt(newOrder.customerId),
        amount: parseFloat(newOrder.amount),
        status: newOrder.status,
        orderDate: new Date(),
        items: [{ productId: 1, name: 'Product', price: parseFloat(newOrder.amount), quantity: 1 }]
      };
      
      // Use the direct endpoint for immediate feedback
      await apiRequest('POST', '/api/orders/direct', orderData);
      
      // Reset form and close dialog
      setNewOrder({
        customerId: '',
        amount: '',
        status: 'completed',
        items: []
      });
      setIsAddDialogOpen(false);
      
      // Invalidate orders query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
      toast({
        title: 'Success',
        description: 'Order added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to find customer name by ID
  const getCustomerName = (customerId: number) => {
    if (!customers) return 'Unknown';
    const customer = customers.find((c: Customer) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown';
  };

  return (
    <div className="py-6">
      {/* Page Heading */}
      <div className="px-4 sm:px-6 md:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and view customer orders.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <span className="material-icons text-sm mr-1">add</span>
              Add Order
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-400 text-sm">search</span>
              </span>
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="px-4 sm:px-6 md:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isOrdersLoading ? (
            <div className="p-4">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-[50px]" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                ))}
              </div>
            </div>
          ) : !filteredOrders || filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-gray-400 text-4xl">receipt_long</span>
              <p className="mt-2 text-gray-500">
                {searchTerm ? 'No orders match your search.' : 'No orders found.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{getCustomerName(order.customerId)}</TableCell>
                      <TableCell>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'completed' ? 'default' : order.status === 'pending' ? 'secondary' : 'destructive'}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Add Order Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="customerId">Customer*</Label>
                {isCustomersLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={newOrder.customerId}
                    onValueChange={(value) => handleSelectChange('customerId', value)}
                  >
                    <SelectTrigger id="customerId">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer: Customer) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.firstName} {customer.lastName} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Amount (₹)*</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newOrder.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status*</Label>
                <Select
                  value={newOrder.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Order'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
