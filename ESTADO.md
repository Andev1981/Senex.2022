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

## 📍 ESTADO ACTUAL: SISTEMA REFACTORIZADO (Marzo 2026)

### 🛡️ Nueva Arquitectura de Pagos & DTE
- **Eliminación de Deuda (Debt):** La deuda ahora es una `Invoice` con estado `payment_status = 'unpaid'`.
- **Integración Transbank (En curso):**
    - **Flujo de Certificación:** Implementado checkout público de productos (`/certificacion/webpay/checkout`) para validación ante Transbank sin requerir login.
    - **Log de Certificación:** Sistema de log dedicado en `storage/logs/transbank_certification.log` con formato "copy-paste" para el formulario técnico.
    - **Fixes Críticos:** Unificación de firma SDK v5 y corrección de ENUM `payment_method` en la base de datos.
- **Consistencia de Datos:** Todos los montos CLP son `bigInteger`.
- **Dashboard Financiero:** Implementado en `ReportsController` con métricas de Flujo de Caja (6 meses), Cuentas por Cobrar (Receivables), Pendientes de Facturación y Estados DTE (SII).

### 🚀 Ciclo de Vida & Operación (Nuevas Reglas)
1.  **Cierre Automático de Tratamientos:** Implementado `TreatmentSessionObserver` para actualizar `completed_sessions` y cerrar tratamientos al alcanzar `total_sessions`.
2.  **Gestión de Cupos:** 
    - Implementado botón **"+5 Sesiones"** en frontend para ampliación rápida cuando hay sobrecupo.
    - Soporte para **Sesiones Indefinidas** (`is_indefinite`) con visualización de símbolo **∞**.
3.  **Atención Domiciliaria (Home Care):**
    - Nueva bandera `is_home_care_only` en sucursales.
    - Frontend bloquea switch "A Domicilio" en ON y obliga a ingresar dirección si la sucursal lo requiere.
4.  **Validación Inteligente de Pacientes:**
    - Detección precisa de edad (Día/Mes/Año).
    - Menores de 18 activan automáticamente `require_tutor: true` y `marital_status: 'single'`.
    - Mayores de 18 desactivan tutor automáticamente.
5.  **Notificaciones:** Separación de Recordatorios Operativos y Notificación de Bienvenida (independientes).

### 📦 Migración & Enriquecimiento de Datos
- **Seeder:** `LegacyDataMigrationSeeder` corregido para incluir campos de `detail` (dirección) y mapeo de comunas ("Santiago Centro").
- **Smart RUT Enrichment:** Comando `migration:enrich-ruts` implementado para generar un mapa JSON (`rut_mapping.json`) con nombres y RUTs temporales para corrección manual/API sin tocar los dumps originales.
- **Tratamientos Legacy:** Todos los tratamientos migrados se establecen como `is_indefinite: false` y `total_sessions = completed_sessions` para permitir pruebas del sistema de ampliación de cupos.

### ⚙️ Calidad & UI
- **Inertia Flash:** Corregida la redirección tras registro exitoso compartiendo el objeto `patient` en las props de Inertia.
- **UI UX:** Inputs de ubicación (Santiago/RM) predefinidos por defecto para agilizar el alta en flujo de domicilio.

## 💡 NOTAS TÉCNICAS
- **Location Default:** RM (13), Santiago (2401), Santiago Centro (13101).
- **Tratamientos Activos:** Aquellos con sesiones en 2025 o 2026 se mantienen `in_progress` tras migrar.

## 📝 PRÓXIMOS PASOS (Roadmap)

- [ ] **Certificación SII:**
    - Implementar Set de Pruebas (Casos 1-10) en ambiente de certificación.
    - Verificar carga de Folios Autorizados (`dte_authorized_folios`).
    - Validar JSON de exportación para Boletas/Facturas Exentas de Salud.
- [ ] **Refinar Búsqueda de RUT:** Conectar `RutSearchService` con API oficial (Sinacofi/Equifax) si se requiere automatización total.
- [ ] **Reportes Médicos:** Implementar generación de PDF de Epicrisis basado en el historial unificado.
- [ ] **Operación Móvil:** Adaptar el formulario de sesión para uso de Kines en terreno (Offline-first prep).
