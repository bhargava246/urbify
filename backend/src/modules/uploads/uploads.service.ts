import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface UploadedFile {
  s3Key: string;
  s3Url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: configService.get<string>('aws.region'),
      credentials: {
        accessKeyId: configService.get<string>('aws.accessKeyId')!,
        secretAccessKey: configService.get<string>('aws.secretAccessKey')!,
      },
    });
    this.bucket = configService.get<string>('aws.s3BucketName')!;
  }

  // ─── Upload a single file ──────────────────────────────────────────────────────

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadedFile> {
    this.validateImage(file);

    const ext = path.extname(file.originalname).toLowerCase();
    const key = `${folder}/${uuidv4()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: { originalName: file.originalname },
      }),
    );

    const s3Url = `https://${this.bucket}.s3.${this.configService.get('aws.region')}.amazonaws.com/${key}`;

    this.logger.log(`Uploaded: ${key}`);

    return {
      s3Key: key,
      s3Url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  // ─── Upload multiple files ─────────────────────────────────────────────────────

  async uploadFiles(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadedFile[]> {
    return Promise.all(files.map((f) => this.uploadFile(f, folder)));
  }

  // ─── Delete from S3 ───────────────────────────────────────────────────────────

  async deleteFile(s3Key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: s3Key }),
    );
    this.logger.log(`Deleted: ${s3Key}`);
  }

  // ─── Generate a pre-signed URL (for private objects) ─────────────────────────

  async getPresignedUrl(s3Key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: s3Key });
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  // ─── Upload a buffer (for programmatically generated files, e.g. invoices) ────

  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return `https://${this.bucket}.s3.${this.configService.get('aws.region')}.amazonaws.com/${key}`;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private validateImage(file: Express.Multer.File): void {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} not allowed. Use JPEG, PNG, or WebP.`,
      );
    }
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `File too large. Maximum ${MAX_FILE_SIZE_MB}MB allowed.`,
      );
    }
  }
}
