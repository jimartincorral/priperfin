import { IsString } from 'class-validator';

export class MergeInstruction {
  @IsString()
  manualId: string;

  @IsString()
  importedTempId: string;
}
