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
- **Localization:** RUT formatting via `RutInput`. Territory IDs (Region/Commune) as `unsignedBigInteger` foreign keys.
- **Geographic Defaults:** Default Region (13) and Commune (13114) for fast clinical data entry (Provinces removed).
- **Branch Strategy:** Branches store physical address directly and define allowed modalities (onsite, home, online).
- **Specialist Capacity:** Strictly 3 simultaneous sessions per specialist. Box selection is optional to allow "Freedom of Boxes" supervision.

## 📍 CURRENT PROJECT STATUS (Context for AI)
- **Refactored:** Multi-business user management is active.
- **POS:** Standalone profile implemented.
- **Notifications:** Queued (ShouldQueue) for stability.
- **DevLab:** Hidden section for modules in progress (SII Real Issuance, Accounts Payable).

## ⚡ RULES OF ENGAGEMENT
1. **Cause -> Solution:** For every bug report.
2. **Empirical Validation Protocol (EVP):** Every code change MUST be followed by a verification command (`git diff`, `grep`, or `artisan test`). Do NOT report a task as "Done" without displaying the proof of change.
3. **Memory Management Protocol:**
    - **GEMINI.md:** Source of behavioral truth and architectural rules.
    - **MEMORY.md:** Live index of pending tasks and current project state.
    - **HISTORY.md:** Immutable audit trail. Update only AFTER successful EVP verification.
4. **Full-Stack Vertical Slice:** Every adjustment MUST be implemented across the entire flow: DB Schema -> Eloquent Models -> Backend Logic/Services -> Validation Rules -> Frontend UI (Inertia/React).
5. **Double-Check Props:** Ensure backend `Inertia::render` matches frontend prop definitions.
6. **No Redundant Comments:** Code must be self-explanatory.
7. **Sucursal-Based Modalities:** Modality selections (Presencial/onsite, Online/online, Domicilio/home) must strictly respect active Branch settings (`allows_onsite`, `allows_online`, `allows_home`). If only one modality is active, hide the others globally in all selector views.
8. **Spanish Localization & Helpers:** Never expose English status values (e.g. `scheduled`, `checked_in`, `in_progress`, `completed`, `cancelled`, `no_show`) or modality names (`onsite`, `online`, `home`) to the end-user. Always translate using existing helpers (e.g. `getStatusLabel` or custom dictionaries) or local mappings.
9. **Commit & Traceability Protocol:** Perform a commit after every logical change. Each commit MUST be documented in `HISTORY.md` with its short ID (`git rev-parse --short HEAD`) and a brief description. To avoid "RPC failed" or large push errors, push frequently in small batches. If a push fails, use `git push origin <commit_hash>:2025` to push up to a specific commit.