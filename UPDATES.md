# HUBos — Changelog & Updates Log

Este documento lleva el registro cronológico completo de todas las versiones, mejoras de arquitectura, módulos integrados y optimizaciones implementadas en la Super-App **HUBos**.

---

## 🚀 [v1.0.0] - 2026-08-13 (Lanzamiento Inicial de HUBos)

### 🌟 Super-App & Contenedor Modular Unificado para iOS
- **Solución al Límite de 3 Apps de SideStore / AltStore**: HUBos consolida múltiples aplicaciones nativas completas e independientes dentro de un único archivo `.ipa`, ocupando sólo **1 de los 3 slots activos permitidos**.
- **Navegación Instantánea (0ms Latency)**: Barra flotante inferior (`FloatingHubBar`) con efecto de cristal (glassmorphism) y conmutación reactiva e inmediata entre el HUB central y los submódulos.

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
