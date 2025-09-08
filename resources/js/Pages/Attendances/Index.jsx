import { useForm, Link } from "@inertiajs/react";
import { useState } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import InputError from "@/Components/InputError";

export default function Index({ sessions, filters }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Atenciones</h1>
        <PrimaryButton onClick={() => setShowForm(true)}>
          Registrar atención
        </PrimaryButton>
      </div>

      {showForm && <RegisterForm onClose={() => setShowForm(false)} />}

      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Paciente</th>
            <th className="p-2 text-left">Kine</th>
            <th className="p-2 text-left">Tipo</th>
            <th className="p-2 text-right">Monto</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sessions.data.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">
                {new Date(s.attended_at).toLocaleString()}
              </td>
              <td className="p-2">
                {s.patient?.name} {s.patient?.last_name}
              </td>
              <td className="p-2">
                {s.doctor?.name} {s.doctor?.last_name}
              </td>
              <td className="p-2">{s.session_type?.name}</td>
              <td className="p-2 text-right">
                {Number(s.patient_amount ?? 0).toLocaleString("es-CL")}
              </td>
              <td className="p-2 text-center space-x-2">
                <Link
                  className="text-blue-600 hover:underline"
                  href={route("sessions.pay.now", s.id)}
                  method="post"
                  as="button"
                  data={{ method: "cash" }}
                >
                  Cobro efectivo
                </Link>
                <Link
                  className="text-blue-600 hover:underline"
                  href={route("sessions.pay.webpay", s.id)}
                  method="post"
                  as="button"
                >
                  WebPay
                </Link>
                <Link
                  className="text-blue-600 hover:underline"
                  href={route("invoices.issue.session", s.id)}
                  method="post"
                  as="button"
                  data={{ type: "boleta" }}
                >
                  Emitir boleta
                </Link>
              </td>
            </tr>
          ))}
          {sessions.data.length === 0 && (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan={6}>
                Sin atenciones
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RegisterForm({ onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    patient_id: "",
    doctor_id: "",
    session_type_id: "",
    attended_at: "",
    patient_amount: "",
    notes: "",
    payment: { mode: "now", method: "cash" },
    dte: { issue: true, type: "boleta" },
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("attendances.store"), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const set = (name) => (e) => setData(name, e.target.value);

  return (
    <div className="p-4 my-2 border rounded-lg bg-white">
      <h2 className="mb-3 text-base font-semibold">Registrar atención</h2>
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Paciente ID
          </label>
          <input
            className="w-full p-2 mt-1 border rounded"
            value={data.patient_id}
            onChange={set("patient_id")}
          />
          <InputError message={errors.patient_id} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Kine ID
          </label>
          <input
            className="w-full p-2 mt-1 border rounded"
            value={data.doctor_id}
            onChange={set("doctor_id")}
          />
          <InputError message={errors.doctor_id} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">
            Tipo sesión ID
          </label>
          <input
            className="w-full p-2 mt-1 border rounded"
            value={data.session_type_id}
            onChange={set("session_type_id")}
          />
          <InputError message={errors.session_type_id} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">
            Fecha y hora
          </label>
          <input
            type="datetime-local"
            className="w-full p-2 mt-1 border rounded"
            value={data.attended_at}
            onChange={set("attended_at")}
          />
          <InputError message={errors.attended_at} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">
            Monto paciente
          </label>
          <input
            type="number"
            className="w-full p-2 mt-1 border rounded"
            value={data.patient_amount}
            onChange={set("patient_amount")}
          />
          <InputError message={errors.patient_amount} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">
            Notas
          </label>
          <input
            className="w-full p-2 mt-1 border rounded"
            value={data.notes}
            onChange={set("notes")}
          />
        </div>

        <div className="col-span-full flex gap-3 items-center mt-2">
          <label className="text-xs">
            <input
              type="checkbox"
              checked={data.dte.issue}
              onChange={(e) =>
                setData("dte", { ...data.dte, issue: e.target.checked })
              }
            />{" "}
            Emitir boleta
          </label>
          <select
            className="p-2 border rounded"
            value={data.dte.type}
            onChange={(e) =>
              setData("dte", { ...data.dte, type: e.target.value })
            }
          >
            <option value="boleta">Boleta</option>
            <option value="factura">Factura</option>
          </select>

          <select
            className="p-2 border rounded"
            value={data.payment.mode}
            onChange={(e) =>
              setData("payment", { ...data.payment, mode: e.target.value })
            }
          >
            <option value="now">Cobro inmediato</option>
            <option value="debt">Generar deuda</option>
            <option value="planOnly">Usar plan (si hay)</option>
          </select>

          <select
            className="p-2 border rounded"
            value={data.payment.method}
            onChange={(e) =>
              setData("payment", { ...data.payment, method: e.target.value })
            }
          >
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="webpay">WebPay</option>
            <option value="insurance">Convenio</option>
          </select>

          <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
          <button
            type="button"
            className="px-3 py-2 text-sm text-gray-700 border rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
