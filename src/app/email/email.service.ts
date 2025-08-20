import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SuspendStatus } from '../admin/admin.dto';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
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
      tls: {
        rejectUnauthorized: false,
      },
    });
    // Verify the connection configuration
    this.transporter.verify(function (error, success) {
      if (error) {
        console.error('Email service connection error:', error);
      } else {
        console.log('Email service is ready to send messages');
      }
    });
  }

  async sendEmail(emailOptions: EmailOptions) {
    try {
      const adminEmail = this.configService.get<string>('admin.email');
      const mailOptions = {
        from: adminEmail,
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully', info.messageId);
      return Promise.resolve();
    } catch (error) {
      console.error('Error sending email:', error);
      return Promise.resolve();
    }
  }
  async sendVerificationEmail(email: string, code: string) {
    const appName = this.configService.get<string>('app.name');
    const subject = `${appName || 'DevLearn'} Email Verification`;
    const text = `Your verification code is: ${code}\n\nPlease use this code to verify your email address.`;

    const html = `
    <h1>Email Verification</h1>
    <p>Your verification code is: <strong>${code}</strong></p>
    <p>Please use this code to verify your email address.</p>
  `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const appName = this.configService.get<string>('app.name');
    const subject = `${appName} Password Reset`;
    const text = `Your password reset code is: ${code}\n\nThis code will expire in 30 minutes.\n\nIf you didn't request this, please ignore this email.`;

    const html = `
    <h1>Password Reset</h1>
    <p>Your password reset code is: <strong>${code}</strong></p>
    <p>This code will expire in 30 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async sendPasswordChangeNotificationEmail(
    email: string,
    firstName: string,
  ): Promise<void> {
    const appName = this.configService.get<string>('app.name');
    const subject = `${appName} Password Changed`;
    const text = `Hi ${firstName}, your password has been changed successfully. If this wasn't you, please contact us immediately. If it was you, then please ignore this message.`;

    const html = `
    <h1>Password Changed</h1>
    <p>Hi ${firstName},</p>
    <p>Your password has been changed successfully.</p>
    <p>If this wasn't you, please contact us immediately. If it was you, then please ignore this message.</p>
  `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async courseCreation(
    email: string,
    firstName: string,
    title: string,
  ): Promise<void> {
    const appName = this.configService.get<string>('app.name');
    const subject = `${appName} Course Creation`;
    const text = `Hi ${firstName}, your course ${title} has been created and pending submission.`;

    const html = `
    <h1>New Course Creation</h1>
    <p>Hi ${firstName},</p>
    <p>Your course, ${title}, has been created successfully.</p>
    <p>You can now decide to submit it for approval.</p>
  `;

    await this.sendEmail({ to: email, subject, text, html });
  }
  async courseUpdating(
    email: string,
    firstName: string,
    title: string,
  ): Promise<void> {
    const appName = this.configService.get<string>('app.name');
    const subject = `${appName} Course Update`;
    const text = `Hi ${firstName}, your course ${title} has been updated successfully.`;

    const html = `
    <h1>Course Update</h1>
    <p>Hi ${firstName},</p>
    <p>Your course, ${title}, has been updated successfully.</p>
    <p>You have to re-submit it for approval</p>
  `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async courseSubmission(
    email: string,
    firstName: string,
    title: string,
  ): Promise<void> {
    const appName = this.configService.get<string>('app.name');
    const subject = `${appName} Course Submission`;
    const text = `Hi ${firstName}, your course ${title} has been submitted for approval.`;

    const html = `
    <h1>New course Submission</h1>
    <p>Hi ${firstName},</p>
    <p>Your course, ${title}, has been submitted for approval.</p>
    <p>We will notify you as soon as there is an update on it.</p>
  `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async courseDeletion(
    email: string,
    firstName: string,
    title: string,
  ): Promise<void> {
    const appName = this.configService.get<string>('app.name');
    const subject = `${appName} Course Deletion`;
    const text = `Hi ${firstName}, your course ${title} has been deleted`;

    const html = `
    <h1>Course Deletion</h1>
    <p>Hi ${firstName},</p>
    <p>Your course, ${title}, has been deleted.</p>
    <p>If this wasn't your doing, please reach out to us.</p>
  `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async adminInvitationEmail(email: string) {
    const appName = this.configService.get<string>('app.name');
    const subject = `${appName || 'DevLearn'} Admin Invitation Email`;
    const text = `You have been invited to join us at ${appName || 'DevLearn'}\n\n.`;

    const html = `
    <h1>Hi,</h1>
    <p>You have been invited to join our platform as an admin</p>
    <p>Please click the link below to complete your registration</p>
  `;

    await this.sendEmail({ to: email, subject, text, html });
  }
  async suspensionEmail(
    email: string,
    firstName: string,
    action: string,
    suspensionReason: string,
  ) {
    const appName = this.configService.get<string>('app.name');
    const main = action === 'activate' ? 'Activation' : 'Suspension';
    const subject = `${appName || 'DevLearn'} Account ${main} Email`;
    const text = `Your account has been ${action}ed`;
    const html = `
    <h1>Hi, ${firstName}</h1>
    ${
      main === 'Activation' &&
      `<p>Your account has been activated </p>
      <p>It's good to have you back</p>`
    }

      ${
        main === 'Suspension' &&
        `<p>Your account has been suspended due to ${suspensionReason} </p>
      <p>You can reach out to support to learn more or complain</p>`
      }
    
   
  `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async courseApprovalEmail(
    email: string,
    firstName: string,
    title: string,
    action: string,
    rejectReason: string,
  ) {
    const appName = this.configService.get<string>('app.name');
    const main = action === 'approve' ? 'Approval' : 'Rejection';
    const subject = `${appName || 'DevLearn'} Course ${main} Email`;
    const text = `Your account has been ${action}ed`;
    const html = `
    <h1>Hi, ${firstName}</h1>
    ${
      main === 'Approval' &&
      `<p>Your course - ${title} has been approve </p>
      <p>You can now proceed to put out your course by publishing it</p>
         <p>Thank you for creating contents to help humanity</p>`
    }

      ${
        main === 'Rejection' &&
        `<p>Your - ${title} has been rejected due to ${rejectReason} </p>
      <p>You can reach out to support to learn more or complain</p>
         <p>You can still update the course and submit it for approval again or create a new one</p>`
      }
    
   
  `;

    await this.sendEmail({ to: email, subject, text, html });
  }
}
