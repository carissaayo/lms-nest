// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as nodemailer from 'nodemailer';
// import { CourseStatus } from '../course/course.entity';

// interface EmailOptions {
//   to: string;
//   subject: string;
//   text: string;
//   html?: string;
// }

// @Injectable()
// export class EmailService {
//   private transporter;

//   constructor(private readonly configService: ConfigService) {
//     this.transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: this.configService.get<string>('EMAIL_USERNAME'),
//         pass: this.configService.get<string>('EMAIL_PASSWORD'),
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });

//     this.transporter.verify((error, success) => {
//       if (error) {
//         console.error('Email service connection error:', error);
//       } else {
//         console.log('✅ Email service is ready to send messages');
//       }
//     });
//   }

//   private buildTemplate({
//     title,
//     greeting,
//     body,
//     footer,
//   }: {
//     title: string;
//     greeting?: string;
//     body: string;
//     footer?: string;
//   }): string {
//     const appName = this.configService.get<string>('app.name') || 'DevLearn';
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8" />
//       <title>${title}</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin:0; padding:20px;">
//       <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
//         <tr>
//           <td style="background:#4F46E5; padding:20px; text-align:center; color:#ffffff; font-size:20px; font-weight:bold;">
//             ${appName}
//           </td>
//         </tr>
//         <tr>
//           <td style="padding:20px; color:#333333; font-size:15px; line-height:1.6;">
//             ${greeting ? `<p>${greeting}</p>` : ''}
//             ${body}
//           </td>
//         </tr>
//         <tr>
//           <td style="padding:20px; background:#f9fafb; color:#555555; font-size:13px; text-align:center;">
//             ${footer || `© ${new Date().getFullYear()} ${appName}. All rights reserved.`}
//           </td>
//         </tr>
//       </table>
//     </body>
//     </html>
//     `;
//   }

//   private async sendEmail(emailOptions: EmailOptions) {
//     try {
//       const adminEmail = this.configService.get<string>('admin.email');
//       const mailOptions = {
//         from: adminEmail,
//         to: emailOptions.to,
//         subject: emailOptions.subject,
//         text: emailOptions.text,
//         html: emailOptions.html,
//       };

//       const info = await this.transporter.sendMail(mailOptions);
//       console.log('📧 Email sent successfully', info.messageId);
//     } catch (error) {
//       console.error('❌ Error sending email:', error);
//     }
//   }

//   // ========== AUTH RELATED ==========

//   async sendVerificationEmail(email: string, code: string) {
//     const subject = 'Email Verification';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi,`,
//       body: `<p>Your verification code is:</p>
//              <h2 style="text-align:center; color:#4F46E5;">${code}</h2>
//              <p>Please use this code to verify your email address.</p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your verification code is: ${code}`,
//       html,
//     });
//   }

//   async sendPasswordResetEmail(email: string, code: string) {
//     const subject = 'Password Reset';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi,`,
//       body: `<p>Your password reset code is:</p>
//              <h2 style="text-align:center; color:#DC2626;">${code}</h2>
//              <p>This code will expire in 30 minutes. If you didn't request this, please ignore this email.</p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your reset code is: ${code}`,
//       html,
//     });
//   }

//   async sendPasswordChangeNotificationEmail(email: string, firstName: string) {
//     const subject = 'Password Changed';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `<p>Your password has been changed successfully.</p>
//              <p>If this wasn't you, please contact support immediately.</p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Hi ${firstName}, your password has been changed.`,
//       html,
//     });
//   }

//   // ========== COURSE RELATED ==========

//   async courseCreation(email: string, firstName: string, title: string) {
//     const subject = 'Course Created';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `<p>Your course <strong>${title}</strong> has been created successfully.</p>
//              <p>You can now submit it for approval.</p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your course ${title} has been created.`,
//       html,
//     });
//   }

//   async courseUpdating(email: string, firstName: string, title: string) {
//     const subject = 'Course Updated';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `<p>Your course <strong>${title}</strong> has been updated successfully.</p>
//              <p>You need to re-submit it for approval.</p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your course ${title} was updated.`,
//       html,
//     });
//   }

//   async courseSubmission(email: string, firstName: string, title: string) {
//     const subject = 'Course Submitted for Approval';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `<p>Your course <strong>${title}</strong> has been submitted for approval.</p>
//              <p>We’ll notify you once there’s an update.</p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your course ${title} has been submitted.`,
//       html,
//     });
//   }

//   async coursePublish(email: string, firstName: string, title: string) {
//     const subject = 'Course Publication Successful';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `<p>Your course <strong>${title}</strong> has been published successfully.</p>
//              <p>Thank you for choosing our platform.</p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your course ${title} has been submitted.`,
//       html,
//     });
//   }

