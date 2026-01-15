import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class ChangePinDto {
  @IsString()
  @IsNotEmpty()
  oldPin: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(6)
  @Matches(/^\d+$/, {
    message: 'PIN must contain only digits',
  })
  newPin: string;
}
