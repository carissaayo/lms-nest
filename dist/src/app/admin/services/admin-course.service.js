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
exports.AdminCoursesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const email_service_1 = require("../../email/email.service");
const admin_entity_1 = require("../admin.entity");
const course_entity_1 = require("../../course/course.entity");
const user_interface_1 = require("../../user/user.interface");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const dbquery_1 = require("../../database/dbquery");
const class_validator_1 = require("class-validator");
let AdminCoursesService = class AdminCoursesService {
    constructor(adminRepo, emailService, courseRepo) {
        this.adminRepo = adminRepo;
        this.emailService = emailService;
        this.courseRepo = courseRepo;
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
    async approveCourse(courseId, dto, req) {
        if (!courseId)
            throw custom_handlers_1.customError.notFound('courseId is required');
        const { action, rejectReason } = dto;
        const course = await this.courseRepo.findOne({
            where: { id: courseId },
            relations: ['instructor'],
        });
        if (!course)
            throw custom_handlers_1.customError.conflict('Course not found');
        if (course.deleted)
            throw custom_handlers_1.customError.gone('Course has been deleted');
        const instructor = course.instructor;
        if (!instructor.isActive)
            throw custom_handlers_1.customError.forbidden('Instructor has been suspended');
        if (instructor.role !== user_interface_1.UserRole.INSTRUCTOR)
            throw custom_handlers_1.customError.forbidden('Invalid instructor');
        const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
        if (!admin)
            throw custom_handlers_1.customError.notFound('Admin not found');
        if (course.status === action) {
            throw custom_handlers_1.customError.forbidden(`Course is already ${action}.`);
        }
        try {
            switch (action) {
                case course_entity_1.CourseStatus.APPROVED: {
                    course.isApproved = true;
                    course.status = course_entity_1.CourseStatus.APPROVED;
                    course.approvalDate = new Date();
                    course.approvedBy = admin;
                    course.approvedByName =
                        `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim();
                    course.rejectionDate = undefined;
                    course.rejectedBy = undefined;
                    course.rejectedByName = undefined;
                    course.suspensionDate = undefined;
                    course.suspendedBy = undefined;
                    course.suspendedByName = undefined;
                    break;
                }
                case course_entity_1.CourseStatus.REJECTED: {
                    course.isApproved = false;
                    course.status = course_entity_1.CourseStatus.REJECTED;
                    course.rejectionDate = new Date();
                    course.rejectedBy = admin;
                    course.rejectedByName =
                        `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim();
                    course.approvalDate = undefined;
                    course.approvedBy = undefined;
                    course.approvedByName = undefined;
                    course.suspensionDate = undefined;
                    course.suspendedBy = undefined;
                    course.suspendedByName = undefined;
                    break;
                }
                case course_entity_1.CourseStatus.SUSPENDED: {
                    course.isApproved = false;
                    course.status = course_entity_1.CourseStatus.SUSPENDED;
                    course.suspensionDate = new Date();
                    course.suspendedBy = admin;
                    course.suspendedByName =
                        `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim();
                    course.rejectedBy = undefined;
                    course.rejectedByName = undefined;
                    break;
                }
                case course_entity_1.CourseStatus.PENDING: {
                    course.isApproved = false;
                    course.status = course_entity_1.CourseStatus.PENDING;
                    course.approvalDate = undefined;
                    course.approvedBy = undefined;
                    course.approvedByName = undefined;
                    course.rejectionDate = undefined;
                    course.rejectedBy = undefined;
                    course.rejectedByName = undefined;
                    course.suspensionDate = undefined;
                    course.suspendedBy = undefined;
                    course.suspendedByName = undefined;
                    break;
                }
                default:
                    throw custom_handlers_1.customError.badRequest('Unsupported course action transition');
            }
            const newAdminAction = {
                action: `${action} course ${course.id}`,
                ...(rejectReason ? { reason: rejectReason } : {}),
                date: new Date(),
            };
            admin.actions = [...(admin.actions ?? []), newAdminAction];
            await this.courseRepo.save(course);
            await this.adminRepo.save(admin);
            await this.emailService.courseStatusEmail(instructor.email, instructor.firstName, course.title, action, rejectReason || '');
            return {
                accessToken: req.token,
                message: 'Course has been updated successfully',
                course,
            };
        }
        catch (error) {
            console.log('Error', error);
            throw custom_handlers_1.customError.internalServerError(error.message || 'Internal Server Error', error.statusCode || 500);
        }
    }
    async findAdminById(id) {
        const admin = await this.adminRepo.findOne({ where: { id } });
        return {
            admin,
        };
    }
};
exports.AdminCoursesService = AdminCoursesService;
exports.AdminCoursesService = AdminCoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(admin_entity_1.UserAdmin)),
    __param(2, (0, typeorm_2.InjectRepository)(course_entity_1.Course)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        email_service_1.EmailService,
        typeorm_1.Repository])
], AdminCoursesService);
//# sourceMappingURL=admin-course.service.js.map