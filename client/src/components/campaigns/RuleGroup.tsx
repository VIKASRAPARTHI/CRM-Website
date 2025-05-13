import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RuleGroup as RuleGroupType, Rule, LogicalOperator, RuleOperator } from "@shared/schema";

interface RuleGroupProps {
  index: number;
  ruleGroup: RuleGroupType;
  onChange: (ruleGroup: RuleGroupType) => void;
  onDelete: () => void;
}

const FIELD_OPTIONS = [
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "status", label: "Customer Status" },
  { value: "totalSpend", label: "Total Spend" },
  { value: "lastSeenAt", label: "Last Seen" },
];

const OPERATOR_OPTIONS = [
  { value: "equals", label: "is equal to" },
  { value: "not_equals", label: "is not equal to" },
  { value: "greater_than", label: "is greater than" },
  { value: "less_than", label: "is less than" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "starts_with", label: "starts with" },
  { value: "ends_with", label: "ends with" },
  { value: "is_before", label: "is before" },
  { value: "is_after", label: "is after" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "new", label: "New" },
];

export default function RuleGroup({ index, ruleGroup, onChange, onDelete }: RuleGroupProps) {
  const [groupOperator, setGroupOperator] = useState<LogicalOperator>(ruleGroup.logicalOperator);
  const [rules, setRules] = useState<Rule[]>(
    ruleGroup.rules.filter(rule => !('logicalOperator' in rule)) as Rule[]
  );

  const handleOperatorChange = (value: string) => {
    const newOperator = value as LogicalOperator;
    setGroupOperator(newOperator);
    onChange({
      ...ruleGroup,
      logicalOperator: newOperator,
    });
  };

  const handleAddRule = () => {
    const newRule: Rule = {
      field: "totalSpend",
      operator: "greater_than",
      value: 0,
    };
    
    const newRules = [...rules, newRule];
    setRules(newRules);
    
    onChange({
      ...ruleGroup,
      rules: newRules,
    });
  };

  const handleRuleChange = (index: number, field: keyof Rule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    
    setRules(newRules);
    onChange({
      ...ruleGroup,
      rules: newRules,
    });
  };

  const handleRuleDelete = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
    
    onChange({
      ...ruleGroup,
      rules: newRules,
    });
  };

  const renderValueInput = (rule: Rule, ruleIndex: number) => {
    // For customer status, show a select with status options
    if (rule.field === "status") {
      return (
        <Select
          value={rule.value as string}
          onValueChange={(value) => handleRuleChange(ruleIndex, "value", value)}
        >
          <SelectTrigger className="w-32 text-sm">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    // For date fields, show a date input
    if (rule.field === "lastSeenAt" || rule.field === "createdAt") {
      return (
        <Input
          type="date"
          value={rule.value as string}
          onChange={(e) => handleRuleChange(ruleIndex, "value", e.target.value)}
          className="text-sm w-36"
        />
      );
    }
    
    // For numeric fields like totalSpend, show a number input
    if (rule.field === "totalSpend") {
      return (
        <Input
          type="number"
          value={rule.value as number}
          onChange={(e) => handleRuleChange(ruleIndex, "value", parseFloat(e.target.value) || 0)}
          className="text-sm w-36"
        />
      );
    }
    
    // Default to text input for other fields
    return (
      <Input
        type="text"
        value={rule.value as string}
        onChange={(e) => handleRuleChange(ruleIndex, "value", e.target.value)}
        className="text-sm w-36"
        placeholder="Value"
      />
    );
  };

  return (
    <div className="campaign-rule-item bg-white rounded-md border border-gray-200 p-4 fade-in">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700">Rule Group {index}</span>
          <span className="ml-2 text-xs text-gray-500">
            (Match {groupOperator === "AND" ? "ALL" : "ANY"})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={groupOperator}
            onValueChange={handleOperatorChange}
          >
            <SelectTrigger className="w-44 text-sm">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OR">Match ANY (OR)</SelectItem>
              <SelectItem value="AND">Match ALL (AND)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="material-icons text-sm">delete</span>
          </Button>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule, ruleIndex) => (
          <div
            key={ruleIndex}
            className="flex flex-wrap items-center gap-2 pl-2 py-2 border-l-2 border-primary-200"
          >
            <Select
              value={rule.field}
              onValueChange={(value) => handleRuleChange(ruleIndex, "field", value)}
            >
              <SelectTrigger className="w-36 text-sm">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={rule.operator}
              onValueChange={(value) => handleRuleChange(ruleIndex, "operator", value as RuleOperator)}
            >
              <SelectTrigger className="w-40 text-sm">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                {OPERATOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {renderValueInput(rule, ruleIndex)}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRuleDelete(ruleIndex)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="material-icons text-sm">delete</span>
            </Button>
          </div>
        ))}
        
        {/* Add Rule Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRule}
          className="text-gray-700 bg-white hover:bg-gray-50"
        >
          <span className="material-icons text-sm mr-1">add</span>
          Add Rule
        </Button>
      </div>
    </div>
  );
}
