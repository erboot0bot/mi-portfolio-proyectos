# Plataforma de Vida — Diseño Completo
**Fecha:** 2026-05-13  
**Estado:** Pendiente de aprobación  
**Scope:** Rediseño y expansión de la demo de Hogar hacia una plataforma de gestión de vida completa

---

## 1. Visión

Transformar la demo de Hogar en una plataforma de gestión de vida estructurada en **4 apps temáticas** + infraestructura transversal. El objetivo no es tener muchas apps ni una con cientos de apartados, sino **3-4 dominios mentales claros**, cada uno con secciones coherentes.

**Principios:**
- Lo más útil siempre visible — sin clicks innecesarios para ver el dato clave
- Secciones opcionales según situación vital (hijos, coche, mascota, terraza...)
- El calendario es global y compartido — ninguna app lo posee
- Sin IA por ahora — primero el sistema aprende al usuario, luego ofrece conocimiento
- Demo simula compartición; en producción sería multi-usuario real

---

## 2. Arquitectura: 4 Apps + Infraestructura

```
🏠 Hogar       — gestión del espacio físico doméstico
👤 Personal    — gestión de uno mismo y la vida diaria
💰 Finanzas    — gestión del dinero
🎭 Ocio        — entretenimiento, cultura y vida social

📅 Calendario  — infraestructura global compartida
⚙️  Ajustes    — onboarding, Telegram, compartición
```

### Regla de nueva app vs nueva sección
- **Nueva app** cuando: intención mental diferente, flujo de navegación propio, datos independientes
- **Nueva sección** cuando: mismo dominio mental, accede desde el mismo contexto, datos compartidos con otras secciones de la app

---

## 3. App: 🏠 Hogar

Gestión del espacio físico del hogar. Se accede cuando gestionas lo que ocurre en casa.

### 3.1 Cocina
Bloque central. Engloba todo lo relacionado con la alimentación.

| Sección | Contenido |
|---|---|
| **Nevera** | Items con fecha caducidad, temperatura, cantidad |
| **Congelador** | Items con fecha congelación, tiempo máximo recomendado |
| **Despensa** | Secos y conservas, stock mín/máx, alerta de reposición |
| **Menú semanal** | Planificador 7 días × comidas configurables |
| **Recetas** | Biblioteca con tiempo total visible en tarjeta (prep+cocción) |
| **Lista de compra** | Agregada desde stock bajo + menú + añadido manual |

**Lista de compra:** agrega items de toda la app (limpieza, baño, despensa, bebé...). Organizada por tienda: Mercadona, Lidl, Carrefour, La Sirena, Panadería, Tienda local, Otros.

**Comidas configurables por usuario:** toggle desayuno / almuerzo / merienda / comida / cena. Si no meriendas, esa fila desaparece del planificador.

### 3.2 Limpieza
Gestión de la limpieza del hogar.

| Sección | Contenido |
|---|---|
| **Tareas** | Tareas recurrentes con intervalo días, estado, próxima fecha |
| **Tareas de fábrica** | Preinstaladas, activables/desactivables por perfil |
| **Productos** | Stock de productos de limpieza (vinculado a Lista de compra) |
| **Productos por tarea** | Cada tarea define qué productos consume y en qué cantidad |
| **Roomba** | Programación, último pase, mapa (foto subida), consumibles propios |
| **Personal de limpieza** | Quién viene, qué días, qué tareas, notas |

**Tareas de fábrica preinstaladas:**
Barrer, fregar suelo, aspirar, pasar Roomba, limpiar baño (WC+lavabo+ducha), limpiar cocina (encimera+fogones), limpiar horno, limpiar microondas, limpiar cristales/ventanas, cambiar sábanas, lavar ropa, limpiar nevera, limpiar filtro lavadora, limpiar filtro Roomba / cambiar cepillo.

Todas las tareas generan **eventos en el Calendario global** automáticamente.

### 3.3 Espacios
Gestión de los espacios del hogar (opcionales según situación).

| Espacio | Contenido |
|---|---|
| **Trastero** *(opcional)* | Inventario por cajas/zonas, foto, alertas estacionales |
| **Terraza** *(opcional)* | Plantas (riego, abono, temporada), mobiliario exterior, barbacoa |
| **Plantas interior** | Nombre, foto, frecuencia riego, abono, estado |
| **Baño** | Consumibles (jabón, pasta, papel) en stock; durables (toallas, cepillos) con ciclo lavado/sustitución |
| **Parking** *(opcional)* | Plaza nº, acceso, vinculado a Vehículos y Finanzas > Gastos fijos |

