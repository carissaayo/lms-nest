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
exports.AddAnAdminDTO = exports.AssignPermissionsDTO = exports.SuspendUserDTO = exports.PermissionsActions = exports.SuspendStatus = void 0;
const class_validator_1 = require("class-validator");
const admin_interface_1 = require("./admin.interface");
var SuspendStatus;
(function (SuspendStatus) {
    SuspendStatus["SUSPEND"] = "suspend";
    SuspendStatus["ACTIVATE"] = "activate";
})(SuspendStatus || (exports.SuspendStatus = SuspendStatus = {}));
var PermissionsActions;
(function (PermissionsActions) {
    PermissionsActions["ADD"] = "add";
    PermissionsActions["REMOVE"] = "remove";
})(PermissionsActions || (exports.PermissionsActions = PermissionsActions = {}));
class SuspendUserDTO {
}
exports.SuspendUserDTO = SuspendUserDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(SuspendStatus, {
        message: 'Action must be either suspend or activate',
    }),
    __metadata("design:type", String)
], SuspendUserDTO.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.action === SuspendStatus.SUSPEND),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({
        message: 'Suspension reason is required when suspending a user',
    }),
    __metadata("design:type", String)
], SuspendUserDTO.prototype, "suspensionReason", void 0);
class AssignPermissionsDTO {
}
exports.AssignPermissionsDTO = AssignPermissionsDTO;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)({ message: 'Permissions array must not be empty' }),
    (0, class_validator_1.IsEnum)(admin_interface_1.PermissionsEnum, { each: true }),
    __metadata("design:type", Array)
], AssignPermissionsDTO.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(PermissionsActions, {
        message: 'Action must be either add or remove',
    }),
    __metadata("design:type", String)
], AssignPermissionsDTO.prototype, "action", void 0);
class AddAnAdminDTO {
}
exports.AddAnAdminDTO = AddAnAdminDTO;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddAnAdminDTO.prototype, "email", void 0);
//# sourceMappingURL=admin.dto.js.map