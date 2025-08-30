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
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("../../course/course.entity");
const user_entity_1 = require("../../user/user.entity");
const assignment_entity_1 = require("../../assignment/assignment.entity");
const submission_entity_1 = require("../../submission/submission.entity");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const payment_service_1 = require("../../payment/services/payment.service.");
const email_service_1 = require("../../email/email.service");
const dbquery_1 = require("../../database/dbquery");
const enrollment_entity_1 = require("../../enrollment/enrollment.entity");
const lesson_entity_1 = require("../../lesson/lesson.entity");
const lesson_progress_entity_1 = require("../../lesson/lesson-progress.entity");
const class_validator_1 = require("class-validator");
let StudentService = class StudentService {
    constructor(paymentService, userRepo, courseRepo, enrollmentRepo, assignmentRepo, lessonRepo, submissionRepo, lessonProgressRepo, emailService) {
        this.paymentService = paymentService;
        this.userRepo = userRepo;
        this.courseRepo = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.assignmentRepo = assignmentRepo;
        this.lessonRepo = lessonRepo;
        this.submissionRepo = submissionRepo;
        this.lessonProgressRepo = lessonProgressRepo;
        this.emailService = emailService;
    }
    async enroll(courseId, req) {
        const student = await this.userRepo.findOne({ where: { id: req.userId } });
        if (!student)
            throw custom_handlers_1.customError.notFound('Student not found');
        const course = await this.courseRepo.findOne({
            where: { id: courseId, deleted: false },
        });
        if (!course)
            throw custom_handlers_1.customError.notFound('Course not found');
        const existing = await this.enrollmentRepo.findOne({
            where: { user: { id: student.id }, course: { id: course.id } },
        });
        if (existing)
            throw custom_handlers_1.customError.forbidden('Already enrolled in this course');
        try {
            const payment = await this.paymentService.initPaystackPayment(student.email, course.price, 'http://localhost:5000', course.id, student.id);
            const paymentLink = payment.data.authorization_url;
            await this.emailService.paymentLinkGenerated(student.email, `${student.firstName} ${student.lastName}`, course.title, course.price, paymentLink);
            return {
                accessToken: req.token,
                message: 'Payment required',
                paymentLink,
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError(error.message || '', error.statusCode || 500);
        }
    }
    async handleSuccessfulPayment(studentId, courseId, reference) {
        const student = await this.userRepo.findOne({ where: { id: studentId } });
        if (!student)
            throw custom_handlers_1.customError.notFound('Student not found');
        const course = await this.courseRepo.findOne({ where: { id: courseId } });
        if (!course)
            throw custom_handlers_1.customError.notFound('Course not found');
        const existing = await this.enrollmentRepo.findOne({
            where: { user: { id: student.id }, course: { id: course.id } },
        });
        if (existing)
            return existing;
    }
    async getLessonsForStudent(courseId, query, req) {
        const enrollment = await this.enrollmentRepo.findOne({
            where: {
                course: { id: courseId, deleted: false },
                user: { id: req.userId },
                status: 'active',
            },
            relations: ['course'],
        });
        if (!enrollment) {
            throw custom_handlers_1.customError.forbidden('You must be enrolled in this course to view lessons');
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
    async startLesson(lessonId, req) {
        const user = await this.userRepo.findOne({ where: { id: req.userId } });
        if (!user)
            throw custom_handlers_1.customError.notFound('User not found');
        const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
        if (!lesson)
            throw custom_handlers_1.customError.notFound('Lesson not found');
        const course = await this.courseRepo.findOne({
            where: { id: lesson.courseId },
        });
        if (!course)
            throw custom_handlers_1.customError.notFound('Course not found');
        if (course.status !== course_entity_1.CourseStatus.APPROVED)
            throw custom_handlers_1.customError.forbidden('Course is not available');
        let progress = await this.lessonProgressRepo.findOne({
            where: { user: { id: user.id }, lesson: { id: lessonId } },
        });
        if (!progress) {
            progress = this.lessonProgressRepo.create({
                user,
                lesson,
                status: lesson_progress_entity_1.LessonStatus.IN_PROGRESS,
                watchedDuration: 0,
            });
        }
        else {
            progress.status = lesson_progress_entity_1.LessonStatus.IN_PROGRESS;
        }
        this.lessonProgressRepo.save(progress);
        return {
            accessToken: req.token,
            message: 'Lesson has started successfully',
            progress,
        };
    }
    async updateProgress(lessonId, dto, req) {
        const { videoDuration, watchedDuration } = dto;
        const user = await this.userRepo.findOne({ where: { id: req.userId } });
        if (!user)
            throw custom_handlers_1.customError.notFound('User not found');
        const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
        if (!lesson)
            throw custom_handlers_1.customError.notFound('Lesson not found');
        const course = await this.courseRepo.findOne({
            where: { id: lesson.courseId },
        });
        if (!course)
            throw custom_handlers_1.customError.notFound('Course not found');
        if (course.status !== course_entity_1.CourseStatus.APPROVED)
            throw custom_handlers_1.customError.forbidden('Course is not available');
        let progress = await this.lessonProgressRepo.findOne({
            where: { user: { id: user.id }, lesson: { id: lessonId } },
        });
        if (!progress) {
            const { progress: startedProgress } = await this.startLesson(lessonId, req);
            progress = startedProgress;
        }
        progress.watchedDuration = watchedDuration;
        const percentWatched = (watchedDuration / videoDuration) * 100;
        if (percentWatched >= 70) {
            progress.status = lesson_progress_entity_1.LessonStatus.COMPLETED;
            progress.completed = true;
        }
        else {
            progress.status = lesson_progress_entity_1.LessonStatus.IN_PROGRESS;
            progress.completed = false;
        }
        this.lessonProgressRepo.save(progress);
        return {
            accessToken: req.token,
            message: 'Lesson progress updated successfully',
            progress,
        };
    }
    async completeLesson(lessonId, req) {
        const user = await this.userRepo.findOne({ where: { id: req.userId } });
        if (!user)
            throw custom_handlers_1.customError.notFound('User not found');
        const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
        if (!lesson)
            throw custom_handlers_1.customError.notFound('Lesson not found');
        const course = await this.courseRepo.findOne({
            where: { id: lesson.courseId },
        });
        if (!course)
            throw custom_handlers_1.customError.notFound('Course not found');
        if (course.status !== course_entity_1.CourseStatus.APPROVED)
            throw custom_handlers_1.customError.forbidden('Course is not available');
        const progress = await this.lessonProgressRepo.findOne({
            where: { user: { id: user.id }, lesson: { id: lessonId } },
        });
        if (!progress)
            throw custom_handlers_1.customError.notFound('Lesson progress not found');
        progress.status = lesson_progress_entity_1.LessonStatus.COMPLETED;
        progress.completed = true;
        this.lessonProgressRepo.save(progress);
        return {
            accessToken: req.token,
            message: 'Lesson has been completed successfully',
            progress,
        };
    }
    async viewEnrolledCourses(query, req) {
        const user = await this.userRepo.findOne({ where: { id: req.userId } });
        if (!user)
            throw custom_handlers_1.customError.notFound('User not found');
        const baseQuery = this.courseRepo
            .createQueryBuilder('course')
            .innerJoin('course.enrollments', 'enrollment')
            .where('enrollment.user_id = :userId', { userId: user.id })
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
            dbQuery.query.andWhere('course.price = :price', { price: query.price });
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
        const [courses, total] = await Promise.all([
            dbQuery.getMany(),
            dbQuery.count(),
        ]);
        return {
            page: dbQuery.page,
            results: total,
            courses,
            message: 'Enrolled courses fetched successfully',
        };
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(3, (0, typeorm_1.InjectRepository)(enrollment_entity_1.Enrollment)),
    __param(4, (0, typeorm_1.InjectRepository)(assignment_entity_1.Assignment)),
    __param(5, (0, typeorm_1.InjectRepository)(lesson_entity_1.Lesson)),
    __param(6, (0, typeorm_1.InjectRepository)(submission_entity_1.Submission)),
    __param(7, (0, typeorm_1.InjectRepository)(lesson_progress_entity_1.LessonProgress)),
    __metadata("design:paramtypes", [payment_service_1.PaymentService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], StudentService);
//# sourceMappingURL=student.service.js.map