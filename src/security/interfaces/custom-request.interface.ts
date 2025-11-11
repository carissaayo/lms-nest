import { Request } from 'express';
import { UserAdmin } from 'src/models/useradmin.schema';

export interface AuthenticatedRequest extends Request {
  user: UserAdmin;
  userId: string;
}
