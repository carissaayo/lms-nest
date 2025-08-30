"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
const course_entity_1 = require("../course/course.entity");
let EmailService = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('EMAIL_USERNAME'),
                pass: this.configService.get('EMAIL_PASSWORD'),
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('Email service connection error:', error);
            }
            else {
                console.log('✅ Email service is ready to send messages');
            }
        });
    }
    buildTemplate({ title, greeting, body, footer, }) {
        const appName = this.configService.get('app.name') || 'DevLearn';
        return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin:0; padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <tr>
          <td style="background:#4F46E5; padding:20px; text-align:center; color:#ffffff; font-size:20px; font-weight:bold;">
            ${appName}
          </td>
        </tr>
        <tr>
          <td style="padding:20px; color:#333333; font-size:15px; line-height:1.6;">
            ${greeting ? `<p>${greeting}</p>` : ''}
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:20px; background:#f9fafb; color:#555555; font-size:13px; text-align:center;">
            ${footer || `© ${new Date().getFullYear()} ${appName}. All rights reserved.`}
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
    }
    async sendEmail(emailOptions) {
        try {
            const adminEmail = this.configService.get('admin.email');
            const mailOptions = {
                from: adminEmail,
                to: emailOptions.to,
                subject: emailOptions.subject,
                text: emailOptions.text,
                html: emailOptions.html,
            };
            const info = await this.transporter.sendMail(mailOptions);
            console.log('📧 Email sent successfully', info.messageId);
        }
        catch (error) {
            console.error('❌ Error sending email:', error);
        }
    }
    async sendVerificationEmail(email, code) {
        const subject = 'Email Verification';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi,`,
            body: `<p>Your verification code is:</p>
             <h2 style="text-align:center; color:#4F46E5;">${code}</h2>
             <p>Please use this code to verify your email address.</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your verification code is: ${code}`,
            html,
        });
    }
    async sendPasswordResetEmail(email, code) {
        const subject = 'Password Reset';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi,`,
            body: `<p>Your password reset code is:</p>
             <h2 style="text-align:center; color:#DC2626;">${code}</h2>
             <p>This code will expire in 30 minutes. If you didn't request this, please ignore this email.</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your reset code is: ${code}`,
            html,
        });
    }
    async sendPasswordChangeNotificationEmail(email, firstName) {
        const subject = 'Password Changed';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `<p>Your password has been changed successfully.</p>
             <p>If this wasn't you, please contact support immediately.</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Hi ${firstName}, your password has been changed.`,
            html,
        });
    }
    async courseCreation(email, firstName, title) {
        const subject = 'Course Created';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `<p>Your course <strong>${title}</strong> has been created successfully.</p>
             <p>You can now submit it for approval.</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your course ${title} has been created.`,
            html,
        });
    }
    async courseUpdating(email, firstName, title) {
        const subject = 'Course Updated';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `<p>Your course <strong>${title}</strong> has been updated successfully.</p>
             <p>You need to re-submit it for approval.</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your course ${title} was updated.`,
            html,
        });
    }
    async courseSubmission(email, firstName, title) {
        const subject = 'Course Submitted for Approval';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `<p>Your course <strong>${title}</strong> has been submitted for approval.</p>
             <p>We’ll notify you once there’s an update.</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your course ${title} has been submitted.`,
            html,
        });
    }
    async coursePublish(email, firstName, title) {
        const subject = 'Course Publication Successful';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `<p>Your course <strong>${title}</strong> has been published successfully.</p>
             <p>Thank you for choosing our platform.</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your course ${title} has been submitted.`,
            html,
        });
    }
    async courseDeletion(email, firstName, title) {
        const subject = 'Course Deleted';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `<p>Your course <strong>${title}</strong> has been deleted.</p>
             <p>If this wasn’t you, please contact support.</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your course ${title} has been deleted.`,
            html,
        });
    }
    async courseStatusEmail(email, firstName, title, status, reason) {
        let subject;
        let body;
        switch (status) {
            case course_entity_1.CourseStatus.APPROVED:
                subject = 'Course Approved';
                body = `<p>Your course <strong>${title}</strong> has been approved.</p>
              <p>You can now publish it and share with students.</p>`;
                break;
            case course_entity_1.CourseStatus.REJECTED:
                subject = 'Course Rejected';
                body = `<p>Your course <strong>${title}</strong> has been rejected.</p>
              <p>Reason: ${reason || 'Not specified'}.</p>
              <p>You may update and resubmit it for approval.</p>`;
                break;
            case course_entity_1.CourseStatus.SUSPENDED:
                subject = 'Course Suspended';
                body = `<p>Your course <strong>${title}</strong> has been suspended.</p>
              <p>Reason: ${reason || 'Not specified'}.</p>`;
                break;
            case course_entity_1.CourseStatus.PENDING:
                subject = 'Course Pending Review';
                body = `<p>Your course <strong>${title}</strong> is currently pending review.</p>
              <p>We’ll notify you once a decision has been made.</p>`;
                break;
            default:
                subject = 'Course Update';
                body = `<p>Your course <strong>${title}</strong> has been updated.</p>`;
        }
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your course "${title}" status is now ${status}.`,
            html,
        });
    }
    async LessonCreation(email, firstName, title, lessonTitle) {
        const subject = 'New Lesson Created';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `<p>Your course <strong>${title}</strong> now has a new lesson  </p>
             <p>Lesson title: ${lessonTitle}</p>
              <p>You have to resubmit the course
             </p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your course ${title} has been created.`,
            html,
        });
    }
    async LessonUpdating(email, firstName, title, lessonTitle) {
        const subject = 'Course Lesson Updated';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `
      <p>One of your lessons in the course <strong>${title}</strong> has been updated successfully </p>
      <p>Lesson title: <strong>${lessonTitle}</strong> </p>
      <p>You have to resubmit the course
             </p>

             `,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your course ${title} was updated.`,
            html,
        });
    }
    async LessonDeletion(email, firstName, title, lessonTitle) {
        const subject = 'Course Lesson Deleted';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `
      <p>One of your lessons in the course <strong>${title}</strong> has been deleted successfully </p>
      <p>Lesson title: <strong>${lessonTitle}</strong> </p>
             `,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `A lecture ${title} was deleted.`,
            html,
        });
    }
    async AssignmentCreation(email, firstName, title, lessonTitle, courseTitle) {
        const subject = 'New Assignment Created';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `<p>A new assignment has been created for lesson <strong>${title}</strong> on your course <strong>${courseTitle}</strong>  </p>
             <p>Lesson title: ${lessonTitle}</p>
             <p>Assignment title: ${title}</p>
`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Assingment ${title} has been created.`,
            html,
        });
    }
    async AssignmentUpdate(email, firstName, title, lessonTitle, courseTitle) {
        const subject = 'Assignment Updated';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `<p>Your assignment <strong>${title}</strong> has been updated for lesson <strong>${lessonTitle}</strong> on your course <strong>${courseTitle}</strong> </p>
             <p>Lesson title: ${lessonTitle}</p>
             <p>Assignment title: ${title}</p>
`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Assingment ${title} has been updated.`,
            html,
        });
    }
    async AssignmentDeletion(email, firstName, title, lessonTitle) {
        const subject = 'Course Lesson Deleted';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `
      <p>The assignment <strong>${title}</strong>  for  lesson <strong>${lessonTitle}</strong> has been deleted successfully </p>
      <p>Assignment title: <strong>${title}</strong> </p>
      <p>Lesson title: <strong>${lessonTitle}</strong> </p> `,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `A lecture ${title} was deleted.`,
            html,
        });
    }
    async courseEnrollmentInstructorNotification(instructorEmail, instructorName, studentName, courseTitle) {
        const subject = 'New Student Enrollment in Your Course';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${instructorName},`,
            body: `<p>A new student has enrolled in your course <strong>${courseTitle}</strong>.</p>
           <p><strong>Student Name:</strong> ${studentName}</p>
           <p>You can view this student’s progress in your instructor dashboard.</p>`,
        });
        await this.sendEmail({
            to: instructorEmail,
            subject,
            text: `New student enrolled: ${studentName} in ${courseTitle}.`,
            html,
        });
    }
    async withdrawalCodeNotification(instructorEmail, instructorName, code) {
        const subject = 'Withdrawal Confirmation Code';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${instructorName},`,
            body: `<p>You requested to withdraw funds from your instructor account.</p>
           <p>Please use the code below to confirm your withdrawal:</p>
           <h2 style="letter-spacing: 3px; text-align: center;">${code}</h2>
           <p>This code will expire in 10 minutes.</p>`,
        });
        await this.sendEmail({
            to: instructorEmail,
            subject,
            text: `Your withdrawal confirmation code is: ${code}`,
            html,
        });
    }
    async withdrawalNotification(instructorEmail, instructorName, amount, accountNumber, accountName, code) {
        const subject = 'Withdrawal Initiated';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${instructorName},`,
            body: `<p>A withdrawal of ${amount} has been initiated  successfully</p>
           <p>Please use the code below to confirm your withdrawal:</p>
           <p>Account Name: <strong>${accountName}</strong> </p>
           <p>Account NUmber: <strong>${accountNumber}</strong> </p>
                 <p>Withdrawal Amount: <strong>${amount}</strong> </p>
           <p>Thanks for doing business with us</p>`,
        });
        await this.sendEmail({
            to: instructorEmail,
            subject,
            text: `Your withdrawal confirmation code is: ${code}`,
            html,
        });
    }
    async courseEnrollmentConfirmation(email, firstName, courseTitle) {
        const subject = 'Payment Confirmed and Course Enrollment Successful';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `<p>Congratulations! You have been successfully enrolled in <strong>${courseTitle}</strong> .</p>
           <p>You can now start learning at your own pace. Head over to your dashboard to begin.</p>
           <p>We wish you success in your learning journey 🚀</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `You have been successfully enrolled in ${courseTitle}.`,
            html,
        });
    }
    async adminInvitationEmail(email) {
        const subject = 'Admin Invitation';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi,`,
            body: `<p>You have been invited to join our platform as an admin.</p>
             <p>Please click the invitation link to complete your registration.</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `You’ve been invited as an admin.`,
            html,
        });
    }
    async suspensionEmail(email, firstName, action, reason) {
        const isActivated = action === 'activate';
        const subject = `Account ${isActivated ? 'Activated' : 'Suspended'}`;
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: isActivated
                ? `<p>Your account has been activated. Welcome back!</p>`
                : `<p>Your account has been suspended.</p><p>Reason: ${reason || 'Not specified'}.</p>`,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `Your account was ${action}d.`,
            html,
        });
    }
    async courseEnrollmentAdminNotification(studentName, studentEmail, courseTitle, coursePrice, admins) {
        const subject = 'New  Enrollment Payment Notification';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hello Admin,`,
            body: `<p>A new student has successfully enrolled in <strong>${courseTitle}</strong> and made payment of ${coursePrice}.</p>
           <p><strong>Student Name:</strong> ${studentName}</p>
           <p><strong>Student Email:</strong> ${studentEmail}</p>
           <p><strong> Payment made:</strong> ${coursePrice}</p>
           <p>Login to the admin dashboard to view more details.</p>`,
        });
        for (const admin of admins) {
            await this.sendEmail({
                to: admin.email,
                subject,
                text: `New enrollment: ${studentName} (${studentEmail}) in ${courseTitle}.`,
                html,
            });
        }
    }
    async paymentLinkGenerated(email, firstName, title, price, paymentLink) {
        const subject = 'Course Payment Link';
        const html = this.buildTemplate({
            title: subject,
            greeting: `Hi ${firstName},`,
            body: `
      <p>A payment link has been generated for you to enroll in the course <strong>${title}</strong>.</p>
      <p>Kindly visit the link below to complete your payment and enrollment:</p>

      <p><strong>Course title:</strong> ${title}</p>
      <p><strong>Course price:</strong> ₦${price.toLocaleString()}</p>

      <p style="margin:20px 0;">
        <a href="${paymentLink}"
           style="background:#007bff; color:#fff; padding:10px 20px; border-radius:5px; text-decoration:none;">
          Make Payment
        </a>
      </p>

      <p>If the button above isn’t working, copy and paste this URL into your browser:</p>
      <p><strong>${paymentLink}</strong></p>
    `,
        });
        await this.sendEmail({
            to: email,
            subject,
            text: `A payment link has been generated for the course "${title}".`,
            html,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map