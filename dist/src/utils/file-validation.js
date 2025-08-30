"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imagePath = exports.MultiImageValidation = exports.singleImageValidation = void 0;
const custom_handlers_1 = require("../../libs/custom-handlers");
const singleImageValidation = (imageFile, description) => {
    if (!imageFile) {
        throw custom_handlers_1.customError.badRequest(`Please upload ${description}`);
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(imageFile.mimetype)) {
        throw custom_handlers_1.customError.badRequest(`Invalid image type. Please upload a JPG or PNG image.`);
    }
};
exports.singleImageValidation = singleImageValidation;
const MultiImageValidation = (imageFiles, minCount, description) => {
    if (!imageFiles) {
        throw custom_handlers_1.customError.badRequest(`Please upload ${description}`);
    }
    const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    if (files.length < minCount) {
        throw custom_handlers_1.customError.badRequest(`Please upload at least ${minCount} ${description}`);
    }
    files.forEach((file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.mimetype)) {
            throw custom_handlers_1.customError.badRequest(`Invalid image type. Please upload JPG or PNG images.`);
        }
    });
};
exports.MultiImageValidation = MultiImageValidation;
const imagePath = (file, userId) => {
    const ext = file?.mimetype.split('/')[1];
    return `user-${userId}-${Date.now()}.${ext}`;
};
exports.imagePath = imagePath;
//# sourceMappingURL=file-validation.js.map