// src/data/demo/ocio.js
const hoy = new Date()
const fmt = d => d.toISOString().slice(0, 10)
const addD = (n) => { const d = new Date(hoy); d.setDate(d.getDate() + n); return d }
const subD = (n) => addD(-n)

export const mockOcio = {
  restaurantes: [
    {
      id: 'rest-1', nombre: 'La Pepita', tipo_cocina: 'Mediterránea', ciudad: 'Barcelona',
      valoracion: 5, repetirias: true, wishlist: false,
      visitas: [
        { id: 'v1', fecha: fmt(subD(30)), con_quien: 'Pareja', importe: 68, nota: 'Excelente pulpo', valoracion: 5 },
        { id: 'v2', fecha: fmt(subD(120)), con_quien: 'Amigos', importe: 45, nota: 'Tapas geniales', valoracion: 4 },
      ],
      tags: ['romántico', 'tapas'],
    },
    {
      id: 'rest-2', nombre: 'Sushi Kimura', tipo_cocina: 'Japonesa', ciudad: 'Barcelona',
      valoracion: 4, repetirias: true, wishlist: false,
      visitas: [{ id: 'v3', fecha: fmt(subD(60)), con_quien: 'Solo', importe: 35, nota: 'Buen omakase', valoracion: 4 }],
      tags: ['sushi', 'tranquilo'],
    },
    {
      id: 'rest-3', nombre: 'El Rincón Perdido', tipo_cocina: 'Tradicional', ciudad: 'Girona',
      valoracion: 0, repetirias: null, wishlist: true,
      visitas: [], tags: ['recomendado'],
    },
  ],

  viajes: [
    {
      id: 'viaj-1', destino: 'Lisboa', pais: 'Portugal', estado: 'completado',
      fecha_inicio: fmt(subD(200)), fecha_fin: fmt(subD(194)),
      alojamiento: { nombre: 'Pensión Solar', tipo: 'hostal', confirmacion: 'CONF-12345', direccion: 'Rua da Glória 12' },
      transporte: [{ id: 't1', tipo: 'vuelo', referencia: 'VY1234', origen: 'Barcelona', destino: 'Lisboa', fecha: fmt(subD(200)) }],
      presupuesto: 600, gasto_real: 580, notas: 'Ciudad preciosa, pasteles de nata imprescindibles',
    },
    {
      id: 'viaj-2', destino: 'Tokio', pais: 'Japón', estado: 'planificado',
      fecha_inicio: fmt(addD(120)), fecha_fin: fmt(addD(134)),
      alojamiento: { nombre: 'Shinjuku Hotel', tipo: 'hotel', confirmacion: '', direccion: '' },
      transporte: [],
      presupuesto: 2500, gasto_real: 0, notas: '',
    },
  ],

  eventos: [
    {
      id: 'ev-1', tipo: 'concierto', titulo: 'Vetusta Morla — Palau Sant Jordi',
      artista: 'Vetusta Morla', recinto: 'Palau Sant Jordi', ciudad: 'Barcelona',
      fecha: fmt(addD(45)), precio: 55, estado: 'confirmado', valoracion: 0, notas: '',
    },
    {
      id: 'ev-2', tipo: 'teatro', titulo: 'El método Grönholm',
      artista: 'TNC', recinto: 'Teatre Nacional de Catalunya', ciudad: 'Barcelona',
      fecha: fmt(subD(15)), precio: 28, estado: 'asistido', valoracion: 5, notas: 'Actuación impresionante',
    },
  ],

  regalos: [
    {
      id: 'reg-1', persona: 'María', relacion: 'pareja',
      ocasion: 'cumpleanos', fecha: fmt(addD(30)),
      presupuesto_max: 150, coste_real: 0, estado: 'pendiente',
      ideas: [
        { id: 'idea-1', descripcion: 'Auriculares Sony WH-1000XM5', precio_aprox: 350, url: '' },
        { id: 'idea-2', descripcion: 'Perfume Chanel Nº5', precio_aprox: 120, url: '' },
      ],
    },
    {
      id: 'reg-2', persona: 'Papá', relacion: 'familia',
      ocasion: 'navidad', fecha: fmt(new Date(hoy.getFullYear(), 11, 25)),
      presupuesto_max: 80, coste_real: 75, estado: 'comprado',
      ideas: [{ id: 'idea-3', descripcion: 'Libro Historia de España', precio_aprox: 25, url: '' }],
    },
  ],

  hobbies: [
    {
      id: 'hob-1', nombre: 'Fotografía', categoria: 'Arte', icono: '📷',
      descripcion: 'Fotografía urbana y retratos',
      proyectos: [
        { id: 'proy-1', titulo: 'Retratos del barrio', estado: 'en_proceso', notas: '12 fotos de 20', fecha: fmt(hoy) },
        { id: 'proy-2', titulo: 'Mercado de la Boqueria', estado: 'terminado', notas: '', fecha: fmt(subD(60)) },
      ],
      materiales: [
        { id: 'mat-1', nombre: 'Tarjetas SD 64GB', stock: 3, unidad: 'uds' },
        { id: 'mat-2', nombre: 'Baterías LP-E6', stock: 2, unidad: 'uds' },
      ],
    },
    {
      id: 'hob-2', nombre: 'Pintura acrílica', categoria: 'Arte', icono: '🎨',
      descripcion: 'Pintura abstracta en acrílico',
      proyectos: [{ id: 'proy-3', titulo: 'Paisaje urbano', estado: 'en_proceso', notas: 'Boceto listo', fecha: fmt(hoy) }],
      materiales: [
        { id: 'mat-3', nombre: 'Pintura acrílica blanco', stock: 2, unidad: 'tubos' },
        { id: 'mat-4', nombre: 'Lienzo 40x50', stock: 5, unidad: 'uds' },
      ],
    },
  ],

  entretenimiento_videojuegos: [
    { id: 'vg-1', titulo: 'Hollow Knight', plataforma: 'PC', estado: 'completado', horas: 42, puntuacion: 5, critica: 'Obra maestra del género' },
    { id: 'vg-2', titulo: 'Elden Ring', plataforma: 'PC', estado: 'jugando', horas: 80, puntuacion: 0, critica: '' },
    { id: 'vg-3', titulo: "Baldur's Gate 3", plataforma: 'PC', estado: 'wishlist', horas: 0, puntuacion: 0, critica: '' },
  ],

  entretenimiento_libros: [
    { id: 'lib-1', titulo: 'El nombre del viento', autor: 'Patrick Rothfuss', estado: 'leido', puntuacion: 5, critica: 'Magistral', fecha_lectura: fmt(subD(90)) },
    { id: 'lib-2', titulo: 'Dune', autor: 'Frank Herbert', estado: 'leyendo', puntuacion: 0, critica: '', fecha_lectura: null },
    { id: 'lib-3', titulo: 'Sapiens', autor: 'Yuval Noah Harari', estado: 'wishlist', puntuacion: 0, critica: '', fecha_lectura: null },
  ],

  entretenimiento_peliculas: [
    { id: 'pel-1', titulo: 'Oppenheimer', tipo: 'pelicula', plataforma: 'HBO Max', estado: 'visto', puntuacion: 5, critica: 'Nolan en estado puro', anio: 2023 },
    { id: 'pel-2', titulo: 'The Bear', tipo: 'serie', plataforma: 'Disney+', estado: 'viendo', puntuacion: 0, critica: '', anio: 2022 },
    { id: 'pel-3', titulo: 'Shogun', tipo: 'serie', plataforma: 'Disney+', estado: 'wishlist', puntuacion: 0, critica: '', anio: 2024 },
  ],

  entretenimiento_musica: [
    { id: 'mus-1', titulo: 'Discovery', artista: 'Daft Punk', anio: 2001, puntuacion: 5, critica: 'Perfecto. Sin más.' },
    { id: 'mus-2', titulo: 'Is This It', artista: 'The Strokes', anio: 2001, puntuacion: 5, critica: 'El mejor debut del siglo XXI' },
  ],

  entretenimiento_podcasts: [
    { id: 'pod-1', nombre: 'Lex Fridman Podcast', autor: 'Lex Fridman', estado: 'siguiendo', episodios_guardados: 3, notas: 'Ideal para el gym' },
    { id: 'pod-2', nombre: 'Historias de la Historia', autor: 'Varios', estado: 'siguiendo', episodios_guardados: 1, notas: '' },
  ],

  deportes_seguimiento: [
    {
      id: 'dep-1', deporte: 'Fútbol', equipo: 'FC Barcelona', competicion: 'La Liga',
      partidos: [
        { id: 'p1', rival: 'Real Madrid', es_local: true, fecha: fmt(addD(15)), goles_local: null, goles_visitante: null },
        { id: 'p2', rival: 'Atlético de Madrid', es_local: false, fecha: fmt(subD(7)), goles_local: 2, goles_visitante: 1 },
      ],
    },
    {
      id: 'dep-2', deporte: 'Baloncesto', equipo: 'FC Barcelona Basket', competicion: 'ACB',
      partidos: [
        { id: 'p3', rival: 'Real Madrid Baloncesto', es_local: false, fecha: fmt(addD(8)), goles_local: null, goles_visitante: null },
      ],
    },
  ],
}
