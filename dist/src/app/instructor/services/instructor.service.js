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
exports.InstructorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../user/user.entity");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const email_service_1 = require("../../email/email.service");
const earning_entity_1 = require("../entities/earning.entity");
const withdrawal_entity_1 = require("../entities/withdrawal.entity");
let InstructorService = class InstructorService {
    constructor(userRepo, withdrawalRepo, earningRepo, emailService) {
        this.userRepo = userRepo;
        this.withdrawalRepo = withdrawalRepo;
        this.earningRepo = earningRepo;
        this.emailService = emailService;
    }
    async getInstructorBalance(req) {
        const instructor = await this.userRepo.findOne({
            where: { id: req.userId },
        });
        if (!instructor)
            throw custom_handlers_1.customError.notFound('Instructor not found');
        const earnings = await this.earningRepo.find({
            where: { instructor: { id: instructor.id } },
            order: { createdAt: 'DESC' },
        });
        const withdrawals = await this.withdrawalRepo.find({
            where: {
                user: { id: instructor.id },
                status: withdrawal_entity_1.withdrawalStatus.SUCCESSFUL,
            },
            order: { createdAt: 'DESC' },
        });
        if (!earnings || earnings.length === 0) {
            return {
                totalEarnings: 0,
                totalWithdrawals: 0,
                availableBalance: 0,
            };
        }
        const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
        const availableBalance = totalEarnings - totalWithdrawals;
        return {
            message: 'Wallet has been fetched successfully',
            wallet: {
                availableBalance,
                totalEarnings,
                totalWithdrawals,
            },
            accessToken: req.token,
        };
    }
};
exports.InstructorService = InstructorService;
exports.InstructorService = InstructorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(withdrawal_entity_1.Withdrawal)),
    __param(2, (0, typeorm_1.InjectRepository)(earning_entity_1.Earning)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], InstructorService);
//# sourceMappingURL=instructor.service.js.map