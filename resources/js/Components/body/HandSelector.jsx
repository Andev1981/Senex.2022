import React, { useState } from 'react';

export default function HandSelector({ side = 'left', onChange, onClose }) {
    const [selectedFinger, setSelectedFinger] = useState(null);

    // Zonas de la mano (Izquierda por defecto, usar transform para derecha)
    const HAND_ZONES = {
        palm: { id: 'palm', label: 'Palma / Metacarpo', path: "M50,120 L30,100 L35,60 L75,60 L90,100 L70,140 L50,120 Z" },
        thumb: { id: 'thumb', label: 'Pulgar', path: "M30,100 L10,80 L15,60 L35,60 L30,100 Z" },
        index: { id: 'index_finger', label: 'Dedo Índice', path: "M35,60 L30,10 L45,10 L48,60 Z" },
        middle: { id: 'middle_finger', label: 'Dedo Medio', path: "M48,60 L48,5 L62,5 L62,60 Z" },
        ring: { id: 'ring_finger', label: 'Dedo Anular', path: "M62,60 L65,10 L78,10 L75,60 Z" },
        pinky: { id: 'little_finger', label: 'Meñique', path: "M75,60 L80,25 L90,30 L90,100 Z" }
    };

    // Nota: Los paths de arriba son ilustrativos simples. 
    // Para producción rápida, usaremos círculos sobre una imagen o SVG más complejo, 
    // pero aquí va una versión geométrica funcional.

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4">Seleccione zona de la Mano {side === 'left' ? 'Izquierda' : 'Derecha'}</h3>
            
            <svg viewBox="0 0 100 150" className="w-64 h-auto drop-shadow-lg" style={{ transform: side === 'right' ? 'scaleX(-1)' : 'none' }}>
                {Object.entries(HAND_ZONES).map(([key, zone]) => (
                    <path
                        key={key}
                        d={zone.path}
                        fill={selectedFinger === zone.id ? '#fca5a5' : '#f1f5f9'}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        className="cursor-pointer hover:fill-blue-100 transition-colors"
                        onClick={() => setSelectedFinger(zone.id)}
                    />
                ))}
            </svg>

            <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
                <button 
                    onClick={() => { onChange(selectedFinger); onClose(); }} 
                    className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                    disabled={!selectedFinger}
                >
                    Confirmar Selección
                </button>
            </div>
        </div>
    );
}