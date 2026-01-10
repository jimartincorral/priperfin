import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { RuleEvaluatorService } from './rule-evaluator.service';
import { PatternDetectionService } from './pattern-detection.service';
import { Transaction, CategorizationRule, RuleMode, SuggestionStatus } from '../generated/client';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    private prisma: PrismaService,
    private ruleEvaluator: RuleEvaluatorService,
    private patternDetection: PatternDetectionService,
  ) {}

  async create(createRuleDto: CreateRuleDto) {
    return this.prisma.categorizationRule.create({
      data: createRuleDto,
    });
  }

  async findAll(enabled?: boolean) {
    return this.prisma.categorizationRule.findMany({
      where: enabled !== undefined ? { enabled } : undefined,
      orderBy: { priority: 'desc' },
      include: { category: true }
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.categorizationRule.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!rule) throw new NotFoundException(`Rule with ID ${id} not found`);
    return rule;
  }

  async update(id: string, updateRuleDto: UpdateRuleDto) {
    return this.prisma.categorizationRule.update({
      where: { id },
      data: updateRuleDto,
    });
  }

  async remove(id: string) {
    return this.prisma.categorizationRule.delete({
      where: { id },
    });
  }

  async reorder(ruleIds: string[]) {
    // Determine max priority and count down
    // Or simpler: Assign priority = list length - index
    const total = ruleIds.length;
    
    const updates = ruleIds.map((id, index) => 
      this.prisma.categorizationRule.update({
        where: { id },
        data: { priority: total - index }
      })
    );
    
    return this.prisma.$transaction(updates);
  }

  async evaluateTransaction(transaction: Transaction) {
    this.logger.log(`Evaluating rules for transaction: ${transaction.description} (${transaction.amount})`);
    
    // Ensure we have account info if needed
    let txWithAccount = transaction as any;
    if (txWithAccount.accountId && !txWithAccount.account) {
        txWithAccount = await this.prisma.transaction.findUnique({
            where: { id: transaction.id },
            include: { account: true }
        }) || transaction;
    }

    // Get all enabled rules ordered by priority
    const rules = await this.prisma.categorizationRule.findMany({
      where: { enabled: true },
      orderBy: { priority: 'desc' },
    });
    
    this.logger.log(`Found ${rules.length} enabled rules to check`);
    
    // First match wins
    for (const rule of rules) {
      try {
        const isMatch = this.ruleEvaluator.matches(txWithAccount, rule);
        this.logger.debug(`Checking rule "${rule.name}" (ID: ${rule.id}): ${isMatch ? 'MATCH' : 'NO MATCH'}`);
        
        if (isMatch) {
          // Update match statistics
          await this.prisma.categorizationRule.update({
            where: { id: rule.id },
            data: {
              matchCount: { increment: 1 },
              lastMatched: new Date(),
            },
          });
          
          this.logger.log(`Transaction "${transaction.description}" matched rule "${rule.name}" -> Category: ${rule.categoryId}`);
          
          return { 
            rule, 
            categoryId: rule.categoryId, 
            mode: rule.mode 
          };
        }
      } catch (err) {
        this.logger.error(`Error evaluating rule "${rule.name}": ${err.message}`);
      }
    }
    
    this.logger.log('No rules matched this transaction');
    return null;
  }

  async testRule(conditionsJson: string, limit = 100) {
    // Fetch recent transactions
    const transactions = await this.prisma.transaction.findMany({
      take: 1000,
      orderBy: { date: 'desc' },
      include: { category: true }
    });
    
    // Evaluate each
    const matches: Transaction[] = [];
    for (const tx of transactions) {
      if (this.ruleEvaluator.matchesConditions(tx, conditionsJson)) {
        matches.push(tx);
        if (matches.length >= limit) break;
      }
    }
    
    return matches;
  }

  async detectAndStoreSuggestions() {
    // Delete old PENDING suggestions to avoid duplicates piling up
    await this.prisma.ruleSuggestion.deleteMany({
      where: { status: SuggestionStatus.PENDING }
    });
    
    const suggestions = await this.patternDetection.detectPatterns();
    
    // Get all existing rules to avoid suggesting duplicates
    const existingRules = await this.prisma.categorizationRule.findMany({
      select: { conditionsJson: true, categoryId: true }
    });
    
    const savedSuggestions = [];
    for (const s of suggestions) {
      // Check if a similar rule already exists
      const similarRuleExists = existingRules.some(rule => {
        // Must match same category
        if (rule.categoryId !== s.categoryId) return false;
        
        // Parse and compare conditions
        try {
          const ruleConditions = JSON.parse(rule.conditionsJson);
          const suggestionConditions = s.conditions;
          
          // Normalize both for comparison (stringify and compare)
          const ruleStr = this.normalizeConditionsForComparison(ruleConditions);
          const suggestionStr = this.normalizeConditionsForComparison(suggestionConditions);
          
          return ruleStr === suggestionStr;
        } catch (e) {
          return false;
        }
      });
      
      // Only create suggestion if no similar rule exists
      if (!similarRuleExists) {
        const created = await this.prisma.ruleSuggestion.create({
          data: {
            name: `${s.patternType === 'merchant' ? 'Merchant' : 'Description'} matches "${s.conditions.conditions[0].value}"`,
            conditionsJson: JSON.stringify(s.conditions),
            categoryId: s.categoryId,
            confidence: s.confidence,
            matchCount: s.matchCount,
            similarityType: s.patternType,
            sampleTxIds: JSON.stringify(s.sampleTxIds),
            status: SuggestionStatus.PENDING
          }
        });
        savedSuggestions.push(created);
      } else {
        this.logger.log(`Skipping suggestion - similar rule already exists for category ${s.categoryId}`);
      }
    }
    
    return savedSuggestions;
  }

  /**
   * Normalizes rule conditions for comparison.
   * Extracts key condition values and sorts them for consistent comparison.
   */
  private normalizeConditionsForComparison(conditions: any): string {
    if (!conditions || !conditions.conditions) return '';
    
    // Extract condition values and sort them
    const values = conditions.conditions
      .map((c: any) => `${c.field}:${c.operator}:${c.value}`.toLowerCase())
      .sort()
      .join('|');
    
    return values;
  }

  async getSuggestions(status?: SuggestionStatus) {
    return this.prisma.ruleSuggestion.findMany({
      where: status ? { status } : undefined,
      orderBy: { confidence: 'desc' },
      include: { category: true }
    });
  }

  async acceptSuggestion(id: string) {
    const suggestion = await this.prisma.ruleSuggestion.findUnique({ where: { id } });
    if (!suggestion) throw new NotFoundException('Suggestion not found');

    // Create rule
    const rule = await this.prisma.categorizationRule.create({
      data: {
        name: suggestion.name,
        conditionsJson: suggestion.conditionsJson,
        categoryId: suggestion.categoryId,
        mode: RuleMode.SUGGEST, // Default to suggest, let user change later
        priority: 0
      }
    });

    // Mark suggestion as accepted
    await this.prisma.ruleSuggestion.update({
      where: { id },
      data: { status: SuggestionStatus.ACCEPTED }
    });

    return rule;
  }

  async rejectSuggestion(id: string) {
    return this.prisma.ruleSuggestion.update({
      where: { id },
      data: { status: SuggestionStatus.REJECTED }
    });
  }

  async rejectRulePrompt(conditionsJson: string, categoryId: string) {
    // Create a REJECTED suggestion to track that user declined creating this rule
    // This prevents us from asking again for the same pattern
    const conditions = JSON.parse(conditionsJson);
    const patternValue = conditions.conditions?.[0]?.value || 'unknown';
    
    return this.prisma.ruleSuggestion.create({
      data: {
        name: `User declined: ${patternValue}`,
        conditionsJson,
        categoryId,
        confidence: 0,
        matchCount: 0,
        similarityType: 'description',
        sampleTxIds: '[]',
        status: SuggestionStatus.REJECTED
      }
    });
  }

  async applyToExisting(id: string) {
    const rule = await this.prisma.categorizationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Rule not found');

    // Get all uncategorized transactions
    const transactions = await this.prisma.transaction.findMany({
        where: { categoryId: null },
        include: { account: true }
    });

    let count = 0;
    for (const tx of transactions) {
        if (this.ruleEvaluator.matches(tx, rule)) {
            const updateData: any = { suggestedByRuleId: rule.id };
            if (rule.mode === RuleMode.AUTO_APPLY && rule.categoryId) {
                updateData.categoryId = rule.categoryId;
            }
            
            await this.prisma.transaction.update({
                where: { id: tx.id },
                data: updateData
            });
            count++;
        }
    }

    // Update rule stats
    await this.prisma.categorizationRule.update({
        where: { id },
        data: {
            matchCount: { increment: count },
            lastMatched: new Date()
        }
    });

    return { matchCount: count };
  }

  async suggestRuleForTransaction(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { category: true, account: true }
    });

    if (!transaction || !transaction.categoryId) {
      return null; // No suggestion without a category
    }

    // Find similar transactions with same category
    const similarTransactions = await this.prisma.transaction.findMany({
      where: {
        categoryId: transaction.categoryId,
        NOT: { id: transactionId }
      },
      take: 100,
      orderBy: { date: 'desc' }
    });

    if (similarTransactions.length < 3) {
      return null; // Not enough data
    }

    // Calculate similarity scores for different fields
    let descScore = 0;
    let notesScore = 0;
    let amountScore = 0;
    let merchantScore = 0;

    // Description similarity (check for common tokens)
    const stopWords = new Set(['purchase', 'payment', 'transfer', 'withdrawal', 'pos', 'debit', 'card', 'date']);
    const descTokens = transaction.description.toLowerCase()
      .split(/[^a-z0-9]/)
      .filter(t => t.length > 3 && !stopWords.has(t));

    for (const token of descTokens) {
      const matchCount = similarTransactions.filter(t => 
        t.description.toLowerCase().includes(token)
      ).length;
      const frequency = matchCount / similarTransactions.length;
      if (frequency >= 0.7) { // 70%+ have this token
        descScore = Math.max(descScore, frequency * 100);
      }
    }

    // Notes similarity
    if (transaction.notes) {
      const notesTokens = transaction.notes.toLowerCase()
        .split(/[^a-z0-9]/)
        .filter(t => t.length > 3 && !stopWords.has(t));

      for (const token of notesTokens) {
        const matchCount = similarTransactions.filter(t => 
          t.notes && t.notes.toLowerCase().includes(token)
        ).length;
        const frequency = matchCount / similarTransactions.length;
        if (frequency >= 0.6) {
          notesScore = Math.max(notesScore, frequency * 100);
        }
      }
    }

    // Amount similarity (recurring amount)
    const amountStr = Number(transaction.amount).toFixed(2);
    const sameAmountCount = similarTransactions.filter(t => 
      Number(t.amount).toFixed(2) === amountStr
    ).length;
    amountScore = (sameAmountCount / similarTransactions.length) * 100;

    // Merchant similarity
    if (transaction.merchant) {
      const sameMerchantCount = similarTransactions.filter(t => 
        t.merchant === transaction.merchant
      ).length;
      merchantScore = (sameMerchantCount / similarTransactions.length) * 100;
    }

    // Weighted average (description 40%, notes 30%, amount 20%, merchant 10%)
    const weightedConfidence = 
      (descScore * 0.4) + 
      (notesScore * 0.3) + 
      (amountScore * 0.2) + 
      (merchantScore * 0.1);

    // Only suggest if confidence >= 90%
    if (weightedConfidence < 90) {
      return null;
    }

    // Build conditions based on what had high confidence
    const conditions: any[] = [];
    
    // Add best matching description token
    if (descScore >= 70) {
      const bestToken = descTokens.find(token => {
        const matchCount = similarTransactions.filter(t => 
          t.description.toLowerCase().includes(token)
        ).length;
        return matchCount / similarTransactions.length >= 0.7;
      });
      if (bestToken) {
        conditions.push({
          field: 'description',
          operator: 'contains',
          value: bestToken,
          caseSensitive: false
        });
      }
    }

    // Add amount if highly consistent
    if (amountScore >= 80) {
      conditions.push({
        field: 'amount',
        operator: 'equals',
        value: Number(transaction.amount)
      });
    }

    // Add merchant if highly consistent
    if (merchantScore >= 80 && transaction.merchant) {
      conditions.push({
        field: 'merchant',
        operator: 'equals',
        value: transaction.merchant
      });
    }

    if (conditions.length === 0) {
      return null; // No good conditions found
    }

    const conditionsJson = JSON.stringify({
      operator: 'AND',
      conditions
    });

    // Check if this pattern was already rejected by the user
    const rejectedSuggestions = await this.prisma.ruleSuggestion.findMany({
      where: {
        status: SuggestionStatus.REJECTED,
        categoryId: transaction.categoryId
      }
    });

    for (const rejected of rejectedSuggestions) {
      const rejectedNormalized = this.normalizeConditionsForComparison(JSON.parse(rejected.conditionsJson));
      const currentNormalized = this.normalizeConditionsForComparison(JSON.parse(conditionsJson));
      
      if (rejectedNormalized === currentNormalized) {
        this.logger.log(`Skipping suggestion - user previously rejected this pattern`);
        return null; // Don't suggest if user already rejected it
      }
    }

    // Check if a similar rule already exists
    const existingRules = await this.prisma.categorizationRule.findMany({
      where: { categoryId: transaction.categoryId },
      select: { conditionsJson: true }
    });

    for (const rule of existingRules) {
      const ruleNormalized = this.normalizeConditionsForComparison(JSON.parse(rule.conditionsJson));
      const currentNormalized = this.normalizeConditionsForComparison(JSON.parse(conditionsJson));
      
      if (ruleNormalized === currentNormalized) {
        this.logger.log(`Skipping suggestion - similar rule already exists`);
        return null; // Don't suggest if rule already exists
      }
    }

    // Return suggestion (not saved to DB, just returned for UI)
    return {
      name: `Auto-categorize as ${transaction.category?.name || 'Unknown'}`,
      conditionsJson,
      categoryId: transaction.categoryId,
      confidence: Math.round(weightedConfidence),
      matchCount: similarTransactions.length,
      category: transaction.category || undefined
    };
  }
}
