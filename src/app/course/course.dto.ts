import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  MinLength,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
  IsArray,
} from 'class-validator';

import { CourseCategory } from './course.interface';
import { CourseLanguage, CourseLevel, CourseStatus } from 'src/models/course.schema';

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

  @IsEnum(CourseLanguage)
  @IsNotEmpty({ message: 'Language is required' })
  language!: CourseLanguage;

  @IsEnum(CourseLevel)
  @IsNotEmpty({ message: 'Level is required' })
  level!: CourseLevel;

  @IsArray()
  @IsNotEmpty({ message: 'learningOutcomes array is required' })
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  learningOutcomes: string[];

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  tags: string[];

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  requirements: string[];

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
