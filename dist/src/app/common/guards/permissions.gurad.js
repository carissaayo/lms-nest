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
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const public_decorator_1 = require("../decorators/public.decorator");
const admin_interface_1 = require("../../admin/admin.interface");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
const admin_admins_service_1 = require("../../admin/services/admin-admins.service");
let PermissionsGuard = class PermissionsGuard {
    constructor(reflector, adminService) {
        this.reflector = reflector;
        this.adminService = adminService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const requiredPermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermissions)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const { admin } = await this.adminService.findAdminById(user.id);
        console.log(admin);
        if (!admin || !admin.permissions || admin.permissions.length === 0) {
            throw custom_handlers_1.customError.forbidden('No permissions assigned yet');
        }
        if (!admin.isActive) {
            throw custom_handlers_1.customError.forbidden('Your account is suspended');
        }
        if (admin.permissions.includes(admin_interface_1.PermissionsEnum.SUPER_ADMIN)) {
            return true;
        }
        const hasPermission = requiredPermissions.every((permission) => admin.permissions.includes(permission));
        if (!hasPermission) {
            throw custom_handlers_1.customError.forbidden(`You lack the required permissions: ${requiredPermissions.join(', ')}`);
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        admin_admins_service_1.AdminAdminsService])
], PermissionsGuard);
//# sourceMappingURL=permissions.gurad.js.map