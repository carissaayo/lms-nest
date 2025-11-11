/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { parsePhoneNumber } from 'libphonenumber-js';

export const formatAndValidatePhone = (
  phoneNumber: string,
  defaultCountry: any = 'NG',
): { formatted: string; isValid: boolean; error?: string } => {
  try {
    if (!phoneNumber) {
      return {
        formatted: '',
        isValid: false,
        error: 'Phone number is required',
      };
    }

    const parsed = parsePhoneNumber(phoneNumber, defaultCountry);

    return {
      formatted: parsed.format('E.164'), // +2341234567890
      isValid: parsed.isValid(),
    };
  } catch (error) {
    console.log(error);

    return {
      formatted: '',
      isValid: false,
      error: 'Invalid phone number format',
    };
  }
};
