import React, { useState } from 'react';

export default function HandSelector({ side = 'left', onChange, onClose }) {
    const [selectedFinger, setSelectedFinger] = useState(null);

    // Zonas de la mano (Izquierda por defecto, usar transform para derecha)
    // ViewBox optimizado: 0 0 320 420
    const HAND_ZONES = {
        // --- DEDO MEÑIQUE (Pinky) - Más grueso ---
        pinky_distal:   { id: 'pinky_distal',   label: 'Meñique - Distal',  path: "M260,130 C260,110 295,110 295,130 L295,155 L260,155 Z" },
        pinky_middle:   { id: 'pinky_middle',   label: 'Meñique - Media',   path: "M260,155 L295,155 L295,190 L260,190 Z" },
        pinky_proximal: { id: 'pinky_proximal', label: 'Meñique - Proximal',path: "M260,190 L295,190 L295,225 C295,230 260,230 260,225 Z" },

        // --- DEDO ANULAR (Ring) - Más grueso ---
        ring_distal:   { id: 'ring_distal',   label: 'Anular - Distal',  path: "M205,75 C205,55 245,55 245,75 L245,115 L205,115 Z" },
        ring_middle:   { id: 'ring_middle',   label: 'Anular - Media',   path: "M205,115 L245,115 L245,165 L205,165 Z" },
        ring_proximal: { id: 'ring_proximal', label: 'Anular - Proximal',path: "M205,165 L245,165 L245,215 C245,220 205,220 205,215 Z" },

        // --- DEDO MEDIO (Middle) - Más grueso ---
        middle_distal:   { id: 'middle_distal',   label: 'Medio - Distal',  path: "M150,55 C150,35 190,35 190,55 L190,100 L150,100 Z" },
        middle_middle:   { id: 'middle_middle',   label: 'Medio - Media',   path: "M150,100 L190,100 L190,155 L150,155 Z" },
        middle_proximal: { id: 'middle_proximal', label: 'Medio - Proximal',path: "M150,155 L190,155 L190,210 C190,215 150,215 150,210 Z" },

        // --- DEDO ÍNDICE (Index) - Más grueso ---
        index_distal:   { id: 'index_distal',   label: 'Índice - Distal',  path: "M95,80 C95,60 135,60 135,80 L135,120 L95,120 Z" },
        index_middle:   { id: 'index_middle',   label: 'Índice - Media',   path: "M95,120 L135,120 L135,170 L95,170 Z" },
        index_proximal: { id: 'index_proximal', label: 'Índice - Proximal',path: "M95,170 L135,170 L135,215 C135,220 95,220 95,215 Z" },

        // --- PULGAR (Thumb) - Rediseño Anatómico Proporcional ---
        thumb_distal:   { id: 'thumb_distal',   label: 'Pulgar - Distal',  path: "M30,165 C20,145 55,120 75,135 L95,160 L55,195 C45,190 30,165 30,165 Z" },
        thumb_proximal: { id: 'thumb_proximal', label: 'Pulgar - Proximal',path: "M75,135 L115,115 L135,165 L95,160 Z" },

        // --- PALMA ---
        palm_thenar:    { id: 'palm_thenar',    label: 'Eminencia Tenar', path: "M50,195 L90,165 L125,160 L135,215 L120,320 L90,340 C60,300 40,240 50,195 Z" },
        palm_center:    { id: 'palm_center',    label: 'Palma Central',   path: "M95,215 L135,215 L150,210 L190,210 L205,215 L245,215 L260,225 L250,290 L120,320 Z" },
        palm_hypothenar:{ id: 'palm_hypothenar',label: 'Eminencia Hipotenar', path: "M260,225 L295,225 L280,310 L240,350 L200,360 L250,290 Z" },
        
        wrist:          { id: 'wrist',          label: 'Muñeca',          path: "M90,340 L200,360 L240,350 L250,400 L80,400 Z" }
    };

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4">Seleccione zona de la Mano {side === 'left' ? 'Izquierda' : 'Derecha'}</h3>
            
            <svg viewBox="0 0 320 420" className="w-64 h-auto drop-shadow-xl" style={{ transform: side === 'right' ? 'scaleX(-1)' : 'none' }}>
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                {Object.entries(HAND_ZONES).map(([key, zone]) => (
                    <path
                        key={key}
                        d={zone.path}
                        fill={selectedFinger === zone.id ? '#fca5a5' : '#f8fafc'}
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        className="cursor-pointer hover:fill-red-50 transition-all duration-200 hover:stroke-red-300"
                        onClick={() => setSelectedFinger(zone.id)}
                    >
                        <title>{zone.label}</title>
                    </path>
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