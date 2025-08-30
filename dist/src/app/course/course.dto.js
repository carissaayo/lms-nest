"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCourseActionDTO = exports.UpdateCourseDTO = exports.CreateCourseDTO = exports.CourseCategory = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const course_entity_1 = require("./course.entity");
var CourseCategory;
(function (CourseCategory) {
    CourseCategory["DEVELOPMENT"] = "Development";
    CourseCategory["BUSINESS"] = "Business";
    CourseCategory["FINANCE_ACCOUNTING"] = "Finance & Accounting";
    CourseCategory["IT_SOFTWARE"] = "IT & Software";
    CourseCategory["OFFICE_PRODUCTIVITY"] = "Office Productivity";
    CourseCategory["PERSONAL_DEVELOPMENT"] = "Personal Development";
    CourseCategory["DESIGN"] = "Design";
    CourseCategory["MARKETING"] = "Marketing";
    CourseCategory["LIFESTYLE"] = "Lifestyle";
    CourseCategory["PHOTOGRAPHY_VIDEO"] = "Photography & Video";
    CourseCategory["HEALTH_FITNESS"] = "Health & Fitness";
    CourseCategory["MUSIC"] = "Music";
    CourseCategory["TEACHING_ACADEMICS"] = "Teaching & Academics";
})(CourseCategory || (exports.CourseCategory = CourseCategory = {}));
class CreateCourseDTO {
}
exports.CreateCourseDTO = CreateCourseDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'Title must be at least 10 characters long' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(30, { message: 'Title must be at least 30 characters long' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Description is required' }),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'category is required' }),
    __metadata("design:type", String)
], CreateCourseDTO.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'price is required' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateCourseDTO.prototype, "price", void 0);
class UpdateCourseDTO {
}
exports.UpdateCourseDTO = UpdateCourseDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(10, { message: 'Title must be at least 10 characters long' }),
    __metadata("design:type", String)
], UpdateCourseDTO.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(30, { message: 'Description must be at least 30 characters long' }),
    __metadata("design:type", String)
], UpdateCourseDTO.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCourseDTO.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCourseDTO.prototype, "price", void 0);
class AdminCourseActionDTO {
}
exports.AdminCourseActionDTO = AdminCourseActionDTO;
__decorate([
    (0, class_validator_1.IsEnum)(course_entity_1.CourseStatus, {
        message: 'Action must be one of: approved, pending, suspended, rejected',
    }),
    __metadata("design:type", String)
], AdminCourseActionDTO.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.status === course_entity_1.CourseStatus.REJECTED),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({
        message: 'Rejection reason is required when rejecting a course',
    }),
    __metadata("design:type", String)
], AdminCourseActionDTO.prototype, "rejectReason", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.status === course_entity_1.CourseStatus.SUSPENDED),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({
        message: 'Suspension reason is required when suspending a course',
    }),
    __metadata("design:type", String)
], AdminCourseActionDTO.prototype, "suspendReason", void 0);
//# sourceMappingURL=course.dto.js.map