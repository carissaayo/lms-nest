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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("./user.entity");
const auth_utils_1 = require("../../utils/auth-utils");
const custom_handlers_1 = require("../../../libs/custom-handlers");
let UsersService = class UsersService {
    constructor(usersRepo) {
        this.usersRepo = usersRepo;
    }
    async create(dto) {
        const user = this.usersRepo.create(dto);
        return this.usersRepo.save(user);
    }
    async updateUser(updateProfile, req) {
        console.log('viewProfile');
        const user = await this.usersRepo.findOne({
            where: { id: req.userId },
        });
        if (!user) {
            throw custom_handlers_1.customError.forbidden('Access Denied');
        }
        const profile = (0, auth_utils_1.GET_PROFILE)(user);
        await this.usersRepo.save(user);
        return {
            accessToken: req.token || '',
            profile,
            message: 'Profile fetched successfully',
        };
    }
    async viewProfile(req) {
        console.log('viewProfile');
        const user = await this.usersRepo.findOne({
            where: { id: req.userId },
        });
        if (!user) {
            throw custom_handlers_1.customError.forbidden('Access Denied');
        }
        const profile = (0, auth_utils_1.GET_PROFILE)(user);
        return {
            accessToken: req.token || '',
            profile,
            message: 'Profile fetched successfully',
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], UsersService);
//# sourceMappingURL=user.service.js.map