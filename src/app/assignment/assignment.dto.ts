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
  title: string;

  @IsUUID()
  @IsNotEmpty({ message: 'lessonId is required' })
  lessonId: string;

  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description: string;
}

export class UpdateAssignmentDTO {
  @MinLength(10, { message: 'Title must be at least 10 characters long' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title?: string;

  @IsUUID()
  //   @IsNotEmpty({ message: 'lessonId is required' })
  //   lessonId: string;
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description?: string;
}
