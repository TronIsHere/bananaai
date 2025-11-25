import axios from "axios";

const NANOBANANA_API_URL =
  "https://api.nanobananaapi.ai/api/v1/nanobanana/generate";
const NANOBANANA_API_URL_PRO =
  "https://api.nanobananaapi.ai/api/v1/nanobanana/generate-pro";

export interface NanoBananaGenerateRequest {
  prompt: string;
  numImages: number;
  type: "TEXTTOIAMGE" | "IMAGETOIAMGE";
  image_size?: string;
  callBackUrl: string; // Required according to API docs
  imageUrls?: string[]; // For image editing mode
  watermark?: string;
}

export interface NanoBananaGenerateResponse {
  code: 200 | 400 | 401 | 500;
  msg: string;
  data?: {
    taskId: string;
  };
}

export interface NanoBananaCallbackPayload {
  code: 200 | 400 | 500 | 501;
  msg: string;
  data?: {
    taskId: string;
    info?: {
      resultImageUrl?: string;
    };
  };
}

export interface NanoBananaRecordInfoResponse {
  code: 200 | 400 | 401 | 500;
  msg: string;
  data?: {
    taskId?: string;
    successFlag: 0 | 1 | 2 | 3;
    response?: {
      originImageUrl?: string | null;
      resultImageUrl?: string;
      [key: string]: any;
    };
    errorCode?: string | null;
    errorMessage?: string | null;
    createTime?: string;
    completeTime?: string;
    paramJson?: string;
  };
}

export async function generateImage(
  request: NanoBananaGenerateRequest,
  isPro: boolean = false
): Promise<NanoBananaGenerateResponse> {
  const apiKey = process.env.NANOBANANAAPI_KEY;

  if (!apiKey) {
    throw new Error("NANOBANANAAPI_KEY is not configured");
  }

  if (!request.callBackUrl) {
    throw new Error("callBackUrl is required");
  }

  // Use pro endpoint if isPro is true
  const apiUrl = isPro ? NANOBANANA_API_URL_PRO : NANOBANANA_API_URL;

  try {
    const response = await axios.post<NanoBananaGenerateResponse>(
      apiUrl,
      {
        prompt: request.prompt,
        numImages: request.numImages,
        type: request.type,
        image_size: request.image_size || "16:9",
        callBackUrl: request.callBackUrl,
        ...(request.imageUrls && { imageUrls: request.imageUrls }),
        ...(request.watermark && { watermark: request.watermark }),
        ...(isPro && { resolution: "2K" }),
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // The API returns status codes in the body, not HTTP status
    // Check the code field in the response
    if (response.data.code !== 200) {
      throw new Error(
        response.data.msg || `API returned error code: ${response.data.code}`
      );
    }

    return response.data;
  } catch (error: any) {
    console.error("NanoBanana API error:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorData = error.response.data;
      throw new Error(
        errorData?.msg ||
          errorData?.message ||
          errorData?.error ||
          `API error: ${error.response.status}`
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response from API server");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || "Failed to generate image");
    }
  }
}

export async function getNanoBananaTaskStatus(
  taskId: string
): Promise<NanoBananaRecordInfoResponse> {
  const apiKey = process.env.NANOBANANAAPI_KEY;

  if (!apiKey) {
    throw new Error("NANOBANANAAPI_KEY is not configured");
  }

  const url = `https://api.nanobananaapi.ai/api/v1/nanobanana/record-info?taskId=${encodeURIComponent(
    taskId
  )}`;

  try {
    const response = await axios.get<NanoBananaRecordInfoResponse>(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Check if API returned an error code
    if (response.data.code !== 200) {
      throw new Error(
        response.data.msg || `API returned error code: ${response.data.code}`
      );
    }

    return response.data;
  } catch (error: any) {
    console.error("NanoBanana record-info error:", error);
    if (error.response) {
      const errorData = error.response.data;
      throw new Error(
        errorData?.msg ||
          errorData?.message ||
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
