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
exports.UpdateAssignmentDTO = exports.CreateAssignmentDTO = void 0;
const class_validator_1 = require("class-validator");
class CreateAssignmentDTO {
}
exports.CreateAssignmentDTO = CreateAssignmentDTO;
__decorate([
    (0, class_validator_1.MinLength)(10, { message: 'Title must be at least 10 characters long' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssignmentDTO.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'lessonId is required' }),
    __metadata("design:type", String)
], CreateAssignmentDTO.prototype, "lessonId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Description is required' }),
    __metadata("design:type", String)
], CreateAssignmentDTO.prototype, "description", void 0);
class UpdateAssignmentDTO {
}
exports.UpdateAssignmentDTO = UpdateAssignmentDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'Title must be at least 10 characters long' }),
    __metadata("design:type", String)
], UpdateAssignmentDTO.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'Description must be at least 10 characters long' }),
    __metadata("design:type", String)
], UpdateAssignmentDTO.prototype, "description", void 0);
//# sourceMappingURL=assignment.dto.js.map