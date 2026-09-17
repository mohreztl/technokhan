'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useUIStore, type FlyItem } from '@/lib/store/ui-store';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

/** Dispatched (bubbling) on the cart target when a flying item lands — listen to bounce the icon. */
export const CART_BUMP_EVENT = 'cart-bump';

/** The cart icon that is actually visible right now: mobile tab bar first, desktop navbar otherwise. */
function findCartTarget(): HTMLElement | null {
  const mobile = document.querySelector<HTMLElement>('[data-cart-target="mobile"]');
  if (mobile && mobile.offsetParent !== null) return mobile;
  return document.querySelector<HTMLElement>('[data-cart-target="desktop"]');
}

function bump(target: HTMLElement | null) {
  target?.dispatchEvent(new CustomEvent(CART_BUMP_EVENT, { bubbles: true }));
}

/**
 * Returns `(imgEl, src) => void`: measures the element and queues a fly-to-cart animation.
 * Call it right before/after `addItem` so the picture appears to leap into the cart.
 */
export function useFlyToCart() {
  const fly = useUIStore((s) => s.fly);
  return useCallback(
    (imgEl: HTMLElement | null, src: string) => {
      if (!imgEl || !src) return;
      const r = imgEl.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      fly({ src, from: { x: r.left, y: r.top, width: r.width, height: r.height } });
    },
    [fly]
  );
}

function FlyingItem({ item, onDone }: { item: FlyItem; onDone: (id: string) => void }) {
  const [target] = useState(() => {
    const el = findCartTarget();
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  useEffect(() => {
    if (!target) onDone(item.id);
  }, [target, item.id, onDone]);

  if (!target) return null;

  const dx = target.x - (item.from.x + item.from.width / 2);
  const dy = target.y - (item.from.y + item.from.height / 2);
  const lift = Math.min(dy * 0.5, 0) - 120;

  return (
    <motion.img
      src={item.src}
      alt=""
      aria-hidden="true"
      className="rounded-xl object-cover shadow-luxury will-change-transform"
      style={{
        position: 'fixed',
        left: item.from.x,
        top: item.from.y,
        width: item.from.width,
        height: item.from.height,
      }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: [0, dx * 0.5, dx],
        y: [0, lift, dy],
        scale: [1, 0.55, 0.15],
        opacity: [1, 1, 0.35],
      }}
      transition={{ duration: 0.7, ease: 'easeInOut', times: [0, 0.5, 1] }}
      onAnimationComplete={() => {
        bump(target.el);
        onDone(item.id);
      }}
    />
  );
}

/**
 * Mount once in the app shell. Renders every queued `flyItems` entry as a portal
 * image arcing into the visible cart icon; skipped entirely under reduced motion.
 */
export function FlyToCartLayer() {
  const items = useUIStore((s) => s.flyItems);
  const flyDone = useUIStore((s) => s.flyDone);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!reduced || items.length === 0) return;
    const target = findCartTarget();
    for (const item of items) {
      bump(target);
      flyDone(item.id);
    }
  }, [reduced, items, flyDone]);

  if (!mounted || reduced || items.length === 0) return null;

  return createPortal(
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      {items.map((item) => (
        <FlyingItem key={item.id} item={item} onDone={flyDone} />
      ))}
    </div>,
    document.body
  );
}
