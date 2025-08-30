"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const email_service_1 = require("../email/email.service");
const course_entity_1 = require("./course.entity");
const user_entity_1 = require("../user/user.entity");
const main_entity_1 = require("../database/main.entity");
const custom_handlers_1 = require("../../../libs/custom-handlers");
const file_validation_1 = require("../../utils/file-validation");
const image_upload_service_1 = require("../fileUpload/image-upload.service");
const dbquery_1 = require("../database/dbquery");
let CourseService = class CourseService {
    constructor(courseRepo, userRepo, categoryRepo, emailService) {
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.categoryRepo = categoryRepo;
        this.emailService = emailService;
    }
    async createCourse(createCourseDto, coverImage, req) {
        if (!createCourseDto) {
            throw custom_handlers_1.customError.badRequest('body is missing');
        }
        const { title, description, category, price } = createCourseDto;
        if (!coverImage) {
            throw custom_handlers_1.customError.badRequest('coverImage is required found');
        }
        const instructor = await this.userRepo.findOne({
            where: { id: req.userId },
        });
        if (!instructor) {
            throw custom_handlers_1.customError.notFound('Instructor not found');
        }
        let categoryEntity;
        if (category) {
            const found = await this.categoryRepo.findOne({
                where: { id: category },
            });
            if (!found) {
                throw new common_1.NotFoundException('Category not found');
            }
            categoryEntity = found;
        }
        (0, file_validation_1.singleImageValidation)(coverImage, 'a cover image for the course');
        const uploadImg = await (0, image_upload_service_1.saveImageS3)(coverImage, `images/courses`);
        if (!uploadImg || uploadImg.length <= 0) {
            throw custom_handlers_1.customError.badRequest('Invalid cover Image');
        }
        const course = this.courseRepo.create({
            title,
            description,
            category: categoryEntity,
            price,
            instructor,
            coverImage: uploadImg,
            instructorId: instructor.id,
            categoryId: category,
            categoryName: categoryEntity?.name,
            instructorName: `${instructor.firstName} ${instructor.lastName}`,
        });
        await this.courseRepo.save(course);
        await this.emailService.courseCreation(instructor.email, instructor.firstName, course.title);
        return {
            accessToken: req.token,
            course,
            message: 'Course created successfully',
        };
    }
    async updateCourse(courseId, updateCourseDto, coverImage, req) {
        if (!updateCourseDto && !coverImage) {
            throw custom_handlers_1.customError.badRequest('No update data provided');
        }
        const course = await this.courseRepo.findOne({
            where: { id: courseId },
            relations: ['instructor', 'category'],
        });
        if (!course) {
            throw custom_handlers_1.customError.notFound('Course not found');
        }
        if (course.instructor.id !== req.userId) {
            throw custom_handlers_1.customError.forbidden('You can only update your  course');
        }
        const { title, description, category, price } = updateCourseDto || {};
        if (category) {
            const foundCategory = await this.categoryRepo.findOne({
                where: { id: category },
            });
            if (!foundCategory) {
                throw custom_handlers_1.customError.notFound('Category not found');
            }
            course.category = foundCategory;
        }
        if (coverImage) {
            (0, file_validation_1.singleImageValidation)(coverImage, 'a cover image for the course');
            if (course.coverImage) {
                try {
                    await (0, image_upload_service_1.deleteImageS3)(course.coverImage);
                }
                catch (err) {
                    console.warn(' Failed to delete old cover image:', err.message);
                }
            }
            const uploadImg = await (0, image_upload_service_1.saveImageS3)(coverImage, `images/courses`);
            if (!uploadImg || uploadImg.length <= 0) {
                throw custom_handlers_1.customError.badRequest('Invalid cover image');
            }
            course.coverImage = uploadImg;
        }
        if (title)
            course.title = title;
        if (description)
            course.description = description;
        if (price !== undefined)
            course.price = price;
        if (course.isSubmitted)
            course.isSubmitted = false;
        if (course.submittedAt)
            course.submittedAt = undefined;
        course.status = course_entity_1.CourseStatus.PENDING;
        await this.courseRepo.save(course);
        const instructor = course.instructor;
        await this.emailService.courseUpdating(instructor.email, instructor.firstName, course.title);
        return {
            accessToken: req.token,
            course,
            message: 'Course updated successfully',
        };
    }
    async viewCourses(query) {
        const baseQuery = this.courseRepo
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.category', 'category')
            .leftJoinAndSelect('course.lessons', 'lessons')
            .leftJoinAndSelect('lessons.assignments', 'assignments');
        const dbQuery = new dbquery_1.DBQuery(baseQuery, 'course', query);
        dbQuery.filter().sort().limitFields().paginate();
        if (query.categoryId && (0, class_validator_1.isUUID)(query.categoryId)) {
            dbQuery.query.andWhere('course.category_id = :categoryId', {
                categoryId: query.categoryId,
            });
        }
        if (query.category && !(0, class_validator_1.isUUID)(query.category)) {
            dbQuery.query.andWhere('category.name ILIKE :categoryName', {
                categoryName: `%${query.category}%`,
            });
        }
        if (query.price) {
            dbQuery.query.andWhere('course.price = :price', {
                price: query.price,
            });
        }
        if (query.minPrice) {
            dbQuery.query.andWhere('course.price >= :minPrice', {
                minPrice: query.minPrice,
            });
        }
        if (query.maxPrice) {
            dbQuery.query.andWhere('course.price <= :maxPrice', {
                maxPrice: query.maxPrice,
            });
        }
        if (query.status) {
            dbQuery.query.andWhere('course.status = :status', {
                status: query.status,
            });
        }
        const [courses, total] = await Promise.all([
            dbQuery.getMany(),
            dbQuery.count(),
        ]);
        return {
            page: dbQuery.page,
            results: total,
            courses: courses,
            message: 'Courses fetched successfully',
        };
    }
    async deleteCourse(courseId, req) {
        const course = await this.courseRepo.findOne({
            where: { id: courseId, deleted: false },
            relations: ['instructor'],
        });
        if (!course) {
            throw custom_handlers_1.customError.notFound('Course not found');
        }
        if (course.instructor.id !== req.userId) {
            throw custom_handlers_1.customError.forbidden('You can only delete your courses');
        }
        course.deleted = true;
        await this.courseRepo.save(course);
        await this.courseRepo.save(course);
        const instructor = course.instructor;
        await this.emailService.courseDeletion(instructor.email, instructor.firstName, course.title);
        return {
            message: 'Course deleted successfully',
        };
    }
    async submitCourse(courseId, req) {
        const course = await this.courseRepo.findOne({
            where: { id: courseId },
            relations: ['instructor'],
        });
        if (!course) {
            throw custom_handlers_1.customError.notFound('Course not found');
        }
        if (course.deleted)
            throw custom_handlers_1.customError.notFound('Course has been deleted');
        if (course.instructor.id !== req.userId) {
            throw custom_handlers_1.customError.forbidden('You can only delete your courses');
        }
        if (course.isSubmitted) {
            throw custom_handlers_1.customError.forbidden('This course has already been submitted');
        }
        if (course.status !== course_entity_1.CourseStatus.PENDING) {
            throw custom_handlers_1.customError.forbidden('This course can not be submitted');
        }
        try {
            course.isSubmitted = true;
            course.submittedAt = new Date();
            await this.courseRepo.save(course);
            const instructor = course.instructor;
            await this.emailService.courseSubmission(instructor.email, instructor.firstName, course.title);
            return {
                message: 'Course submitted successfully',
                accessToken: req.token,
                course,
            };
        }
        catch (error) {
            console.log(error);
            throw new Error(error.message || 'Internal Server Error');
        }
    }
    async publishCourse(courseId, req) {
        const course = await this.courseRepo.findOne({
            where: { id: courseId },
            relations: ['instructor'],
        });
        if (!course) {
            throw custom_handlers_1.customError.notFound('Course not found');
        }
        if (course.deleted)
            throw custom_handlers_1.customError.notFound('Course has been deleted');
        if (course.instructor.id !== req.userId) {
            throw custom_handlers_1.customError.forbidden('You can only publish your courses');
        }
        if (course.status !== course_entity_1.CourseStatus.APPROVED) {
            throw custom_handlers_1.customError.forbidden('This course has to be approved first');
        }
        try {
            course.isPublished = true;
            course.publishedAt = new Date();
            await this.courseRepo.save(course);
            const instructor = course.instructor;
            await this.emailService.coursePublish(instructor.email, instructor.firstName, course.title);
            return {
                message: 'Course submitted successfully',
                accessToken: req.token,
                course,
            };
        }
        catch (error) {
            console.log(error);
            throw new Error(error.message || 'Internal Server Error');
        }
    }
};
exports.CourseService = CourseService;
exports.CourseService = CourseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(main_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], CourseService);
//# sourceMappingURL=course.service.js.map