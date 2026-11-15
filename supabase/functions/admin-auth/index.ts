import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// ============================================================
// admin-auth — verificação do acesso administrativo
// ------------------------------------------------------------
// Mantém uma senha compartilhada FORA do bundle do cliente.
// - action "login": valida a senha contra o secret ADMIN_PASSWORD
//   e devolve um token assinado (HMAC) com expiração.
// - action "verify": revalida o token assinado no servidor.
// O token só pode ser gerado por quem conhece a senha, e só pode
// ser validado pelo servidor (o cliente não tem a chave HMAC),
// por isso não há como forjar o estado de admin no navegador.
// ============================================================

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

const enc = new TextEncoder();

const b64url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const signingKey = async (): Promise<CryptoKey> => {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("ADMIN_PASSWORD") || "";
  return await crypto.subtle.importKey(
    "raw",
    enc.encode("admin-auth:" + secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
};

const sign = async (payload: string): Promise<string> => {
  const key = await signingKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return b64url(new Uint8Array(sig));
};

// Comparação em tempo constante
const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

const issueToken = async (): Promise<string> => {
  const payload = b64url(enc.encode(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })));
  const sig = await sign(payload);
  return `${payload}.${sig}`;
};

const verifyToken = async (token: string): Promise<boolean> => {
  if (typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await sign(payload);
  if (!safeEqual(sig, expected)) return false;
  try {
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" && json.exp > Date.now();
  } catch {
    return false;
  }
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "login") {
      const password = typeof body?.password === "string" ? body.password : "";
      const expected = Deno.env.get("ADMIN_PASSWORD") || "";
      if (!expected) return json({ ok: false, error: "not_configured" }, 500);
      if (!password || !safeEqual(password, expected)) {
        return json({ ok: false, error: "invalid_password" }, 401);
      }
      const token = await issueToken();
      return json({ ok: true, token });
    }

    if (action === "verify") {
      const token = typeof body?.token === "string" ? body.token : "";
      const valid = await verifyToken(token);
      return json({ ok: true, valid });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (_e) {
    return json({ ok: false, error: "bad_request" }, 400);
  }
});
