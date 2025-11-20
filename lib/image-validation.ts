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
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "فرمت فایل نامعتبر است. فقط JPG، PNG، GIF و WEBP مجاز است",
    };
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "حجم فایل نباید بیشتر از 10 مگابایت باشد",
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

