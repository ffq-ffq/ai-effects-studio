export const supportedImageTypes = ["image/jpeg", "image/png", "image/webp"];
export const supportedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

export function isSupportedUploadType(type: string) {
  return supportedImageTypes.includes(type) || supportedVideoTypes.includes(type);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
