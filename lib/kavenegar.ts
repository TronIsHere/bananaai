/**
 * Kave Negar SMS Service
 * Handles sending OTP codes via Kave Negar API
 */

export interface KavenegarResponse {
  return: {
    status: number;
    message: string;
  };
  entries?: Array<{
    messageid: number;
    message: string;
    status: number;
    statustext: string;
    sender: string;
    receptor: string;
    date: number;
    cost: number;
  }>;
}

export interface SendOTPParams {
  receptor: string; // Phone number (e.g., 09123456789 or 00974211234565 for international)
  token: string; // OTP code (max 100 characters, no spaces)
  template: string; // Template name
  token2?: string;
  token3?: string;
  token10?: string;
  token20?: string;
  type?: "sms" | "call"; // Default: "sms"
  tag?: string;
}

/**
 * Send OTP via Kave Negar API
 */
export async function sendOTPWithKavenegar(
  params: SendOTPParams
): Promise<KavenegarResponse> {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  const template = process.env.KAVENEGAR_VERIFY_TEMPLATE || params.template;

  if (!apiKey) {
    throw new Error("KAVENEGAR_API_KEY environment variable is not set");
  }

  if (!template) {
    throw new Error(
      "KAVENEGAR_VERIFY_TEMPLATE environment variable is not set"
    );
  }

  // Construct URL
  const baseUrl = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;

  // Build query parameters
  const queryParams = new URLSearchParams({
    receptor: params.receptor,
    token: params.token,
    template: template,
  });

  // Add optional parameters
  if (params.token2) queryParams.append("token2", params.token2);
  if (params.token3) queryParams.append("token3", params.token3);
  if (params.token10) queryParams.append("token10", params.token10);
  if (params.token20) queryParams.append("token20", params.token20);
  if (params.type) queryParams.append("type", params.type);
  if (params.tag) queryParams.append("tag", params.tag);

  const url = `${baseUrl}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Kavenegar API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data: KavenegarResponse = await response.json();

    // Check if Kavenegar returned an error
    if (data.return.status !== 200) {
      throw new Error(
        `Kavenegar rejected OTP request: ${data.return.message} (status: ${data.return.status})`
      );
    }

    return data;
  } catch (error: any) {
    console.error("Error sending OTP via Kavenegar:", error);
    throw error;
  }
}



