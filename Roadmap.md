---
tipo: roadmap
proyecto: "[[01_Projects/HUBos/HUBos|HUBos]]"
actualizado: 2026-10-20
tags:
  - roadmap
  - hubos
  - ios
  - apple-fitness
---

# 🗺️ Roadmap de Desarrollo: HUBos

## 🟢 Fase 1: Arquitectura Core & Unificación (Completada y Operativa)
- [x] Contenedor modular Next.js 15 + React 19 + Capacitor iOS.
- [x] HUB Launcher con selector de apps y Omnibar de IA.
- [x] Módulo RecompAI (escáner nutricional, macros, coach IA).
- [x] Módulo Aesthetix (modelo anatómico, heatmap, tracking de entrenamientos en vivo).
- [x] Módulo Subscription Manager (control de gastos recurrentes y alertas).
- [x] Módulo Schedule (calendario académico, importador IA de horarios).
- [x] Persistencia offline con Capacitor Preferences.

## 🟢 Fase 2: Rediseño Apple Fitness 1:1 & Motor de Animaciones Emil Kowalski (Completada - 2026-10-19)
- [x] Instalación de la suite completa de 8 skills de diseño y animación de Emil Kowalski (`animate`, `apple-design`, `emil-design-eng`, etc.).
- [x] Rediseño integral de Aesthetix con estética 1:1 de Apple Fitness (fondo OLED puro `#000000`, tarjetas `#1C1C1E`).
- [x] Anillos de actividad concéntricos 3D interactivos en SVG (Move `#FA114F`, Exercise `#A1F524`, Stand `#00F0FF`).
- [x] Fila de días de la semana con mini-anillos de actividad (`S S M T W T F`).
- [x] Trío de Bento Cards (Steps, Distance, Flights / Volumen, Racha, Rangos).
- [x] Gráfica de barras semanal "This Week" con selector dinámico de métricas y línea de meta.
- [x] Sección de entrenamientos recientes con tarjetas estilo Apple Fitness y acceso rápido a *"Hoy Toca"*.
- [x] Barra de navegación flotante tipo cápsula de vidrio esmerilado con indicador circular verde lima de selección activa.
- [x] Segmented Control en la pestaña Workouts (Mis Rutinas y Catálogo de 1.324 ejercicios con GIFs).
- [x] Preservación del 100% de funcionalidades (live workout, rest timer, modelo 3D de simetría y Gemini IA).

## 🟢 Fase 3: Rutinas editables y distribución v2.8.1 (Completada - 2026-10-20)
- [x] Edición de rutinas existentes con miniaturas, nombres y datos de cada ejercicio.
- [x] Guardado inmediato al añadir ejercicios y al cambiar su orden, con cierre del editor después de añadir.
- [x] Reordenamiento de ejercicios con controles de flecha y arrastre táctil, con animación.
- [x] Correcciones de interfaz Aesthetix: contenido libre del dock, regreso al HUB, perfil y encabezado de modal móvil.
- [x] Registro de versión en `UPDATES.md`, proyecto Xcode y workflow iOS; IPA v2.8.1 compilado y publicado en GitHub Releases.


## 🟢 Fase 4: Galería de fotos, calidad HD y velocidad de Gemini (Completada - 2026-10-20)
- [x] Galería de comida sin rótulo redundante, contador de fotos centrado y padding corregido dentro de la tarjeta.
- [x] Visor de foto casi a pantalla completa, sin recorte y alimentado por la copia HD de IndexedDB.
- [x] Captura HD a 1600 px / calidad 0.88, miniaturas de 320 px y carga diferida en la cuadrícula.
- [x] Fotos de progreso corporal con el mismo tratamiento de alta definición.
- [x] Escaneo con Gemini más rápido: `gemini-3.6-flash` como modelo de visión, JSON nativo, sin razonamiento previo y payload de 896 px.
- [x] v2.8.2 preparada y enviada al workflow de iOS para publicar el IPA en GitHub Releases.

## 🟢 Fase 5: Detalle de comida y notificaciones (Completada - 2026-10-20)
- [x] Detalle de comida: nombre sin solaparse con la caja de calorías y padding correcto.
- [x] Retirada la píldora "Escaneo con IA" del modal.
- [x] Modal de detalle en portal: el encabezado ya no se dibuja encima de la hoja.
- [x] Componente único de notificaciones in-app (toast, alertas nutricionales y logros) con el lenguaje Apple Fitness.
- [x] Recordatorio diario de las 09:00 para registrar el progreso físico en RecompAI.
- [x] Interruptor de notificaciones y horario visible en Ajustes.
- [x] Versión v2.8.3 enviada al workflow de iOS.
