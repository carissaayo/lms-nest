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