### 3.4 Casa
Gestión de la infraestructura del hogar.

| Sección | Contenido |
|---|---|
| **Equipamiento** | Electrodomésticos, garantías, nº serie, mantenimiento recomendado |
| **Arreglos pendientes** | Lista de tareas abiertas (pintar habitación, cambiar grifo, llamar fontanero) con prioridad |
| **Contactos de servicio** | Fontanero, electricista, cerrajero de confianza — siempre a mano |
| **Contraseñas domésticas** | WiFi (SSID+pass), código alarma, código trastero/garaje |
| **Comunidad de propietarios** | Cuota mensual, contacto administrador, incidencias, actas |

**Equipamiento:** cada item puede tener sub-consumibles (filtros, cepillos del Roomba) y genera tareas de mantenimiento en Limpieza. Foto de factura subible vía Telegram.

### 3.5 Hijos *(opcional)*
Se activa en onboarding con "¿Tienes hijos?". Un perfil por hijo.

| Sección | Contenido |
|---|---|
| **Colegio** | Horario, eventos, excursiones → Calendario |
| **Extraescolares** | Actividades, horarios, coste → Finanzas |
| **Pediatra** | Visitas, vacunas, crecimiento → Salud |
| **Material** | Lista útiles, uniforme, libros → Lista de compra |
| **Stock bebé** | Pañales, leche, papillas → Almacenamiento |

---

## 4. App: 👤 Personal

Gestión de uno mismo y la vida diaria. Se accede cuando gestionas tu vida fuera del espacio doméstico.

### 4.1 Trabajo
| Campo | Detalle |
|---|---|
| Horario laboral | Configurable (L-V 9-18, turnos, parcial...) |
| Municipio de trabajo | Determina festivos autonómicos y locales |
| Trayecto | Tiempo estimado, medio de transporte |
| Festivos | ¿Trabaja festivos habitualmente? |

Los bloques laborales aparecen en el Calendario como franjas bloqueadas — visibles pero no editables desde el calendario.

### 4.2 Salud
| Sección | Contenido |
|---|---|
| Médico de cabecera | Datos, centro asignado |
| Dentista | Visitas, recordatorios periódicos (limpieza cada 6 meses) |
| Especialistas | Cualquier especialista con fecha última visita y siguiente |
| Medicamentos | Stock en casa, quién lo toma, pauta, fecha caducidad |
| Recordatorios periódicos | Configurables: cada X meses → genera evento en Calendario |
| **Hábitos** | Habit tracker diario (beber agua, leer, meditar, ejercicio...) |

### 4.3 Deporte
| Sección | Contenido |
|---|---|
| **Gimnasio** | Rutinas de entrenamiento, ejercicios, series/reps/peso, historial progresión |
| **Rutas senderismo** | Mapa/GPX subible, desnivel, dificultad, tiempo, fotos, historial |
| **Bici** | Rutas ciclistas, mantenimiento bici (cadena, frenos, ruedas), alertas revisión |

Membresía gym → vinculada a Finanzas > Suscripciones.

### 4.4 Vehículos *(opcional)*
Un perfil por vehículo.

| Campo | Detalle |
|---|---|
| Datos | Marca, modelo, matrícula, año, color |
| ITV | Fecha última, próxima (cada 2/4 años según antigüedad), alerta |
| Revisiones | Historial, próxima, taller habitual |
| Seguro | Compañía, vencimiento → vinculado a Finanzas > Seguros |
| Incidencias | Registro de averías o accidentes |

### 4.5 Mascotas *(opcional)*
Un perfil por mascota.

| Campo | Detalle |
|---|---|
| Datos | Nombre, especie, raza, edad, foto |
| Veterinario | Contacto, visitas, historial |
| Vacunas | Calendario vacunal, próximas dosis → Calendario |
| Medicación | Pauta, stock → Almacenamiento |
| Comida | Stock en casa → Lista de compra |
| Seguro | → Finanzas > Seguros |

### 4.6 Ropa
| Sección | Contenido |
|---|---|
| Armario | Catálogo de prendas, foto, categoría, color, marca |
| Tallas | Por persona — útil para regalos y compras propias |
| Temporada | Qué está en el trastero, alertas estacionales (mayo: sacar ropa verano) |
| Wishlist | Prendas que quieres comprar |

