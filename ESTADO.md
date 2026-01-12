# 🤖 INSTRUCCIONES PARA LA IA (META-PROMPT)

1. **ROL:** Eres un Arquitecto de Software experto en Laravel 10 (PHP 8.3) y React (Inertia.js).
2. **ESTILO:** Respuestas extremadamente breves y técnicas ("Show, don't tell").
3. **CÓDIGO:** Usa siempre sintaxis moderna: Arrow Functions, Null Safe Operator (`?->`), Enums y TailwindCSS.
4. **REGLA DE ORO:** Al hacer SQL/Eloquent, SIEMPRE prefija las columnas (`patients.id` en vez de `id`) para evitar conflictos en Joins.
5. **FORMATO:** Si hay error, usa: "Causa -> Solución".

---

# PROYECTO: Sistema de Gestión Clínica (Enterprise)

## 🛠 STACK TECNOLÓGICO (Inmutable)

- **Backend:** Laravel 10 + PHP 8.3
- **Frontend:** React + Inertia.js 2.0
- **Estilos:** TailwindCSS
- **DB:** MySQL
- **Deploy:** cPanel (Atención con cachés y rutas)

## 📍 CONTEXTO RECIENTE (Logros 05/01/2026)

### 🩺 Gestión Clínica & Protocolo SOAP
- **BodySelector Interactivo:** Se creó un componente SVG (`BodySelector.jsx`) para marcar puntos de dolor en siluetas frontal/posterior.
- **Refactorización de Formularios:** Se estandarizó el diseño de `CreateUpdateModal` (Atenciones), `SessionModal` (Sesiones) y `ModalCreateUpdateTreatment` (Protocolos).
- **Nuevo Layout:** Se implementó una cuadrícula de 2 columnas para datos clínicos + 1 fila de ancho completo para el mapa corporal.
- **Corrección de Coordenadas:** Se mejoró la precisión del click en el SVG usando `getBoundingClientRect` para evitar desfasajes.

### 💰 Módulo de Liquidaciones (Payroll)
- **Flujo de Auditoría:** Se implementó el botón "Revisar" con un `SideModal` que muestra el detalle de atenciones.
- **Generación de PDF:** Se creó una vista Blade optimizada para descarga de liquidaciones del profesional (sin datos internos de la clínica).
- **Simulación Previa:** Se agregó un paso de previsualización antes de generar la liquidación para evitar registros vacíos o erróneos.
- **Bug Fix:** Se corrigió el cálculo de la retención clínica (`Total - Honorario Doctor`) en el `PayrollService`.

### 🏢 Gestión Multitenant & Sucursales
- **Casa Matriz:** Se implementó el campo `is_main` en la tabla `branches` y la lógica para impedir su borrado.
- **Selector Global:** Se integró el `BranchSwitcher` y el acceso al `ContextSelectorModal` directamente en el header del Sidebar (área del logo).
- **Direcciones Polimórficas:** Se habilitó el CRUD de sucursales con soporte para direcciones completas (Región/Comuna) usando el `morphMap`.

### ⚙️ Core & Rutas
- **Consolidación:** Se fusionaron `TreatmentSessionAdminController` y `TreatmentSessionController`.
- **Navegación:** Se corrigió `isRouteActive` para mantener activos los menús al navegar en rutas de recursos (`index`, `edit`, `create`).

## 📍 LOGROS SESIÓN ACTUAL (06/01/2026)

### 🎨 UI/UX Enterprise (Standardization)
- **Modales Clínicos:** Se aplicó el diseño "Hero" (Header con icono dinámico, Footer sticky con blur, Inputs `rounded-xl` monoespaciados) en `ModalCreateUpdateTreatment.jsx` y `CreateUpdateModal.jsx` (Atenciones).
- **Tabla de Comisiones:** Se corrigió el layout de encabezados en `DoctorCommissions.jsx` reemplazando clases conflictivas (`display: block`) por utilidades de Tailwind.
- **Inputs de Tiempo:** Se refactorizaron los campos de Fecha, Hora y Duración en el modal de sesiones para usar un contenedor unificado y estilos consistentes.

