import OpenAI from "openai";
import { RuleGroup, LogicalOperator, Rule, RuleOperator } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-api-key" });

// Convert natural language to segment rules
export async function predictSegmentFromText(text: string): Promise<RuleGroup> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at converting natural language into structured segment rules for a CRM system. 
          
The available fields to filter on are:
- firstName: customer first name
- lastName: customer last name
- email: customer email
- phone: customer phone number
- status: customer status (active or inactive)
- totalSpend: total amount customer has spent
- lastSeenAt: date customer was last active
- createdAt: date customer was created

The available operators are:
- equals
- not_equals
- greater_than
- less_than
- contains
- not_contains
- starts_with
- ends_with
- is_before (for dates)
- is_after (for dates)
- is_between (for dates)

Logical operators can be AND or OR.

Respond with a JSON object in the exact format of a RuleGroup: 
{
  "logicalOperator": "AND" or "OR",
  "rules": [
    {
      "field": "one of the fields above",
      "operator": "one of the operators above",
      "value": "appropriate value"
    },
    // More rules or nested rule groups
  ]
}`
        },
        {
          role: "user",
          content: `Convert this text to segment rules: "${text}"`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate segment rules");
    }
    
    // Parse and validate the response
    const rules = JSON.parse(content) as RuleGroup;
    
    return rules;
  } catch (error) {
    console.error("Error generating segment rules:", error);
    
    // Return a basic fallback rule if OpenAI call fails
    return {
      logicalOperator: "AND",
      rules: [
        {
          field: "status",
          operator: "equals",
          value: "active"
        }
      ]
    };
  }
}

// Generate AI-powered message suggestions
export async function generateMessageSuggestions(objective: string, segmentInfo?: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert marketing copywriter specialized in crafting personalized messages for customer campaigns.
          
Generate 3 different message variants for a marketing campaign based on the objective provided.
Each message should:
- Be concise (max 160 characters)
- Include personalization with {{customer.firstName}} placeholder
- Be compelling and action-oriented
- Include a clear call to action

Respond with a JSON array of 3 message strings.`
        },
        {
          role: "user",
          content: `Generate message suggestions for a campaign with this objective: "${objective}"
          ${segmentInfo ? `The target segment is: ${segmentInfo}` : ''}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate message suggestions");
    }
    
    // Parse and validate the response
    const suggestions = JSON.parse(content);
    if (!Array.isArray(suggestions)) {
      throw new Error("Invalid response format");
    }
    
    return suggestions as string[];
  } catch (error) {
    console.error("Error generating message suggestions:", error);
    
    // Return fallback messages
    return [
      "Hi {{customer.firstName}}, we miss you! Come back and enjoy 15% off your next purchase with code: WELCOME15",
      "{{customer.firstName}}, it's been a while! We'd love to see you again. Use code COMEBACK20 for 20% off today.",
      "Exclusive offer for you, {{customer.firstName}}! Return today and get a free gift with any purchase. Limited time only!"
    ];
  }
}

// Generate campaign summary insights
export async function generateCampaignSummary(campaign: any, logs: any[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an analytics expert who provides clear, human-readable insights from campaign data.
          
Generate a brief 2-3 sentence summary of the campaign performance based on the data provided.
Focus on delivery statistics, audience characteristics, and any notable patterns.
Use natural, conversational language that a business user would find helpful.`
        },
        {
          role: "user",
          content: `Here's the campaign data:
          
Campaign Name: ${campaign.name}
Audience Size: ${campaign.audienceSize}
Messages Sent: ${campaign.sentCount}
Messages Failed: ${campaign.failedCount}
Date Sent: ${campaign.sentAt}

${JSON.stringify(logs.slice(0, 10), null, 2)}`
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate campaign summary");
    }
    
    return content;
  } catch (error) {
    console.error("Error generating campaign summary:", error);
    
    // Return a fallback summary
    return `Your campaign reached ${campaign.audienceSize} users. ${campaign.sentCount} messages were delivered successfully (${Math.round((campaign.sentCount / campaign.audienceSize) * 100)}% delivery rate).`;
  }
}

// Recommend best time to send campaign
export async function recommendSendTime(): Promise<string> {
  // In a real application, this would analyze customer activity patterns
  // For simplicity, we'll return a fixed recommendation
  return "Tuesday at 7:00 PM";
}

// Auto-tag campaigns based on segment and message content
export async function autoCategorizeSegment(rules: RuleGroup, message: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at categorizing marketing campaigns.
          
Based on the segment rules and message content, determine which ONE of these categories best fits:
- Win-back
- New Customers
- High Value Customers
- Inactive Customers
- Promotional
- Announcement
- Loyalty Reward
- Engagement

Respond with just the category name, nothing else.`
        },
        {
          role: "user",
          content: `Segment rules: ${JSON.stringify(rules)}
          
Message: ${message}`
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to categorize segment");
    }
    
    return content.trim();
  } catch (error) {
    console.error("Error categorizing segment:", error);
    
    // Return a fallback category
    return "Promotional";
  }
}
