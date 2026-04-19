import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ingredients, servings, restrictions, timeMinutes } = await req.json()

    const client = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    })

    const prompt = `Genera una receta de cocina con estos ingredientes disponibles: ${ingredients}.
Para ${servings} personas. Tiempo máximo: ${timeMinutes} minutos.
${restrictions ? `Restricciones dietéticas: ${restrictions}.` : ''}

Responde SOLO con un JSON válido con esta estructura exacta, sin texto adicional:
{
  "name": "Nombre del plato",
  "servings": ${servings},
  "time_minutes": 30,
  "category": "categoría (desayuno/comida/cena/merienda/postre)",
  "ingredients": ["ingrediente 1 con cantidad", "ingrediente 2 con cantidad"],
  "instructions": "Instrucciones paso a paso numeradas, claras y detalladas.",
  "tips": "Consejo opcional para mejorar el plato."
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    const recipe = JSON.parse(content)

    return new Response(JSON.stringify(recipe), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
