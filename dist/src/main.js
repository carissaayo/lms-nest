"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const setup_security_middleware_1 = require("./app/security/setup-security.middleware");
const common_1 = require("@nestjs/common");
const body_parser_1 = __importDefault(require("body-parser"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.use(body_parser_1.default.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        },
    }));
    (0, setup_security_middleware_1.setupSecurity)(app.getHttpAdapter().getInstance());
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map