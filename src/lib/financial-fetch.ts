"use client";

// A retry after a lost response keeps the same key. No financial request is queued offline.
import { supabase } from "@/lib/supabase";
const pending = new Map<string, Promise<Response>>();
export async function financialFetch(
  url: string,
  init: RequestInit,
): Promise<Response> {
  if (!navigator.onLine)
    throw new Error("Conecte-se à internet para confirmar esta operação.");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user.id) throw new Error("Entre na sua conta para continuar.");
  const identity = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(url + String(init.body)),
  );
  const storageKey =
    "confilar:purchase:" +
    session.user.id +
    ":" +
    Array.from(new Uint8Array(identity), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
  const existing = pending.get(storageKey);
  if (existing) return (await existing).clone();
  let key: string;
  try {
    key = sessionStorage.getItem(storageKey) || crypto.randomUUID();
    sessionStorage.setItem(storageKey, key);
  } catch {
    key = crypto.randomUUID();
  }
  const headers = new Headers(init.headers);
  headers.set("Idempotency-Key", key);
  const promise = fetch(url, { ...init, headers });
  pending.set(storageKey, promise);
  try {
    const response = await promise;
    if (
      response.ok ||
      (response.status >= 400 &&
        response.status < 500 &&
        response.status !== 429)
    ) {
      setTimeout(() => {
        try {
          sessionStorage.removeItem(storageKey);
        } catch {}
        pending.delete(storageKey);
      }, 800);
    } else pending.delete(storageKey);
    return response.clone();
  } catch (error) {
    pending.delete(storageKey);
    throw error;
  }
}
