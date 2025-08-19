import { Permissions } from '../common/decorators/permissions.decorator';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { PermissionsEnum } from './admin.interface';

export enum SuspendStatus {
  SUSPEND = 'suspend',
  ACTIVATE = 'activate',
}

export enum PermissionsActions {
  ADD = 'add',
  REMOVE = 'remove',
}
export class SuspendUserDTO {
  @IsString()
  @IsNotEmpty()
  @IsEnum(SuspendStatus, {
    message: 'Action must be either suspend or activate',
  })
  action: SuspendStatus;

  @ValidateIf((o) => o.action === SuspendStatus.SUSPEND)
  @IsString()
  @IsNotEmpty({
    message: 'Suspension reason is required when suspending a user',
  })
  suspensionReason?: string;
}

export class AssignPermissionsDTO {
  @IsArray()
  @ArrayNotEmpty({ message: 'Permissions array must not be empty' })
  @IsEnum(PermissionsEnum, { each: true })
  permissions: PermissionsEnum[];

  @IsString()
  @IsNotEmpty()
  @IsEnum(PermissionsActions, {
    message: 'Action must be either add or remove',
  })
  action: PermissionsActions;
}

export class AddAnAdminDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
