# HUBos — Changelog & Updates Log

Este documento lleva el registro cronológico completo de todas las versiones, mejoras de arquitectura, módulos integrados y optimizaciones implementadas en la Super-App **HUBos**.

## 🚀 [v2.2.0] - 2026-09-17 (Aesthetix v2.2: Corrección del Freeze en iOS, Protocolo Oficial PPL x UL con GIFs, Sistema Oficial de 25 Rangos Symmetry con Insignias, Volumen Acumulado 1.1 M kg, Escaneo Físico IA e Importador OCR)

### 🌟 Nuevas Funcionalidades, Correcciones Críticas & Datos Symmetry
- **Corrección Crítica de Bloqueo / Freeze de Teclado en iOS (`CustomRoutineModal.tsx`)**:
  - Resuelto el bloqueo total de WebKit en iOS donde al pulsar "Añadir Ejercicio desde Catálogo" la app dejaba de responder a pulsaciones o escritura.
  - Eliminado el renderizado de modales anidados (`fixed inset-0 backdrop-blur`) superpuestos con `autoFocus`.
  - Reemplazado por una arquitectura de navegación interna fluida de dos vistas (`view: 'editor' | 'catalog'`) dentro del mismo contenedor con una sola capa de fondo.
  - Añadidas miniaturas visuales de los 1.324 ejercicios en el buscador de catálogo con botón de adición rápida `+` y selector por grupo muscular.
- **Protocolo Personalizado PPL x UL Configurado por Defecto (`useAesthetixStore.ts`)**:
  - Eliminada la rutina genérica de prueba (`routine_starter_5day`) y activada la rutina oficial de 5 días de Samuel como protocolo principal (`routine_ppl_x_up`):
    - **Lunes - PUSH**: Press banca plano (3x8), Press militar mancuernas (3x8), Aperturas PeckDeck (3x8), Elevaciones laterales (4x8), Fondos en máquina (2x8), Extensión de tríceps barra V (3x10).
    - **Martes - PULL**: Jalón unilateral polea (3x8), Remo en barra T (3x8), FacePulls polea (3x10), Curl Predicador Máquina (3x8), Curl martillo en polea (3x8), Pájaros en PeckDeck (3x8).
    - **Miércoles - Pierna y Abdomen**: Prensa 45° (3x8), Curl femoral sentado (3x8), Extensión de cuádriceps (3x8), Abductores máquina (3x8), Elevación de talones máquina (3x10), Crunch en polea (3x10), Elevaciones de piernas paralelas (3x10).
    - **Jueves - Upper**: Press banca inclinado con mancuernas (3x8), Press banca en multipower (3x8), Jalón al pecho prono (3x8), Remo con apoyo en el pecho máquina (3x8), Elevaciones laterales con mancuernas (4x8).
    - **Viernes - Lower**: Sentadilla libre (3x8), Peso muerto rumano con mancuernas (3x8), Aductores máquina (3x8), Curl femoral tumbado (3x8).
  - Los 27 ejercicios están mapeados con sus IDs oficiales para cargar GIFs animados y descripciones técnicas completas.
- **Visualización de GIFs y Miniaturas en la Pestaña de Rutinas (`RoutinesTab.tsx`)**:
  - En la sección "Días del protocolo", cada ejercicio cuenta ahora con su respectiva miniatura/GIF animado en un marco redondeado de cristal.
  - Al pulsar sobre cualquier tarjeta de ejercicio, se abre un visor interactivo a pantalla completa con el GIF animado en alta definición y los pasos de ejecución técnica en español.
- **Sistema Completo de 25 Rangos Symmetry con Insignias Oficiales (`src/lib/muscleRanks.ts`, `AnatomyRanksTab.tsx` & `public/ranks/`)**:
  - Integrada la jerarquía exacta de Symmetry compuesta por 9 ligas y 25 rangos:
    - *Hierro I, II, III* (Top 100% - 86%)
    - *Bronce I, II, III* (Top 79% - 67%)
    - *Plata I, II, III* (Top 61% - 50%)
    - *Oro I, II, III* (Top 45% - 35%)
    - *Rubí I, II, III* (Top 31% - 23%)
    - *Esmeralda I, II, III* (Top 20% - 14%)
    - *Diamante I, II, III* (Top 11% - 7%)
    - *Campeón I, II, III* (Top 5% - 3%)
    - *Simétrico* (Top 1% supremo)
  - Extraídas las 25 insignias con transparencia alfa en `public/ranks/` (.png y .webp).
  - Configurados los rangos basales reales de Samuel procedentes de Symmetry:
    - Rango Global: **Rubí II** (Top 27% más fuerte)
    - Pecho: **Esmeralda II** (Top 17%)
    - Espalda: **Rubí II** (Top 27%)
    - Hombros: **Rubí I** (Top 31%)
    - Brazos: **Esmeralda II** (Tríceps Diamante II, Antebrazos Esmeralda II, Bíceps Rubí III)
    - Piernas: **Rubí II** (Aductores Diamante I, Abductores Esmeralda III, Cuádriceps Rubí II, Gemelos Oro II, Femoral Oro II)
    - Abdominales: **Oro II** (Top 40%)
  - **Modal de Rangos Globales**: Vista detallada con las 25 insignias y percentiles, destacando el rango actual del usuario.
- **Registro de Volumen Acumulado & Métricas Históricas (`ProfileHistoryTab.tsx` & `useAesthetixStore.ts`)**:
  - Nueva tarjeta Hero Bento en el perfil con el total histórico de volumen levantado (**1,1 M kg / 1.100.000 kg** acumulados en el año con +1,1 M% de incremento), 112 entrenamientos realizados, 204 récords personales y racha de 7 días de fuego.
  - Sembrados los PRs de las capturas de Symmetry (Press Inclinado 45kgx11, Giro Ruso 11kgx25, Crunch 0kgx10, Elevaciones Laterales 14kgx10, Press Hombro Sentado 30kgx9, Jalón Agarre Cerrado 65kgx12, Fondos Tríceps 100kgx12, Curl EZ 30kgx10, Prensa 240kgx10).
- **Escaneo Corporal con Gemini Vision (`BodyScanModal.tsx`)**:
  - Diagnóstico físico inteligente: el usuario sube o toma una foto de su físico y Gemini Vision calcula el *Symmetry Score* (0 a 100), grasa corporal estimada %, ratio V-Taper, grupos dominantes vs rezagados y recomendaciones de entrenamiento.
- **Importador Inteligente de Capturas Symmetry (`SymmetryImportModal.tsx`)**:
  - Permite cargar cualquier captura de pantalla de entrenos o PRs de Symmetry; Gemini Vision transcribe automáticamente los ejercicios, series, repeticiones y kilajes, sumándolos al historial y recalculando el volumen.
- **Limpieza de Recursos**:
  - Eliminado el directorio temporal de capturas (`progreso temp/`) para optimizar el espacio de la aplicación y mantener el paquete IPA ligero.

### 📁 Archivos Modificados / Creados
- `[CREADO]` `public/ranks/*` - 25 insignias oficiales de Symmetry con fondo transparente.
- `[CREADO]` `src/components/aesthetix/BodyScanModal.tsx` - Escáner físico de simetría con Gemini Vision.
- `[CREADO]` `src/components/aesthetix/SymmetryImportModal.tsx` - Importador inteligente de capturas Symmetry.
- `[MODIFICADO]` `src/components/aesthetix/CustomRoutineModal.tsx` - Eliminación de modales anidados y fix al teclado en iOS.
- `[MODIFICADO]` `src/components/aesthetix/RoutinesTab.tsx` - Miniaturas visuales y visor interactivo de GIFs por ejercicio.
- `[MODIFICADO]` `src/components/aesthetix/AnatomyRanksTab.tsx` - Visualización de insignias Symmetry y modal de 25 rangos globales.
- `[MODIFICADO]` `src/components/aesthetix/ProfileHistoryTab.tsx` - Bento de volumen acumulado (175k kg) y accesos a escaneo/importación.
- `[MODIFICADO]` `src/lib/muscleRanks.ts` - Escala oficial de 25 rangos Symmetry, insignias y basales de Samuel.
- `[MODIFICADO]` `src/stores/useAesthetixStore.ts` - Definición de PPL x UL, purga de rutina antigua, volumen acumulado y PRs.
- `[MODIFICADO]` `src/types/workout.ts` - Tipado para 25 rangos e insignias.
- `[MODIFICADO]` `.github/workflows/build-ios.yml` - Bump a v2.2.0 para compilación del IPA en GitHub Actions.

