import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Descifrado AES-256-GCM (igual que save-api-keys) ───────────

const ENC_SECRET = Deno.env.get('KEYS_ENCRYPTION_SECRET') ?? ''

async function getEncKey(): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(ENC_SECRET)
  const keyMaterial = await crypto.subtle.importKey('raw', raw, 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode('user-api-keys-v1') },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function decryptKey(encB64: string): Promise<string> {
  const key = await getEncKey()
  const buf = Uint8Array.from(atob(encB64), c => c.charCodeAt(0))
  const iv  = buf.slice(0, 12)
  const ct  = buf.slice(12)
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return new TextDecoder().decode(dec)
}

// ─── Supabase service role (para leer keys cifradas) ─────────────

const supabaseService = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

async function getAnthropicKey(userId: string): Promise<string | null> {
  if (!ENC_SECRET) return null
  const { data } = await supabaseService
    .from('user_api_keys')
    .select('anthropic_key_enc')
    .eq('user_id', userId)
    .maybeSingle()
  if (!data?.anthropic_key_enc) return null
  return decryptKey(data.anthropic_key_enc)
}

// ─── Handler ─────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verificar JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Identificar al usuario
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  )
  const { data: { user }, error: authError } = await userClient.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Obtener la key de Anthropic del usuario (descifrada)
  const anthropicKey = await getAnthropicKey(user.id)
  if (!anthropicKey) {
    return new Response(
      JSON.stringify({ error: 'api_key_required', message: 'Configura tu API key de Anthropic en Ajustes para generar recetas.' }),
      { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { ingredients, servings, restrictions, timeMinutes } = await req.json()

    const client = new Anthropic({ apiKey: anthropicKey })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `Eres un chef experto. Dame exactamente 3 recetas en JSON puro (sin markdown, sin texto extra, sin explicaciones) como array con este formato exacto:
[{"title":"Nombre del plato","ingredients":[{"name":"ingrediente","quantity":1,"unit":"kg"}],"instructions":"Instrucciones paso a paso numeradas.","prep_time":15,"cook_time":30,"servings":${servings},"tags":["tag1","tag2"]}]

Ingredientes disponibles: ${ingredients}
Restricciones dietéticas: ${restrictions || 'ninguna'}
Tiempo máximo total: ${timeMinutes} minutos
Personas: ${servings}`,
      }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const recipes = JSON.parse(content)

    return new Response(JSON.stringify(recipes), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
