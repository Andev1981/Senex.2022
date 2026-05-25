# 🧠 MEMORY: SENEX STATE INDEX

## 📍 CURRENT PROJECT STATE
- **Transition Status:** Successfully migrated from previous Gemini session.
- **Architectural Reference:** Guided by `GEMINI.md` (Abril 2026).
- **Core Status:** 
  - Laravel 12 / React 19 / Inertia 2.0 system active.
  - Multi-business user management refactored and active.
  - Standalone POS flow active (restricted via `RedirectCajero` middleware).
  - Queued notifications enabled for system stability.
  - DevLab hidden section active for SII Real Issuance and Accounts Payable.
  - **New Feature:** Removed weekly view, made inactive month calendar days ultra-compact (min-h-[50px]) on mobile, bypassed check-in with a direct "Atender Paciente" green button for kines, introduced a horizontal upcoming appointments carrusel at the top of "Mis Pacientes", and replaced the invasive collapsible SOAP session details with a clean React Info Modal on mobile.
  - **Security:** Expanded `role:admin|superadmin|cajero|kine` in web routes to allow schedule creation and quick-patient additions from the kine perspective.

## 📋 ACTIVE TASK
- **Status:** Completed. Removed weekly view, made inactive month calendar days ultra-compact (min-h-[50px]) on mobile, bypassed check-in for direct clinical SOAP forms, added upcoming appointments carousel on My Patients, and refactored SOAP header info into overlay modal.

## ⏳ PENDING TASK BACKLOG
- [ ] Auditoría de Liquidaciones (Payroll) y Comisiones.
- [ ] Awaiting developer instruction for next task.
