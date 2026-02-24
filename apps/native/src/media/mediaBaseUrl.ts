export function getMediaBaseUrl(): string {
  const raw = (process.env as Record<string, string | undefined>).EXPO_PUBLIC_MEDIA_BASE_URL;
  return typeof raw === "string" ? raw : "";
}