Conecta con Trastero (ropa guardada), Regalos (tallas conocidas), Finanzas (gasto ropa).

### 4.7 Formación
| Campo | Detalle |
|---|---|
| Cursos activos | Título, plataforma, progreso, fecha límite |
| Idiomas | Idioma, nivel actual, método de aprendizaje |
| Certificaciones | Obtenidas y en progreso, fecha obtención |
| Libros técnicos | Diferente al ocio — es desarrollo profesional |

### 4.8 Documentación
| Documento | Campos |
|---|---|
| DNI | Número, fecha caducidad, alerta renovación |
| Pasaporte | Número, fecha caducidad |
| Carnet de conducir | Número, fecha renovación (cada 10 años) |
| Tarjeta sanitaria | Número, comunidad |
| Otros | Campo libre para cualquier documento |

---

## 5. App: 💰 Finanzas

Gestión del dinero. Se accede cuando gestionas pagos, gastos, vencimientos.

### 5.1 Suscripciones
Servicios digitales con pago recurrente. Presets comunes incluidos:
Netflix, Spotify, Disney+, Apple TV+, Crunchyroll, Amazon Prime, YouTube Premium, iCloud, Apple One, Apple Care, HBO Max, Filmin, gym, otros.

| Campo | Detalle |
|---|---|
| Servicio | Nombre, logo/icono |
| Coste | Importe, moneda, periodicidad (mensual/anual) |
| Fecha renovación | Alerta configurable antes del vencimiento |
| Quién la usa | Si es compartida con pareja/familia |
| Estado | Activa / pausada / cancelada |

### 5.2 Seguros
| Tipo | Campos específicos |
|---|---|
| **Hogar** | Continente vs contenido, compañía, póliza, vencimiento, cobertura |
| **Vida** | Beneficiarios, capital asegurado, compañía, vencimiento |
| **Dental** | Compañía, coberturas, nº mutualista |
| **Coche** | Vehículo vinculado, tipo (terceros/todo riesgo), franquicia, vencimiento |
| **Mascota** | Mascota vinculada, compañía, cobertura |
| **Móvil / Apple Care** | Dispositivo vinculado, cobertura, vencimiento |

Todos los seguros generan alerta de vencimiento en el Calendario.

### 5.3 Gastos fijos
Recibos mensuales del hogar.

| Categoría | Ejemplos |
|---|---|
| Suministros | Luz, agua, gas, calefacción |
| Conectividad | Internet, móvil |
| Vivienda | Alquiler, comunidad de propietarios, parking (la hipoteca va en §5.4) |
| Otros | Cualquier gasto recurrente mensual |

### 5.4 Hipoteca / Préstamos
| Campo | Detalle |
|---|---|
| Tipo | Hipoteca, préstamo personal, préstamo coche |
| Banco | Entidad, contacto gestor |
| Cuota mensual | Importe, día del mes |
| Capital pendiente | Actualizable manualmente |
| Fecha fin | Con alerta de tramos importantes |

### 5.5 Tickets y Gastos
Feature principal de Finanzas. Foto del ticket vía Telegram → categorización del gasto.

| Campo | Detalle |
|---|---|
| Fecha | Auto desde foto o manual |
| Importe | OCR del ticket o introducido |
| Categoría | Supermercado, restaurante, gasolina, ropa, ocio, farmacia... |
| Establecimiento | Nombre del comercio |
| Foto | Ticket adjunto |

Alimenta el **Presupuesto** con datos reales de gasto.

### 5.6 Presupuesto
Vista mensual: ingresos vs gastos reales (de Tickets) vs gastos fijos vs suscripciones.
Sin IA, solo datos y visualización clara.

### 5.7 Declaración de la Renta *(España)*
| Campo | Detalle |
|---|---|
| Recordatorio anual | Alerta en abril (inicio campaña en España) |
| Gestor/Asesor | Nombre, contacto |
| Documentos necesarios | Checklist configurable |
| Historial | Año, resultado (a pagar/devolver), importe |

---

## 6. App: 🎭 Ocio

Entretenimiento, cultura y vida social. Se accede con intención distinta al hogar o las finanzas.

### 6.1 Restaurantes
| Campo | Detalle |
|---|---|
| Historial | Dónde, cuándo, con quién |
| Ticket | Foto vía Telegram → gasto a Finanzas |
| Valoración | ⭐ 1-5, crítica personal, platos destacados |
| ¿Repetirías? | Sí / No / Tal vez |
| Wishlist | Sitios por probar, con tags (romántico, informal, para trabajo...) |

