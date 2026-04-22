import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { ingredients, servings, restrictions, timeMinutes } = await req.json()

    const client = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    })

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
