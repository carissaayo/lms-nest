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
exports.AdminUserController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_interface_1 = require("../../user/user.interface");
const permissions_gurad_1 = require("../../common/guards/permissions.gurad");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const admin_users_service_1 = require("../services/admin-users.service");
const admin_dto_1 = require("../admin.dto");
const admin_interface_1 = require("../admin.interface");
const admin_auth_guard_1 = require("../../common/guards/admin-auth.guard");
let AdminUserController = class AdminUserController {
    constructor(adminUserService) {
        this.adminUserService = adminUserService;
    }
    suspendUser(userId, suspendDto, req) {
        return this.adminUserService.suspendUser(userId, suspendDto, req);
    }
};
exports.AdminUserController = AdminUserController;
__decorate([
    (0, common_1.Patch)(':userid/action'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.SuspendUserDTO, Object]),
    __metadata("design:returntype", void 0)
], AdminUserController.prototype, "suspendUser", null);
exports.AdminUserController = AdminUserController = __decorate([
    (0, common_1.Controller)('admin-users'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    })),
    (0, common_1.UseGuards)(admin_auth_guard_1.AuthenticateTokenAdminGuard, admin_auth_guard_1.ReIssueTokenAdminGuard, permissions_gurad_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN),
    (0, permissions_decorator_1.Permissions)(admin_interface_1.PermissionsEnum.ADMIN_USERS),
    __metadata("design:paramtypes", [admin_users_service_1.AdminUserService])
], AdminUserController);
//# sourceMappingURL=admin-user.controller.js.map