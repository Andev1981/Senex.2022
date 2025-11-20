import { AlertCircle, CheckCircle2, Percent, Users } from "lucide-react";
import { useMemo } from "react";
import { avg } from "@/utils/utils";

export default function Kpis({ doctors }) {
  const kpis = useMemo(() => {
    const actives = doctors.filter((d) => d.status === "active");
    const inactives = doctors.filter((d) => d.status !== "active");
    const commissions = actives.map((d) =>
      d.commission?.type === "percentage" ? d.commission.value : 0
    );
    const avgCommission = avg(commissions);
    const sessions = doctors.reduce((a, d) => a + d.sessionsMonth, 0);
    const revenue = doctors.reduce((a, d) => a + d.revenueMonth, 0);
    return {
      total: doctors.length,
      actives: actives.length,
      inactives: inactives.length,
      avgCommission,
      sessions,
      revenue,
    };
  }, [doctors]);

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
            <Users className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-600">Profesionales</p>
        <p className="text-3xl font-bold text-gray-900">{kpis.total}</p>
      </div>
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-600">Activos</p>
        <p className="text-3xl font-bold text-gray-900">{kpis.actives}</p>
      </div>
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-600">Inactivos/Suspendidos</p>
        <p className="text-3xl font-bold text-gray-900">{kpis.inactives}</p>
      </div>
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
            <Percent className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-600">Comisión promedio</p>
        <p className="text-3xl font-bold text-gray-900">
          {kpis.avgCommission}%
        </p>
      </div>
    </div>
  );
}