## 🚀 [v2.1.0] - 2026-09-17 (Aesthetix v2.1: Creador de Rutinas Personalizadas por Días, Selector Pre-Gym & Cancelación de Sesión, Dropdowns de Filtro Rápido, Heatmap Anatómico sin Recortes, Rangos Progresivos de Alta Exigencia e Historial con Análisis IA)

### 🌟 Nuevas Funcionalidades & Perfeccionamiento de Aesthetix
- **Control de Inicio & Cancelación en Gym en Vivo (`StartWorkoutModal.tsx` & `LiveWorkoutFullscreen.tsx`)**:
  - Eliminado el auto-arranque accidental al pulsar "Gym en Vivo / Entrenar" desde el dock o encabezado.
  - **Selector Pre-Entreno Inteligente (`StartWorkoutModal.tsx`)**: Modal de cristal translúcido que permite seleccionar qué rutina entrenar (rutina activa, rutinas secundarias o "Entrenamiento Libre"), qué día de la semana realizar, con previsualización de ejercicios antes de confirmar.
  - Botón explícito y destacado **`⚡ Iniciar Entrenamiento`** y opción de cancelar/cerrar sin iniciar ninguna sesión.
  - **Botón `✕ Cancelar Sesión` en Modo Fullscreen**: Permite cancelar el entrenamiento en vivo en cualquier momento con alerta de confirmación nativa para no perder datos por error.
  - **Eliminación Individual de Ejercicios en Sesión Activa**: Botón `✕` en el visor de ejercicios para descartar un ejercicio particular sin interrumpir el resto de la sesión.
- **Diseñador de Rutinas Personalizadas por Días (`CustomRoutineModal.tsx`)**:
  - Creación manual completa de programas estructurados por días (ejemplo: **PPL x UL** - Push, Pull, Legs, Upper, Lower).
  - Selector de plantillas de 1-tap: *PPL x UL (5 días)*, *Push-Pull-Legs (3 días)* o *Desde Cero*.
  - Configuración detallada día a día: nombre del día, foco muscular, adición de ejercicios del catálogo de 1.324 mediante un buscador rápido integrado, definición de series objetivo, repeticiones personalizadas (ej. `8-10`, `12-15`) y tiempos de descanso (150s = 2:30m).
  - Guardado y activación inmediata en el almacén de rutinas del usuario.
- **Selector Rápido Multi-Rutina (`RoutinesTab.tsx`)**:
  - Barra de conmutación de rutinas en la cabecera para alternar entre programas creados en 0ms y opción de eliminar rutinas obsoletas.
- **Rediseño de Filtros por Dropdowns Flotantes (`ExercisesExplorerTab.tsx`)**:
  - Reemplazadas las barras de desplazamiento horizontal por dos elegantes botones dropdown gemelos de cristal:
    - **`💪 Grupo Muscular`**: Despliega un menú emergente con todos los grupos anatómicos traducidos al español y sus contadores en tiempo real.
    - **`🏋️ Equipamiento`**: Despliega todas las variantes de equipo (mancuernas, barra, cables, peso corporal, máquinas).
  - Selección instantánea en 1 tap con cierre automático y botón de limpieza de filtros.
- **Corrección Visual del Heatmap Anatómico 2D (`AnatomyRanksTab.tsx`)**:
  - Corregido el recorte de cabeza y pies en las siluetas frontal y posterior de `react-body-highlighter`.
  - Contenedores de pedestal calibrados a la relación de aspecto 1:2 exacta (`viewBox="0 0 100 200"`), con altura de 260px y propiedad `overflow: visible` para visualización impecable sin desbordamientos en ningún modelo de iPhone.
- **Ajuste y Exigencia Realista en el Sistema de Rangos Musculares (`src/lib/muscleRanks.ts`)**:
  - Corregido el cálculo que otorgaba "Diamante" de forma prematura con un único ejercicio básico.
  - Implementada una matriz de umbrales no lineales de fuerza relativa (ratio 1RM / Peso Corporal) por cada músculo:
    - *Hierro* (< 0.45x), *Cobre* (0.45x - 0.65x), *Plata* (0.65x - 0.90x), *Oro* (0.90x - 1.10x), *Platino* (1.10x - 1.35x), *Diamante* (1.35x - 1.55x, requiriendo >100kg en press de banca para 75kg de peso corporal), hasta *Simétrico* (cúspide > 2.15x).
- **Ventana de Detalle del Historial con Gemini IA & Eliminación (`SessionDetailModal.tsx` & `ProfileHistoryTab.tsx`)**:
  - Cada sesión completada en el perfil ahora es táctil y abre una ficha de inspección técnica completa.
  - Métricas bento: Duración, volumen levantado, total de series y PRs batidos.
  - Desglose serie a serie de cada ejercicio con peso levantado, repeticiones y 1RM estimado.
  - **Análisis Deportivo con Gemini IA (`callGemini`)**: Evaluación con un toque que diagnostica el estímulo hipertrófico, sugiere sobrecarga progresiva exacta para la próxima sesión y entrega el veredicto del entrenador.
  - **Botón `🗑️ Eliminar Sesión`**: Permite borrar registros erróneos del historial con confirmación de seguridad.

### 📁 Archivos Modificados / Creados
- `[CREADO]` `src/components/aesthetix/StartWorkoutModal.tsx` - Modal pre-inicio de sesión con selección de rutina/día.
- `[CREADO]` `src/components/aesthetix/CustomRoutineModal.tsx` - Constructor de rutinas personalizadas por días con selector de ejercicios.
- `[CREADO]` `src/components/aesthetix/SessionDetailModal.tsx` - Modal de detalle histórico con análisis IA y eliminación.
- `[MODIFICADO]` `src/components/aesthetix/AesthetixView.tsx` - Integración de StartWorkoutModal y flujo de inicio controlado.
- `[MODIFICADO]` `src/components/aesthetix/LiveWorkoutFullscreen.tsx` - Botón de cancelar sesión y borrado de ejercicios en vivo.
- `[MODIFICADO]` `src/components/aesthetix/RoutinesTab.tsx` - Switcher de rutinas múltiples y accesos al diseñador manual.
- `[MODIFICADO]` `src/components/aesthetix/ExercisesExplorerTab.tsx` - Dropdowns gemelos de cristal para filtros rápidos.
- `[MODIFICADO]` `src/components/aesthetix/AnatomyRanksTab.tsx` - Dimensionamiento 1:2 sin recortes en cabeza/pies.
- `[MODIFICADO]` `src/components/aesthetix/ProfileHistoryTab.tsx` - Tarjetas interactivas conectadas a SessionDetailModal.
- `[MODIFICADO]` `src/lib/muscleRanks.ts` - Estándares de fuerza hipertrófica no lineales y exigentes.
- `[MODIFICADO]` `src/stores/useAesthetixStore.ts` - Métodos `removeExerciseFromActiveSession` y `deleteHistorySession`.
- `[MODIFICADO]` `.github/workflows/build-ios.yml` - Bump a v2.1.0 para compilación del IPA en GitHub Actions.

## 🚀 [v2.0.0] - 2026-09-17 (Lanzamiento Mayor de la Super-App de Entrenamiento Aesthetix: Catálogo de 1.324 Ejercicios con GIF, Generador con Gemini IA, Modo Gym Fullscreen con Descanso de 2:30 & Sistema de Rangos de Hierro a Simétrico)