### 🧠 Lógica de Negocio (Backend Alignment)
- **Asociación de Tratamientos:** Se optimizó el flujo de creación de sesiones (`CreateUpdateModal`). Ahora el frontend **delega** la creación/asociación del tratamiento al Backend (`TreatmentSessionService`), eliminando pasos manuales redundantes.
- **Feedback Visual:** Se implementaron mensajes claros en la UI de sesión: "✨ Nuevo Tratamiento (Automático)" vs "🔗 Vinculado a Tratamiento Activo".
- **Búsqueda Robusta:** Se implementó `LOWER()` en `AttendancesController` para búsquedas insensibles a mayúsculas y se agregaron accesores "Null Safe" (`?->`) en el mapeo de datos para prevenir errores 500 por registros huérfanos.
- **Validación Enterprise:** Se actualizaron `StoreTreatmentRequest` y `StoreTreatmentSessionRequest` (y sus updates) para soportar oficialmente los campos de Derivación (`referral_doctor_name`), Detalles Diagnósticos (`additional_diagnoses`, `body_part`), Línea Base (`initial_pain_map`) y estructura SOAP completa (`subjective`, `objective`, `assessment`, `plan`).
- **Sincronización de Dolor:** Se ajustó `CreateUpdateModal.jsx` para que, al crear un tratamiento desde una sesión, el mapa de dolor de la sesión (`session_pain_map`) se guarde automáticamente como la línea base del tratamiento (`initial_pain_map`).

### 🐛 Bug Fixes
- **Carga de Tratamientos:** Se corrigió `DetailPatient.jsx` para pasar explícitamente las props `treatments` y `sessions` al componente `IndexTreatments`, solucionando el estado de carga infinito.
- **Bloqueo de Mapa:** Se ajustó la lógica de `isLocked` en el mapa corporal de sesiones para respetar `isFieldEditable()`, permitiendo edición en sesiones nuevas.

## 📝 TAREA ACTUAL (Próximos Pasos)

- [ ] Implementar la visualización del `pain_map` histórico en la línea de tiempo del paciente.
- [ ] Conectar la lógica de "Aprobar Liquidación" con el envío automático de notificación al profesional.
- [ ] Refinar los permisos de edición en los campos SOAP una vez que la sesión está marcada como 'attended'.
- [ ] Optimizar la carga inicial de Regiones/Comunas usando lazy loading o cache.

## 💡 NOTAS TÉCNICAS

- **BodySelector:** Almacena datos en JSON (`initial_pain_map` / `session_pain_map`).
- **Sucursales:** Una empresa siempre debe tener una `is_main: true`. Al promover una, la anterior se degrada automáticamente.
- **Layout:** El ancho máximo de los modales clínicos se ajustó a `95vw` para facilitar la interacción con el mapa corporal.

👤 Ficha de Paciente & Dashboard 360°
Historial Unificado: Se implementó PatientHistoryTable en el Dashboard, fusionando colecciones de sessions, treatments y payments en una sola línea de tiempo cronológica con filtros (Clínico/Financiero).

UI Enterprise (Rediseño): Se estandarizaron TreatmentCardMain, TableSessions y TableTreatments. Se reemplazaron gradientes por un diseño limpio (bordes suaves, badges consistentes, empty states amigables y manejo seguro de nulos ?.).

Navegación: Corrección de IDs en PatientSidebar para sincronizar correctamente el estado activo de los tabs (history vs dashboard).

🩺 Gestión de Sesiones (Flujo Mejorado)
Tratamiento "On-the-fly": SessionFormModal ahora permite crear un Tratamiento Nuevo directamente desde la sesión, solicitando dinámicamente Diagnóstico CIE-10, Médico Derivante y Cupo de Sesiones (bloque visual condicional).

Datos Administrativos: Se integraron selectores de Tipo de Servicio y Modalidad de Cobro (Asociado a Bono/Plan) dentro del modal de sesión.

🚀 Performance & Eloquent
Subconsultas Optimizadas: Refactorización de la query principal en PatientController. Se reemplazó SQL Raw por addSelect(['last_doctor_name' => TreatmentSession::query()...]) para obtener el último profesional eficientemente.

Query Cloning: Implementación de $baseQuery->clone() en reportes para reutilizar filtros de fecha en contadores de Pacientes/Doctores únicos sin re-ejecutar lógica PHP.