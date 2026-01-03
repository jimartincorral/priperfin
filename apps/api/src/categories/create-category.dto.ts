import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber } from 'class-validator';
import { CategoryType } from '../../generated/client';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  // Color is optional now
  color?: string;

  @IsString()
  icon: string;

  @IsOptional()
  @IsNumber()
  budget?: number | null;

  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @IsOptional()
  @IsString()
  parentId?: string;
}
