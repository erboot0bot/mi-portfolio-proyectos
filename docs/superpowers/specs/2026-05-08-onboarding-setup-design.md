# Onboarding & Setup Flow — Design Spec

**Date:** 2026-05-08  
**Status:** Approved

---

## Overview

Two-phase onboarding system:
1. **Banner de setup** en `/apps` — guía al usuario para conectar integraciones técnicas (Telegram, Groq, Claude)
2. **Onboarding conversacional en Telegram** — una vez vinculado Telegram, el bot recoge datos de perfil personal y los escribe directamente en los módulos de la app

---

## Phase 1: Banner de Setup (Web)

### Ubicación
Entre el nav y el título "My Apps" en la página `/apps`. Siempre visible mientras haya pasos sin completar o no ignorados.

### Pasos del banner

| # | Paso | Condición "hecho" | Dismissible |
|---|------|-------------------|-------------|
| 1 | Conectar Telegram | `user_telegram_links` existe para el usuario | No |
| 2 | Añadir Groq key | `user_api_keys.groq_key_enc` NOT NULL | Sí |
| 3 | Añadir Claude key | `user_api_keys.anthropic_key_enc` NOT NULL | Sí |
| 4 | Completar perfil | `user_onboarding_state.completed_at` NOT NULL | Sí |

- Los pasos 2, 3 y 4 tienen botón "Omitir". Al ignorar se guarda en `user_onboarding_dismissals (user_id, step)`.
- El paso 4 solo aparece si el paso 1 (Telegram) está completo.
- El banner desaparece completamente cuando todos los pasos están en ✅ o ignorados.
- Los pasos 1–3 redirigen a `/apps/ajustes` (sección correspondiente).
- El paso 4 muestra inline: *"Escribe `/onboarding` a tu bot @{botUsername}"*.

### Nuevo componente: `SetupBanner.jsx`
Lee en paralelo: `user_api_keys`, `user_telegram_links`, `user_onboarding_state`, `user_onboarding_dismissals`. Se integra en `src/pages/app/AppLayout.jsx` (dentro de la página `/apps`, no en todas las rutas).

---

## Phase 2: Onboarding Conversacional en Telegram

### Trigger
- **Automático**: cuando el handler `/link` vincula una cuenta nueva por primera vez, invoca inmediatamente el inicio del onboarding.
- **Manual**: el usuario envía `/onboarding` al bot en cualquier momento (rehace el flujo).

### Estado de conversación
Tabla `user_onboarding_state`:
```sql
CREATE TABLE user_onboarding_state (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  step         TEXT NOT NULL DEFAULT 'welcome',
  data         JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```
El webhook lee `step` y `data` al recibir cada mensaje, avanza el estado y guarda.

### Flujo de pasos

```
welcome
  └→ VIVIENDA
       Bot: "¿Tienes alquiler o hipoteca?"
       Botones: [Alquiler] [Hipoteca] [No tengo]
       → Si sí:
           vivienda_importe
             Bot: "¿Cuánto pagas al mes? (en €)"  ← texto libre / voz
           vivienda_ciudad
             Bot: "¿En qué ciudad vives?"  ← texto libre / voz
       → Si no: salta a VEHÍCULO

  └→ VEHÍCULO
       Bot: "¿Tienes coche?"
       Botones: [Sí] [No]
       → Si sí:
           vehiculo_combustible
             Bot: "¿Qué combustible usa?"
             Botones: [Gasolina] [Diésel] [Eléctrico] [Híbrido]
           vehiculo_marca_modelo
             Bot: "¿Marca y modelo? (ej: Volkswagen Golf)"  ← texto libre / voz
       → Si no: salta a MASCOTAS

  └→ MASCOTAS
       Bot: "¿Tienes mascotas?"
       Botones: [Sí] [No]
       → Si sí (loop por cada mascota):
           mascota_nombre
             Bot: "¿Cómo se llama?"  ← texto libre / voz
           mascota_especie
             Bot: "¿Qué es?"
             Botones: [Perro] [Gato] [Conejo] [Otro]
           mascota_nacimiento
             Bot: "¿Cuándo nació? (aproximado vale, ej: enero 2020)"  ← texto libre / voz, IA parsea fecha
           mascota_mas
             Bot: "¿Tienes otra mascota?"
             Botones: [Sí] [No, terminar]
       → Si no: salta a NOMBRE

  └→ NOMBRE
       Bot: "¿Cómo quieres que te llame?"  ← texto libre / voz

  └→ RESUMEN
       Bot: muestra resumen de todo lo recogido
       Botones: [Confirmar y guardar] [Empezar de nuevo]
       → Confirmar: escribe en módulos, marca completed_at
       → Empezar de nuevo: resetea step a 'welcome', data a {}
```

