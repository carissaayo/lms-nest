import { Repository } from 'typeorm';
import { Course } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';
import { Assignment } from 'src/app/assignment/assignment.entity';
import { Submission } from 'src/app/submission/submission.entity';
import { CustomRequest } from 'src/utils/auth-utils';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { EmailService } from 'src/app/email/email.service';
import { QueryString } from 'src/app/database/dbquery';
import { Enrollment } from 'src/app/enrollment/enrollment.entity';
import { Lesson } from 'src/app/lesson/lesson.entity';
import { LessonProgress } from 'src/app/lesson/lesson-progress.entity';
import { UpdateLessonProgressDTO } from '../student.dto';
export declare class StudentService {
    private readonly paymentService;
    private readonly userRepo;
    private readonly courseRepo;
    private readonly enrollmentRepo;
    private readonly assignmentRepo;
    private readonly lessonRepo;
    private readonly submissionRepo;
    private readonly lessonProgressRepo;
    private readonly emailService;
    constructor(paymentService: PaymentService, userRepo: Repository<User>, courseRepo: Repository<Course>, enrollmentRepo: Repository<Enrollment>, assignmentRepo: Repository<Assignment>, lessonRepo: Repository<Lesson>, submissionRepo: Repository<Submission>, lessonProgressRepo: Repository<LessonProgress>, emailService: EmailService);
    enroll(courseId: string, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        paymentLink: any;
    }>;
    handleSuccessfulPayment(studentId: string, courseId: string, reference: string): Promise<Enrollment | undefined>;
    getLessonsForStudent(courseId: string, query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        lessons: Lesson[];
        message: string;
    }>;
    startLesson(lessonId: string, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        progress: LessonProgress;
    }>;
    updateProgress(lessonId: string, dto: UpdateLessonProgressDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        progress: LessonProgress;
    }>;
    completeLesson(lessonId: string, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        progress: LessonProgress;
    }>;
    viewEnrolledCourses(query: QueryString, req: CustomRequest): Promise<{
        page: number | undefined;
        results: number;
        courses: Course[];
        message: string;
    }>;
}
