export const assetPath = (path: string): string => (
  `${import.meta.env?.BASE_URL ?? './'}${path.replace(/^\/+/, '')}`
);
