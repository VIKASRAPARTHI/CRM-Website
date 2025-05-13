import { useState } from "react";
import { Button } from "@/components/ui/button";
import RuleGroup from "./RuleGroup";
import { useToast } from "@/hooks/use-toast";
import { RuleGroup as RuleGroupType, LogicalOperator } from "@shared/schema";

interface RuleBuilderProps {
  initialRules?: RuleGroupType;
  onChange: (rules: RuleGroupType) => void;
  onPreview: () => void;
}

export default function RuleBuilder({ initialRules, onChange, onPreview }: RuleBuilderProps) {
  const { toast } = useToast();
  const [ruleGroups, setRuleGroups] = useState<RuleGroupType[]>(() => {
    if (initialRules) {
      // If initialRules is a top-level group, extract its rule groups
      if (initialRules.rules.some(rule => 'logicalOperator' in rule)) {
        return initialRules.rules.filter(rule => 'logicalOperator' in rule) as RuleGroupType[];
      }
      // If initialRules has only simple rules, convert it to a single group
      return [initialRules];
    }
    // Default empty rule group
    return [{
      logicalOperator: "OR",
      rules: []
    }];
  });

  const handleAddRuleGroup = () => {
    setRuleGroups([...ruleGroups, {
      logicalOperator: "OR",
      rules: []
    }]);
    
    updateParentRules([...ruleGroups, {
      logicalOperator: "OR",
      rules: []
    }]);
  };

  const handleRuleGroupChange = (index: number, updatedRuleGroup: RuleGroupType) => {
    const newRuleGroups = [...ruleGroups];
    newRuleGroups[index] = updatedRuleGroup;
    setRuleGroups(newRuleGroups);
    
    updateParentRules(newRuleGroups);
  };

  const handleRuleGroupDelete = (index: number) => {
    const newRuleGroups = ruleGroups.filter((_, i) => i !== index);
    setRuleGroups(newRuleGroups);
    
    updateParentRules(newRuleGroups);
  };

  const updateParentRules = (groups: RuleGroupType[]) => {
    // If there are no groups, use empty rules
    if (groups.length === 0) {
      onChange({
        logicalOperator: "OR",
        rules: []
      });
      return;
    }
    
    // If there's only one group, use it directly
    if (groups.length === 1) {
      onChange(groups[0]);
      return;
    }
    
    // Create a parent rule group with all groups as children
    const parentRules: RuleGroupType = {
      logicalOperator: "OR" as LogicalOperator,
      rules: groups
    };
    
    onChange(parentRules);
  };

  const handlePreview = () => {
    if (ruleGroups.length === 0 || ruleGroups.some(group => group.rules.length === 0)) {
      toast({
        title: "Incomplete Rules",
        description: "Please add at least one rule to each group before previewing.",
        variant: "destructive",
      });
      return;
    }
    
    onPreview();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">Segment Rules</label>
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddRuleGroup}
            className="flex items-center"
          >
            <span className="material-icons text-sm mr-1">add</span>
            Add Rule Group
          </Button>
        </div>
      </div>

      <div className="segment-builder-wrapper space-y-4 border-2 border-dashed border-gray-200 rounded-md p-4 min-h-[200px]">
        {ruleGroups.length > 0 ? (
          ruleGroups.map((ruleGroup, index) => (
            <RuleGroup
              key={index}
              index={index + 1}
              ruleGroup={ruleGroup}
              onChange={(updatedGroup) => handleRuleGroupChange(index, updatedGroup)}
              onDelete={() => handleRuleGroupDelete(index)}
            />
          ))
        ) : (
          <div className="text-center py-4">
            <span className="material-icons text-gray-400 text-4xl">rule</span>
            <p className="mt-2 text-sm text-gray-500">No rules defined yet. Add a rule group to get started.</p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Audience Preview</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="text-primary-700 bg-primary-100 hover:bg-primary-200"
          >
            <span className="material-icons text-sm mr-1">refresh</span>
            Refresh Count
          </Button>
        </div>
      </div>
    </div>
  );
}
