import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Cifrado AES-256-GCM ─────────────────────────────────────────
// La clave de cifrado se deriva del env var KEYS_ENCRYPTION_SECRET
// mediante HKDF-SHA256. Cada valor tiene su propio IV aleatorio (12 bytes)
// El resultado es: base64(IV || ciphertext_con_tag_GCM)

const ENC_SECRET = Deno.env.get("KEYS_ENCRYPTION_SECRET") ?? "";

async function getEncKey(): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(ENC_SECRET);
  const keyMaterial = await crypto.subtle.importKey("raw", raw, "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: new TextEncoder().encode("user-api-keys-v1") },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(value: string): Promise<string> {
  const key = await getEncKey();
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const ct  = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value));
  const buf = new Uint8Array(12 + ct.byteLength);
  buf.set(iv);
  buf.set(new Uint8Array(ct), 12);
  return btoa(String.fromCharCode(...buf));
}

// ─── CORS ────────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

// ─── Clientes Supabase ───────────────────────────────────────────
const supabaseService = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ─── Handler ─────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  if (!["POST", "DELETE"].includes(req.method)) {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // Verificar JWT del usuario
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  if (!ENC_SECRET) {
    console.error("KEYS_ENCRYPTION_SECRET not set");
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  let body: { groq_key?: string | null; anthropic_key?: string | null } = {};
  try { body = await req.json(); } catch { /* body vacío → ok */ }

  // Construir el objeto de actualización
  const updates: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() };

  // groq_key: string → cifrar y guardar; null → borrar; undefined → no tocar
  if (body.groq_key !== undefined) {
    updates.groq_key_enc = body.groq_key ? await encrypt(body.groq_key) : null;
  }
  if (body.anthropic_key !== undefined) {
    updates.anthropic_key_enc = body.anthropic_key ? await encrypt(body.anthropic_key) : null;
  }

  const { error } = await supabaseService
    .from("user_api_keys")
    .upsert(updates, { onConflict: "user_id" });

  if (error) {
    console.error("upsert user_api_keys error:", error);
    return new Response(JSON.stringify({ error: "Error guardando configuración" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { ...CORS, "Content-Type": "application/json" },
  });
});
