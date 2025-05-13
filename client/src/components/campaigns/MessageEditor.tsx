import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@shared/schema';
import { generateMessageSuggestions } from '@/lib/aiService';
import { useToast } from '@/hooks/use-toast';

interface MessageEditorProps {
  initialMessage?: string;
  onMessageChange: (message: string) => void;
  segmentName?: string;
}

type ObjectiveType = 'win_back' | 'new_products' | 'loyalty' | 'repeat_purchase';

const OBJECTIVES = {
  win_back: 'Win back inactive customers',
  new_products: 'Promote new products',
  loyalty: 'Reward loyal customers',
  repeat_purchase: 'Drive repeat purchases'
};

export default function MessageEditor({ initialMessage = '', onMessageChange, segmentName }: MessageEditorProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState(initialMessage);
  const [previewMessage, setPreviewMessage] = useState('');
  const [aiObjective, setAiObjective] = useState<ObjectiveType>('win_back');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [messageSuggestions, setMessageSuggestions] = useState<string[]>([]);

  // Sample customer for preview
  const sampleCustomer: Partial<Customer> = {
    firstName: 'Mohit',
    lastName: 'Sharma',
    email: 'mohit@example.com'
  };

  // Update preview message when message changes
  useEffect(() => {
    let preview = message;
    preview = preview.replace(/{{customer\.firstName}}/g, sampleCustomer.firstName || '');
    preview = preview.replace(/{{customer\.lastName}}/g, sampleCustomer.lastName || '');
    preview = preview.replace(/{{customer\.email}}/g, sampleCustomer.email || '');
    preview = preview.replace(/{{customer\.([^}]+)}}/g, 'Value');
    setPreviewMessage(preview);
  }, [message]);

  // Update parent when message changes
  useEffect(() => {
    onMessageChange(message);
  }, [message, onMessageChange]);

  const handleGenerateSuggestions = async () => {
    try {
      setIsGeneratingSuggestions(true);
      const objective = OBJECTIVES[aiObjective];
      const suggestions = await generateMessageSuggestions(objective, segmentName);
      setMessageSuggestions(suggestions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate message suggestions. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <div className="space-y-6">
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
          Use {{customer.firstName}}, {{customer.lastName}}, etc. for personalization.
        </p>
      </div>

      {/* AI Message Suggestions */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="material-icons text-blue-400">auto_awesome</span>
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-sm font-medium text-blue-800">AI Message Suggestions</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Generate personalized messages based on:</p>
                <div className="mt-2 space-y-2">
                  <Select
                    value={aiObjective}
                    onValueChange={(value) => setAiObjective(value as ObjectiveType)}
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
        </CardContent>
      </Card>

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
    </div>
  );
}
