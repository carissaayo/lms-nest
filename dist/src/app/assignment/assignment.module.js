"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const email_service_1 = require("../email/email.service");
const assignment_entity_1 = require("./assignment.entity");
const course_entity_1 = require("../course/course.entity");
const user_entity_1 = require("../user/user.entity");
const lesson_entity_1 = require("../lesson/lesson.entity");
const assignment_service_1 = require("./services/assignment.service");
const assignment_controller_1 = require("./controllers/assignment.controller");
let AssignmentModule = class AssignmentModule {
};
exports.AssignmentModule = AssignmentModule;
exports.AssignmentModule = AssignmentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([course_entity_1.Course, user_entity_1.User, assignment_entity_1.Assignment, lesson_entity_1.Lesson])],
        providers: [assignment_service_1.AssignmentService, email_service_1.EmailService],
        controllers: [assignment_controller_1.AssignmentController],
        exports: [assignment_service_1.AssignmentService, typeorm_1.TypeOrmModule],
    })
], AssignmentModule);
//# sourceMappingURL=assignment.module.js.map