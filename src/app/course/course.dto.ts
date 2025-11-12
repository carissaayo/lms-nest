import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  MinLength,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { CourseStatus } from '../models/course.schema';
import { CourseCategory } from './course.interface';

export class CreateCourseDTO {
  @IsString()
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString()
  @MinLength(30, { message: 'Description must be at least 10 characters long' })
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @IsEnum(CourseCategory)
  @IsNotEmpty({ message: 'category is required' })
  category!: CourseCategory;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty({ message: 'price is required' })
  @Type(() => Number)
  price!: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty({ message: 'Duration is required' })
  @Type(() => Number)
  duration!: number;
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

  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  duration?: number;
}

export class AdminCourseActionDTO {
  @IsEnum(CourseStatus, {
    message: 'Action must be one of: approved, pending, suspended, rejected',
  })
  action: CourseStatus;

  @ValidateIf((o) => o.status === CourseStatus.REJECTED)
  @IsString()
  @IsNotEmpty({
    message: 'Rejection reason is required when rejecting a course',
  })
  rejectReason?: string;

  @ValidateIf((o) => o.status === CourseStatus.SUSPENDED)
  @IsString()
  @IsNotEmpty({
    message: 'Suspension reason is required when suspending a course',
  })
  suspendReason?: string;
}
