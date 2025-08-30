import { PaymentService } from '../services/payment.service.';
import { EnrollmentService } from 'src/app/enrollment/services/enrollment.service';
import { CustomRequest } from 'src/utils/auth-utils';
import { EnrollStudentAfterPayment } from 'src/app/enrollment/enrollment.dto';
export declare class PaymentController {
    private readonly paymentService;
    private readonly enrollmentService;
    constructor(paymentService: PaymentService, enrollmentService: EnrollmentService);
    paystackWebhook(req: any, signature: string): Promise<{
        received: boolean;
    }>;
    monnifyWebhook(dto: EnrollStudentAfterPayment, req: CustomRequest): Promise<{
        received: boolean;
    }>;
}
