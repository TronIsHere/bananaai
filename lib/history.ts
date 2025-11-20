import { GeneratedImage } from "@/types/dashboard-types";

/**
 * Note: Images are automatically saved to user's history in the backend
 * when they are generated (via callback route). These functions are kept
 * for backward compatibility but primarily use API calls.
 */

export async function getImageHistory(): Promise<GeneratedImage[]> {
  if (typeof window === "undefined") return [];
  
  try {
    const response = await fetch("/api/user/history");
    if (!response.ok) {
      throw new Error("Failed to fetch history");
    }
    
    const history = await response.json();
    // Convert timestamp strings to Date objects
    return history.map((img: any) => ({
      ...img,
      timestamp: new Date(img.timestamp),
    }));
  } catch (error) {
    console.error("Failed to get image history:", error);
    return [];
  }
}

export async function deleteImageFromHistory(imageId: string): Promise<void> {
  if (typeof window === "undefined") return;
  
  try {
    const response = await fetch(`/api/user/history/${imageId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete image from history");
    }
  } catch (error) {
    console.error("Failed to delete image from history:", error);
    throw error;
  }
}

export async function clearImageHistory(): Promise<void> {
  if (typeof window === "undefined") return;
  
  try {
    const response = await fetch("/api/user/history", {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Failed to clear image history");
    }
  } catch (error) {
    console.error("Failed to clear image history:", error);
    throw error;
  }
}

/**
 * @deprecated Images are automatically saved to user's history in the backend.
 * This function is kept for backward compatibility but does nothing.
 */
export function saveImageToHistory(image: GeneratedImage): void {
  // Images are automatically saved to user's history in the backend
  // when they are generated (via callback route)
  // This function is kept for backward compatibility
  if (typeof window === "undefined") return;
  console.warn("saveImageToHistory is deprecated. Images are automatically saved in the backend.");
}

