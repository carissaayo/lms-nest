"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const course_entity_1 = require("../course/course.entity");
const user_entity_1 = require("../user/user.entity");
const main_entity_1 = require("../database/main.entity");
const lesson_service_1 = require("./services/lesson.service");
const lesson_entity_1 = require("./lesson.entity");
const email_service_1 = require("../email/email.service");
const lesson_controller_1 = require("./controllers/lesson.controller");
let LessonModule = class LessonModule {
};
exports.LessonModule = LessonModule;
exports.LessonModule = LessonModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([course_entity_1.Course, main_entity_1.Category, user_entity_1.User, lesson_entity_1.Lesson])],
        providers: [lesson_service_1.LessonService, email_service_1.EmailService],
        controllers: [lesson_controller_1.LessonController],
        exports: [lesson_service_1.LessonService, typeorm_1.TypeOrmModule],
    })
], LessonModule);
//# sourceMappingURL=lesson.module.js.map