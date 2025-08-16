// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Course } from './course.entity';
// import { User } from '../user/user.entity';
// import { Lesson } from '../lesson/lesson.entity';
// import { Category } from '../database/main.entity';
// import { CreateCourseDTO } from './course.dto';
// import { CustomRequest } from 'src/utils/auth-utils';
// import { customError } from 'libs/custom-handlers';
// import { singleImageValidation } from 'src/utils/file-validation';
// import { saveImageS3 } from '../fileUpload/image-upload.service';

// @Injectable()
// export class CourseService {
//   constructor(
//     @InjectRepository(User)
//     private readonly userRepo: Repository<User>,
//     @InjectRepository(Category)
//     private readonly categoryRepo: Repository<Category>,
//   ) {}

//   /**
//    * Create a new course
//    */
//   async createCategories(req: CustomRequest) {
//     if (!createCourseDto) {
//       throw customError.badRequest('body is missing');
//     }

//     console.log(coverImage);

//     const { title, description, category, price } = createCourseDto;

//     if (!coverImage) {
//       throw customError.badRequest('coverImage is required found');
//     }
//     const instructor = await this.userRepo.findOne({
//       where: { id: req.userId },
//     });
//     if (!instructor) {
//       throw customError.notFound('Instructor not found');
//     }

//     let categoryEntity: Category | undefined;
//     if (category) {
//       const categoryEntity = await this.categoryRepo.findOne({
//         where: { id: category },
//       });
//       if (!categoryEntity) {
//         throw new NotFoundException('Category not found');
//       }
//     }

//     if (coverImage) {
//       singleImageValidation(coverImage, 'a cover image for the course');
//     }

//     let uploadImg: string | undefined;

//     if (coverImage) {
//       const path = `images/courses`;
//       uploadImg = await saveImageS3(coverImage, path);
//     }

//     if (!uploadImg || uploadImg?.length <= 0) {
//       throw customError.badRequest('Invalid cover Image');
//     }

//     const course = this.courseRepo.create({
//       title,
//       description,
//       category: categoryEntity,
//       price,
//       instructor,
//       coverImage: uploadImg,
//     });

//     await this.courseRepo.save(course);
//     return {
//       accessToken: req.token,
//       course: course,
//       message: 'Course created successfully',
//     };
//   }
// }
