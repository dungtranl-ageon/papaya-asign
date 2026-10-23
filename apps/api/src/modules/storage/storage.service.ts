import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ClaimDocument } from '@papaya/shared';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir = path.resolve(process.cwd(), 'data/uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created uploads directory at: ${this.uploadDir}`);
    }
  }

  /**
   * Save uploaded file buffer to local storage (or MinIO/S3 in cloud mode)
   */
  async saveFile(file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  }): Promise<{ filePath: string; fileUrl: string }> {
    const ext = path.extname(file.originalname);
    const uniqueName = `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const destination = path.join(this.uploadDir, uniqueName);

    await fs.promises.writeFile(destination, file.buffer);
    this.logger.log(`Saved uploaded file: ${uniqueName} (${file.size} bytes)`);

    return {
      filePath: destination,
      fileUrl: `/uploads/${uniqueName}`,
    };
  }

  /**
   * Create document metadata matching ClaimDocument schema
   */
  createDocumentRecord(params: {
    fileName: string;
    fileUrl: string;
    docType: ClaimDocument['docType'];
  }): ClaimDocument {
    return {
      docId: `DOC-${Date.now().toString().slice(-6)}`,
      docType: params.docType,
      fileName: params.fileName,
      fileUrl: params.fileUrl,
      uploadedAt: new Date().toISOString(),
      status: 'VALID',
      notes: 'Uploaded via Assessor Workstation',
    };
  }
}
