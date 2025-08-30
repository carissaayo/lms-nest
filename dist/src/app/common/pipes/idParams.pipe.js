"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUIDValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let UUIDValidationPipe = class UUIDValidationPipe {
    transform(value) {
        console.log('🚀 Incoming value for UUID pipe:', value, typeof value);
        if (typeof value !== 'string') {
            throw new common_1.BadRequestException('The value passed as UUID is not a string');
        }
        if (!(0, uuid_1.validate)(value)) {
            throw new common_1.BadRequestException(`Invalid UUID format: ${value}`);
        }
        return value;
    }
};
exports.UUIDValidationPipe = UUIDValidationPipe;
exports.UUIDValidationPipe = UUIDValidationPipe = __decorate([
    (0, common_1.Injectable)()
], UUIDValidationPipe);
//# sourceMappingURL=idParams.pipe.js.map