### 🌟 Nuevas Funcionalidades & Arquitectura de la Nueva Sub-App
- **Lanzamiento de Aesthetix (`src/components/aesthetix/*`)**:
  - Cuarta aplicación oficial integrada dentro del ecosistema modular de **HUBos**, diseñada bajo el sistema de diseño **Glassmorphism** y optimizada para pantallas OLED de iPhone.
  - **Base de Datos Local de 1.324 Ejercicios (`src/data/exercises.json` & `src/lib/exercisesDb.ts`)**:
    - Extracción e integración total del repositorio de referencia `hasaneyldrm/exercises-dataset`.
    - Eliminación de idiomas innecesarios y optimización a un JSON de solo 2.9 MB con instrucciones y pasos paso a paso en **español (`es`)**, grupos musculares anatómicos, equipamiento y objetivos.
    - Conexión a CDN de alta velocidad para miniaturas de 180x180 y animaciones GIF completas en bucle con caché automático en IndexedDB para funcionamiento 100% offline en el gimnasio.
    - Filtros dinámicos por grupo muscular (Pectorales, Espalda, Hombros, Brazos, Piernas, Pantorrillas, Abdomen, etc.) y por equipamiento (Barra, Mancuerna, Polea, Peso Corporal, Máquinas).
  - **Generador Inteligente de Rutinas con Gemini IA (`AiRoutineBuilderModal.tsx` & `workoutAiGenerator.ts`)**:
    - Cuestionario guiado interactivo de 5 pasos: Objetivo (Hipertrofia, Fuerza, Estética clásica, Definición), frecuencia semanal (3 a 6 días), nivel, equipamiento y músculos de enfoque prioritario.
    - Generación estructurada de rutinas mediante la API de Gemini (`generateContentWithFallback`), vinculando automáticamente los IDs de ejercicios existentes en el catálogo.
    - Guardado y activación inmediata en el almacén de rutinas del usuario.
  - **Modo Gimnasio Fullscreen en Vivo (`LiveWorkoutFullscreen.tsx`)**:
    - Experiencia inmersiva a pantalla completa diseñada para usarse directamente en la sala de pesas.
    - **Visualizador de Técnica**: Animación GIF del ejercicio actual visible en todo momento para verificar postura y rango de movimiento.
    - Registro táctil de series: Peso en kg, repeticiones con botones rápidos `+` / `-`, y casilla de verificación de serie completada.
    - **Calculadora de Discos Olímpica (`plateCalculator.ts`)**: Desglose instantáneo de discos por lado para barra de 20 kg (25kg, 20kg, 15kg, 10kg, 5kg, 2.5kg, 1.25kg).
    - **Temporizador de Descanso de 2:30 (150 segundos)**: Brota automáticamente al marcar una serie hecha, con cuenta regresiva circular, botones rápidos `+10s` / `-10s` y alarma sonora con acorde aterciopelado mediante Web Audio API.
    - Resumen post-entreno con celebración de Récords Personales (PRs), volumen total levantado (kg) y tiempo de sesión.
  - **Sistema de Rangos Musculares (Hierro a Simétrico - `muscleRanks.ts` & `AnatomyRanksTab.tsx`)**:
    - Escala de 10 rangos: **Hierro**, **Cobre**, **Plata**, **Oro**, **Platino**, **Diamante**, **Zafiro**, **Legendario**, **Estético** y **Simétrico** (cúspide).
    - Algoritmo de 1RM estimado (fórmula Epley) comparado contra estándares de fuerza relativa respecto al peso corporal del atleta.
    - **Modelo Anatómico 2D Interactivo**: Visualización frontal y posterior con `react-body-highlighter` donde cada grupo muscular se ilumina con el color y halo luminiscente de su rango correspondiente.
    - Calculadora rápida de 1RM integrada.
  - **Perfil del Atleta & Medidas Corporales (`ProfileHistoryTab.tsx`)**:
    - Subida de foto de perfil almacenada en alta fidelidad en **IndexedDB** (`imageStorage.ts`) para mantener el estado de Zustand ultraligero.
    - Registro antropométrico: Peso, bíceps, pecho, cintura, muslos y gemelos con histórico.
    - Historial detallado de todas las sesiones completadas y marcas personales (PRs).
  - **Sistema de Rachas Inteligente con Tolerancia de Descansos**:
    - Racha flexible adaptada al objetivo semanal del usuario (ej. 5 días de entrenamiento con 2 días de descanso permitidos sin perder la racha).

### 🛠️ Mejoras y Cambios de Arquitectura
- **Zustand Store Desacoplado con Persistencia Nativa (`useAesthetixStore.ts`)**:
  - Almacén en `hubos_aesthetix_v1` a través de `nativeStorage` hacia `NSUserDefaults` de iOS.
  - Rutina starter preconfigurada de 5 días de hipertrofia (*Push / Pull / Legs / Torso / Pierna*).
- **Vuelco Inmediato de Emergencia en Ciclo de Vida iOS (`src/app/page.tsx`)**:
  - Inclusión de `useAesthetixStore` en el `flushAll` síncrono al minimizar o cerrar la app.
- **Integración con HUBos Launcher (`HubDashboard.tsx`)**:
  - Nueva Bento Card de **Aesthetix** con emoji temático `⚡`, telemetría en tiempo real (racha, rango físico actual y estado de sesión en curso) y transición en 0ms.
- **Respaldo y Reset Integral (`HubSettingsSheet.tsx` & `nativeStorage.ts`)**:
  - Exportación de copias de seguridad JSON y reinicio de fábrica incluyendo los datos de Aesthetix.
- **Automatización CI/CD de GitHub Actions (`.github/workflows/build-ios.yml`)**:
  - Actualización del tag y nombre de Release a **v2.0.0** para compilar y desplegar automáticamente el nuevo archivo `HUBos.ipa`.

### 📁 Archivos Modificados / Creados
- `[CREADO]` `scripts/prepare-exercises.mjs` - Script de optimización de dataset.
- `[CREADO]` `src/data/exercises.json` - Base de datos de 1.324 ejercicios en español.
- `[CREADO]` `src/types/workout.ts` - Tipos y modelos de datos de Aesthetix.
- `[CREADO]` `src/lib/exercisesDb.ts` - Buscador e indexador de ejercicios y medios.
- `[CREADO]` `src/lib/muscleRanks.ts` - Motor de los 10 rangos y mapeo anatómico.
- `[CREADO]` `src/lib/plateCalculator.ts` - Calculadora de discos para barra olímpica.
- `[CREADO]` `src/lib/workoutAiGenerator.ts` - Prompt y generador de rutinas con Gemini IA.
- `[CREADO]` `src/stores/useAesthetixStore.ts` - Store Zustand con persistencia nativa.
- `[CREADO]` `src/components/aesthetix/AesthetixView.tsx` - Vista maestra de la app.
- `[CREADO]` `src/components/aesthetix/AesthetixHeader.tsx` - Cabecera con retorno al HUB y racha.
- `[CREADO]` `src/components/aesthetix/RoutinesTab.tsx` - Gestor de rutinas y días.
- `[CREADO]` `src/components/aesthetix/ExercisesExplorerTab.tsx` - Explorador de 1.324 ejercicios con filtros.
- `[CREADO]` `src/components/aesthetix/ExerciseDetailModal.tsx` - Detalle con GIF animado y pasos en español.
- `[CREADO]` `src/components/aesthetix/LiveWorkoutFullscreen.tsx` - Modo gym fullscreen con descanso 2:30.
- `[CREADO]` `src/components/aesthetix/AnatomyRanksTab.tsx` - Mapa 2D y sistema de rangos.
- `[CREADO]` `src/components/aesthetix/ProfileHistoryTab.tsx` - Perfil, medidas, fotos e historial.
- `[CREADO]` `src/components/aesthetix/AiRoutineBuilderModal.tsx` - Cuestionario guiado con Gemini IA.
- `[MODIFICADO]` `src/lib/nativeStorage.ts` - Importación dinámica resiliente de Preferences y backup.
- `[MODIFICADO]` `src/stores/useHubStore.ts` - Adición de 'aesthetix' a AppModule.
- `[MODIFICADO]` `src/app/page.tsx` - Enrutador y flush de ciclo de vida nativo para Aesthetix.
- `[MODIFICADO]` `src/components/hub/HubDashboard.tsx` - Bento Card y telemetría de Aesthetix.
- `[MODIFICADO]` `src/components/hub/HubSettingsSheet.tsx` - Versión v2.0.0 y soporte en reset.
- `[MODIFICADO]` `.github/workflows/build-ios.yml` - Release de GitHub Actions actualizado a v2.0.0.
- `[MODIFICADO]` `UPDATES.md` - Registro oficial de la versión v2.0.0.

