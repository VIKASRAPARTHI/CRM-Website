import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ApiSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailServiceEnabled: true,
    smsServiceEnabled: false,
    webhookServiceEnabled: false,
    emailApiKey: '',
    smsApiKey: '',
    webhookUrl: '',
    emailFromName: 'Xeno CRM',
    emailFromAddress: 'notifications@xenocrm.com',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call to save settings
      const response = await apiRequest('POST', '/api/settings/notification', settings);
      
      toast({
        title: "Settings Saved",
        description: "Your API settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Settings</h1>
          <p className="text-muted-foreground">Configure your notification and integration settings</p>
        </div>
      </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notification Services</TabsTrigger>
            <TabsTrigger value="webhook">Webhook Integration</TabsTrigger>
            <TabsTrigger value="security">API Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="mt-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Email Service</CardTitle>
                  <CardDescription>Configure email notification service settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailServiceEnabled">Enable Email Service</Label>
                    <Switch 
                      id="emailServiceEnabled"
                      checked={settings.emailServiceEnabled}
                      onCheckedChange={(checked) => handleSwitchChange('emailServiceEnabled', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailApiKey">Email Service API Key</Label>
                    <Input 
                      id="emailApiKey"
                      name="emailApiKey"
                      value={settings.emailApiKey}
                      onChange={handleInputChange}
                      placeholder="Enter your email service API key"
                      type="password"
                      disabled={!settings.emailServiceEnabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailFromName">From Name</Label>
                    <Input 
                      id="emailFromName"
                      name="emailFromName"
                      value={settings.emailFromName}
                      onChange={handleInputChange}
                      placeholder="Sender name"
                      disabled={!settings.emailServiceEnabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailFromAddress">From Email Address</Label>
                    <Input 
                      id="emailFromAddress"
                      name="emailFromAddress"
                      value={settings.emailFromAddress}
                      onChange={handleInputChange}
                      placeholder="Sender email address"
                      disabled={!settings.emailServiceEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>SMS Service</CardTitle>
                  <CardDescription>Configure SMS notification service settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smsServiceEnabled">Enable SMS Service</Label>
                    <Switch 
                      id="smsServiceEnabled"
                      checked={settings.smsServiceEnabled}
                      onCheckedChange={(checked) => handleSwitchChange('smsServiceEnabled', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smsApiKey">SMS Service API Key</Label>
                    <Input 
                      id="smsApiKey"
                      name="smsApiKey"
                      value={settings.smsApiKey}
                      onChange={handleInputChange}
                      placeholder="Enter your SMS service API key"
                      type="password"
                      disabled={!settings.smsServiceEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="webhook" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Integration</CardTitle>
                <CardDescription>Configure webhook integration for real-time event notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="webhookServiceEnabled">Enable Webhook Notifications</Label>
                  <Switch 
                    id="webhookServiceEnabled"
                    checked={settings.webhookServiceEnabled}
                    onCheckedChange={(checked) => handleSwitchChange('webhookServiceEnabled', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input 
                    id="webhookUrl"
                    name="webhookUrl"
                    value={settings.webhookUrl}
                    onChange={handleInputChange}
                    placeholder="https://your-webhook-endpoint.com/notification"
                    disabled={!settings.webhookServiceEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Available Events</h3>
                  <div className="bg-secondary/40 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="event-campaign-sent" className="rounded" disabled={!settings.webhookServiceEnabled} />
                      <label htmlFor="event-campaign-sent">Campaign Sent</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="event-message-delivered" className="rounded" disabled={!settings.webhookServiceEnabled} />
                      <label htmlFor="event-message-delivered">Message Delivered</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="event-message-failed" className="rounded" disabled={!settings.webhookServiceEnabled} />
                      <label htmlFor="event-message-failed">Message Failed</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="event-customer-created" className="rounded" disabled={!settings.webhookServiceEnabled} />
                      <label htmlFor="event-customer-created">Customer Created</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="event-order-placed" className="rounded" disabled={!settings.webhookServiceEnabled} />
                      <label htmlFor="event-order-placed">Order Placed</label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Security</CardTitle>
                <CardDescription>Manage your API keys and access settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">API Keys</h3>
                  <div className="bg-secondary/40 p-4 rounded-md">
                    <div className="space-y-2">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div>
                          <p className="text-sm font-medium">Primary API Key</p>
                          <p className="text-xs text-muted-foreground">Used for authentication with external services</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            value="••••••••••••••••••••••••"
                            readOnly
                            className="max-w-xs font-mono bg-secondary/20"
                          />
                          <Button variant="outline" size="sm">Regenerate</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Rate Limiting</h3>
                  <div className="bg-secondary/40 p-4 rounded-md">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-rate-limiting">Enable Rate Limiting</Label>
                        <Switch id="enable-rate-limiting" defaultChecked />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="rate-limit">Requests per minute</Label>
                        <Input id="rate-limit" type="number" defaultValue="100" className="max-w-xs" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Access Control</h3>
                  <div className="bg-secondary/40 p-4 rounded-md">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enable-ip-restrictions">Enable IP Restrictions</Label>
                        <Switch id="enable-ip-restrictions" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                        <textarea 
                          id="allowed-ips" 
                          className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background"
                          placeholder="Enter IP addresses, one per line"
                          disabled
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="px-8"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
  );
}