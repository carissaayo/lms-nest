import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto, RegisterDto, VerifyEmailDTO } from '../auth/auth.dto';
import { CustomRequest, generateToken } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';
import { ProfileInterface } from '../auth/auth.interface';
import { AdminStatus, UserAdmin } from './admin.entity';
import { EmailService } from '../email/email.service';
import { formatPhoneNumber, generateOtp } from 'src/utils/utils';
import {
  GET_ADMIN_PROFILE,
  handleFailedAuthAttempt,
} from 'src/utils/admin-auth-utils';
import { AdminProfileInterface } from './admin.interface';

interface ViewProfileResponse {
  accessToken: string;
  profile: ProfileInterface;
  message: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserAdmin) private adminRepo: Repository<UserAdmin>,
    private emailService: EmailService,
  ) {}

  /**
   * Step 1: Create Admin placeholder by email
   */
  async addAdminByEmail(email: string, req: CustomRequest) {
    const existing = await this.adminRepo.findOne({ where: { email } });
    if (existing) {
      throw customError.conflict('Admin with this email already exists');
    }

    const admin = this.adminRepo.create({
      email,
      signedUp: false,
      isActive: false,
      emailVerified: false,
      status: AdminStatus.PENDING,
    });

    this.adminRepo.save(admin);
    return {
      accessToken: req.token,
      message: 'Admin has ben added successfully',
    };
  }

  /**
   * Step 2: Sign up (activate) the admin
   */
  async adminRegister(registerDto: RegisterDto) {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      password,
      confirmPassword,
    } = registerDto;

    // Check password match
    if (password !== confirmPassword) {
      throw customError.conflict('Passwords do not match ', 409);
    }
    const formattedPhone = formatPhoneNumber(phoneNumber, '234');
    if (formattedPhone?.toString()?.length !== 13) {
      throw customError.badRequest(
        'The phone number you entered is not correct. Please follow this format: 09012345678',
      );
    }

    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin) throw customError.notFound('Admin not found');

    if (admin.signedUp) {
      if (!admin) throw customError.badRequest('Admin already signed up');
    }

    try {
      admin.firstName = firstName;
      admin.lastName = lastName;
      admin.password = password;
      admin.phoneNumber = phoneNumber;
      admin.signedUp = true;
      admin.isActive = true;
      admin.signUpDate = new Date();
      this.adminRepo.save(admin);
      const emailCode = generateOtp('numeric', 8);

      await this.emailService.sendVerificationEmail(email, emailCode);
      return {
        message:
          'User registered successfully. Check your email for the verification link.',
        user: {
          email,
          phoneNumber,
          firstName,
          lastName,
          role: admin.role,
          id: admin.role,
        },
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  async login(loginDto: LoginDto, req: CustomRequest) {
    const { email, password } = loginDto;

    // Find admin by email in Postgres (TypeORM)
    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin) {
      throw customError.unauthorized('admin not found');
    }

    try {
      // validate password using entity method
      const isPasswordValid = await admin.validatePassword(password);

      if (!isPasswordValid) {
        await handleFailedAuthAttempt(admin, this.adminRepo);
      }

      admin.failedAuthAttempts = 0;
      await this.adminRepo.save(admin);

      // Regenerate access token
      const { token, refreshToken, session } = await generateToken(admin, req);

      // Store session in an array as required by the entity
      admin.sessions = [session];
      admin.failedSignInAttempts = 0;
      admin.nextSignInAttempt = new Date();
      await this.adminRepo.save(admin);
      const profile: AdminProfileInterface = GET_ADMIN_PROFILE(admin);

      return {
        accessToken: token,
        refreshToken: refreshToken,
        profile: profile,
        message: 'Signed In successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  /**
   * Step 3: Authenticate admin
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest) {
    const { emailCode } = verifyEmailDto;
    const trimmedEmailCode = emailCode?.trim();

    if (!trimmedEmailCode) {
      throw customError.unauthorized('Please enter the verification code');
    }

    const admin = await this.adminRepo.findOne({
      where: { id: req.userId },
    });
    if (!admin) {
      throw customError.badRequest('Access Denied');
    }

    if (admin.emailVerified) {
      throw customError.badRequest('Email verified already');
    }

    if (admin.emailCode !== trimmedEmailCode) {
      throw customError.badRequest('Invalid verification code');
    }

    try {
      admin.emailVerified = true;
      admin.emailCode = null;

      await this.adminRepo.save(admin);

      const profile: AdminProfileInterface = GET_ADMIN_PROFILE(admin);

      return {
        accessToken: req.token,
        profile,
        message: 'Email Verified Successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  /**
   * Step 4: Soft delete an admin
   */
  //   async softDeleteAdmin(adminId: string): Promise<{ message: string }> {
  //     const admin = await this.adminRepo.findOne({ where: { id: adminId } });
  //     if (!admin) throw new NotFoundException('Admin not found');

  //     admin.deleted = true;
  //     admin.isActive = false;

  //     await this.adminRepo.save(admin);

  //     return { message: 'Admin soft deleted successfully' };
  //   }

  //   /**
  //    * Step 5: Get all admins
  //    */
  //   async getAllAdmins(): Promise<UserAdmin[]> {
  //     return this.adminRepo.find({ where: { deleted: false } });
  //   }

  /**
   * Step 6: Get admin by ID
   */
  //   async getAdminById(id: string) {
  //     const admin = await this.adminRepo.findOne({
  //       where: { id, deleted: false },
  //     });
  //     if (!admin) throw new NotFoundException('Admin not found');
  //     return admin;
  //   }
}