//   async courseDeletion(email: string, firstName: string, title: string) {
//     const subject = 'Course Deleted';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `<p>Your course <strong>${title}</strong> has been deleted.</p>
//              <p>If this wasn’t you, please contact support.</p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your course ${title} has been deleted.`,
//       html,
//     });
//   }

//   async courseStatusEmail(
//     email: string,
//     firstName: string,
//     title: string,
//     status: CourseStatus,
//     reason?: string,
//   ) {
//     let subject: string;
//     let body: string;

//     switch (status) {
//       case CourseStatus.APPROVED:
//         subject = 'Course Approved';
//         body = `<p>Your course <strong>${title}</strong> has been approved.</p>
//               <p>You can now publish it and share with students.</p>`;
//         break;

//       case CourseStatus.REJECTED:
//         subject = 'Course Rejected';
//         body = `<p>Your course <strong>${title}</strong> has been rejected.</p>
//               <p>Reason: ${reason || 'Not specified'}.</p>
//               <p>You may update and resubmit it for approval.</p>`;
//         break;

//       case CourseStatus.SUSPENDED:
//         subject = 'Course Suspended';
//         body = `<p>Your course <strong>${title}</strong> has been suspended.</p>
//               <p>Reason: ${reason || 'Not specified'}.</p>`;
//         break;

//       case CourseStatus.PENDING:
//         subject = 'Course Pending Review';
//         body = `<p>Your course <strong>${title}</strong> is currently pending review.</p>
//               <p>We’ll notify you once a decision has been made.</p>`;
//         break;

//       default:
//         subject = 'Course Update';
//         body = `<p>Your course <strong>${title}</strong> has been updated.</p>`;
//     }

//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your course "${title}" status is now ${status}.`,
//       html,
//     });
//   }

//   async LessonCreation(
//     email: string,
//     firstName: string,
//     title: string,
//     lessonTitle: string,
//   ) {
//     const subject = 'New Lesson Created';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `<p>Your course <strong>${title}</strong> now has a new lesson  </p>
//              <p>Lesson title: ${lessonTitle}</p>
//               <p>You have to resubmit the course
//              </p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your course ${title} has been created.`,
//       html,
//     });
//   }

//   async LessonUpdating(
//     email: string,
//     firstName: string,
//     title: string,
//     lessonTitle: string,
//   ) {
//     const subject = 'Course Lesson Updated';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `
//       <p>One of your lessons in the course <strong>${title}</strong> has been updated successfully </p>
//       <p>Lesson title: <strong>${lessonTitle}</strong> </p>
//       <p>You have to resubmit the course
//              </p>

//              `,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your course ${title} was updated.`,
//       html,
//     });
//   }

//   async LessonDeletion(
//     email: string,
//     firstName: string,
//     title: string,
//     lessonTitle: string,
//   ) {
//     const subject = 'Course Lesson Deleted';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `
//       <p>One of your lessons in the course <strong>${title}</strong> has been deleted successfully </p>
//       <p>Lesson title: <strong>${lessonTitle}</strong> </p>
//              `,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `A lecture ${title} was deleted.`,
//       html,
//     });
//   }

//   async AssignmentCreation(
//     email: string,
//     firstName: string,
//     title: string,
//     lessonTitle: string,
//     courseTitle: string,
//   ) {
//     const subject = 'New Assignment Created';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `<p>A new assignment has been created for lesson <strong>${title}</strong> on your course <strong>${courseTitle}</strong>  </p>
//              <p>Lesson title: ${lessonTitle}</p>
//              <p>Assignment title: ${title}</p>
// `,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Assingment ${title} has been created.`,
//       html,
//     });
//   }

//   async AssignmentUpdate(
//     email: string,
//     firstName: string,
//     title: string,
//     lessonTitle: string,
//     courseTitle: string,
//   ) {
//     const subject = 'Assignment Updated';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `<p>Your assignment <strong>${title}</strong> has been updated for lesson <strong>${lessonTitle}</strong> on your course <strong>${courseTitle}</strong> </p>
//              <p>Lesson title: ${lessonTitle}</p>
//              <p>Assignment title: ${title}</p>
// `,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Assingment ${title} has been updated.`,
//       html,
//     });
//   }

//   async AssignmentDeletion(
//     email: string,
//     firstName: string,
//     title: string,
//     lessonTitle: string,
//   ) {
//     const subject = 'Course Lesson Deleted';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `
//       <p>The assignment <strong>${title}</strong>  for  lesson <strong>${lessonTitle}</strong> has been deleted successfully </p>
//       <p>Assignment title: <strong>${title}</strong> </p>
//       <p>Lesson title: <strong>${lessonTitle}</strong> </p> `,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `A lecture ${title} was deleted.`,
//       html,
//     });
//   }
//   // ========== ADMIN RELATED ==========

