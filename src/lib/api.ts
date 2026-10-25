import type {
  ApiResponse,
  Category,
  DashboardStats,
  Gear,
  Payment,
  RentalOrder,
  User,
} from "./types";

const API_URL = "/api/backend";

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gearup_token");
}

export function setSession(token: string, user: User) {
  localStorage.setItem("gearup_token", token);
  localStorage.setItem("gearup_user", JSON.stringify(user));
  // Also mirror a lightweight, non-sensitive cookie so middleware can read the role
  // for route protection at the edge.
  document.cookie = `gearup_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}`;
  document.cookie = `gearup_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export function clearSession() {
  localStorage.removeItem("gearup_token");
  localStorage.removeItem("gearup_user");
  document.cookie = "gearup_role=; path=/; max-age=0";
  document.cookie = "gearup_token=; path=/; max-age=0";
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("gearup_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, query } = options;

  let url = `${API_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  let json: ApiResponse<T> | undefined;
  try {
    json = await res.json();
  } catch {
    // no body
  }

  if (!res.ok || !json?.success) {
    const message = json?.message || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return json.data;
}

// ---------- Auth ----------
export const authApi = {
  register: (payload: { name: string; email: string; password: string; phone?: string; role?: "CUSTOMER" | "PROVIDER" }) =>
    request<User>("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload: { email: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    }),
  loginWithGoogle: (idToken: string) =>
    request<{ accessToken: string; refreshToken: string; user: User }>("/auth/google", {
      method: "POST",
      body: { idToken },
      auth: false,
    }),
  me: () => request<User>("/auth/me"),
  updateProfile: (payload: { name?: string; phone?: string; bio?: string; address?: string; profilePhoto?: string }) =>
    request<User>("/users/me/profile", { method: "PATCH", body: payload }),
};

// ---------- Categories ----------
export const categoryApi = {
  list: () => request<Category[]>("/categories", { auth: false }),
  create: (payload: { name: string; description?: string; icon?: string }) =>
    request<Category>("/categories", { method: "POST", body: payload }),
  update: (id: string, payload: Partial<{ name: string; description: string; icon: string }>) =>
    request<Category>(`/categories/${id}`, { method: "PUT", body: payload }),
  remove: (id: string) => request<null>(`/categories/${id}`, { method: "DELETE" }),
};

// ---------- Gear ----------
export const gearApi = {
  list: (filters?: { searchTerm?: string; category?: string; minPrice?: string; maxPrice?: string; brand?: string }) =>
    request<Gear[]>("/gear", { auth: false, query: filters }),
  get: (id: string) => request<Gear>(`/gear/${id}`, { auth: false }),
  mine: () => request<Gear[]>("/gear/mine"),
  create: (payload: Partial<Gear>) => request<Gear>("/gear", { method: "POST", body: payload }),
  update: (id: string, payload: Partial<Gear>) => request<Gear>(`/gear/${id}`, { method: "PUT", body: payload }),
  remove: (id: string) => request<null>(`/gear/${id}`, { method: "DELETE" }),
};

// ---------- Rental Orders ----------
export const rentalApi = {
  create: (payload: { startDate: string; endDate: string; items: { gearId: string; quantity: number }[] }) =>
    request<RentalOrder>("/rentals", { method: "POST", body: payload }),
  list: () => request<RentalOrder[]>("/rentals"),
  providerOrders: () => request<RentalOrder[]>("/provider/orders"),
  get: (id: string) => request<RentalOrder>(`/rentals/${id}`),
  updateStatus: (id: string, status: string) =>
    request<RentalOrder>(`/rentals/${id}/status`, { method: "PATCH", body: { status } }),
};

// ---------- Payments ----------
export const paymentApi = {
  create: (payload: { rentalOrderId: string; provider: "STRIPE" | "SSLCOMMERZ" }) =>
    request<{ payment: Payment; checkoutUrl?: string; clientSecret?: string; paymentIntentId?: string }>(
      "/payments/create",
      { method: "POST", body: payload }
    ),
  confirm: (payload: { transactionId: string; status: "COMPLETED" | "FAILED" }) =>
    request<Payment>("/payments/confirm", { method: "POST", body: payload }),
  mine: () => request<Payment[]>("/payments"),
  get: (id: string) => request<Payment>(`/payments/${id}`),
};

// ---------- Reviews ----------
export const reviewApi = {
  create: (payload: { gearId: string; rentalOrderId: string; rating: number; comment?: string }) =>
    request("/reviews", { method: "POST", body: payload }),
  forGear: (gearId: string) => request(`/reviews/gear/${gearId}`, { auth: false }),
};

// ---------- Admin ----------
export const adminApi = {
  users: (filters?: { role?: string; searchTerm?: string }) =>
    request<User[]>("/admin/users", { query: filters }),
  updateUserStatus: (id: string, activeStatus: "ACTIVE" | "BLOCKED") =>
    request<User>(`/admin/users/${id}`, { method: "PATCH", body: { activeStatus } }),
  allGear: () => request<Gear[]>("/admin/gear"),
  allRentals: () => request<RentalOrder[]>("/admin/rentals"),
  stats: () => request<DashboardStats>("/admin/stats"),
};
