import axios from "axios";

export function getAxiosErrorMessage(error: unknown): string {
  const err = error as {
    message?: string;
    response?: {
      status?: number;
      statusText?: string;
      data?: { error?: { message?: string }; message?: string };
    };
  };
  let message = err.response
    ? `${err.response.status} ${err.response.statusText}`
    : (err.message ?? "Request failed");
  const data = err.response?.data;
  message = data?.error?.message ?? data?.message ?? message;
  return message;
}

/** Authenticated Microsoft Graph JSON request helper. */
export async function graphRequest<T>(params: {
  url: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  accessToken: string;
  headers?: Record<string, string>;
  body?: unknown;
}): Promise<T> {
  const { url, method, accessToken, headers, body } = params;

  try {
    const res = await axios({
      url,
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...headers,
      },
      data: body,
    });
    return res.data as T;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}

/** Authenticated Microsoft Graph request with no JSON response body (e.g. DELETE / follow). */
export async function graphRequestNoJson(params: {
  url: string;
  method: "POST" | "DELETE";
  accessToken: string;
}): Promise<void> {
  try {
    await axios({
      url: params.url,
      method: params.method,
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    });
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
}
