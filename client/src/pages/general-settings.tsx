import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Xeno CRM',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    darkMode: false,
    emailReports: true,
    reportFrequency: 'weekly',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
      const response = await apiRequest('POST', '/api/settings/general', settings);
      
      toast({
        title: "Settings Saved",
        description: "Your general settings have been updated successfully.",
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
    <MainLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
            <p className="text-muted-foreground">Configure your CRM settings and preferences</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Organization</TabsTrigger>
            <TabsTrigger value="locale">Localization</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>Manage your company details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName"
                    name="companyName"
                    value={settings.companyName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-secondary/40 rounded-md flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No logo</span>
                    </div>
                    <Button variant="outline">Upload Logo</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Theme Colors</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs">Primary</span>
                      <div className="w-full h-8 bg-primary rounded-md"></div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs">Secondary</span>
                      <div className="w-full h-8 bg-secondary rounded-md"></div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs">Accent</span>
                      <div className="w-full h-8 bg-accent rounded-md"></div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">Customize Theme</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locale" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Localization Settings</CardTitle>
                <CardDescription>Configure regional and formatting preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => handleSelectChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => handleSelectChange('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) => handleSelectChange('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select
                      value={settings.timeFormat}
                      onValueChange={(value) => handleSelectChange('timeFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => handleSelectChange('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Configure your user interface preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="darkMode" className="font-medium">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                  </div>
                  <Switch 
                    id="darkMode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSwitchChange('darkMode', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Reporting Preferences</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailReports" className="font-medium">Email Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive regular reports via email</p>
                    </div>
                    <Switch 
                      id="emailReports"
                      checked={settings.emailReports}
                      onCheckedChange={(checked) => handleSwitchChange('emailReports', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reportFrequency">Report Frequency</Label>
                    <Select
                      value={settings.reportFrequency}
                      onValueChange={(value) => handleSelectChange('reportFrequency', value)}
                      disabled={!settings.emailReports}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
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
    </MainLayout>
  );
}