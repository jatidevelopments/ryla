import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserByEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  publicName!: string;
}

