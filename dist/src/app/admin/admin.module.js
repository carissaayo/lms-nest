"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const email_module_1 = require("../email/email.module");
const course_module_1 = require("../course/course.module");
const admin_users_service_1 = require("./services/admin-users.service");
const admin_admins_service_1 = require("./services/admin-admins.service");
const admin_course_service_1 = require("./services/admin-course.service");
const admin_auth_service_1 = require("./services/admin-auth.service");
const admin_payments_service_1 = require("./services/admin-payments.service");
const admin_admins_controller_1 = require("./controllers/admin-admins.controller");
const admin_user_controller_1 = require("./controllers/admin-user.controller");
const admin_courses_controller_1 = require("./controllers/admin-courses.controller");
const admin_auth_controller_1 = require("./controllers/admin-auth.controller");
const admin_payment_controller_1 = require("./controllers/admin-payment.controller");
const admin_entity_1 = require("./admin.entity");
const user_entity_1 = require("../user/user.entity");
const payment_entity_1 = require("../payment/payment.entity");
const withdrawal_entity_1 = require("../instructor/entities/withdrawal.entity");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([admin_entity_1.UserAdmin, user_entity_1.User, payment_entity_1.Payment, withdrawal_entity_1.Withdrawal]),
            email_module_1.EmailModule,
            course_module_1.CourseModule,
        ],
        providers: [
            admin_users_service_1.AdminUserService,
            admin_admins_service_1.AdminAdminsService,
            admin_course_service_1.AdminCoursesService,
            admin_auth_service_1.AdminAuthService,
            admin_payments_service_1.AdminPaymentsService,
        ],
        controllers: [
            admin_user_controller_1.AdminUserController,
            admin_admins_controller_1.AdminAdminsController,
            admin_courses_controller_1.AdminCoursesController,
            admin_auth_controller_1.AdminAuthController,
            admin_payment_controller_1.AdminPaymentsController,
        ],
        exports: [],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map