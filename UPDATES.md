# HUBos — Changelog & Updates Log

Este documento lleva el registro cronológico completo de todas las versiones, mejoras de arquitectura, módulos integrados y optimizaciones implementadas en la Super-App **HUBos**.

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
