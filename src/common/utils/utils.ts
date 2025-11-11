// import { OTPType } from "src/shared/interfaces/otp.interface";


// export const generateOtp = (type: OTPType, length: number): string => {
//   // numeric
//   if (type === OTPType.NUMERIC) {
//     const digits = '0123456789';
//     let OTP = '';
//     for (let i = 0; i < length; i++) {
//       OTP += digits[Math.floor(Math.random() * 10)];
//     }
//     return OTP;
//   }
//   // alpha numeric
//   else if (type === OTPType.ALPHANUMERIC) {
//     const string = '0123456789abcdefghijklmnopqrstuvwxyz';
//     let OTP = '';
//     const len = string.length;
//     for (let i = 0; i < length; i++) {
//       OTP += string[Math.floor(Math.random() * len)];
//     }
//     return OTP;
//   } else if (type === OTPType.ALPHA) {
//     const string = 'abcdefghkmnprstuvwxyz';
//     let OTP = '';
//     const len = string.length;
//     for (let i = 0; i < length; i++) {
//       OTP += string[Math.floor(Math.random() * len)];
//     }
//     return OTP;
//   }
//   // nothing selected
//   else {
//     return '0000';
//   }
// };
