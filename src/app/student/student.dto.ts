import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  MinLength,
} from 'class-validator';

export class UpdateLessonProgressDTO {
  @IsNotEmpty({ message: 'watchedDuration is required' })
  watchedDuration: number;

  @IsNumber()
  @IsNotEmpty({ message: 'videoDuration is required' })
  videoDuration: number;
}
