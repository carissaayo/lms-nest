import { Repository } from 'typeorm';
import { Course } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';
import { CustomRequest } from 'src/utils/auth-utils';
import { EmailService } from 'src/app/email/email.service';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { UserAdmin } from 'src/app/admin/admin.entity';
import { Enrollment } from '../enrollment.entity';
import { Payment } from 'src/app/payment/payment.entity';
import { Earning } from 'src/app/instructor/entities/earning.entity';
export declare class EnrollmentService {
    private readonly paymentService;
    private readonly emailService;
    private readonly userRepo;
    private readonly adminRepo;
    private readonly courseRepo;
    private readonly enrollmentRepo;
    private readonly paymentRepo;
    private readonly earningRepo;
    constructor(paymentService: PaymentService, emailService: EmailService, userRepo: Repository<User>, adminRepo: Repository<UserAdmin>, courseRepo: Repository<Course>, enrollmentRepo: Repository<Enrollment>, paymentRepo: Repository<Payment>, earningRepo: Repository<Earning>);
    enrollStudentAfterPayment(dto: any, req: CustomRequest): Promise<Enrollment | {
        enrollment: Enrollment;
        payment: Payment;
        earning: Earning | null;
        message: string;
        accessToken: string | undefined;
    }>;
}
