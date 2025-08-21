import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Assignment } from '../assignment.entity';
import { Submission } from 'src/app/submission/submission.entity';
import { Enrollment } from 'src/app/database/main.entity';
import { Course } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';
import { Lesson } from 'src/app/lesson/lesson.entity';
import { customError } from 'libs/custom-handlers';
import { CustomRequest } from 'src/utils/auth-utils';
import { saveFileS3 } from 'src/app/fileUpload/image-upload.service';
import { EmailService } from 'src/app/email/email.service';
import { CreateAssignmentDTO } from '../assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,

    @InjectRepository(Submission)
    private solutionRepo: Repository<Submission>,

    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
    private readonly emailService: EmailService,
  ) {}

  async createAssignment(
    dto: CreateAssignmentDTO,
    files: { file: Express.Multer.File[] },
    req: CustomRequest,
  ) {
    const { title, lessonId, description } = dto;
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });

    if (!lesson) {
      throw customError.notFound('Lesson not found');
    }
    const courseId = lesson?.courseId;

    const instructor = await this.userRepo.findOne({
      where: { id: req.userId },
    });
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }

    if (!instructor.isActive) {
      throw customError.notFound('Your account has been suspended');
    }

    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor', 'category'],
    });

    if (!course) {
      throw customError.notFound('Course not found');
    }

    if (course.instructor.id !== req.userId) {
      throw customError.forbidden('You can only update your  course');
    }
    if (!course) throw new NotFoundException('Course not found');
    try {
      let fileUrl: string | undefined = undefined;
      if (files.file && files.file.length > 0) {
        const file = files.file[0];
        fileUrl = await saveFileS3(file, `lessons/${courseId}/assignments/`);
      }

      const assignment = this.assignmentRepo.create({
        title,
        description,
        fileUrl,
        lesson,
        lessonId: lesson.id,
        instructor,
        instructorId: instructor.id,
      });

      await this.assignmentRepo.save(assignment);

      await this.emailService.AssignmentCreation(
        instructor.email,
        instructor.firstName,
        assignment.title,
        lesson.title,
        course.title,
      );

      return {
        accessToken: req.token,
        message: 'Assignment has been created successfully',
        lesson,
        assignment,
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError(
        error.message || '',
        error.statusCOde || 500,
      );
    }
  }

  //   // 📌 Update assignment (can re-upload file)
  //   async updateAssignment(
  //     assignmentId: number,
  //     updateData: { title?: string; description?: string },
  //     file?: Express.Multer.File,
  //   ): Promise<Assignment> {
  //     const assignment = await this.assignmentRepo.findOne({
  //       where: { id: assignmentId },
  //     });
  //     if (!assignment) throw new NotFoundException('Assignment not found');

  //     if (file) {
  //       if (assignment.fileUrl) {
  //         await deleteFileS3(assignment.fileUrl);
  //       }
  //       assignment.fileUrl = await uploadFileS3(file, 'assignments');
  //     }

  //     if (updateData.title) assignment.title = updateData.title;
  //     if (updateData.description) assignment.description = updateData.description;

  //     return await this.assignmentRepo.save(assignment);
  //   }

  //   // 📌 Delete assignment
  //   async deleteAssignment(assignmentId: number): Promise<void> {
  //     const assignment = await this.assignmentRepo.findOne({
  //       where: { id: assignmentId },
  //     });
  //     if (!assignment) throw new NotFoundException('Assignment not found');

  //     if (assignment.fileUrl) {
  //       await deleteFileS3(assignment.fileUrl);
  //     }

  //     await this.assignmentRepo.remove(assignment);
  //   }

  //   // 📌 Get all assignments for a course
  //   async getAssignmentsByCourse(courseId: number): Promise<Assignment[]> {
  //     return await this.assignmentRepo.find({
  //       where: { course: { id: courseId } },
  //       relations: ['course'],
  //     });
  //   }

  //   // 📌 Submit solution
  //   async submitSolution(
  //     enrollmentId: number,
  //     assignmentId: number,
  //     file: Express.Multer.File,
  //   ): Promise<Solution> {
  //     const enrollment = await this.enrollmentRepo.findOne({
  //       where: { id: enrollmentId },
  //     });
  //     if (!enrollment) throw new NotFoundException('Enrollment not found');

  //     const assignment = await this.assignmentRepo.findOne({
  //       where: { id: assignmentId },
  //     });
  //     if (!assignment) throw new NotFoundException('Assignment not found');

  //     const fileUrl = await uploadFileS3(file, 'solutions');

  //     const solution = this.solutionRepo.create({
  //       fileUrl,
  //       assignment,
  //       enrollment,
  //       grade: null,
  //       feedback: null,
  //     });

  //     return await this.solutionRepo.save(solution);
  //   }

  //   // 📌 Update submitted solution
  //   async updateSolution(
  //     solutionId: number,
  //     file: Express.Multer.File,
  //   ): Promise<Solution> {
  //     const solution = await this.solutionRepo.findOne({
  //       where: { id: solutionId },
  //     });
  //     if (!solution) throw new NotFoundException('Solution not found');

  //     if (solution.fileUrl) {
  //       await deleteFileS3(solution.fileUrl);
  //     }

  //     solution.fileUrl = await uploadFileS3(file, 'solutions');
  //     return await this.solutionRepo.save(solution);
  //   }

  //   // 📌 Mark solution (grade + feedback)
  //   async markSolution(
  //     solutionId: number,
  //     grade: number,
  //     feedback: string,
  //   ): Promise<Solution> {
  //     const solution = await this.solutionRepo.findOne({
  //       where: { id: solutionId },
  //     });
  //     if (!solution) throw new NotFoundException('Solution not found');

  //     solution.grade = grade;
  //     solution.feedback = feedback;

  //     return await this.solutionRepo.save(solution);
  //   }

  //   // 📌 Get solutions for an assignment
  //   async getSolutionsForAssignment(assignmentId: number): Promise<Solution[]> {
  //     return await this.solutionRepo.find({
  //       where: { assignment: { id: assignmentId } },
  //       relations: ['enrollment', 'enrollment.user'],
  //     });
  //   }
}
