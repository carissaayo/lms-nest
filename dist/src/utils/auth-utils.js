"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_PROFILE = exports.generateToken = void 0;
exports.handleFailedAuthAttempt = handleFailedAuthAttempt;
const jwt_utils_1 = require("./jwt-utils");
const config_1 = __importDefault(require("../app/config/config"));
const custom_handlers_1 = require("../../libs/custom-handlers");
const appConfig = (0, config_1.default)();
async function handleFailedAuthAttempt(user, usersRepo) {
    if (user.failedAuthAttempts >= 5) {
        user.nextAuthDate = new Date(Date.now() + 120000 * user.failedAuthAttempts);
    }
    user.failedAuthAttempts += 1;
    await usersRepo.save(user);
    throw custom_handlers_1.customError.unauthorized('Invalid credentials');
}
const generateToken = async (user, req) => {
    const JWT_REFRESH_TOKEN_SECRET = appConfig.jwt.refresh_token;
    const JWT_ACCESS_TOKEN_SECRET = appConfig.jwt.access_token;
    const clientIpAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const token = await (0, jwt_utils_1.generateAccessToken)(user.id, user.role, JWT_ACCESS_TOKEN_SECRET);
    const refreshToken = await (0, jwt_utils_1.generateRefreshToken)(user.id, user.role, JWT_REFRESH_TOKEN_SECRET);
    const session = {
        ipAddress: clientIpAddress || '',
        userAgent: userAgent || '',
        date: new Date(Date.now()),
        refreshtoken: refreshToken,
        active: true,
    };
    return {
        token,
        refreshToken,
        session,
    };
};
exports.generateToken = generateToken;
const GET_PROFILE = (user) => {
    return {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        walletBalance: user.walletBalance,
        phoneNumber: user.phoneNumber,
        role: user.role,
        courses: user.courses,
    };
};
exports.GET_PROFILE = GET_PROFILE;
//# sourceMappingURL=auth-utils.js.map