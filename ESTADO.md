# 🤖 INSTRUCCIONES PARA LA IA (META-PROMPT)

1. **ROL:** Eres un Arquitecto de Software experto en Laravel 12 (PHP 8.3) y React 19 e Inertia.js 2.0.
2. **ESTILO:** Respuestas extremadamente breves y técnicas ("Show, don't tell").
3. **CÓDIGO:** Usa siempre sintaxis moderna: Arrow Functions, Null Safe Operator (`?->`), Enums y TailwindCSS.
4. **REGLA DE ORO:** Al hacer SQL/Eloquent, SIEMPRE prefija las columnas (`patients.id` en vez de `id`) para evitar conflictos en Joins.
5. **FORMATO:** Si hay error, usa: "Causa -> Solución".

---

# PROYECTO: Sistema de Gestión Clínica (Enterprise)

## 🛠 STACK TECNOLÓGICO (Inmutable)

- **Backend:** Laravel 12 + PHP 8.3
- **Frontend:** React 19 + Inertia.js 2.0
- **Estilos:** TailwindCSS 4
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

## 📍 LOGROS SESIÓN ACTUAL (12/01/2026)

### 🛠 Actualización de Stack & Core
- **Mantenimiento NPM:** Se actualizaron dependencias clave (`react-toastify` v11, `jspdf`, etc.) y se corrigieron rutas de importación de Layouts (`app-layout`) que impedían el build de Vite.
- **Performance:** Se implementó caché de 24h (`Cache::remember`) para consultas geográficas (Regiones, Provincias, Comunas) en `PatientAdminController`, optimizando la carga de expedientes.
- **Modelos:** Se corrigió la relación `doctor` en `TreatmentSession` para que apunte al modelo `Doctor` (en lugar de `User`), permitiendo el acceso a atributos calculados como `full_name`.

### 🩺 Gestión Clínica & SOAP
- **Historial de Dolor:** Implementación de visualización histórica de `pain_map`. Los eventos en la línea de tiempo ahora incluyen un botón "Ver Mapa" que abre el `BodySelector` en modo lectura.
- **Seguridad SOAP:** Se refinaron permisos para bloquear campos administrativos (`treatment_id`, `session_type_id`, `date`) una vez que la sesión está `attended`, manteniendo los campos clínicos editables.
- **Validación de Comisiones:** Se implementó un sistema de **confirmación de fallback**. Si un profesional no tiene comisión configurada, el sistema avisa al admin mediante un `Swal` y permite crear la sesión usando los valores por defecto del `SessionType` tras confirmación explícita.

### 🎨 UI/UX Enterprise (Premium Redesign)
- **Sidebar del Paciente:** Rediseño completo con cabecera de perfil estilizada, avatar con efectos de profundidad y menú de navegación moderno con indicadores de estado activo.
- **HandSelector Pro:** Refinamiento anatómico del selector de mano. Se engrosaron los dedos, se corrigió la postura del pulgar y se agregaron las falanges (distal, media, proximal) para una precisión clínica superior.
- **Unificación de Botones:** Se estandarizó el botón "Nueva Sesión" en los módulos de `Attendances` y `DetailPatient`, incluyendo animaciones de rotación de iconos y estados hover.
- **Corrección de Tablas:** Se arregló la paginación en `TableSessions` y `TableTreatments` (conflicto `pageSize` vs `pagesize`) y se estandarizó el formato de hora usando `moment.js`.

### 🔔 Notificaciones & Automatización
- **Liquidaciones:** Envío automático de `PayrollApprovedNotification` por email al aprobar una liquidación, incluyendo enlace de descarga.
- **Agendamiento Inteligente:** Nueva notificación `SessionScheduledNotification` (Email/WhatsApp).
- **Soporte para Tutores:** El sistema detecta automáticamente si el paciente requiere tutor (`require_tutor`) y desvía las notificaciones de agendamiento al contacto principal (Guardian), personalizando el mensaje para referirse al "pupilo".

## 📝 TAREA ACTUAL (Próximos Pasos)

- [ ] Verificar la visualización de la dirección de sucursal en las notificaciones de mail.
- [ ] Implementar la lógica de "Re-enviar Notificación" desde el detalle de la sesión.
- [ ] Revisar el cierre automático de tratamientos tras alcanzar el `total_sessions`.
- [ ] Optimizar la carga de deudas en el Dashboard para incluir filtros por sucursal.

## 💡 NOTAS TÉCNICAS

- **Rutas:** Las rutas de `patients.show` ahora pasan explícitamente `active_treatments` para evitar confusiones con la relación base de Eloquent.
- **Caché:** Se recomienda `php artisan cache:clear` si se realizan cambios manuales en las tablas de regiones/comunas.
- **Inertia:** Se añadió `return back()` en `TreatmentSessionController@store` para garantizar el refresco de props tras la creación exitosa.

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