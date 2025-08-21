import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateLessonDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsNotEmpty()
  courseId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;
}

export class UpdateLessonDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;
}
