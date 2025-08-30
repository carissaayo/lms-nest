import { Course } from '../course/course.entity';
export interface ProfileInterface {
    userId: any;
    firstName: string | null | undefined;
    lastName: string | null | undefined;
    email: string | null | undefined;
    emailVerified: boolean;
    walletBalance: number;
    phoneNumber: string | null | undefined;
    role: string;
    courses: Course[] | undefined | null;
}
