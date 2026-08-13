# 🚀 HUBos — Super-App & Ecosistema Modular Nativo para iOS

**HUBos** es un contenedor modular unificado y Super-App para iOS diseñada para alojar múltiples aplicaciones completas e independientes dentro de un solo archivo `.ipa`, **superando la restricción estricta de 3 aplicaciones activas en SideStore / AltStore**.

---

## 📱 Módulos Incluidos

```
HUBos Container
├── 🏠 HUB Launcher (Dashboard central, telemetría consolidada, accesos rápidos y Omnibar de IA)
├── 🥗 RecompAI (Tracker de recomposición corporal, macros, escáner de platos con IA y auditoría Symmetry)
└── 💳 Subscription Manager (Control de suscripciones, gastos recurrentes, timeline y alertas nativas)
```

---

## 🎨 Identidad Visual (MonAI / DinER Design System)

- **Dark Mode OLED**: Fondo `#131313`, tarjetas `#1C1C1E`, contenedores elevados `#2A2A2C`.
- **Acentos**: Verde iOS `#34C759` y Azul iOS `#0A84FF`.
- **Micro-animaciones**: Transiciones nativas a 60fps con conmutación de módulos en 0ms.
- **Formas**: Píldoras redondeadas (`rounded-full`), Bottom Sheets con área segura de Dynamic Island (`h-[calc(100vh-68px)]`).

---

## 🤖 Inteligencia Artificial (Gemini 2.0 Flash)

- **Escáner Nutricional**: Desglose calórico y de macros a partir de fotos y descripciones de texto.
- **Auditoría de Entrenamientos**: Extracción de series, repeticiones y pesos desde capturas de Symmetry.
- **Detección de Suscripciones**: Registro automático y sugerencias de ahorro mediante comandos en lenguaje natural.
- **Recomp Coach**: Entrenador personal conversacional alimentado con el contexto del usuario en tiempo real.

---

## 📲 Instalación en iPhone vía SideStore

1. Descarga el archivo `HUBos.ipa` generado en [GitHub Releases](https://github.com/Mofn23/HUBos/releases).
2. Abre **SideStore** (o AltStore) en tu iPhone.
3. Ve a la sección **My Apps** y presiona **`+`**.
4. Selecciona `HUBos.ipa`.
5. ¡Listo! Tendrás RecompAI y Subscription Manager activos consumiendo **1 solo slot** de sideloading.

---

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar exportación estática para iOS
npm run build

# Sincronizar con Capacitor iOS
npx cap sync ios
```
