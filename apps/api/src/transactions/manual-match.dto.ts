export class ManualMatchDto {
  manualId: string;           // Manual transaction ID
  importedTempId: string;     // Temporary ID for imported transaction (index in array)
  manualDate: string;
  importedDate: string;
  manualAmount: number;
  importedAmount: number;
  manualDescription: string;
  importedDescription: string;
  manualCategoryId: string | null;
  importedCategoryId: string | null;
  manualNotes: string | null;
  importedNotes: string | null;
  matchScore: number;         // 0-100 confidence score
}
