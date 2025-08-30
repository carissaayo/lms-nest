import { CustomRequest } from 'src/utils/auth-utils';
import { StudentService } from '../services/student.service';
import { QueryString } from 'src/app/database/dbquery';
import { UpdateLessonProgressDTO } from '../student.dto';
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    enroll(courseId: string, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        paymentLink: any;
    }>;
    getLessons(courseId: string, query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        lessons: import("../../lesson/lesson.entity").Lesson[];
        message: string;
    }>;
    getEnrolledCourses(query: QueryString, req: CustomRequest): Promise<{
        page: number | undefined;
        results: number;
        courses: import("../../course/course.entity").Course[];
        message: string;
    }>;
    startLesson(lessonId: string, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        progress: import("../../lesson/lesson-progress.entity").LessonProgress;
    }>;
    updateProgress(lessonId: string, dto: UpdateLessonProgressDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        progress: import("../../lesson/lesson-progress.entity").LessonProgress;
    }>;
    completeLesson(lessonId: string, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        progress: import("../../lesson/lesson-progress.entity").LessonProgress;
    }>;
}
