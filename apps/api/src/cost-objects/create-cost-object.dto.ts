import { IsString, IsOptional } from 'class-validator';

export class CreateCostObjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsString()
  icon: string;
}
