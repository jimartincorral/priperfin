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

      // 3. Combined Patterns (Multi-factor: description, notes, amount, merchant)
      const combinedSuggestions = this.detectCombinedPatterns(txs, categoryId);
      suggestions.push(...combinedSuggestions);
    }

    // Filter duplicates, filter by 90% confidence threshold, and sort by confidence
    return this.deduplicateSuggestions(suggestions)
      .filter(s => s.confidence >= 90) // Only suggest rules with 90%+ confidence
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
          confidence: Math.min(85 + (group.length * 3), 99), // Base 85, +3% per match, max 99
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
          confidence: Math.min(75 + (group.length * 3), 99), // Base 75, +3% per match, max 99
          sampleTxIds: group.map(t => t.id).slice(0, 10),
          matchCount: group.length
        });
      }
    }

    return results;
  }

  private detectCombinedPatterns(transactions: Transaction[], categoryId: string): RuleSuggestionResult[] {
    const results: RuleSuggestionResult[] = [];
    const stopWords = new Set(['purchase', 'payment', 'transfer', 'withdrawal', 'pos', 'debit', 'card', 'date']);
    
    // Group transactions by similar characteristics
    const patterns = new Map<string, { 
      txs: Transaction[], 
      descTokens: Set<string>, 
      noteTokens: Set<string>, 
      amounts: Map<string, number>,
      merchants: Map<string, number>
    }>();

    // Build pattern groups based on common tokens
    for (const tx of transactions) {
      const descTokens = tx.description.toLowerCase()
        .split(/[^a-z0-9]/)
        .filter(t => t.length > 3 && !stopWords.has(t));
      
      const noteTokens = tx.notes 
        ? tx.notes.toLowerCase()
            .split(/[^a-z0-9]/)
            .filter(t => t.length > 3 && !stopWords.has(t))
        : [];

      // Try to find existing pattern group or create new one
      for (const token of descTokens) {
        const key = `desc:${token}`;
        if (!patterns.has(key)) {
          patterns.set(key, { 
            txs: [], 
            descTokens: new Set(), 
            noteTokens: new Set(),
            amounts: new Map(),
            merchants: new Map()
          });
        }
        const pattern = patterns.get(key)!;
        pattern.txs.push(tx);
        descTokens.forEach(t => pattern.descTokens.add(t));
        noteTokens.forEach(t => pattern.noteTokens.add(t));
        
        const amountKey = Number(tx.amount).toFixed(2);
        pattern.amounts.set(amountKey, (pattern.amounts.get(amountKey) || 0) + 1);
        
        if (tx.merchant) {
          pattern.merchants.set(tx.merchant, (pattern.merchants.get(tx.merchant) || 0) + 1);
        }
      }
    }

    // Analyze each pattern group
    for (const [patternKey, pattern] of patterns.entries()) {
      if (pattern.txs.length < 5) continue;

      // Calculate weighted confidence scores
      let descScore = 0;
      let notesScore = 0;
      let amountScore = 0;
      let merchantScore = 0;

      // Description score (40% weight): Based on token frequency
      const mainToken = patternKey.replace('desc:', '');
      const descFrequency = pattern.txs.length / transactions.length;
      descScore = Math.min(descFrequency * 100, 100);

      // Notes score (30% weight): Check if notes have common tokens
      if (pattern.noteTokens.size > 0) {
        const txsWithNotes = pattern.txs.filter(t => t.notes && t.notes.length > 0);
        if (txsWithNotes.length > 0) {
          const noteFrequency = txsWithNotes.length / pattern.txs.length;
          notesScore = Math.min(noteFrequency * 100, 100);
        }
      }

      // Amount score (20% weight): Check if transactions have recurring amounts
      const maxAmountCount = Math.max(...Array.from(pattern.amounts.values()));
      const amountFrequency = maxAmountCount / pattern.txs.length;
      if (amountFrequency >= 0.7) { // 70%+ have same amount
        amountScore = Math.min(amountFrequency * 100, 100);
      }

      // Merchant score (10% weight): Check if transactions have same merchant
      const maxMerchantCount = pattern.merchants.size > 0 
        ? Math.max(...Array.from(pattern.merchants.values()))
        : 0;
      const merchantFrequency = maxMerchantCount / pattern.txs.length;
      merchantScore = Math.min(merchantFrequency * 100, 100);

      // Calculate weighted average
      const weightedConfidence = 
        (descScore * 0.4) + 
        (notesScore * 0.3) + 
        (amountScore * 0.2) + 
        (merchantScore * 0.1);

      // Only create suggestion if meets minimum threshold
      if (weightedConfidence >= 90 && pattern.txs.length >= 5) {
        const conditions: any[] = [
          { field: 'description', operator: 'contains', value: mainToken, caseSensitive: false }
        ];

        // Add amount condition if highly consistent
        if (amountFrequency >= 0.8) {
          const mostCommonAmount = Array.from(pattern.amounts.entries())
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];
          conditions.push({ 
            field: 'amount', 
            operator: 'equals', 
            value: Number(mostCommonAmount)
          });
        }

        // Add merchant condition if highly consistent
        if (merchantFrequency >= 0.8 && pattern.merchants.size > 0) {
          const mostCommonMerchant = Array.from(pattern.merchants.entries())
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];
          conditions.push({ 
            field: 'merchant', 
            operator: 'equals', 
            value: mostCommonMerchant
          });
        }

        results.push({
          patternType: 'combined',
          conditions: {
            operator: 'AND',
            conditions
          },
          categoryId,
          confidence: Math.round(weightedConfidence),
          sampleTxIds: pattern.txs.map(t => t.id).slice(0, 10),
          matchCount: pattern.txs.length
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
