export const AMAZEMART_SELLER_CODE = '184';

export function normalizeAmazeMartSearch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function isLumenArcSearch(value: string): boolean {
  return normalizeAmazeMartSearch(value).includes('lumenarc');
}

export function normalizeSellerCode(value: string): string {
  return value.trim();
}

export function isSellerCodeAccepted(value: string): boolean {
  return normalizeSellerCode(value) === AMAZEMART_SELLER_CODE;
}

interface ScrollMeasurements {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export function shouldRevealSuppressedSeller({
  scrollTop,
  scrollHeight,
  clientHeight,
}: ScrollMeasurements): boolean {
  const maximumScroll = Math.max(0, scrollHeight - clientHeight);
  if (maximumScroll === 0) return false;

  // Roughly two to three product-card rows on the landscape phone. The
  // proportional fallback keeps the clue reachable on shorter viewports.
  const revealThreshold = Math.min(180, maximumScroll * 0.45);
  return scrollTop >= revealThreshold;
}
