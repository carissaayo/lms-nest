import { CustomRequest } from 'src/utils/auth-utils';
import { AdminCoursesService } from '../services/admin-course.service';
import { AdminCourseActionDTO } from 'src/app/course/course.dto';
import { QueryString } from 'src/app/database/dbquery';
export declare class AdminCoursesController {
    private adminCoursesService;
    constructor(adminCoursesService: AdminCoursesService);
    approveCourse(courseId: string, dto: AdminCourseActionDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        course: import("../../course/course.entity").Course;
    }>;
    getCourses(query: QueryString): Promise<{
        page: number | undefined;
        results: number;
        courses: import("../../course/course.entity").Course[];
        message: string;
    }>;
}
