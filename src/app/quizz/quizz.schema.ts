// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Schema as MongooseSchema } from 'mongoose';
// import { Question, QuestionSchema } from './question.schema';
// import { User } from './user.schema';
// import { Course } from './course.schema';

// @Schema({ timestamps: true })
// export class Quizz extends Document {
//   @Prop({ required: true })
//   title: string;

//   @Prop({ required: true })
//   description: string;

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
//   course: Course | MongooseSchema.Types.ObjectId;

//   @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
//   instructor: User | MongooseSchema.Types.ObjectId;

//   @Prop({ type: [QuestionSchema], default: [] })
//   questions: Question[];

//   @Prop({ default: false })
//   deleted: boolean;

//   @Prop({
//     type: [MongooseSchema.Types.ObjectId],
//     ref: 'User',
//     required: true,
//     default: [],
//   })
//   interestedStudents: (User | MongooseSchema.Types.ObjectId)[];
// }

// export const QuizzSchema = SchemaFactory.createForClass(Quizz);
