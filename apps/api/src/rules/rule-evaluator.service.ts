import { Injectable, Logger } from '@nestjs/common';
import { Transaction, CategorizationRule, Account } from '../generated/client';
import { RuleCondition, ConditionGroup, RuleConditions } from './interfaces/rule-condition.interface';

type TransactionWithAccount = Transaction & { account?: Account | null };

@Injectable()
export class RuleEvaluatorService {
  private readonly logger = new Logger(RuleEvaluatorService.name);

  matches(transaction: TransactionWithAccount, rule: CategorizationRule): boolean {
    try {
      const conditions: RuleConditions = JSON.parse(rule.conditionsJson);
      return this.evaluateGroup(transaction, conditions);
    } catch (error) {
      this.logger.error(`Failed to evaluate rule ${rule.id}: ${error.message}`);
      return false;
    }
  }

  matchesConditions(transaction: TransactionWithAccount, conditionsJson: string): boolean {
    try {
      const conditions: RuleConditions = JSON.parse(conditionsJson);
      return this.evaluateGroup(transaction, conditions);
    } catch (error) {
      this.logger.error(`Failed to parse conditions: ${error.message}`);
      return false;
    }
  }

  private evaluateGroup(transaction: TransactionWithAccount, group: ConditionGroup): boolean {
    if (!group.conditions || group.conditions.length === 0) return true;

    if (group.operator === 'AND') {
      return group.conditions.every(condition => this.evaluateConditionOrGroup(transaction, condition));
    } else { // OR
      return group.conditions.some(condition => this.evaluateConditionOrGroup(transaction, condition));
    }
  }

  private evaluateConditionOrGroup(transaction: TransactionWithAccount, item: RuleCondition | ConditionGroup): boolean {
    if ('conditions' in item) {
      return this.evaluateGroup(transaction, item as ConditionGroup);
    } else {
      return this.evaluateCondition(transaction, item as RuleCondition);
    }
  }

  private evaluateCondition(transaction: TransactionWithAccount, condition: RuleCondition): boolean {
    const txValue = this.getValueFromTransaction(transaction, condition.field);
    
    // Handle null/undefined values in transaction
    if (txValue === null || txValue === undefined) {
      this.logger.debug(`Condition failed: field ${condition.field} is null in transaction`);
      return false; 
    }

    const isMatch = this.compare(txValue, condition.operator, condition.value, condition.caseSensitive);
    
    if (!isMatch) {
        this.logger.debug(`Condition NO MATCH: ${condition.field} ("${txValue}") ${condition.operator} "${JSON.stringify(condition.value)}"`);
    } else {
        this.logger.debug(`Condition MATCH: ${condition.field} ("${txValue}") ${condition.operator} "${JSON.stringify(condition.value)}"`);
    }
    
    return isMatch;
  }

  private getValueFromTransaction(transaction: TransactionWithAccount, field: string): any {
    switch (field) {
      case 'description': return transaction.description;
      case 'merchant': return transaction.merchant || transaction.description; // Fallback to description if merchant is null
      case 'amount': return Number(transaction.amount); // Decimal to number
      case 'notes': return transaction.notes;
      case 'account': return transaction.account?.name; 
      case 'date': return transaction.date;
      default: return null;
    }
  }

  private compare(actual: any, operator: string, expected: any, caseSensitive = false): boolean {
    // String normalization
    const toString = (val: any) => (val === null || val === undefined) ? '' : String(val);
    const normalizeString = (val: any) => caseSensitive ? toString(val) : toString(val).toLowerCase();

    // Number normalization
    const toNumber = (val: any) => {
        if (typeof val === 'number') return val;
        const n = parseFloat(toString(val));
        return isNaN(n) ? 0 : n;
    };

    switch (operator) {
      case 'equals':
        if (typeof actual === 'number' || !isNaN(parseFloat(actual)) && typeof expected !== 'string') {
            return toNumber(actual) === toNumber(expected);
        }
        return normalizeString(actual) === normalizeString(expected);
        
      case 'contains':
        return normalizeString(actual).includes(normalizeString(expected));
        
      case 'startsWith':
        return normalizeString(actual).startsWith(normalizeString(expected));
        
      case 'endsWith':
        return normalizeString(actual).endsWith(normalizeString(expected));
        
      case 'regex':
        try {
          const regex = new RegExp(toString(expected), caseSensitive ? '' : 'i');
          return regex.test(toString(actual));
        } catch (e) {
          return false;
        }
        
      case 'greaterThan':
        return toNumber(actual) > toNumber(expected);
        
      case 'lessThan':
        return toNumber(actual) < toNumber(expected);
        
      case 'between':
        const val = toNumber(actual);
        const min = toNumber((expected as any).min);
        const max = toNumber((expected as any).max);
        return val >= min && val <= max;
        
      case 'in':
        if (!Array.isArray(expected)) return false;
        const normalizedActualIn = normalizeString(actual);
        return expected.some(e => normalizeString(e) === normalizedActualIn);
        
      case 'notIn':
        if (!Array.isArray(expected)) return true;
        const normalizedActualNotIn = normalizeString(actual);
        return !expected.some(e => normalizeString(e) === normalizedActualNotIn);
        
      default:
        return false;
    }
  }
}
