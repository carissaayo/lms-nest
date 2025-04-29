// file.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('video')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.fileService.uploadVideo(req, file);
  }

  @Get('video/:id')
  @UseGuards(JwtAuthGuard)
  async getVideo(@Param('id') id: string, @Req() req) {
    return this.fileService.getVideo(req, id);
  }

  @Post('docs')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('notes'))
  async uploadDocs(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.fileService.uploadDocs(req, file);
  }

  @Get('docs/:folderName')
  async getFiles(
    @Param('folderName') folderName: string,
    @Res() res: Response,
  ) {
    return this.fileService.getFiles(folderName, res);
  }
}