---

## 🚀 [v1.9.2] - 2026-09-16 (Persistencia Nativa con @capacitor/preferences en iOS UserDefaults, Cero Pérdida de Datos en SideStore y Vuelco Inmediato al Minimizar/Cerrar)

### 🌟 Nuevas Funcionalidades & Arquitectura de Datos
- **Integración de Motor de Persistencia Nativa iOS (`@capacitor/preferences` & `nativeStorage.ts`)**:
  - Toda la persistencia de HUBos deja de depender de la volátil caché web de `localStorage` y se traslada a **`NSUserDefaults` nativo de Apple** a través del plugin oficial `@capacitor/preferences`.
  - **Inmunidad a SideStore / AltStore**: El archivo `.plist` de preferencias de iOS está protegido a nivel de sistema operativo y **jamás se borra al inyectar o actualizar el archivo `.ipa`**.
  - **Escritura Nativa Inmediata**: Escrituras a nivel de Swift/Objective-C en milisegundos, eliminando la latencia de guardado.
  - **Caché en Memoria y Espejo Local**: Lectura a 0ms mediante caché en memoria y respaldo dual síncrono.
  - **Migración Transparente**: Al iniciar, el sistema lee cualquier dato preexistente de `localStorage` y lo traslada automáticamente a `Preferences` sin pérdida alguna.

- **Alivio de Peso de los Stores y Desacoplamiento de Imágenes Pesadas**:
  - Las fotos de progreso físico completas (1200px) ahora se guardan directamente en **IndexedDB** (`src/lib/imageStorage.ts`), cuya cuota en iOS es de varios Gigabytes.
  - En el store de Zustand solo se conserva una micro-miniatura ultraligera (~15KB) o el identificador.
  - Optimización en `MealCaptureModal.tsx`: Generación de miniaturas de 160px a calidad 0.5 (~4KB), mientras la imagen completa en alta fidelidad se conserva en IndexedDB.
  - Reducción del tamaño de los stores de ~5MB a escasos ~50-100KB, previniendo para siempre el error `QuotaExceededError`.

- **Vuelco Inmediato de Emergencia en Ciclo de Vida Nativo (`src/app/page.tsx`)**:
  - Integración con `@capacitor/app` (`appStateChange`), `visibilitychange` y `beforeunload`.
  - En el milisegundo en que el usuario empieza a deslizar la barra de inicio de iOS para cerrar o cambiar de app, todos los stores (`useRecompStore`, `useHubStore`, `useSubsStore`, `useScheduleStore`) se vuelcan de forma síncrona y forzada a `UserDefaults`.

### ⚡ Optimizaciones y Correcciones de Bugs
- **Solución a las 3 Causas Raíz de Pérdida de Datos**:
  1. Eliminación del desbordamiento de cuota de 5MB de WebKit.
  2. Eliminación de la pérdida por cierre rápido de la app antes de que WebKit escriba al disco.
  3. Eliminación del reseteo de datos al actualizar el `.ipa` en SideStore.
- **Limpieza de SSR en Next.js**:
  - Manejo seguro de entornos sin `window` durante el `next build`, eliminando las advertencias de `ReferenceError: localStorage is not defined`.
- **Actualización de Herramienta de Respaldo (`HubSettingsSheet.tsx`)**:
  - La exportación de copias de seguridad JSON ahora incluye todas las sub-aplicaciones (HUB, RecompAI, Suscripciones y Horarios) extraídas directamente del motor nativo.

### 📁 Archivos Modificados / Creados
- `[CREADO]` `src/lib/nativeStorage.ts` - Adaptador universal de almacenamiento nativo con `@capacitor/preferences`.
- `[MODIFICADO]` `src/lib/imageStorage.ts` - Almacenamiento de fotos de progreso en IndexedDB.
- `[MODIFICADO]` `src/stores/useRecompStore.ts` - Migración a `nativeStorage` y `partialize`.
- `[MODIFICADO]` `src/stores/useHubStore.ts` - Migración a `nativeStorage` y `partialize`.
- `[MODIFICADO]` `src/stores/useSubsStore.ts` - Migración a `nativeStorage` y `partialize`.
- `[MODIFICADO]` `src/stores/useScheduleStore.ts` - Migración a `nativeStorage` y `partialize`.
- `[MODIFICADO]` `src/components/recomp/MealCaptureModal.tsx` - Optimización de peso de miniatura.
- `[MODIFICADO]` `src/components/recomp/ProfilePage.tsx` - Guardado de fotos HD en IndexedDB.
- `[MODIFICADO]` `src/components/hub/HubSettingsSheet.tsx` - Respaldo y reseteo nativo integral.
- `[MODIFICADO]` `src/app/page.tsx` - Flush de ciclo de vida con `@capacitor/app`.
- `[MODIFICADO]` `package.json` - Inclusión de `@capacitor/preferences@6.0.4`.
- `[MODIFICADO]` `Updates.md` - Registro oficial de la versión v1.9.2.

---

## 🚀 [v1.9.1] - 2026-09-15 (Reorganización Minimalista de Comidas, Confinamiento de Píldoras y Rediseño Glassmorphism del Modal de Fechas)

### 🌟 Nuevas Funcionalidades & Experiencia de Usuario
- **Rediseño Glassmorphism del Modal de Selección de Fechas (`DateSelectionModal.tsx`)**:
  - Transformación integral de la lámina inferior con la skill `glassmorphism`:
    - Contenedor con `glass-surface-elevated rounded-t-[36px] backdrop-blur-3xl border-t border-white/20 shadow-2xl`.
    - Tirador de hoja translúcido superior (`w-10 h-1.5 rounded-full bg-white/20`).
    - Cabecera en cápsula de cristal con botón de cierre circular `✕` con micro-animaciones en hover y active.
    - Fichas interactivas para **Hoy** y **Ayer** con `glass-pill` e indicador activo con halo esmeralda (`glass-pill-active border-[#34C759]/40 bg-[#34C759]/15 shadow-[0_0_20px_rgba(52,199,89,0.25)]`).
    - Selector personalizado con píldora interactiva de fecha nativa y botón de retorno a hoy.
- **Reorganización Minimalista de la Sección 2 (Comidas & Dieta - `MealsSection.tsx`)**:
  - **Eliminación de Elementos Redundantes**: Se eliminó la tarjeta duplicada de fecha y las 4 cajas grandes vacías de desayuno, almuerzo, cena y snacks que saturaban la pantalla.
  - **Hero Bento Card Unificada**:
    - Telemetría en tiempo real: Calorías consumidas vs meta con barra de progreso luminosa bioluminiscente.
    - Micro-píldoras de macronutrientes: Proteína, Carbos y Grasas en cápsulas translúcidas.
    - **Acciones Rápidas Integradas**: Botón primario `✨ Escanear con IA` y secundario `+ Manual` alojados dentro de la tarjeta, eliminando por completo los botones flotantes que colisionaban con el dock.
  - **Selector Segmentado por Tiempos de Comida**:
    - Píldoras de cristal para alternar instantáneamente entre `Todos`, `Desayuno`, `Almuerzo`, `Cena` y `Snacks`.
    - Estado vacío elegante y limpio cuando no hay registros para el filtro seleccionado.
  - **Galería de Fotos Reales**:
    - Visualización compacta de fotos capturadas al pie de la vista con marcos esmerilados y badges de calorías.