### Soporte de voz
En todos los pasos de texto libre, el usuario puede enviar una nota de voz. El webhook la transcribe con Groq Whisper (si tiene key configurada) y procesa la transcripción igual que texto. Si no tiene Groq key, el bot avisa con un mensaje inline pero el paso continúa (solo texto).

Para el paso `mascota_nacimiento`, si la respuesta es texto libre (ej: "enero de 2020", "hace 3 años"), el webhook usa la Anthropic key para parsear la fecha aproximada a `DATE`. Si no tiene Anthropic key, guarda el texto tal cual en `metadata.birth_date_raw` y `birth_date` queda NULL.

### `/skip` en cualquier paso
El usuario puede enviar `/skip` en cualquier momento para saltar el paso actual. El dato queda NULL en `data`.

---

## Phase 3: Escritura en módulos al confirmar

El webhook ejecuta estas escrituras usando la service role key, buscando el `app_id` correcto de cada módulo del usuario:

### Vivienda → `fin_transactions`
```json
{
  "app_id": "<app_id del módulo Finanzas>",
  "type": "expense",
  "amount": <importe>,
  "description": "Alquiler / Hipoteca - <ciudad>",
  "date": "<fecha actual>",
  "category_id": "<id categoría 'Vivienda' si existe, null si no>",
  "metadata": { "source": "onboarding", "housing_type": "alquiler|hipoteca" }
}
```

### Vehículo → `vehicles`
```json
{
  "app_id": "<app_id del módulo Vehículo>",
  "name": "<marca> <modelo>",
  "type": "coche",
  "brand": "<marca>",
  "model": "<modelo>",
  "fuel_type": "gasolina|diesel|electrico|hibrido"
}
```
Idempotencia: antes de insertar, buscar un vehículo con mismo `brand`+`model`+`app_id`. Si existe, actualizar `fuel_type`. Si no, insertar.

### Mascotas → `pets`
```json
{
  "app_id": "<app_id del módulo Mascotas>",
  "name": "<nombre>",
  "species": "perro|gato|conejo|otro",
  "birth_date": "<DATE o NULL>",
  "metadata": { "birth_date_raw": "<texto original si no se parseó>" }
}
```
Idempotencia: buscar mascota con mismo `name`+`app_id`. Si existe, actualizar `species` y `birth_date`. Si no, insertar.

### Nombre preferido → `user_onboarding_state.data`
```json
{ "preferred_name": "<nombre>" }
```
Disponible para que el bot lo use en saludos futuros: *"Hola, Oscar!"*.

---

## Nuevas tablas (migraciones)

```sql
-- 1. Estado del onboarding conversacional
CREATE TABLE user_onboarding_state (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  step         TEXT NOT NULL DEFAULT 'welcome',
  data         JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_onboarding_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_onboarding" ON user_onboarding_state
  FOR ALL USING (auth.uid() = user_id);

-- 2. Dismissals del banner web
CREATE TABLE user_onboarding_dismissals (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step    TEXT NOT NULL,
  PRIMARY KEY (user_id, step)
);
ALTER TABLE user_onboarding_dismissals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_dismissals" ON user_onboarding_dismissals
  FOR ALL USING (auth.uid() = user_id);
```

---

## Archivos afectados

### Nuevos
- `src/components/SetupBanner.jsx` — banner en /apps
- `supabase/migrations/20260508_onboarding_tables.sql`

### Modificados
- `src/pages/app/AppLayout.jsx` — añadir `<SetupBanner />` en la ruta `/apps`
- `supabase/functions/telegram-webhook/index.ts` — añadir handlers de onboarding: `handleOnboarding`, `handleOnboardingStep`, `handleOnboardingConfirm`; modificar `handleLink` para disparar onboarding automático

---

## Out of scope

- Onboarding de Finanzas (sueldo, gastos fijos) — para más adelante
- Soporte multi-vehículo en el onboarding (solo recoge uno)
- Internacionalización del flujo de bot (solo español)
