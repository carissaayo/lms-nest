export const convertFileToKB = (fileSizeInBytes) =>
  (fileSizeInBytes / 1024).toFixed(2);

export const convertFileToMB = (fileSizeInBytes) =>
  (fileSizeInBytes / (1024 * 1024)).toFixed(2);
