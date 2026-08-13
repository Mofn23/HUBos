# HUBos — Changelog & Updates Log

Este documento lleva el registro cronológico completo de todas las versiones, mejoras de arquitectura, módulos integrados y optimizaciones implementadas en la Super-App **HUBos**.

---

## 🛠️ [v1.4.4] - 2026-08-13 (Rediseño MonAI del HUB Principal & Eliminación de Barra Flotante Global)

### 🌟 Unificación Visual del HUB Launcher
- **Eliminación Total de la Barra Flotante Inferior Global (`FloatingHubBar`)**:
  - Removida la barra inferior del launcher principal para ofrecer una experiencia limpia e inmersiva sin elementos flotantes superpuestos.
- **Rediseño Completo del Dashboard del HUB (`HubDashboard.tsx`)**:
  - Unificado con la estética de tarjetas oscuras OLED MonAI (`#1C1C1E` / `#242426`) y acentos verdes `#34C759`.
  - **Tarjeta de Estado Global**: Métricas de sincronización lado a lado de RecompAI (calorías restantes, déficit, % de bomba de glucógeno) y Suscripciones (gasto mensual recurrente y servicios activos).
  - **Tarjetas de Aplicaciones Modulares**: Tarjetas amplias táctiles con iconos grandes (`🥑 Recomp AI` y `📺 Suscripciones`), telemetría en tiempo real y botón de acceso directo `Abrir →`.
  - **Acceso Rápido al Sistema**: Configuración de ecosistema, llaves de API y copias de seguridad.

---

## 🛠️ [v1.4.3] - 2026-08-13 (Píldoras Flexibles de Filtros, Botón Píldora Compacto & Unificación MonAI en Fugas/Timeline)

### 🌟 Ajustes y Perfeccionamiento de Diseño
- **Eliminación de Etiquetas de Hashtag (`#suscripción`)**:
  - Removido el texto `#suscripción` de las tarjetas de lista en `SubscriptionList.tsx`.
- **Botón de Guardado Compacto (`SubscriptionModal.tsx`)**:
  - Rediseñado el botón inferior como una píldora centrada elegante con icono de confirmación (`✓ Guardar Suscripción`) con sombra verde y efecto táctil.
- **Píldoras de Filtro no Deformables (`SubscriptionsView.tsx`)**:
  - Añadido `shrink-0 min-h-[38px]` y contenedor flexible para que las píldoras (`Todas 📺`, `Timeline ⏰`, `Fugas 💡`, `Cancelar 🚫`) nunca se aplasten ni se desborden al cambiar de pestaña.
- **Unificación de Colores MonAI en Fugas e Insights (`InsightsView.tsx` & `TimelineView.tsx`)**:
  - Sustituidos todos los acentos azules por el verde característico MonAI (`#34C759`), tarjetas redondeadas `#1C1C1E` con bordes suaves y barras de progreso fluidas.

---

## 🛠️ [v1.4.2] - 2026-08-13 (Corrección Universal de Fondos Oscuros en Inputs de iOS)

### 🌟 Correcciones Visuales y Estilos Nativos
- **Eliminación Total de Fondos Blancos en Inputs y Selects**:
  - Declaradas reglas universales en `globals.css` para `input`, `select`, `textarea` y `.input-field` forzando `background-color: #1C1C1E !important`, `color: #F5F5F7 !important` y `-webkit-appearance: none !important`.
  - Añadido `color-scheme: dark !important` y chevron SVG personalizado para selectores desplegables nativos en iOS WebKit.
  - Actualizados todos los campos de `SubscriptionModal.tsx` con estilos explícitos oscuros de alta legibilidad y alturas uniformes (`h-12`).

---

## 🛠️ [v1.4.1] - 2026-08-13 (Ajustes de Navegación en Suscripciones, Modal MonAI & Limpieza Visual)

### 🌟 Ajustes y Refinamiento de Interfaz
- **Limpieza del TopBar de Suscripciones**:
  - Reemplazado el menú desplegable innecesario de `RappiPay` por el botón de retorno al HUB principal (`🏠 Volver al HUB`).
  - Eliminado el botón redundante de calendario junto al botón de ajustes.
- **Eliminación del Conmutador de Gastos**:
  - Removido el segmento superior que mostraba `Gastos & Finanzas 💳` y `Suscripciones 📺`, maximizando el espacio limpio para las tarjetas de costos y filtros.
