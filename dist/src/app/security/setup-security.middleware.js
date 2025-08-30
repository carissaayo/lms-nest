"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSecurity = setupSecurity;
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const hpp_1 = __importDefault(require("hpp"));
const compression_1 = __importDefault(require("compression"));
const xss_1 = __importDefault(require("xss"));
const security_config_1 = require("../config/security.config");
function setupSecurity(app) {
    if (security_config_1.securityConfig.logging.enabled) {
        app.use((0, morgan_1.default)(security_config_1.securityConfig.logging.format));
    }
    if (security_config_1.securityConfig.httpsRedirect.enabled) {
        app.use((req, res, next) => {
            if (security_config_1.securityConfig.httpsRedirect.environments.includes(process.env.NODE_ENV || '') &&
                req.headers['x-forwarded-proto'] !== 'https') {
                return res.redirect(`https://${req.headers.host}${req.url}`);
            }
            next();
        });
    }
    if (security_config_1.securityConfig.helmet.enabled) {
        app.use((0, helmet_1.default)(security_config_1.securityConfig.helmet.options));
    }
    if (security_config_1.securityConfig.cors.enabled) {
        app.use((0, cors_1.default)(security_config_1.securityConfig.cors.options));
    }
    if (security_config_1.securityConfig.hpp.enabled) {
        app.use((0, hpp_1.default)(security_config_1.securityConfig.hpp.options));
    }
    if (security_config_1.securityConfig.rateLimit.enabled) {
        app.use((0, express_rate_limit_1.default)(security_config_1.securityConfig.rateLimit.options));
    }
    if (security_config_1.securityConfig.bodyParsers.enabled) {
        if (security_config_1.securityConfig.bodyParsers.json) {
            app.use(require('express').json());
        }
        if (security_config_1.securityConfig.bodyParsers.urlencoded.enabled) {
            app.use(require('express').urlencoded({
                extended: security_config_1.securityConfig.bodyParsers.urlencoded.extended,
            }));
        }
    }
    if (security_config_1.securityConfig.compression.enabled) {
        app.use((0, compression_1.default)(security_config_1.securityConfig.compression.options));
    }
    if (security_config_1.securityConfig.xssSanitization.enabled) {
        app.use((req, res, next) => {
            const sanitize = (data) => {
                if (typeof data === 'string') {
                    return (0, xss_1.default)(data);
                }
                else if (Array.isArray(data)) {
                    return data.map(sanitize);
                }
                else if (typeof data === 'object' && data !== null) {
                    return Object.keys(data).reduce((acc, key) => {
                        acc[key] = sanitize(data[key]);
                        return acc;
                    }, {});
                }
                return data;
            };
            if (req.body) {
                req.body = sanitize(req.body);
            }
            next();
        });
    }
    if (security_config_1.securityConfig.debug.enabled && security_config_1.securityConfig.debug.logRequests) {
        app.use((req, res, next) => {
            console.log('Request received:', req.body);
            next();
        });
    }
}
//# sourceMappingURL=setup-security.middleware.js.map