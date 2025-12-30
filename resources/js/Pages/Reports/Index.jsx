import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    Calendar, 
    DollarSign,
    Target,
    ArrowUpRight,
    Filter
} from "lucide-react";

const COLORS = ['#3292b3', '#79d0ec', '#858793', '#1e293b', '#64748b'];

export default function Index({ revenueData, distributionData, stats }) {
    return (
        <AuthenticatedLayout>
            <Head title="Centro de Inteligencia de Datos" />
            <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
                {/* HEADER HERO */}
                <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
                                <BarChart3 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Métricas Estratégicas</h1>
                                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                                    Reportes Generales & KPIs de Gestión • Senex Enterprise
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all">
                                <Filter className="w-3.5 h-3.5" /> Filtrar Período
                            </button>
                        </div>
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Recaudación Mensual" 
                        value={`$${parseInt(stats.total_revenue_month).toLocaleString("es-CL")}`}
                        icon={DollarSign}
                        trend="+12.5%"
                        color="text-brand-primary"
                        bgColor="bg-brand-primary/10"
                    />
                    <StatCard 
                        title="Pacientes Activos" 
                        value={stats.total_patients}
                        icon={Users}
                        trend="+3"
                        color="text-purple-600"
                        bgColor="bg-purple-100"
                    />
                    <StatCard 
                        title="Sesiones Ejecutadas" 
                        value={stats.completed_sessions_month}
                        icon={Target}
                        trend="+45"
                        color="text-green-600"
                        bgColor="bg-green-100"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* REVENUE CHART */}
                    <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="enterprise-label !text-gray-900">Curva de Ingresos</h3>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Progresión mensual de cobros completados</p>
                            </div>
                            <TrendingUp className="w-5 h-5 text-brand-primary opacity-30" />
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3292b3" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3292b3" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 900, fill: '#858793'}} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 900, fill: '#858793'}} 
                                        tickFormatter={(val) => `$${val/1000}k`}
                                    />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        labelStyle={{fontWeight: 900, textTransform: 'uppercase', fontSize: '10px'}}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#3292b3" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* DISTRIBUTION CHART */}
                    <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                        <div className="mb-8">
                            <h3 className="enterprise-label !text-gray-900">Mix de Servicios</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Distribución por tipo de prestación</p>
                        </div>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 space-y-3">
                            {distributionData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-tight truncate max-w-[120px]">{item.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-900 font-mono">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, icon: Icon, trend, color, bgColor }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className={`absolute top-0 right-0 w-24 h-24 ${bgColor} opacity-20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex items-start justify-between relative z-10">
                <div className={`p-3 ${bgColor} ${color} rounded-2xl shadow-sm transform group-hover:rotate-6 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="text-[9px] font-black">{trend}</span>
                </div>
            </div>
            <div className="mt-6 relative z-10">
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] mb-1 opacity-60">{title}</p>
                <p className={`text-2xl font-black text-gray-900 tracking-tight`}>{value}</p>
            </div>
        </div>
    );
}