//   async adminInvitationEmail(email: string) {
//     const subject = 'Admin Invitation';
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi,`,
//       body: `<p>You have been invited to join our platform as an admin.</p>
//              <p>Please click the invitation link to complete your registration.</p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `You’ve been invited as an admin.`,
//       html,
//     });
//   }

//   async suspensionEmail(
//     email: string,
//     firstName: string,
//     action: string,
//     reason?: string,
//   ) {
//     const isActivated = action === 'activate';
//     const subject = `Account ${isActivated ? 'Activated' : 'Suspended'}`;
//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: isActivated
//         ? `<p>Your account has been activated. Welcome back!</p>`
//         : `<p>Your account has been suspended.</p><p>Reason: ${reason || 'Not specified'}.</p>`,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `Your account was ${action}d.`,
//       html,
//     });
//   }

//   // ========== PAYMENT RELATED ==========

//   async paymentLinkGenerated(
//     email: string,
//     firstName: string,
//     title: string,
//     price: number,
//     paymentLink: string,
//   ) {
//     const subject = 'Course Payment Link';

//     const html = this.buildTemplate({
//       title: subject,
//       greeting: `Hi ${firstName},`,
//       body: `
//       <p>A payment link has been generated for you to enroll in the course <strong>${title}</strong>.</p>
//       <p>Kindly visit the link below to complete your payment and enrollment:</p>

//       <p><strong>Course title:</strong> ${title}</p>
//       <p><strong>Course price:</strong> ₦${price.toLocaleString()}</p>

//       <p style="margin:20px 0;">
//         <a href="${paymentLink}"
//            style="background:#007bff; color:#fff; padding:10px 20px; border-radius:5px; text-decoration:none;">
//           Make Payment
//         </a>
//       </p>

//       <p>If the button above isn’t working, copy and paste this URL into your browser:</p>
//       <p><strong>${paymentLink}</strong></p>
//     `,
//     });

