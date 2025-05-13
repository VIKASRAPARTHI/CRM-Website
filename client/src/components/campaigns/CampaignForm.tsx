import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { Campaign, Segment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { generateMessageSuggestions } from "@/lib/aiService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CampaignFormProps {
  segment: Segment;
  onCampaignCreate?: (campaign: any) => void;
}

export default function CampaignForm({ segment, onCampaignCreate }: CampaignFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [campaignName, setCampaignName] = useState("");
  const [message, setMessage] = useState("");
  const [schedule, setSchedule] = useState<"now" | "later">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiObjective, setAiObjective] = useState("win_back");
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [messageSuggestions, setMessageSuggestions] = useState<string[]>([]);

  // Update preview message when message changes
  useEffect(() => {
    let preview = message;
    preview = preview.replace(/{{customer\.firstName}}/g, "Mohit");
    preview = preview.replace(/{{customer\.lastName}}/g, "Sharma");
    preview = preview.replace(/{{customer\.([^}]+)}}/g, "Value");
    setPreviewMessage(preview);
  }, [message]);

  const handleScheduleChange = (value: string) => {
    setSchedule(value as "now" | "later");
  };

  const handleGenerateSuggestions = async () => {
    try {
      setIsGeneratingSuggestions(true);

      const objectives = {
        win_back: "Win back inactive customers",
        new_products: "Promote new products",
        loyalty: "Reward loyal customers",
        repeat_purchase: "Drive repeat purchases"
      };

      const selectedObjective = objectives[aiObjective as keyof typeof objectives] || "Win back inactive customers";

      const suggestions = await generateMessageSuggestions(selectedObjective, segment.name);
      setMessageSuggestions(suggestions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate message suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleSubmit = async () => {
    if (!campaignName.trim()) {
      toast({
        title: "Missing Campaign Name",
        description: "Please provide a name for your campaign.",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Missing Message",
        description: "Please provide a message for your campaign.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create campaign
      const response = await apiRequest("POST", "/api/campaigns", {
        name: campaignName,
        segmentId: segment.id,
        message: message,
        status: "draft"
      });

      const campaign = await response.json();

      toast({
        title: "Campaign Created",
        description: "Your campaign has been created successfully.",
      });

      // If onCampaignCreate callback is provided, call it
      if (onCampaignCreate) {
        console.log('Calling onCampaignCreate with campaign:', campaign);
        onCampaignCreate(campaign);
        return; // Don't proceed with sending or navigation
      }

      // If "send now" is selected, send the campaign
      if (schedule === "now") {
        await apiRequest("POST", `/api/campaigns/${campaign.id}/send`, {});

        toast({
          title: "Campaign Sent",
          description: "Your campaign is now being sent to the audience.",
        });
      }

      // Navigate to campaign history
      setLocation("/campaign-history");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Message Configuration</h3>
            <p className="mt-1 text-sm text-gray-500">Craft the perfect message for your audience.</p>

            {/* AI Message Suggestions */}
            <div className="mt-4 bg-blue-50 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="material-icons text-blue-400">auto_awesome</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">AI Message Suggestions</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Generate personalized messages based on:</p>
                    <div className="mt-2 space-y-2">
                      <Select
                        value={aiObjective}
                        onValueChange={setAiObjective}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select objective" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="win_back">Win back inactive customers</SelectItem>
                          <SelectItem value="new_products">Promote new products</SelectItem>
                          <SelectItem value="loyalty">Reward loyal customers</SelectItem>
                          <SelectItem value="repeat_purchase">Drive repeat purchases</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleGenerateSuggestions}
                        disabled={isGeneratingSuggestions}
                        className="w-full text-white bg-blue-600 hover:bg-blue-700"
                      >
                        {isGeneratingSuggestions ? "Generating..." : "Generate Suggestions"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Message Editor */}
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              {/* Campaign Name */}
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <div className="mt-1">
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Summer Sale Promotion"
                  />
                </div>
              </div>

              {/* Message Editor */}
              <div>
                <Label htmlFor="message">Message Content</Label>
                <div className="mt-1">
                  <Textarea
                    id="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Use &#123;&#123;customer.firstName&#125;&#125;, &#123;&#123;customer.lastName&#125;&#125;, etc. for personalization.
                </p>
              </div>

              {/* Message Suggestions */}
              {messageSuggestions.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">AI Suggestions</h3>
                  <div className="space-y-2">
                    {messageSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white border border-gray-200 rounded-md cursor-pointer hover:border-primary-300"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Preview */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Message Preview</h3>
                <div className="p-3 bg-white border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-700">{previewMessage}</p>
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <Label>Delivery Schedule</Label>
                <RadioGroup
                  value={schedule}
                  onValueChange={handleScheduleChange}
                  className="mt-2 space-y-4"
                >
                  <div className="flex items-center">
                    <RadioGroupItem value="now" id="schedule-now" />
                    <Label htmlFor="schedule-now" className="ml-3">
                      Send immediately
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="later" id="schedule-later" />
                    <Label htmlFor="schedule-later" className="ml-3">
                      Schedule for later
                    </Label>
                  </div>
                </RadioGroup>

                {schedule === "later" && (
                  <div className="ml-7 mt-3">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          type="date"
                          id="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          type="time"
                          id="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Scheduling Suggestion */}
              <div className="bg-primary-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="material-icons text-primary-400">schedule</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-primary-800">AI Scheduling Recommendation</h3>
                    <p className="mt-1 text-sm text-primary-700">
                      Based on your audience activity patterns, the best time to send this campaign is <span className="font-medium">Tuesday at 7:00 PM</span>.
                    </p>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSchedule("later");
                          setScheduledDate(new Date().toISOString().split('T')[0]); // Today's date
                          setScheduledTime("19:00"); // 7:00 PM
                        }}
                        className="text-primary-700 bg-primary-100 hover:bg-primary-200"
                      >
                        Apply Suggestion
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="py-5 mt-6 flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={() => setLocation("/campaign-history")}
          className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="border-transparent text-white bg-primary-600 hover:bg-primary-700"
        >
          {isSubmitting ? "Creating..." : "Create Campaign"}
        </Button>
      </div>
    </div>
  );
}
