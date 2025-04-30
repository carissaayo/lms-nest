import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
} from 'class-validator';

export class AccountNumberDto {
  @IsNotEmpty()
  account_number: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  bank_code: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(11)
  phone?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
