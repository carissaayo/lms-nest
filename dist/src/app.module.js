"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const config_2 = __importDefault(require("./app/config/config"));
const typeorm_1 = require("@nestjs/typeorm");
const database_config_1 = __importDefault(require("./app/config/database.config"));
const auth_module_1 = require("./app/auth/auth.module");
const user_module_1 = require("./app/user/user.module");
const course_module_1 = require("./app/course/course.module");
const admin_module_1 = require("./app/admin/admin.module");
const lesson_module_1 = require("./app/lesson/lesson.module");
const assignment_module_1 = require("./app/assignment/assignment.module");
const student_module_1 = require("./app/student/student.module");
const payment_module_1 = require("./app/payment/payment.module");
const instructor_module_1 = require("./app/instructor/instructor.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [config_2.default] }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: async () => database_config_1.default.options,
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            course_module_1.CourseModule,
            admin_module_1.AdminModule,
            lesson_module_1.LessonModule,
            assignment_module_1.AssignmentModule,
            student_module_1.StudentModule,
            payment_module_1.PaymentModule,
            instructor_module_1.InstructorModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map