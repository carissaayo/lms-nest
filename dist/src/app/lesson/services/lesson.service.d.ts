import { Repository } from 'typeorm';
import { CustomRequest } from 'src/utils/auth-utils';
import { Lesson } from '../lesson.entity';
import { Course } from 'src/app/course/course.entity';
import { CreateLessonDTO, UpdateLessonDTO } from '../lesson.dto';
import { User } from 'src/app/user/user.entity';
import { EmailService } from 'src/app/email/email.service';
import { QueryString } from 'src/app/database/dbquery';
export declare class LessonService {
    private readonly lessonRepo;
    private readonly courseRepo;
    private readonly userRepo;
    private readonly emailService;
    constructor(lessonRepo: Repository<Lesson>, courseRepo: Repository<Course>, userRepo: Repository<User>, emailService: EmailService);
    createLesson(dto: CreateLessonDTO, files: {
        video?: Express.Multer.File[];
        note?: Express.Multer.File[];
    }, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        lesson: Lesson;
        course: Course;
    }>;
    updateLesson(dto: UpdateLessonDTO, files: {
        video?: Express.Multer.File[];
        note?: Express.Multer.File[];
    }, req: CustomRequest, lessonId: string): Promise<{
        accessToken: string | undefined;
        message: string;
        lesson: Lesson;
        course: Course;
    }>;
    deleteLesson(lessonId: string, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
    }>;
    getLessons(courseId: string, query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        lessons: Lesson[];
        message: string;
    }>;
}