### ⚡ Optimizaciones y Correcciones de Bugs
- **Confinamiento Estricto de Píldoras de Comidas Frecuentes**:
  - Aplicación de `max-w-[125px] truncate` y `inline-flex items-center` en `fav.name` para evitar que títulos extensos desborden la píldora o empujen los botones de acción fuera de la pantalla.
- **Ajuste y Confinamiento del Dock Inferior (`RecompView.tsx`)**:
  - Eliminación de `scale-105` en los botones activos de la barra de navegación para que la píldora activa permanezca 100% contenida y al ras dentro del dock sin sobresalir.
- **Corrección de Espaciado Inferior (`pb-36`)**:
  - Aumento del padding inferior a `pb-36` en `RecompView.tsx`, `MealsSection.tsx`, `ProfilePage.tsx` y `TrainingSection.tsx` para garantizar que el dock flotante nunca tape contenidos ni botones al deslizar hacia el final.
- **Alineación Vertical Perfecta de Píldoras de Cabecera (`RecompHeader.tsx`)**:
  - Unificación de altura (`h-8`) y alineación en línea en el selector de fecha, las rachas y el botón de retorno al HUB.

### 📁 Archivos Modificados / Creados
- `[MODIFICADO]` `src/components/recomp/DateSelectionModal.tsx` - Rediseño con Glassmorphism puro.
- `[MODIFICADO]` `src/components/recomp/MealsSection.tsx` - Reorganización minimalista y confinamiento de píldoras.
- `[MODIFICADO]` `src/components/recomp/RecompView.tsx` - Ajuste del dock inferior y padding pb-36.
- `[MODIFICADO]` `src/components/recomp/RecompHeader.tsx` - Alineación h-8 en píldoras de cabecera.
- `[MODIFICADO]` `src/components/recomp/ProfilePage.tsx` - Padding pb-36 para despeje del dock.
- `[MODIFICADO]` `src/components/recomp/TrainingSection.tsx` - Padding pb-36 para despeje del dock.
- `[MODIFICADO]` `Updates.md` - Registro oficial de la versión v1.9.1.

---

## 🚀 [v1.9.0] - 2026-09-15 (Corrección Crítica de Loop de Logros, Restauración de Dock Inferior, Nueva Rutina Semanal y Rediseño Integral Glassmorphism de RecompAI)

### 🌟 Nuevas Funcionalidades & Experiencia de Usuario
- **Rediseño Visual Integral con Glassmorphism en Toda la Suite RecompAI**:
  - **Fondo Atmosférico Global (`RecompView.tsx`)**: Orbes radiales desenfocados en esmeralda, violeta y ámbar en capas `pointer-events-none` fijas que refractan brillo a través de todas las superficies.
  - **Dock Flotante de Navegación de Cristal Líquido**: Barra inferior suspendida (`glass-surface-elevated rounded-full backdrop-blur-3xl border border-white/20`) con iconos esmerilados y píldora activa con halo luminiscente esmeralda.
  - **Cabecera de Telemetría Rediseñada (`RecompHeader.tsx`)**: Cápsula de fecha y selector diario con estética de vidrio esmerilado, racha de fuego en vidrio líquido y botón de regreso al HUB.
  - **Dashboard Diario (Sección 1)**:
    - `CalorieRing.tsx`: Bento card de cristal esmerilado (`glass-surface rounded-[32px] p-6`) con selector de unidad de energía segmentado.
    - `MacroBars.tsx`: Bento card con pistas translúcidas y barras de gradiente bioluminiscente para Proteína, Carbohidratos y Grasas.
    - `GlycogenPumpMeter.tsx`: Medidor de bombeo muscular y glucógeno en cápsula esmerilada con halo de brillo reactivo.
    - `QuickStatsRow.tsx`: Tres pods flotantes de cristal para la rutina del día, racha de gimnasio y telemetría calórica.
    - `WaterTracker.tsx`: Bento card con 12 burbujas de vidrio esmerilado interactivas y botones táctiles de cristal.
    - `SupplementTracker.tsx`: Fichas translúcidas con casillas interactivas en vidrio líquido.
  - **Comidas & Nutrición (Sección 2)**:
    - `MealsSection.tsx` & `MealLog.tsx`: Filtros por categoría en píldoras de cristal esmerilado, tarjetas de comidas con badges de macros y galería de fotos con marcos translúcidos.
    - `MealCaptureModal.tsx` & `MealDetailModal.tsx`: Hojas modales elevadas de cristal con fondo ultra-desenfocado, visualización de fotos en alta resolución desde IndexedDB y micro-píldoras de nutrientes.
  - **Entrenamiento (Sección 3)**:
    - `TrainingSection.tsx`: Bento card con la nueva rutina de entrenamiento diario, tarjeta Symmetry AI en cristal violeta y registro de sesiones en cápsulas translúcidas.
    - `MuscleHeatmap.tsx`: Contenedor de cristal esmerilado con mapa anatómico y píldoras luminosas de intensidad muscular.
  - **Perfil & Metas (Sección 4)**:
    - `ProfilePage.tsx`: Tarjetas bento de cristal esmerilado para objetivos de recomposición corporal, galería de progreso fotográfico y configuración de credenciales de IA.

- **Actualización de la Rutina de Entrenamiento Semanal (`trainingSchedule.ts`)**:
  - Adaptación exacta a la nueva distribución del usuario:
    - **Lunes**: Jalón (Pull) — Espalda, Deltoides Posterior, Bíceps.
    - **Martes**: Empuje (Push) — Pecho, Deltoides Anterior/Lateral, Tríceps.
    - **Miércoles**: Pierna — Cuádriceps, Isquiotibiales, Glúteos, Pantorrillas.
    - **Jueves**: Torso Completo — Espalda, Pecho, Hombros, Brazos.
    - **Viernes**: Pierna — Enfoque Femoral, Glúteo, Gemelos, Aductores.
    - **Sábado & Domingo**: Descanso Activo — Caminata 8-10k pasos, movilidad, recuperación.

### ⚡ Optimizaciones y Correcciones de Bugs
- **Corrección Definitiva del Bucle Infinito de Notificaciones de Logros**:
  - Se subsanó la falta de persistencia de `unlockedAt` para logros no presentes en versiones anteriores de `localStorage` (`useRecompStore.ts`).
  - Ahora `checkAchievements()` sincroniza contra el catálogo canónico completo (`ALL_ACHIEVEMENT_DEFINITIONS`), marcando y persistiendo `unlockedAt` de forma inmutable para que nunca se vuelvan a notificar en bucle.
  - `evaluateAchievements()` descarta estrictamente cualquier logro que ya posea `unlockedAt`.
- **Desbloqueo y Visualización del Catálogo Completo de Logros (`AchievementsGrid.tsx`)**:
  - Despliegue de los 17 logros canónicos en fichas de cristal esmerilado translúcidas con badges de completado y modal informativo.
- **Corrección de Desaparición del Dock Inferior al Registrar Comidas**:
  - Corrección del ciclo de vida y limpieza de `isModalOpen` en `MealCaptureModal.tsx` para garantizar que la barra inferior (`RecompView.tsx`) permanezca siempre visible al cerrar o guardar la comida.
- **Corrección de Firma de Argumentos en Análisis con Gemini**:
  - Arreglo en la llamada a `parseMealWithGemini` pasando `(geminiApiKey, { text, imageBase64 })`.

