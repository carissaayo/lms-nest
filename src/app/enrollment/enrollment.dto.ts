import { Type } from 'class-transformer';
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
export class EnrollStudentAfterPayment {
  @IsUUID()
  @IsNotEmpty({ message: 'StudentId is required' })
  studentId!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'courseId is required' })
  courseId!: string;

  @IsString()
  @IsNotEmpty({ message: 'reference is required' })
  reference!: string;
}
