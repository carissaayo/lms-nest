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
exports.AdminPaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const admin_entity_1 = require("../admin.entity");
const email_service_1 = require("../../email/email.service");
const dbquery_1 = require("../../database/dbquery");
const payment_entity_1 = require("../../payment/payment.entity");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const withdrawal_entity_1 = require("../../instructor/entities/withdrawal.entity");
let AdminPaymentsService = class AdminPaymentsService {
    constructor(adminRepo, paymentRepo, emailService, withdrawalRepo) {
        this.adminRepo = adminRepo;
        this.paymentRepo = paymentRepo;
        this.emailService = emailService;
        this.withdrawalRepo = withdrawalRepo;
    }
    async getPayments(query, req) {
        const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
        if (!admin)
            throw custom_handlers_1.customError.notFound('Admin not found');
        if (!admin.isActive) {
            throw custom_handlers_1.customError.forbidden('Your account has been suspended');
        }
        const baseQuery = this.paymentRepo
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.student', 'student')
            .leftJoinAndSelect('payment.course', 'course');
        if (query.status) {
            baseQuery.andWhere('payment.status = :status', {
                status: query.status.toLowerCase(),
            });
        }
        if (query.provider) {
            baseQuery.andWhere('payment.provider = :provider', {
                provider: query.provider.toLowerCase(),
            });
        }
        if (query.courseId) {
            baseQuery.andWhere('course.id = :courseId', {
                courseId: query.courseId,
            });
        }
        if (query.studentId) {
            baseQuery.andWhere('student.id = :studentId', {
                studentId: query.studentId,
            });
        }
        const dbQuery = new dbquery_1.DBQuery(baseQuery, 'payment', query);
        dbQuery.filter().sort().limitFields().paginate();
        if (!query.sort) {
            dbQuery.query.addOrderBy('payment.createdAt', 'DESC');
        }
        const [payments, total] = await Promise.all([
            dbQuery.getMany(),
            dbQuery.count(),
        ]);
        return {
            accessToken: req.token,
            page: dbQuery.page,
            results: total,
            payments,
            message: 'Payments fetched successfully',
        };
    }
    async getWithdrawals(query, req) {
        const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
        if (!admin)
            throw custom_handlers_1.customError.notFound('Admin not found');
        if (!admin.isActive) {
            throw custom_handlers_1.customError.forbidden('Your account has been suspended');
        }
        const baseQuery = this.withdrawalRepo
            .createQueryBuilder('withdrawal')
            .leftJoinAndSelect('withdrawal.user', 'user');
        if (query.status) {
            baseQuery.andWhere('withdrawal.status = :status', {
                status: query.status.toLowerCase(),
            });
        }
        if (query.userId) {
            baseQuery.andWhere('user.id = :userId', {
                userId: query.userId,
            });
        }
        if (query.bankId) {
            baseQuery.andWhere('withdrawal.bankId = :bankId', {
                bankId: query.bankId,
            });
        }
        if (query.minAmount) {
            baseQuery.andWhere('withdrawal.amount >= :minAmount', {
                minAmount: query.minAmount,
            });
        }
        if (query.maxAmount) {
            baseQuery.andWhere('withdrawal.amount <= :maxAmount', {
                maxAmount: query.maxAmount,
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
exports.AdminPaymentsService = AdminPaymentsService;
exports.AdminPaymentsService = AdminPaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(admin_entity_1.UserAdmin)),
    __param(1, (0, typeorm_2.InjectRepository)(payment_entity_1.Payment)),
    __param(3, (0, typeorm_2.InjectRepository)(withdrawal_entity_1.Withdrawal)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        email_service_1.EmailService,
        typeorm_1.Repository])
], AdminPaymentsService);
//# sourceMappingURL=admin-payments.service.js.map