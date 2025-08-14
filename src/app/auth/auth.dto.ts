import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
} from 'class-validator';
import { UserRole } from '../user/user.entity';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  role: UserRole;

  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  password: string;

  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class LoginDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class VerifyEmailDTO {
  @IsNotEmpty({ message: 'Please enter the verification code' })
  emailCode!: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  confirmNewPassword: string;

  @IsNotEmpty()
  @IsString()
  currentPassword: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  confirmNewPassword: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
