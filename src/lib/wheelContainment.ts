export const canConsumeVerticalWheel = (
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  deltaY: number,
): boolean => {
  if (deltaY === 0 || scrollHeight <= clientHeight + 1) return false;
  if (deltaY < 0) return scrollTop > 1;
  return scrollTop + clientHeight < scrollHeight - 1;
};
