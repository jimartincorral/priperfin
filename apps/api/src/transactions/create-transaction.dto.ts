import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreateTransactionDto {
  @IsDateString()
  date: string;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @ValidateIf((object, value) => value !== null)
  @IsUUID()
  categoryId?: string | null;

  @ValidateIf((object, value) => value !== null)
  @IsUUID()
  costObjectId?: string | null;

  @ValidateIf((object, value) => value !== null)
  @IsUUID()
  accountId?: string | null;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  isTransfer?: boolean;

  @IsOptional()
  @IsString()
  transferId?: string | null;

  @ValidateIf((object, value) => value !== null)
  @IsUUID()
  transferAccountId?: string | null;
}
