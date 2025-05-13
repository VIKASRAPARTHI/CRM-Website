import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Customer } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function CustomersPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: customers, isLoading } = useQuery({ 
    queryKey: ['/api/customers']
  });

  const filteredCustomers = searchTerm && customers
    ? customers.filter((customer: Customer) => 
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm))
      )
    : customers;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Use the direct endpoint for immediate feedback
      await apiRequest('POST', '/api/customers/direct', newCustomer);
      
      // Reset form and close dialog
      setNewCustomer({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        status: 'active'
      });
      setIsAddDialogOpen(false);
      
      // Invalidate customers query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
      toast({
        title: 'Success',
        description: 'Customer added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add customer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      {/* Page Heading */}
      <div className="px-4 sm:px-6 md:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and view your customer database.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <span className="material-icons text-sm mr-1">add</span>
              Add Customer
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
                placeholder="Search customers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="px-4 sm:px-6 md:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !filteredCustomers || filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-gray-400 text-4xl">people</span>
              <p className="mt-2 text-gray-500">
                {searchTerm ? 'No customers match your search.' : 'No customers found.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Spend</TableHead>
                    <TableHead>Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer: Customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{customer.totalSpend.toLocaleString()}</TableCell>
                      <TableCell>
                        {customer.lastSeenAt 
                          ? new Date(customer.lastSeenAt).toLocaleDateString() 
                          : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="firstName">First Name*</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={newCustomer.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lastName">Last Name*</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={newCustomer.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