- **Rediseño del Modal de Agregar / Editar Suscripción (`SubscriptionModal.tsx`)**:
  - Actualizado al diseño MonAI ultra-minimalista en fondo OLED oscuro (`#121214`), con detector inteligente de emojis, selector de chips de iconos, periodicidad, día de cobro y botón verde `✓ Guardar Suscripción` con espaciado inferior seguro.
- **Rediseño de la Hoja de Ajustes del Sistema (`HubSettingsSheet.tsx`)**:
  - Unificado con la estética de tarjetas MonAI para configuración de perfil, moneda, API Key de Gemini y copias de seguridad.

---

## 🚀 [v1.4.0] - 2026-08-13 (Diseño 1:1 de Suscripciones & Espaciado Seguro para Dynamic Island)

### 🌟 Rediseño 1:1 del Gestor de Suscripciones & Ajustes de Interfaz
- **Espaciado Superior para Dynamic Island**:
  - Incrementado el padding superior a `pt-16` / `pt-[calc(env(safe-area-inset-top,44px)+16px)]` en `RecompView`, `SubscriptionsView` y `HubDashboard`, eliminando cualquier colisión o contacto con la Dynamic Island y la barra de estado de iOS.
- **Rediseño Integral de la App de Suscripciones (`SubscriptionsView` & `SubscriptionList`)**:
  - **TopBar 1:1**: Selector de cuenta desplegable `RappiPay ⌄` a la izquierda, botones circulares de `[ 📅 Calendario ]` y `[ ⚙️ Ajustes ]` a la derecha.
  - **Conmutador Segmentado Superior**: Segmentos estilizados `Gastos & Finanzas 💳` y `Suscripciones 📺` (con fondo verde `#34C759` y texto blanco en el estado activo).
  - **Tarjetas de Resumen Financiero Lado a Lado**: `Costo Mensual ($ 44,900 / mes)` y `Costo Anual ($ 538,800 / año)`.
  - **Barra de Filtros Horizontales**: Píldoras de filtro `Todas 📺`, `Timeline ⏰`, `Fugas 💡` y `Cancelar 🚫`.
  - **Botón de Acción**: Botón prominente `+ Agregar Suscripción`.
  - **Tarjetas de Suscripción 1:1**:
    - Icono de servicio en contenedor oscuro redondeado `#242426`.
    - Nombre del servicio (ej. `Icloud+`), categoría y periodicidad (`Servicio • Mensual • Día 3`) con etiqueta `#suscripción`.
    - Importe en rojo coral `-$44,900` con botón verde `Pagar`, botón de edición `✏️` y botón de eliminación `🗑️`.

---

## 🛠️ [v1.3.3] - 2026-08-13 (Compresión Inteligente de Fotos, Corrección de Cuota Gemini & Cero Crashes)

### 🌟 Correcciones Críticas de Estabilidad y Rendimiento
- **Compresión Automática de Imágenes (`src/lib/image.ts`)**:
  - Implementada compresión adaptativa en canvas HTML5 (máximo 800px, calidad 0.7) antes de enviar datos a Gemini o persistir en el almacenamiento local.
  - **Eliminación del Error de Cuota Excedida (`RESOURCE_EXHAUSTED`)**: Las fotos directas de cámara de iPhone (12-15MB) ahora se optimizan a ~150KB, respetando holgadamente el límite de payload de Google Gemini.
  - **Eliminación del Crash de la Aplicación (`Application error / QuotaExceededError`)**: Evita saturar el `localStorage` de iOS con cadenas Base64 pesadas al cerrar o guardar comidas, erradicando los reinicios forzados de la app.
- **Pipeline de Modelos de Visión Oficiales**:
  - Priorizados modelos estables de visión con fallback automático transparente (`gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-flash-8b`, `gemini-2.0-flash-lite-preview-02-05`).

---

## 🛠️ [v1.3.2] - 2026-08-13 (Pipeline de Modelos Gemini 3.5 & Ocultamiento Total de Barra de Navegación)

