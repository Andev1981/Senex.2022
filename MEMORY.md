# 🧠 MEMORY: SENEX STATE INDEX

## 📍 CURRENT PROJECT STATE
- **Transition Status:** Successfully migrated and synchronized.
- **Architectural Reference:** Guided by `GEMINI.md` (Abril 2026).
- **Core Status:** 
  - Laravel 12 / React 19 / Inertia 2.0 system active.
  - Multi-business user management refactored and active.
  - Standalone POS flow active (restricted via `RedirectCajero` middleware).
  - Queued notifications enabled for system stability.
  - DevLab hidden section active for SII Real Issuance and Accounts Payable.
  - **Agenda Interface:** Omitted Month View entirely. Implemented **Week View as default** with high-fidelity week grid on desktop and an ultra-compact **Vertical Week List** on mobile (where inactive days without availability/citas are reduced to a thin `min-h-[44px]` gray banner).
  - **Clinical Workflows:** Bypassed check-in with a direct "Atender Paciente" green button for kines, introduced a horizontal upcoming appointments carousel at the top of "Mis Pacientes", and replaced the invasive collapsible SOAP session details with a clean React Info Modal on mobile.
  - **Security:** Expanded `role:admin|superadmin|cajero|kine` in web routes to allow schedule creation and quick-patient additions from the kine perspective.

## 📋 ACTIVE TASK
- **Status:** Completed. Optimized weekly view (mobile vertical list with compressed inactive days, desktop 8-column hourly grid), removed monthly calendar view option entirely, bypassed check-in for direct clinical SOAP forms, added upcoming appointments carousel on My Patients, and refactored SOAP header info into overlay modal.

## ⏳ PENDING TASK BACKLOG
- [ ] Auditoría de Liquidaciones (Payroll) y Comisiones.
