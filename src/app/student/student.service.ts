// course.service.ts

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../course/course.schema';
import { User } from '../user/user.schema';
import { Quizz } from '../quizz/quizz.schema';
import { Assignment } from '../assignment/assignment.schema';
import { AuthenticatedRequest } from '../domain/middleware/role.guard';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel('Course') private courseModel: Model<Course>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Quizz') private quizzModel: Model<Quizz>,
    @InjectModel('Assignment') private assignmentModel: Model<Assignment>,
  ) {}

  async registerForCourse(req: AuthenticatedRequest, courseId: string) {
    if (!req.user.isVerified) {
      throw new UnauthorizedException('You have not verified your email');
    }

    const student = await this.userModel.findById({
      _id: req.user.id,
    });

    if (!student) {
      throw new UnauthorizedException(
        'Only verified students can register for a course',
      );
    }

    const course = await this.courseModel.findOne({
      _id: courseId,
      isPublished: true,
    });

    if (!course) {
      throw new NotFoundException("Course isn't available");
    }

    student.enrolledCourses.push(course.id);
    student.completedLectures ??= {};
    student.progress ??= {};
    student.completedLectures[courseId] = [];
    student.progress[courseId] = 0;
    course.studentsEnrolled.push(student.id);

    await course.save();
    await student.save();

    return {
      message: 'You have successfully registered for the course',
      course,
    };
  }

  async getStudentDetails(req: AuthenticatedRequest) {
    const student = await this.userModel
      .findById({ _id: req.user.id })
      .populate('enrolledCourses assignments quizz');

    if (!student) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Student details fetched successfully',
      student,
    };
  }

  async takeQuizz(quizzId: string, courseId: string, user: User) {
    if (!courseId) throw new BadRequestException('No course id was provided');

    const student = await this.userModel.findOne({
      _id: user._id,
      deleted: false,
      role: 'student',
    });

    if (!student || !student.isVerified) {
      throw new UnauthorizedException(
        'Only verified students can take quizzes',
      );
    }

    if (!student.enrolledCourses.includes(courseId)) {
      throw new ForbiddenException("You didn't register for the course");
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    const quizz = await this.quizzModel.findOne({
      _id: quizzId,
      deleted: false,
    });
    if (!quizz) throw new NotFoundException("Quiz can't be found");

    if (course.quizz.toString() !== quizzId) {
      throw new BadRequestException('Quiz not found in this course');
    }

    if (quizz.interestedStudents.includes(user._id)) {
      throw new UnauthorizedException("You can't take a quiz more than once");
    }

    quizz.interestedStudents.push(user._id);
    student.quizz.push(quizz._id);

    await quizz.save();
    await student.save();

    return {
      message: 'Quiz fetched successfully',
      quizz,
    };
  }

  async submitQuizz(quizzId: string, answers: any[], user: User) {
    const student = await this.userModel.findOne({
      _id: user._id,
      deleted: false,
      role: 'student',
    });

    if (!student || !student.isVerified) {
      throw new UnauthorizedException(
        'Only verified students can take quizzes',
      );
    }

    const quizz = await this.quizzModel.findOne({
      _id: quizzId,
      deleted: false,
    });
    if (!quizz) throw new NotFoundException("Quiz can't be found");

    const alreadyAttempted = student.quizz.find(
      (q) => q._id.toString() === quizz._id.toString() && q.totalScore > 0,
    );
    if (alreadyAttempted) {
      throw new UnauthorizedException('You have already attempted the quiz');
    }

    let totalScore = 0;

    for (const answer of answers) {
      const question = quizz.questions.find((q) =>
        q._id.equals(answer.questionId),
      );
      if (!question) continue;

      if (question.correctAnswer === answer.chosenAnswer) {
        totalScore += question.points;
      }
    }

    student.quizz = student.quizz.map((q) =>
      q._id.toString() === quizz._id.toString()
        ? { ...q.toObject(), totalScore }
        : q,
    );

    await student.save();

    return {
      message: 'Quiz has been submitted successfully',
      score: totalScore,
    };
  }

  async submitAssignment(
    assignmentId: string,
    file: Express.Multer.File,
    user: User,
  ) {
    const student = await this.userModel.findOne({
      _id: user._id,
      deleted: false,
      role: 'student',
    });

    if (!student || !student.isVerified) {
      throw new UnauthorizedException(
        'Only verified students can submit assignments',
      );
    }

    const assignment = await this.assignmentModel.findOne({
      _id: assignmentId,
      deleted: false,
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    if (student.assignments.includes(assignmentId)) {
      throw new UnauthorizedException(
        'You have already submitted this assignment',
      );
    }

    const upload = await uploadDocs(null, null, file); // Adjust this according to your setup
    const uploadData = upload.file;

    const studentSubmission = {
      studentId: uploadData.uploader,
      submittedFileId: uploadData._id,
      fileFolder: uploadData.fileFolder,
    };

    assignment.interestedStudents.push(studentSubmission);
    student.assignments.push(assignmentId);

    await assignment.save();
    await student.save();

    return { message: 'Assignment submitted successfully' };
  }

  async addCompletedLecture(
    req: AuthenticatedRequest,
    lectureId: string,
    courseId: string,
  ) {
    const student = await this.userModel.findOne({
      _id: req.user.id,
    });

    if (!student || !student.isVerified) {
      throw new UnauthorizedException('You are not authorized');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    student.completedLectures[courseId] ??= [];
    if (!student.completedLectures[courseId].includes(lectureId)) {
      student.completedLectures[courseId].push(lectureId);
    }

    const totalLectures = course.lectures.length;
    const completed = student.completedLectures[courseId].length;
    student.progress[courseId] = Math.round((completed / totalLectures) * 100);

    await student.save();

    return { message: 'Lecture marked as completed' };
  }
}
