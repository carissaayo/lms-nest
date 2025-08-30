"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../user/user.entity");
const email_service_1 = require("../email/email.service");
const student_module_1 = require("../student/student.module");
const enrollment_entity_1 = require("../enrollment/enrollment.entity");
const admin_entity_1 = require("../admin/admin.entity");
const earning_entity_1 = require("../instructor/entities/earning.entity");
const payment_entity_1 = require("../payment/payment.entity");
const instructor_service_1 = require("./services/instructor.service");
const instructor_controller_1 = require("./controllers/instructor.controller");
const withdrawal_service_1 = require("./services/withdrawal.service");
const withdrawal_controller_1 = require("./controllers/withdrawal.controller");
const bank_entity_1 = require("./entities/bank.entity");
const payment_module_1 = require("../payment/payment.module");
const otp_entity_1 = require("./entities/otp.entity");
const withdrawal_entity_1 = require("./entities/withdrawal.entity");
let InstructorModule = class InstructorModule {
};
exports.InstructorModule = InstructorModule;
exports.InstructorModule = InstructorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                enrollment_entity_1.Enrollment,
                admin_entity_1.UserAdmin,
                payment_entity_1.Payment,
                earning_entity_1.Earning,
                bank_entity_1.Bank,
                otp_entity_1.Otp,
                withdrawal_entity_1.Withdrawal,
            ]),
            student_module_1.StudentModule,
            payment_module_1.PaymentModule,
        ],
        providers: [instructor_service_1.InstructorService, email_service_1.EmailService, withdrawal_service_1.WithdrawalService],
        controllers: [instructor_controller_1.InstructorController, withdrawal_controller_1.WithdrawalController],
        exports: [],
    })
], InstructorModule);
//# sourceMappingURL=instructor.module.js.map