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
exports.WithdrawalController = void 0;
const common_1 = require("@nestjs/common");
const user_auth_guard_1 = require("../../common/guards/user-auth.guard");
const role_guard_1 = require("../../common/guards/role.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_interface_1 = require("../../user/user.interface");
const withdrawal_service_1 = require("../services/withdrawal.service");
const withdrawal_dto_1 = require("../dtos/withdrawal.dto");
const idParam_decorator_1 = require("../../common/decorators/idParam.decorator");
let WithdrawalController = class WithdrawalController {
    constructor(withdrawalService) {
        this.withdrawalService = withdrawalService;
    }
    async addBank(dto, req) {
        return this.withdrawalService.addBank(dto, req);
    }
    async deleteBank(bankId, req) {
        return this.withdrawalService.deleteBank(req, bankId);
    }
    async getSupportedBanks() {
        return this.withdrawalService.getSupportedBanks();
    }
    async requestWithdrawCode(dto, req) {
        return this.withdrawalService.requestWithdrawCode(req, dto);
    }
    async confirmWithdrawalCode(withdrawalId, dto, req) {
        return this.withdrawalService.confirmWithdrawalCode(req, dto, withdrawalId);
    }
    async getWithdrawals(query, req) {
        return this.withdrawalService.getWithdrawals(query, req);
    }
};
exports.WithdrawalController = WithdrawalController;
__decorate([
    (0, common_1.Post)('banks'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdrawal_dto_1.AddBankDto, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalController.prototype, "addBank", null);
__decorate([
    (0, common_1.Patch)('banks/:bankId'),
    __param(0, (0, idParam_decorator_1.IdParam)('bankId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalController.prototype, "deleteBank", null);
__decorate([
    (0, common_1.Get)('nigerian-banks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WithdrawalController.prototype, "getSupportedBanks", null);
__decorate([
    (0, common_1.Post)('initiate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdrawal_dto_1.WithdrawDto, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalController.prototype, "requestWithdrawCode", null);
__decorate([
    (0, common_1.Patch)(':withdrawalId'),
    __param(0, (0, idParam_decorator_1.IdParam)('withdrawalId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, withdrawal_dto_1.ConfirmWithdrawDto, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalController.prototype, "confirmWithdrawalCode", null);
__decorate([
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalController.prototype, "getWithdrawals", null);
exports.WithdrawalController = WithdrawalController = __decorate([
    (0, common_1.Controller)('withdrawals'),
    (0, common_1.UseGuards)(user_auth_guard_1.AuthenticateTokenUserGuard, user_auth_guard_1.ReIssueTokenUserGuard, role_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.INSTRUCTOR),
    __metadata("design:paramtypes", [withdrawal_service_1.WithdrawalService])
], WithdrawalController);
//# sourceMappingURL=withdrawal.controller.js.map