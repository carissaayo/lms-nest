"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$npmConfigName1755012581649 = void 0;
class $npmConfigName1755012581649 {
    constructor() {
        this.name = ' $npmConfigName1755012581649';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isVerified" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    }
}
exports.$npmConfigName1755012581649 = $npmConfigName1755012581649;
//# sourceMappingURL=1755012581649-$npm_config_name.js.map