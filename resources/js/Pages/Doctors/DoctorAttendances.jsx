import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logoBase64, fmtCLP, fmtDate, fmtTime } from "@/utils/utils";

import {
  Calendar,
  Download,
  Filter,
  FileText,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";

export default function DoctorAttendances({
  doctor,
  sessions = [],
  filters = {},
}) {
  // Obtener el primer día del mes actual
  const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
  };

  // Obtener el último día del mes actual
  const getLastDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
  };

  const [startDate, setStartDate] = useState(
    filters.start_date || getFirstDayOfMonth()
  );
  const [endDate, setEndDate] = useState(
    filters.end_date || getLastDayOfMonth()
  );
  const [isExporting, setIsExporting] = useState(false);

  // Filtrar sesiones en el frontend
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const sessionDate = session.date;
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }, [sessions, startDate, endDate]);

  // Estadísticas calculadas con sesiones filtradas
  const stats = useMemo(() => {
    const total = filteredSessions.length;
    const totalRevenue = filteredSessions.reduce(
      (sum, s) => sum + (s.patient_amount || 0),
      0
    );
    const totalCommission = filteredSessions.reduce(
      (sum, s) => sum + (s.doctor_amount || 0),
      0
    );
    const uniquePatients = new Set(filteredSessions.map((s) => s.patient_id))
      .size;

    return {
      total,
      totalRevenue,
      totalCommission,
      uniquePatients,
    };
  }, [filteredSessions]);

  const applyFilters = () => {
    // Los filtros ya se aplican automáticamente con useMemo
    // Solo actualiza el estado visual si lo necesitas
  };

  const resetFilters = () => {
    const firstDay = getFirstDayOfMonth();
    const lastDay = getLastDayOfMonth();
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const exportToPDF = () => {
    setIsExporting(true);

    try {
      // Crear documento PDF
      const doc = new jsPDF();

      // Configuración de colores
      const primaryColor = [37, 99, 235]; // Blue-600
      const lightGray = [243, 244, 246];
      const darkGray = [31, 41, 55];

      // Logo o imagen (opcional - descomenta y agrega tu imagen en base64)

      // Tu imagen en base64
      doc.addImage(logoBase64, "PNG", 155, 15, 30, 13); // x, y, width, height

      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(...primaryColor);
      doc.text("Reporte de Sesiones", 14, 20);

      // Información del doctor
      doc.setFontSize(12);
      doc.setTextColor(...darkGray);
      doc.text(`${doctor.full_name}`, 14, 28);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`${doctor.specialty || ""}`, 14, 34);
      doc.text(`Período: ${fmtDate(startDate)} - ${fmtDate(endDate)}`, 14, 40);

      // Línea divisoria
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(14, 44, 188, 44);

      // KPIs
      const kpiY = 52;
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);

      // Total Sesiones
      doc.text("TOTAL SESIONES", 14, kpiY);
      doc.setFontSize(14);
      doc.setTextColor(...darkGray);
      doc.text(stats.total.toString(), 14, kpiY + 6);

      // Comisiones
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text("COMISIONES", 90, kpiY);
      doc.setFontSize(14);
      doc.setTextColor(...darkGray);
      doc.text(fmtCLP(stats.totalCommission), 90, kpiY + 6);

      // Pacientes Únicos
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text("PACIENTES", 170, kpiY);
      doc.setFontSize(14);
      doc.setTextColor(...darkGray);
      doc.text(stats.uniquePatients.toString(), 170, kpiY + 6);

      // Preparar datos para la tabla con sesiones filtradas
      const tableData = filteredSessions.map((session) => {
        const statusMap = {
          completed: "Completada",
          scheduled: "Agendada",
          cancelled: "Cancelada",
        };

        return [
          session?.session_number || "-",
          fmtDate(session.date),
          fmtTime(session.time),
          session.patient?.full_name || "-",
          session.session_type?.name || "-",
          statusMap[session.status] || session.status,
          fmtCLP(session.doctor_amount || 0),
        ];
      });

      // Agregar fila de totales
      tableData.push([
        {
          content: "TOTALES",
          colSpan: 6,
          styles: { halign: "right", fontStyle: "bold" },
        },
        /*  { content: fmtCLP(stats.totalRevenue), styles: { fontStyle: "bold" } }, */
        {
          content: fmtCLP(stats.totalCommission),
          styles: { fontStyle: "bold", textColor: [147, 51, 234] },
        },
      ]);

      // Crear tabla
      autoTable(doc, {
        startY: kpiY + 15,
        head: [
          [
            "#Sesión",
            "Fecha",
            "Hora",
            "Paciente",
            "Tipo de Sesión",
            "Estado",
            "Comisión",
          ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: darkGray,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 40 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25, halign: "right" },
          6: { cellWidth: 25, halign: "right" },
        },
        margin: { top: 10 },
        didDrawPage: (data) => {
          // Footer en cada página
          const pageCount = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight();

          doc.setFontSize(8);
          doc.setTextColor(107, 114, 128);
          doc.text(
            `Generado el ${new Date().toLocaleDateString(
              "es-CL"
            )} a las ${new Date().toLocaleTimeString("es-CL")}`,
            14,
            pageHeight - 10
          );
          doc.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            pageSize.width - 40,
            pageHeight - 10
          );
        },
      });

      // Guardar PDF
      doc.save(`sesiones_${doctor.full_name}_${startDate}_${endDate}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert(
        "Ocurrió un error al generar el PDF. Por favor, intenta nuevamente."
      );
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-7 h-7 text-blue-600" />
              Reporte de Sesiones
            </h1>
            <p className="text-gray-600 mt-1">
              {doctor.name} {doctor.last_name} - {doctor.specialty}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg">
              {filteredSessions.length} sesiones
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Filtros de fecha</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha inicio
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha fin
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              disabled
              style={{ display: "none" }}
            >
              Aplicar
            </button>
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Restablecer
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportToPDF}
              disabled={isExporting || filteredSessions.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exportando..." : "Exportar PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Total Sesiones
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Ingresos Totales
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {fmtCLP(stats.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Comisiones</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {fmtCLP(stats.totalCommission)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Pacientes Únicos
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.uniquePatients}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de sesiones */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Detalle de Sesiones
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Mostrando {filteredSessions.length} sesiones del período
            seleccionado
          </p>
        </div>

        <div className="overflow-x-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                No hay sesiones en el período seleccionado
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Intenta ajustar los filtros de fecha
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    #Sesión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Tipo de Sesión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Comisión
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{session.session_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fmtDate(session.date)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {fmtTime(session.time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {session.patient?.full_name}
                      </div>
                      {/* <div className="text-gray-500 text-xs">
                        {session.patient?.rut}
                      </div> */}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {session.session_type?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          session.status === "Completada"
                            ? "bg-emerald-100 text-emerald-700"
                            : session.status === "Agendada"
                            ? "bg-blue-100 text-blue-700"
                            : session.status === "Cancelada"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {session.status === "Completada"
                          ? "Completada"
                          : session.status === "Agendada"
                          ? "Agendada"
                          : session.status === "Cancelada"
                          ? "Cancelada"
                          : session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {fmtCLP(session.patient_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-purple-700">
                      {fmtCLP(session.doctor_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-sm font-bold text-gray-900 text-right"
                  >
                    TOTALES:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {fmtCLP(stats.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-purple-700">
                    {fmtCLP(stats.totalCommission)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
