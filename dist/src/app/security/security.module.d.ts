import { OnModuleInit } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
export declare class SecurityModule implements OnModuleInit {
    private app;
    constructor(app: INestApplication);
    onModuleInit(): void;
}
