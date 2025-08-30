"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleImages = exports.uploadSingleImage = void 0;
const multer_1 = __importDefault(require("multer"));
const memoryStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: memoryStorage });
exports.uploadSingleImage = upload.single('image');
exports.uploadMultipleImages = upload.fields([
    { name: 'image', maxCount: 8 },
]);
//# sourceMappingURL=file-upload.js.map