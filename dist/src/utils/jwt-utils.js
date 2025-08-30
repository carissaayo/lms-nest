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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const config_1 = __importDefault(require("../app/config/config"));
const jwt = __importStar(require("jsonwebtoken"));
const appConfig = (0, config_1.default)();
const generateAccessToken = async (id, role, secret) => {
    try {
        console.log('CONFIRMED: ACCESS TOKEN GENERATED!');
        const tokenExpire = '1d';
        return jwt.sign({ id, role }, secret, {
            expiresIn: tokenExpire,
        });
    }
    catch (err) {
        console.error('FAILED TO GENERATE ACCESS TOKEN', err.message);
        throw err;
    }
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = async (id, role, secret) => {
    return jwt.sign({ id, role }, secret);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyRefreshToken = async (refreshToken, sessions, accessTokenSecret, refreshTokenSecret) => {
    console.log('VERIFY REFRESH TOKEN REACHED', refreshToken, sessions);
    if (!refreshToken) {
        return {
            status: 'failed',
            message: 'Access denied. Please submit refresh token',
        };
    }
    if (!sessions.includes(refreshToken)) {
        console.log('SESSION TOKENS NOT IN REFRESH');
        return { status: 'failed', message: 'Token expired. Please re-authorize' };
    }
    return new Promise((resolve) => {
        jwt.verify(refreshToken, refreshTokenSecret, async (err, token) => {
            if (err) {
                console.log('REFRESH TOKEN FAILED');
                resolve({
                    status: 'failed',
                    message: 'Access denied. Please re-authorize token',
                });
            }
            else {
                console.log('ACCESS TOKEN PAYLOAD', token);
                const accessToken = await (0, exports.generateAccessToken)(token.id, token.role, accessTokenSecret);
                console.log('REFRESH ACCESS TOKEN GENERATED', accessToken);
                resolve({
                    status: 'success',
                    newToken: accessToken,
                });
            }
        });
    });
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt-utils.js.map