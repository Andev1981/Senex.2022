import React, { useState } from "react";
import { Head, router, Link } from "@inertiajs/react";

// Formatear moneda CLP
const formatCLP = (amount_clp) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount_clp || 0);
};

// Formatear RUT
const formatRut = (rut) => {
  if (!rut) return "-";
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return rut;
  const dv = clean.slice(-1);
  let cuerpo = clean.slice(0, -1);
  let formatted = "";
  let count = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    formatted = cuerpo[i] + formatted;
    count++;
    if (count === 3 && i > 0) {
      formatted = "." + formatted;
      count = 0;
    }
  }
  return `${formatted}-${dv}`;
};

export default function PaymentRemindersIndex({ patients, filters, stats }) {
  const [search, setSearch] = useState(filters.search || "");
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState(["mail"]);
  const [sending, setSending] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(
      route("admin.payment-reminders.index"),
      { search },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  // Toggle selección paciente
  const togglePatient = (id) => {
    setSelectedPatients((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Seleccionar todos
  const toggleAll = () => {
    if (selectedPatients.length === patients.data.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.data.map((p) => p.id));
    }
  };

  // Toggle canal
  const toggleChannel = (channel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  // Enviar recordatorio individual
  const sendReminder = (patientId, channels = selectedChannels) => {
    if (channels.length === 0) {
      alert("Selecciona al menos un canal de envío");
      return;
    }

    setSending(patientId);
    router.post(
      route("admin.payment-reminders.send", patientId),
      {
        channels,
      },
      {
        preserveScroll: true,
        onFinish: () => setSending(null),
      }
    );
  };

  // Enviar recordatorios masivos
  const sendBulkReminders = () => {
    if (selectedPatients.length === 0) {
      alert("Selecciona al menos un paciente");
      return;
    }
    if (selectedChannels.length === 0) {
      alert("Selecciona al menos un canal de envío");
      return;
    }

    router.post(
      route("admin.payment-reminders.send-bulk"),
      {
        patient_ids: selectedPatients,
        channels: selectedChannels,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowBulkModal(false);
          setSelectedPatients([]);
        },
      }
    );
  };

  return (
    <>
      <Head title="Recordatorios de Pago" />

      <div className="reminders-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Recordatorios de Pago</h1>
            <p>Envía recordatorios a pacientes con deudas pendientes</p>
          </div>
          <div className="header-actions">
            <a
              href={route("portal.pago")}
              target="_blank"
              className="btn-secondary"
            >
              Ver Portal de Pagos
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.total_patients_with_debt}</span>
            <span className="stat-label">Pacientes con deuda</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {formatCLP(stats.total_pending_amount)}
            </span>
            <span className="stat-label">Total pendiente</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total_pending_sessions}</span>
            <span className="stat-label">Sesiones pendientes</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Buscar</button>
          </form>

          {selectedPatients.length > 0 && (
            <button
              className="btn-primary"
              onClick={() => setShowBulkModal(true)}
            >
              Enviar a {selectedPatients.length} seleccionados
            </button>
          )}
        </div>

        {/* Canales */}
        <div className="channels-selector">
          <span>Canales de envío:</span>
          <label
            className={`channel-option ${
              selectedChannels.includes("mail") ? "active" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selectedChannels.includes("mail")}
              onChange={() => toggleChannel("mail")}
            />
            <span className="channel-icon">📧</span>
            Email
          </label>
          <label
            className={`channel-option ${
              selectedChannels.includes("sms") ? "active" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selectedChannels.includes("sms")}
              onChange={() => toggleChannel("sms")}
            />
            <span className="channel-icon">📱</span>
            SMS
          </label>
          <label
            className={`channel-option ${
              selectedChannels.includes("whatsapp") ? "active" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selectedChannels.includes("whatsapp")}
              onChange={() => toggleChannel("whatsapp")}
            />
            <span className="channel-icon">💬</span>
            WhatsApp
          </label>
        </div>

        {/* Tabla */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={
                      selectedPatients.length === patients.data.length &&
                      patients.data.length > 0
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th>Paciente</th>
                <th>RUT</th>
                <th>Contacto</th>
                <th className="text-center">Sesiones</th>
                <th className="text-right">Monto</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients.data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No hay pacientes con deudas pendientes
                  </td>
                </tr>
              ) : (
                patients.data.map((patient) => (
                  <tr
                    key={patient.id}
                    className={
                      selectedPatients.includes(patient.id) ? "selected" : ""
                    }
                  >
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(patient.id)}
                        onChange={() => togglePatient(patient.id)}
                      />
                    </td>
                    <td>
                      <span className="patient-name">{patient.name}</span>
                    </td>
                    <td>
                      <span className="patient-rut">
                        {formatRut(patient.rut)}
                      </span>
                    </td>
                    <td>
                      <div className="contact-info">
                        {patient.email && (
                          <span className="contact-item">
                            📧 {patient.email}
                          </span>
                        )}
                        {patient.phone && (
                          <span className="contact-item">
                            📱 {patient.phone}
                          </span>
                        )}
                        {!patient.email && !patient.phone && (
                          <span className="no-contact">Sin contacto</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge">
                        {patient.pending_sessions_count}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="amount_clp">
                        {formatCLP(patient.pending_amount)}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn-send"
                        onClick={() => sendReminder(patient.id)}
                        disabled={
                          sending === patient.id ||
                          selectedChannels.length === 0
                        }
                      >
                        {sending === patient.id ? "Enviando..." : "Enviar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {patients.last_page > 1 && (
          <div className="pagination">
            {patients.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || "#"}
                className={`page-link ${link.active ? "active" : ""} ${
                  !link.url ? "disabled" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
                preserveScroll
              />
            ))}
          </div>
        )}

        {/* Modal envío masivo */}
        {showBulkModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowBulkModal(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Enviar recordatorios</h2>
              <p>
                Se enviará un recordatorio a{" "}
                <strong>{selectedPatients.length}</strong> pacientes.
              </p>

              <div className="modal-channels">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes("mail")}
                    onChange={() => toggleChannel("mail")}
                  />
                  📧 Email
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes("sms")}
                    onChange={() => toggleChannel("sms")}
                  />
                  📱 SMS
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes("whatsapp")}
                    onChange={() => toggleChannel("whatsapp")}
                  />
                  💬 WhatsApp
                </label>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-confirm"
                  onClick={sendBulkReminders}
                  disabled={selectedChannels.length === 0}
                >
                  Enviar recordatorios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
                .reminders-page {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                }

                .page-header h1 {
                    font-size: 1.75rem;
                    font-weight: 600;
                    margin: 0 0 0.25rem;
                }

                .page-header p {
                    color: #6B7280;
                    margin: 0;
                }

                .btn-secondary {
                    padding: 0.625rem 1.25rem;
                    background: #F3F4F6;
                    color: #374151;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-secondary:hover {
                    background: #E5E7EB;
                }

                /* Stats */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                }

                .stat-value {
                    display: block;
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #111827;
                }

                .stat-label {
                    display: block;
                    font-size: 0.875rem;
                    color: #6B7280;
                    margin-top: 0.25rem;
                }

                /* Toolbar */
                .toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .search-form {
                    display: flex;
                    gap: 0.5rem;
                }

                .search-form input {
                    width: 300px;
                    padding: 0.625rem 1rem;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    font-size: 0.9375rem;
                }

                .search-form input:focus {
                    outline: none;
                    border-color: #0066CC;
                }

                .search-form button {
                    padding: 0.625rem 1.25rem;
                    background: #0066CC;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .btn-primary {
                    padding: 0.625rem 1.25rem;
                    background: #10B981;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                /* Channels */
                .channels-selector {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: #F9FAFB;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                }

                .channels-selector > span {
                    font-weight: 500;
                    color: #374151;
                }

                .channel-option {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.5rem 1rem;
                    background: white;
                    border: 1px solid #E5E7EB;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .channel-option input {
                    display: none;
                }

                .channel-option.active {
                    background: #EEF2FF;
                    border-color: #6366F1;
                    color: #4F46E5;
                }

                .channel-icon {
                    font-size: 1rem;
                }

                /* Table */
                .table-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                    overflow: hidden;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th, td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid #F3F4F6;
                }

                th {
                    background: #F9FAFB;
                    font-weight: 600;
                    font-size: 0.8125rem;
                    color: #6B7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .checkbox-col {
                    width: 48px;
                    text-align: center;
                }

                tr.selected {
                    background: #EEF2FF;
                }

                .patient-name {
                    font-weight: 500;
                }

                .patient-rut {
                    font-family: monospace;
                    color: #6B7280;
                }

                .contact-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .contact-item {
                    font-size: 0.8125rem;
                    color: #6B7280;
                }

                .no-contact {
                    font-size: 0.8125rem;
                    color: #9CA3AF;
                    font-style: italic;
                }

                .text-center { text-align: center; }
                .text-right { text-align: right; }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 28px;
                    height: 28px;
                    padding: 0 0.5rem;
                    background: #FEF3C7;
                    color: #92400E;
                    border-radius: 14px;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .amount_clp {
                    font-weight: 600;
                    color: #DC2626;
                }

                .btn-send {
                    padding: 0.5rem 1rem;
                    background: #0066CC;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-send:hover:not(:disabled) {
                    background: #004C99;
                }

                .btn-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: #9CA3AF;
                }

                /* Pagination */
                .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 0.25rem;
                    margin-top: 1.5rem;
                }

                .page-link {
                    padding: 0.5rem 0.875rem;
                    background: white;
                    border: 1px solid #E5E7EB;
                    border-radius: 6px;
                    color: #374151;
                    text-decoration: none;
                    font-size: 0.875rem;
                }

                .page-link.active {
                    background: #0066CC;
                    border-color: #0066CC;
                    color: white;
                }

                .page-link.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 50;
                }

                .modal {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    width: 100%;
                    max-width: 400px;
                }

                .modal h2 {
                    font-size: 1.25rem;
                    margin: 0 0 0.5rem;
                }

                .modal p {
                    color: #6B7280;
                    margin: 0 0 1.5rem;
                }

                .modal-channels {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .modal-channels label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }

                .btn-cancel {
                    padding: 0.625rem 1.25rem;
                    background: #F3F4F6;
                    color: #374151;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .btn-confirm {
                    padding: 0.625rem 1.25rem;
                    background: #10B981;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .btn-confirm:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .toolbar {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .search-form {
                        width: 100%;
                    }

                    .search-form input {
                        flex: 1;
                    }

                    .channels-selector {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
    </>
  );
}
