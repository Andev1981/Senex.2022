# 🤖 INSTRUCCIONES PARA LA IA (META-PROMPT)

1. **ROL:** Eres un Arquitecto de Software experto en Laravel 12 (PHP 8.3) y React 19 e Inertia.js 2.0.
2. **ESTILO:** Respuestas extremadamente breves y técnicas ("Show, don't tell").
3. **MODIFICACIONES QUIRÚRGICAS:** Es fundamental atacar únicamente las líneas de código que corresponden a la tarea solicitada. Evitar refactorizaciones masivas.
4. **CÓDIGO:** Usa siempre sintaxis moderna: Arrow Functions, Null Safe Operator (`?->`), Enums y TailwindCSS.
5. **REGLA DE ORO:** Al hacer SQL/Eloquent, SIEMPRE prefija las columnas (`patients.id` en vez de `id`) para evitar conflictos en Joins.
6. **FORMATO:** Si hay error, usa: "Causa -> Solución".

---

# PROYECTO: Sistema de Gestión Clínica & Comercial (Enterprise)

## 🌐 ARQUITECTURA DE AMBIENTES (INMUTABLE)
Para evitar fragmentación técnica, el sistema utiliza un estándar único de dos estados que se mapean automáticamente a los proveedores (SII/Transbank):

| Concepto App | Enum / DB | SII (LibreDTE) | Transbank (Webpay) | Visual (UI) |
| :--- | :--- | :--- | :--- | :--- |
| **Pruebas** | `certification` | `certification` | `integration` | Amber (Certificación) |
| **Real** | `production` | `production` | `production` | Green (Producción) |

---

## 📍 ESTADO ACTUAL: SISTEMA MULTI-NEGOCIO REFACTORIZADO

### 🔑 Control de Accesos & Seguridad Enterprise (Abril 2026)
- **Empoderamiento del Administrador de Empresa:** 
    - Se habilitó la sección de **Gestión de Usuarios** para el rol `admin`.
    - **Aislamiento Multitenant:** Los administradores ahora pueden crear y editar usuarios, pero restringidos exclusivamente a su propia compañía y sus sucursales.
    - **Jerarquía de Roles:** Restricción de seguridad que impide a un `admin` asignar el rol de `superadmin`. Solo pueden gestionar roles operativos (`kine`, `cajero`, `admin`).
    - **Seguridad en Backend:** Implementada validación cruzada en el controlador para evitar la manipulación de IDs de empresa desde el frontend.
- **Perfil de Caja (POS) Standalone:** 
    - Implementado rol `cajero` con acceso restringido exclusivamente a ventas.
    - **Interfaz POS:** Layout limpio sin Sidebar ni Navbar. Header especializado con botón de Logout y cambio de sucursal.
    - **Seguridad:** Middleware `RedirectCajero` que bloquea el acceso a cualquier ruta administrativa o clínica fuera de la caja.
- **Gestor de Usuarios & Roles:** CRUD integral y matriz de permisos operativa para Superadmin y ahora delegable a Admins de empresa.
- **Liberación de Módulos (Feature Flags):** Pestaña de configuración de módulos disponible exclusivamente para Superadmins para controlar el acceso a funcionalidades por empresa/sucursal.

### 💰 Punto de Venta & Recaudación (POS)
- **Flujos de Pago Operativos:**
    - **Efectivo y Transferencia:** Procesamiento instantáneo con generación de comprobante digital.
    - **Soporte POS Integrado:** Selector dinámico con iconos y estados interactivos.
- **Generación Automática de Documentos:**
    - **Hibridación Clínica:** Si se vende un servicio en caja sin agenda previa, el sistema crea automáticamente la sesión clínica marcada como "Completada".
    - **Integridad:** Sincronización forzada entre el pago y la boleta exenta (Tipo 41).
- **Recaudación Manual:** Habilitado botón de "Registrar Pago" en la ficha del paciente para liquidar deudas históricas.

### 📋 Gestión de Pacientes & Localización
- **Registro Rápido Optimizado:** Integración de `RutInput` (formateo automático) y captura de teléfono/email obligatorios para notificaciones.
- **Persistencia Geográfica:** Corregidos selectores de Región, Provincia y Comuna. Ahora guardan y cargan el árbol completo de localización mediante normalización de IDs a String.
- **Manejo Multi-Sucursal:** Lógica de "Actualizar o Crear + Vincular" que permite que un paciente de la "Sucursal A" sea reconocido y vinculado automáticamente al ser atendido en la "Sucursal B" sin errores de RUT duplicado.

### 🏥 Evolución Clínica & SOAP
- **Capacidad Multi-Sesión:** Los especialistas ahora pueden tener hasta **3 sesiones simultáneas** en el mismo bloque horario (ideal para uso de máquinas).
- **Persistencia SOAP:** Sincronización total de datos clínicos (Subjetivo, Objetivo, Evaluación, Plan). Corregido error de visualización al editar sesiones completadas.
- **Métricas de Dolor:** Unificación de `pain_level` y `pain_before/after` para consistencia en reportes y Dashboard.

### ✉️ Notificaciones Profesionales
- **Envío Híbrido (Respaldo en Cola):** Se restauró el uso de `ShouldQueue` para las notificaciones de bienvenida de pacientes y tutores. Esto asegura que si el envío automático falla o es lento, la notificación permanezca en la cola (`jobs`) para ser reintentada, evitando la pérdida del mensaje.
- **Identidad Corporativa:** Plantillas HTML con **Logo de la Empresa** y diseño premium para Pacientes y Tutores.
- **Lógica de Preferencias:** Corregida la inversión del flag `opt_out_reminders`. El sistema ahora respeta fielmente los interruptores de la interfaz.

### 🛠️ Laboratorio de Desarrollo (DevLab)
- **Aislamiento Superadmin:** Creada sección "Laboratorio Dev" en el menú lateral para ocultar módulos en construcción (Cuentas por cobrar, Proveedores, Adquisiciones, Facturación SII) a usuarios finales.

---

## 🚀 PRÓXIMOS PASOS
- [ ] **Módulo SII:** Habilitar la emisión real de Boletas Electrónicas (Tipo 41) vinculando el servicio de facturación con el cierre de caja.
- [ ] **Ajustes de Precios:** Implementar reglas de precios por sucursal (Branch-specific pricing).
- [ ] **Reporte de Caja:** Vista de cierre diario para el perfil de cajero.
