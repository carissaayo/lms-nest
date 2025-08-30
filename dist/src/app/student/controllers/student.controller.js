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
exports.StudentController = void 0;
const common_1 = require("@nestjs/common");
const student_service_1 = require("../services/student.service");
const user_auth_guard_1 = require("../../common/guards/user-auth.guard");
const role_guard_1 = require("../../common/guards/role.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_interface_1 = require("../../user/user.interface");
const idParam_decorator_1 = require("../../common/decorators/idParam.decorator");
const student_dto_1 = require("../student.dto");
let StudentController = class StudentController {
    constructor(studentService) {
        this.studentService = studentService;
    }
    async enroll(courseId, req) {
        return this.studentService.enroll(courseId, req);
    }
    async getLessons(courseId, query, req) {
        return this.studentService.getLessonsForStudent(courseId, query, req);
    }
    async getEnrolledCourses(query, req) {
        return this.studentService.viewEnrolledCourses(query, req);
    }
    async startLesson(lessonId, req) {
        return this.studentService.startLesson(lessonId, req);
    }
    async updateProgress(lessonId, dto, req) {
        return this.studentService.updateProgress(lessonId, dto, req);
    }
    async completeLesson(lessonId, req) {
        return this.studentService.completeLesson(lessonId, req);
    }
};
exports.StudentController = StudentController;
__decorate([
    (0, common_1.Post)('enroll/:courseId'),
    __param(0, (0, idParam_decorator_1.IdParam)('courseId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "enroll", null);
__decorate([
    (0, common_1.Get)('courses/:courseId'),
    __param(0, (0, idParam_decorator_1.IdParam)('courseId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getLessons", null);
__decorate([
    (0, common_1.Get)('courses'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getEnrolledCourses", null);
__decorate([
    (0, common_1.Post)('lessons/:lessonId'),
    __param(0, (0, idParam_decorator_1.IdParam)('lessonId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "startLesson", null);
__decorate([
    (0, common_1.Patch)('lessons/:lessonId'),
    __param(0, (0, idParam_decorator_1.IdParam)('lessonId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, student_dto_1.UpdateLessonProgressDTO, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Post)('lessons/:courseId/completed'),
    __param(0, (0, idParam_decorator_1.IdParam)('lessonId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "completeLesson", null);
exports.StudentController = StudentController = __decorate([
    (0, common_1.Controller)('students'),
    (0, common_1.UseGuards)(user_auth_guard_1.AuthenticateTokenUserGuard, user_auth_guard_1.ReIssueTokenUserGuard, role_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.STUDENT),
    __metadata("design:paramtypes", [student_service_1.StudentService])
], StudentController);
//# sourceMappingURL=student.controller.js.map