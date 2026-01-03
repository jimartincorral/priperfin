import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AccountType } from '../../generated/client';

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
