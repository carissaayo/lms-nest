import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1700000000000 implements MigrationInterface {
  name = 'CreateInitialTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" SERIAL PRIMARY KEY,
                "firstName" VARCHAR NOT NULL,
                "lastName" VARCHAR NOT NULL,
                "email" VARCHAR NOT NULL UNIQUE,
                "password" VARCHAR NOT NULL,
                "phoneNumber" VARCHAR,
                "emailVerified" BOOLEAN NOT NULL DEFAULT false,
                "emailCode" VARCHAR,
                "passwordResetCode" VARCHAR,
                "resetPasswordExpires" TIMESTAMP,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "role" VARCHAR NOT NULL DEFAULT 'user',
                "status" VARCHAR NOT NULL DEFAULT 'active',
                "sessions" JSONB DEFAULT '[]',
                "failedSignInAttempts" INTEGER NOT NULL DEFAULT 0,
                "nextSignInAttempt" TIMESTAMP,
                "walletBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "lastSeen" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "nextAuthDate" TIMESTAMP,
                "failedAuthAttempts" INTEGER NOT NULL DEFAULT 0,
                "nextPasswordResetDate" TIMESTAMP,
                "failedPasswordResetAttempts" INTEGER NOT NULL DEFAULT 0,
                "nextEmailVerifyDate" TIMESTAMP,
                "failedEmailVerifyAttempts" INTEGER NOT NULL DEFAULT 0,
                "isSignedUp" BOOLEAN NOT NULL DEFAULT false,
                "actions" JSONB DEFAULT '[]',
                "phone" VARCHAR,
                "isVerified" BOOLEAN NOT NULL DEFAULT false
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
