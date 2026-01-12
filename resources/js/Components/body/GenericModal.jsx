import React from 'react';

export default function GenericModal({ isOpen, onClose, children }) {
    if (!isOpen) return null;


    return (
        // CAMBIO: z-[100] para asegurar que esté sobre el modal anterior
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            
            {/* Animación de entrada simple */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">
                <div className="p-6 relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    {children}
                </div>
            </div>
        </div>
    );
}