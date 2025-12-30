import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsString, IsOptional, ValidateIf, IsUUID } from 'class-validator';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  categoryId?: string | null;

  @IsOptional()
  costObjectId?: string | null;
}
