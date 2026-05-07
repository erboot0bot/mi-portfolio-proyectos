import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Service-role client: accede a telegram_bot_config sin restricciones RLS.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const WEBHOOK_URL  = `${SUPABASE_URL}/functions/v1/telegram-webhook`;

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
      headers: { "Content-Type": "application/json", "Allow": "POST" },
    });
  }

  // Verificar JWT del usuario
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "No authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
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
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Leer el bot_token del body
  let body: { bot_token?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const botToken = body.bot_token?.trim();
  if (!botToken) {
    return new Response(JSON.stringify({ error: "bot_token is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Validar el token con Telegram y obtener el username del bot
  const getMeRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
  const getMeData = await getMeRes.json();

  if (!getMeData.ok) {
    return new Response(JSON.stringify({
      error: "Token inválido. Verifica que lo copiaste correctamente desde @BotFather.",
    }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const botUsername = getMeData.result.username as string;

  // Generar un webhook_secret único para este bot
  const secretBytes = crypto.getRandomValues(new Uint8Array(16));
  const webhookSecret = Array.from(secretBytes).map(b => b.toString(16).padStart(2, "0")).join("");

  // Guardar / actualizar configuración del bot
  const { error: upsertError } = await supabase
    .from("telegram_bot_config")
    .upsert({
      user_id:        user.id,
      bot_token:      botToken,
      bot_username:   botUsername,
      webhook_secret: webhookSecret,
      webhook_registered: false,
      updated_at:     new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (upsertError) {
    console.error("Upsert bot config error:", upsertError);
    return new Response(JSON.stringify({ error: "Error guardando configuración." }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Registrar el webhook en Telegram
  const webhookRes = await fetch(
    `https://api.telegram.org/bot${botToken}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url:            WEBHOOK_URL,
        secret_token:   webhookSecret,
        allowed_updates: ["message"],
      }),
    }
  );
  const webhookData = await webhookRes.json();

  if (!webhookData.ok) {
    console.error("setWebhook error:", webhookData);
    return new Response(JSON.stringify({
      error: "El bot se guardó pero no se pudo registrar el webhook. Inténtalo de nuevo.",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Marcar webhook como registrado
  await supabase
    .from("telegram_bot_config")
    .update({ webhook_registered: true, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  return new Response(
    JSON.stringify({ bot_username: botUsername, success: true }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    }
  );
});
