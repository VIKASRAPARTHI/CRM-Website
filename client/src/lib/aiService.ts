import { apiRequest } from './queryClient';
import { RuleGroup, LogicalOperator } from '@shared/schema';

/**
 * Generates segment rules from natural language text
 */
export async function generateSegmentRules(text: string): Promise<{ rules: RuleGroup; audienceSize?: number }> {
  try {
    const response = await apiRequest('POST', '/api/segments/generate-from-text', { text });
    return await response.json();
  } catch (error) {
    console.error('Error generating segment rules:', error);
    throw new Error('Failed to generate segment rules');
  }
}

/**
 * Generates message suggestions based on campaign objective
 */
export async function generateMessageSuggestions(objective: string, segmentInfo?: string): Promise<string[]> {
  try {
    // This would normally call OpenAI API through our backend
    // For demo, we'll return static suggestions if API is not available

    try {
      // Try to get suggestions from backend
      const response = await fetch('/api/campaigns/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective, segmentInfo }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      return data;
    } catch (apiError) {
      console.warn('API call failed, using fallback suggestions:', apiError);
      throw apiError; // Re-throw to use fallback
    }
  } catch (error) {
    console.error('Error generating message suggestions:', error);

    // Fallback suggestions if API call fails
    if (objective.includes('win back')) {
      return [
        "Hi {{customer.firstName}}, we miss you! It's been a while since your last order. Come back and enjoy 15% off your next purchase with code: WELCOME15",
        "{{customer.firstName}}, it's been too long! We'd love to see you again. Use code COMEBACK20 for 20% off today.",
        "Exclusive offer for you, {{customer.firstName}}! Return today and get a free gift with any purchase over ₹1000."
      ];
    } else if (objective.includes('new products')) {
      return [
        "{{customer.firstName}}, check out our latest products! Use code NEWITEM10 for 10% off your purchase.",
        "Hi {{customer.firstName}}! We've just launched our new collection and thought you'd want to be first to see it!",
        "New arrivals alert, {{customer.firstName}}! Discover our fresh collection today with free shipping on orders over ₹1500."
      ];
    } else if (objective.includes('loyal')) {
      return [
        "Thank you for your loyalty, {{customer.firstName}}! Enjoy 25% off your next purchase as our valued customer.",
        "{{customer.firstName}}, we appreciate your continued support! Here's a special 20% discount just for you.",
        "VIP access for {{customer.firstName}}! As a valued customer, shop our exclusive collection before anyone else."
      ];
    } else {
      return [
        "Hi {{customer.firstName}}, ready for your next purchase? Use code NEXT10 for 10% off today!",
        "{{customer.firstName}}, we have items waiting for you! Complete your collection with 15% off using code: COMPLETE15",
        "We picked some items just for you, {{customer.firstName}}! Shop now and get free shipping on orders over ₹2000."
      ];
    }
  }
}

/**
 * Generates campaign summary based on delivery results
 */
export async function generateCampaignSummary(campaign: any, logs: any[]): Promise<string> {
  try {
    // This would normally call OpenAI API through our backend
    // For demo, we'll return static summary if API is not available

    // Try to get summary from backend
    const response = await fetch('/api/campaigns/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign, logs }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error generating campaign summary:', error);

    // Calculate delivery rate
    const deliveryRate = campaign.audienceSize > 0
      ? Math.round((campaign.sentCount / campaign.audienceSize) * 100)
      : 0;

    // Fallback summary if API call fails
    return `Your campaign reached ${campaign.audienceSize} users. ${campaign.sentCount} messages were delivered (${deliveryRate}% delivery rate). The campaign performed ${deliveryRate > 85 ? 'above' : 'below'} average.`;
  }
}

/**
 * Auto-categorizes a segment based on rules
 */
export async function autoCategorizeSegment(rules: RuleGroup): Promise<string> {
  try {
    // This would normally call OpenAI API through our backend
    // For demo, we'll do simple rule-based categorization

    const ruleString = JSON.stringify(rules);

    if (ruleString.includes('lastSeen') || ruleString.includes('lastSeenAt')) {
      if (ruleString.includes('greater_than') || ruleString.includes('is_after')) {
        return 'Active Customers';
      } else {
        return 'Inactive Customers';
      }
    } else if (ruleString.includes('totalSpend')) {
      if (ruleString.includes('greater_than')) {
        return 'High Value Customers';
      } else {
        return 'Low Value Customers';
      }
    } else if (ruleString.includes('status')) {
      if (ruleString.includes('new')) {
        return 'New Customers';
      } else if (ruleString.includes('active')) {
        return 'Active Customers';
      } else {
        return 'Inactive Customers';
      }
    }

    return 'General Audience';
  } catch (error) {
    console.error('Error auto-categorizing segment:', error);
    return 'Custom Segment';
  }
}
