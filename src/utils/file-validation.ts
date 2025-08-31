import { customError } from 'src/libs/custom-handlers';

export const singleImageValidation = (
  imageFile: any | undefined,
  description: string,
): void => {
  // Check if image exists
  if (!imageFile) {
    throw customError.badRequest(`Please upload ${description}`);
  }

  // Allowed image types
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  // Check file type
  if (!validTypes.includes(imageFile.mimetype)) {
    throw customError.badRequest(
      `Invalid image type. Please upload a JPG or PNG image.`,
    );
  }
};

/**
 * Validates multiple image uploads
 * @param imageFiles The image files to validate
 * @param minCount Minimum number of images required
 * @param description Description of the images for error messaging
 */
export const MultiImageValidation = (
  imageFiles: any[] | undefined,
  minCount: number,
  description: string,
): void => {
  // Check if images exist
  if (!imageFiles) {
    throw customError.badRequest(`Please upload ${description}`);
  }

  // Handle array of files or single file
  const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

  // Check minimum image count
  if (files.length < minCount) {
    throw customError.badRequest(
      `Please upload at least ${minCount} ${description}`,
    );
  }

  // Check image types
  files.forEach((file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.mimetype)) {
      throw customError.badRequest(
        `Invalid image type. Please upload JPG or PNG images.`,
      );
    }
  });
};

/**
 * Generates a unique file path for an image
 * @param file The uploaded file
 * @param userId The user's ID
 * @returns The generated file path
 */
export const imagePath = (file: any, userId: string): string => {
  const ext = file?.mimetype.split('/')[1];
  return `user-${userId}-${Date.now()}.${ext}`;
};
