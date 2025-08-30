import { ConfigService } from '@nestjs/config';
import { CourseStatus } from '../course/course.entity';
export declare class EmailService {
    private readonly configService;
    private transporter;
    constructor(configService: ConfigService);
    private buildTemplate;
    private sendEmail;
    sendVerificationEmail(email: string, code: string): Promise<void>;
    sendPasswordResetEmail(email: string, code: string): Promise<void>;
    sendPasswordChangeNotificationEmail(email: string, firstName: string): Promise<void>;
    courseCreation(email: string, firstName: string, title: string): Promise<void>;
    courseUpdating(email: string, firstName: string, title: string): Promise<void>;
    courseSubmission(email: string, firstName: string, title: string): Promise<void>;
    coursePublish(email: string, firstName: string, title: string): Promise<void>;
    courseDeletion(email: string, firstName: string, title: string): Promise<void>;
    courseStatusEmail(email: string, firstName: string, title: string, status: CourseStatus, reason?: string): Promise<void>;
    LessonCreation(email: string, firstName: string, title: string, lessonTitle: string): Promise<void>;
    LessonUpdating(email: string, firstName: string, title: string, lessonTitle: string): Promise<void>;
    LessonDeletion(email: string, firstName: string, title: string, lessonTitle: string): Promise<void>;
    AssignmentCreation(email: string, firstName: string, title: string, lessonTitle: string, courseTitle: string): Promise<void>;
    AssignmentUpdate(email: string, firstName: string, title: string, lessonTitle: string, courseTitle: string): Promise<void>;
    AssignmentDeletion(email: string, firstName: string, title: string, lessonTitle: string): Promise<void>;
    courseEnrollmentInstructorNotification(instructorEmail: string, instructorName: string, studentName: string, courseTitle: string): Promise<void>;
    withdrawalCodeNotification(instructorEmail: string, instructorName: string, code: string): Promise<void>;
    withdrawalNotification(instructorEmail: string, instructorName: string, amount: number, accountNumber: string, accountName: string, code: string): Promise<void>;
    courseEnrollmentConfirmation(email: string, firstName: string, courseTitle: string): Promise<void>;
    adminInvitationEmail(email: string): Promise<void>;
    suspensionEmail(email: string, firstName: string, action: string, reason?: string): Promise<void>;
    courseEnrollmentAdminNotification(studentName: string, studentEmail: string, courseTitle: string, coursePrice: number, admins: {
        email: string;
    }[]): Promise<void>;
    paymentLinkGenerated(email: string, firstName: string, title: string, price: number, paymentLink: string): Promise<void>;
}
