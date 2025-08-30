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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("../services/payment.service.");
const enrollment_service_1 = require("../../enrollment/services/enrollment.service");
const enrollment_dto_1 = require("../../enrollment/enrollment.dto");
let PaymentController = class PaymentController {
    constructor(paymentService, enrollmentService) {
        this.paymentService = paymentService;
        this.enrollmentService = enrollmentService;
    }
    async paystackWebhook(req, signature) {
        const rawBody = req.rawBody;
        const isValid = this.paymentService.validatePaystackWebhook(rawBody, signature);
        if (isValid) {
            const dto = JSON.parse(rawBody.toString());
            console.log('dto===', dto);
            await this.enrollmentService.enrollStudentAfterPayment(dto, req);
        }
        return { received: true };
    }
    async monnifyWebhook(dto, req) {
        console.log('Monnify webhook received:', dto);
        const result = this.paymentService.validateMonnifyWebhook(dto);
        if (result?.status === 'success') {
            await this.enrollmentService.enrollStudentAfterPayment(dto, req);
        }
        return { received: true };
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('paystack/webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-paystack-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "paystackWebhook", null);
__decorate([
    (0, common_1.Post)('monnify/webhook'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enrollment_dto_1.EnrollStudentAfterPayment, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "monnifyWebhook", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService,
        enrollment_service_1.EnrollmentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map