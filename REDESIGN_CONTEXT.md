# HUBos — contexto para continuar el rediseño

Este documento resume las decisiones y cambios acordados con el usuario para que el trabajo continúe desde esta carpeta sin tener que reconstruir el contexto de conversaciones anteriores.

## Estado del proyecto

- Proyecto: **HUBos**, superapp web preparada también para iOS mediante Next.js y Capacitor.
- Carpeta activa: `E:\My Drive\Antigravity Obsidian\01_Projects\HUBos`.
- Estado copiado: commit `95a197de2d08e6258897758f25da82e19ba7e4ba` (versión 2.7.0 / release v2.7 codex).
- El repositorio ya contiene las dependencias, la carpeta iOS, workflows y las imágenes de referencia en `Imagenes de referencia/`.
- `Imagenes de referencia/` está sin seguimiento por Git en el estado actual. No borrarla sin que el usuario lo pida: sirve como referencia de diseño.

## Dirección visual acordada

La aplicación se está rediseñando de forma transversal con **Apple Fitness como referencia visual**: fondo OLED negro, superficies oscuras y limpias, tipografía con jerarquía clara, tarjetas compactas, acentos vivos por tipo de actividad, navegación flotante y motion breve con respuesta táctil.

- Eliminar por completo el lenguaje visual de **Claymorphism**: nada de superficies acolchadas, volumen de arcilla o sombras internas de ese sistema.
- Mantener la aplicación minimalista: quitar rótulos y métricas redundantes, priorizar contenido útil y dejar aire entre secciones.
- Cuidar especialmente el viewport móvil/iPhone y las previsualizaciones estrechas: ningún control, emoji, tarjeta, menú o modal debe desbordarse.
- Modales y hojas deben respetar áreas seguras, scroll interno cuando sea necesario, capas/z-index correctos y controles de cierre accesibles.
- Animaciones cortas, suaves y coherentes (entrada/salida, escala táctil, indicadores y cambios de estado). Respetar `prefers-reduced-motion` y no animar de forma que interfiera con el uso.
- No reemplazar comportamientos funcionales por datos de muestra. Los logros, actividad, entrenamientos, estadísticas y progreso deben reflejar datos reales; los estados vacíos deben verse vacíos y explicar brevemente la acción disponible.
- Conservar persistencia, lógica de negocio, accesibilidad y sonidos existentes salvo que el usuario pida cambiarlos expresamente.

## Cambios y decisiones recogidos hasta ahora

### Inicio / HUB

- Se simplificó la cabecera: quitar marca redundante, saludo con nombre y textos descriptivos que no aportan. El saludo depende de la hora (buenos días/tardes/noches).
- El área de aplicaciones quedó más limpia: título “Aplicaciones”, tarjetas horizontales y compactas con el nombre/icono y solo métricas breves útiles. Abrir la app tocando su tarjeta, sin botón “Abrir” ni píldoras inferiores.
- El engranaje de ajustes debe ser discreto.
- “Horarios & Rutinas” se retiró porque el usuario no la utilizará.

### RecompAI: nutrición, comida y registro corporal

- Cabecera reducida a saludo; se quitaron elementos redundantes como marca, saludo largo, racha duplicada y textos auxiliares.
- En calorías, quitar el estado “En déficit” y mantener consumido/meta en líneas compactas. En macros dejar gramos sin porcentajes ni subtítulos innecesarios.
- Se quitó la función de “bomba de glucógeno”. Los resúmenes de Hoy/Gym/Dieta deben tener icono y contenido centrados sin rótulos superiores superfluos.
- Logros: cuadrícula responsive y contenida dentro de su tarjeta; desbloqueados y bloqueados legibles sin desbordamiento.
- Comida: encabezado breve “Comida” con emoji; macros presentados en formato compacto. “Escanear con IA” como acción principal centrada y entrada manual secundaria discreta. Comidas frecuentes conservan su utilidad con nombres cortos; sin filtro redundante por comida.
- El modal para registrar comida con IA debe caber en móvil, permitir cerrar con X, no cubrir controles globales y mantener la categoría “Snacks” completamente dentro de su selector.
- Conservar los efectos de sonido de registrar comidas y otras acciones para los que ya existían.
- Entrenamiento/Gym dentro de RecompAI se retiró porque Aesthetix cubre esa función.
- Perfil y preferencias se limpiaron. El cambio claro/oscuro debe funcionar en toda la interfaz, no ser solo decorativo; organizar metas calórica y proteica.
- Crear/usar el apartado de Registro corporal para peso, medidas, tendencia semanal, consumo calórico semanal y fotos de progreso. El formulario de registrar peso debe subir lo suficiente para que el dock inferior no tape el botón principal.

