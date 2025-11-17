export interface AdminProfileInterface {
  userId: any;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  email: string | null | undefined;
  emailVerified: boolean;
  phoneNumber: string | null | undefined;
  role: string;
  permissions: string[] | null | undefined;
  state: string | null | undefined;
  city: string | null | undefined;
  country: string | null | undefined;
  picture: string | null | undefined;
  street: string | null | undefined;
  bio: string | null | undefined;
}

export enum PermissionsEnum {
  ADMIN_USERS = 'admin_users',
  ADMIN_PAYMENTS = 'admin_payments',
  ADMIN_COURSES = 'admin_courses',
  ADMIN_PERMISSIONS = 'admin_permissions',
  ADMIN_ADMINS = 'admin_admins',
  SUPER_ADMIN = 'super_admin',
}


export enum Permission {
  PAYMENT_LEVEL_1 = 'admin_payment_1',
  PAYMENT_LEVEL_2 = 'admin_payment_2',
  PAYMENT_LEVEL_3 = 'admin_payment_3',
  ORGANIZATION_LEVEL_1 = 'admin_organization_1',
  ORGANIZATION_LEVEL_2 = 'admin_organization_2',
  ORGANIZATION_LEVEL_3 = 'admin_organization_3',
  USER_LEVEL_1 = 'admin_user_1',
  USER_LEVEL_2 = 'admin_user_2',
  USER_LEVEL_3 = 'admin_user_3',
  PRODUCT_LEVEL_1 = 'admin_product_1',
  PRODUCT_LEVEL_2 = 'admin_product_2',
  PRODUCT_LEVEL_3 = 'admin_product_3',
  LOAN_LEVEL_1 = 'admin_loan_1',
  LOAN_LEVEL_2 = 'admin_loan_2',
  LOAN_LEVEL_3 = 'admin_loan_3',
  MERCHANT_LEVEL_1 = 'admin_merchant_1',
  MERCHANT_LEVEL_2 = 'admin_merchant_2',
  MERCHANT_LEVEL_3 = 'admin_merchant_3',
  SUPERSTORE_LEVEL_1 = 'admin_superstore_1',
  SUPERSTORE_LEVEL_2 = 'admin_superstore_2',
  SUPERSTORE_LEVEL_3 = 'admin_superstore_3',
  STORE_LEVEL_1 = 'admin_store_1',
  STORE_LEVEL_2 = 'admin_store_2',
  STORE_LEVEL_3 = 'admin_store_3',
  GADGET_LEVEL_1 = 'admin_gadget_1',
  GADGET_LEVEL_2 = 'admin_gadget_2',
  GADGET_LEVEL_3 = 'admin_gadget_3',
  BNPL_LEVEL_1 = 'admin_bnpl_1',
  BNPL_LEVEL_2 = 'admin_bnpl_2',
  BNPL_LEVEL_3 = 'admin_bnpl_3',
  BANK_LEVEL_1 = 'admin_bank_1',
  BANK_LEVEL_2 = 'admin_bank_2',
  BANK_LEVEL_3 = 'admin_bank_3',
  DISBURSEMENT_LEVEL_1 = 'admin_disbursement_1',
  DISBURSEMENT_LEVEL_2 = 'admin_disbursement_2',
  DISBURSEMENT_LEVEL_3 = 'admin_disbursement_3',
}
