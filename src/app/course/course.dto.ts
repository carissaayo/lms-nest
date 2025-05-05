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
import { Types } from 'mongoose';

class ImageDto {
  @IsString()
  url: string;

  @IsString()
  imageName: string;

  @IsOptional()
  @IsString()
  caption?: string;
}

export class UpdateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  duration: number;

  @IsString()
  category: string;

  @IsNumber()
  price: number;

  @ValidateNested()
  @Type(() => ImageDto)
  image: ImageDto;

  @IsOptional()
  @IsMongoId({ each: true })
  lectures?: Types.ObjectId[];

  @IsOptional()
  @IsMongoId()
  quizz?: Types.ObjectId;

  @IsString()
  caption: string;
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
  instructor: Types.ObjectId;

  @IsString()
  category: string;

  @IsNumber()
  price: number;

  @ValidateNested()
  @Type(() => ImageDto)
  image: ImageDto;

  @IsOptional()
  @IsMongoId({ each: true })
  lectures?: Types.ObjectId[];

  @IsOptional()
  @IsMongoId()
  quizz?: Types.ObjectId;

  @IsString()
  caption: string;
}
