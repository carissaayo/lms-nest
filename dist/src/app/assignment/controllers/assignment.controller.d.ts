import { AssignmentService } from '../services/assignment.service';
import { CreateAssignmentDTO, UpdateAssignmentDTO } from '../assignment.dto';
import { CustomRequest } from 'src/utils/auth-utils';
import { QueryString } from 'src/app/database/dbquery';
export declare class AssignmentController {
    private readonly assignmentService;
    constructor(assignmentService: AssignmentService);
    createAssignment(dto: CreateAssignmentDTO, file: Express.Multer.File, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        lesson: import("../../lesson/lesson.entity").Lesson;
        assignment: import("../assignment.entity").Assignment;
    }>;
    updateAssignment(assignmentId: string, files: {
        file?: Express.Multer.File[];
    }, dto: UpdateAssignmentDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        lesson: import("../../lesson/lesson.entity").Lesson;
        assignment: import("../assignment.entity").Assignment;
    }>;
    deleteAssignment(assignmentId: string, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
    }>;
    getAssignmentsByCourse(courseId: string, query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        assignments: import("../assignment.entity").Assignment[];
        message: string;
    }>;
    getAssignmentsByInstructor(instructorId: string, query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        assignments: import("../assignment.entity").Assignment[];
        message: string;
    }>;
}
