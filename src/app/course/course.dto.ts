import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsPositive,
  MinLength,
  IsNotEmpty,
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

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;
}