### 📁 Archivos Modificados / Creados
- `[MODIFICADO]` `src/stores/useRecompStore.ts` - Corrección de persistencia de logros y prevención de loops.
- `[MODIFICADO]` `src/lib/achievements.ts` - Catálogo canónico de 17 logros y evaluación idempotente.
- `[MODIFICADO]` `src/lib/trainingSchedule.ts` - Nueva distribución de rutina semanal del usuario.
- `[MODIFICADO]` `src/components/recomp/MealCaptureModal.tsx` - Corrección de ciclo de vida del dock y llamada a Gemini.
- `[MODIFICADO]` `src/components/recomp/RecompView.tsx` - Orbes ambientales y dock flotante en cristal esmerilado.
- `[MODIFICADO]` `src/components/recomp/RecompHeader.tsx` - Cabecera en cápsula de cristal con selector de fechas.
- `[MODIFICADO]` `src/components/recomp/CalorieRing.tsx` - Bento card de calorías con selector de unidades.
- `[MODIFICADO]` `src/components/recomp/MacroBars.tsx` - Bento card con pistas y barras de macronutrientes luminiscentes.
- `[MODIFICADO]` `src/components/recomp/GlycogenPumpMeter.tsx` - Medidor de bombeo muscular y glucógeno esmerilado.
- `[MODIFICADO]` `src/components/recomp/QuickStatsRow.tsx` - Pods flotantes de telemetría diaria.
- `[MODIFICADO]` `src/components/recomp/WaterTracker.tsx` - Bento card con burbujas de agua de vidrio esmerilado.
- `[MODIFICADO]` `src/components/recomp/SupplementTracker.tsx` - Tarjetas translúcidas con casillas interactivas.
- `[MODIFICADO]` `src/components/recomp/AchievementsGrid.tsx` - Grilla completa de 17 logros en fichas de cristal.
- `[MODIFICADO]` `src/components/recomp/MealsSection.tsx` - Sección de comidas con píldoras y galería de fotos.
- `[MODIFICADO]` `src/components/recomp/MealLog.tsx` - Registro de comidas en tarjetas esmeriladas.
- `[MODIFICADO]` `src/components/recomp/MealDetailModal.tsx` - Hoja modal elevada de fotos HD y desglose de macros.
- `[MODIFICADO]` `src/components/recomp/TrainingSection.tsx` - Sección de entrenamiento con nueva rutina y Symmetry AI.
- `[MODIFICADO]` `src/components/recomp/MuscleHeatmap.tsx` - Mapa muscular en contenedor de cristal esmerilado.
- `[MODIFICADO]` `src/components/recomp/ProfilePage.tsx` - Perfil de usuario con tarjetas bento de cristal.
- `[MODIFICADO]` `Updates.md` - Registro oficial de la versión v1.9.0.

---

## 🚀 [v1.8.0] - 2026-09-11 (Rediseño Total con Glassmorphism: HUB Principal, Píldoras Flotantes en Calendario & Minimalismo Absoluto en Horarios)

### 🌟 Nuevas Funcionalidades & Experiencia de Usuario
- **Instalación y Aplicación del Sistema de Diseño `glassmorphism`**:
  - Implementación de la skill oficial de Glassmorphism con estética *liquid glass*, capas translúcidas esmeriladas (`backdrop-blur-2xl bg-white/[0.04]`), bordes luminosos superiores (`border-t-white/20 border-white/10`) y orbes de luz ambiental multicromática de fondo.
  - Adición de tokens y clases de utilidad en `globals.css`: `.glass-surface`, `.glass-surface-elevated`, `.glass-pill`, `.glass-pill-active`, `.glass-floating-card` y sombras con halo de neón.

- **Rediseño Completo del HUB Principal (`HubDashboard.tsx`)**:
  - **Fondo Atmosférico Profundo**: Orbes radiales desenfocados (esmeralda, violeta y cian) que refractan luz realista a través de las superficies de cristal.
  - **Bento Card de Estado Global**: Superficie de cristal translúcido con indicador de pulso en vivo para el ecosistema conectado y dos mini cápsulas de vidrio para RecompAI (kcal y glucógeno) y Suscripciones (gasto mensual y servicios activos).
  - **Tarjetas Bento de Aplicaciones**: Tarjetas de cristal de lujo para Recomp AI, Suscripciones y Horarios & Rutinas con micro-píldoras de telemetría en tiempo real y botones con micro-animaciones en hover.
  - **Tarjeta Inferior de Ajustes & Gemini IA**: Cápsula de cristal minimalista para configuración del sistema.

- **Rediseño del Calendario con Píldoras Flotantes (`ScheduleGrid.tsx`)**:
  - **Eliminación del Cuadro Rígido Mediocre**: Transformación total a un lienzo con **píldoras flotantes tridimensionales** con esquinas redondeadas (`rounded-[22px]`), bordes luminosos tintados con el color de la materia, cuerpo translúcido y sombra con glow de neón.
  - **Selector de Modo de Vista con Píldora Segmentada**:
    - **Vista Día (Cronograma Flotante)**: Experiencia móvil ultra-limpia y minimalista que lista las clases del día seleccionado como cápsulas flotantes verticales con hora, duración, docente, aula y chip de color.
    - **Vista Semana (Matriz Panorámica Flotante)**: Cuadrícula panorámica con scroll suave donde las materias son cápsulas flotantes sobre guías translúcidas súper sutiles.
  - **Selector Superior de Días en Píldoras de Cristal**: Cápsulas flotantes con conteo de clases y badge luminoso del día actual.

- **Minimalismo y Eliminación de Saturación de Botones en Horarios (`ScheduleHeader.tsx`)**:
  - Unificación de la cabecera en una sola fila compacta:
    - Píldora de regreso `‹ HUB`.
    - Píldora de fecha actual `🗓️ EEE, d MMM`.
    - Botones compactos de cristal para `✨ IA` y `⚙️ Ajustes`.
  - **Selector de Perfiles en Cápsula Segmentada de Vidrio Líquido**: Eliminación del texto redundante "Perfil:" reemplazándolo por un selector segmentado fluido estilo Apple iOS (`glass-pill-active`).

- **Bento Cards Superiores de Horarios (`ScheduleHeroCards.tsx`)**:
  - Tarjetas flotantes de cristal esmerilado para "Siguiente Clase / En Curso" (con barra de progreso dinámica estilo Dynamic Island) y "Pendientes" (con badge numérico translúcido y prioridad).

- **Menú FAB Flotante (`ScheduleFabMenu.tsx`)**:
  - Botón flotante `+` con acabado en cristal esmerilado y popover en cápsulas de vidrio líquido con desenfoque de fondo.

### 📁 Archivos Modificados / Creados
- `[MODIFICADO]` `src/app/globals.css` - Utilidades y tokens de Glassmorphism.
- `[MODIFICADO]` `src/components/hub/HubDashboard.tsx` - Rediseño Bento Glassmorphism del HUB principal.
- `[MODIFICADO]` `src/components/schedule/ScheduleHeader.tsx` - Cabecera minimalista y selector de perfiles segmentado.
- `[MODIFICADO]` `src/components/schedule/ScheduleHeroCards.tsx` - Bento cards de siguiente clase y pendientes.
- `[MODIFICADO]` `src/components/schedule/ScheduleGrid.tsx` - Calendario de píldoras flotantes con vista dual Día/Semana.
- `[MODIFICADO]` `src/components/schedule/ScheduleFabMenu.tsx` - Botón de acción flotante y cápsulas de menú en cristal.
- `[MODIFICADO]` `src/components/schedule/ScheduleView.tsx` - Orbes ambientales y ensamble general de la vista.
- `[MODIFICADO]` `UPDATES.md` - Registro oficial de la versión v1.8.0.

---

## 🚀 [v1.7.0] - 2026-09-09 (Lanzamiento Mayor: Nueva App de Horarios, Clases de Conducción, Rutinas Semanales & Gestor Académico Inteligente)

