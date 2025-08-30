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
exports.AdminAdminsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const auth_utils_1 = require("../../../utils/auth-utils");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const admin_entity_1 = require("../admin.entity");
const email_service_1 = require("../../email/email.service");
const admin_auth_utils_1 = require("../../../utils/admin-auth-utils");
const admin_dto_1 = require("../admin.dto");
let AdminAdminsService = class AdminAdminsService {
    constructor(adminRepo, emailService) {
        this.adminRepo = adminRepo;
        this.emailService = emailService;
    }
    async viewProfile(req) {
        console.log('viewProfile');
        const user = await this.adminRepo.findOne({
            where: { id: req.userId },
        });
        console.log('req===', req.userId);
        console.log('token', req.token);
        console.log('user====', user);
        if (!user) {
            throw custom_handlers_1.customError.forbidden('Access Denied');
        }
        const profile = (0, admin_auth_utils_1.GET_ADMIN_PROFILE)(user);
        return {
            accessToken: req.token,
            profile,
            message: 'Profile fetched successfully',
        };
    }
    async addAdminByEmail(dto, req) {
        const { email } = dto;
        const existing = await this.adminRepo.findOne({ where: { email } });
        if (existing) {
            throw custom_handlers_1.customError.conflict('Admin with this email already exists');
        }
        const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
        if (!admin)
            throw custom_handlers_1.customError.notFound('Admin not found');
        if (!admin.isActive) {
            throw custom_handlers_1.customError.forbidden('Your account has been suspended');
        }
        try {
            const newAdmin = this.adminRepo.create({
                email,
                signedUp: false,
                isActive: false,
                emailVerified: false,
                status: admin_entity_1.AdminStatus.PENDING,
            });
            this.adminRepo.save(newAdmin);
            await this.emailService.adminInvitationEmail(email);
            return {
                accessToken: req.token,
                message: 'Admin has ben added successfully',
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError('Internal Server Error', 500);
        }
    }
    async suspendAdmin(userId, suspendDto, req) {
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
        const user = await this.adminRepo.findOne({
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
            this.adminRepo.save(user);
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
    async assignPermission(userId, dto, req) {
        if (!userId)
            throw custom_handlers_1.customError.badRequest('UserId is required');
        const { permissions: newPermissions, action } = dto;
        if (!newPermissions) {
            throw custom_handlers_1.customError.badRequest('Permission array is required');
        }
        const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
        if (!admin)
            throw custom_handlers_1.customError.notFound('Admin not found');
        if (!admin.isActive) {
            throw custom_handlers_1.customError.forbidden('Your account has been suspended');
        }
        const user = await this.adminRepo.findOne({
            where: { id: userId },
        });
        if (!user)
            throw custom_handlers_1.customError.notFound('User not found');
        try {
            if (!user.permissions) {
                user.permissions = [];
            }
            let updatedPermissions = [];
            if (action === admin_dto_1.PermissionsActions.ADD) {
                updatedPermissions = [
                    ...new Set([...user.permissions, ...newPermissions]),
                ];
            }
            else if (action === admin_dto_1.PermissionsActions.REMOVE) {
                updatedPermissions = user.permissions.filter((perm) => !newPermissions.includes(perm));
            }
            user.permissions = updatedPermissions;
            await this.adminRepo.save(user);
            const { token, refreshToken } = await (0, auth_utils_1.generateToken)(admin, req);
            return {
                accessToken: token,
                refreshToken: refreshToken,
                message: 'Admin permissions have been updated',
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError('Internal Server Error', 500);
        }
    }
    async login(loginDto, req) {
        const { email, password } = loginDto;
        const admin = await this.adminRepo.findOne({ where: { email } });
        if (!admin) {
            throw custom_handlers_1.customError.unauthorized('admin not found');
        }
        try {
            const isPasswordValid = await admin.validatePassword(password);
            if (!isPasswordValid) {
                await (0, admin_auth_utils_1.handleFailedAuthAttempt)(admin, this.adminRepo);
            }
            admin.failedAuthAttempts = 0;
            await this.adminRepo.save(admin);
            const { token, refreshToken, session } = await (0, auth_utils_1.generateToken)(admin, req);
            admin.sessions = [session];
            admin.failedSignInAttempts = 0;
            admin.nextSignInAttempt = new Date();
            await this.adminRepo.save(admin);
            const profile = (0, admin_auth_utils_1.GET_ADMIN_PROFILE)(admin);
            return {
                accessToken: token,
                refreshToken: refreshToken,
                profile: profile,
                message: 'Signed In successfully',
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
    async findAdminById(id) {
        const admin = await this.adminRepo.findOne({ where: { id } });
        return {
            admin,
        };
    }
};
exports.AdminAdminsService = AdminAdminsService;
exports.AdminAdminsService = AdminAdminsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(admin_entity_1.UserAdmin)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        email_service_1.EmailService])
], AdminAdminsService);
//# sourceMappingURL=admin-admins.service.js.map