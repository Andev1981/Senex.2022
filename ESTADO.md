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

## 📍 ESTADO ACTUAL: SISTEMA REFACTORIZADO (Enero 2026)

### 🛡️ Nueva Arquitectura de Pagos & DTE
El sistema ha migrado de una "doble contabilidad" (Deudas + Facturas) a un modelo unificado basado en Documentos Tributarios.

1.  **Eliminación de Deuda (Debt):**
    *   La tabla `debts` y el modelo `Debt` han sido eliminados.
    *   La deuda ahora es una `Invoice` con estado `payment_status = 'unpaid'`.
    *   La relación clínica-financiera es: `TreatmentSession` -> `InvoiceItem` -> `Invoice`.

2.  **Consistencia de Datos:**
    *   Todos los montos CLP son `bigInteger`.
    *   Se eliminó `invoices.payment_id`. La relación es 1:N vía `payment_allocations`.
    *   `payments.insurance_id` ahora es `liquidation_insurance_id` (para diferenciar del seguro del paciente).

3.  **Motor DTE (Facturación Electrónica):**
    *   **Sincronización:** `EmitDteJob` delega 100% en `DteService`, evitando duplicidad de lógica.
    *   **Seguridad:** Uso de `lockForUpdate` para reserva atómica de folios SII.
    *   **Tributación:** Exención de IVA dinámica leyendo `SessionType->is_exempt`.

### 🏢 Gestión de Empresas (Nuevo)
- **CompanyDataService:** Implementado con patrón "Cache on Demand".
    - Busca localmente (`companies_directory`).
    - Si es antiguo (>30 días) o no existe, consulta API externa.
    - Cachea resultados para optimizar costos/latencia.
- **Frontend:** Autocompletado de Razón Social/Giro en formularios mediante `ExternalDataController`.

### ⚙️ Refactorización & Calidad
- **Enums Estrictos:** Modelos `Treatment` y `TreatmentSession` migrados 100% a `TreatmentStatusEnum` y `AppointmentStatusEnum`. Eliminación de "magic strings" y corrección de scopes.
- **Rutas:** Estandarización de rutas frontend a `/sessions` (eliminado `/sesiones` para evitar 404s).
- **Correcciones:** `ClientDashboardController` y `PatientPlansController` movidos a los namespaces correctos (`Admin\Clients` y `Admin\Plans`).

## 💡 NOTAS TÉCNICAS

- **Deuda del Paciente:** Se calcula sumando `Invoice` con estado `unpaid`/`partial` menos los pagos asignados en `payment_allocations`.
- **Rutinas de Mantenimiento:**
    - `php artisan queue:work` (Vital para DTE asíncrono y Notificaciones).
    - `php artisan cache:clear` (Si se tocan regiones/comunas).
- **Inertia:** Rutas estandarizadas a kebab-case (ej: `attendances/index`).

## 📝 PRÓXIMOS PASOS (Roadmap)

- [x] Verificar la visualización de la dirección de sucursal en las notificaciones de mail (Implementado en `SessionScheduledNotification` y layouts de correo).
- [x] Implementar la lógica de "Re-enviar Notificación" desde el detalle de la sesión (Botón "Notificar" añadido).
- [x] Revisar el cierre automático de tratamientos tras alcanzar el `total_sessions` (Lógica corregida en `TreatmentService` usando Enums).
