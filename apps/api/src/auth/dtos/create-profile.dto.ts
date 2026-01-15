import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Profile name can only contain letters, numbers, and spaces',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(6)
  @Matches(/^\d+$/, {
    message: 'PIN must contain only digits',
  })
  pin: string;
}
