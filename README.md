# Senex — Plataforma Kinesiológica SaaS
# gemini --agent codebase_investigator --context ./GEMINI.md

# $contexto = Get-Content ./GEMINI.md -Raw
# gemini "Instrucciones de sistema: $contexto. Ahora, actúa como el agente codebase_investigator."

## Agent Profile: Codebase Investigator
- **Mode**: Deep Analysis & Context Retrieval.
- **Primary Task**: Scan files for cross-references, identify service providers, and map Inertia/React data flows.
- **Rules**: Always verify if a change in a Controller affects the Multitenancy Trait or the Global Scopes defined in the project.

## 🚀 Stack Técnico

- **Backend:** Laravel 9.2 + Sanctum
- **Frontend:** React 18 + Inertia.js
- **Base de datos:** MySQL local / PostgreSQL producción
- **Arquitectura:** Multi-tenant por fila (`tenant_id` en todas las tablas)

---

## 🏗️ Arquitectura de Módulos

### Core

- `tenants`, `users`, `tenant_users`
- `branches`, `rooms`
- `doctors`, `patients`

### Agenda

- `availabilities`
- `appointments`

### Clínica

- `session_types`
- `treatments`
- `treatment_sessions`

### Pagos

- `payment_transactions`
- `debts`
- `payment_allocations`
- `webhook_events`

### Facturación (DTE)

- `company_settings`
- `invoices`
- `invoice_items`

### Planes

- `plans`
- `patient_plans`
- `plan_session_consumptions`

### Comisiones y Liquidaciones

- `doctor_commission_rates`
- `payrolls`
- `payroll_details`

### Ficha Médica

- `medical_records` (1:1 con paciente)
- `clinical_notes` (N por sesión/consulta)
- `medical_attachments`
- `vital_signs`

### Auditoría

- `activity_logs`

---

## 📋 Migraciones

- Todas las tablas usan **BIGINT UNSIGNED** para IDs.
- Índices compuestos `(tenant_id, id)` en tablas padre para soportar FKs multi-tenant.
- Orden de migraciones dividido en packs (core, agenda, clínica, pagos, DTE, planes, comisiones, ficha).

---

## 🌱 Seeders

Seeder principal: `TenantWithDemoDataSeeder`

- 1 tenant demo
- 4 usuarios (admin, recepción, kine, finanzas)
- 3 rooms, 4 doctores, 50 pacientes
- 5 tipos de sesión
- Comisiones por doctor/tipo
- Company settings demo (DTE/WebPay)
- Disponibilidades, citas, tratamientos, atenciones (80+)
- Pagos, deudas, boletas emitidas
- Planes y consumo
- Notas clínicas SOAP y vitales
- Payrolls y webhook de ejemplo

---

## 🏭 Factories

- Trait `ForTenant` para setear `tenant_id`
- Factories para todos los modelos (tenant, user, doctor, patient, session_type, treatment, treatment_session, appointment, plan, invoice, etc.)
- Permiten generar un tenant completo con datos consistentes para testing automatizado

---

## 🔑 Próximos Pasos

- Endpoints REST/Controllers para agenda, atenciones, pagos y facturación
- Vistas Inertia/React para:
  - Agenda visual (calendario)
  - Gestión presencial (check-in, atenciones del día)
  - Pagos en línea (WebPay)
  - Planes y convenios
  - Ficha médica
- Integraciones externas:
  - **WebPay**: pagos en línea
  - **DTE (SII/LibreDTE)**: boletas y facturas
  - **IMED** (futuro): convenios médicos

---

## 👩‍💻 Desarrollo

- Migrar con:
  ```bash
  php artisan migrate --seed
  ```
