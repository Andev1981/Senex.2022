import { a as e, j as r } from "./app-12bcd6c7.js";
import { f as p, a as c } from "./utils-612d3095.js";
import { e as t, a as u } from "./status-cf46609b.js";
import "./index-a8363777.js";
import "./circle-check-big-ba4cd303.js";
import "./createLucideIcon-c38b0f54.js";
import "./circle-alert-a47d851b.js";
function f({ color: l, text: d }) {
  return e("span", {
    className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${l}`,
    children: d,
  });
}
function g({ sessionData: l, setShowResumenModal: d, openDTEModal: m }) {
  return e("div", {
    className: "p-6 bg-white rounded-xl",
    children: r("div", {
      className: "space-y-4",
      children: [
        r("div", {
          className: "p-4 border-2 border-blue-200 rounded-lg bg-blue-50",
          children: [
            e("h4", {
              className: "mb-2 text-sm font-bold text-blue-900",
              children: "Paciente",
            }),
            e("p", {
              className: "text-lg font-bold text-blue-900",
              children: l == null ? void 0 : l.patient_full_name,
            }),
            r("p", {
              className: "text-sm text-blue-700",
              children: ["RUT: ", l == null ? void 0 : l.patient_rut],
            }),
            r("p", {
              className: "text-sm text-blue-700",
              children: ["Tel: ", l == null ? void 0 : l.patient_phone],
            }),
          ],
        }),
        r("div", {
          className: "p-4 border-2 border-gray-200 rounded-lg",
          children: [
            e("h4", {
              className: "mb-3 text-sm font-bold text-gray-900",
              children: "Información de la Sesión",
            }),
            r("div", {
              className: "space-y-2 text-sm",
              children: [
                r("div", {
                  className: "flex justify-between",
                  children: [
                    e("span", {
                      className: "text-gray-600",
                      children: "Fecha:",
                    }),
                    e("span", {
                      className: "font-semibold",
                      children: p(l == null ? void 0 : l.date),
                    }),
                  ],
                }),
                r("div", {
                  className: "flex justify-between",
                  children: [
                    e("span", {
                      className: "text-gray-600",
                      children: "Hora:",
                    }),
                    e("span", {
                      className: "font-semibold",
                      children: l == null ? void 0 : l.time,
                    }),
                  ],
                }),
                r("div", {
                  className: "flex justify-between",
                  children: [
                    e("span", {
                      className: "text-gray-600",
                      children: "Profesional:",
                    }),
                    e("span", {
                      className: "font-semibold",
                      children: l == null ? void 0 : l.doctor_full_name,
                    }),
                  ],
                }),
                r("div", {
                  className: "flex justify-between",
                  children: [
                    e("span", {
                      className: "text-gray-600",
                      children: "Tipo:",
                    }),
                    e("span", {
                      className: "font-semibold capitalize",
                      children: l == null ? void 0 : l.name_session_type,
                    }),
                  ],
                }),
                r("div", {
                  className: "flex justify-between",
                  children: [
                    e("span", {
                      className: "text-gray-600",
                      children: "Estado:",
                    }),
                    e(f, {
                      color: t(l == null ? void 0 : l.status),
                      text: u(l == null ? void 0 : l.status),
                    }),
                  ],
                }),
                r("div", {
                  className: "flex justify-between",
                  children: [
                    e("span", {
                      className: "text-gray-600",
                      children: "Sucursal:",
                    }),
                    e("span", {
                      className: "font-semibold",
                      children: l == null ? void 0 : l.sucursal,
                    }),
                  ],
                }),
                r("div", {
                  className: "flex justify-between",
                  children: [
                    e("span", {
                      className: "text-gray-600",
                      children: "Sala:",
                    }),
                    e("span", {
                      className: "font-semibold",
                      children: l == null ? void 0 : l.sala,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        r("div", {
          className: "p-4 border-2 border-purple-200 rounded-lg bg-purple-50",
          children: [
            e("h4", {
              className: "mb-3 text-sm font-bold text-purple-900",
              children: "Información de Pago",
            }),
            r("div", {
              className: "space-y-2 text-sm",
              children: [
                r("div", {
                  className: "flex justify-between",
                  children: [
                    e("span", {
                      className: "text-purple-700",
                      children: "Copago:",
                    }),
                    e("span", {
                      className: "font-semibold text-purple-900",
                      children: c(l == null ? void 0 : l.copay_clp),
                    }),
                  ],
                }),
                r("div", {
                  className: "flex justify-between",
                  children: [
                    e("span", {
                      className: "text-purple-700",
                      children: "Total:",
                    }),
                    e("span", {
                      className: "font-semibold text-purple-900",
                      children: c(l == null ? void 0 : l.patient_amount_clp),
                    }),
                  ],
                }),
                r("div", {
                  className: "flex justify-between",
                  children: [
                    e("span", {
                      className: "text-purple-700",
                      children: "Pagado:",
                    }),
                    e("span", {
                      className: "font-semibold text-purple-900",
                      children: c(l == null ? void 0 : l.total_payment),
                    }),
                  ],
                }),
                (l == null ? void 0 : l.patient_amount_clp) -
                  (l == null ? void 0 : l.total_payment) >
                  0 &&
                  r("div", {
                    className:
                      "flex justify-between pt-2 border-t border-purple-300",
                    children: [
                      e("span", {
                        className: "font-bold text-purple-900",
                        children: "Saldo:",
                      }),
                      e("span", {
                        className: "font-bold text-purple-900",
                        children: c(
                          (l == null ? void 0 : l.patient_amount_clp) -
                            (l == null ? void 0 : l.total_payment)
                        ),
                      }),
                    ],
                  }),
              ],
            }),
          ],
        }),
        r("div", {
          className: "flex gap-2",
          children: [
            ["completed", "scheduled"].includes(
              l == null ? void 0 : l.status
            ) &&
              e("button", {
                onClick: () => {
                  d(!1), m(l);
                },
                className:
                  "flex-1 px-4 py-2 font-semibold text-purple-700 border-2 border-purple-200 rounded-lg hover:bg-purple-50",
                children: "Emitir DTE",
              }),
            e("button", {
              onClick: () => {
                d(!1);
              },
              className:
                "px-4 py-2 font-semibold text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50",
              children: "Cerrar",
            }),
          ],
        }),
      ],
    }),
  });
}
export { g as default };
