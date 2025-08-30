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
exports.AssignmentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const assignment_service_1 = require("../services/assignment.service");
const assignment_dto_1 = require("../assignment.dto");
const user_interface_1 = require("../../user/user.interface");
const user_auth_guard_1 = require("../../common/guards/user-auth.guard");
const role_guard_1 = require("../../common/guards/role.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const idParam_decorator_1 = require("../../common/decorators/idParam.decorator");
let AssignmentController = class AssignmentController {
    constructor(assignmentService) {
        this.assignmentService = assignmentService;
    }
    async createAssignment(dto, file, req) {
        return this.assignmentService.createAssignment(dto, file, req);
    }
    async updateAssignment(assignmentId, files, dto, req) {
        return this.assignmentService.updateAssignment(assignmentId, dto, files, req);
    }
    async deleteAssignment(assignmentId, req) {
        return this.assignmentService.deleteAssignment(assignmentId, req);
    }
    async getAssignmentsByCourse(courseId, query, req) {
        return this.assignmentService.getAssignmentsInCourse(courseId, query, req);
    }
    async getAssignmentsByInstructor(instructorId, query, req) {
        return this.assignmentService.getAssignmentsByInstructor(instructorId, query, req);
    }
};
exports.AssignmentController = AssignmentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assignment_dto_1.CreateAssignmentDTO, Object, Object]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, idParam_decorator_1.IdParam)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, assignment_dto_1.UpdateAssignmentDTO, Object]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "updateAssignment", null);
__decorate([
    (0, common_1.Patch)(':id/delete'),
    __param(0, (0, idParam_decorator_1.IdParam)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "deleteAssignment", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    __param(0, (0, idParam_decorator_1.IdParam)('courseId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "getAssignmentsByCourse", null);
__decorate([
    (0, common_1.Get)('instructor/:instructorId'),
    __param(0, (0, idParam_decorator_1.IdParam)('instructorId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "getAssignmentsByInstructor", null);
exports.AssignmentController = AssignmentController = __decorate([
    (0, common_1.Controller)('assignments'),
    (0, common_1.UseGuards)(user_auth_guard_1.AuthenticateTokenUserGuard, user_auth_guard_1.ReIssueTokenUserGuard, role_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.INSTRUCTOR),
    __metadata("design:paramtypes", [assignment_service_1.AssignmentService])
], AssignmentController);
//# sourceMappingURL=assignment.controller.js.map