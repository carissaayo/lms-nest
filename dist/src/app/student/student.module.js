"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const course_entity_1 = require("../course/course.entity");
const user_entity_1 = require("../user/user.entity");
const assignment_entity_1 = require("../assignment/assignment.entity");
const lesson_entity_1 = require("../lesson/lesson.entity");
const submission_entity_1 = require("../submission/submission.entity");
const email_service_1 = require("../email/email.service");
const student_controller_1 = require("./controllers/student.controller");
const student_service_1 = require("./services/student.service");
const payment_service_1 = require("../payment/services/payment.service.");
const assignment_service_1 = require("../assignment/services/assignment.service");
const enrollment_module_1 = require("../enrollment/enrollment.module");
const enrollment_entity_1 = require("../enrollment/enrollment.entity");
const lesson_progress_entity_1 = require("../lesson/lesson-progress.entity");
let StudentModule = class StudentModule {
};
exports.StudentModule = StudentModule;
exports.StudentModule = StudentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                course_entity_1.Course,
                user_entity_1.User,
                assignment_entity_1.Assignment,
                lesson_entity_1.Lesson,
                enrollment_entity_1.Enrollment,
                submission_entity_1.Submission,
                lesson_progress_entity_1.LessonProgress,
            ]),
            enrollment_module_1.EnrollmentModule,
        ],
        providers: [student_service_1.StudentService, email_service_1.EmailService, payment_service_1.PaymentService, assignment_service_1.AssignmentService],
        controllers: [student_controller_1.StudentController],
        exports: [student_service_1.StudentService, typeorm_1.TypeOrmModule],
    })
], StudentModule);
//# sourceMappingURL=student.module.js.map