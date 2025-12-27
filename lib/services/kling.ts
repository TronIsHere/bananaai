import axios from "axios";

const KLING_API_URL = "https://api.kie.ai/api/v1/jobs/createTask";
const KLING_STATUS_API_URL = "https://api.kie.ai/api/v1/jobs/recordInfo";

export interface KlingCreateTaskRequest {
  model: string;
  callBackUrl?: string;
  input: {
    prompt: string;
    image_urls: string[];
    sound: boolean;
    duration: "5" | "10";
  };
}

export interface KlingCreateTaskResponse {
  code: number;
  message: string;
  data?: {
    taskId: string;
  };
}

export interface KlingCallbackPayload {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    state: "waiting" | "queuing" | "generating" | "success" | "fail";
    resultJson?: string; // JSON string containing resultUrls array
    failCode?: string | null;
    failMsg?: string | null;
    completeTime?: number;
    costTime?: number;
    createTime?: number;
    model?: string;
    param?: string;
  };
}

export interface KlingTaskStatusResponse {
  code: number;
  message: string;
  data?: {
    taskId: string;
    model: string;
    state: "waiting" | "queuing" | "generating" | "success" | "fail";
    param: string; // JSON string of request parameters
    resultJson?: string; // JSON string containing resultUrls array
    failCode?: string | null;
    failMsg?: string | null;
    completeTime?: number;
    createTime?: number;
    costTime?: number;
  };
}

/**
 * Create a Kling image-to-video task
 */
export async function createKlingTask(
  request: KlingCreateTaskRequest
): Promise<KlingCreateTaskResponse> {
  const apiKey = process.env.KLING_API_KEY;

  if (!apiKey) {
    throw new Error("KLING_API_KEY is not configured");
  }

  try {
    const response = await axios.post<KlingCreateTaskResponse>(
      KLING_API_URL,
      {
        model: request.model,
        callBackUrl: request.callBackUrl,
        input: {
          prompt: request.input.prompt,
          image_urls: request.input.image_urls,
          sound: request.input.sound,
          duration: request.input.duration,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check if API returned an error code
    if (response.data.code !== 200) {
      // Provide more specific error messages for common codes
      let errorMessage =
        response.data.message ||
        `API returned error code: ${response.data.code}`;

      if (response.data.code === 402) {
        errorMessage =
          response.data.message ||
          "Payment required - API account has insufficient balance or subscription expired";
      } else if (response.data.code === 401) {
        errorMessage =
          response.data.message || "Unauthorized - Invalid API key";
      }

      // Log the full error for debugging
      console.error(`Kling API error ${response.data.code}:`, {
        code: response.data.code,
        message: response.data.message,
        data: response.data,
      });

      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error: any) {
    console.error("Kling API error:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      const errorData = error.response.data;
      throw new Error(
        errorData?.message ||
          errorData?.msg ||
          errorData?.error ||
          `API error: ${error.response.status}`
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response from API server");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || "Failed to create task");
    }
  }
}

/**
 * Get Kling task status
 */
export async function getKlingTaskStatus(
  taskId: string
): Promise<KlingTaskStatusResponse> {
  const apiKey = process.env.KLING_API_KEY;

  if (!apiKey) {
    throw new Error("KLING_API_KEY is not configured");
  }

  const url = `${KLING_STATUS_API_URL}?taskId=${encodeURIComponent(taskId)}`;

  try {
    const response = await axios.get<KlingTaskStatusResponse>(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Check if API returned an error code
    if (response.data.code !== 200) {
      // Provide more specific error messages for common codes
      let errorMessage =
        response.data.message ||
        `API returned error code: ${response.data.code}`;

      if (response.data.code === 402) {
        errorMessage =
          response.data.message ||
          "Payment required - API account has insufficient balance or subscription expired";
      } else if (response.data.code === 401) {
        errorMessage =
          response.data.message || "Unauthorized - Invalid API key";
      }

      // Log the full error for debugging
      console.error(`Kling API status error ${response.data.code}:`, {
        code: response.data.code,
        message: response.data.message,
        data: response.data,
      });

      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error: any) {
    console.error("Kling record-info error:", error);
    if (error.response) {
      const errorData = error.response.data;
      throw new Error(
        errorData?.message ||
          errorData?.msg ||
          errorData?.error ||
          `API error: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error("No response from API server");
    } else {
      throw new Error(error.message || "Failed to fetch task status");
    }
  }
}

/**
 * Parse resultJson from Kling callback/status response
 * Returns array of video URLs
 */
export function parseKlingResultJson(resultJson?: string): string[] {
  if (!resultJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(resultJson);
    if (parsed.resultUrls && Array.isArray(parsed.resultUrls)) {
      return parsed.resultUrls;
    }
    return [];
  } catch (error) {
    console.error("Error parsing Kling resultJson:", error);
    return [];
  }
}
