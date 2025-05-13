import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Campaign, CommunicationLog } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { generateCampaignSummary } from '@/lib/aiService';

interface CampaignItemProps {
  campaign: Campaign;
}

function CampaignItem({ campaign }: CampaignItemProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const { data: logs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['/api/campaigns/' + campaign.id + '/logs'],
    enabled: isExpanded
  });

  const formattedDate = new Date(campaign.sentAt || campaign.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const statusColor = {
    draft: 'bg-gray-100 text-gray-800',
    sending: 'bg-blue-100 text-blue-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  const handleGenerateSummary = async () => {
    if (!logs) return;
    
    try {
      setIsGeneratingSummary(true);
      const summary = await generateCampaignSummary(campaign, logs);
      setAiSummary(summary);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate campaign summary.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons text-primary-500">campaign</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600 truncate">{campaign.name}</p>
              <p className="mt-1 flex text-xs text-gray-500">
                <span>
                  {campaign.sentAt ? `Sent on ${formattedDate}` : `Created on ${formattedDate}`}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge className={statusColor[campaign.status as keyof typeof statusColor] || 'bg-gray-100'}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </Badge>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>{campaign.audienceSize} recipients</span>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:flex sm:justify-between">
          <div className="sm:flex">
            <div className="flex items-center text-sm text-gray-500">
              <span className="material-icons text-gray-400 mr-1.5 text-sm">people</span>
              <p>Segment: {campaign.segmentId}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <div className="flex space-x-2">
              <div className="flex items-center">
                <span className="bg-green-500 w-2 h-2 rounded-full mr-1"></span>
                <span>{campaign.sentCount} Sent</span>
              </div>
              <div className="flex items-center">
                <span className="bg-red-500 w-2 h-2 rounded-full mr-1"></span>
                <span>{campaign.failedCount} Failed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 border-t border-gray-200 pt-4 fade-in">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Details</h4>
            
            {isLogsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500">Audience Size</p>
                    <p className="text-sm font-medium">{campaign.audienceSize}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500">Delivery Rate</p>
                    <p className="text-sm font-medium">
                      {campaign.audienceSize > 0
                        ? Math.round((campaign.sentCount / campaign.audienceSize) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>

                {!aiSummary && campaign.status === 'sent' && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                    >
                      {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
                    </Button>
                  </div>
                )}

                {aiSummary && (
                  <div className="mt-3 p-3 bg-primary-50 rounded-md">
                    <div className="flex">
                      <span className="material-icons text-primary-500 mr-2">analytics</span>
                      <p className="text-sm text-primary-800">{aiSummary}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export default function CampaignHistory() {
  const { data: campaigns, isLoading, error } = useQuery({ 
    queryKey: ['/api/campaigns']
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
                <Skeleton className="h-6 w-[100px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load campaigns.</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="material-icons text-gray-400 text-4xl">campaign</span>
        <p className="mt-2 text-gray-500">No campaigns found. Create your first campaign!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {campaigns.map((campaign: Campaign) => (
          <CampaignItem key={campaign.id} campaign={campaign} />
        ))}
      </ul>
    </div>
  );
}
