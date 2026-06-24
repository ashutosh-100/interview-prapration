const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions {
  method?: string;
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  token?: string | null;
}

async function request(
  endpoint: string,
  { method = "GET", body, headers = {}, token }: FetchOptions = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    ...headers,
  };

  if (!(body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    config.body = body;
  }

  console.log("API URL:", url);
  console.log("CONFIG:", config);

  try {
    const res = await fetch(url, config);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      console.log("========== API ERROR ==========");
      console.log("Status:", res.status);
      console.log("Response:", errorData);
      console.log("===============================");

      let errorMsg = "API Request failed";
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      } else if (errorData.message) {
        errorMsg = errorData.message;
      } else if (Object.keys(errorData).length > 0) {
        errorMsg = JSON.stringify(errorData);
      }

      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (error: unknown) {
    throw error;
  }
}

export const api = {
  async login(formData: URLSearchParams) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Login failed");
    }

    return res.json();
  },

  async signup(data: Record<string, string>) {
    return request("/auth/signup", {
      method: "POST",
      body: {
        email: data.email,
        password: data.password,
      },
    });
  },

  async getProfile(token: string) {
    return request("/auth/profile", { token });
  },

  async updateProfile(profileData: Record<string, unknown>, token: string) {
    return request("/auth/profile", {
      method: "PUT",
      body: profileData,
      token,
    });
  },

  async uploadResume(formData: FormData, token: string) {
    return request("/resumes/upload", { method: "POST", body: formData, token });
  },

  async getLatestResume(token: string) {
    return request("/resumes/latest", { token });
  },

  async startInterview(data: Record<string, unknown>, token: string) {
    return request("/interviews/", { method: "POST", body: data, token });
  },

  async getInterviewHistory(token: string) {
    return request("/interviews/history", { token });
  },

  async getInterviewDetails(id: string, token: string) {
    return request(`/interviews/${id}`, { token });
  },

  async getNextQuestion(id: string, token: string) {
    return request(`/interviews/${id}/next-question`, { method: "POST", token });
  },

  async submitResponse(id: string, data: Record<string, unknown>, token: string, qKey?: string, lang?: string) {
    let url = `/interviews/${id}/submit-response`;
    const params = [];
    if (qKey) params.push(`coding_q_key=${qKey}`);
    if (lang) params.push(`coding_lang=${lang}`);
    if (params.length) url += `?${params.join("&")}`;

    return request(url, { method: "POST", body: data, token });
  },

  async finishInterview(id: string, token: string) {
    return request(`/interviews/${id}/finish`, { method: "POST", token });
  },

  async uploadRecording(id: string, formData: FormData, token: string) {
    return request(`/recordings/${id}/upload`, { method: "POST", body: formData, token });
  },

  async getAdminMetrics(token: string) {
    return request("/admin/metrics", { token });
  },

  async getAdminUsers(token: string) {
    return request("/admin/users", { token });
  },

  async getAdminInterviews(token: string) {
    return request("/admin/interviews", { token });
  },
};