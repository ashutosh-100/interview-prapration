// const BASE_URL = "http://127.0.0.1:8000";
// export const request = ...
const BASE_URL = "https://interview-prapration-k1bn.vercel.app/api/v1";


interface FetchOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  token?: string | null;
}

async function request(endpoint: string, { method = "GET", body, headers = {}, token }: FetchOptions = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body && body instanceof FormData) {
    // browser will set multipart form data header with boundary automatically
    delete defaultHeaders["Content-Type"];
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

  throw new Error(JSON.stringify(errorData, null, 2));
}
    return await res.json();
  } catch (error: any) {
    console.error(`API Error on ${method} ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth API
  async login(formData: URLSearchParams) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Login failed");
    }
    return res.json();
  },

 async signup(data: any) {
  return request("/auth/signup", {
    method: "POST",
    body: {
      email: data.email,
      password: data.password
    }
  });
},

  // Resumes API
  async uploadResume(formData: FormData, token: string) {
    return request("/resumes/upload", { method: "POST", body: formData, token });
  },

  async getLatestResume(token: string) {
    return request("/resumes/latest", { token });
  },

  // Interviews API
  async startInterview(data: any, token: string) {
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

  async submitResponse(id: string, data: any, token: string, qKey?: string, lang?: string) {
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

  // Recording API
  async uploadRecording(id: string, formData: FormData, token: string) {
    return request(`/recordings/${id}/upload`, { method: "POST", body: formData, token });
  },

  // Admin API
  async getAdminMetrics(token: string) {
    return request("/admin/metrics", { token });
  },

  async getAdminUsers(token: string) {
    return request("/admin/users", { token });
  },

  async getAdminInterviews(token: string) {
    return request("/admin/interviews", { token });
  }
};
