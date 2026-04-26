const MEAL_HOURS = { desayuno: 8, almuerzo: 11, comida: 14, cena: 21 }

export function menuEventFromDb(ev) {
  return {
    ...ev,
    meal_type:   ev.metadata?.meal_type ?? null,
    recipe_id:   ev.metadata?.recipe_id ?? null,
    day_of_week: ev.metadata?.day_of_week ?? null,
    week_start:  ev.metadata?.week_start ?? null,
    custom_name: ev.metadata?.custom_name ?? ev.title,
  }
}

export function menuEventToDb(appId, weekStart, dayIdx, mealKey, value, recipeId) {
  const hour = MEAL_HOURS[mealKey] ?? 12
  const date = new Date(weekStart)
  date.setDate(date.getDate() + dayIdx)
  date.setHours(hour, 0, 0, 0)
  return {
    app_id:     appId,
    event_type: 'meal',
    title:      value || '(comida)',
    start_time: date.toISOString(),
    all_day:    false,
    metadata: {
      meal_type:   mealKey,
      recipe_id:   recipeId,
      day_of_week: dayIdx,
      week_start:  weekStart,
      custom_name: value,
    },
  }
}
