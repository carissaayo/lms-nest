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
exports.AdminAuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const utils_1 = require("../../../utils/utils");
const email_service_1 = require("../../email/email.service");
const auth_utils_1 = require("../../../utils/auth-utils");
const admin_entity_1 = require("../admin.entity");
const admin_auth_utils_1 = require("../../../utils/admin-auth-utils");
let AdminAuthService = class AdminAuthService {
    constructor(usersRepo, emailService) {
        this.usersRepo = usersRepo;
        this.emailService = emailService;
    }
    async register(body) {
        const { email, password, confirmPassword, phoneNumber, firstName, lastName, } = body;
        if (password !== confirmPassword) {
            throw custom_handlers_1.customError.conflict('Passwords do not match ', 409);
        }
        const formattedPhone = (0, utils_1.formatPhoneNumber)(phoneNumber, '234');
        if (formattedPhone?.toString()?.length !== 13) {
            throw custom_handlers_1.customError.badRequest('The phone number you entered is not correct. Please follow this format: 09012345678');
        }
        const existingUser = await this.usersRepo.findOne({ where: { email } });
        if (!existingUser) {
            throw custom_handlers_1.customError.forbidden('You have to be added up first');
        }
        if (existingUser.isActive)
            throw custom_handlers_1.customError.conflict('You have already signed up');
        try {
            const emailCode = (0, utils_1.generateOtp)('numeric', 8);
            await existingUser.hasNewPassword(password);
            existingUser.phoneNumber = phoneNumber;
            existingUser.firstName = firstName;
            existingUser.firstName = firstName;
            const savedUser = await this.usersRepo.save(existingUser);
            const { emailVerified, id, role } = savedUser;
            await this.emailService.sendVerificationEmail(email, emailCode);
            return {
                message: 'User registered successfully. Check your email for the verification link.',
                user: {
                    email,
                    phoneNumber,
                    firstName,
                    lastName,
                    emailVerified,
                    role,
                    id,
                },
            };
        }
        catch (error) {
            throw custom_handlers_1.customError.internalServerError(error.message, 500);
        }
    }
    async login(loginDto, req) {
        const { email, password } = loginDto;
        const user = await this.usersRepo.findOne({ where: { email } });
        if (!user) {
            throw custom_handlers_1.customError.unauthorized('User not found');
        }
        try {
            const isPasswordValid = await user.validatePassword(password);
            console.log('isPass', isPasswordValid);
            if (!isPasswordValid) {
                await (0, admin_auth_utils_1.handleFailedAuthAttempt)(user, this.usersRepo);
            }
            user.failedAuthAttempts = 0;
            await this.usersRepo.save(user);
            const { token, refreshToken, session } = await (0, auth_utils_1.generateToken)(user, req);
            user.sessions = [session];
            user.failedSignInAttempts = 0;
            user.nextSignInAttempt = new Date();
            await this.usersRepo.save(user);
            const profile = (0, admin_auth_utils_1.GET_ADMIN_PROFILE)(user);
            return {
                accessToken: token,
                refreshToken: refreshToken,
                profile: profile,
                message: 'Signed In successfully',
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError(error.message, error.statusCode);
        }
    }
    async verifyEmail(verifyEmailDto, req) {
        const { emailCode } = verifyEmailDto;
        const trimmedEmailCode = emailCode?.trim();
        if (!trimmedEmailCode) {
            throw custom_handlers_1.customError.unauthorized('Please enter the verification code');
        }
        const user = await this.usersRepo.findOne({
            where: { id: req.userId },
        });
        if (!user) {
            throw custom_handlers_1.customError.badRequest('Access Denied');
        }
        if (user.emailVerified) {
            throw custom_handlers_1.customError.badRequest('Email verified already');
        }
        if (user.emailCode !== trimmedEmailCode) {
            throw custom_handlers_1.customError.badRequest('Invalid verification code');
        }
        user.emailVerified = true;
        user.emailCode = null;
        await this.usersRepo.save(user);
        const profile = (0, admin_auth_utils_1.GET_ADMIN_PROFILE)(user);
        return {
            accessToken: req.token,
            profile,
            message: 'Email Verified Successfully',
        };
    }
    async requestResetPassword(resetPasswordDto) {
        console.log('requestResetPassword');
        const { email } = resetPasswordDto;
        const user = await this.usersRepo.findOne({ where: { email } });
        if (!user) {
            throw custom_handlers_1.customError.badRequest('User not found');
        }
        if (!user.isActive) {
            throw custom_handlers_1.customError.badRequest('Your account has been suspended. Please contact the administrator');
        }
        try {
            const resetCode = (0, utils_1.generateOtp)('numeric', 8);
            user.passwordResetCode = resetCode;
            user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
            await this.usersRepo.save(user);
            await this.emailService.sendPasswordResetEmail(email, resetCode);
            return {
                message: 'PASSWORD RESET CODE SENT TO YOUR EMAIL',
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError('Internal Server Error', 500);
        }
    }
    async resetPassword(resetPasswordDto) {
        console.log('resetPassword');
        const { email, passwordResetCode, newPassword } = resetPasswordDto;
        const user = await this.usersRepo.findOne({
            where: {
                email,
                passwordResetCode,
                resetPasswordExpires: (0, typeorm_1.MoreThan)(new Date()),
            },
        });
        if (!user) {
            throw custom_handlers_1.customError.badRequest('Invalid or expired reset code');
        }
        if (!user.isActive) {
            throw custom_handlers_1.customError.badRequest('Your account has been suspended. Please contact the administrator');
        }
        try {
            await user.hasNewPassword(newPassword);
            user.passwordResetCode = null;
            user.resetPasswordExpires = null;
            await this.usersRepo.save(user);
            return {
                message: 'Password reset successfully',
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError('Internal Server Error', 500);
        }
    }
    async changePassword(changePasswordDto, req) {
        console.log('changePassword');
        const { password, newPassword, confirmNewPassword } = changePasswordDto;
        const user = await this.usersRepo.findOne({ where: { id: req.userId } });
        if (!user) {
            throw custom_handlers_1.customError.forbidden('Access Denied');
        }
        try {
            const isPasswordValid = await user.validatePassword(password);
            if (!isPasswordValid) {
                throw custom_handlers_1.customError.badRequest('Current password is incorrect');
            }
            if (newPassword !== confirmNewPassword) {
                throw custom_handlers_1.customError.badRequest('New passwords do not match');
            }
            await user.hasNewPassword(newPassword);
            await this.usersRepo.save(user);
            return {
                message: 'Password changed successfully',
            };
        }
        catch (error) {
            console.log(error);
            throw custom_handlers_1.customError.internalServerError('Internal Server Error', 500);
        }
    }
};
exports.AdminAuthService = AdminAuthService;
exports.AdminAuthService = AdminAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(admin_entity_1.UserAdmin)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        email_service_1.EmailService])
], AdminAuthService);
//# sourceMappingURL=admin-auth.service.js.map