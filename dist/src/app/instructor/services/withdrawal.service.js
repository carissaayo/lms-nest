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
exports.WithdrawalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bank_entity_1 = require("../entities/bank.entity");
const typeorm_2 = require("typeorm");
const earning_entity_1 = require("../entities/earning.entity");
const user_entity_1 = require("../../user/user.entity");
const payment_service_1 = require("../../payment/services/payment.service.");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const email_service_1 = require("../../email/email.service");
const utils_1 = require("../../../utils/utils");
const withdrawal_entity_1 = require("../entities/withdrawal.entity");
const otp_entity_1 = require("../entities/otp.entity");
const dbquery_1 = require("../../database/dbquery");
let WithdrawalService = class WithdrawalService {
    constructor(bankRepo, earningRepo, userRepo, withdrawalRepo, otpRepo, paymentProvider, emailService) {
        this.bankRepo = bankRepo;
        this.earningRepo = earningRepo;
        this.userRepo = userRepo;
        this.withdrawalRepo = withdrawalRepo;
        this.otpRepo = otpRepo;
        this.paymentProvider = paymentProvider;
        this.emailService = emailService;
    }
    async getSupportedBanks() {
        const banks = await this.paymentProvider.getNigierianBanks();
        if (!banks.isValid) {
            throw new Error(banks.message);
        }
        return {
            message: 'Banks fetched successfully',
            banks: banks.data,
        };
    }
    async addBank(dto, req) {
        const instructor = await this.userRepo.findOne({
            where: { id: req.userId },
        });
        if (!instructor)
            throw custom_handlers_1.customError.notFound('Instructor not found');
        const { data } = await this.paymentProvider.verifyBankAccount(dto.accountNumber, dto.bankCode);
        const existingBank = await this.bankRepo.find({
            where: {
                accountName: data.accountName,
                accountNumber: dto.accountNumber,
                bankCode: data.bankCode,
            },
        });
        console.log('existingBank', existingBank);
        if (existingBank.length > 0)
            throw custom_handlers_1.customError.conflict('Bank already exist');
        const bank = this.bankRepo.create({
            ...dto,
            instructor,
            accountName: data.accountName,
        });
        await this.bankRepo.save(bank);
        return {
            message: 'bank added successfully',
            bank,
        };
    }
    async getBanks(instructorId) {
        return await this.bankRepo.find({
            where: { instructor: { id: instructorId } },
        });
    }
    async deleteBank(req, bankId) {
        const bank = await this.bankRepo.findOne({
            where: { id: bankId, instructor: { id: req.userId } },
        });
        if (!bank)
            throw custom_handlers_1.customError.notFound('Bank not found');
        await this.bankRepo.remove(bank);
        return {
            message: 'Bank has removed successfuully',
        };
    }
    async requestWithdrawCode(req, dto) {
        const { bankId, amount } = dto;
        const instructor = await this.userRepo.findOne({
            where: { id: req.userId },
        });
        if (!instructor)
            throw custom_handlers_1.customError.notFound('Instructor not found');
        console.log('instructor', instructor);
        const bank = await this.bankRepo.findOne({
            where: { id: bankId, instructor: { id: instructor.id } },
        });
        if (!bank)
            throw custom_handlers_1.customError.notFound('Bank not found');
        const totalEarnings = await this.earningRepo
            .createQueryBuilder('earning')
            .select('SUM(earning.amount)', 'sum')
            .where('earning.instructor_id = :id', { id: instructor.id })
            .getRawOne();
        const availableBalance = Number(totalEarnings?.sum || 0);
        if (amount > availableBalance)
            throw custom_handlers_1.customError.badRequest('Insufficient balance');
        const withdrawal = this.withdrawalRepo.create({
            user: instructor,
            amount,
            bankId,
        });
        await this.withdrawalRepo.save(withdrawal);
        const code = (0, utils_1.generateOtp)('numeric', 8);
        const otp = this.otpRepo.create({
            user: instructor,
            withdrawal,
            code,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });
        await this.otpRepo.save(otp);
        await this.emailService.withdrawalCodeNotification(instructor.email, `${instructor.firstName} ${instructor.lastName}`, code);
        return {
            message: 'Withdrawal initiated successfully',
            accesToken: req.token,
            withdrawal,
        };
    }
    async confirmWithdrawalCode(req, dto, withdrawalId) {
        const { code } = dto;
        const instructor = await this.userRepo.findOne({
            where: { id: req.userId },
        });
        if (!instructor)
            throw custom_handlers_1.customError.notFound('Instructor not found');
        const withdrawal = await this.withdrawalRepo.findOne({
            where: { id: withdrawalId, user: { id: instructor.id } },
        });
        console.log('withdrawal', withdrawal);
        if (!withdrawal)
            throw custom_handlers_1.customError.notFound('Withdrawal not found');
        if (withdrawal.status !== withdrawal_entity_1.withdrawalStatus.PENDING)
            throw custom_handlers_1.customError.notFound('This withdrawal is no longer active');
        const record = await this.otpRepo.findOne({
            where: { withdrawal: { id: withdrawal.id }, code: code.toString() },
        });
        console.log(record);
        if (!record || record.expiresAt < new Date()) {
            throw custom_handlers_1.customError.badRequest('Invalid or expired code');
        }
        if (record.consumed) {
            throw custom_handlers_1.customError.badRequest('Used code');
        }
        const bank = await this.bankRepo.findOne({
            where: { id: withdrawal.bankId, instructor: { id: instructor.id } },
        });
        if (!bank)
            throw custom_handlers_1.customError.notFound('Bank not found');
        const transferResult = await this.paymentProvider.initiateTransfer({
            accountNumber: bank.accountNumber,
            bankCode: bank.bankCode,
            amount: withdrawal.amount,
            accountName: bank.accountName,
        });
        console.log(transferResult);
        record.consumed = true;
        if (!transferResult.status) {
            withdrawal.status = withdrawal_entity_1.withdrawalStatus.FAILED;
            throw custom_handlers_1.customError.notFound('Withdrawal failed, please try again');
        }
        withdrawal.status = withdrawal_entity_1.withdrawalStatus.SUCCESSFUL;
        await withdrawal.save();
        await record.save();
        await this.emailService.withdrawalNotification(instructor.email, `${instructor.firstName} ${instructor.lastName}`, withdrawal.amount, bank.accountNumber, bank.accountName, code);
        return {
            message: 'Withdrawal initiated successfully',
            accesToken: req.token,
        };
    }
    async getWithdrawals(query, req) {
        const instructor = await this.userRepo.findOne({
            where: { id: req.userId },
        });
        if (!instructor)
            throw custom_handlers_1.customError.notFound('Instructor not found');
        const baseQuery = this.withdrawalRepo
            .createQueryBuilder('withdrawal')
            .leftJoinAndSelect('withdrawal.user', 'user')
            .where('user.id = :instructorId', { instructorId: instructor.id });
        if (query.status) {
            baseQuery.andWhere('withdrawal.status = :status', {
                status: query.status.toLowerCase(),
            });
        }
        const dbQuery = new dbquery_1.DBQuery(baseQuery, 'withdrawal', query);
        dbQuery.filter().sort().limitFields().paginate();
        if (!query.sort) {
            dbQuery.query.addOrderBy('withdrawal.createdAt', 'DESC');
        }
        const [withdrawals, total] = await Promise.all([
            dbQuery.getMany(),
            dbQuery.count(),
        ]);
        return {
            accessToken: req.token,
            page: dbQuery.page,
            results: total,
            withdrawals,
            message: 'Withdrawals fetched successfully',
        };
    }
};
exports.WithdrawalService = WithdrawalService;
exports.WithdrawalService = WithdrawalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_entity_1.Bank)),
    __param(1, (0, typeorm_1.InjectRepository)(earning_entity_1.Earning)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(withdrawal_entity_1.Withdrawal)),
    __param(4, (0, typeorm_1.InjectRepository)(otp_entity_1.Otp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        payment_service_1.PaymentService,
        email_service_1.EmailService])
], WithdrawalService);
//# sourceMappingURL=withdrawal.service.js.map