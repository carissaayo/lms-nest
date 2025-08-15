import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
}

// export const sendPasswordChangeNotificationEmail = async (
//   email: string,
//   firstName: string
// ): Promise<void> => {
//   const subject = `${process.env.SITE_NAME || "Credlock"} Password Changed`;
//   const text = `Hi ${firstName}, your password has been changed successfully. If this wasn't you, please contact us immediately. If it was you, then please ignore this message.`;

//   const html = `
//     <h1>Password Changed</h1>
//     <p>Hi ${firstName},</p>
//     <p>Your password has been changed successfully.</p>
//     <p>If this wasn't you, please contact us immediately. If it was you, then please ignore this message.</p>
//   `;

//   await sendEmail({ to: email, subject, text, html });
// };

// export const sendMerchantReferralEmail = async (
//   email: string,
//   merchantName: string,
//   contactName: string,
//   appLinks: { android: string; ios: string }
// ): Promise<void> => {
//   const subject = `Welcome to Credlock - You've Been Referred!`;
//   const text = `Dear ${contactName},

// We're excited to inform you that ${merchantName} has been added to Credlock! You can now start offering Buy Now Pay Later (BNPL) services to your customers.

// To get started, download the Credlock Business app:
// - Android: ${appLinks.android}
// - iOS: ${appLinks.ios}

// If you have any questions, feel free to contact our support team.

// Best regards,
// The Credlock Team`;

//   const html = `
//     <h1>Welcome to Credlock!</h1>
//     <p>Dear ${contactName},</p>
//     <p>We're excited to inform you that <strong>${merchantName}</strong> has been added to Credlock! You can now start offering Buy Now Pay Later (BNPL) services to your customers.</p>
//     <p>To get started, download the Credlock Business app:</p>
//     <ul>
//       <li><a href="${appLinks.android}">Android</a></li>
//       <li><a href="${appLinks.ios}">iOS</a></li>
//     </ul>
//     <p>If you have any questions, feel free to contact our support team.</p>
//     <p>Best regards,<br>The Credlock Team</p>
//   `;

//   await sendEmail({ to: email, subject, text, html });
// };
