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

### 🚀 Migración de Datos (Legacy)
Se ha implementado un motor de migración robusto para importar datos desde SQL dumps antiguos (`old-db`).

- **Seeder:** `LegacyDataMigrationSeeder` implementado y ejecutado.
- **Entidades Migradas:**
    - **Usuarios & Roles:** Mapeo de perfiles y asignación de roles mediante Spatie.
    - **Pacientes & Doctores:** Perfiles creados con vinculación a direcciones polimórficas.
    - **Estructura Clínica:**
        - `applications` -> `Treatments`.
        - `apply_items` -> `TreatmentSessions` + `InvoiceItems`.
    - **Finanzas:** Cruce de `payment_incomes` con `apply_items` para generar `Payments` y `PaymentAllocations` precisos.
    - **Contactos:** Migración de `keepers` a `PatientContacts`.

### ⚙️ Refactorización & Calidad
- **Enums Estrictos:** Modelos `Treatment` y `TreatmentSession` migrados 100% a `TreatmentStatusEnum` y `AppointmentStatusEnum`.
- **Rutas:** Estandarización de rutas frontend a kebab-case (ej: `attendances/index`).
- **Database:** Reseteo completo (`migrate:fresh --seed`) realizado exitosamente en Enero 2026.

## 💡 NOTAS TÉCNICAS

- **Deuda del Paciente:** Se calcula sumando `Invoice` con estado `unpaid`/`partial` menos los pagos asignados en `payment_allocations`.
- **Inertia:** Rutas estandarizadas a kebab-case.

## 📝 PRÓXIMOS PASOS (Roadmap)

- [x] Implementar la lógica de "Re-enviar Notificación" desde el detalle de la sesión.
- [x] Revisar el cierre automático de tratamientos tras alcanzar el `total_sessions`.
- [x] Migración de datos históricos desde SQL dumps (`LegacyDataMigrationSeeder`).
- [ ] Verificar consistencia de direcciones migradas (Posible issue con parseo de SQL).
- [ ] Implementar dashboard financiero consolidado usando los nuevos modelos de `Invoice`.