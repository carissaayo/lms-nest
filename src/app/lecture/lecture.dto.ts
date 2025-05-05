import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLectureDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsMongoId()
  video: string;

  @IsOptional()
  @IsMongoId()
  notes?: string;

  @IsNumber()
  duration: number;

  @IsMongoId()
  course: string;

  @IsMongoId()
  instructor: string;
}
