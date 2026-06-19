const API_BASE_URL = "http://localhost:8080";

export function getToken() {
  return localStorage.getItem("bakehub_token");
}

export function getStoredUser() {
  const rawUser = localStorage.getItem("bakehub_user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function storeAuthSession(authData) {
  if (authData?.token) {
    localStorage.setItem("bakehub_token", authData.token);
  }

  if (authData?.userId) {
    localStorage.setItem(
      "bakehub_user",
      JSON.stringify({
        id: authData.userId,
        name: authData.name,
        email: authData.email,
        role: authData.role,
      })
    );
  }
}

export async function apiRequest(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data.message || data.error || "Request failed";
    throw new Error(message);
  }

  return data;
}

export function fetchCustomizations() {
  return apiRequest("/customizations");
}

export function fetchProducts() {
  return apiRequest("/products");
}

export function submitCustomCakeOrder(payload) {
  return apiRequest("/api/orders/custom-cake", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitMenuOrder(payload) {
  return apiRequest("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMyOrders() {
  return apiRequest("/api/orders/my");
}

export function fetchCurrentUser() {
  return apiRequest("/api/auth/me");
}