### 🌟 Correcciones y Robustez de IA
- **Pipeline Completo de Modelos Gemini (`src/constants/ai.ts` & `src/lib/gemini.ts`)**:
  - Configurado **`gemini-3.5-flash-lite`** como modelo principal activo (`AI_CONFIG.DEFAULT_MODEL` y `VISION_MODEL`).
  - Implementada la lista de respaldo automático en cascada en el orden exacto especificado:
    1. `gemini-3.5-flash-lite` (Primario)
    2. `gemini-3.1-flash-lite`
    3. `gemini-2.0-flash`
    4. `gemini-1.5-flash-latest`
    5. `gemini-2.5-flash`
    6. `gemini-1.5-flash`
    7. `gemini-2.0-flash-lite`
  - Función `generateContentWithFallback` con captura transparente de errores y fallback instantáneo.
- **Ocultamiento Automático de la Barra de Navegación al Abrir Modales**:
  - Al abrir el modal de escaneo de comida, la barra dock inferior se oculta inmediatamente (`opacity-0 pointer-events-none translate-y-24 scale-90`).
  - Elevación incrementada en `MealCaptureModal` (`pb-16`, margen inferior `mb-4` y `z-[99999]`) para que el botón verde `✨ Analizar Comida` quede 100% visible, amplio y cómodo de presionar.

---

## 🛠️ [v1.3.1] - 2026-08-13 (Corrección de Modelos Gemini & Ajuste de Elevación de Modals)

### 🌟 Correcciones y Parches
- **Corrección del Modelo Gemini (Error 404 / Interactions API)**:
  - Eliminado el modelo obsoleto/no disponible `gemini-2.5-flash`.
  - Establecido `gemini-2.0-flash` como modelo principal por defecto con fallback automático resiliente a `gemini-1.5-flash` y `gemini-1.5-pro`.
  - Sanitización estricta de imágenes Base64 y extracción de MIME types (`data:[^;]+;base64`) para escaneo multimodal de comidas y progreso físico.
- **Corrección de Elevación y Visibilidad en Hojas Modales**:
  - Ajustado el `z-index` de la barra dock flotante de navegación (`.monai-bottom-nav-container`) a `z-40` y los modales/hojas flotantes a `z-[9999]`.
  - Añadido padding inferior de seguridad `pb-[calc(env(safe-area-inset-bottom,24px)+28px)]` en `MealCaptureModal`, `DateSelectionModal`, `MealsSection` y `ProfilePage` para que el botón verde `✨ Analizar Comida` quede completamente visible, elevado y cómodo para pulsar con el pulgar.

---

## 🚀 [v1.3.0] - 2026-08-13 (Perfil & Ajustes 1:1, Análisis Corporal IA, Icono Nativo iOS y Corrección de Barra Flotante)

### 🌟 Corrección de Interfaz, Perfil 1:1 & Nuevo Módulo de Progreso Corporal
- **Eliminación Total de Barras Flotantes Sobrepuestas**:
  - La barra global `FloatingHubBar` ahora se muestra **únicamente en el HUB principal**.
  - Al entrar a `RecompAI`, se utiliza exclusivamente su propia barra inferior dock nativa (`[ 🏠 ] [ 🍴 ] [ 🏋️‍♂️ ] [ 👤 ]`), eliminando por completo cualquier colisión o sobreposición visual.
- **Pantalla de Perfil y Ajustes 1:1 (`ProfilePage` - Tab `👤`)**:
  - **Tarjeta de Usuario**: Nombre `Samuel` con objetivo `🎯 Recomposición Corporal • 80kg`.
  - **Selector de Modo de Tema**: Píldoras segmentadas `🌙 Tema Oscuro` y `☀️ Tema Claro`.
  - **Metas de Calorías y Macronutrientes**: `🎯 Meta Calórica Diaria (2275 kcal)` y `🥗 Metas de Macronutrientes (150g Proteína)`.
  - **Configuración de API Key de Gemini**: Indicador de estado `[Activo]` con campo de texto protegido y botón de guardado verde `✓ Guardar API Key`.
  - **Consumo Semanal (kcal)**: Gráfico de 5 columnas con píldoras de barras redondeadas, emojis contextuales (`🥗` o `🔥`), calorías y base verde activa para el día actual.
  - **Mis Suplementos**: Lista editable con dosis, horario y botón `+ Añadir` con modal de creación.
  - **Registro Corporal & Tendencia de Peso (`WeightTrend`)**:
    - Algoritmo de media móvil de 7 días (7-Day Moving Average) con línea punteada de peso diario, línea sólida de media móvil y delta de tendencia (`↓ / ↑`).
    - Modal para registrar peso corporal (kg), cintura, pecho y brazos.
  - **Fotos de Progreso Físico & Análisis con Coach IA**:
    - Carga de fotos de progreso físico reales con compresión y almacenamiento en dispositivo.
    - Generación de informe personalizado con Gemini Vision 2.0 / 2.5 evaluando estructura, puntos fuertes, progreso y recomendaciones.
  - **Respaldo y Exportación**: Botones `📥 Resumen .txt`, `📤 Exportar JSON` e `📥 Importar JSON`.
