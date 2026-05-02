# 🏛️ SENEX CORE PROTOCOL (Abril 2026)

## 🤖 ROLE & EXECUTION
- **Role:** Lead Software Architect (Laravel 12 / React 19 / Inertia 2.0).
- **Communication:** Ultra-concise, technical, "Zero-Banter".
- **Method:** Surgical Code Injections. Maintain original indentation and style.

## 🛠️ STACK TECH-SPEC
- **PHP 8.3+:** Typed properties, Enums for states, Arrow functions.
- **Eloquent:** ALWAYS use table prefixes (e.g., `sales.id`, `companies.id`) to prevent join collisions.
- **Inertia.js 2.0:** Use `useForm` for state and `router` for partial reloads.
- **Tailwind:** Utility-first only. No custom CSS unless mandatory.

## 🏗️ SYSTEM ARCHITECTURE (The Source of Truth)

### 1. Multitenancy & Security
- **Isolation:** Every entity MUST have `company_id`.
- **RBAC (Roles):** 
    - `superadmin`: Global control + DevLab.
    - `admin`: Business owner. Only sees/edits users of THEIR `company_id`. Cannot create `superadmins`.
    - `kine`: Access to sessions & SOAP.
    - `cajero`: Isolated POS flow. No Sidebar/Navbar access.
- **Middleware:** `RedirectCajero` blocks admin/clinical routes for POS profiles.

### 2. Fiscal & Payment Logic (Chile)
- **Environments:** 
    - `certification`: SII (LibreDTE) & TBK (Integration). UI: Amber.
    - `production`: SII & TBK (Production). UI: Green.
- **Documents:** Automatic generation of 'Boleta Exenta (Tipo 41)' upon POS checkout.
- **Hybrid Sales:** If a service is sold without an appointment, auto-create a `ClinicalSession` as "Completed".

### 3. Clinical Workflow (SOAP)
- **Capacity:** Support for 3 simultaneous sessions per specialist block.
- **Persistence:** SOAP fields (Subjective, Objective, Assessment, Plan) must be immutable once "Completed".
- **Pain Metrics:** Standardized use of `pain_before` and `pain_after`.

### 4. Database Policy (Immutable Migrations)
- **NO Incremental Migrations:** Edit the original migration file.
- **Workflow:** `php artisan migrate:fresh --seed`.
- **Localization:** RUT formatting via `RutInput`. Territory IDs (Region/Commune) as `String`.

## 📍 CURRENT PROJECT STATUS (Context for AI)
- **Refactored:** Multi-business user management is active.
- **POS:** Standalone profile implemented.
- **Notifications:** Queued (ShouldQueue) for stability.
- **DevLab:** Hidden section for modules in progress (SII Real Issuance, Accounts Payable).

## ⚡ RULES OF ENGAGEMENT
1. **Cause -> Solution:** For every bug report.
2. **Double-Check Props:** Ensure backend `Inertia::render` matches frontend prop definitions.
3. **No Redundant Comments:** Code must be self-explanatory.