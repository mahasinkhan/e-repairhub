import axios from "axios";

const BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

const api = axios.create({
  baseURL: BASE,
  withCredentials: false,
});

// ── Token helper ──────────────────────────────────────────────────────────────
function getCustomerToken(): string {
  try {
    const stored = localStorage.getItem("erepairhub.customer");
    return stored ? JSON.parse(stored).token : "";
  } catch { return ""; }
}

function authHeaders() {
  const token = getCustomerToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

// ── Catalog helpers ───────────────────────────────────────────────────────────
function extractList(data: any): any[] {
  if (Array.isArray(data))             return data;
  if (Array.isArray(data?.data))       return data.data;
  if (Array.isArray(data?.brands))     return data.brands;
  if (Array.isArray(data?.models))     return data.models;
  if (Array.isArray(data?.services))   return data.services;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
}

// ── Catalog ───────────────────────────────────────────────────────────────────
export async function getBrandsFromAPI(): Promise<any[]> {
  try {
    const res  = await api.get("/catalog/brands", { params: { limit: 100 } });
    const list = extractList(res.data);
    console.log("[api] brands:", list.length, list[0]);
    return list;
  } catch (e: any) {
    console.error("[api] getBrands failed:", e?.response?.status, e?.message);
    return [];
  }
}

export async function getModelsFromAPI(brandId: string): Promise<any[]> {
  try {
    const res  = await api.get("/catalog/models", { params: { brand: brandId, limit: 200 } });
    const list = extractList(res.data);
    console.log("[api] models:", list.length, list[0]);
    return list;
  } catch (e: any) {
    console.error("[api] getModels failed:", e?.response?.status, e?.message);
    return [];
  }
}

export async function getServicesFromAPI(modelId: string): Promise<any[]> {
  try {
    const res  = await api.get("/catalog/services", { params: { model: modelId, limit: 100 } });
    const list = extractList(res.data);

    // Normalize price: prefer pricing.finalPrice, then service.price
    const normalized = list.map((s: any) => ({
      ...s,
      price:        s.pricing?.finalPrice ?? s.price ?? 0,
      catalogPrice: s.price,
    }));

    console.log("[api] services:", normalized.length, normalized[0]);
    return normalized;
  } catch (e: any) {
    console.error("[api] getServices failed:", e?.response?.status, e?.message);
    return [];
  }
}

// ── Booking ───────────────────────────────────────────────────────────────────
export interface BookingPayload {
  customer:      { name: string; phone: string; address: string };
  deviceDetails: { brand: string; model: string; color?: string; issue: string };
  serviceType:   string;
  price:         number;
}

export async function bookRepair(payload: BookingPayload) {
  const { data } = await api.post("/orders/book", payload);
  if (!data?.success) throw new Error(data?.message || "Booking failed");
  return data.data;
}

// ── Order tracking (public) ───────────────────────────────────────────────────
export async function trackOrder(orderNumber: string, phone = "") {
  const params: Record<string, string> = { orderNumber: orderNumber.toUpperCase().trim() };
  if (phone) params.phone = phone.trim();
  const { data } = await api.get("/orders/track", { params });
  if (!data?.success) throw new Error(data?.message || "Order not found");
  return data.data;
}

// ── Coupon / Discount ─────────────────────────────────────────────────────────
export async function applyCoupon(
  code: string,
  orderAmount: number,
  brandName?: string,
  serviceName?: string,
) {
  const { data } = await api.post("/discounts/apply", {
    code, orderAmount, brandName, serviceName,
  });
  if (!data?.success) throw new Error(data?.message || "Invalid coupon");
  return data.data;
}

export async function recordCouponUsage(code: string) {
  try {
    await api.post(`/discounts/${code.toUpperCase()}/use`);
  } catch {}
}

// ── Customer Auth ─────────────────────────────────────────────────────────────
export async function customerSendOtp(phone: string): Promise<{ phone: string }> {
  const { data } = await api.post("/customer/send-otp", { phone });
  if (!data?.success) throw new Error(data?.message || "Failed to send OTP");
  return data.data;
}

export async function customerVerifyOtp(
  phone: string,
  otp: string,
  name?: string,
): Promise<{ token: string; phone: string; name: string; isNewUser: boolean }> {
  const { data } = await api.post("/customer/verify-otp", { phone, otp, name });
  if (!data?.success) throw new Error(data?.message || "Invalid OTP");
  return data.data;
}

// ── Customer Portal (authenticated) ──────────────────────────────────────────
export async function customerGetOrders(): Promise<any[]> {
  const { data } = await api.get("/customer/orders", authHeaders());
  if (!data?.success) throw new Error(data?.message || "Failed to load orders");
  return data.data;
}

export async function customerUpdateProfile(
  name: string,
): Promise<{ token: string; phone: string; name: string }> {
  const { data } = await api.patch("/customer/profile", { name }, authHeaders());
  if (!data?.success) throw new Error(data?.message || "Update failed");
  return data.data;
}