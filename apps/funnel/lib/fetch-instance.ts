const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://devapi.mydreamcompanion.com";

interface FetchOptions<Payload> extends Omit<RequestInit, "body"> {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
    headers?: Record<string, string>;
    body?: Payload | null;
}

async function fetchInstance<Payload = unknown>(
    endpoint: string,
    options: FetchOptions<Payload> = {},
): Promise<Response> {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

    const defaultHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    // eslint-disable-next-line
    // @ts-ignore
    const config: RequestInit = {
        method: options.method || "GET",
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        ...options,
    };

    if (config.body && config.method !== "GET" && config.method !== "HEAD") {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(`${baseURL}${endpoint}`, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response as unknown as Response;
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

export default fetchInstance;
