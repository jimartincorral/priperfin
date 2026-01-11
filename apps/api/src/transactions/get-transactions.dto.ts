import {
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DateFilterMode {
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
  ALL_TIME = 'all_time',
}

export class GetTransactionsDto {
  @IsOptional()
  @IsEnum(DateFilterMode)
  filterMode?: DateFilterMode;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(2000)
  year?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}
