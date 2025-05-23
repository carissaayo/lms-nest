// import {
//   Injectable,
//   HttpException,
//   HttpStatus,
//   BadRequestException,
// } from '@nestjs/common';
// import axios from 'axios';
// import { ConfigService } from '@nestjs/config';
// import { AccountNumberDto } from '../user/user.dto';

// import { User, UserDocument } from '../user/user.schema';
// import { Model } from 'mongoose';
// import { InjectModel } from '@nestjs/mongoose';
// import { UsersService } from 'src/app/user/user.service';

// @Injectable()
// export class PaystackService {
//   constructor(
//     private configService: ConfigService,
//     private userService: UsersService,
//     @InjectModel(User.name) private userModel: Model<UserDocument>,
//   ) {}
//   async GetBank() {
//     try {
//       const response = await axios.get(
//         `${this.configService.get<string>('PAYSTACK_BASE_URL')}/bank`,
//         {
//           headers: {
//             Authorization: `Bearer ${this.configService.get<string>('PAYSTACK_SECRET')}`,
//             'Content-Type': 'application/json',
//           },
//         },
//       );
//       console.log(response.data);

//       return response.data;
//     } catch (error) {
//       throw new HttpException(
//         error || 'Paystack transfer failed',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }

//   async addAccountNumber(
//     accountDetails: AccountNumberDto,
//     req: any,
//   ): Promise<any> {
//     try {
//       const user = await this.userService.findUser(req.user.userId);
//       const doesAccountExist = user?.banks.some(
//         (bank) => bank.account_number === accountDetails.account_number,
//       );
//       if (doesAccountExist) {
//         throw new BadRequestException('Account number already exist');
//       }
//       const response = await axios.post(
//         `${this.configService.get<string>('PAYSTACK_BASE_URL')}/transferrecipient`,
//         {
//           type: 'nuban',
//           currency: 'NGN',
//           ...accountDetails,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${this.configService.get<string>('PAYSTACK_SECRET')}`,
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       const bank = {
//         recipient_code: response.data.data.recipient_code,
//         account_number: response.data.data.details.account_number,
//         bank_code: response.data.data.details.bank_code,
//         account_name: response.data.data.details.account_name,
//         bank_name: response.data.data.details.bank_name,
//       };

//       await this.userModel.findByIdAndUpdate(
//         req.user.userId,
//         {
//           $push: { banks: bank },
//         },
//         { new: true },
//       );

//       return {
//         message: 'Account details has been added',
//         data: response.data,
//       };
//     } catch (error) {
//       console.log(error);

//       throw new HttpException(
//         error || 'Paystack transfer failed',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }
//   async initiateTransfer(amount: number, recipient: string, reason: string) {
//     try {
//       const response = await axios.post(
//         `${this.configService.get<string>('PAYSTACK_BASE_URL')}/transfer`,
//         {
//           source: 'balance',
//           reason,
//           amount: amount * 100, // Convert to kobo
//           recipient: recipient,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${this.configService.get<string>('PAYSTACK_SECRET')}`,
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       return response.data;
//     } catch (error) {
//       console.log(error);

//       throw new HttpException(
//         error || 'Paystack transfer failed',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }
//   async initiateRepayment(email: string, amount: number) {
//     try {
//       const response = await axios.post(
//         `${this.configService.get<string>('PAYSTACK_BASE_URL')}/transaction/initialize`,
//         {
//           email,
//           amount: amount * 100, // Convert to kobo
//           currency: 'NGN',
//           // callback_url: 'https://yourapp.com/payment-success', // Your frontend success page
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${this.configService.get<string>('PAYSTACK_SECRET')}`,
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       return {
//         message: 'Payment link generated',
//         data: response.data.data,
//       };
//     } catch (error) {
//       console.error(error);
//       throw new HttpException(
//         'Payment initiation failed',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }

//   async verifyRepayment(reference: string) {
//     try {
//       const response = await axios.get(
//         `${this.configService.get<string>('PAYSTACK_BASE_URL')}/transaction/verify/${reference}`,
//         {
//           headers: {
//             Authorization: `Bearer ${this.configService.get<string>('PAYSTACK_SECRET')}`,
//           },
//         },
//       );

//       return response.data;
//     } catch (error) {
//       throw new HttpException(
//         error || 'Payment verification failed',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }
// }
