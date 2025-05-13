import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import RuleBuilder from "./RuleBuilder";
import { RuleGroup } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { generateSegmentRules } from "@/lib/aiService";

interface SegmentBuilderProps {
  onSegmentCreate: (segment: { name: string; rules: RuleGroup }) => void;
}

export default function SegmentBuilder({ onSegmentCreate }: SegmentBuilderProps) {
  const { toast } = useToast();
  const [segmentName, setSegmentName] = useState("");
  const [rules, setRules] = useState<RuleGroup>({
    logicalOperator: "OR",
    rules: []
  });
  const [audienceSize, setAudienceSize] = useState<number | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const handleRulesChange = (updatedRules: RuleGroup) => {
    setRules(updatedRules);
    setAudienceSize(null); // Reset audience size when rules change
  };

  const handlePreview = async () => {
    if (rules.rules.length === 0) {
      toast({
        title: "No Rules Defined",
        description: "Please add at least one rule before previewing.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsPreviewLoading(true);

      const response = await apiRequest("POST", "/api/segments/preview", { rules });
      const data = await response.json();

      setAudienceSize(data.audienceSize);

      toast({
        title: "Audience Preview Updated",
        description: `Found ${data.audienceSize} customers matching your criteria.`,
      });
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Could not load audience preview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a description of your target audience.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Call AI service to generate rules
      const result = await generateSegmentRules(aiPrompt);

      if (result.rules) {
        setRules(result.rules);
        setAudienceSize(result.audienceSize || null);

        toast({
          title: "Rules Generated",
          description: "AI has created rules based on your description.",
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate rules. Please try again or create them manually.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (!segmentName.trim()) {
      toast({
        title: "Missing Segment Name",
        description: "Please provide a name for your segment.",
        variant: "destructive"
      });
      return;
    }

    if (rules.rules.length === 0) {
      toast({
        title: "No Rules Defined",
        description: "Please add at least one rule before creating the segment.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    // Call the parent callback with the segment data
    onSegmentCreate({
      name: segmentName,
      rules: rules
    });

    // Note: We don't set isCreating back to false here because the parent component
    // will likely navigate away from this component after segment creation
  };

  return (
    <div className="space-y-6">
      {/* Segment Name */}
      <div>
        <label htmlFor="segment-name" className="block text-sm font-medium text-gray-700">
          Segment Name
        </label>
        <div className="mt-1">
          <Input
            id="segment-name"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            placeholder="e.g., High Value Customers"
            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* AI Assistance Card */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="material-icons text-blue-400">psychology</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">AI Assistance</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Type natural language to create rules:</p>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <Input
                    type="text"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., People who spent over ₹5K"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAIGenerate();
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleAIGenerate}
                      disabled={isGenerating}
                      className="h-full text-blue-500 cursor-pointer"
                    >
                      {isGenerating ? (
                        <Spinner size="sm" />
                      ) : (
                        <span className="material-icons">send</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rule Builder */}
      <RuleBuilder
        initialRules={rules}
        onChange={handleRulesChange}
        onPreview={handlePreview}
      />

      {/* Audience Size Preview */}
      <div className="mt-2 flex items-center">
        {isPreviewLoading ? (
          <div className="flex items-center">
            <Spinner size="sm" className="mr-2" />
            <span className="text-sm text-gray-500">Calculating audience size...</span>
          </div>
        ) : audienceSize !== null ? (
          <>
            <span className="text-2xl font-semibold text-gray-900">{audienceSize.toLocaleString()}</span>
            <span className="ml-2 text-sm text-gray-500">customers match these criteria</span>
          </>
        ) : (
          <span className="text-sm text-gray-500">Click "Refresh Count" to preview audience size</span>
        )}
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isCreating ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : 'Create Segment'}
        </Button>
      </div>
    </div>
  );
}
