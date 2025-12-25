import {
  r as d,
  j as a,
  a as e,
  H as k,
  F as L,
  b as s,
} from "./app-12bcd6c7.js";
import { K as j } from "./KineLayout-c0741967.js";
import { A as D } from "./arrow-left-524baaf7.js";
import { P as x } from "./phone-73f20d6a.js";
import { C as _ } from "./calendar-2ca7eb70.js";
import { S as P } from "./stethoscope-b78ba413.js";
import { C as b } from "./clock-7b9ed972.js";
import { A as E } from "./activity-92ec49d9.js";
import { c as A } from "./createLucideIcon-c38b0f54.js";
import { S as I } from "./save-5c41ea60.js";
import { C as o } from "./circle-check-64a9da37.js";
import { C as m } from "./circle-x-53ddb98c.js";
import "./index-a8363777.js";
import "./house-b7fbe7bd.js";
import "./users-32d538cb.js";
import "./user-ea094aa6.js";
import "./log-out-2dedacc5.js";
import "./plus-f8221267.js";
/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $ = [
    ["path", { d: "M13 21h8", key: "1jsn5i" }],
    [
      "path",
      {
        d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
        key: "1a8usu",
      },
    ],
  ],
  F = A("pen-line", $);
function ee({ session: t }) {
  const [h, n] = d.useState(!1),
    [l, p] = d.useState(t.notes || ""),
    [g, i] = d.useState(!1),
    u = {
      Programada: {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: b,
        label: "Programada",
      },
      Completada: {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: o,
        label: "Completada",
      },
      Cancelada: {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: m,
        label: "Cancelada",
      },
    },
    c = u[t.status] || u.Programada,
    N = c.icon,
    f = () => {
      s.visit(route("kine.my-sessions"));
    },
    y = () => {
      t.patient.phone && (window.location.href = `tel:${t.patient.phone}`);
    },
    v = () => {
      confirm("¿Confirmas que completaste esta sesión?") &&
        s.post(
          route("kine.sessions.complete", t.id),
          { notes: l, duration_actual: t.session_type.duration },
          {
            onSuccess: () => {
              s.visit(route("kine.my-sessions"));
            },
          }
        );
    },
    w = () => {
      const r = prompt("Motivo de cancelación:");
      r &&
        s.post(
          route("kine.sessions.cancel", t.id),
          { cancellation_reason: r },
          {
            onSuccess: () => {
              s.visit(route("kine.my-sessions"));
            },
          }
        );
    },
    C = () => {
      i(!0),
        s.put(
          route("kine.sessions.update-notes", t.id),
          { notes: l },
          {
            preserveScroll: !0,
            onSuccess: () => {
              i(!1), n(!1);
            },
            onError: () => {
              i(!1), alert("Error al guardar las notas");
            },
          }
        );
    };
  return a(j, {
    children: [
      e(k, { title: `Sesión - ${t.patient.name}` }),
      a("div", {
        className: "min-h-screen pb-20 bg-gray-50",
        children: [
          e("div", {
            className:
              "sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm",
            children: e("div", {
              className: "px-4 py-4",
              children: a("div", {
                className: "flex items-center gap-3 mb-3",
                children: [
                  e("button", {
                    onClick: f,
                    className:
                      "p-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100",
                    children: e(D, { className: "w-5 h-5" }),
                  }),
                  a("div", {
                    className: "flex-1",
                    children: [
                      e("h1", {
                        className: "text-lg font-bold text-gray-900",
                        children: "Detalle de Sesión",
                      }),
                      e("p", {
                        className: "text-sm text-gray-600",
                        children: new Date(t.date).toLocaleDateString("es-CL", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }),
                      }),
                    ],
                  }),
                  a("span", {
                    className: `px-3 py-1.5 text-xs font-semibold rounded-full border ${c.color}`,
                    children: [
                      e(N, { className: "inline w-4 h-4 mr-1" }),
                      c.label,
                    ],
                  }),
                ],
              }),
            }),
          }),
          a("div", {
            className: "px-4 py-4 space-y-4",
            children: [
              a("div", {
                className: "p-4 bg-white rounded-lg shadow-sm",
                children: [
                  a("div", {
                    className: "flex items-center justify-between mb-4",
                    children: [
                      e("h2", {
                        className: "font-semibold text-gray-900",
                        children: "Paciente",
                      }),
                      t.patient.phone &&
                        a("button", {
                          onClick: y,
                          className:
                            "flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700",
                          children: [e(x, { className: "w-4 h-4" }), "Llamar"],
                        }),
                    ],
                  }),
                  a("div", {
                    className: "space-y-3",
                    children: [
                      a("div", {
                        className: "flex items-center gap-3",
                        children: [
                          e("div", {
                            className:
                              "flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-full bg-gradient-to-br from-teal-400 to-blue-500",
                            children: t.patient.name
                              .split(" ")
                              .map((r) => r[0])
                              .join("")
                              .slice(0, 2),
                          }),
                          a("div", {
                            children: [
                              e("p", {
                                className: "font-semibold text-gray-900",
                                children: t.patient.name,
                              }),
                              e("p", {
                                className: "text-sm text-gray-600",
                                children: t.patient.rut,
                              }),
                            ],
                          }),
                        ],
                      }),
                      t.patient.phone &&
                        a("div", {
                          className:
                            "flex items-center gap-2 text-sm text-gray-600",
                          children: [
                            e(x, { className: "w-4 h-4" }),
                            e("span", { children: t.patient.phone }),
                          ],
                        }),
                    ],
                  }),
                ],
              }),
              a("div", {
                className: "p-4 bg-white rounded-lg shadow-sm",
                children: [
                  e("h2", {
                    className: "mb-3 font-semibold text-gray-900",
                    children: "Detalles de la sesión",
                  }),
                  a("div", {
                    className: "space-y-3",
                    children: [
                      a("div", {
                        className:
                          "flex items-start gap-3 pb-3 border-b border-gray-200",
                        children: [
                          e(_, { className: "w-5 h-5 text-gray-400 mt-0.5" }),
                          a("div", {
                            className: "flex-1",
                            children: [
                              e("p", {
                                className: "text-xs text-gray-500",
                                children: "Fecha y hora",
                              }),
                              a("p", {
                                className: "font-medium text-gray-900",
                                children: [
                                  new Date(t.date).toLocaleDateString("es-CL"),
                                  " -",
                                  " ",
                                  t.time,
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      a("div", {
                        className:
                          "flex items-start gap-3 pb-3 border-b border-gray-200",
                        children: [
                          e(P, { className: "w-5 h-5 text-gray-400 mt-0.5" }),
                          a("div", {
                            className: "flex-1",
                            children: [
                              e("p", {
                                className: "text-xs text-gray-500",
                                children: "Tipo de sesión",
                              }),
                              e("p", {
                                className: "font-medium text-gray-900",
                                children: t.session_type.name,
                              }),
                            ],
                          }),
                        ],
                      }),
                      a("div", {
                        className:
                          "flex items-start gap-3 pb-3 border-b border-gray-200",
                        children: [
                          e(b, { className: "w-5 h-5 text-gray-400 mt-0.5" }),
                          a("div", {
                            className: "flex-1",
                            children: [
                              e("p", {
                                className: "text-xs text-gray-500",
                                children: "Duración",
                              }),
                              a("p", {
                                className: "font-medium text-gray-900",
                                children: [
                                  t.duration_actual || t.session_type.duration,
                                  " ",
                                  "minutos",
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      t.treatment.diagnosis &&
                        a("div", {
                          className: "flex items-start gap-3",
                          children: [
                            e(E, { className: "w-5 h-5 text-gray-400 mt-0.5" }),
                            a("div", {
                              className: "flex-1",
                              children: [
                                e("p", {
                                  className: "text-xs text-gray-500",
                                  children: "Diagnóstico",
                                }),
                                e("p", {
                                  className: "font-medium text-gray-900",
                                  children: t.treatment.diagnosis,
                                }),
                              ],
                            }),
                          ],
                        }),
                    ],
                  }),
                ],
              }),
              t.treatment.objectives &&
                t.treatment.objectives.length > 0 &&
                a("div", {
                  className: "p-4 bg-white rounded-lg shadow-sm",
                  children: [
                    e("h2", {
                      className: "mb-3 font-semibold text-gray-900",
                      children: "Objetivos del tratamiento",
                    }),
                    e("ul", {
                      className: "space-y-2",
                      children: t.treatment.objectives.map((r, S) =>
                        a(
                          "li",
                          {
                            className:
                              "flex items-start gap-2 text-sm text-gray-700",
                            children: [
                              e("span", {
                                className: "text-teal-600",
                                children: "•",
                              }),
                              e("span", { children: r }),
                            ],
                          },
                          S
                        )
                      ),
                    }),
                  ],
                }),
              a("div", {
                className: "p-4 bg-white rounded-lg shadow-sm",
                children: [
                  a("div", {
                    className: "flex items-center justify-between mb-3",
                    children: [
                      e("h2", {
                        className: "font-semibold text-gray-900",
                        children: "Notas de la sesión",
                      }),
                      t.status === "Programada" &&
                        !h &&
                        e("button", {
                          onClick: () => n(!0),
                          className:
                            "p-2 text-teal-600 transition-colors rounded-lg hover:bg-teal-50",
                          children: e(F, { className: "w-4 h-4" }),
                        }),
                    ],
                  }),
                  h
                    ? a("div", {
                        className: "space-y-3",
                        children: [
                          e("textarea", {
                            value: l,
                            onChange: (r) => p(r.target.value),
                            placeholder: "Agrega notas sobre esta sesión...",
                            rows: 6,
                            className:
                              "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent",
                          }),
                          a("div", {
                            className: "flex gap-2",
                            children: [
                              a("button", {
                                onClick: C,
                                disabled: g,
                                className:
                                  "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50",
                                children: [
                                  e(I, { className: "w-4 h-4" }),
                                  g ? "Guardando..." : "Guardar",
                                ],
                              }),
                              e("button", {
                                onClick: () => {
                                  n(!1), p(t.notes || "");
                                },
                                className:
                                  "px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300",
                                children: "Cancelar",
                              }),
                            ],
                          }),
                        ],
                      })
                    : e("div", {
                        children: l
                          ? e("p", {
                              className:
                                "text-sm text-gray-700 whitespace-pre-wrap",
                              children: l,
                            })
                          : e("p", {
                              className: "text-sm italic text-gray-500",
                              children: "Sin notas registradas",
                            }),
                      }),
                ],
              }),
              t.status === "completed" &&
                a("div", {
                  className: "p-4 bg-white rounded-lg shadow-sm",
                  children: [
                    e("h2", {
                      className: "mb-3 font-semibold text-gray-900",
                      children: "Información de pago",
                    }),
                    e("div", {
                      className: "space-y-3",
                      children:
                        t.status === "scheduled" &&
                        e(L, {
                          children: a("div", {
                            className:
                              "flex items-center justify-between p-3 border-2 border-teal-200 rounded-lg bg-teal-50",
                            children: [
                              e("div", {
                                children: e("span", {
                                  className: "text-sm text-gray-600",
                                  children: "Valor Sesión",
                                }),
                              }),
                              a("span", {
                                className: "text-xl font-bold text-teal-600",
                                children: [
                                  "$",
                                  t.payment.doctor_amount_clp.toLocaleString(
                                    "es-CL"
                                  ),
                                ],
                              }),
                            ],
                          }),
                        }),
                    }),
                  ],
                }),
              a("div", {
                className: "p-4 bg-white rounded-lg shadow-sm",
                children: [
                  e("h2", {
                    className: "mb-3 font-semibold text-gray-900",
                    children: "Registro",
                  }),
                  a("div", {
                    className: "space-y-2 text-sm",
                    children: [
                      a("div", {
                        className: "flex justify-between",
                        children: [
                          e("span", {
                            className: "text-gray-600",
                            children: "Creada el",
                          }),
                          e("span", {
                            className: "font-medium text-gray-900",
                            children: new Date(
                              t.timestamps.created_at
                            ).toLocaleDateString("es-CL", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                          }),
                        ],
                      }),
                      t.timestamps.completed_at &&
                        a("div", {
                          className: "flex justify-between",
                          children: [
                            e("span", {
                              className: "text-gray-600",
                              children: "Completada el",
                            }),
                            e("span", {
                              className: "font-medium text-green-600",
                              children: new Date(
                                t.timestamps.completed_at
                              ).toLocaleDateString("es-CL", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }),
                            }),
                          ],
                        }),
                    ],
                  }),
                ],
              }),
              t.status === "Programada" &&
                a("div", {
                  className: "space-y-3",
                  children: [
                    a("button", {
                      onClick: v,
                      className:
                        "flex items-center justify-center w-full gap-2 py-3 text-base font-semibold text-white transition-colors bg-green-600 rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg",
                      children: [
                        e(o, { className: "w-5 h-5" }),
                        "Completar Sesión",
                      ],
                    }),
                    a("button", {
                      onClick: w,
                      className:
                        "flex items-center justify-center w-full gap-2 py-3 text-base font-semibold text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300",
                      children: [
                        e(m, { className: "w-5 h-5" }),
                        "Cancelar Sesión",
                      ],
                    }),
                  ],
                }),
              t.status === "Completada" &&
                a("div", {
                  className:
                    "p-4 border-2 border-green-200 rounded-lg bg-green-50",
                  children: [
                    a("div", {
                      className: "flex items-center gap-3 mb-2",
                      children: [
                        e(o, { className: "w-6 h-6 text-green-600" }),
                        e("p", {
                          className: "font-semibold text-green-900",
                          children: "Sesión completada exitosamente",
                        }),
                      ],
                    }),
                    a("p", {
                      className: "text-sm text-green-700",
                      children: [
                        "Esta sesión fue completada el",
                        " ",
                        new Date(t.timestamps.completed_at).toLocaleDateString(
                          "es-CL"
                        ),
                      ],
                    }),
                  ],
                }),
              t.status === "Cancelada" &&
                a("div", {
                  className: "p-4 border-2 border-red-200 rounded-lg bg-red-50",
                  children: [
                    a("div", {
                      className: "flex items-center gap-3 mb-2",
                      children: [
                        e(m, { className: "w-6 h-6 text-red-600" }),
                        e("p", {
                          className: "font-semibold text-red-900",
                          children: "Sesión cancelada",
                        }),
                      ],
                    }),
                    e("p", {
                      className: "text-sm text-red-700",
                      children:
                        "Esta sesión fue cancelada y no generará comisión",
                    }),
                  ],
                }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { ee as default };
