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
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("../../course/course.entity");
const user_entity_1 = require("../../user/user.entity");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const email_service_1 = require("../../email/email.service");
const payment_service_1 = require("../../payment/services/payment.service.");
const user_interface_1 = require("../../user/user.interface");
const admin_entity_1 = require("../../admin/admin.entity");
const admin_interface_1 = require("../../admin/admin.interface");
const enrollment_entity_1 = require("../enrollment.entity");
const payment_entity_1 = require("../../payment/payment.entity");
const earning_entity_1 = require("../../instructor/entities/earning.entity");
let EnrollmentService = class EnrollmentService {
    constructor(paymentService, emailService, userRepo, adminRepo, courseRepo, enrollmentRepo, paymentRepo, earningRepo) {
        this.paymentService = paymentService;
        this.emailService = emailService;
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
        this.courseRepo = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.paymentRepo = paymentRepo;
        this.earningRepo = earningRepo;
    }
    async enrollStudentAfterPayment(dto, req) {
        const { reference, amount } = dto.data;
        const { studentId, courseId } = dto.data.metadata;
        const student = await this.userRepo.findOne({ where: { id: studentId } });
        if (!student)
            throw custom_handlers_1.customError.notFound('Student not found');
        const course = await this.courseRepo.findOne({
            where: { id: courseId },
            relations: ['instructor'],
        });
        if (!course)
            throw custom_handlers_1.customError.notFound('Course not found');
        const existing = await this.enrollmentRepo.findOne({
            where: { user: { id: student.id }, course: { id: course.id } },
        });
        if (existing)
            return existing;
        const newAmount = Number(course.price);
        const payment = this.paymentRepo.create({
            student: { id: student.id },
            course: { id: course.id },
            amount: newAmount,
            provider: 'paystack',
            reference,
            status: 'success',
        });
        await this.paymentRepo.save(payment);
        const enrollment = this.enrollmentRepo.create({
            user: { id: student.id },
            course: { id: course.id },
            paymentReference: reference,
        });
        await this.enrollmentRepo.save(enrollment);
        const platformCut = newAmount * 0.2;
        const instructorCut = newAmount - platformCut;
        const earning = this.earningRepo.create({
            instructor: { id: course.instructor.id },
            course: { id: course.id },
            payment: { id: payment.id },
            amount: instructorCut,
            platformShare: platformCut,
        });
        await this.earningRepo.save(earning);
        await this.emailService.courseEnrollmentConfirmation(student.email, student.firstName, course.title);
        const admins = await this.adminRepo.find({
            where: { role: user_interface_1.UserRole.ADMIN },
        });
        const paymentAdmins = admins.filter((a) => a.permissions?.includes(admin_interface_1.PermissionsEnum.ADMIN_PAYMENTS));
        if (paymentAdmins.length > 0) {
            await this.emailService.courseEnrollmentAdminNotification(`${student.firstName} ${student.lastName}`, student.email, course.title, newAmount, paymentAdmins);
        }
        await this.emailService.courseEnrollmentInstructorNotification(course.instructor.email, course.instructor.firstName, `${student.firstName} ${student.lastName}`, course.title);
        const savedEarning = await this.earningRepo.findOne({
            where: { id: earning.id },
            relations: ['instructor', 'course', 'payment'],
        });
        return {
            enrollment,
            payment,
            earning: savedEarning,
            message: 'Student successfully enrolled and payment recorded',
            accessToken: req.token,
        };
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(admin_entity_1.UserAdmin)),
    __param(4, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(5, (0, typeorm_1.InjectRepository)(enrollment_entity_1.Enrollment)),
    __param(6, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(7, (0, typeorm_1.InjectRepository)(earning_entity_1.Earning)),
    __metadata("design:paramtypes", [payment_service_1.PaymentService,
        email_service_1.EmailService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EnrollmentService);
//# sourceMappingURL=enrollment.service.js.map