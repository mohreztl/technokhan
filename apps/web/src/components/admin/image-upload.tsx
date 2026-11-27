'use client';

import * as React from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminMutations } from '@/lib/hooks/use-admin';
import { cn } from '@/lib/utils';

export const IMAGE_UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface ImageUploadButtonProps {
  /** Called with the public URL of the stored image. */
  onUploaded: (url: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/** Pick an image from the device and upload it to S3 via the admin API. */
export function ImageUploadButton({ onUploaded, label = 'آپلود تصویر', disabled, className }: ImageUploadButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { uploadImage } = useAdminMutations();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!IMAGE_UPLOAD_ACCEPT.split(',').includes(file.type)) {
      toast.error('فرمت تصویر پشتیبانی نمی‌شود', { description: 'JPG، PNG، WebP، AVIF، GIF یا SVG انتخاب کنید.' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('حجم تصویر بیش از ۱۰ مگابایت است');
      return;
    }
    try {
      const uploaded = await uploadImage.mutateAsync(file);
      toast.success('تصویر آپلود شد', { description: uploaded.name });
      onUploaded(uploaded.url);
    } catch (e) {
      toast.error('آپلود تصویر ناموفق بود', { description: e instanceof Error ? e.message : undefined });
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_UPLOAD_ACCEPT}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled || uploadImage.isPending}
        className={cn('gap-2', className)}
        onClick={() => inputRef.current?.click()}
      >
        {uploadImage.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
        )}
        {uploadImage.isPending ? 'در حال آپلود…' : label}
      </Button>
    </>
  );
}

export interface ImagePreviewStripProps {
  images: string[];
  size?: number;
  className?: string;
}

/** Small thumbnail row for image URL lists (remote URLs skip optimization). */
export function ImagePreviewStrip({ images, size = 56, className }: ImagePreviewStripProps) {
  const valid = images.map((s) => s.trim()).filter(Boolean);
  if (valid.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {valid.map((src, i) => (
        <Image
          key={`${src}-${i}`}
          src={src}
          alt=""
          width={size}
          height={size}
          sizes={`${size}px`}
          unoptimized={src.startsWith('http') || src.startsWith('data:')}
          className="shrink-0 rounded-lg border border-border/60 object-cover"
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}
