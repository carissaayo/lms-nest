import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateAssignmentDTO {
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'lessonId is required' })
  lessonId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description?: string;
}

export class UpdateAssignmentDTO {
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  description?: string;
}
