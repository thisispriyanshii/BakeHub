const API_BASE_URL = "http://localhost:8080";

export function getToken() {
  return localStorage.getItem("bakehub_token");
}

export function getRefreshToken() {
  return localStorage.getItem("bakehub_refresh_token");
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

  if (authData?.refreshToken) {
    localStorage.setItem("bakehub_refresh_token", authData.refreshToken);
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

export function clearAuthSession() {
  localStorage.removeItem("bakehub_token");
  localStorage.removeItem("bakehub_refresh_token");
  localStorage.removeItem("bakehub_user");
}

async function refreshAuthToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Unable to refresh token");
  }

  if (data.token) {
    storeAuthSession(data);
  }

  return data.token;
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

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !path.includes("/api/auth/login") && !path.includes("/api/auth/refresh")) {
    try {
      const newToken = await refreshAuthToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          headers,
        });
      }
    } catch (refreshError) {
      clearAuthSession();
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
      const message =
        typeof data === "string"
          ? data
          : data.message || data.error || refreshError.message || "Request failed";
      throw new Error(message);
    }
  }

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

export function fetchReviews(minRating = 3.5, limit = 10) {
  return apiRequest(`/api/reviews?minRating=${minRating}&limit=${limit}`);
}

export function submitReview(payload) {
  return apiRequest(`/api/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCoupons() {
  return apiRequest(`/api/coupons`);
}

export function fetchReviewsByOrder(orderId) {
  return apiRequest(`/api/reviews/order/${orderId}`);
}

export function fetchMyOrders() {
  return apiRequest("/api/orders/my");
}

export function fetchCurrentUser() {
  return apiRequest("/api/auth/me");
}
