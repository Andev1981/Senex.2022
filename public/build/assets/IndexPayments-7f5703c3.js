import { r as s, j as a, a as e } from "./app-12bcd6c7.js";
import { g as i } from "./utils-612d3095.js";
import { S as u } from "./SideModal-ae473660.js";
import N from "./PaymentForm-c4c68898.js";
import { b } from "./status-cf46609b.js";
import "./ReactToastify-1623b027.js";
import "./parse-c3570fb2.js";
import { C as y } from "./circle-check-big-ba4cd303.js";
import { C as v } from "./clock-7b9ed972.js";
import { D as P } from "./dollar-sign-6797ba38.js";
import { C } from "./credit-card-5701326d.js";
import { P as w } from "./plus-f8221267.js";
import "./index-a8363777.js";
import "./dialog-dee56832.js";
import "./description-fdafa377.js";
import "./with-selector-cfe602ea.js";
import "./moment-a9aaa855.js";
import "./file-text-21840ea5.js";
import "./createLucideIcon-c38b0f54.js";
import "./check-7ca58c94.js";
import "./calendar-2ca7eb70.js";
import "./receipt-5b02e197.js";
import "./circle-alert-a47d851b.js";
function V({ payments: r, sessions: l, patient: d }) {
  var x;
  const [n, c] = s.useState(!1),
    [h, M] = s.useState([]),
    p = s.useMemo(
      () =>
        r
          .filter((t) => t.status === "completed")
          .reduce((t, o) => t + (o.amount_clp || 0), 0),
      [r]
    ),
    g = s.useMemo(
      () =>
        r
          .filter((t) => t.status === "pending")
          .reduce((t, o) => t + (o.amount_clp || 0), 0),
      [r]
    );
  return a("div", {
    className: "space-y-6",
    children: [
      a("div", {
        className: "grid grid-cols-1 gap-4 md:grid-cols-3",
        children: [
          e(m, {
            title: "Total Pagado",
            icon: y,
            className: "from-green-500 to-green-600",
            value: i.format(p),
          }),
          e(m, {
            title: "Pendiente",
            icon: v,
            className: "from-orange-500 to-orange-600",
            value: i.format(g),
          }),
          e(m, {
            title: "Total",
            icon: P,
            className: "from-teal-500 to-teal-600",
            value: i.format(p + g),
          }),
        ],
      }),
      a("div", {
        className: "p-6 bg-white shadow-lg rounded-xl",
        children: [
          a("div", {
            className: "flex items-center justify-between mb-6",
            children: [
              a("h2", {
                className:
                  "flex items-center gap-2 text-2xl font-bold text-gray-900",
                children: [
                  e(C, { className: "w-6 h-6 text-teal-600" }),
                  " Historial de Pagos",
                ],
              }),
              a("button", {
                onClick: () => c(!0),
                className:
                  "flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700",
                children: [e(w, { className: "w-4 h-4" }), " Registrar Pago"],
              }),
            ],
          }),
          e("div", {
            className: "overflow-x-auto",
            children: a("table", {
              className: "w-full",
              children: [
                e("thead", {
                  className: "bg-gray-50",
                  children: e("tr", {
                    children: [
                      "Fecha",
                      "Concepto",
                      "Documento",
                      "Total",
                      "Método",
                      "Estado",
                    ].map((t) =>
                      e(
                        "th",
                        {
                          className: `px-4 py-3 text-xs font-semibold uppercase ${
                            ["Copago", "Isapre", "Total"].includes(t)
                              ? "text-right text-gray-600"
                              : "text-left text-gray-600"
                          }`,
                          children: t,
                        },
                        t
                      )
                    ),
                  }),
                }),
                e("tbody", {
                  className: "divide-y divide-gray-200",
                  children:
                    r == null
                      ? void 0
                      : r.map((t) =>
                          a(
                            "tr",
                            {
                              className: "hover:bg-gray-50",
                              children: [
                                e("td", {
                                  className: "px-4 py-3 text-sm text-gray-900",
                                  children: new Date(
                                    t.paid_at
                                  ).toLocaleDateString("es-CL"),
                                }),
                                e("td", {
                                  className: "px-4 py-3 text-sm text-gray-900",
                                  children: t.transaction_reference,
                                }),
                                e("td", {
                                  className: "px-4 py-3 text-sm text-gray-600",
                                  children: t.invoice,
                                }),
                                e("td", {
                                  className:
                                    "px-4 py-3 text-sm font-semibold text-right text-gray-900",
                                  children: i.format(t.amount_clp || 0),
                                }),
                                e("td", {
                                  className: "px-4 py-3 text-sm text-gray-600",
                                  children: (() => {
                                    const o = b.find(
                                      (f) => f.value === t.payment_method
                                    );
                                    return o
                                      ? a("span", {
                                          className: "flex items-center gap-2",
                                          children: [
                                            e("span", { children: o.icon }),
                                            e("span", { children: o.label }),
                                          ],
                                        })
                                      : e("span", {
                                          children: "Método no registrado",
                                        });
                                  })(),
                                }),
                                e("td", {
                                  className: "px-4 py-3 text-center",
                                  children: e("span", {
                                    className: `inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                      t.status === "completed"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`,
                                    children: t.status,
                                  }),
                                }),
                              ],
                            },
                            t.id
                          )
                        ),
                }),
              ],
            }),
          }),
        ],
      }),
      e(u, {
        open: n,
        onClose: () => c(!1),
        title: "Editar Pago",
        width: "3xl",
        children: e(N, {
          setOpenPaymentModal: c,
          payment: h,
          sessions: l,
          treatment: (x = l[0]) == null ? void 0 : x.treatment_id,
          isEditing: !1,
          patient: d,
        }),
      }),
    ],
  });
}
function m({
  title: r,
  icon: l,
  value: d,
  className: n = "from-teal-500 to-teal-600",
}) {
  return a("div", {
    className: `p-6 text-white bg-gradient-to-br ${n} rounded-xl`,
    children: [
      a("div", {
        className: "flex items-center gap-3 mb-2",
        children: [
          e(l, { className: "w-8 h-8" }),
          e("h3", { className: "text-lg font-semibold", children: r }),
        ],
      }),
      e("p", { className: "text-3xl font-bold", children: d }),
    ],
  });
}
export { V as default };
