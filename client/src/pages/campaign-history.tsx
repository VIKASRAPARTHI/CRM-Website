import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import CampaignHistory from '@/components/campaigns/CampaignHistory';

export default function CampaignHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  return (
    <div className="py-6">
      {/* Page Heading */}
      <div className="px-4 sm:px-6 md:px-8 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Campaign History</h1>
            <p className="mt-1 text-sm text-gray-500">View and analyze your past campaigns.</p>
          </div>
          <Link href="/campaign-builder">
            <Button className="flex items-center">
              <span className="material-icons text-sm mr-1">add</span>
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 md:px-8 mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All Campaigns
          </Button>
          <Button
            variant={activeFilter === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('sent')}
          >
            Sent
          </Button>
          <Button
            variant={activeFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('draft')}
          >
            Drafts
          </Button>
          <Button
            variant={activeFilter === 'scheduled' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('scheduled')}
          >
            Scheduled
          </Button>
        </div>
      </div>

      {/* Campaign List */}
      <div className="px-4 sm:px-6 md:px-8">
        <CampaignHistory />
      </div>

      {/* Analytics Summary */}
      <div className="px-4 sm:px-6 md:px-8 mt-8">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Campaign Performance Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Average Open Rate</p>
              <p className="text-2xl font-semibold text-gray-900">24.8%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Average Delivery Rate</p>
              <p className="text-2xl font-semibold text-gray-900">89.3%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total Customers Reached</p>
              <p className="text-2xl font-semibold text-gray-900">5,842</p>
            </div>
          </div>
          
          <div className="bg-primary-50 p-4 rounded-md">
            <div className="flex">
              <span className="material-icons text-primary-500 mr-2">tips_and_updates</span>
              <div>
                <h3 className="text-sm font-medium text-primary-800">AI Insight</h3>
                <p className="text-sm text-primary-700 mt-1">
                  Campaigns sent on Tuesday and Thursday have shown 15% higher engagement rates. 
                  Consider scheduling your next campaign for these days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
