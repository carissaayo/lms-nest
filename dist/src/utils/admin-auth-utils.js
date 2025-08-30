"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_ADMIN_PROFILE = void 0;
exports.handleFailedAuthAttempt = handleFailedAuthAttempt;
const custom_handlers_1 = require("../../libs/custom-handlers");
async function handleFailedAuthAttempt(admin, adminRepo) {
    if (admin.failedAuthAttempts >= 5) {
        admin.nextAuthDate = new Date(Date.now() + 120000 * admin.failedAuthAttempts);
    }
    admin.failedAuthAttempts += 1;
    await adminRepo.save(admin);
    throw custom_handlers_1.customError.unauthorized('Invalid credentials', 401);
}
const GET_ADMIN_PROFILE = (admin) => {
    return {
        userId: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        emailVerified: admin.emailVerified,
        permissions: admin.permissions,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
    };
};
exports.GET_ADMIN_PROFILE = GET_ADMIN_PROFILE;
//# sourceMappingURL=admin-auth-utils.js.map