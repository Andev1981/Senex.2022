import { r as i, j as S, a as e, H as N } from "./app-12bcd6c7.js";
import "./moment-a9aaa855.js";
import { A as q } from "./AuthenticatedLayout-d4b70ab6.js";
import { S as C } from "./SideModal-ae473660.js";
import { M as s } from "./Modal-277e3c1b.js";
import K from "./AttendancesHeader-47529fe2.js";
import L from "./AttendacesTable-73396047.js";
import U from "./Kpis-c736440c.js";
import $ from "./CancelModal-15cbb9d6.js";
import k from "./StartModal-dd8516e6.js";
import z from "./CompletedModal-a2cf6109.js";
import B from "./AbsentModal-d1399fd6.js";
import F from "./DteModal-6384c418.js";
import G from "./ResumeModal-8f79bf76.js";
import J from "./CreateUpdateModal-1481d5e3.js";
import "./index-a8363777.js";
import "./ReactToastify-1623b027.js";
import "./index-88056f3d.js";
import "./parse-c3570fb2.js";
import "./user-ea094aa6.js";
import "./createLucideIcon-c38b0f54.js";
import "./chevron-down-f8f13556.js";
import "./log-out-2dedacc5.js";
import "./house-b7fbe7bd.js";
import "./users-32d538cb.js";
import "./stethoscope-b78ba413.js";
import "./list-1dddfca2.js";
import "./file-text-21840ea5.js";
import "./calendar-2ca7eb70.js";
import "./dollar-sign-6797ba38.js";
import "./chevron-right-6b5a26ad.js";
import "./dialog-dee56832.js";
import "./description-fdafa377.js";
import "./with-selector-cfe602ea.js";
import "./plus-f8221267.js";
import "./TablePagination-5499487e.js";
import "./index-7381f437.js";
import "./utils-612d3095.js";
import "./status-cf46609b.js";
import "./circle-check-big-ba4cd303.js";
import "./circle-alert-a47d851b.js";
import "./clock-7b9ed972.js";
import "./ellipsis-vertical-c73ba049.js";
import "./clipboard-d3315c63.js";
import "./search-336bc787.js";
import "./funnel-6899d4f4.js";
import "./circle-x-53ddb98c.js";
import "./arrow-up-d8663621.js";
import "./circle-check-64a9da37.js";
import "./timer-ab36383c.js";
import "./clinicalData-0b95680b.js";
import "./SearchSelect-4fa8c496.js";
import "./InputError-42e5705f.js";
function Oe({
  atenciones: w = [],
  kpis: u = {},
  filtros: _ = {},
  patients: x = [],
  doctors: E = [],
  session_types: b = [],
}) {
  const [A, r] = i.useState(!1),
    [g, l] = i.useState(!1),
    [y, p] = i.useState(!1),
    [T, d] = i.useState(!1),
    [v, m] = i.useState(!1);
  i.useState(!1);
  const [M, n] = i.useState(!1),
    [R, c] = i.useState(!1),
    [t, o] = i.useState({
      session_id: "",
      treatment_id: "",
      patient_id: "",
      doctor_id: "",
      session_type_id: "",
      patient_full_name: "",
      patient_rut: "",
      patient_phone: "",
      doctor_full_name: "",
      name_session_type: "",
      session_type_base_price: 0,
      date: "",
      formated_date: "",
      time: "",
      duration: 45,
      status: "scheduled",
      patient_amount_clp: 0,
      total_payment: 0,
      plan_session_value: 0,
      copay_clp: 0,
      consumes_plan: void 0,
      patient_plan_id: "",
      patient_plan: "",
      pain_before: 0,
      pain_after: 0,
      rom_flexion: "",
      rom_abduction: "",
      rom_rotation: "",
      techniques: [],
      exercises: [],
      notes: "",
      homework: "",
      next_goals: "",
      month_session_number: "",
      session_absent_notes: "",
      session_cancellation_notes: "",
      session_start_notes: "",
    }),
    W = (a) => {
      o(a), l(!0);
    },
    D = (a) => {
      o(a), c(!0);
    },
    j = (a) => {
      o(a), p(!0);
    },
    H = (a) => {
      o(a), r(!0);
    },
    f = (a) => {
      o(a), d(!0);
    },
    I = (a) => {
      o(a), m(!0);
    },
    h = () => {
      o([]), n(!0);
    };
  return S(q, {
    children: [
      e(N, { title: "Atenciones" }),
      S("div", {
        className: "min-h-screen p-4 bg-gray-50",
        children: [
          e(K, { openCreateSessionModal: h }),
          e(U, { kpis: u, filtros: _ }),
          e(L, {
            atenciones: w,
            filtros: _,
            kpis: u,
            openCreateSessionModal: h,
            openEditSessionModal: (a) => {
              o(a), n(!0);
            },
            openStartModal: W,
            openCompletedModal: D,
            openCancelModal: H,
            openAbsentModal: j,
            openDTEModal: f,
            openResumenModal: I,
          }),
          e(s, {
            open: y,
            onClose: () => p(!1),
            title: "Modal de Marcar Ausente",
            maxWidth: "lg",
            children: e(B, {
              sessionData: t,
              setShowAbsentModal: p,
              setSessionData: o,
            }),
          }),
          e(s, {
            open: A,
            onClose: () => r(!1),
            title: "Modal de Cancelación",
            maxWidth: "xl",
            children: e($, {
              sessionData: t,
              setSessionData: o,
              setShowCancelModal: r,
            }),
          }),
          e(C, {
            open: R,
            onClose: () => c(!1),
            title: "Modal de Marcar Completado",
            width: "4xl",
            children: e(z, {
              sessionData: t,
              setShowCompletedModal: c,
              setSessionData: o,
            }),
          }),
          e(C, {
            open: M,
            onClose: () => n(!1),
            title: t != null && t.id ? "✏️ Editar Sesión" : "📋 Nueva Atención",
            description:
              t != null && t.id
                ? `Editando sesión para ${t.paciente}`
                : "Registra una nueva sesión seleccionando paciente, profesional y tipo",
            width: "4xl",
            children: e(J, {
              showCreateSessionModal: M,
              setShowCreateSessionModal: n,
              patients: x,
              doctors: E,
              session_types: b,
              sessionData: t,
              setSessionData: o,
            }),
          }),
          e(s, {
            open: T,
            onClose: () => d(!1),
            title: "Modal de Emitir DTE",
            maxWidth: "lg",
            children: e(F, {
              sessionData: t,
              setShowDTEModal: d,
              setSessionData: o,
            }),
          }),
          e(s, {
            open: v,
            onClose: () => m(!1),
            title: "Modal de Emitir DTE",
            maxWidth: "lg",
            children: e(G, {
              sessionData: t,
              setShowResumenModal: m,
              openDTEModal: f,
            }),
          }),
          e(s, {
            open: g,
            onClose: () => l(!1),
            title: "Modal de Iniciar Sesión",
            maxWidth: "lg",
            children: e(k, {
              sessionData: t,
              setShowStartModal: l,
              setSessionData: o,
            }),
          }),
        ],
      }),
    ],
  });
}
export { Oe as default };
