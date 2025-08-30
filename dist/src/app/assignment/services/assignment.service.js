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
exports.AssignmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const assignment_entity_1 = require("../assignment.entity");
const course_entity_1 = require("../../course/course.entity");
const user_entity_1 = require("../../user/user.entity");
const lesson_entity_1 = require("../../lesson/lesson.entity");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const image_upload_service_1 = require("../../fileUpload/image-upload.service");
const email_service_1 = require("../../email/email.service");
const dbquery_1 = require("../../database/dbquery");
let AssignmentService = class AssignmentService {
    constructor(assignmentRepo, courseRepo, userRepo, lessonRepo, emailService) {
        this.assignmentRepo = assignmentRepo;
        this.courseRepo = courseRepo;
        this.userRepo = userRepo;
        this.lessonRepo = lessonRepo;
        this.emailService = emailService;
    }
    async createAssignment(dto, file, req) {
        if (!file)
            throw custom_handlers_1.customError.notFound('file is required');
        const { title, lessonId, description } = dto;
        const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
        if (!lesson) {
            throw custom_handlers_1.customError.notFound('Lesson not found');
        }
        const courseId = lesson?.courseId;
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
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        const existingLessonAssignment = await this.assignmentRepo.findOne({
            where: { lessonId },
        });
        if (existingLessonAssignment)
            throw new common_1.NotFoundException('Assignment already exist for this course');
        try {
            let fileUrl = undefined;
            fileUrl = await (0, image_upload_service_1.saveFileS3)(file, `lessons/${courseId}/assignments/`);
            const assignment = this.assignmentRepo.create({
                title,
                description,
                fileUrl,
                lesson,
                lessonId: lesson.id,
                instructor,
                instructorId: instructor.id,
            });
            await this.assignmentRepo.save(assignment);
            await this.emailService.AssignmentCreation(instructor.email, instructor.firstName, assignment.title, lesson.title, course.title);
            return {
                accessToken: req.token,
                message: 'Assignment has been created successfully',
                lesson,
                assignment,
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError(error.message || '', error.statusCOde || 500);
        }
    }
    async updateAssignment(assignmentId, dto, files, req) {
        const assignment = await this.assignmentRepo.findOne({
            where: { id: assignmentId },
        });
        if (!assignment) {
            throw custom_handlers_1.customError.notFound('Assignment not found');
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
        const lesson = await this.lessonRepo.findOne({
            where: { id: assignment.lessonId },
        });
        if (!lesson) {
            throw custom_handlers_1.customError.notFound('Lesson not found');
        }
        const course = await this.courseRepo.findOne({
            where: { id: lesson.courseId },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        if (assignment.instructorId !== instructor.id) {
            throw custom_handlers_1.customError.forbidden('You can only update your  assignment');
        }
        try {
            let fileUrl = undefined;
            if (files && files.file && files.file.length > 0) {
                if (assignment.fileUrl) {
                    try {
                        await (0, image_upload_service_1.deleteFileS3)(assignment.fileUrl);
                    }
                    catch (err) {
                        console.warn(' Failed to delete old video:', err.message);
                    }
                }
                const fileFile = files.file[0];
                fileUrl = await (0, image_upload_service_1.saveFileS3)(fileFile, `lessons/${lesson.courseId}/assignments/`);
                assignment.fileUrl = fileUrl;
            }
            console.log('fileUrl======', fileUrl);
            if (dto.title) {
                assignment.title = dto.title;
            }
            if (dto.description) {
                assignment.description = dto.description;
            }
            course.status = course_entity_1.CourseStatus.PENDING;
            await this.lessonRepo.save(lesson);
            await this.courseRepo.save(course);
            await this.assignmentRepo.save(assignment);
            await this.emailService.AssignmentUpdate(instructor.email, instructor.firstName, assignment.title, course.title, lesson.title);
            return {
                accessToken: req.token,
                message: 'Assignment has been updated successfully',
                lesson,
                assignment,
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError(error.message || '', error.statusCOde || 500);
        }
    }
    async deleteAssignment(assignmentId, req) {
        const assignment = await this.assignmentRepo.findOne({
            where: { id: assignmentId },
            relations: ['instructor', 'lesson'],
        });
        if (!assignment)
            throw custom_handlers_1.customError.notFound('Assignment not found');
        if (assignment.instructorId !== req.userId) {
            throw custom_handlers_1.customError.forbidden('You can only delete assignment you created');
        }
        try {
            if (assignment.fileUrl) {
                try {
                    await (0, image_upload_service_1.deleteFileS3)(assignment.fileUrl);
                }
                catch (err) {
                    console.warn(' Failed to delete old video:', err.message);
                }
            }
            await this.assignmentRepo.remove(assignment);
            const instructor = assignment.instructor;
            await this.emailService.AssignmentDeletion(instructor.email, instructor.firstName, assignment.title, assignment.lesson.title);
            return {
                accessToken: req.token,
                message: 'Assignment deleted successfully',
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError(error.message || '', error.statusCOde || 500);
        }
    }
    async getAssignmentsInCourse(courseId, query, req) {
        const course = await this.courseRepo.findOne({
            where: { id: courseId, deleted: false },
            relations: ['instructor'],
        });
        if (!course)
            throw custom_handlers_1.customError.notFound('Course not found');
        if (course.instructorId !== req.userId) {
            throw custom_handlers_1.customError.forbidden('You can only view assignments from your own course');
        }
        const baseQuery = this.assignmentRepo
            .createQueryBuilder('assignment')
            .leftJoin('assignment.lesson', 'lesson')
            .where('lesson.courseId = :courseId', { courseId })
            .leftJoinAndSelect('assignment.instructor', 'instructor');
        const dbQuery = new dbquery_1.DBQuery(baseQuery, 'assignment', query);
        dbQuery.filter().sort().limitFields().paginate();
        const [assignments, total] = await Promise.all([
            dbQuery.getMany(),
            dbQuery.count(),
        ]);
        return {
            accessToken: req.token,
            page: dbQuery.page,
            results: total,
            assignments,
            message: 'Assignments fetched successfully',
        };
    }
    async getAssignmentsByInstructor(instructorId, query, req) {
        if (req.userId !== instructorId) {
            throw custom_handlers_1.customError.forbidden('You can only view your own assignments');
        }
        const baseQuery = this.assignmentRepo
            .createQueryBuilder('assignment')
            .leftJoinAndSelect('assignment.instructor', 'instructor')
            .where('assignment.instructorId = :instructorId', { instructorId });
        const dbQuery = new dbquery_1.DBQuery(baseQuery, 'assignment', query);
        dbQuery.filter().sort().limitFields().paginate();
        const [assignments, total] = await Promise.all([
            dbQuery.getMany(),
            dbQuery.count(),
        ]);
        return {
            accessToken: req.token,
            page: dbQuery.page,
            results: total,
            assignments,
            message: 'Assignments fetched successfully',
        };
    }
};
exports.AssignmentService = AssignmentService;
exports.AssignmentService = AssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(assignment_entity_1.Assignment)),
    __param(1, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(lesson_entity_1.Lesson)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], AssignmentService);
//# sourceMappingURL=assignment.service.js.map