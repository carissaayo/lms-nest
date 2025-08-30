import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { Course } from './course.entity';
import { User } from '../user/user.entity';
import { Category } from '../database/main.entity';
import { CreateCourseDTO } from './course.dto';
import { CustomRequest } from 'src/utils/auth-utils';
import { QueryString } from '../database/dbquery';
export declare class CourseService {
    private readonly courseRepo;
    private readonly userRepo;
    private readonly categoryRepo;
    private readonly emailService;
    constructor(courseRepo: Repository<Course>, userRepo: Repository<User>, categoryRepo: Repository<Category>, emailService: EmailService);
    createCourse(createCourseDto: CreateCourseDTO, coverImage: Express.Multer.File, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        course: Course;
        message: string;
    }>;
    updateCourse(courseId: string, updateCourseDto: Partial<CreateCourseDTO>, coverImage: Express.Multer.File, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        course: Course;
        message: string;
    }>;
    viewCourses(query: QueryString): Promise<{
        page: number | undefined;
        results: number;
        courses: Course[];
        message: string;
    }>;
    deleteCourse(courseId: string, req: CustomRequest): Promise<{
        message: string;
    }>;
    submitCourse(courseId: string, req: CustomRequest): Promise<{
        message: string;
        accessToken: string | undefined;
        course: Course;
    }>;
    publishCourse(courseId: string, req: CustomRequest): Promise<{
        message: string;
        accessToken: string | undefined;
        course: Course;
    }>;
}
