import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { BaseException } from '../shared/exception/base.exception';
import { ErrorCode } from '../shared/error/error-code';

export interface CloudinaryUploadResult {
  storageUrl: string;
  publicId: string;
  bytes: number;
}

@Injectable()
export class CloudinaryService {
  private configured = false;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.configured = true;
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    schoolId: string,
  ): Promise<CloudinaryUploadResult> {
    this.assertConfigured();

    const folder =
      this.configService.get<string>('CLOUDINARY_FOLDER') ?? 'agenda-escolar';

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${folder}/${schoolId}`,
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(
              new BaseException(
                ErrorCode.INTERNAL_ERROR,
                error?.message ?? 'Cloudinary upload failed',
              ),
            );
            return;
          }

          resolve({
            storageUrl: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes ?? buffer.length,
          });
        },
      );

      stream.end(buffer);
    });
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    this.assertConfigured();
    await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
  }

  private assertConfigured(): void {
    if (!this.configured) {
      throw new BaseException(
        ErrorCode.INTERNAL_ERROR,
        'Cloudinary is not configured',
      );
    }
  }
}
