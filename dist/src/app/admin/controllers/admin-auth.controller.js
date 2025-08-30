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
exports.AdminAuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_dto_1 = require("../../auth/auth.dto");
const role_guard_1 = require("../../common/guards/role.guard");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const admin_auth_service_1 = require("../services/admin-auth.service");
const admin_auth_guard_1 = require("../../common/guards/admin-auth.guard");
const user_interface_1 = require("../../user/user.interface");
let AdminAuthController = class AdminAuthController {
    constructor(authService) {
        this.authService = authService;
    }
    register(dto) {
        return this.authService.register(dto);
    }
    async login(loginDto, req) {
        return this.authService.login(loginDto, req);
    }
    async verifyEmail(verifyEmailDto, req) {
        return this.authService.verifyEmail(verifyEmailDto, req);
    }
    async passwordResetRequest(resetPasswordDto) {
        return this.authService.requestResetPassword(resetPasswordDto);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
    async changePassword(changePasswordDto, req) {
        return this.authService.changePassword(changePasswordDto, req);
    }
};
exports.AdminAuthController = AdminAuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AdminAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AuthenticateTokenAdminGuard, admin_auth_guard_1.ReIssueTokenAdminGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyEmailDTO, Object]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('request-password-reset'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AuthenticateTokenAdminGuard, admin_auth_guard_1.ReIssueTokenAdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RequestResetPasswordDTO]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "passwordResetRequest", null);
__decorate([
    (0, common_1.Post)('password-reset'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AuthenticateTokenAdminGuard, admin_auth_guard_1.ReIssueTokenAdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDTO]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AuthenticateTokenAdminGuard, admin_auth_guard_1.ReIssueTokenAdminGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ChangePasswordDTO, Object]),
    __metadata("design:returntype", Promise)
], AdminAuthController.prototype, "changePassword", null);
exports.AdminAuthController = AdminAuthController = __decorate([
    (0, common_1.Controller)('admin-auth'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    })),
    (0, common_1.UseGuards)(role_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_auth_service_1.AdminAuthService])
], AdminAuthController);
//# sourceMappingURL=admin-auth.controller.js.map