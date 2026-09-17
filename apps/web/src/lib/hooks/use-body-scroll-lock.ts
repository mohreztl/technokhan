'use client';

import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;

function lock() {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    root.classList.add('scroll-locked');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
  }
  lockCount += 1;
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const root = document.documentElement;
    root.classList.remove('scroll-locked');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.paddingRight = '';
    window.scrollTo({ top: savedScrollY, behavior: 'instant' as ScrollBehavior });
  }
}

/** Locks page scroll while `active` (ref-counted, restores the scroll position). */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
