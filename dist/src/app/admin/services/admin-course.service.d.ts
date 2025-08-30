import { Repository } from 'typeorm';
import { EmailService } from '../../email/email.service';
import { UserAdmin } from '../admin.entity';
import { Course } from 'src/app/course/course.entity';
import { CustomRequest } from 'src/utils/auth-utils';
import { QueryString } from 'src/app/database/dbquery';
import { AdminCourseActionDTO } from 'src/app/course/course.dto';
export declare class AdminCoursesService {
    private adminRepo;
    private emailService;
    private readonly courseRepo;
    constructor(adminRepo: Repository<UserAdmin>, emailService: EmailService, courseRepo: Repository<Course>);
    viewCourses(query: QueryString): Promise<{
        page: number | undefined;
        results: number;
        courses: Course[];
        message: string;
    }>;
    approveCourse(courseId: string, dto: AdminCourseActionDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        course: Course;
    }>;
    findAdminById(id: string): Promise<{
        admin: UserAdmin | null;
    }>;
}
