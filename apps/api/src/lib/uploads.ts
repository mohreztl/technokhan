import { randomBytes } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ApiError } from './errors';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

const MIME_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(EXT_BY_MIME).map(([mime, ext]) => [ext, mime])
);

export const IMAGE_MIME_TYPES = Object.keys(EXT_BY_MIME);

/**
 * Uploads live on the api_uploads volume and are served by this API under
 * /uploads/*; the s3-sync sidecar mirrors the directory to S3 for backup.
 * Read lazily so tests can point UPLOAD_DIR at a temp directory.
 */
export function uploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
}

/** `2026/11/<slug>-<rand>.<ext>` — url-safe, collision-free, no Persian filenames. */
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
  return `${yyyy}/${mm}/${base}-${rand}.${ext}`;
}

export interface UploadedImage {
  key: string;
  url: string;
}

export async function saveImage(input: {
  buffer: Buffer;
  filename: string;
  contentType: string;
}): Promise<UploadedImage> {
  if (!EXT_BY_MIME[input.contentType]) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'فرمت تصویر پشتیبانی نمی‌شود');
  }
  const key = buildImageKey(input.filename, input.contentType);
  const dest = path.join(uploadDir(), key);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, input.buffer);
  return { key, url: `/uploads/${key}` };
}

export interface ResolvedUpload {
  absolutePath: string;
  contentType: string;
  size: number;
}

/** Resolve a request path inside the upload dir; null on traversal/miss. */
export async function resolveUpload(relPath: string): Promise<ResolvedUpload | null> {
  const root = path.resolve(uploadDir());
  const abs = path.resolve(root, relPath);
  if (abs !== root && !abs.startsWith(root + path.sep)) return null;
  const ext = path.extname(abs).slice(1).toLowerCase();
  const contentType = MIME_BY_EXT[ext];
  if (!contentType || !existsSync(abs)) return null;
  const info = await stat(abs);
  if (!info.isFile()) return null;
  return { absolutePath: abs, contentType, size: info.size };
}

export function streamUpload(absolutePath: string) {
  return createReadStream(absolutePath);
}
