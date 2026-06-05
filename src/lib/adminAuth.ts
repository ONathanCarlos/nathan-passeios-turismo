// ============================================================
// adminAuth — estado de administrador verificado pelo servidor.
// ------------------------------------------------------------
// A senha NÃO existe no bundle. O acesso admin é concedido por
// um token assinado, emitido pela edge function `admin-auth` e
// revalidado por ela. O navegador não consegue forjar o estado
// porque não possui a chave de assinatura HMAC.
//
// `isVerifiedAdmin()` é síncrono (cache em memória) para manter
// compatibilidade com os diversos pontos que consultam o estado.
// O cache só é definido após validação server-side.
// ============================================================
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const TOKEN_KEY = "nathan_admin_token_v1";

let verified = false;
let initialized = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

const setVerified = (v: boolean) => {
  if (verified !== v) {
    verified = v;
    notify();
  }
};

export const isVerifiedAdmin = (): boolean => verified;

const getStoredToken = (): string | null => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

/** Token de admin atual (para chamadas autenticadas a edge functions). */
export const getAdminToken = (): string | null => getStoredToken();

const storeToken = (token: string) => {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
};

const clearToken = () => {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
};

/** Revalida o token guardado contra a edge function. */
export async function refreshAdminStatus(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) { setVerified(false); return false; }
  try {
    const { data, error } = await supabase.functions.invoke("admin-auth", {
      body: { action: "verify", token },
    });
    const ok = !error && data?.ok === true && data?.valid === true;
    if (!ok) clearToken();
    setVerified(ok);
    return ok;
  } catch {
    setVerified(false);
    return false;
  }
}

/** Tenta autenticar com a senha compartilhada via servidor. */
export async function loginAdmin(password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("admin-auth", {
      body: { action: "login", password },
    });
    if (error || data?.ok !== true || !data?.token) {
      setVerified(false);
      return false;
    }
    storeToken(data.token);
    setVerified(true);
    return true;
  } catch {
    setVerified(false);
    return false;
  }
}

export function logoutAdmin() {
  clearToken();
  setVerified(false);
}

/** Inicializa a verificação uma única vez (chamar no boot do app). */
export function initAdminAuth() {
  if (initialized) return;
  initialized = true;
  void refreshAdminStatus();
}

export function subscribeAdmin(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

/** Hook reativo para componentes que precisam reagir ao estado admin. */
export function useIsAdmin(): boolean {
  const [v, setV] = useState(verified);
  useEffect(() => {
    initAdminAuth();
    setV(verified);
    return subscribeAdmin(() => setV(isVerifiedAdmin()));
  }, []);
  return v;
}
