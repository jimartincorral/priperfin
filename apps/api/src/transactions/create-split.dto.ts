import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionSplitDto {
  @IsNumber()
  amount: number;

  @ValidateIf((object, value) => value !== null)
  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @ValidateIf((object, value) => value !== null)
  @IsUUID()
  @IsOptional()
  costObjectId?: string | null;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateSplitsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionSplitDto)
  splits: CreateTransactionSplitDto[];
}
