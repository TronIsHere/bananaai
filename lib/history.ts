import { GeneratedImage } from "@/types/dashboard-types";

const HISTORY_STORAGE_KEY = "bananaai_image_history";

export function saveImageToHistory(image: GeneratedImage): void {
  if (typeof window === "undefined") return;
  
  try {
    const existingHistory = getImageHistory();
    const updatedHistory = [image, ...existingHistory];
    // Keep only the last 100 images
    const limitedHistory = updatedHistory.slice(0, 100);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Failed to save image to history:", error);
  }
}

export function getImageHistory(): GeneratedImage[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Convert timestamp strings back to Date objects
    return parsed.map((img: any) => ({
      ...img,
      timestamp: new Date(img.timestamp),
    }));
  } catch (error) {
    console.error("Failed to get image history:", error);
    return [];
  }
}

export function deleteImageFromHistory(imageId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const existingHistory = getImageHistory();
    const updatedHistory = existingHistory.filter((img) => img.id !== imageId);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to delete image from history:", error);
  }
}

export function clearImageHistory(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear image history:", error);
  }
}

