import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assignment } from '../schemas/assignment.schema';
import { User } from '../schemas/user.schema';
import { uploadDocs } from '../utils/fileUpload';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name) private assignmentModel: Model<Assignment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createAssignment(req: any, lectureId: string): Promise<any> {
    const user = await this.userModel.findOne({
      _id: req.user.id,
      deleted: false,
      role: 'instructor',
    });
    if (!user)
      throw new UnauthorizedException(
        "Access Denied, you don't have the permission to create an assignment",
      );

    const upload = await uploadDocs(req, req.res, req.file);
    const uploadFile = upload.file;

    const newAssignment = new this.assignmentModel({
      instructor: uploadFile.uploader,
      lecture: lectureId,
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate,
      file: uploadFile._id,
    });

    await newAssignment.save();
    return {
      message: 'Assignment has been created successfully',
      assignment: newAssignment,
    };
  }

  async updateAssignment(req: any, assignmentId: string): Promise<any> {
    const assignment = await this.assignmentModel.findOne({
      _id: assignmentId,
      deleted: false,
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (req.user.id !== assignment.instructor.toString())
      throw new UnauthorizedException(
        "Access Denied, you don't have the permission to update this assignment",
      );

    const { title, description, file, dueDate } = req.body;
    const updated = await this.assignmentModel.findByIdAndUpdate(
      assignmentId,
      { $set: { title, description, file, dueDate } },
      { new: true },
    );
    return {
      message: 'Assignment has been updated successfully',
      Assignment: updated,
    };
  }

  async getSingleAssignment(assignmentId: string): Promise<any> {
    const assignment = await this.assignmentModel.findOne({
      _id: assignmentId,
      deleted: false,
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return {
      message: 'Assignment has been fetched successfully',
      Assignment: assignment,
    };
  }

  async getAssignmentsByInstructor(
    req: any,
    instructorId: string,
  ): Promise<any> {
    if (req.user.id !== instructorId && !req.user.isAdmin)
      throw new UnauthorizedException(
        "Access Denied, you don't have the permission",
      );

    const assignments = await this.assignmentModel.find({
      instructor: instructorId,
      deleted: false,
    });
    if (!assignments || assignments.length === 0)
      throw new NotFoundException('Assignments not found');
    return { message: 'Assignments fetched successfully', assignments };
  }

  async getAllAssignments(req: any): Promise<any> {
    if (!req.user.isAdmin)
      throw new UnauthorizedException(
        "Access Denied, you don't have the permission",
      );

    const assignments = await this.assignmentModel.find({ deleted: false });
    if (!assignments || assignments.length === 0)
      throw new NotFoundException('Assignments not found');
    return { message: 'Assignments fetched successfully', assignments };
  }

  async deleteSingleAssignment(req: any, id: string): Promise<any> {
    const user = await this.userModel.findOne({
      _id: req.user.id,
      deleted: false,
      role: { $in: ['moderator', 'instructor'] },
    });
    if (!user)
      throw new UnauthorizedException(
        "Access Denied, you don't have the permission",
      );

    const assignment = await this.assignmentModel.findOne({
      _id: id,
      deleted: false,
    });
    if (!assignment) throw new NotFoundException('Assignment does not exist');

    await this.assignmentModel.findByIdAndUpdate(id, { deleted: true });
    return { message: 'Assignment deleted successfully' };
  }

  async deleteAssignmentsByInstructor(
    req: any,
    instructorId: string,
  ): Promise<any> {
    if (req.user.id !== instructorId && !req.user.isAdmin)
      throw new UnauthorizedException(
        "Access Denied, you don't have the permission",
      );

    const result = await this.assignmentModel.updateMany(
      { instructor: instructorId, deleted: false },
      { $set: { deleted: true } },
    );

    if (result.modifiedCount === 0)
      throw new NotFoundException('Assignments do not exist');
    return { message: 'Assignments deleted successfully' };
  }
}
