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
exports.AdminPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_interface_1 = require("../../user/user.interface");
const admin_auth_guard_1 = require("../../common/guards/admin-auth.guard");
const permissions_gurad_1 = require("../../common/guards/permissions.gurad");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const admin_interface_1 = require("../admin.interface");
const admin_payments_service_1 = require("../services/admin-payments.service");
let AdminPaymentsController = class AdminPaymentsController {
    constructor(adminPaymentsService) {
        this.adminPaymentsService = adminPaymentsService;
    }
    getPayments(query, req) {
        return this.adminPaymentsService.getPayments(query, req);
    }
    getWithdrawals(query, req) {
        return this.adminPaymentsService.getWithdrawals(query, req);
    }
};
exports.AdminPaymentsController = AdminPaymentsController;
__decorate([
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Get)('withdrawals'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminPaymentsController.prototype, "getWithdrawals", null);
exports.AdminPaymentsController = AdminPaymentsController = __decorate([
    (0, common_1.Controller)('admin-payments'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    })),
    (0, common_1.UseGuards)(admin_auth_guard_1.AuthenticateTokenAdminGuard, admin_auth_guard_1.ReIssueTokenAdminGuard, permissions_gurad_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN),
    (0, permissions_decorator_1.Permissions)(admin_interface_1.PermissionsEnum.ADMIN_USERS),
    __metadata("design:paramtypes", [admin_payments_service_1.AdminPaymentsService])
], AdminPaymentsController);
//# sourceMappingURL=admin-payment.controller.js.map