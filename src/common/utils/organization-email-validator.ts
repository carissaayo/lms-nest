import { isEmail } from 'validator';

// Common personal email domains to block
const PERSONAL_EMAIL_DOMAINS = [
  // Google
  'gmail.com',
  'googlemail.com',

  // Microsoft
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',

  // Yahoo
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.ca',
  'yahoo.com.au',
  'ymail.com',

  // Apple
  'icloud.com',
  'me.com',
  'mac.com',

  // Other popular personal domains
  'aol.com',
  'protonmail.com',
  'tutanota.com',
  'zoho.com',
  'mail.com',
  'gmx.com',
  'web.de',
  'yandex.com',
  'rambler.ru',
  'fastmail.com',
  'hushmail.com',
  'guerrillamail.com',

  // Temporary/disposable email services
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.org',
  'mailinator.com',
  'maildrop.cc',
  'temp-mail.org',
  'throwaway.email',
  'getnada.com',

  // Regional personal domains
  'rediffmail.com',
  'inbox.com',
  'mail.ru',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'naver.com',
];

/**
 * Validates if an email is suitable for organization use (not personal)
 * @param email The email address to validate
 * @returns Validation result with details
 */
export const validateOrganizationEmail = (
  email: string,
): {
  isValid: boolean;
  isPersonal: boolean;
  error?: string;
  suggestion?: string;
} => {
  // Basic email format validation
  if (!email || !isEmail(email.trim())) {
    return {
      isValid: false,
      isPersonal: false,
      error: 'Please enter a valid email address',
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const domain = normalizedEmail.split('@')[1];

  // Check if it's a personal email domain
  const isPersonalDomain = PERSONAL_EMAIL_DOMAINS.includes(domain);

  if (isPersonalDomain) {
    return {
      isValid: false,
      isPersonal: true,
      error:
        'Personal email addresses are not allowed for organization accounts',
      suggestion:
        "Please use your organization's email domain (e.g., @yourcompany.com)",
    };
  }

  // Additional checks for suspicious domains
  if (
    domain.includes('temp') ||
    domain.includes('disposable') ||
    domain.includes('throwaway')
  ) {
    return {
      isValid: false,
      isPersonal: true,
      error: 'Temporary or disposable email addresses are not allowed',
      suggestion: "Please use your organization's official email address",
    };
  }

  return {
    isValid: true,
    isPersonal: false,
  };
};
