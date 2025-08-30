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
exports.CourseController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const course_service_1 = require("./course.service");
const user_interface_1 = require("../user/user.interface");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const course_dto_1 = require("./course.dto");
const role_guard_1 = require("../common/guards/role.guard");
const user_auth_guard_1 = require("../common/guards/user-auth.guard");
const idParam_decorator_1 = require("../common/decorators/idParam.decorator");
let CourseController = class CourseController {
    constructor(courseService) {
        this.courseService = courseService;
    }
    async createCourse(createCourseDto, coverImage, req) {
        return this.courseService.createCourse(createCourseDto, coverImage, req);
    }
    async updateCourse(courseId, updateCourseDto, coverImage, req) {
        return this.courseService.updateCourse(courseId, updateCourseDto, coverImage, req);
    }
    async getCourses(query) {
        return this.courseService.viewCourses(query);
    }
    async deleteCourse(courseId, req) {
        return this.courseService.deleteCourse(courseId, req);
    }
    async submitCourse(courseId, req) {
        return this.courseService.submitCourse(courseId, req);
    }
    async publishCourse(courseId, req) {
        return this.courseService.publishCourse(courseId, req);
    }
};
exports.CourseController = CourseController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImage')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [course_dto_1.CreateCourseDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "createCourse", null);
__decorate([
    (0, common_1.Patch)(':courseId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImage')),
    __param(0, (0, common_1.Param)('courseId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, course_dto_1.UpdateCourseDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "updateCourse", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getCourses", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "deleteCourse", null);
__decorate([
    (0, common_1.Patch)(':id/submit'),
    __param(0, (0, idParam_decorator_1.IdParam)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "submitCourse", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    __param(0, (0, idParam_decorator_1.IdParam)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "publishCourse", null);
exports.CourseController = CourseController = __decorate([
    (0, common_1.Controller)('courses'),
    (0, common_1.UseGuards)(user_auth_guard_1.AuthenticateTokenUserGuard, user_auth_guard_1.ReIssueTokenUserGuard, role_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.INSTRUCTOR),
    __metadata("design:paramtypes", [course_service_1.CourseService])
], CourseController);
//# sourceMappingURL=course.controller.js.map