import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  initialBalance?: number;

  @IsOptional()
  @IsEnum(AccountType)
  type?: AccountType;
}
