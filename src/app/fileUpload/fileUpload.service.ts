// // file.service.ts
// import {
//   Injectable,
//   UnauthorizedException,
//   NotFoundException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { pdf } from 'pdf-to-img';
// import * as imageToPDF from 'image-to-pdf';
// import * as fs from 'fs';
// import * as axios from 'axios';
// import * as os from 'os';
// import * as path from 'path';

// import { User, UserDocument } from '../schemas/user.schema';
// import { Video, VideoDocument } from '../schemas/video.schema';
// import { PDF, PDFDocument } from '../schemas/pdf.schema';

// import { CloudinaryService } from '../utils/cloudinary.service';
// import { convertFileToKB, convertFileToMB } from '../utils/file-size.util';
// import { deleteFileFromDir, deletePdfImagesFromDir } from '../utils/uploads';

// @Injectable()
// export class FileService {
//   constructor(
//     @InjectModel(User.name) private userModel: Model<UserDocument>,
//     @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
//     @InjectModel(PDF.name) private pdfModel: Model<PDFDocument>,
//     private readonly cloudinaryService: CloudinaryService,
//   ) {}

//   async uploadVideo(req: any, file: Express.Multer.File) {
//     const user = await this.userModel.findOne({
//       _id: req.user.id,
//       deleted: false,
//       isVerified: true,
//     });

//     if (!user) {
//       throw new UnauthorizedException(
//         "Access Denied, you don't have the permission to upload a video",
//       );
//     }

//     if (!file.mimetype.startsWith('video/')) {
//       throw new UnauthorizedException('Only videos are supported');
//     }

//     const result = await this.cloudinaryService.uploadFile(file.path, {
//       resource_type: 'video',
//       folder: 'videos',
//       public_id: file.originalname,
//     });

//     if (result) deleteFileFromDir(file);

//     const video = new this.videoModel({
//       title: req.body?.title,
//       url: result.secure_url,
//       publicId: result.public_id,
//       format: file?.mimetype,
//       sizeInKB: convertFileToKB(file.size),
//       sizeInMB: convertFileToMB(file.size),
//       originalName: file.originalname,
//       uploader: req.user.id,
//       role: req.user.role,
//     });

//     await video.save();

//     return {
//       message: 'Video uploaded successfully',
//       uploadVideo: video,
//     };
//   }

//   async getVideo(req: any, id: string) {
//     const user = await this.userModel.findOne({
//       _id: req.user.id,
//       deleted: false,
//     });
//     if (!user) throw new UnauthorizedException('Access Denied');

//     const video = await this.videoModel.findById(id);
//     if (!video) throw new NotFoundException('Video not found');

//     return {
//       message: 'Video fetched successfully',
//       getVideo: video,
//     };
//   }

//   async uploadDocs(req: any, file: Express.Multer.File) {
//     const user = await this.userModel.findOne({
//       _id: req.user.id,
//       deleted: false,
//       isVerified: true,
//     });

//     if (!user) throw new UnauthorizedException('Access Denied');

//     if (!file) throw new NotFoundException('No file uploaded');

//     const pdfPath = file.path;
//     const folderPath = `${req.user.id}-pdf-images`;

//     await fs.promises.mkdir(folderPath, { recursive: true });

//     const document = await pdf(pdfPath, { scale: 3 });
//     const uploadedImages = [];

//     let counter = 1;
//     for await (const image of document) {
//       const imagePath = `${folderPath}/${file.originalname}${counter}.png`;
//       await fs.promises.writeFile(imagePath, image);

//       const uploadResult = await this.cloudinaryService.uploadFile(imagePath, {
//         folder: `${req.user.id}-pdf-images-${file.originalname}`,
//         use_filename: true,
//       });

//       deletePdfImagesFromDir(imagePath);
//       uploadedImages.push(uploadResult);
//       counter++;
//     }

//     const doc = await this.pdfModel.create({
//       title: file.originalname,
//       sizeInKB: convertFileToKB(file.size),
//       sizeInMB: convertFileToMB(file.size),
//       uploader: req.user.id,
//       fileFolder: `${req.user.id}-pdf-images-${file.originalname}`,
//       role: req.user.role,
//     });

//     if (doc) {
//       await fs.promises.rm(folderPath, { recursive: true, force: true });
//     }

//     deleteFileFromDir(file);

//     return {
//       message: 'File uploaded successfully',
//       file: doc,
//     };
//   }

//   async getFiles(folderName: string, res: any) {
//     try {
//       const fetchImagesFolder =
//         await this.cloudinaryService.getFolderImages(folderName);
//       if (fetchImagesFolder.length === 0) {
//         throw new NotFoundException('No folder found in storage');
//       }

//       const imagePaths: string[] = [];
//       for (const [index, url] of fetchImagesFolder.entries()) {
//         const response = await axios.default.get(url, {
//           responseType: 'arraybuffer',
//         });
//         const imagePath = `./docs/image_${index}.jpg`;
//         fs.writeFileSync(imagePath, response.data);
//         imagePaths.push(imagePath);
//       }

//       const pdfFilePath = path.join(os.tmpdir(), `${folderName}.pdf`);
//       imageToPDF(imagePaths, 'A4').pipe(fs.createWriteStream(pdfFilePath));

//       imagePaths.forEach((p) => fs.unlinkSync(p));

//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader(
//         'Content-Disposition',
//         `attachment; filename=${folderName}.pdf`,
//       );

//       // For now, just respond with a message
//       return res.status(200).json({ message: 'PDF prepared' });
//     } catch (error) {
//       console.error('error fetching file', error);
//       throw new InternalServerErrorException('File fetching failed');
//     }
//   }
// }
