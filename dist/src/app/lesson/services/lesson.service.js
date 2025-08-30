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
exports.LessonService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const lesson_entity_1 = require("../lesson.entity");
const course_entity_1 = require("../../course/course.entity");
const image_upload_service_1 = require("../../fileUpload/image-upload.service");
const user_entity_1 = require("../../user/user.entity");
const email_service_1 = require("../../email/email.service");
const dbquery_1 = require("../../database/dbquery");
let LessonService = class LessonService {
    constructor(lessonRepo, courseRepo, userRepo, emailService) {
        this.lessonRepo = lessonRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.emailService = emailService;
    }
    async createLesson(dto, files, req) {
        const { courseId } = dto;
        const instructor = await this.userRepo.findOne({
            where: { id: req.userId },
        });
        if (!instructor) {
            throw custom_handlers_1.customError.notFound('Instructor not found');
        }
        if (!instructor.isActive) {
            throw custom_handlers_1.customError.notFound('Your account has been suspended');
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
        let videoUrl = undefined;
        let noteUrl = undefined;
        try {
            console.log('files======', files);
            if (files.video && files.video.length > 0) {
                const videoFile = files.video[0];
                videoUrl = await (0, image_upload_service_1.saveFileS3)(videoFile, `lessons/${courseId}/videos/`);
            }
            if (files.note && files.note.length > 0) {
                const noteFile = files.note[0];
                noteUrl = await (0, image_upload_service_1.saveFileS3)(noteFile, `lessons/${courseId}/notes/`);
            }
            console.log('videoUrl======', videoUrl);
            console.log('noteUrl======', noteUrl);
            const lastLesson = await this.lessonRepo.findOne({
                where: { course: { id: dto.courseId } },
                order: { position: 'DESC' },
            });
            const nextPosition = lastLesson ? lastLesson.position + 1 : 1;
            const lesson = this.lessonRepo.create({
                ...dto,
                videoUrl,
                noteUrl,
                course: { id: courseId },
                position: nextPosition,
            });
            course.status = course_entity_1.CourseStatus.PENDING;
            await this.lessonRepo.save(lesson);
            await this.courseRepo.save(course);
            await this.emailService.LessonCreation(instructor.email, instructor.firstName, course.title, lesson.title);
            return {
                accessToken: req.token,
                message: 'Lesson has been created successfully',
                lesson,
                course,
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError(error.message || '', error.statusCOde || 500);
        }
    }
    async updateLesson(dto, files, req, lessonId) {
        console.log('lessonId===', lessonId);
        const lesson = await this.lessonRepo.findOne({
            where: { id: lessonId },
        });
        if (!lesson) {
            throw custom_handlers_1.customError.notFound('Lesson not found');
        }
        const instructor = await this.userRepo.findOne({
            where: { id: req.userId },
        });
        if (!instructor) {
            throw custom_handlers_1.customError.notFound('Instructor not found');
        }
        if (!instructor.isActive) {
            throw custom_handlers_1.customError.notFound('Your account has been suspended');
        }
        const course = await this.courseRepo.findOne({
            where: { id: lesson.courseId },
            relations: ['instructor', 'category'],
        });
        if (!course) {
            throw custom_handlers_1.customError.notFound('Course not found');
        }
        if (course.instructor.id !== req.userId) {
            throw custom_handlers_1.customError.forbidden('You can only update your  course');
        }
        let videoUrl = undefined;
        let noteUrl = undefined;
        try {
            console.log('files======', files);
            if (files && files.video && files.video.length > 0) {
                if (lesson.videoUrl) {
                    try {
                        await (0, image_upload_service_1.deleteFileS3)(lesson.videoUrl);
                    }
                    catch (err) {
                        console.warn(' Failed to delete old video:', err.message);
                    }
                }
                const videoFile = files.video[0];
                videoUrl = await (0, image_upload_service_1.saveFileS3)(videoFile, `lessons/${lesson.courseId}/videos/`);
                lesson.videoUrl = videoUrl;
            }
            if (files && files.note && files.note.length > 0) {
                if (lesson.noteUrl) {
                    try {
                        await (0, image_upload_service_1.deleteFileS3)(lesson.noteUrl);
                    }
                    catch (err) {
                        console.warn(' Failed to delete old note:', err.message);
                    }
                }
                const noteFile = files.note[0];
                noteUrl = await (0, image_upload_service_1.saveFileS3)(noteFile, `lessons/${lesson.courseId}/notes/`);
                lesson.noteUrl = noteUrl;
            }
            console.log('videoUrl======', videoUrl);
            console.log('noteUrl======', noteUrl);
            if (dto.title) {
                lesson.title = dto.title;
            }
            if (dto.description) {
                lesson.description = dto.description;
            }
            course.status = course_entity_1.CourseStatus.PENDING;
            await this.lessonRepo.save(lesson);
            await this.courseRepo.save(course);
            await this.emailService.LessonUpdating(instructor.email, instructor.firstName, course.title, lesson.title);
            return {
                accessToken: req.token,
                message: 'Lesson has been updated successfully',
                lesson,
                course,
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError(error.message || '', error.statusCOde || 500);
        }
    }
    async deleteLesson(lessonId, req) {
        const lesson = await this.lessonRepo.findOne({
            where: { id: lessonId },
            relations: ['course', 'course.instructor'],
        });
        if (!lesson)
            throw custom_handlers_1.customError.notFound('Lesson not found');
        if (lesson.course.instructor.id !== req.userId) {
            throw custom_handlers_1.customError.forbidden('You can only delete lessons from your own course');
        }
        try {
            if (lesson.videoUrl) {
                try {
                    await (0, image_upload_service_1.deleteFileS3)(lesson.videoUrl);
                }
                catch (err) {
                    console.warn(' Failed to delete old video:', err.message);
                }
            }
            if (lesson.noteUrl) {
                try {
                    await (0, image_upload_service_1.deleteFileS3)(lesson.noteUrl);
                }
                catch (err) {
                    console.warn(' Failed to delete old note:', err.message);
                }
            }
            await this.lessonRepo.remove(lesson);
            const instructor = lesson.course.instructor;
            await this.emailService.LessonDeletion(instructor.email, instructor.firstName, lesson.title, lesson.course.title);
            return {
                accessToken: req.token,
                message: 'Lesson deleted successfully',
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError(error.message || '', error.statusCOde || 500);
        }
    }
    async getLessons(courseId, query, req) {
        const course = await this.courseRepo.findOne({
            where: { id: courseId, deleted: false },
            relations: ['instructor'],
        });
        if (!course)
            throw custom_handlers_1.customError.notFound('Course not found');
        if (course.instructor.id !== req.userId) {
            throw custom_handlers_1.customError.forbidden('You can only view lessons from your own course');
        }
        const baseQuery = this.lessonRepo
            .createQueryBuilder('lesson')
            .leftJoinAndSelect('lesson.course', 'course')
            .leftJoinAndSelect('lesson.assignments', 'assignments')
            .where('course.id = :courseId', { courseId });
        const dbQuery = new dbquery_1.DBQuery(baseQuery, 'lesson', query);
        dbQuery.filter().sort().limitFields().paginate();
        if (!query.sort) {
            dbQuery.query.addOrderBy('lesson.position', 'ASC');
        }
        const [lessons, total] = await Promise.all([
            dbQuery.getMany(),
            dbQuery.count(),
        ]);
        return {
            accessToken: req.token,
            page: dbQuery.page,
            results: total,
            lessons,
            message: 'Lessons fetched successfully',
        };
    }
};
exports.LessonService = LessonService;
exports.LessonService = LessonService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lesson_entity_1.Lesson)),
    __param(1, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], LessonService);
//# sourceMappingURL=lesson.service.js.map