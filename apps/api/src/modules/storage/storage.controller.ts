import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ClaimDocument } from '@papaya/shared';

interface UploadedMulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('storage/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: UploadedMulterFile,
    @Body('docType') docType?: ClaimDocument['docType'],
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const saved = await this.storageService.saveFile(file);
    const documentRecord = this.storageService.createDocumentRecord({
      fileName: file.originalname,
      fileUrl: saved.fileUrl,
      docType: docType || 'OTHER',
    });

    return {
      success: true,
      document: documentRecord,
      filePath: saved.filePath,
    };
  }

  @Get('uploads/:filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const uploadDir = path.resolve(process.cwd(), 'data/uploads');
    const safePath = path.join(uploadDir, path.basename(filename));

    if (!fs.existsSync(safePath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }

    return res.sendFile(safePath);
  }
}
