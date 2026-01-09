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
      // If checking for inequality or exclusion, null might satisfy the condition? 
      // For now, let's assume null never matches unless checking specifically for empty (which isn't really supported yet except by regex maybe)
      return false; 
    }

    return this.compare(txValue, condition.operator, condition.value, condition.caseSensitive);
  }

  private getValueFromTransaction(transaction: TransactionWithAccount, field: string): any {
    switch (field) {
      case 'description': return transaction.description;
      case 'merchant': return transaction.merchant;
      case 'amount': return Number(transaction.amount); // Decimal to number
      case 'notes': return transaction.notes;
      case 'account': return transaction.account?.name; // Assuming we check account name? Or ID? Let's assume name for now as it's more user friendly in UI
      case 'date': return transaction.date;
      default: return null;
    }
  }

  private compare(actual: any, operator: string, expected: any, caseSensitive = false): boolean {
    if (typeof actual === 'string' && typeof expected === 'string' && !caseSensitive) {
      actual = actual.toLowerCase();
      expected = expected.toLowerCase();
    }

    switch (operator) {
      case 'equals':
        return actual == expected; // loose equality for number/string mix
      case 'contains':
        return String(actual).includes(String(expected));
      case 'startsWith':
        return String(actual).startsWith(String(expected));
      case 'endsWith':
        return String(actual).endsWith(String(expected));
      case 'regex':
        try {
          const regex = new RegExp(String(expected), caseSensitive ? '' : 'i');
          return regex.test(String(actual));
        } catch (e) {
          return false;
        }
      case 'greaterThan':
        return Number(actual) > Number(expected);
      case 'lessThan':
        return Number(actual) < Number(expected);
      case 'between':
        return Number(actual) >= Number(expected.min) && Number(actual) <= Number(expected.max);
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'notIn':
        return Array.isArray(expected) && !expected.includes(actual);
      default:
        return false;
    }
  }
}
