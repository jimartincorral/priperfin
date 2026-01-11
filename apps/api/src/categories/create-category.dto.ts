import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { CategoryType } from '../generated/client';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  // Color is optional now
  color?: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @IsOptional()
  @IsString()
  parentId?: string;
}