### Suscripciones

- Botón “Volver al HUB” alineado a la derecha como en RecompAI; quitar engranaje de esta cabecera.
- Unificar el resumen de costos: mensual destacado y anual en texto menor.
- Tarjetas de servicio: mostrar el nombre completo, permitiendo que el texto use más espacio/varias líneas. Mantener icono y datos de día y periodicidad; quitar descripción/categoría innecesaria.
- El usuario pidió que “Registrar pago” tenga lógica útil y que se retiren las opciones “Fugas” y “Cancelar”. Revisar el estado real de esta lógica al modificar la app; no presentar un pago como realizado si solo se abre un flujo.

### Aesthetix: resumen, entrenos, premios y perfil

- La pestaña **Resumen** se consideró ya satisfactoria; conservar su diseño mientras no se solicite lo contrario.
- No mostrar rachas ni AI Builder en la cabecera del resumen si ya hay racha en el contenido.
- Entrenos: ocultar el total del catálogo de ejercicios en la portada de rutinas; dejar el nombre breve de rutina “PPL x UL”, quitar descripción redundante; mostrar inicialmente tres ejercicios por día y un control “Más” para desplegar el resto. Quitar el acceso inferior “Diseñar rutina manual PPL” si sigue presente.
- Premios: titular “Rango” y “Rangos”; eliminar mensajes explicativos prescindibles en el estado vacío. Mapa anatómico responsive, de aspecto humano y táctil: seleccionar un músculo debe seguir llevando a sus ejercicios/rangos. Ranking muscular muestra tres filas inicialmente y botón para expandir.
- Perfil y las secciones modificadas deben compartir el lenguaje visual Apple Fitness y la misma jerarquía de títulos, superficies y espacios.
- El modo de entrenamiento a pantalla completa debe cubrir realmente la pantalla y no dejar asomar navegación/contenido por detrás. Acciones Tutorial/Reemplazar/Notas/Descanso en controles circulares con iconos. Al completar una serie, iniciar un descanso de 2:30. Quitar el botón inferior de añadir desde catálogo; usar un botón “+” al final de la fila de ejercicios para agregar desde allí.

## Arquitectura y ubicaciones de referencia

- Página y estilos globales: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`.
- Estado/persistencia: `src/stores/useHubStore.ts`, `useRecompStore.ts`, `useSubsStore.ts`, `useAesthetixStore.ts`.
- HUB: `src/components/hub/` y `src/components/navigation/`.
- RecompAI: `src/components/recomp/`.
- Suscripciones: `src/components/subscriptions/`.
- Aesthetix: `src/components/aesthetix/`; componentes Fitness viven en `src/components/aesthetix/appleFitness/`.
- Sonidos: revisar `src/lib/audio.ts` y `src/lib/soundEffects.ts` antes de cambiar interacciones.
- Los flujos iOS se gestionan en `ios/`, `capacitor.config.json` y `.github/workflows/build-ios.yml`.

## Forma de continuar

1. Antes de tocar una sección, revisar su componente, store y funciones conectadas para comprender el flujo completo; no hacer solo un cambio cosmético que rompa acciones.
2. Consultar las capturas de `Imagenes de referencia/` para el área solicitada. Son guía de composición y densidad, no motivo para sustituir activos funcionales por imágenes estáticas.
3. Reutilizar los componentes y tokens existentes del sistema Fitness; evitar crear estilos paralelos o reintroducir clases `clay-*`.
4. Para overlays, formularios y pantallas completas, verificar viewport angosto, altura reducida, scroll, área segura, z-index y cierre con teclado/táctil.
5. Preservar toda funcionalidad existente que el usuario no haya pedido retirar. No inventar métricas completadas ni datos de actividad.
6. El usuario suele pedir cambios iterativos por sección; implementar el alcance solicitado y explicar concretamente qué archivos y flujos cambiaron.

## Comandos habituales

```bash
npm run dev
npm run build
npx cap sync ios
```

Para desarrollo local, ejecutar comandos desde esta carpeta. Evitar correr build de producción y servidor de desarrollo simultáneamente sobre el mismo `.next`; pueden interferir con sus chunks y producir errores de runtime.

## Nota sobre documentación histórica

`UPDATES.md` y algunos documentos históricos pueden describir versiones anteriores con Claymorphism. Para decisiones nuevas prevalece esta dirección de diseño acordada con el usuario: Apple Fitness, minimalismo y ninguna estética Claymorphism. Al hacer cambios posteriores, actualizar el changelog si corresponde, sin borrar el historial de versiones previas.
