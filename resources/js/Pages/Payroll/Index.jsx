import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { NotebookText, Plus, Search } from "lucide-react";
import PayrollTable from "./Components/PayrollTable";
import PayrollFormModal from "./Modals/PayrollFormModal";

export default function Index({ payrolls, doctors }) {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Liquidaciones de Honorarios" />
            <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
                {/* HEADER HERO */}
                <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
                                <NotebookText className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Cierre de Honorarios</h1>
                                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                                    Liquidaciones & Auditoría de Producción • Senex Enterprise
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsFormModalOpen(true)}
                                className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Generar Nuevo Corte
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABLA TANSTACK */}
                <PayrollTable payrolls={payrolls} />

                {/* MODAL INTELIGENTE */}
                <PayrollFormModal 
                    show={isFormModalOpen} 
                    onClose={() => setIsFormModalOpen(false)} 
                    doctors={doctors}
                />
            </div>
        </AuthenticatedLayout>
    );
}
