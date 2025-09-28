const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function api(path: string, method = 'GET', token?: string, body?: any) {
  const headers: Record<string,string> = { 'Accept': 'application/json' };
  if (!(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}