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

## 📍 LOGROS SESIÓN ACTUAL (14/01/2026)

### 🛠 Refactorización & Core
- **AttendancesController:** Se eliminó la lógica de persistencia (`store`/`update`) para centralizarla en `TreatmentSessionService`. Se refactorizó el `index` para calcular el **Estado Real de Facturación** (Invoice + DTE) a través de la nueva relación `invoiceItems`, permitiendo ver folios, estados SII y PDF activos.
- **Validación de Agenda:** Nueva regla en `TreatmentSessionService` (`validatePatientAvailability`) que impide agendar al mismo paciente en horarios superpuestos.
- **Rutas & Inertia:** Estandarización de nombres de vistas a kebab-case (`session-types/index`, `attendances/index`) y limpieza de rutas obsoletas en `web.php`.

### 🎨 UI/UX & Componentes
- **Tablas:** Corrección del estado `pageSize` en `TableSessionTypes` y `DataTable`, arreglando la paginación y el texto "Mostrando X a Y de Z".
- **Visualización:** Ajuste en el listado de asistencias para bloquear checkboxes si la sesión ya tiene factura/DTE asociado (`is_locked`).

## 📍 LOGROS PREVIOS (12/01/2026)

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
- **Corrección de Tablas:** Se arregló la paginación en `TableSessions` y `TableTreatments` (conflicto `pageSize` vs `pageSize`) y se estandarizó el formato de hora usando `moment.js`.

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


______________________

Actúa como un Arquitecto de Software Senior experto en Laravel y normativa tributaria chilena (SII).

Tu objetivo es realizar una AUDITORÍA DE CÓDIGO (Solo lectura, no propongas cambios de código aún, solo reporta) sobre el flujo de Pagos y Facturación Electrónica (DTE).

CONTEXTO DEL PROYECTO:
Estamos construyendo un sistema de gestión clínica.
1. Separamos la deuda comercial ('invoices') del documento tributario ('dtes') y del flujo de caja ('payments').
2. Usamos 'payment_allocations' para vincular pagos a facturas.
3. Debemos soportar pagos parciales, abonos y múltiples medios de pago.
4. Existe un riesgo de concurrencia entre un Job automático ('EmitDteJob') y la emisión manual en caja.

ARCHIVOS A ANALIZAR:
Por favor, revisa la lógica y estructura de los siguientes archivos (o sus equivalentes en mi proyecto):
- Migraciones y Modelos de: `Invoice`, `Payment`, `PaymentAllocation`, `Dte`.
- Controladores relacionados al pago (`PaymentController` o similar).
- Servicios o Jobs de facturación (`DteService`, `EmitDteJob`).

PUNTOS CRÍTICOS A VERIFICAR:

1. Integridad de Datos (Pagos):
   - ¿La estructura actual de `payments` y `payment_allocations` permite realmente que un paciente pague una parte en efectivo y otra con tarjeta para una misma `invoice`?
   - ¿Detectas redundancia de datos entre `payments` e `invoices` que pueda causar desincronización de montos?

2. Normativa SII y Lógica Tributaria:
   - Revisa si la tabla `dtes` tiene todos los campos necesarios para cumplir con el SII (Folio, Tipo, XML, PDF, Estado).
   - Analiza si el sistema diferencia correctamente entre prestaciones Exentas (Salud) y Afectas (Insumos) al momento de preparar los datos para el DTE.
   - ¿Existe riesgo de duplicidad de impuestos si la máquina POS emite boleta y el sistema también? (Busca lógica que prevenga esto).

3. Concurrencia y Seguridad (Race Conditions):
   - Busca si existe implementación de `Cache::lock` (bloqueos atómicos) en la lógica de emisión del DTE.
   - ¿Qué pasa si el usuario presiona "Generar Boleta" mientras el `EmitDteJob` está corriendo en segundo plano? Identifica si el código actual previene la duplicación del folio.

4. Estado de la Deuda:
   - Verifica cómo se actualiza el `payment_status` en `invoices`. ¿Es automático al crear una `allocation`? ¿Hay riesgo de que quede como 'paid' sin cubrir el monto total?

ENTREGABLE:
Dame un reporte estructurado con:
- ✅ Fortalezas de la arquitectura actual.
- ⚠️ Riesgos potenciales detectados (Lógicos o de Negocio).
- 🛑 Errores críticos (si los hay).
- 💡 Sugerencias breves de mejora (sin escribir el código todavía).

Actúa como un Arquitecto de Software Senior experto en Laravel, Bases de Datos Relacionales y Normativa Tributaria (SII Chile).

Realiza una AUDITORÍA ESTÁTICA del código (sin modificar nada) enfocándote en la consistencia de datos entre el detalle clínico, la deuda y el pago.

ARCHIVOS A ANALIZAR:
1. Modelos y Migraciones: `Invoice` (Cabecera), `InvoiceItem` (Detalle), `Payment`, `PaymentAllocation`, `Dte`.
2. Lógica de Negocio: `DteService`, `PaymentController`, `EmitDteJob`.
3. Conceptos Clave: Revisa cualquier referencia a `Debt` si existe, o confirma si `Invoice` actúa como la entidad de deuda principal.

OBJETIVOS DEL ANÁLISIS:

1. Consistencia Tributaria (InvoiceItems vs DTE):
   - Analiza la tabla `invoice_items`. El campo `is_exento` es la fuente de la verdad.
   - Verifica: ¿La lógica que genera el DTE (en `DteService`) itera sobre los `invoice_items` para calcular los montos netos y exentos?
   - Alerta: Si el DTE toma solo los totales de la tabla `invoices` sin validar contra los items, repórtalo como riesgo de integridad.

2. Integridad de la Deuda (Invoices vs Allocations):
   - Revisa la relación entre `Invoice` y `PaymentAllocation`.
   - Verifica: ¿El sistema valida que la suma de `amount_clp` en `payment_allocations` no supere el `amount_patient_clp` (Deuda del Paciente) definido en la Invoice?
   - Confirma si la lógica actual permite que un pago se asigne a múltiples `invoices` (o `debts`) correctamente.

3. Flujo del Copago (Seguros vs Paciente):
   - En `invoice_items` y `invoices`, tenemos precios diferenciados (`amount_insurance` vs `amount_patient`).
   - Verifica: Asegúrate de que el modelo `Payment` y la lógica de cobro solo estén capturando el `amount_patient` (Copago) y no el total de la prestación, para evitar "inflar" la caja con dinero que aún no paga la Isapre.

4. Detección de Race Conditions (Bloqueos):
   - Busca explícitamente el uso de `Cache::lock` o transacciones de base de datos (`DB::transaction`) en el momento en que se crea el `PaymentAllocation` y se emite el DTE.

ENTREGABLE:
Genera un reporte técnico con:
- 🟢 Semáforo Verde: Lógica sólida detectada.
- 🔴 Semáforo Rojo: Inconsistencias graves (ej: DTE calculado sin mirar si los items son exentos).
- 🟡 Semáforo Amarillo: Posibles fugas de lógica en asignación de pagos o redundancia de datos.