### 🌟 Nuevas Funcionalidades & Lógica de Negocio
- **Lanzamiento de Horarios & Rutinas (`src/components/schedule/*`)**:
  - Implementación completa de la nueva aplicación modular basada fielmente en el boceto en lápiz de iPad del usuario.
  - **Cuadrícula Bidireccional 2D (`ScheduleGrid.tsx`)**:
    - **Fila de Días Deslizable (`LUNES` a `DOMINGO`)**: Scroll horizontal fluido con auto-centrado en el día de hoy (`currentDay`). Indicador visual de desplazamiento hacia la izquierda para revelar Viernes, Sábado y Domingo.
    - **Columna de Horas Deslizable (`6:00 AM` a `10:00 PM`)**: Scroll vertical sincronizado con auto-posicionamiento en la hora actual.
    - **Línea de Tiempo Real en Vivo**: Indicador horizontal de color rojo coral con punto pulsante que recorre toda la cuadrícula marcando el minuto exacto del día.
    - **Píldoras de Materia con Franja de Color Lateral**: Replicación exacta del diseño del boceto con una franja de color en el costado derecho como identificador cromático único de cada materia.
    - **Altura Proporcional a la Duración**: Clases de 1 hora ocupan 1 ranura (`76px`), de 2 horas ocupan 2 ranuras completas (`152px`), y de 3 horas ocupan 3 ranuras completas (`228px`).
  - **Tarjetas Hero Superiores (`ScheduleHeroCards.tsx`)**:
    - **Siguiente Clase**: Detección reactiva de la próxima clase del día con cuenta regresiva en minutos. Si una clase está transcurriendo en el momento actual, muta dinámicamente al modo **"🔴 En Curso (Dynamic Island Style)"** con barra de progreso en tiempo real y tiempo restante.
    - **PENDIENTES**: Muestra la entrega o compromiso más cercano con badge numérico. Al tocar la píldora, despliega el **Gestor Interactivo de Tareas**.
  - **Botón Flotante Inferior Derecho `+` con Menú Desplegable (`ScheduleFabMenu.tsx`)**:
    - Al presionar el botón `+`, **se atenúa y desenfoca toda la aplicación** (`backdrop-blur-md bg-black/75`) y brota un submenú popover interactivo con accesos directos para:
      - 📚 **Agregar Materia**
      - 📝 **Agregar Tarea / Pendiente**
      - 🤖 **Escanear con Gemini IA ✨**
  - **Modal Supercompleto de Creación de Materia (`AddClassModal.tsx`)**:
    - **Selector Multi-Día Interactivo**: Selección simultánea de días (`[Lun]`, `[Mar]`, `[Mié]`, `[Jue]`, `[Vie]`, `[Sáb]`, `[Dom]`) para que una clase recurrente se refleje automáticamente en el horario semanal con un solo guardado.
    - **Selector de Horario & Duración**: Selector de hora de inicio con píldoras de duración (`1 hora`, `1.5 hrs`, `2 horas`, `3 horas`, `4 horas`) y cálculo dinámico en tiempo real de la hora de finalización (ej: `07:00 → 09:00`).
    - **Paleta de Colores Apple OLED**: 10 colores vibrantes para distinguir visualmente cada asignatura o actividad.
    - **Selector de Emojis Temáticos**: Presets inmediatos para conducción (`🚗`), estudio (`📚`), sistemas (`💻`), ciencias (`🔬`), gimnasio (`💪`), etc., más soporte de emojis personalizados.
    - **Campos de Aula, Instructor y Notas**: Ubicación física (ej: *Pista Norte Auto 04*, *Aula 304*), docente y apuntes.
  - **Escudo de Asistencia & Control de Metas ("Attendance Shield")**:
    - Diseñado tanto para **Conducción** (ej. meta de 15 clases prácticas requeridas para la licencia) como para la **Universidad** (ej. límite de 3 inasistencias permitidas).
    - En el detalle de la materia (`ClassDetailModal.tsx`) se incluye barra de progreso porcentual y botones rápidos interactivos (`+ Registrar Asistencia Hoy` y `+ Registrar Falta`).
  - **Gestor Interactivo de Tareas & Compromisos (`TasksModal.tsx` & `AddTaskModal.tsx`)**:
    - Pestañas separadas de **Pendientes** y **Completadas**.
    - Filtros por materia o vista general.
    - Checkboxes táctiles con retroalimentación visual, niveles de prioridad (Baja, Media, Alta 🔥), fechas límites con accesos rápidos (*Hoy*, *Mañana*, *En 3 días*, *Próxima semana*).
  - **Detalle Extendido de Materia (`ClassDetailModal.tsx`)**:
    - Despliegue al hacer clic sobre cualquier tarjeta de clase: información completa, horarios recurrentes, tareas vinculadas, libreta de notas rápidas de clase (`quickNotes`) y opciones de edición/eliminación.
  - **Smart Schedule Scanner con Gemini IA (`ScheduleAiImportModal.tsx` & `src/lib/scheduleAiParser.ts`)**:
    - Importación automática de horarios a partir de fotos/pantallazos de WhatsApp o texto libre utilizando Gemini AI (`@google/generative-ai`), estructurando materias, días, horarios, colores y emojis en un solo toque.
  - **Exportación Directa a Calendario iOS (`src/lib/calendarExport.ts`)**:
    - Generación de archivos de calendario estándar `.ics` compatibles con Apple Calendar y Google Calendar, con repetición semanal y alarmas 30 minutos antes.
  - **Notificaciones Nativas con 30 Minutos de Antelación (`src/lib/scheduleNotifications.ts`)**:
    - Programación de avisos preventivos a través de `@capacitor/local-notifications` en segundo plano en iOS y Web Notifications en navegador.
  - **Ajustes de Horarios (`ScheduleSettingsModal.tsx`)**:
    - Configuración de tiempo de anticipación de alertas (15, 30, 45, 60 min), alerta nocturna de preparación de mochila (8:30 PM) y administración de perfiles (Universidad, Conducción, Gym).

### 🛠️ Mejoras y Cambios de Arquitectura
- **Tienda Zustand Persistente (`src/stores/useScheduleStore.ts`)**:
  - Almacenamiento desacoplado en `hubos_schedule_store_v1` para perfiles, materias, ranuras multi-día (`ClassSlot`), tareas y notas con cero datos precargados a solicitud del usuario.
- **Integración con HUBos Launcher (`useHubStore.ts`, `page.tsx`, `HubDashboard.tsx`)**:
  - Adición del módulo `'schedule'` en `AppModule`.
  - Tarjeta de acceso directo a **Horarios & Rutinas (`📅`)** en el launcher principal del HUB con telemetría en tiempo real (clase actual/próxima y contador de pendientes).
  - Conmutación en 0ms en `page.tsx`.

---

## 🚀 [v1.6.0] - 2026-09-08 (Notificaciones Nativas, Fotos HD en IndexedDB, Comidas Frecuentes, Logros con Sonido & Rediseño de TopBar)

### 🔔 Notificaciones de Suscripciones
- **Formato Limpio sin Paréntesis**:
  - Se eliminaron los paréntesis de todos los textos de recordatorio de suscripciones.
  - Se implementó formateo de moneda con separador de miles (ej: `Tu suscripción a Gimnasio vence hoy por un valor de $105.000 COP.` y `Tu suscripción a Apple Music renovará en 2 días por un valor de $9.900 COP.`).
- **Programación Nativa en Segundo Plano**:
  - Mediante `@capacitor/local-notifications`, las alertas se programan en el sistema operativo iOS a las 9:00 AM según los días de antelación (`reminderDays`) de cada suscripción, disparándose puntualmente sin necesidad de abrir la aplicación.

### 📷 Almacenamiento de Fotos en HD & Nitidez Total
- **Motor IndexedDB (`src/lib/imageStorage.ts`)**:
  - Las fotos capturadas se almacenan a alta resolución (1200px, calidad 0.8) en la base de datos nativa `IndexedDB` del dispositivo, sorteando la cuota de 5MB de `localStorage`.
  - La pantalla de detalle de comida (`MealDetailModal`) carga la imagen directamente en alta resolución sin pixelación.
  - El modelo Gemini 3.5 Flash Lite recibe imágenes nítidas de alta fidelidad para calcular con máxima precisión porciones y macronutrientes.
  - Se mantiene una miniatura optimizada (420px, calidad 0.65) en `localStorage` para carga instantánea de listas.

