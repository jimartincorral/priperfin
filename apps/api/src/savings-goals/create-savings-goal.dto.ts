import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateSavingsGoalDto {
  @IsString()
  name: string;

  @IsNumber()
  targetAmount: number;

  @IsDateString()
  targetDate: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsNumber()
  savedAmount?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
