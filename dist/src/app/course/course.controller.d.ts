import { CourseService } from './course.service';
import { CustomRequest } from 'src/utils/auth-utils';
import { CreateCourseDTO, UpdateCourseDTO } from './course.dto';
import { QueryString } from '../database/dbquery';
export declare class CourseController {
    private readonly courseService;
    constructor(courseService: CourseService);
    createCourse(createCourseDto: CreateCourseDTO, coverImage: Express.Multer.File, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        course: import("./course.entity").Course;
        message: string;
    }>;
    updateCourse(courseId: string, updateCourseDto: UpdateCourseDTO, coverImage: Express.Multer.File, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        course: import("./course.entity").Course;
        message: string;
    }>;
    getCourses(query: QueryString): Promise<{
        page: number | undefined;
        results: number;
        courses: import("./course.entity").Course[];
        message: string;
    }>;
    deleteCourse(courseId: string, req: CustomRequest): Promise<{
        message: string;
    }>;
    submitCourse(courseId: string, req: CustomRequest): Promise<{
        message: string;
        accessToken: string | undefined;
        course: import("./course.entity").Course;
    }>;
    publishCourse(courseId: string, req: CustomRequest): Promise<{
        message: string;
        accessToken: string | undefined;
        course: import("./course.entity").Course;
    }>;
}
