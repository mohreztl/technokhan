import { randomBytes } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config, hasS3Credentials } from '../config';
import { ApiError } from './errors';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export const IMAGE_MIME_TYPES = Object.keys(EXT_BY_MIME);

let client: S3Client | null = null;

function s3Client(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: config.s3.endpoint,
      region: config.s3.region,
      forcePathStyle: config.s3.forcePathStyle,
      credentials: {
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey,
      },
    });
  }
  return client;
}

/** `uploads` stay under the shared bucket prefix: <prefix>/uploads/yyyy/mm/<slug>-<rand>.<ext> */
export function buildImageKey(filename: string, contentType: string, now = new Date()): string {
  const ext = EXT_BY_MIME[contentType] ?? 'bin';
  const base =
    filename
      .replace(/\.[^.]+$/, '')
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 60) || 'image';
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = randomBytes(4).toString('hex');
  return [config.s3.prefix, 'uploads', `${yyyy}/${mm}`, `${base}-${rand}.${ext}`].filter(Boolean).join('/');
}

export interface UploadedImage {
  key: string;
  url: string;
}

export async function uploadImage(input: {
  buffer: Buffer;
  filename: string;
  contentType: string;
}): Promise<UploadedImage> {
  if (!hasS3Credentials()) {
    throw new ApiError(503, 'INTERNAL', 'سرویس ذخیره‌سازی تصاویر پیکربندی نشده است');
  }
  const key = buildImageKey(input.filename, input.contentType);
  try {
    await s3Client().send(
      new PutObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );
  } catch (err) {
    throw new ApiError(502, 'INTERNAL', 'بارگذاری تصویر در فضای ذخیره‌سازی ناموفق بود', {
      reason: err instanceof Error ? err.message : String(err),
    });
  }
  return { key, url: `${config.s3.publicUrl}/${key}` };
}
