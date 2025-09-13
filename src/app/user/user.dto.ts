import { IsNotEmpty, IsOptional, IsEmail, IsString } from 'class-validator';

export class AccountNumberDto {
  @IsNotEmpty()
  account_number: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  bank_code: string;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
