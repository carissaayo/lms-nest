"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReIssueTokenUserGuard = exports.AuthenticateTokenUserGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../user/user.entity");
const jwt_utils_1 = require("../../../utils/jwt-utils");
const config_1 = __importDefault(require("../../config/config"));
const appConfig = (0, config_1.default)();
let AuthenticateTokenUserGuard = class AuthenticateTokenUserGuard {
    constructor() { }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const JWT_ACCESS_TOKEN_SECRET = appConfig.jwt.access_token;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token || token === 'null') {
            throw new common_1.UnauthorizedException('Access denied. Please include an access token');
        }
        try {
            const verifiedToken = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);
            console.log("verifiedToken", verifiedToken);
            req.userId = verifiedToken.id;
            req.token = token;
            req.user = {
                id: verifiedToken.id,
                role: verifiedToken.role,
            };
            return true;
        }
        catch (err) {
            if (err.message === 'jwt expired') {
                const decoded = jwt.decode(token);
                req.userId = decoded?.id;
                req.token = token;
                throw new common_1.UnauthorizedException('Token expired');
            }
            console.log('err===', err);
            throw new common_1.UnauthorizedException('Access denied. Please re-authorize token');
        }
    }
};
exports.AuthenticateTokenUserGuard = AuthenticateTokenUserGuard;
exports.AuthenticateTokenUserGuard = AuthenticateTokenUserGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AuthenticateTokenUserGuard);
let ReIssueTokenUserGuard = class ReIssueTokenUserGuard {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const JWT_REFRESH_TOKEN_SECRET = appConfig.jwt.refresh_token;
        const JWT_ACCESS_TOKEN_SECRET = appConfig.jwt.access_token;
        if (!req.headers.refreshtoken) {
            throw new common_1.UnauthorizedException('Access denied. Please include a refresh token');
        }
        const user = await this.userRepo.findOne({
            where: { id: req.userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Authorization failed');
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException('Your account has been suspended. Please contact the administrator');
        }
        user.lastSeen = new Date();
        await this.userRepo.save(user);
        const userAgent = req.headers['user-agent'];
        const activeSessions = user.sessions
            ?.filter((obj) => obj.active === true && obj.userAgent === userAgent)
            .map((obj) => obj.refreshtoken) || [];
        const validSession = await (0, jwt_utils_1.verifyRefreshToken)(req.headers.refreshtoken, activeSessions, JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET);
        if (validSession.status === 'failed') {
            throw new common_1.UnauthorizedException(validSession.message);
        }
        if (validSession.status === 'success') {
            req.token = validSession.newToken;
        }
        return true;
    }
};
exports.ReIssueTokenUserGuard = ReIssueTokenUserGuard;
exports.ReIssueTokenUserGuard = ReIssueTokenUserGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReIssueTokenUserGuard);
//# sourceMappingURL=user-auth.guard.js.map