"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const path_1 = require("path");
const config_1 = __importDefault(require("./config"));
const appConfig = (0, config_1.default)();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: appConfig.database.host,
    port: Number(appConfig.database.port),
    username: appConfig.database.user,
    password: appConfig.database.password,
    database: appConfig.database.name,
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    migrations: [(0, path_1.join)(__dirname, 'src/migrations/*.{ts,js}')],
    synchronize: true,
    logging: true,
});
exports.default = AppDataSource;
//# sourceMappingURL=database.config.js.map