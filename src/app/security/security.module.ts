// src/security/security.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { setupSecurity } from './setup-security.middleware';

@Module({})
export class SecurityModule implements OnModuleInit {
  private app: INestApplication;

  constructor(app: INestApplication) {
    this.app = app;
  }

  onModuleInit() {
    setupSecurity(this.app.getHttpAdapter().getInstance());
  }
}
