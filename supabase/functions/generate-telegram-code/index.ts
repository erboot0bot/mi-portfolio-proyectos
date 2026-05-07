import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Service-role client: bypasses RLS intentionally.
// All writes include explicit user_id filter to scope to the authenticated user.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function generateCode(): string {
  // 6 caracteres alfanuméricos, sin ambiguos (0/O, 1/I)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) {
    code += chars[b % chars.length];
  }
  return code;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Allow": "POST",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "No authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verificar JWT del usuario
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Invalidar códigos anteriores no usados del mismo usuario
  const { error: invalidateError } = await supabase
    .from("telegram_link_codes")
    .update({ used: true })
    .eq("user_id", user.id)
    .eq("used", false);

  if (invalidateError) {
    console.error("Invalidate codes error:", invalidateError);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Generar nuevo código
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase
    .from("telegram_link_codes")
    .insert({ code, user_id: user.id, expires_at: expiresAt });

  if (insertError) {
    console.error("Insert code error:", insertError);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      code,
      expires_at: expiresAt,
      bot_username: Deno.env.get("TELEGRAM_BOT_USERNAME") ?? "tu_hogar_bot",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
});
