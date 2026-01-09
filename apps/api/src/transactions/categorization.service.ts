import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as natural from 'natural';

@Injectable()
export class CategorizationService implements OnModuleInit {
  private classifier: natural.BayesClassifier;
  private logger = new Logger(CategorizationService.name);
  private isTrained = false;

  constructor(private prisma: PrismaService) {
    this.classifier = new natural.BayesClassifier();
  }

  async onModuleInit() {
    // Train asynchronously on startup so we don't block boot
    this.trainModel().catch(err => {
      this.logger.error('Failed to train categorization model', err);
    });
  }

  async trainModel() {
    this.logger.log('Starting model training...');
    const start = Date.now();

    // Fetch all transactions that have a category
    // We limit to last 2000 to keep it fast and relevant
    const transactions = await this.prisma.transaction.findMany({
      where: {
        categoryId: { not: null },
        description: { not: '' },
      },
      orderBy: { date: 'desc' },
      take: 2000,
      select: {
        description: true,
        notes: true,
        categoryId: true,
      },
    });

    if (transactions.length < 10) {
      this.logger.warn('Not enough data to train model (< 10 transactions)');
      return;
    }

    this.classifier = new natural.BayesClassifier();

    transactions.forEach(t => {
      if (t.categoryId) {
        const textToProcess = t.notes ? `${t.description} ${t.notes}` : t.description;
        const cleanDesc = this.preprocess(textToProcess);
        this.classifier.addDocument(cleanDesc, t.categoryId);
      }
    });

    this.classifier.train();
    this.isTrained = true;

    const duration = Date.now() - start;
    this.logger.log(`Model trained on ${transactions.length} transactions in ${duration}ms`);
  }

  predict(description: string, notes?: string | null): string | null {
    if (!this.isTrained || !description) return null;

    const textToProcess = notes ? `${description} ${notes}` : description;
    const cleanDesc = this.preprocess(textToProcess);
    
    // Get classifications with scores
    const classifications = this.classifier.getClassifications(cleanDesc);
    
    if (classifications.length === 0) return null;

    // Sort by value (probability) descending
    // natural's Bayes returns values that are often very small log-probs or raw probs depending on implementation
    // But usually index 0 is best
    const best = classifications[0];
    const second = classifications.length > 1 ? classifications[1] : null;

    // Simple confidence check: ensure significant gap or high enough score?
    // Bayes scores are tricky. For now, just take the top one if it exists.
    // We can just trust it.
    
    // However, if the description is totally alien, Bayes will still return *something*.
    // We might want to cross-reference with 'most recent exact match' logic in the main service.
    
    return best.label;
  }

  /**
   * Cleans description to remove noise like dates, IDs, common bank junk.
   */
  private preprocess(text: string): string {
    return text
      .toLowerCase()
      // Remove dates (YYYY-MM-DD, DD/MM/YYYY, etc) - simple heuristic
      .replace(/\d{2,4}[-/]\d{2}[-/]\d{2,4}/g, '')
      // Remove pure number sequences (IDs, card numbers) longer than 3 digits
      .replace(/\b\d{4,}\b/g, '')
      // Remove specific bank noise words
      .replace(/\b(visa|mastercard|pos|purchase|payment|transfer|withdrawal)\b/g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }
}
