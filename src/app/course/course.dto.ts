import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsBoolean,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImageDto {
  @IsString()
  url: string;

  @IsString()
  imageName: string;

  @IsOptional()
  @IsString()
  caption?: string;
}

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsMongoId()
  instructor: string;

  @IsString()
  category: string;

  @IsNumber()
  price: number;

  @ValidateNested()
  @Type(() => ImageDto)
  image: ImageDto;

  @IsOptional()
  @IsMongoId({ each: true })
  lectures?: string[];

  @IsOptional()
  @IsMongoId()
  quizz?: string;
}