### 6.2 Deportes (seguimiento)
Partidos y eventos deportivos de los deportes que sigues — se sincronizan al Calendario global.

**Deportes soportados:**
| Deporte | Competiciones |
|---|---|
| ⚽ Fútbol | La Liga, Champions, Copa del Rey, Europa League, Mundial, Eurocopa, Nations League |
| 🏀 Baloncesto | ACB, Euroliga, NBA, Mundial FIBA, Eurobasket |
| 🎾 Tenis | Roland Garros, Wimbledon, US Open, Australian Open, Davis Cup, Masters 1000 |
| 🏎️ Fórmula 1 | Calendario GPs, constructores, pilotos favoritos |
| 🏍️ MotoGP | Calendario, Moto2, Moto3 |
| 🚴 Ciclismo | Tour de Francia, Vuelta a España, Giro, Clásicas |
| 🏓 Pádel | Premier Padel, WPT |
| ⛳ Golf | PGA Tour, DP World Tour, Ryder Cup |
| 🏉 Rugby | Six Nations, Mundial |
| 🏅 Olimpiadas | Verano e Invierno (cada 4 años) |

Seleccionar equipo(s), competición(es) y selección nacional → partidos entran automáticamente en Calendario. Notificación configurable antes del partido.

### 6.3 Entretenimiento
Biblioteca personal de consumo cultural con estado y crítica.

| Sub-sección | Contenido |
|---|---|
| 🎮 **Videojuegos** | PC, PlayStation, Nintendo Switch, Xbox, Móvil — portada, estado (jugando/completado/abandonado/wishlist), horas, puntuación, crítica |
| 📚 **Libros** | Portada, autor, estado (leyendo/leído/abandonado/wishlist), puntuación, crítica personal, fecha lectura |
| 🎬 **Películas y Series** | Estado, plataforma donde está disponible, puntuación, crítica |
| 🎵 **Música** | Álbumes favoritos, wishlist, puntuación — vinculado a Eventos > Conciertos |
| 🎙️ **Podcasts** | Siguiendo, episodios guardados |

**Patrón común a todo:** portada/foto subible, estado, ⭐ puntuación (1-5), crítica con texto libre.

### 6.4 Hobbies
Catálogo abierto de pasatiempos personales. Plantillas específicas para los más comunes.

**Plantilla: 📷 Fotografía**
- Equipo: cámara (modelo, nº serie, garantía), objetivos (focal, apertura, brand), filtros, trípode, flash, bolsas → vincula a Equipamiento de Hogar
- Proyectos/sesiones: álbumes, tema, fotos destacadas
- Mantenimiento: limpieza sensor, calibración objetivos

**Plantilla: 🖌️ Pintura**
- Materiales: pinturas (acrílico/óleo/acuarela), pinceles, lienzos → stock vinculado a Almacenamiento
- Obras: foto, técnica, dimensiones, estado (en proceso/terminada/vendida/regalada), puntuación, notas

**Hobby genérico (cualquier otro):**
- Nombre, descripción, categoría, foto
- Proyectos activos: progreso, fotos del proceso
- Materiales necesarios → Almacenamiento / Lista de compra

### 6.5 Regalos
| Campo | Detalle |
|---|---|
| Persona | Nombre, relación (familia/amigo/pareja), talla(s) vinculada desde Personal > Ropa |
| Ocasión | Cumpleaños, Navidad, boda, nacimiento, otro |
| Fecha | → alerta en Calendario X días antes configurable |
| Ideas | Lista de ideas para esa persona |
| Estado | Pendiente / Comprado / Entregado |
| Presupuesto | Máximo, coste real |

Alerta: *"Cumpleaños de Laura en 12 días — tienes 3 ideas anotadas"*

### 6.6 Viajes
| Campo | Detalle |
|---|---|
| Destino | Ciudad/país, fechas |
| Alojamiento | Hotel/airbnb, confirmación, dirección |
| Transporte | Vuelos, trenes, coche — referencia de reserva |
| Gastos | Presupuesto vs gasto real → Finanzas |
| Fotos | Galería del viaje |
| Notas | Recomendaciones, sitios visitados |

### 6.7 Eventos
| Campo | Detalle |
|---|---|
| Tipo | Concierto, teatro, obra, festival, exposición |
| Fecha y lugar | → Calendario |
| Entradas | Foto/PDF, precio → Finanzas |
| Valoración | Post-evento: puntuación y crítica |

