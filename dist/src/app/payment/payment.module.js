"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../user/user.entity");
const email_service_1 = require("../email/email.service");
const payment_service_1 = require("./services/payment.service.");
const payment_controller_1 = require("./controllers/payment.controller");
const student_module_1 = require("../student/student.module");
const enrollment_service_1 = require("../enrollment/services/enrollment.service");
const enrollment_entity_1 = require("../enrollment/enrollment.entity");
const admin_entity_1 = require("../admin/admin.entity");
const payment_entity_1 = require("./payment.entity");
const earning_entity_1 = require("../instructor/entities/earning.entity");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, enrollment_entity_1.Enrollment, admin_entity_1.UserAdmin, payment_entity_1.Payment, earning_entity_1.Earning]),
            student_module_1.StudentModule,
        ],
        providers: [payment_service_1.PaymentService, enrollment_service_1.EnrollmentService, email_service_1.EmailService],
        controllers: [payment_controller_1.PaymentController],
        exports: [payment_service_1.PaymentService],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map