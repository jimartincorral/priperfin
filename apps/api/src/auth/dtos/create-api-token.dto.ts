import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateApiTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: string;
}
