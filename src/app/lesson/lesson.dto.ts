import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateLessonDTO {
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title!: string;

  @IsNotEmpty({ message: 'courseId is required' })
  courseId!: string;

  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description!: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty({ message: 'duration is required' })
  @Type(() => Number)
  duration!: number;
}

export class UpdateLessonDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty({ message: 'duration is required' })
  @Type(() => Number)
  duration?: number;
}
