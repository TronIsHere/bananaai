export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateImageFileServer(file: File): ImageValidationResult {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: "فایلی انتخاب نشده است",
    };
  }

  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/heic-sequence",
    "image/heif-sequence",
  ];
  
  // Also check file extension as fallback (browsers may not always report correct MIME type for HEIC)
  const fileName = file.name.toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
  const fileExtension = fileName.substring(fileName.lastIndexOf("."));
  
  const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
  
  if (!isValidType) {
    return {
      isValid: false,
      error: "فرمت فایل نامعتبر است. فقط JPG، PNG، WEBP و HEIC مجاز است",
    };
  }

  // Check file size (6MB max)
  const maxSize = 6 * 1024 * 1024; // 6MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "حجم فایل نباید بیشتر از 6 مگابایت باشد",
    };
  }

  // Check minimum size (at least 1KB)
  const minSize = 1024; // 1KB
  if (file.size < minSize) {
    return {
      isValid: false,
      error: "فایل خیلی کوچک است",
    };
  }

  return {
    isValid: true,
  };
}

