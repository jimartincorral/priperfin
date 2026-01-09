import { IsInt, IsOptional, IsString } from 'class-validator';

export class TestRuleDto {
  @IsString()
  conditionsJson: string;

  @IsOptional()
  @IsInt()
  limit?: number;
}
