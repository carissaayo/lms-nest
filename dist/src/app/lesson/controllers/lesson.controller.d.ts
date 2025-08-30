import { CustomRequest } from 'src/utils/auth-utils';
import { LessonService } from '../services/lesson.service';
import { CreateLessonDTO, UpdateLessonDTO } from '../lesson.dto';
import { QueryString } from 'src/app/database/dbquery';
export declare class LessonController {
    private readonly lessonService;
    constructor(lessonService: LessonService);
    createLesson(dto: CreateLessonDTO, files: {
        video?: Express.Multer.File[];
        note?: Express.Multer.File[];
    }, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        lesson: import("../lesson.entity").Lesson;
        course: import("../../course/course.entity").Course;
    }>;
    updateLesson(lessonId: string, dto: UpdateLessonDTO, files: {
        video?: Express.Multer.File[];
        note?: Express.Multer.File[];
    }, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        lesson: import("../lesson.entity").Lesson;
        course: import("../../course/course.entity").Course;
    }>;
    deleteLesson(lessonId: string, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
    }>;
    getLessons(courseId: string, query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        lessons: import("../lesson.entity").Lesson[];
        message: string;
    }>;
}
