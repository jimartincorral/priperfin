export interface RuleCondition {
  field: 'description' | 'merchant' | 'amount' | 'notes' | 'account' | 'date';
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'regex' | 
            'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn';
  value: string | number | string[] | { min: number; max: number };
  caseSensitive?: boolean;
}

export interface ConditionGroup {
  operator: 'AND' | 'OR';
  conditions: (RuleCondition | ConditionGroup)[];
}

export type RuleConditions = ConditionGroup;
