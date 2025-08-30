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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmWithdrawDto = exports.WithdrawDto = exports.AddBankDto = void 0;
const class_validator_1 = require("class-validator");
class AddBankDto {
}
exports.AddBankDto = AddBankDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'accountNumber is required' }),
    __metadata("design:type", String)
], AddBankDto.prototype, "accountNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'bankName is required' }),
    __metadata("design:type", String)
], AddBankDto.prototype, "bankName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'bankCode is required' }),
    __metadata("design:type", String)
], AddBankDto.prototype, "bankCode", void 0);
class WithdrawDto {
}
exports.WithdrawDto = WithdrawDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'bankId is required' }),
    __metadata("design:type", String)
], WithdrawDto.prototype, "bankId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'amount is required' }),
    __metadata("design:type", Number)
], WithdrawDto.prototype, "amount", void 0);
class ConfirmWithdrawDto {
}
exports.ConfirmWithdrawDto = ConfirmWithdrawDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'code is required' }),
    __metadata("design:type", String)
], ConfirmWithdrawDto.prototype, "code", void 0);
//# sourceMappingURL=withdrawal.dto.js.map