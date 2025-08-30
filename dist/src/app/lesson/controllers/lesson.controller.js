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
exports.LessonController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_guard_1 = require("../../common/guards/role.guard");
const user_auth_guard_1 = require("../../common/guards/user-auth.guard");
const user_interface_1 = require("../../user/user.interface");
const lesson_service_1 = require("../services/lesson.service");
const lesson_dto_1 = require("../lesson.dto");
const platform_express_1 = require("@nestjs/platform-express");
const idParam_decorator_1 = require("../../common/decorators/idParam.decorator");
let LessonController = class LessonController {
    constructor(lessonService) {
        this.lessonService = lessonService;
    }
    async createLesson(dto, files, req) {
        return this.lessonService.createLesson(dto, files, req);
    }
    async updateLesson(lessonId, dto, files, req) {
        return this.lessonService.updateLesson(dto, files, req, lessonId);
    }
    async deleteLesson(lessonId, req) {
        return this.lessonService.deleteLesson(lessonId, req);
    }
    async getLessons(courseId, query, req) {
        return this.lessonService.getLessons(courseId, query, req);
    }
};
exports.LessonController = LessonController;
__decorate([
    (0, common_1.Post)('create/'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'video', maxCount: 1 },
        { name: 'note', maxCount: 1 },
    ])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lesson_dto_1.CreateLessonDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], LessonController.prototype, "createLesson", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'video', maxCount: 1 },
        { name: 'note', maxCount: 1 },
    ])),
    __param(0, (0, idParam_decorator_1.IdParam)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lesson_dto_1.UpdateLessonDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], LessonController.prototype, "updateLesson", null);
__decorate([
    (0, common_1.Delete)(':id/delete'),
    __param(0, (0, idParam_decorator_1.IdParam)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LessonController.prototype, "deleteLesson", null);
__decorate([
    (0, common_1.Get)('/:courseId'),
    __param(0, (0, idParam_decorator_1.IdParam)('courseId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LessonController.prototype, "getLessons", null);
exports.LessonController = LessonController = __decorate([
    (0, common_1.Controller)('lessons'),
    (0, common_1.UseGuards)(user_auth_guard_1.AuthenticateTokenUserGuard, user_auth_guard_1.ReIssueTokenUserGuard, role_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.INSTRUCTOR),
    __metadata("design:paramtypes", [lesson_service_1.LessonService])
], LessonController);
//# sourceMappingURL=lesson.controller.js.map