- **Icono Nativo Oficial para iOS Homescreen**:
  - Generado el icono universal `AppIcon-512@2x.png` (1024x1024) en `ios/App/App/Assets.xcassets/AppIcon.appiconset/` y en `public/apple-touch-icon.png` con el diseño OLED negro de HUBos para que aparezca en el HomeScreen de iOS tras la instalación con SideStore.

---

## 💎 [v1.2.0] - 2026-08-13 (React Body Highlighter, Escaneo IA 1:1, Galería Limpia & Logo HUBos)

### 🌟 Ajustes Críticos de Fidelidad y Limpieza
- **Mapa de Fatiga Muscular Oficial (`react-body-highlighter`)**:
  - Sustitución completa del maniquí SVG anterior por la librería oficial `react-body-highlighter` con los componentes `<Model type="anterior" />` y `<Model type="posterior" />`.
  - Mapeo completo en `src/lib/muscleMap.ts` de los 19 músculos anatómicos.
  - Paleta exacta `HIGHLIGHT_COLORS` (`#34C759`, `#86E39E`, `#FECA57`, `#FF9F43`, `#E8505B`, `#B82E3B`) y filtro temporal de 72 horas.
- **Modal de Escaneo IA 1:1 (`MealCaptureModal`)**:
  - Replicación exacta del diseño de la captura: selector superior de categoría (`🥐 Desayuno`, `🍲 Almuerzo`, `🍽️ Cena`, `🍎 Snacks`), área de captura con borde punteado `Toca para tomar foto de tu plato`, caja de descripción y botón verde `✨ Analizar Comida`.
- **Galería de Comidas 100% Limpia**:
  - Eliminadas todas las fotos de demostración dummy.
  - La galería ahora muestra **exclusivamente las fotos reales** que el usuario toma o sube con sus comidas.
- **Entrenamientos Mock Eliminados**:
  - Vaciado del estado inicial (`trainingLogs: []`). Solo se mostrarán las sesiones reales que el usuario suba o registre.
- **Logo Minimalista HUBos**:
  - Creado isotipo geométrico e icono vectorial de alta gama (`src/components/common/HubLogo.tsx` y `public/hubos-icon.svg`) en fondo negro OLED con nexus central plateado y acento neón.

---

## 🚀 [v1.0.0] - 2026-08-13 (Lanzamiento Inicial de HUBos)

### 🌟 Super-App & Contenedor Modular Unificado para iOS
- **Solución al Límite de 3 Apps de SideStore / AltStore**: HUBos consolida múltiples aplicaciones nativas completas e independientes dentro de un único archivo `.ipa`, ocupando sólo **1 de los 3 slots activos permitidos**.
- **Navegación Instantánea (0ms Latency)**: Barra flotante inferior (`FloatingHubBar`) con efecto de cristal (glassmorphism) y conmutación reactiva e inmediata entre el HUB central y los submódulos.

## 🧠 [v1.1.0] - 2026-08-13 (Lógica de Negocio Completa & Vistas 1:1 de RecompAI)

### 🌟 Implementación Integral de Toda la Lógica de Negocio
- **Estado Reactivo Global por Fecha (`selectedDate`)**:
  - Toda la aplicación (calorías, macros, hidratación, bomba de glucógeno, fatiga muscular y comidas) reacciona instantáneamente a la fecha activa `selectedDate`.
  - Hoja flotante modal `📅 Seleccionar Fecha` (`DateSelectionModal`) con opciones rápidas `☀️ Hoy`, `◀️ Ayer` e selector de calendario personalizado `📅 O elige una fecha específica`.
  - Píldora del TopBar con indicador de punto verde si se está visualizando un día pasado.
