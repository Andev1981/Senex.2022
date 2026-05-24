import React from "react";
import { Head, router } from "@inertiajs/react";
import { 
  ChevronLeft, 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Download,
  Calendar,
  User,
  CreditCard
} from "lucide-react";
import KineLayout from "@/Layouts/KineLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function MyWallet({ payrolls, pending_attentions, totals }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const Content = (
    <div className={`min-h-screen ${isDesktop ? 'p-8' : ''} bg-[#FDFDFD]`}>
        <Head title="Mi Billetera" />
        
        {/* Header con Back Button */}
        <div className={`${isDesktop ? 'mb-8' : 'px-6 py-6 flex items-center gap-4'}`}>
            {!isDesktop && (
                <button
                    onClick={() => router.visit(route('kine.my-profile'))}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-90 transition-all"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                </button>
            )}
            <h1 className={`${isDesktop ? 'text-3xl' : 'text-2xl'} font-black text-slate-900 tracking-tight`}>Mi Billetera</h1>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:px-0">
            {/* Resumen de Saldo Principal */}
            <div className={`${isDesktop ? 'lg:col-span-4' : 'px-6 mb-8'}`}>
                <div className="bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-slate-200 relative overflow-hidden">
                    {/* Círculo decorativo de fondo */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Por Liquidar</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-white text-4xl font-black tracking-tighter">
                                ${totals.pending_payout.toLocaleString('es-CL')}
                            </span>
                            <span className="text-brand-primary text-xs font-bold bg-brand-primary/20 px-2 py-0.5 rounded-full">CLP</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                            <div>
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Total Pagado</p>
                                <p className="text-white font-bold text-sm">${totals.total_paid.toLocaleString('es-CL')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Atenciones</p>
                                <p className="text-white font-bold text-sm">{pending_attentions.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {isDesktop && (
                    <div className="mt-8 p-6 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Información de Pago</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                            Las liquidaciones se generan automáticamente al finalizar el periodo mensual. Asegúrate de cerrar todas tus fichas SOAP para que sean incluidas.
                        </p>
                    </div>
                )}
            </div>

            {/* Listados */}
            <div className={`${isDesktop ? 'lg:col-span-8' : 'px-6 space-y-8 pb-10'}`}>
                
                {/* 1. Atenciones Pendientes de Pago */}
                <section className={isDesktop ? 'mb-10' : ''}>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Últimas Atenciones</h3>
                        <span className="text-[10px] font-bold text-brand-primary">Pendientes</span>
                    </div>
                    
                    <div className={`grid grid-cols-1 ${isDesktop ? 'md:grid-cols-2' : ''} gap-3`}>
                        {pending_attentions.length === 0 ? (
                            <div className="col-span-full p-8 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No tienes atenciones pendientes de pago</p>
                            </div>
                        ) : (
                            pending_attentions.map(session => (
                                <div key={session.id} className="bg-white border border-slate-50 p-4 rounded-[28px] shadow-sm flex items-center justify-between hover:border-brand-primary/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 leading-none uppercase truncate max-w-[120px]">{session.patient}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{session.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900 tracking-tight">${session.amount.toLocaleString('es-CL')}</p>
                                        <p className="text-[8px] font-bold text-teal-600 uppercase mt-1">Acumulado</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* 2. Liquidaciones Oficiales */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Liquidaciones Históricas</h3>
                    </div>
                    
                    <div className={`grid grid-cols-1 ${isDesktop ? 'md:grid-cols-2' : ''} gap-4`}>
                        {payrolls.length === 0 ? (
                            <div className="col-span-full p-8 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Aún no se han generado liquidaciones oficiales</p>
                            </div>
                        ) : (
                            payrolls.map(payroll => (
                                <div key={payroll.id} className="bg-white border border-slate-100 p-5 rounded-[32px] shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-brand-primary shadow-lg">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 tracking-tight">Periodo {payroll.period}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Generada el {payroll.date}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                            payroll.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {payroll.status === 'paid' ? 'Pagado' : 'Procesando'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <p className="text-lg font-black text-slate-900 tracking-tighter">${payroll.amount.toLocaleString('es-CL')}</p>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                                            <Download className="w-3 h-3" /> PDF
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </div>
        </div>
    </div>
  );

  return isDesktop ? (
    <AuthenticatedLayout>{Content}</AuthenticatedLayout>
  ) : (
    <KineLayout>{Content}</KineLayout>
  );
}
