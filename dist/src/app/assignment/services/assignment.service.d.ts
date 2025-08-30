import { Repository } from 'typeorm';
import { Assignment } from '../assignment.entity';
import { Course } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';
import { Lesson } from 'src/app/lesson/lesson.entity';
import { CustomRequest } from 'src/utils/auth-utils';
import { EmailService } from 'src/app/email/email.service';
import { CreateAssignmentDTO, UpdateAssignmentDTO } from '../assignment.dto';
import { QueryString } from 'src/app/database/dbquery';
export declare class AssignmentService {
    private assignmentRepo;
    private courseRepo;
    private userRepo;
    private lessonRepo;
    private readonly emailService;
    constructor(assignmentRepo: Repository<Assignment>, courseRepo: Repository<Course>, userRepo: Repository<User>, lessonRepo: Repository<Lesson>, emailService: EmailService);
    createAssignment(dto: CreateAssignmentDTO, file: Express.Multer.File, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        lesson: Lesson;
        assignment: Assignment;
    }>;
    updateAssignment(assignmentId: string, dto: UpdateAssignmentDTO, files: {
        file?: Express.Multer.File[];
    }, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
        lesson: Lesson;
        assignment: Assignment;
    }>;
    deleteAssignment(assignmentId: string, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
    }>;
    getAssignmentsInCourse(courseId: string, query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        assignments: Assignment[];
        message: string;
    }>;
    getAssignmentsByInstructor(instructorId: string, query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        assignments: Assignment[];
        message: string;
    }>;
}
