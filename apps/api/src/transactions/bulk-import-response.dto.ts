import { ManualMatchDto } from './manual-match.dto';

export class BulkImportResponseDto {
  newCount: number;                    // Transactions ready to import (no conflicts)
  duplicateCount: number;              // Imported-vs-Imported duplicates
  duplicates: Array<{                  // Imported-vs-Imported
    date: string;
    amount: number;
    description: string;
    externalId: string;
  }>;
  manualMatchCount: number;            // Manual-vs-Imported matches found
  manualMatches: ManualMatchDto[];     // Potential merges
}
