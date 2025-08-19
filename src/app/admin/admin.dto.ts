import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export enum SuspendStatus {
  SUSPEND = 'suspend',
  ACTIVATE = 'activate',
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