---

## 7. Infraestructura transversal

### 7.1 Calendario global
El calendario no pertenece a ninguna app. Es una capa global donde todas las apps escriben eventos.

**Capas del calendario:**
1. 🇪🇸 **Festivos España** — 3 niveles: nacional + autonómico + municipal (configurado en onboarding por municipio de trabajo)
2. 💼 **Trabajo** — franjas bloqueadas, no editables desde calendario
3. 🏠 **Hogar** — tareas de limpieza, eventos colegio hijos
4. 👤 **Personal** — citas médicas, vacunas mascota, ITV, vencimiento documentos
5. 💰 **Finanzas** — vencimiento seguros, renovación suscripciones, campaña renta
6. 🎭 **Ocio** — partidos deportivos, conciertos, cumpleaños/aniversarios
7. 🎂 **Aniversarios recurrentes** — cumpleaños y fechas importantes, se repiten cada año

**Festivos por municipio:** durante onboarding se selecciona provincia → municipio. El sistema aplica las 3 capas automáticamente. Fuente: dataset estático 2025-2027 para demo; API datos.gob.es para producción.

**Integración trabajo+festivos:** si un día es festivo en el municipio del trabajo, el bloque laboral no aparece (o aparece como "día libre excepcional" si trabaja ese día).

### 7.2 Telegram multi-usuario
Cada usuario vincula su propio Telegram en Ajustes.

| Función | Descripción |
|---|---|
| Añadir a lista de compra | Mensaje de texto → item en lista compartida |
| Foto de ticket | → Finanzas > Tickets con gasto categorizado |
| Foto de factura | → Equipamiento del item correspondiente |
| Foto de mapa Roomba | → Limpieza > Roomba |
| Fotos de rutas/hobbies | → sección correspondiente |
| Notificaciones salientes | Stock bajo, tareas pendientes, vencimientos, partidos |

Atribución: *"🛒 María añadió leche · hace 5 min"*

### 7.3 Onboarding
Flujo de configuración inicial que popula todas las apps. Pasos:

1. **Perfil básico** — nombre, foto, email, municipio de residencia
2. **Situación vital** — checkboxes que activan/desactivan secciones:
   - ☐ Tengo pareja / compañeros de piso
   - ☐ Tengo hijos
   - ☐ Tengo mascota
   - ☐ Tengo coche
   - ☐ Tengo terraza
   - ☐ Tengo trastero / parking
   - ☐ Tengo gym o hago deporte
3. **Tu trabajo** — municipio, horario, trayecto, ¿trabaja festivos?
4. **Tu hogar** — tipo (piso/casa), m², nº habitaciones, electrodomésticos principales
5. **Comidas** — toggle de cada comida del día (desayuno/almuerzo/merienda/comida/cena)
6. **Limpieza** — activar/desactivar tareas de fábrica, frecuencia por cada una
7. **Telegram** — vincular chat de cada miembro del hogar
8. **Compartición** — si hay más personas, configurar qué se comparte (ver §8)

### 7.4 Ajustes
- Gestión de perfiles del hogar
- Configuración Telegram por usuario
- Panel de compartición (qué secciones, con quién, con qué permisos)
- Secciones opcionales (activar/desactivar)
- Comidas activas del menú
- Notificaciones (qué alertas, cuándo)

---

## 8. Modelo de compartición (multi-usuario)

### 8.1 Principios
- Cada persona tiene su **cuenta individual** con su propio Telegram
- Se pueden compartir secciones específicas con otras personas del hogar
- La compartición es **unidireccional con permisos**: el propietario decide qué comparte y con qué nivel

### 8.2 Niveles de permiso
| Nivel | Símbolo | Descripción |
|---|---|---|
| **Compartido editable** | 🔓 | Ambos ven y modifican |
| **Compartido solo vista** | 👁️ | El otro ve pero no edita |
| **Privado** | 🔒 | Solo el propietario lo ve |

### 8.3 Defaults recomendados por sección

| Sección | Default |
|---|---|
| Calendario | Compartido vista + eventos marcables como privados |
| Lista de compra | Compartido editable |
| Menú semanal | Compartido editable |
| Nevera / Despensa | Compartido editable |
| Limpieza (tareas) | Compartido editable |
| Recetas | Compartido editable |
| Trabajo | Privado (solo bloquea horas en calendario) |
| Salud | Privado por defecto |
| Ropa / Documentación | Privado por defecto |
| Finanzas | Configurable |
| Suscripciones | Compartido vista |
| Ocio | Compartido editable |

