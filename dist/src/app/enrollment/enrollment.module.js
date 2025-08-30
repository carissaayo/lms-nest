"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const email_service_1 = require("../email/email.service");
const course_entity_1 = require("../course/course.entity");
const user_entity_1 = require("../user/user.entity");
const enrollment_service_1 = require("./services/enrollment.service");
const payment_service_1 = require("../payment/services/payment.service.");
const enrollment_entity_1 = require("./enrollment.entity");
const admin_entity_1 = require("../admin/admin.entity");
const lesson_entity_1 = require("../lesson/lesson.entity");
const payment_entity_1 = require("../payment/payment.entity");
const earning_entity_1 = require("../instructor/entities/earning.entity");
let EnrollmentModule = class EnrollmentModule {
};
exports.EnrollmentModule = EnrollmentModule;
exports.EnrollmentModule = EnrollmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                course_entity_1.Course,
                user_entity_1.User,
                enrollment_entity_1.Enrollment,
                admin_entity_1.UserAdmin,
                lesson_entity_1.Lesson,
                payment_entity_1.Payment,
                earning_entity_1.Earning,
            ]),
        ],
        providers: [enrollment_service_1.EnrollmentService, email_service_1.EmailService, payment_service_1.PaymentService],
        controllers: [],
        exports: [enrollment_service_1.EnrollmentService],
    })
], EnrollmentModule);
//# sourceMappingURL=enrollment.module.js.map