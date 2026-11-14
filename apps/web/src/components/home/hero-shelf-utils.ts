/** Shortest signed distance around a circular shelf so adjacent items wrap naturally. */
export function getShelfOffset(index: number, activeIndex: number, count: number): number {
  if (count <= 0) return 0;
  let offset = (index - activeIndex) % count;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}

export interface AutoplayState {
  reducedMotion: boolean;
  paused: boolean;
  interacting: boolean;
  inView: boolean;
  documentHidden: boolean;
}

export function shouldAutoplay(state: AutoplayState): boolean {
  return !state.reducedMotion && !state.paused && !state.interacting && state.inView && !state.documentHidden;
}
