import React from 'react';
import { MapPin } from 'lucide-react';
import BodySelector from "@/Components/Body/BodySelector";

export default function PainMapCard({
    // Datos (Props)
    points = [],
    painLevel = 0,
    bodyPart = "",
    laterality = "",
    isLocked = false,
    
    // Funciones (Callbacks)
    onPointsChange,
    onPainLevelChange,
    onBodyPartChange,
    onLateralityChange,
    onBodyPartClick, // Para abrir el modal de manos
    
    // Opcionales
    title = "Mapa Corporal"
}) {
    return (
        <div className="bg-white border-2 border-brand-secondary/20 rounded-[2.5rem] p-6 shadow-md h-full">
            
            {/* Header de la Tarjeta */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="enterprise-label !text-brand-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {title}
                </h3>
                
                {/* Botón Limpiar (Solo si hay puntos y no está bloqueado) */}
                {points.length > 0 && !isLocked && (
                    <button 
                        type="button" 
                        onClick={() => onPointsChange([])} 
                        className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {/* Selector Visual (BodySelector) */}
            <div className="bg-gray-50/50 rounded-[2rem] border border-gray-100 shadow-inner flex justify-center mb-8 relative overflow-hidden min-h-[380px]">
                <BodySelector
                    initialData={points}
                    onChange={onPointsChange}
                    onPartClick={onBodyPartClick} 
                    mode={isLocked ? "read" : "edit"}
                />
                {!isLocked && (
                    <div className="absolute bottom-4 right-4">
                        <span className="text-[9px] text-brand-primary/80 font-bold uppercase tracking-widest bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm border border-brand-primary/10">
                            Click en manos para detalle
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Escala EVA */}
                <div className="p-5 bg-gray-50/30 rounded-2xl border border-gray-100">
                    <div className="flex justify-between mb-4">
                        <label className="enterprise-label opacity-60">Nivel de Dolor (EVA)</label>
                        <span className={`font-black text-2xl font-mono ${painLevel > 7 ? 'text-red-500' : 'text-brand-primary'}`}>
                            {painLevel || 0} <span className="text-sm text-gray-300">/10</span>
                        </span>
                    </div>
                    <input
                        type="range" min="0" max="10"
                        value={painLevel || 0}
                        onChange={(e) => onPainLevelChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                        disabled={isLocked}
                    />
                     <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase mt-2 tracking-widest">
                        <span>Sin Dolor</span>
                        <span>Dolor Máximo</span>
                    </div>
                </div>

                {/* Inputs de Texto (Zona y Lado) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="ml-1 enterprise-label opacity-60 text-[10px]">Zona Anatómica</label>
                        <input 
                            type="text" 
                            value={bodyPart} 
                            onChange={(e) => onBodyPartChange(e.target.value)} 
                            className="w-full px-4 py-3 font-mono text-xs font-bold text-gray-700 border-gray-100 shadow-sm rounded-xl bg-gray-50/50 focus:bg-white focus:ring-brand-primary transition-all" 
                            placeholder="Ej: Hombro" 
                            disabled={isLocked} 
                        />
                    </div>
                    <div>
                        <label className="ml-1 enterprise-label opacity-60 text-[10px]">Lateralidad</label>
                        <select 
                            value={laterality} 
                            onChange={(e) => onLateralityChange(e.target.value)} 
                            className="w-full px-4 py-3 font-mono text-xs font-bold text-gray-700 border-gray-100 shadow-sm rounded-xl bg-gray-50/50 focus:bg-white focus:ring-brand-primary transition-all" 
                            disabled={isLocked}
                        >
                            <option value="">-</option>
                            <option value="Izquierda">Izquierda</option>
                            <option value="Derecha">Derecha</option>
                            <option value="Bilateral">Bilateral</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}