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

> **Regla de Oro:** El "Modo Entrenamiento" es una bandera adicional que, al estar activa, fuerza el ambiente a `certification` y genera TrackIDs ficticios ("SIM-XXXX") sin conectar con el SII.

---

## 📍 ESTADO ACTUAL: SISTEMA MULTI-NEGOCIO REFACTORIZADO

### 🛡️ Nueva Arquitectura de Pagos & DTE
- **Certificados Digitales (SII):**
    - **Extracción Nativa:** Uso de `sasco/LibreDTE` para obtener el RUT del firmante (`getID()`).
    - **Acteco:** Implementado campo de Código de Actividad Económica en la configuración de la empresa y su mapeo al XML.
- **Motor de Emisión Inteligente:**
    - **Hibridación B2B/B2C:** El sistema decide automáticamente entre Factura (33/34) y Boleta (39/41) detectando el tipo de receptor.
    - **Maestro de Clientes Empresa:** Transformada la tabla `company_directories` en un repositorio B2B completo (RUT, Razón Social, Giro, Dirección).
    - **Integridad Contable:** Sincronización forzada entre el Monto del Pago y el `total_amount_clp` de la factura, prorrateando descuentos globales para cuadratura ante el SII.
- **Trazabilidad:** Sistema de logs detallado en `laravel.log` para cada paso del flujo `issueInvoiceDte` (Folio -> Payload -> Firma -> Envío).

### 🏢 Gestión Multipropósito (Camaleónica)
- **Perfiles de Empresa:** Implementado `business_type` (`clinical`, `service`, `retail`).
- **Sidebar & UI Dinámica:** Ocultamiento automático de módulos clínicos y transformación de labels ("Pacientes" a "Clientes") según el giro.
- **Catálogo Jerárquico:** 
    - Implementado Maestro de Categorías y Subcategorías con visualización en árbol.
    - Soporte polimórfico para `Product` y `SessionType` en la misma factura.
    - Tipificado de ítems: `product` (con stock) vs `service` (intangible).

### 💳 Caja / POS (Punto de Venta)
- **UI/UX Moderno:** Selector de pagos tipo Toggle (💳 POS vs 💵 Efectivo) con **POS Integrado como predeterminado**.
- **Lógica de Venta:** 
    - Soporte real para cantidades (`quantity`) y precios unitarios en el cálculo del DTE.
    - Descuento comercial con campo obligatorio de "Motivo" para auditoría.
    - Validación dinámica de existencia de clientes (Persona/Empresa) con prefijos de ID.
- **Integración Transbank POS:** Lógica real preparada (comentada) para comunicación con el terminal físico vía HTTP.

### 🐛 Fixes Críticos Recientes:
- **Polimorfismo:** Corregido MorphMap en `AppServiceProvider` para `CorporateClient` y `Patient`.
- **Base de Datos:** Eliminadas referencias a columnas inexistentes (`uuid`, `session_type_id`).
- **Relaciones:** Corregida relación `User -> Company` a `belongsTo` para evitar error de `user_id` en tabla `companies`.
- **Contexto:** Implementado auto-descubrimiento de Sucursal Activa en el Middleware global para evitar pantallas vacías.

---

## 🚀 PRÓXIMOS PASOS (MAÑANA)
- [ ] **Certificación SII:** Realizar la primera emisión real del Tipo 34 (Factura Exenta) en ambiente de certificación.
- [ ] **Dashboard Home:** Adaptar las métricas de la página principal para ocultar lo clínico si la empresa es de Software.
- [ ] **PDF Personalizado:** Adaptar el formato de la Boleta/Factura para que no sea estrictamente clínico (quitar "Kinesiólogo", "Tratamiento").
