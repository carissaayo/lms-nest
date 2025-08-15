import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../user/user.entity';
import { MatchesProperty } from '../common/validators/matches-property.validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'First Name is required' })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Last Name is required' })
  lastName!: string;

  @IsString()
  @IsOptional()
  otherName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone Number is required' })
  phoneNumber!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @MatchesProperty('password', { message: 'Passwords do not match' })
  @IsNotEmpty({ message: 'Please confirm your password' })
  confirmPassword!: string;

  @IsNotEmpty({ message: 'role is required' })
  @IsString()
  role: UserRole;
}

export class LoginDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}

export class VerifyEmailDTO {
  @IsNotEmpty({ message: 'Please enter the verification code' })
  emailCode!: string;
}

export class RequestResetPasswordDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
}
export class ResetPasswordDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password Reset code is required' })
  passwordResetCode!: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  newPassword!: string;

  @MatchesProperty('newPassword', { message: 'Passwords do not match' })
  @IsNotEmpty({ message: 'Please confirm your password' })
  confirmNewPassword!: string;
}

export class ChangePasswordDTO {
  @IsNotEmpty({ message: 'Current password is required' })
  password!: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'New password is required' })
  newPassword!: string;

  @MatchesProperty('newPassword', { message: 'Passwords do not match' })
  @IsNotEmpty({ message: 'Please confirm your new password' })
  confirmNewPassword!: string;
}
