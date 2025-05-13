import { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import SegmentBuilder from '@/components/campaigns/SegmentBuilder';
import CampaignForm from '@/components/campaigns/CampaignForm';
import { RuleGroup, Segment } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function CampaignBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create-segment');
  const [segment, setSegment] = useState<Segment | null>(null);
  const [campaign, setCampaign] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Enable or disable tabs based on state
  const canAccessCampaignTab = !!segment;
  const canAccessPreviewTab = !!segment && !!campaign;

  // Handle tab change with validation
  const handleTabChange = (value: string) => {
    if (value === 'create-campaign' && !segment) {
      toast({
        title: 'Create a Segment First',
        description: 'Please create a segment before proceeding to campaign creation.',
        variant: 'destructive',
      });
      return;
    }

    if (value === 'preview' && (!segment || !campaign)) {
      toast({
        title: 'Create a Campaign First',
        description: 'Please create a campaign before proceeding to preview.',
        variant: 'destructive',
      });
      return;
    }

    setActiveTab(value);
  };

  const handleSegmentCreate = async (segmentData: { name: string; rules: RuleGroup }) => {
    try {
      setIsSubmitting(true);

      const response = await apiRequest('POST', '/api/segments', segmentData);
      const newSegment = await response.json();

      setSegment(newSegment);
      setActiveTab('create-campaign');

      toast({
        title: 'Segment Created',
        description: `"${newSegment.name}" segment has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create segment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCampaignCreate = (newCampaign: any) => {
    console.log('Campaign created:', newCampaign);
    setCampaign(newCampaign);
    setActiveTab('preview');

    toast({
      title: 'Campaign Created',
      description: 'Your campaign has been created successfully. Review and send when ready.',
    });
  };

  const handleSendCampaign = async () => {
    if (!campaign) {
      toast({
        title: 'No Campaign',
        description: 'Please create a campaign first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSending(true);

      await apiRequest('POST', `/api/campaigns/${campaign.id}/send`, {});

      toast({
        title: 'Campaign Sent',
        description: 'Your campaign is now being sent to the audience.',
      });

      // Redirect to campaign history page
      setLocation('/campaign-history');
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to send campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="py-6">
      {/* Page Heading */}
      <div className="px-4 sm:px-6 md:px-8 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Campaign Builder</h1>
        <p className="mt-1 text-sm text-gray-500">Create targeted campaigns with customized segments.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="px-4 sm:px-6 md:px-8 mb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="border-b border-gray-200 w-full justify-start">
            <TabsTrigger
              value="create-segment"
              className="border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 px-1 py-4 text-sm font-medium"
            >
              Create Segment
            </TabsTrigger>
            <TabsTrigger
              value="create-campaign"
              disabled={!canAccessCampaignTab}
              className="border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 px-1 py-4 text-sm font-medium ml-8"
            >
              Create Campaign
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              disabled={!canAccessPreviewTab}
              className="border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 px-1 py-4 text-sm font-medium ml-8"
            >
              Preview & Send
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create-segment" className="mt-6">
            <div className="bg-white shadow sm:rounded-lg p-6">
              <SegmentBuilder onSegmentCreate={handleSegmentCreate} />
            </div>
          </TabsContent>

          <TabsContent value="create-campaign" className="mt-6">
            {segment ? (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Segment: {segment.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    This campaign will target {segment.audienceSize} customers.
                  </p>
                </div>
                <div className="p-6">
                  <CampaignForm segment={segment} onCampaignCreate={handleCampaignCreate} />
                </div>
              </div>
            ) : (
              <div className="bg-white shadow sm:rounded-lg p-6 text-center">
                <p className="text-gray-500">Please create a segment first.</p>
                <Button
                  className="mt-4"
                  onClick={() => setActiveTab('create-segment')}
                >
                  Go to Segment Builder
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <div className="bg-white shadow sm:rounded-lg p-6 text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Campaign Preview</h2>
              <p className="text-gray-500 mb-6">Review your campaign before sending.</p>

              {segment && campaign ? (
                <div className="space-y-6 text-left max-w-2xl mx-auto">
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Campaign Name</h3>
                        <p className="text-base">{campaign.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <p className="text-base capitalize">{campaign.status}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Segment</h3>
                        <p className="text-base">{segment.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Audience Size</h3>
                        <p className="text-base">{segment.audienceSize} customers</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500">Message Preview</h3>
                      <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-sm whitespace-pre-wrap">{campaign.message}</p>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        * Personalization placeholders like &#123;&#123;customer.firstName&#125;&#125; will be replaced with actual customer data when sent.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('create-campaign')}
                    >
                      Back to Edit
                    </Button>
                    <Button
                      onClick={handleSendCampaign}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Sending...
                        </>
                      ) : 'Send Campaign'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Please create a segment and campaign first.</p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab('create-segment')}
                  >
                    Start from Beginning
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
