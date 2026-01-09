import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction } from '../generated/client';

export interface RuleSuggestionResult {
  patternType: 'merchant' | 'description' | 'amount' | 'combined';
  conditions: any;
  categoryId: string;
  confidence: number;
  sampleTxIds: string[];
  matchCount: number;
}

@Injectable()
export class PatternDetectionService {
  private readonly logger = new Logger(PatternDetectionService.name);

  constructor(private prisma: PrismaService) {}

  async detectPatterns(): Promise<RuleSuggestionResult[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { categoryId: { not: null } },
      take: 2000, // Analyze last 2000 transactions
      orderBy: { date: 'desc' },
    });

    const suggestions: RuleSuggestionResult[] = [];
    
    // Group by category to find patterns within categories
    const byCategory = this.groupBy(transactions, 'categoryId');

    for (const [categoryId, txs] of Object.entries(byCategory)) {
      if (!categoryId || txs.length < 5) continue;

      // 1. Merchant Patterns (Exact & Fuzzy)
      const merchantSuggestions = this.detectMerchantPatterns(txs, categoryId);
      suggestions.push(...merchantSuggestions);

      // 2. Description Patterns (Common Substrings/Tokens)
      const descSuggestions = this.detectDescriptionPatterns(txs, categoryId);
      suggestions.push(...descSuggestions);

      // 3. Amount Patterns (Recurring amounts)
      // const amountSuggestions = this.detectAmountPatterns(txs, categoryId);
      // suggestions.push(...amountSuggestions);
    }

    // Filter duplicates and sort by confidence
    return this.deduplicateSuggestions(suggestions)
      .sort((a, b) => b.confidence - a.confidence);
  }

  private detectMerchantPatterns(transactions: Transaction[], categoryId: string): RuleSuggestionResult[] {
    const results: RuleSuggestionResult[] = [];
    // Filter txs with merchant
    const withMerchant = transactions.filter(t => t.merchant);
    
    // Group by merchant
    const byMerchant = this.groupBy(withMerchant, 'merchant');

    for (const [merchant, group] of Object.entries(byMerchant)) {
      if (group.length >= 5) {
        // High confidence merchant match
        results.push({
          patternType: 'merchant',
          conditions: {
            operator: 'AND',
            conditions: [{ field: 'merchant', operator: 'equals', value: merchant }]
          },
          categoryId,
          confidence: Math.min(80 + (group.length * 2), 99), // Base 80, max 99
          sampleTxIds: group.map(t => t.id).slice(0, 10),
          matchCount: group.length
        });
      }
    }
    
    return results;
  }

  private detectDescriptionPatterns(transactions: Transaction[], categoryId: string): RuleSuggestionResult[] {
    const results: RuleSuggestionResult[] = [];
    // Simple approach: Look for frequent words/tokens in descriptions
    // exclude common stop words
    const stopWords = new Set(['purchase', 'payment', 'transfer', 'withdrawal', 'pos', 'debit', 'card', 'date']);
    
    const tokenCounts = new Map<string, Transaction[]>();

    for (const tx of transactions) {
      const tokens = tx.description.toLowerCase()
        .split(/[^a-z0-9]/) // Split by non-alphanumeric
        .filter(t => t.length > 3 && !stopWords.has(t));
      
      for (const token of new Set(tokens)) { // Unique per tx
        if (!tokenCounts.has(token)) tokenCounts.set(token, []);
        tokenCounts.get(token)?.push(tx);
      }
    }

    for (const [token, group] of tokenCounts.entries()) {
      // If token appears in significant portion of category transactions
      if (group.length >= 5 && group.length >= transactions.length * 0.3) {
        // Check if this token is specific to this category (would need global context, but for now skip)
        
        results.push({
          patternType: 'description',
          conditions: {
            operator: 'AND',
            conditions: [{ field: 'description', operator: 'contains', value: token, caseSensitive: false }]
          },
          categoryId,
          confidence: Math.min(60 + (group.length * 2), 90), // Base 60
          sampleTxIds: group.map(t => t.id).slice(0, 10),
          matchCount: group.length
        });
      }
    }

    return results;
  }

  private groupBy(array: any[], key: string): Record<string, any[]> {
    return array.reduce((result, currentValue) => {
      const k = currentValue[key];
      if (!k) return result;
      (result[k] = result[k] || []).push(currentValue);
      return result;
    }, {});
  }

  private deduplicateSuggestions(suggestions: RuleSuggestionResult[]): RuleSuggestionResult[] {
    const unique = new Map<string, RuleSuggestionResult>();
    
    for (const s of suggestions) {
      const key = JSON.stringify(s.conditions) + s.categoryId;
      if (!unique.has(key) || unique.get(key)!.confidence < s.confidence) {
        unique.set(key, s);
      }
    }
    
    return Array.from(unique.values());
  }
}
