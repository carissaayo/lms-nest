import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsPositive,
  MinLength,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
} from 'class-validator';

export enum CourseCategory {
  DEVELOPMENT = 'Development',
  BUSINESS = 'Business',
  FINANCE_ACCOUNTING = 'Finance & Accounting',
  IT_SOFTWARE = 'IT & Software',
  OFFICE_PRODUCTIVITY = 'Office Productivity',
  PERSONAL_DEVELOPMENT = 'Personal Development',
  DESIGN = 'Design',
  MARKETING = 'Marketing',
  LIFESTYLE = 'Lifestyle',
  PHOTOGRAPHY_VIDEO = 'Photography & Video',
  HEALTH_FITNESS = 'Health & Fitness',
  MUSIC = 'Music',
  TEACHING_ACADEMICS = 'Teaching & Academics',
}

export class CreateCourseDTO {
  @IsString()
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString()
  @MinLength(30, { message: 'Title must be at least 30 characters long' })
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'category is required' })
  category!: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty({ message: 'price is required' })
  @Type(() => Number)
  price!: number;
}

export class UpdateCourseDTO {
  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(30, { message: 'Description must be at least 30 characters long' })
  description?: string;

  @IsUUID()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  price?: number;
}

export enum ApprovalStatus {
  APPROVE = 'approve',
  REJECT = 'reject',
}
export class ApproveCourseDTO {
  @IsString()
  @IsNotEmpty()
  @IsEnum(ApprovalStatus, {
    message: 'Action must be either approve or reject',
  })
  action: ApprovalStatus;

  @ValidateIf((o) => o.action === ApprovalStatus.REJECT)
  @IsString()
  @IsNotEmpty({
    message: 'Rejection reason is required when rejecting a course',
  })
  rejectReason?: string;
}
