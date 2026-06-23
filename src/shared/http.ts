async function parseJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : (payload as { message?: string })?.message || "Request failed";

    throw new Error(message);
  }

  return payload as T;
}

export async function httpGet<T>(url: string, options: RequestInit = {}): Promise<T> {
  return httpRequest<T>(url, { ...options, method: "GET" });
}

export async function httpPost<T>(url: string, body?: unknown, options: RequestInit = {}): Promise<T> {
  return httpRequest<T>(url, {
    ...options,
    method: "POST",
    body: body instanceof FormData || body === undefined ? body : JSON.stringify(body),
  });
}

export async function httpPut<T>(url: string, body?: unknown, options: RequestInit = {}): Promise<T> {
  return httpRequest<T>(url, {
    ...options,
    method: "PUT",
    body: body instanceof FormData || body === undefined ? body : JSON.stringify(body),
  });
}

export async function httpDelete<T>(url: string, options: RequestInit = {}): Promise<T> {
  return httpRequest<T>(url, { ...options, method: "DELETE" });
}

async function httpRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const { headers, ...restOptions } = options;
  const response = await fetch(url, {
    ...restOptions,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(headers ?? {}),
    },
  });

  return parseJson<T>(response);
}
