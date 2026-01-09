import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { RuleMode } from '../../generated/client';

export class CreateRuleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsEnum(RuleMode)
  mode: RuleMode;

  @IsString()
  conditionsJson: string; // Validated JSON structure
}
