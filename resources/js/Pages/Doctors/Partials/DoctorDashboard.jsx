import React from 'react';
import { Activity, Calendar, Wallet, TrendingUp, Clock, CheckCircle2, BarChart2 } from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area
} from 'recharts';

export default function DoctorDashboard({ stats, doctor }) {
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="space-y-8">
            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Sesiones del Mes" 
                    value={stats.sessions_month} 
                    icon={Calendar} 
                    color="brand" 
                />
                <StatCard 
                    title="Por Recaudar" 
                    value={formatMoney(stats.pending_earnings)} 
                    icon={Wallet} 
                    color="orange" 
                />
                <StatCard 
                    title="Última Liquidación" 
                    value={stats.last_payroll ? formatMoney(stats.last_payroll.total_amount) : '---'} 
                    icon={CheckCircle2} 
                    color="green" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* GRÁFICO DE EVOLUCIÓN */}
                <div className="lg:col-span-2 bg-white p-8 border border-gray-100 shadow-xl rounded-[2.5rem] space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-secondary/30 rounded-xl text-brand-primary">
                                <BarChart2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Evolución de Sesiones</h3>
                        </div>
                        <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">Últimos 6 meses</span>
                    </div>

                    <div className="h-[300px] w-full mt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chart_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                    dy={10}
                                    textAnchor="middle"
                                    className="uppercase"
                                />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-4 shadow-2xl rounded-2xl border border-gray-100">
                                                    <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest mb-1">{payload[0].payload.month}</p>
                                                    <p className="text-sm font-black text-brand-primary uppercase tracking-tight">{payload[0].value} Sesiones</p>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight mt-1">{formatMoney(payload[0].payload.earnings)} Producido</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="sessions" 
                                    radius={[8, 8, 8, 8]} 
                                    barSize={40}
                                >
                                    {stats.chart_data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index === stats.chart_data.length - 1 ? '#3292b3' : '#e2e8f0'} 
                                            className="transition-all duration-500 hover:fill-brand-primary cursor-pointer"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* MENSAJE DE BIENVENIDA / ESTADO */}
                <div className="lg:col-span-1 p-8 bg-brand-primary text-white shadow-xl shadow-brand-primary/20 rounded-[2.5rem] flex flex-col justify-between overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="p-4 bg-white/20 rounded-3xl w-fit">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase tracking-tight leading-tight">Rendimiento Profesional</h3>
                            <p className="text-white/80 text-sm font-medium">
                                Tu promedio de atenciones ha crecido un <span className="text-white font-black">12%</span> respecto al mes anterior. 
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 pt-8 mt-8 border-t border-white/20">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Metas del Mes</p>
                         <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span>Sesiones</span>
                                    <span>{stats.sessions_month}/50</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stats.sessions_month / 50) * 100)}%` }}></div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }) {
    const colors = {
        brand: "bg-brand-primary text-white shadow-brand-primary/20",
        orange: "bg-orange-500 text-white shadow-orange-500/20",
        green: "bg-emerald-500 text-white shadow-emerald-500/20"
    };

    return (
        <div className="bg-white p-8 border border-gray-100 shadow-xl rounded-[2.5rem] relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-4">
                    <p className="enterprise-label opacity-60 !mb-0">{title}</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{value}</p>
                </div>
                <div className={`p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110 duration-300 ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
