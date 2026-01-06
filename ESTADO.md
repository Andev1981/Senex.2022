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

## 📝 TAREA ACTUAL (Próximos Pasos)

- [ ] Implementar la visualización del `pain_map` histórico en la línea de tiempo del paciente.
- [ ] Conectar la lógica de "Aprobar Liquidación" con el envío automático de notificación al profesional.
- [ ] Refinar los permisos de edición en los campos SOAP una vez que la sesión está marcada como 'attended'.
- [ ] Optimizar la carga inicial de Regiones/Comunas usando lazy loading o cache.

## 💡 NOTAS TÉCNICAS

- **BodySelector:** Almacena datos en JSON (`initial_pain_map` / `session_pain_map`).
- **Sucursales:** Una empresa siempre debe tener una `is_main: true`. Al promover una, la anterior se degrada automáticamente.
- **Layout:** El ancho máximo de los modales clínicos se ajustó a `95vw` para facilitar la interacción con el mapa corporal.