- **Motor de Rachas Independientes (Streaks Engine)**:
  - **Racha de Gimnasio (`calculateWorkoutStreak`)**: Agrupación por semanas naturales (Lunes a Domingo) con regla de 4 entrenamientos mínimos para mantener viva la racha histórica sin penalizar la semana en curso.
  - **Racha de Nutrición (`calculateNutritionStreak`)**: Conteo de días consecutivos con protección de racha en estado de riesgo (⚠️ naranja) si ayer se registró pero hoy está pendiente.
- **Categorización Determinista y Unívoca de Comidas (`getMealCategory`)**:
  - Prioridad 1: Categoría explícita (`desayuno`, `almuerzo`, `cena`, `snack`).
  - Prioridad 2: Prefijos en descripción (`desayuno:`, `almuerzo:`, etc.).
  - Prioridad 3: Horario del timestamp (05:00-11:59 Desayuno, 12:00-17:59 Almuerzo, 18:00-22:59 Cena, resto Snacks).
- **Pantalla de Comidas 1:1 (`MealsSection` - Tab `🍴`)**:
  - `⭐ COMIDAS FRECUENTES`: Carrusel horizontal con chips de comida rápida, botón `+` para añadir a hoy y `✕` para remover.
  - 4 Secciones (`🥐 Desayuno`, `🍲 Almuerzo`, `🍽️ Cena`, `🍎 Snacks`) con estados vacíos (`Sin registro para...`) y listado detallado de macros.
  - `📸 Galería de Comidas`: Cuadrícula de 3 columnas de fotos con badge inferior de calorías (`615 kcal`, `210 kcal`, etc.).
  - **Botones Flotantes (FABs)**: Botón izquierdo circular `[+]` para registro manual y botón derecho circular coral `[📷]` para escaneo con IA.
- **Pantalla de Entrenamiento 1:1 (`TrainingSection` - Tab `🏋️‍♂️`)**:
  - `🔥 Mapa de Fatiga Muscular [Últimas 72h]`: Vectores anatómicos interactivos (maniquíes anterior y posterior) con degradado según fatiga (`0 Descansado`, `1-2 Series Verde`, `3-5 Series Amarillo`, `6+ Series Coral`).
  - Botón coral destacado `☁️ Subir Capturas de Symmetry` para auditoría con Gemini 2.0.
  - `🏋️ Historial de Entrenamientos` con conteo de ejercicios y desglose de series.
- **Sistema de Alertas Flotantes Adaptativas a la Dynamic Island (`AlertToast`)**:
  - Posicionamiento seguro en `top: calc(env(safe-area-inset-top, 20px) + 12px)`.
  - Chequeos de sodio (>2300mg), meta proteica (<120g a las 8:00 PM) y recordatorio de creatina.
- **Notificaciones Nativas con Sonido (`notifications.ts`)**:
  - Desayuno 10:00 AM, Almuerzo 02:00 PM, Creatina 06:00 PM, Cena 08:30 PM y Alerta nocturna de Racha 09:30 PM.

---

### 🌟 Réplica Exacta de la Interfaz Original de RecompAI
- **TopBar MonAI (`RecompHeader`)**:
  - Píldora de selector de fecha `[Hoy ∨]`.
  - Píldoras de racha de entrenamiento (`[💪 1d]`) y racha de nutrición (`[🥑 2d]`).
  - Botón circular de ajustes (`[⚙️]`).
  - Saludo dinámico con emoji (`Buenas tardes, Samuel 👋`).
- **Hero TotalBlock Calórico 1:1 (`CalorieRing`)**:
  - Etiqueta superior en mayúsculas `CALORÍAS RESTANTES`.
  - Número gigante `+ 2,275 kcal` con insignia circular verde `+`.
  - Píldora de estado `[Déficit]` / `[Óptimo]`.
  - Píldora dual segmentada `[⊝ 0 kcal consumidas]` y `[⊝ Meta 2275 kcal]`.
- **Tarjetas de Macros y Glucógeno**:
  - `💪 Proteína 0g / 150g` con barra de progreso fina en verde `#34C759`.
  - `🍞 Carbos 0g / 250g` con barra de progreso fina en azul `#54A0FF`.
  - `🥑 Grasas 0g / 75g` con barra de progreso fina en naranja `#FF9F43`.
  - Medidor de `⚡ Pump Glucógeno [Óptimo] 50%` con barra en azul.
- **Fila de 3 Widgets Rápidos**:
  - `[💪 Upper B - Rutina Hoy]`, `[🔥 1 días - Racha Gym]`, `[🥑 2 días - Nutrición ⚠️]`.
