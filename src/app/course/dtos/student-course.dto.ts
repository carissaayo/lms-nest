
import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class GetInstructorCourseDto {
  @IsString()
  @IsNotEmpty()
  instructorId!: string;
}