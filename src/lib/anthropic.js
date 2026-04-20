/**
 * Direct Anthropic API call from browser.
 * Requires VITE_ANTHROPIC_API_KEY in .env.local
 * and anthropic-dangerous-direct-browser-access: true header.
 */
export async function suggestRecipes({ ingredients, restrictions, timeMinutes, servings }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Eres un chef experto. Dame 3 recetas en JSON puro (sin markdown, sin texto extra) con este formato exacto:
[{"title":"...","ingredients":[{"name":"...","quantity":1,"unit":"..."}],"instructions":"...","prep_time":15,"cook_time":30,"servings":4,"tags":["..."]}]

Ingredientes disponibles: ${ingredients}
Restricciones: ${restrictions || 'ninguna'}
Tiempo máximo: ${timeMinutes} minutos
Personas: ${servings}`,
      }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `HTTP ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0]?.text ?? '[]'
  return JSON.parse(text)
}
