import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

// ============ REPAIR ============
export async function fetchRepairs() {
  const res = await api.get("/repairs");
  return Array.isArray(res.data) ? res.data : [];
}

export async function addRepair(payload) {
  const res = await api.post("/repairs", payload);
  return res.data;
}

export async function updateRepair(id, patch) {
  const res = await api.post("/repairs/update", { id, ...patch });
  return res.data;
}

export async function deleteRepair(id) {
  const res = await api.delete(`/repairs/${id}`);
  return res.data;
}

export async function uploadPhoto(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post("/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export function photoUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API}/files/${path}`;
}

// ============ STOCK ============
export async function fetchStock() {
  const res = await api.get("/stock");
  return Array.isArray(res.data) ? res.data : [];
}

export async function addStock(payload) {
  const res = await api.post("/stock", payload);
  return res.data;
}

export async function updateStock(id, patch) {
  const res = await api.post("/stock/update", { id, ...patch });
  return res.data;
}

export async function deleteStock(id) {
  const res = await api.delete(`/stock/${id}`);
  return res.data;
}

// ============ SALES ============
export async function fetchSales() {
  const res = await api.get("/sales");
  return Array.isArray(res.data) ? res.data : [];
}

export async function addSale(payload) {
  const res = await api.post("/sales", payload);
  return res.data;
}

export async function deleteSale(id) {
  const res = await api.delete(`/sales/${id}`);
  return res.data;
}

// ============ UDHAAR ============
export async function fetchUdhaar() {
  const res = await api.get("/udhaar");
  return Array.isArray(res.data) ? res.data : [];
}

export async function addUdhaar(payload) {
  const res = await api.post("/udhaar", payload);
  return res.data;
}

export async function updateUdhaar(id, patch) {
  const res = await api.post("/udhaar/update", { id, ...patch });
  return res.data;
}

export async function deleteUdhaar(id) {
  const res = await api.delete(`/udhaar/${id}`);
  return res.data;
}

// ============ UTILS ============
export function formatINR(v) {
  const n = Number(v || 0);
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function display(v) {
  if (v === null || v === undefined) return "N/A";
  const s = String(v).trim();
  return s ? s : "N/A";
}

export function whatsappReminder(phone, name, amount) {
  const msg = `Hello ${name}! Aapka MobiDesk pe ₹${amount} udhaar baaki hai. Kripya jald se jald payment karein. Shukriya!`;
  const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

export async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
