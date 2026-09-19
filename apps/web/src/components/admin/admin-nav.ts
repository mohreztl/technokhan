import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Users,
  Wrench,
} from 'lucide-react';
import type { AdminDashboardStats } from '@autolounge/shared';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only the exact path is active (the dashboard root). */
  exact?: boolean;
  /** Dashboard stat used for the small counter badge. */
  badgeKey?: keyof Pick<AdminDashboardStats, 'unreadMessages' | 'pendingOrders' | 'pendingBookings'>;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'سفارش‌ها', icon: ShoppingBag },
  { href: '/admin/bookings', label: 'رزروها', icon: CalendarDays },
  { href: '/admin/products', label: 'محصولات', icon: Package },
  { href: '/admin/services', label: 'خدمات', icon: Wrench },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/messages', label: 'پیام‌ها', icon: MessageSquare, badgeKey: 'unreadMessages' },
  { href: '/admin/reviews', label: 'نظرات', icon: Star },
  { href: '/admin/coupons', label: 'کدهای تخفیف', icon: Tag },
  { href: '/admin/settings', label: 'تنظیمات', icon: Settings },
];

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Label of the section that owns `pathname` (used by the mobile top bar). */
export function adminSectionLabel(pathname: string): string {
  return ADMIN_NAV.find((item) => isAdminNavActive(pathname, item))?.label ?? 'پنل مدیریت';
}