### ⭐ Guardar en Comidas Frecuentes
- **Toggle Directo en Escaneo**:
  - Se agregó la opción "⭐ Guardar en Comidas Frecuentes" en el modal de captura (`MealCaptureModal`).
  - Al escanear una comida, si se marca esta opción, se guarda automáticamente en `favoriteMeals` con sus macronutrientes calculados, permitiendo volver a consumirla desde la lista rápida con un solo toque y sin gastar cuota de API.

### 🏆 Sistema de Logros Automático con Sonido Elegante
- **Motor de Evaluación Automática (`src/lib/achievements.ts`)**:
  - Los logros se evalúan y desbloquean en tiempo real al registrar entrenamientos, comidas, agua o rachas (ej: primer entrenamiento, primera comida, gigante de hierro, etc.).
- **Sonido Elegante Apple Chime (`src/lib/audio.ts`)**:
  - Síntesis de audio armónico mediante Web Audio API en tiempo real (acorde mayor aterciopelado con envolvente exponencial), sin descargas de archivos externos.
- **Notificación Flotante de Celebración (`AchievementUnlockedToast.tsx`)**:
  - Modal flotante superior con diseño Apple, icono animado, título, descripción y barra de tiempo decreciente.

### 🧭 Reorganización de TopBar en RecompAI
- **Acceso Rápido al HUB Principal**:
  - Se añadió el botón `🏠 HUB` directamente en la barra superior para volver al launcher principal en 0ms.
  - Se eliminó la rueda de engranaje redundante (accesible desde la pestaña "Perfil").
  - Se unificaron las rachas de entrenamiento (`💪`) y nutrición (`🥑`) en una sola píldora compacta y elegante (`💪 Xd | 🥑 Yd`).

### ⏱️ Notificaciones Internas con Barra de Progreso
- **AlertToast con Texto Completo**:
  - Se eliminó el truncamiento del mensaje para leer completas las recomendaciones de nutrición.
  - Se integró una barra de progreso decreciente en la parte inferior animada por hardware a lo largo de los 5 segundos de duración.

---

## 🐛 [v1.5.2] - 2026-09-08 (Fix Definitivo Modelos Gemini: gemini-3.5-flash-lite Activo & Verificado)

### 🔴 Corrección de Modelos de IA
- **Configuración a Modelos Activos Verificados en API**:
  - Se eliminaron modelos retirados (`gemini-1.0-pro`, `gemini-1.5-flash`, etc.) que causaban error 404 al consultar la API de Google en `v1beta`.
  - Se estableció el modelo principal solicitado: **`gemini-3.5-flash-lite`**, con pipeline de fallback probado en vivo: `gemini-3.1-flash-lite`, `gemini-3.6-flash`, y `gemini-3.8-flash`.
  - Validación directa ejecutada con éxito tanto para respuesta de texto como para visión computacional (`inlineData`).

---

## 🐛 [v1.5.1] - 2026-09-08 (Corrección Crítica: Crash al Registrar Comida & Rendimiento de IA)

### 🔴 Correcciones Críticas
- **Fix Crash al Registrar Comida con Foto**:
  - La app crasheaba (~1 minuto de espera y luego reinicio forzado) porque las imágenes comprimidas (~150-400KB de base64) se persistían íntegras en `localStorage` a través de Zustand. Con pocas comidas, se excedía la cuota de ~5-10MB de iOS WebKit (`QuotaExceededError`).
  - **Solución**: Se implementó `createThumbnail()` en `src/lib/image.ts` que genera miniaturas de ~3-8KB (120px, calidad 0.4) para la persistencia local. La imagen completa se usa únicamente en memoria para enviar a Gemini, y nunca se guarda en `localStorage`.
- **Protección contra QuotaExceededError**:
  - Se envolvió la interfaz `localStorage` del store Zustand (`useRecompStore`) con un wrapper seguro que captura errores de cuota silenciosamente en lugar de crashear toda la app.

### ⚡ Mejoras de Rendimiento
- **Timeout de 25 segundos por modelo de Gemini**:
  - Cada intento de modelo ahora tiene un timeout de 25 segundos. Si un modelo cuelga, pasa automáticamente al siguiente sin dejar la app bloqueada indefinidamente.
- **Compresión más agresiva de imágenes para Gemini API**:
  - Reducción de dimensión máxima de 800px a 640px y calidad de 0.7 a 0.5, generando payloads más ligeros (~60-120KB) que se envían más rápido a la API.
- **Modelos de IA actualizados** (`src/constants/ai.ts`):
  - Modelo principal cambiado a `gemini-2.5-flash` (el más rápido y actual).
  - Eliminados modelos inexistentes/deprecados (`gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, `gemini-2.0-flash-lite-preview-02-05`) que causaban intentos fallidos extra y latencia innecesaria.
- **Bail-out inmediato en errores de cuota**:
  - Si Gemini devuelve `RESOURCE_EXHAUSTED` o error de cuota, la app ahora muestra el error inmediatamente sin intentar los demás modelos de fallback.

### 🧹 Correcciones Menores
- Fix en cleanup de `useEffect` en `MealCaptureModal` que podía ocultar la barra de navegación prematuramente.
- Reset del input de archivo después de cada selección de foto para permitir re-selección del mismo archivo.

---

## 🚀 [v1.5.0] - 2026-08-25 (Actualización Mayor: Rutina Dinámica, Modal de Comidas, Motor de Rachas & Multi-Upload Symmetry)

### 🌟 Nuevas Funcionalidades & Lógica de Negocio
- **Sincronización Automática de Fecha**:
  - Al abrir la app o regresar a primer plano, se auto-selecciona el día actual en curso (`getTodayKey()`), evitando arrastrar información de días anteriores.
- **Rutina Dinámica según el Día de la Semana (`src/lib/trainingSchedule.ts`)**:
  - La tarjeta de entrenamiento en el dashboard se adapta automáticamente al split semanal del usuario:
    - **Lunes & Jueves**: `Torso Hipertrofia` (Pecho, Espalda & Brazos)
    - **Martes & Viernes**: `Pierna Hipertrofia` (Cuádriceps & Isquios)
    - **Miércoles, Sábado & Domingo**: `Descanso Activo` (Recuperación)
- **Modal Detallado de Comidas (`MealDetailModal.tsx`)**:
  - Al tocar cualquier comida en la pantalla principal o en la sección de comidas, se abre un modal emergente MonAI con la foto ampliada, calorías, desglose exacto de macronutrientes (Proteína, Carbos, Grasas), notas y opción de eliminación.
- **Motor Exacto de Rachas (`src/lib/streak.ts`)**:
  - **Racha de Gimnasio**: Suma +1 día por cada entrenamiento de Symmetry subido. Tolerancia de hasta 3 días de descanso permitidos sin perder la racha; se reinicia a 0 únicamente si pasan > 3 días sin entrenar.
  - **Racha de Nutrición**: Requiere registrar al menos 2 comidas en el día para mantener la racha activa; si no se cumple, la racha se reinicia a 0.
  - Sincronización de badges en TopBar y métricas principales con valores reales y reactivos (cero números falsos por defecto).
- **Subida Múltiple de Capturas de Symmetry (Hasta 4 imágenes)**:
  - Soporte para adjuntar hasta 4 capturas de pantalla de la rutina en `TrainingSection.tsx`, comprimidas con Canvas y analizadas en una sola consulta multimodal con Gemini IA.
- **Ocultamiento Automático de Barra de Navegación**:
  - Al abrir el detalle de cualquier sesión de entrenamiento, la píldora inferior se oculta inmediatamente.
- **Corrección en Contador de Logros**:
  - Sincronización exacta del texto del encabezado con la cantidad real de logros desbloqueados.

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
