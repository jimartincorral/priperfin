import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { RuleEvaluatorService } from './rule-evaluator.service';
import { PatternDetectionService } from './pattern-detection.service';
import {
  Transaction,
  CategorizationRule,
  RuleMode,
  SuggestionStatus,
} from '../generated/client';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    private prisma: PrismaService,
    private ruleEvaluator: RuleEvaluatorService,
    private patternDetection: PatternDetectionService,
  ) {}

  async create(createRuleDto: CreateRuleDto, profileId: string) {
    this.logger.log(`[create] Creating rule "${createRuleDto.name}" for category ${createRuleDto.categoryId}`);
    
    // Check if a similar rule already exists
    const existingRules = await this.prisma.categorizationRule.findMany({
      where: { profileId, categoryId: createRuleDto.categoryId },
      select: { id: true, name: true, conditionsJson: true },
    });

    this.logger.log(`[create] Found ${existingRules.length} existing rules for this category`);

    const newNormalized = this.normalizeConditionsForComparison(
      JSON.parse(createRuleDto.conditionsJson),
    );
    this.logger.log(`[create] New rule normalized: ${newNormalized}`);

    for (const rule of existingRules) {
      const existingNormalized = this.normalizeConditionsForComparison(
        JSON.parse(rule.conditionsJson),
      );
      this.logger.log(`[create] Comparing with "${rule.name}": ${existingNormalized}`);

      if (existingNormalized === newNormalized) {
        this.logger.warn(
          `Duplicate rule detected: "${createRuleDto.name}" has same conditions as existing rule "${rule.name}" (${rule.id})`,
        );
        throw new BadRequestException(
          `A similar rule already exists: "${rule.name}". Rules with identical conditions for the same category are not allowed.`,
        );
      }
    }

    this.logger.log(`[create] No duplicates found, creating rule`);
    return this.prisma.categorizationRule.create({
      data: { ...createRuleDto, profileId },
    });
  }

  async findAll(profileId: string, enabled?: boolean) {
    return this.prisma.categorizationRule.findMany({
      where: { 
        profileId,
        ...(enabled !== undefined ? { enabled } : {})
      },
      orderBy: { priority: 'desc' },
      include: { category: true },
    });
  }

  async findOne(id: string, profileId: string) {
    const rule = await this.prisma.categorizationRule.findFirst({
      where: { id, profileId },
      include: { category: true },
    });
    if (!rule) throw new NotFoundException(`Rule with ID ${id} not found or access denied`);
    return rule;
  }

  async update(id: string, profileId: string, updateRuleDto: UpdateRuleDto) {
    await this.findOne(id, profileId); // Verify ownership
    return this.prisma.categorizationRule.update({
      where: { id },
      data: updateRuleDto,
    });
  }

  async remove(id: string, profileId: string) {
    const result = await this.prisma.categorizationRule.deleteMany({
      where: { id, profileId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Rule not found or access denied');
    }
    return { success: true };
  }

  async reorder(ruleIds: string[]) {
    // Determine max priority and count down
    // Or simpler: Assign priority = list length - index
    const total = ruleIds.length;

    const updates = ruleIds.map((id, index) =>
      this.prisma.categorizationRule.update({
        where: { id },
        data: { priority: total - index },
      }),
    );

    return this.prisma.$transaction(updates);
  }

  async evaluateTransaction(transaction: Transaction, profileId: string) {
    // Disabled: too verbose during imports
    // this.logger.log(
    //   `Evaluating rules for transaction: ${transaction.description} (${transaction.amount})`,
    // );

    // Ensure we have account info if needed
    let txWithAccount = transaction as any;
    if (txWithAccount.accountId && !txWithAccount.account) {
      txWithAccount =
        (await this.prisma.transaction.findUnique({
          where: { id: transaction.id },
          include: { account: true },
        })) || transaction;
    }

    // Get all enabled rules ordered by priority FOR THIS PROFILE
    const rules = await this.prisma.categorizationRule.findMany({
      where: { profileId, enabled: true },
      orderBy: { priority: 'desc' },
    });

    // Disabled: too verbose during imports
    // this.logger.log(`Found ${rules.length} enabled rules to check`);

    // First match wins
    for (const rule of rules) {
      try {
        const isMatch = this.ruleEvaluator.matches(txWithAccount, rule);
        // Disabled: too verbose during imports
        // this.logger.debug(
        //   `Checking rule "${rule.name}" (ID: ${rule.id}): ${isMatch ? 'MATCH' : 'NO MATCH'}`,
        // );

        if (isMatch) {
          // Update match statistics
          await this.prisma.categorizationRule.update({
            where: { id: rule.id },
            data: {
              matchCount: { increment: 1 },
              lastMatched: new Date(),
            },
          });

          // Disabled: too verbose during imports
          // this.logger.log(
          //   `Transaction "${transaction.description}" matched rule "${rule.name}" -> Category: ${rule.categoryId}`,
          // );

          return {
            rule,
            categoryId: rule.categoryId,
            mode: rule.mode,
          };
        }
      } catch (err) {
        this.logger.error(
          `Error evaluating rule "${rule.name}": ${err.message}`,
        );
      }
    }

    // Disabled: too verbose during imports
    // this.logger.log('No rules matched this transaction');
    return null;
  }

  async testRule(conditionsJson: string, limit = 100) {
    // Fetch recent transactions
    const transactions = await this.prisma.transaction.findMany({
      take: 1000,
      orderBy: { date: 'desc' },
      include: { category: true },
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

  async detectAndStoreSuggestions(profileId: string) {
    // Delete old PENDING suggestions to avoid duplicates piling up
    await this.prisma.ruleSuggestion.deleteMany({
      where: { profileId, status: SuggestionStatus.PENDING },
    });

    const suggestions = await this.patternDetection.detectPatterns(profileId);

    // Get all existing rules to avoid suggesting duplicates
    const existingRules = await this.prisma.categorizationRule.findMany({
      where: { profileId },
      select: { conditionsJson: true, categoryId: true },
    });

    // Get all REJECTED suggestions to avoid re-suggesting
    const rejectedSuggestions = await this.prisma.ruleSuggestion.findMany({
      where: { profileId, status: SuggestionStatus.REJECTED },
      select: { conditionsJson: true, categoryId: true },
    });

    const savedSuggestions = [];
    for (const s of suggestions) {
      // Check if a similar rule already exists
      const similarRuleExists = existingRules.some((rule) => {
        // Must match same category
        if (rule.categoryId !== s.categoryId) return false;

        // Parse and compare conditions
        try {
          const ruleConditions = JSON.parse(rule.conditionsJson);
          const suggestionConditions = s.conditions;

          // Normalize both for comparison (stringify and compare)
          const ruleStr = this.normalizeConditionsForComparison(ruleConditions);
          const suggestionStr =
            this.normalizeConditionsForComparison(suggestionConditions);

          return ruleStr === suggestionStr;
        } catch (e) {
          return false;
        }
      });

      // Check if this suggestion was previously rejected
      const wasRejected = rejectedSuggestions.some((rejected) => {
        // Must match same category
        if (rejected.categoryId !== s.categoryId) return false;

        // Parse and compare conditions
        try {
          const rejectedConditions = JSON.parse(rejected.conditionsJson);
          const suggestionConditions = s.conditions;

          // Normalize both for comparison
          const rejectedStr = this.normalizeConditionsForComparison(rejectedConditions);
          const suggestionStr = this.normalizeConditionsForComparison(suggestionConditions);

          return rejectedStr === suggestionStr;
        } catch (e) {
          return false;
        }
      });

      // Only create suggestion if no similar rule exists AND it wasn't rejected
      if (!similarRuleExists && !wasRejected) {
        const created = await this.prisma.ruleSuggestion.create({
          data: {
            profileId,
            name: `${s.patternType === 'merchant' ? 'Merchant' : 'Description'} matches "${s.conditions.conditions[0].value}"`,
            conditionsJson: JSON.stringify(s.conditions),
            categoryId: s.categoryId,
            confidence: s.confidence,
            matchCount: s.matchCount,
            similarityType: s.patternType,
            sampleTxIds: JSON.stringify(s.sampleTxIds),
            status: SuggestionStatus.PENDING,
          },
        });
        savedSuggestions.push(created);
      } else if (similarRuleExists) {
        this.logger.log(
          `Skipping suggestion - similar rule already exists for category ${s.categoryId}`,
        );
      } else if (wasRejected) {
        this.logger.log(
          `Skipping suggestion - user previously rejected this pattern for category ${s.categoryId}`,
        );
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

  async getSuggestions(profileId: string, status?: SuggestionStatus) {
    return this.prisma.ruleSuggestion.findMany({
      where: { 
        profileId,
        ...(status ? { status } : {}) 
      },
      orderBy: { confidence: 'desc' },
      include: { category: true },
    });
  }

  async acceptSuggestion(id: string) {
    const suggestion = await this.prisma.ruleSuggestion.findUnique({
      where: { id },
    });
    if (!suggestion) throw new NotFoundException('Suggestion not found');

    // Create rule
    const rule = await this.prisma.categorizationRule.create({
      data: {
        profileId: suggestion.profileId,
        name: suggestion.name,
        conditionsJson: suggestion.conditionsJson,
        categoryId: suggestion.categoryId,
        mode: RuleMode.SUGGEST, // Default to suggest, let user change later
        priority: 0,
      },
    });

    // Mark suggestion as accepted
    await this.prisma.ruleSuggestion.update({
      where: { id },
      data: { status: SuggestionStatus.ACCEPTED },
    });

    return rule;
  }

  async rejectSuggestion(id: string) {
    return this.prisma.ruleSuggestion.update({
      where: { id },
      data: { status: SuggestionStatus.REJECTED },
    });
  }

  async rejectRulePrompt(conditionsJson: string, categoryId: string, profileId: string) {
    // Create a REJECTED suggestion to track that user declined creating this rule
    // This prevents us from asking again for the same pattern
    const conditions = JSON.parse(conditionsJson);
    const patternValue = conditions.conditions?.[0]?.value || 'unknown';

    return this.prisma.ruleSuggestion.create({
      data: {
        profileId,
        name: `User declined: ${patternValue}`,
        conditionsJson,
        categoryId,
        confidence: 0,
        matchCount: 0,
        similarityType: 'description',
        sampleTxIds: '[]',
        status: SuggestionStatus.REJECTED,
      },
    });
  }

  async applyToExisting(id: string) {
    const rule = await this.prisma.categorizationRule.findUnique({
      where: { id },
    });
    if (!rule) throw new NotFoundException('Rule not found');

    // Get all uncategorized transactions
    const transactions = await this.prisma.transaction.findMany({
      where: { categoryId: null },
      include: { account: true },
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
          data: updateData,
        });
        count++;
      }
    }

    // Update rule stats
    await this.prisma.categorizationRule.update({
      where: { id },
      data: {
        matchCount: { increment: count },
        lastMatched: new Date(),
      },
    });

    return {
      matchCount: count,
      matched: count, // Alias for compatibility
    };
  }

  async suggestRuleForTransaction(transactionId: string) {
    this.logger.log(`[suggestRuleForTransaction] Called for transaction ${transactionId}`);
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { category: true, account: true },
    });

    if (!transaction) {
      this.logger.log(`[suggestRuleForTransaction] Transaction not found`);
      return null;
    }

    if (!transaction.categoryId) {
      this.logger.log(`[suggestRuleForTransaction] Transaction has no category - cannot suggest`);
      return null;
    }

    this.logger.log(`[suggestRuleForTransaction] Transaction found with category ${transaction.categoryId}`);


    // Find similar transactions with same category
    const similarTransactions = await this.prisma.transaction.findMany({
      where: {
        categoryId: transaction.categoryId,
        NOT: { id: transactionId },
      },
      take: 100,
      orderBy: { date: 'desc' },
    });

    this.logger.log(`[suggestRuleForTransaction] Found ${similarTransactions.length} similar transactions`);
    
    if (similarTransactions.length < 3) {
      this.logger.log(`[suggestRuleForTransaction] Not enough similar transactions (need 3+)`);
      return null; // Not enough data
    }

    // Calculate similarity scores for different fields
    let descScore = 0;
    let notesScore = 0;
    let amountScore = 0;
    let merchantScore = 0;

    // Description similarity (check for common tokens)
    const stopWords = new Set([
      'purchase',
      'payment',
      'transfer',
      'withdrawal',
      'pos',
      'debit',
      'card',
      'date',
    ]);
    const descTokens = transaction.description
      .toLowerCase()
      .split(/[^a-z0-9]/)
      .filter((t) => t.length > 3 && !stopWords.has(t));

    this.logger.log(
      `[suggestRuleForTransaction] Description tokens (length > 3): ${descTokens.join(', ')}`,
    );

    // Find the BEST matching token (lowered from 70% to 40% for real-world data)
    let bestTokenFrequency = 0;
    let bestToken = '';
    for (const token of descTokens) {
      const matchCount = similarTransactions.filter((t) =>
        t.description.toLowerCase().includes(token),
      ).length;
      const frequency = matchCount / similarTransactions.length;
      if (frequency > bestTokenFrequency) {
        bestTokenFrequency = frequency;
        bestToken = token;
      }
    }

    // Use best token frequency as score, with minimum threshold of 40%
    if (bestTokenFrequency >= 0.4) {
      descScore = bestTokenFrequency * 100;
      this.logger.log(
        `[suggestRuleForTransaction] Best description token: "${bestToken}" (${bestTokenFrequency.toFixed(2)} frequency = ${descScore.toFixed(1)}%)`,
      );
    } else {
      this.logger.log(
        `[suggestRuleForTransaction] No description token met 40% threshold (best: "${bestToken}" at ${bestTokenFrequency.toFixed(2)})`,
      );
    }

    // Notes similarity
    if (transaction.notes) {
      const notesTokens = transaction.notes
        .toLowerCase()
        .split(/[^a-z0-9]/)
        .filter((t) => t.length > 3 && !stopWords.has(t));

      let bestNotesFrequency = 0;
      let bestNotesToken = '';
      for (const token of notesTokens) {
        const matchCount = similarTransactions.filter(
          (t) => t.notes && t.notes.toLowerCase().includes(token),
        ).length;
        const frequency = matchCount / similarTransactions.length;
        if (frequency > bestNotesFrequency) {
          bestNotesFrequency = frequency;
          bestNotesToken = token;
        }
      }

      if (bestNotesFrequency >= 0.4) {
        notesScore = bestNotesFrequency * 100;
        this.logger.log(
          `[suggestRuleForTransaction] Best notes token: "${bestNotesToken}" (${notesScore.toFixed(1)}%)`,
        );
      }
    }

    // Amount similarity (recurring amount)
    const amountStr = Number(transaction.amount).toFixed(2);
    const sameAmountCount = similarTransactions.filter(
      (t) => Number(t.amount).toFixed(2) === amountStr,
    ).length;
    amountScore = (sameAmountCount / similarTransactions.length) * 100;

    // Merchant similarity
    if (transaction.merchant) {
      const sameMerchantCount = similarTransactions.filter(
        (t) => t.merchant === transaction.merchant,
      ).length;
      merchantScore = (sameMerchantCount / similarTransactions.length) * 100;
    }

    // Weighted average - prioritize description/merchant more for rule creation
    // Description 50%, Amount 25%, Merchant 15%, Notes 10%
    const weightedConfidence =
      descScore * 0.5 +
      amountScore * 0.25 +
      merchantScore * 0.15 +
      notesScore * 0.1;

    this.logger.log(
      `[suggestRuleForTransaction] Confidence scores - desc: ${descScore.toFixed(1)}%, notes: ${notesScore.toFixed(1)}%, amount: ${amountScore.toFixed(1)}%, merchant: ${merchantScore.toFixed(1)}%, weighted: ${weightedConfidence.toFixed(1)}%`,
    );

    // Only suggest if confidence >= 40% (realistic threshold for real-world patterns)
    if (weightedConfidence < 40) {
      this.logger.log(
        `[suggestRuleForTransaction] Confidence too low (${weightedConfidence.toFixed(1)}% < 40%), not suggesting`,
      );
      return null;
    }

    this.logger.log(
      `[suggestRuleForTransaction] Confidence sufficient (${weightedConfidence.toFixed(1)}% >= 40%), proceeding to build conditions`,
    );

    // Build conditions based on what had high confidence
    const conditions: any[] = [];

    // Add best matching description token (use the token we already found above)
    if (descScore >= 40 && bestToken) {
      this.logger.log(
        `[suggestRuleForTransaction] Adding description condition: "${bestToken}"`,
      );
      conditions.push({
        field: 'description',
        operator: 'contains',
        value: bestToken,
        caseSensitive: false,
      });
    } else if (descScore < 40) {
      this.logger.log(
        `[suggestRuleForTransaction] Description score too low (${descScore.toFixed(1)}% < 40%)`,
      );
    }

    // Add amount if highly consistent (lowered from 80% to 70%)
    if (amountScore >= 70) {
      this.logger.log(
        `[suggestRuleForTransaction] Adding amount condition: ${Number(transaction.amount)}`,
      );
      conditions.push({
        field: 'amount',
        operator: 'equals',
        value: Number(transaction.amount),
      });
    }

    // Add merchant if highly consistent (lowered from 80% to 70%)
    if (merchantScore >= 70 && transaction.merchant) {
      this.logger.log(
        `[suggestRuleForTransaction] Adding merchant condition: ${transaction.merchant}`,
      );
      conditions.push({
        field: 'merchant',
        operator: 'equals',
        value: transaction.merchant,
      });
    }

    this.logger.log(
      `[suggestRuleForTransaction] Built ${conditions.length} condition(s)`,
    );

    if (conditions.length === 0) {
      this.logger.log(
        `[suggestRuleForTransaction] No conditions met threshold, not suggesting`,
      );
      return null; // No good conditions found
    }

    const conditionsJson = JSON.stringify({
      operator: 'AND',
      conditions,
    });

    // Check if this pattern was already rejected by the user
    const rejectedSuggestions = await this.prisma.ruleSuggestion.findMany({
      where: {
        status: SuggestionStatus.REJECTED,
        categoryId: transaction.categoryId,
      },
    });

    for (const rejected of rejectedSuggestions) {
      const rejectedNormalized = this.normalizeConditionsForComparison(
        JSON.parse(rejected.conditionsJson),
      );
      const currentNormalized = this.normalizeConditionsForComparison(
        JSON.parse(conditionsJson),
      );

      if (rejectedNormalized === currentNormalized) {
        this.logger.log(
          `Skipping suggestion - user previously rejected this pattern`,
        );
        return null; // Don't suggest if user already rejected it
      }
    }

    // Check if a similar rule already exists
    const existingRules = await this.prisma.categorizationRule.findMany({
      where: { categoryId: transaction.categoryId },
      select: { conditionsJson: true },
    });

    for (const rule of existingRules) {
      const ruleNormalized = this.normalizeConditionsForComparison(
        JSON.parse(rule.conditionsJson),
      );
      const currentNormalized = this.normalizeConditionsForComparison(
        JSON.parse(conditionsJson),
      );

      if (ruleNormalized === currentNormalized) {
        this.logger.log(`Skipping suggestion - similar rule already exists`);
        return null; // Don't suggest if rule already exists
      }
    }

    // Return suggestion (not saved to DB, just returned for UI)
    this.logger.log(`[suggestRuleForTransaction] Returning suggestion with ${conditions.length} conditions, confidence: ${Math.round(weightedConfidence)}`);
    return {
      name: `Auto-categorize as ${transaction.category?.name || 'Unknown'}`,
      conditionsJson,
      categoryId: transaction.categoryId,
      confidence: Math.round(weightedConfidence),
      matchCount: similarTransactions.length,
      category: transaction.category || undefined,
    };
  }
}