### 8.4 Eventos privados en calendario
El evento existe, la otra persona ve que estás ocupado ese rato. No ve título ni detalles — solo muestra "Ocupado".

### 8.5 En la demo
La compartición real (multi-cuenta) no está implementada en la demo. La demo simula:
- Un panel "Mi hogar compartido" que muestra qué secciones están compartidas con una persona ficticia ("María")
- Indicadores visuales en cada sección del nivel de compartición (icono 🔓👁️🔒)
- Algunos items de lista de compra atribuidos a "María" para simular la experiencia
- En ajustes: pantalla de gestión de compartición interactiva (aunque estática en demo)

---

## 9. Diseño — mejoras a aplicar

El proyecto tiene un sistema de diseño H3nky definido. Aplicar consistentemente en las nuevas secciones y revisar las existentes.

### 9.1 Tokens a usar
```css
/* Colores por app */
--app-hogar:    #f97316;  /* Orange */
--app-personal: #38bdf8;  /* Sky blue */
--app-finanzas: #22c55e;  /* Green */
--app-ocio:     #a855f7;  /* Purple */

/* Tokens globales (ya existen en index.css) */
--accent: #fe7000;
--radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
--shadow-card / --shadow-card-hover / --shadow-cta;
--transition: 200ms ease-out;
```

### 9.2 Patrones visuales clave
- **Cards:** `h3nky-card` — 1px border, 16px radius, border-top 2px con color de app, hover → orange border + shadow naranja sutil
- **Lo más útil visible:** en recetas, tiempo total (prep+cocción) en la tarjeta. En limpieza, próxima tarea vencida. En equipamiento, próximo mantenimiento. En seguros, días hasta vencimiento.
- **Tipografía:** títulos Orbitron/bold, labels Exo 2 uppercase 11px 0.16em tracking, body Sora
- **Estados:** pills con dot de color + texto (11px Mono)
- **Filtros:** `.h3nky-filter` pills redondeadas, activo = orange bg
- **Secciones opcionales:** aparecen con badge "opcional" y estado desactivado hasta activar en ajustes
- **Navegación lateral:** 208px desktop / full-width mobile, active = orange bg + white text

### 9.3 Aplicar nuevo diseño de home/docs/demo a apps
Las apps deben igualar el nivel de polish de la landing, docs y demo home:
- Misma densidad visual y espaciado
- Cards con hover effects consistentes
- Iconos SVG stroke-2 o emojis según contexto
- Empty states cuidados (no "No hay datos" sino mensaje contextual con CTA)
- Responsive: mobile-first, sidebar en desktop

---

## 10. Fuera de scope (esta iteración)

- **IA / sugerencias automáticas** — primero el sistema aprende el comportamiento del usuario
- **Multi-usuario real** — la demo simula compartición; producción lo implementaría con cuentas reales
- **Sincronización en tiempo real** entre dispositivos
- **Integración bancaria** — los gastos se introducen manualmente o vía foto de ticket
- **OCR de tickets** — se asume introducción manual en demo; en producción con servicio OCR
- **Apps personalizadas desde cero** — se puede activar/desactivar apps existentes, no crear nuevas

---

## 11. Orden de implementación recomendado

Dado que Hogar ya existe parcialmente, el orden lógico es:

1. **Restructurar Hogar** — reorganizar en bloques Cocina/Limpieza/Espacios/Casa + aplicar diseño
2. **Ampliar Limpieza** — tareas de fábrica, productos por tarea, Roomba, personal
3. **Ampliar Almacenamiento** — Nevera/Congelador/Despensa/Limpieza/Baño/Trastero/Terraza
4. **Demo de compartición** — panel y simulación visual
5. **App Personal** — Trabajo + Salud + Deporte + Vehículos + Mascotas + Ropa + Documentación
6. **App Finanzas** — Suscripciones + Seguros + Gastos fijos + Hipoteca + Tickets + Presupuesto + Renta
7. **App Ocio** — Restaurantes + Deportes + Entretenimiento + Hobbies + Regalos + Viajes + Eventos
8. **Calendario global** — festivos España por municipio, integración de todas las apps
9. **Onboarding** — flujo completo de configuración inicial
10. **Telegram multi-usuario** — vinculación por usuario, atribución de acciones

Cada punto se implementa con revisión de funcionamiento antes de pasar al siguiente.
