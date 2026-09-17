'use client';

import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { toPersianDigits } from '@autolounge/shared';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useMe } from '@/lib/hooks';
import { useAuth } from '@/lib/store/auth-store';
import { formatJalali } from '@/lib/jalali';

export function userInitials(name?: string | null, phone?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`;
  if (parts.length === 1 && parts[0]) return parts[0].slice(0, 2);
  return phone ? toPersianDigits(phone.slice(-2)) : 'ا';
}

export interface ProfileHeaderProps {
  onEdit: () => void;
}

/** Avatar, name/phone and the edit shortcut shown above the tabs. */
export function ProfileHeader({ onEdit }: ProfileHeaderProps) {
  useMe(); // keeps the persisted user fresh
  const { user } = useAuth();
  const name = user?.name?.trim() || 'کاربر اتولانژ';
  const phone = user?.phoneNumber ?? user?.phone ?? '';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect-strong mb-6 flex items-center gap-4 rounded-2xl p-4 sm:p-5"
    >
      <Avatar size="lg" fallback={userInitials(user?.name, phone)} alt={name} className="shrink-0 ring-2 ring-secondary/40" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-black sm:text-xl">{name}</h1>
        {phone && (
          <p dir="ltr" className="text-end text-sm text-muted-foreground tabular-nums sm:text-start">
            {toPersianDigits(phone)}
          </p>
        )}
        {user?.createdAt && (
          <p className="mt-0.5 text-xs text-muted-foreground">عضو از {formatJalali(user.createdAt)}</p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={onEdit} aria-label="ویرایش پروفایل">
        <Pencil className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">ویرایش</span>
      </Button>
    </motion.section>
  );
}
