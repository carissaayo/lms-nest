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
exports.AdminUserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const email_service_1 = require("../../email/email.service");
const admin_entity_1 = require("../admin.entity");
const user_entity_1 = require("../../user/user.entity");
const auth_utils_1 = require("../../../utils/auth-utils");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const admin_auth_utils_1 = require("../../../utils/admin-auth-utils");
let AdminUserService = class AdminUserService {
    constructor(adminRepo, userRepo, emailService) {
        this.adminRepo = adminRepo;
        this.userRepo = userRepo;
        this.emailService = emailService;
    }
    async suspendUser(userId, suspendDto, req) {
        const { action, suspensionReason } = suspendDto;
        if (!userId)
            throw custom_handlers_1.customError.badRequest('UserId is required');
        if (!action) {
            throw custom_handlers_1.customError.badRequest('Action is required');
        }
        const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
        if (!admin)
            throw custom_handlers_1.customError.notFound('Admin not found');
        if (!admin.isActive) {
            throw custom_handlers_1.customError.forbidden('Your account has been suspended');
        }
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });
        if (!user)
            throw custom_handlers_1.customError.notFound('User not found');
        try {
            const newAction = {
                action: `User is ${action}ed by ${admin.id}`,
                ...(suspensionReason ? { suspensionReason } : {}),
                date: new Date(),
            };
            const newAdminAction = {
                action: `${action}ed a User  ${user.id}`,
                ...(suspensionReason ? { suspensionReason } : {}),
                date: new Date(),
            };
            user.isActive = false;
            user.actions.push(newAction);
            admin.actions.push(newAdminAction);
            this.userRepo.save(user);
            this.adminRepo.save(admin);
            await this.emailService.suspensionEmail(user.email, user.firstName, action, suspensionReason || '');
            const { token, refreshToken } = await (0, auth_utils_1.generateToken)(admin, req);
            return {
                accessToken: token,
                refreshToken: refreshToken,
                message: 'User account has been suspended.',
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError('Internal Server Error', 500);
        }
    }
    async verifyEmail(verifyEmailDto, req) {
        const { emailCode } = verifyEmailDto;
        const trimmedEmailCode = emailCode?.trim();
        if (!trimmedEmailCode) {
            throw custom_handlers_1.customError.unauthorized('Please enter the verification code');
        }
        const admin = await this.adminRepo.findOne({
            where: { id: req.userId },
        });
        if (!admin) {
            throw custom_handlers_1.customError.badRequest('Access Denied');
        }
        if (admin.emailVerified) {
            throw custom_handlers_1.customError.badRequest('Email verified already');
        }
        if (admin.emailCode !== trimmedEmailCode) {
            throw custom_handlers_1.customError.badRequest('Invalid verification code');
        }
        try {
            admin.emailVerified = true;
            admin.emailCode = null;
            await this.adminRepo.save(admin);
            const profile = (0, admin_auth_utils_1.GET_ADMIN_PROFILE)(admin);
            return {
                accessToken: req.token,
                profile,
                message: 'Email Verified Successfully',
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError('Internal Server Error', 500);
        }
    }
};
exports.AdminUserService = AdminUserService;
exports.AdminUserService = AdminUserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(admin_entity_1.UserAdmin)),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        email_service_1.EmailService])
], AdminUserService);
//# sourceMappingURL=admin-users.service.js.map