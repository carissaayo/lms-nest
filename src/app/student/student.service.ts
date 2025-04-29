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
import { Course } from '../schemas/course.schema';
import { User } from '../schemas/user.schema';
import { Quizz } from '../schemas/quizz.schema';
import { Assignment } from '../schemas/assignment.schema';
import { uploadDocs } from '../utils/fileUpload';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel('Course') private courseModel: Model<Course>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Quizz') private quizzModel: Model<Quizz>,
    @InjectModel('Assignment') private assignmentModel: Model<Assignment>,
  ) {}

  async registerForCourse(courseId: string, user: User) {
    if (!user.isVerified) {
      throw new UnauthorizedException('You have not verified your email');
    }

    const student = await this.userModel.findOne({
      _id: user._id,
      deleted: false,
      role: 'student',
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

    student.enrolledCourses.push(course);
    student.completedLectures ??= {};
    student.progress ??= {};
    student.completedLectures[courseId] = [];
    student.progress[courseId] = 0;
    course.studentsEnrolled.push(student);

    await course.save();
    await student.save();

    return {
      message: 'You have successfully registered for the course',
      course,
    };
  }

  async getStudentDetails(userId: string, user: User) {
    if (user._id.toString() !== userId) {
      throw new ForbiddenException('You are not allowed');
    }

    const student = await this.userModel
      .findOne({ _id: userId, deleted: false, role: 'student' })
      .populate('enrolledCourses assignments quizz');

    if (!student) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Student details fetched successfully',
      student,
    };
  }

  async getSingleCourse(courseId: string) {
    const deletedCourse = await this.courseModel.findOne({
      _id: courseId,
      deleted: true,
    });

    if (deletedCourse) {
      throw new HttpException(
        { message: 'Course has been deleted', deletedCourse },
        HttpStatus.GONE,
      );
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException("Such course isn't available");
    }

    return {
      message: 'Course has been fetched successfully',
      course,
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

  async addCompletedLecture(lectureId: string, courseId: string, user: User) {
    const student = await this.userModel.findOne({
      _id: user._id,
      deleted: false,
      role: 'student',
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