- **Tracker de Hidratación 1:1 (`WaterTracker`)**:
  - Encabezado `💧 Hidratación 0.0L / 3.0L`.
  - Cuadrícula simétrica de 12 vasos circulares en 2 filas de 6.
  - Botones circulares `[-]` y `[+]` con indicador de vasos y ml.
- **Suplementos y Logros**:
  - Sección `💊 Suplementos 0 / 1 tomados` con switch toggle iOS nativo.
  - Cuadrícula de 5 columnas para `🥇 Logros 5 / 19 desbloqueados` con resplandor verde en logros conseguidos y candados en bloqueados.
- **Comidas de Hoy (`MealLog`)**:
  - Estado vacío con icono `🍽️`, texto y botón verde `+ Registrar Comida`.
- **Barra de Navegación Flotante (`BottomNav`)**:
  - Iconos flotantes `[ 🏠 ]`, `[ 🍴 ]`, `[ 🏋️‍♂️ ]`, `[ 👤 ]` en píldora oscura con elevación.

---

### 🥗 Módulo Integrado: RecompAI (v1.1 Migrado)
- **Registro Calórico & Anillo SVG Dinámico (`CalorieRing`)**: Muestra calorías consumidas vs. meta diaria con estados visuales adaptativos (*Objetivo Óptimo*, *Déficit*, *Superávit*).
- **Barras de Macros**: Indicadores en tiempo real para Proteína (verde), Carbohidratos (naranja) y Grasas (azul).
- **Medidor de Glucógeno & Pump (`GlycogenPumpMeter`)**: Cálculo dinámico del nivel de repleción muscular según los carbohidratos consumidos.
- **Escaneo Inteligente de Comidas (Gemini 2.0 Flash)**: Escaneo mediante foto de cámara/galería o descripción en lenguaje natural con desglose automático de macronutrientes.
- **Auditoría de Entrenamientos Symmetry**: Reconocimiento visual y por texto de capturas de la app Symmetry, cálculo de volumen de carga total en kg y 1RM estimado.
- **Mapa de Calor Muscular**: Distribución de series por grupos musculares acumuladas semanalmente.
- **Hidratación y Suplementación Diaria**: Contador de vasos de agua (250ml) y checklist diario de tomas (Creatina, Whey, Multivitamínico, Magnesio).
- **Coach & Nutricionista IA**: Chat conversacional alimentado con el contexto calórico y de entrenamientos en tiempo real del usuario.

---

### 💳 Módulo Integrado: Subscription Manager (MonAI Engine)
- **Hero Card Financiero con Animaciones**: Visualización del gasto mensual total, proyección anual y barra de presupuesto configurada.
- **Línea de Tiempo / Calendario de Cobros**: Cronograma día por día de las renovaciones del mes actual y del próximo mes.
- **Alertas de Renovación Nativas**: Notificaciones locales emitidas 3 días antes, 1 día antes y el mismo día del vencimiento.
- **Detección Automática de Emojis e Iconografía**: Asignación contextual de emojis para servicios como ChatGPT, Spotify, Netflix, iCloud, SmartFit, YouTube, etc.
- **Asistente de Cancelación Rápida**: Enlaces directos a los portales oficiales de baja y guías paso a paso para evitar cobros sorpresa.
- **Analíticas de Ahorro con IA**: Detección de suscripciones redundantes y cálculo del costo promedio por día.

---

### 🏛️ Aislamiento Total de Datos & Persistencia (Zustand)
- **Tres Stores Totalmente Aislados**:
  - `useHubStore`: `hubos_main_v1` (Navegación, configuración general, API Key y perfil).
  - `useRecompStore`: `hubos_recomp_v1` (Comidas, macros, agua, rutinas y medidas físicas).
  - `useSubsStore`: `hubos_subs_v1` (Suscripciones, fechas de cobro, presupuesto y pagos).
- **Cero interferencia o sobrescritura de datos entre módulos**.
- **Sistema de Copias de Seguridad**: Exportación e importación en un único archivo JSON consolidado.

---

### ⚙️ CI/CD & Despliegue Automático
- **GitHub Actions Workflow (`.github/workflows/build-ios.yml`)**: Compilación desatendida del paquete `HUBos.ipa` en macOS runners y publicación automática en GitHub Releases.
