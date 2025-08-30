import { PermissionsEnum } from './admin.interface';
export declare enum SuspendStatus {
    SUSPEND = "suspend",
    ACTIVATE = "activate"
}
export declare enum PermissionsActions {
    ADD = "add",
    REMOVE = "remove"
}
export declare class SuspendUserDTO {
    action: SuspendStatus;
    suspensionReason?: string;
}
export declare class AssignPermissionsDTO {
    permissions: PermissionsEnum[];
    action: PermissionsActions;
}
export declare class AddAnAdminDTO {
    email: string;
}
