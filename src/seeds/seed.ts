import { Assignment } from 'src/app/assignment/assignment.entity';
import AppDataSource from 'src/app/config/database.config';
import { Course } from 'src/app/course/course.entity';
import { User, UserRole } from 'src/app/user/user.entity';

async function seed() {
  await AppDataSource.initialize();
  console.log('DB Connected. Seeding...');

  const userRepo = AppDataSource.getRepository(User);
  const courseRepo = AppDataSource.getRepository(Course);
  const assignmentRepo = AppDataSource.getRepository(Assignment);

  const admin = userRepo.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'hashedpassword',
    role: UserRole.ADMIN,
  });
  await userRepo.save(admin);

  const course = courseRepo.create({
    title: 'Intro to React',
    description: 'Learn React from scratch',
    instructor: admin,
  });
  await courseRepo.save(course);

  // const assignment = assignmentRepo.create({
  //   title: 'React Basics',
  //   course,
  //   dueDate: new Date(),
  //   maxScore: 100,
  // });
  // await assignmentRepo.save(assignment);

  console.log('✅ Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
