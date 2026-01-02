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

## 📍 CONTEXTO RECIENTE

- Se solucionó un bug crítico en `AttendancesController` donde los pacientes no cargaban o daban error.
- **Causa:** Ambigüedad de IDs en los `select` (el ID del plan sobreescribía al del paciente).
- **Solución:** Se blindaron las consultas usando `patients.*` y `patient_plans.*` explícitamente.
- El backend ya envía correctamente los datos del paciente y sus planes. Ahora falta conectar las acciones de la UI.
- Se corrigió error `ts(1149)` de casing inconsistente estandarizando importaciones con el alias `@/Pages`.

## 📝 TAREA ACTUAL

- [x] Corregir consulta de Pacientes y Planes activos (DONE).
- [x] Verificar que el cálculo de `sessions_remaining` se visualice correctamente en el Frontend (React).
- [x] Finalizar y mejorar acciones en AttendacesTable.jsx (Frontend).
- [x] Implementar renderizado condicional en botones de acción de AttendacesTable.jsx.
- [x] Corregir título inconsistente en ResumeModal dentro de Index.jsx.
- [x] Verificar configuración de resolución de páginas en app.jsx para evitar errores de migración v1->v2.
- [x] Aplicar lógica condicional en AttendacesTable.jsx para el botón DTE.
- [x] Agregar campo `dte_generated` a `treatment_sessions` (Migración y Modelo).
- [x] Implementar selección múltiple en `AttendacesTable.jsx` para facturación masiva.
- [x] Conectar `DteModal` con backend para emisión individual y masiva.
- [x] Automatizar marcado de `dte_generated` en `DteService` al emitir documentos.

## 💡 NOTAS TÉCNICAS

- Usar `map()` con `?->` y `??` para evitar crashes si faltan datos relacionales.
- No usar `select()` dentro de `with()` si se van a usar Accessors calculados.
- Regla UI: Botón Emitir DTE solo visible si status == Realizada.
- CRÍTICO: Validar Case Sensitivity en rutas (Windows vs Linux).
- Regla de Negocio DTE: Si ya existe DTE, ocultar botón Emitir y mostrar botón Ver/Descargar.
