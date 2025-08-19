export interface AdminProfileInterface {
  userId: any;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  email: string | null | undefined;
  emailVerified: boolean;
  phoneNumber: string | null | undefined;
  role: string;
  permissions: string[] | null | undefined;
}

export enum PermissionsEnum {
  ADMIN_USERS = 'admin_users',
  ADMIN_PAYMENTS = 'admin_payments',
  ADMIN_COURSES = 'admin_courses',
  ADMIN_PERMISSIONS = 'admin_permissions',
  ADMIN_ADMINS = 'admin_admins',
  SUPER_ADMIN = 'super_admin',
}
