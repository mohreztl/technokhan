import { ROUTES } from '@technokhan/shared';

export type TabKey = 'home' | 'shop' | 'profile';

const DETAIL_ROUTE = /^\/products\/[^/]+\/?$/;

/** `/products/[id]` */
export function isDetailRoute(pathname: string): boolean {
  return DETAIL_ROUTE.test(pathname);
}

/** Routes that render without the mobile tab bar (focused flows and detail pages with a sticky CTA). */
export function isTabBarHidden(pathname: string): boolean {
  if (pathname === ROUTES.LOGIN || pathname.startsWith(`${ROUTES.LOGIN}/`)) return true;
  if (pathname.startsWith(ROUTES.CHECKOUT)) return true;
  if (pathname.startsWith(ROUTES.ADMIN)) return true;
  return isDetailRoute(pathname);
}

/** Routes where the floating mobile cart pill may appear. */
export function isCartPillRoute(pathname: string): boolean {
  if (pathname === ROUTES.HOME) return true;
  return pathname === ROUTES.PRODUCTS || pathname.startsWith(`${ROUTES.PRODUCTS}/`);
}

const startsWithRoute = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

/** Which bottom tab is active for a pathname (prefix matching), or `null` for secondary pages. */
export function activeTab(pathname: string): TabKey | null {
  if (pathname === ROUTES.HOME) return 'home';
  if (
    startsWithRoute(pathname, ROUTES.PRODUCTS) ||
    startsWithRoute(pathname, ROUTES.CART) ||
    startsWithRoute(pathname, ROUTES.WISHLIST)
  ) {
    return 'shop';
  }
  if (
    startsWithRoute(pathname, ROUTES.PROFILE) ||
    startsWithRoute(pathname, ROUTES.ORDERS) ||
    startsWithRoute(pathname, ROUTES.LOGIN)
  ) {
    return 'profile';
  }
  return null;
}

/** Site chrome (navbar, footer) is hidden on routes that provide their own shell. */
export function isChromeHidden(pathname: string): boolean {
  return startsWithRoute(pathname, ROUTES.ADMIN);
}