//     await this.sendEmail({
//       to: email,
//       subject,
//       text: `A payment link has been generated for the course "${title}".`,
//       html,
//     });
//   }
// }

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CourseStatus } from '../course/course.entity';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class EmailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USERNAME'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
      tls: { rejectUnauthorized: false },
    });

    this.transporter.verify((error, success) => {
      if (error) console.error('Email service connection error:', error);
      else console.log('✅ Email service is ready to send messages');
    });
  }

  private buildTemplate({
    title,
    greeting,
    body,
    footer,
  }: {
    title: string;
    greeting?: string;
    body: string;
    footer?: string;
  }): string {
    const appName = this.configService.get<string>('app.name') || 'DevLearn';
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" /><title>${title}</title></head>
    <body style="font-family: Arial, sans-serif; background:#f4f6f8; margin:0; padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <tr>
          <td style="background:#4F46E5; padding:20px; text-align:center; color:#fff; font-size:20px; font-weight:bold;">
            ${appName}
          </td>
        </tr>
        <tr>
          <td style="padding:20px; color:#333; font-size:15px; line-height:1.6;">
            ${greeting ? `<p>${greeting}</p>` : ''}${body}
          </td>
        </tr>
        <tr>
          <td style="padding:20px; background:#f9fafb; color:#555; font-size:13px; text-align:center;">
            ${footer || `© ${new Date().getFullYear()} ${appName}. All rights reserved.`}
          </td>
        </tr>
      </table>
    </body>
    </html>`;
  }

  private async sendEmail(emailOptions: EmailOptions): Promise<EmailResponse> {
    try {
      const adminEmail = this.configService.get<string>('admin.email');
      const info = await this.transporter.sendMail({
        from: adminEmail,
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html,
      });

      console.log('📧 Email sent successfully', info.messageId);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return {
        success: false,
        message: error.message || 'Failed to send email',
      };
    }
  }

  // ========== AUTH RELATED ==========
  async sendVerificationEmail(email: string, code: string) {
    const subject = 'Email Verification';
    const html = this.buildTemplate({
      title: subject,
      greeting: `Hi,`,
      body: `<p>Your verification code is:</p>
             <h2 style="text-align:center; color:#4F46E5;">${code}</h2>
             <p>Please use this code to verify your email address.</p>`,
    });
    return this.sendEmail({
      to: email,
      subject,
      text: `Your verification code is: ${code}`,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, code: string) {
    const subject = 'Password Reset';
    const html = this.buildTemplate({
      title: subject,
      greeting: `Hi,`,
      body: `<p>Your password reset code is:</p>
             <h2 style="text-align:center; color:#DC2626;">${code}</h2>
             <p>This code will expire in 30 minutes. If you didn't request this, please ignore this email.</p>`,
    });
    return this.sendEmail({
      to: email,
      subject,
      text: `Your reset code is: ${code}`,
      html,
    });
  }

  async sendPasswordChangeNotificationEmail(email: string, firstName: string) {
    const subject = 'Password Changed';
    const html = this.buildTemplate({
      title: subject,
      greeting: `Hi ${firstName},`,
      body: `<p>Your password has been changed successfully.</p>
             <p>If this wasn't you, please contact support immediately.</p>`,
    });
    return this.sendEmail({
      to: email,
      subject,
      text: `Hi ${firstName}, your password has been changed.`,
      html,
    });
  }

  // ========== COURSE RELATED ==========
  async courseCreation(email: string, firstName: string, title: string) {
    const subject = 'Course Created';
    const html = this.buildTemplate({
      title: subject,
      greeting: `Hi ${firstName},`,
      body: `<p>Your course <strong>${title}</strong> has been created successfully.</p>
             <p>You can now submit it for approval.</p>`,
    });
    return this.sendEmail({
      to: email,
      subject,
      text: `Your course ${title} has been created.`,
      html,
    });
  }

  async courseUpdating(email: string, firstName: string, title: string) {
    const subject = 'Course Updated';
    const html = this.buildTemplate({
      title: subject,
      greeting: `Hi ${firstName},`,
      body: `<p>Your course <strong>${title}</strong> has been updated successfully.</p>
             <p>You need to re-submit it for approval.</p>`,
    });
    return this.sendEmail({
      to: email,
      subject,
      text: `Your course ${title} was updated.`,
      html,
    });
  }

  async courseSubmission(email: string, firstName: string, title: string) {
    const subject = 'Course Submitted for Approval';
    const html = this.buildTemplate({
      title: subject,
      greeting: `Hi ${firstName},`,
      body: `<p>Your course <strong>${title}</strong> has been submitted for approval.</p>
             <p>We’ll notify you once there’s an update.</p>`,
    });
    return this.sendEmail({
      to: email,
      subject,
      text: `Your course ${title} has been submitted.`,
      html,
    });
  }

  async coursePublish(email: string, firstName: string, title: string) {
    const subject = 'Course Publication Successful';
    const html = this.buildTemplate({
      title: subject,
      greeting: `Hi ${firstName},`,
      body: `<p>Your course <strong>${title}</strong> has been published successfully.</p>
             <p>Thank you for choosing our platform.</p>`,
    });
    return this.sendEmail({
      to: email,
      subject,
      text: `Your course ${title} has been submitted.`,
      html,
    });
  }

  async courseDeletion(email: string, firstName: string, title: string) {
    const subject = 'Course Deleted';
    const html = this.buildTemplate({
      title: subject,
      greeting: `Hi ${firstName},`,
      body: `<p>Your course <strong>${title}</strong> has been deleted.</p>
             <p>If this wasn’t you, please contact support.</p>`,
    });
    return this.sendEmail({
      to: email,
      subject,
      text: `Your course ${title} has been deleted.`,
      html,
    });
  }

  async courseStatusEmail(
    email: string,
    firstName: string,
    title: string,
    status: CourseStatus,
    reason?: string,
  ) {
    let subject: string;
    let body: string;
    switch (status) {
      case CourseStatus.APPROVED:
        subject = 'Course Approved';
        body = `<p>Your course <strong>${title}</strong> has been approved.</p><p>You can now publish it and share with students.</p>`;
        break;
      case CourseStatus.REJECTED:
        subject = 'Course Rejected';
        body = `<p>Your course <strong>${title}</strong> has been rejected.</p><p>Reason: ${reason || 'Not specified'}.</p><p>You may update and resubmit it for approval.</p>`;
        break;
      case CourseStatus.SUSPENDED:
        subject = 'Course Suspended';
        body = `<p>Your course <strong>${title}</strong> has been suspended.</p><p>Reason: ${reason || 'Not specified'}.</p>`;
        break;
      case CourseStatus.PENDING:
        subject = 'Course Pending Review';
        body = `<p>Your course <strong>${title}</strong> is currently pending review.</p><p>We’ll notify you once a decision has been made.</p>`;
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
    return this.sendEmail({
      to: email,
      subject,
      text: `Your course "${title}" status is now ${status}.`,
      html,
    });
  }

  // ... ✅ Continue applying the same return structure for all Lesson, Assignment, Admin, and Payment methods
}
