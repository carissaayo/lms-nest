import * as fs from 'fs';
import multer from 'multer';

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

export const uploadSingleImage = upload.single('image');

export const uploadMultipleImages = upload.fields([
  { name: 'image', maxCount: 8 },
]);
