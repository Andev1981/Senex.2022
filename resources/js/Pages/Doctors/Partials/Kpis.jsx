import { AlertCircle, CheckCircle2, Percent, Users } from "lucide-react";
import { useMemo } from "react";
import { avg } from "@/utils/utils";

export default function Kpis({ doctors }) {
  const kpis = useMemo(() => {
    const actives = doctors.filter((d) => d.branch.status === "active");
    const inactives = doctors.filter((d) => d.branch.status !== "active");
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
    <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4 font-black">
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[1.5rem] hover:scale-[1.02] transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-secondary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <p className="enterprise-label !text-[8px] opacity-60">Staff Total</p>
        <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{kpis.total}</p>
      </div>
      
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[1.5rem] hover:scale-[1.02] transition-all duration-300 group border-b-4 border-b-green-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <p className="enterprise-label !text-[8px] opacity-60 text-green-600">Disponibles</p>
        <p className="text-3xl font-black text-green-600 tracking-tighter leading-none">{kpis.actives}</p>
      </div>

      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[1.5rem] hover:scale-[1.02] transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-brand-gray group-hover:bg-brand-gray group-hover:text-white transition-all duration-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <p className="enterprise-label !text-[8px] opacity-60">Bajas / Pausa</p>
        <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{kpis.inactives}</p>
      </div>

      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-[1.5rem] hover:scale-[1.02] transition-all duration-300 group border-b-4 border-b-brand-primary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <p className="enterprise-label !text-[8px] opacity-60 text-brand-primary">Comisión Avg.</p>
        <p className="text-3xl font-black text-brand-primary tracking-tighter leading-none font-mono">
          {kpis.avgCommission}%
        </p>
      </div>
    </div>
  );
}
