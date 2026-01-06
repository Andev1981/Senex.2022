import React, { useState, useEffect } from 'react';

export default function BodySelector({ initialData = [], mode = 'edit', onChange }) {
    // initialData debería ser un array de objetos: { part: 'knee', x: 100, y: 200 }
    const [selectedPoints, setSelectedPoints] = useState(initialData || []);

    useEffect(() => {
        if (initialData) {
            setSelectedPoints(initialData);
        }
    }, [initialData]);

    const handlePartClick = (partId, e) => {
        if (mode === 'read') return;

        // Obtener el SVG y sus dimensiones reales en pantalla
        const svg = e.currentTarget.closest('svg');
        const rect = svg.getBoundingClientRect();
        
        // El viewBox es 0 0 400 320
        const viewBoxWidth = 400;
        const viewBoxHeight = 320;

        // Calcular la escala entre el tamaño visual y el viewBox
        const scaleX = viewBoxWidth / rect.width;
        const scaleY = viewBoxHeight / rect.height;

        // Calcular coordenadas relativas al viewBox
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const newPoint = {
            part: partId,
            x: x,
            y: y
        };

        const newPoints = [...selectedPoints, newPoint];
        setSelectedPoints(newPoints);
        
        if (onChange) {
            onChange(newPoints);
        }
    };

    const removePoint = (index, e) => {
        if (mode === 'read') return;
        e.stopPropagation();
        const newPoints = selectedPoints.filter((_, i) => i !== index);
        setSelectedPoints(newPoints);
        if (onChange) {
            onChange(newPoints);
        }
    };

    // Mapeo de zonas visuales a las constantes de Laravel
    const ZONES = {
        // --- VISTA FRONTAL ---
        head_front: { id: 'head_neck', path: "M135,30 Q135,5 150,5 Q165,5 165,30 Q165,45 150,55 Q135,45 135,30 Z" }, 
        neck_front: { id: 'head_neck', path: "M142,55 L158,55 L158,65 L142,65 Z" },
        
        shoulder_left_front: { id: 'shoulder', path: "M142,65 L120,75 L125,90 L142,80 Z" },
        shoulder_right_front: { id: 'shoulder', path: "M158,65 L180,75 L175,90 L158,80 Z" },
        
        chest: { id: 'thoracic_spine', path: "M142,80 L158,80 L158,110 L142,110 Z M125,90 L142,80 L142,110 L130,110 Z M175,90 L158,80 L158,110 L170,110 Z" }, // Simplificado
        abdomen: { id: 'abdomen', path: "M130,110 L170,110 L165,140 L135,140 Z" },
        
        arm_left_front: { id: 'arm_elbow', path: "M120,75 L105,120 L115,125 L125,90 Z" }, // Brazo
        arm_right_front: { id: 'arm_elbow', path: "M180,75 L195,120 L185,125 L175,90 Z" },
        
        forearm_left_front: { id: 'arm_elbow', path: "M105,120 L95,155 L105,160 L115,125 Z" },
        forearm_right_front: { id: 'arm_elbow', path: "M195,120 L205,155 L195,160 L185,125 Z" },
        
        hand_left_front: { id: 'wrist_hand', path: "M95,155 L90,175 L100,175 L105,160 Z" },
        hand_right_front: { id: 'wrist_hand', path: "M205,155 L210,175 L200,175 L195,160 Z" },
        
        hip_front: { id: 'hip', path: "M135,140 L165,140 L170,160 L130,160 Z" },
        
        thigh_left_front: { id: 'thigh', path: "M130,160 L145,160 L142,210 L125,210 Z" },
        thigh_right_front: { id: 'thigh', path: "M155,160 L170,160 L175,210 L158,210 Z" },
        
        knee_left_front: { id: 'knee', path: "M125,210 L142,210 L140,230 L123,230 Z" },
        knee_right_front: { id: 'knee', path: "M158,210 L175,210 L177,230 L160,230 Z" },
        
        leg_left_front: { id: 'leg_ankle', path: "M123,230 L140,230 L138,280 L125,280 Z" },
        leg_right_front: { id: 'leg_ankle', path: "M160,230 L177,230 L175,280 L162,280 Z" },
        
        foot_left_front: { id: 'foot', path: "M125,280 L138,280 L135,295 L120,295 Z" },
        foot_right_front: { id: 'foot', path: "M162,280 L175,280 L180,295 L165,295 Z" },

        // --- VISTA TRASERA (Offset X + 150) ---
        head_back: { id: 'head_neck', path: "M285,30 Q285,5 300,5 Q315,5 315,30 Q315,45 300,55 Q285,45 285,30 Z" },
        neck_back: { id: 'head_neck', path: "M292,55 L308,55 L308,65 L292,65 Z" },
        
        shoulder_left_back: { id: 'shoulder', path: "M292,65 L270,75 L275,90 L292,80 Z" },
        shoulder_right_back: { id: 'shoulder', path: "M308,65 L330,75 L325,90 L308,80 Z" },
        
        thoracic_back: { id: 'thoracic_spine', path: "M292,80 L308,80 L308,110 L292,110 Z M275,90 L292,80 L292,110 L280,110 Z M325,90 L308,80 L308,110 L320,110 Z" },
        lumbar_back: { id: 'lumbar_spine', path: "M280,110 L320,110 L315,140 L285,140 Z" },
        
        arm_left_back: { id: 'arm_elbow', path: "M270,75 L255,120 L265,125 L275,90 Z" },
        arm_right_back: { id: 'arm_elbow', path: "M330,75 L345,120 L335,125 L325,90 Z" },
        
        forearm_left_back: { id: 'arm_elbow', path: "M255,120 L245,155 L255,160 L265,125 Z" },
        forearm_right_back: { id: 'arm_elbow', path: "M345,120 L355,155 L345,160 L335,125 Z" },
        
        hand_left_back: { id: 'wrist_hand', path: "M245,155 L240,175 L250,175 L255,160 Z" },
        hand_right_back: { id: 'wrist_hand', path: "M355,155 L360,175 L350,175 L345,160 Z" },
        
        glutes_back: { id: 'hip', path: "M285,140 L315,140 L320,160 L280,160 Z" },
        
        thigh_left_back: { id: 'thigh', path: "M280,160 L295,160 L292,210 L275,210 Z" },
        thigh_right_back: { id: 'thigh', path: "M305,160 L320,160 L325,210 L308,210 Z" },
        
        knee_left_back: { id: 'knee', path: "M275,210 L292,210 L290,230 L273,230 Z" }, // Popliteal
        knee_right_back: { id: 'knee', path: "M308,210 L325,210 L327,230 L310,230 Z" },
        
        leg_left_back: { id: 'leg_ankle', path: "M273,230 L290,230 L288,280 L275,280 Z" },
        leg_right_back: { id: 'leg_ankle', path: "M310,230 L327,230 L325,280 L312,280 Z" },
        
        foot_left_back: { id: 'foot', path: "M275,280 L288,280 L285,295 L270,295 Z" },
        foot_right_back: { id: 'foot', path: "M312,280 L325,280 L330,295 L315,295 Z" },
    };

    return (
        <div className="w-full flex justify-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <svg 
                viewBox="0 0 400 320" 
                className="w-full h-auto max-w-[600px] select-none"
                style={{ cursor: mode === 'edit' ? 'crosshair' : 'default' }}
            >
                {/* Etiquetas */}
                <text x="150" y="315" textAnchor="middle" className="text-xs font-bold fill-gray-400 uppercase tracking-widest">Frontal</text>
                <text x="300" y="315" textAnchor="middle" className="text-xs font-bold fill-gray-400 uppercase tracking-widest">Posterior</text>

                {/* Zonas del Cuerpo */}
                {Object.entries(ZONES).map(([key, zone]) => {
                    // Verificar si esta zona está 'activa' (si algún punto cae dentro o está asociada)
                    // Para simplificar, coloreamos si la parte está en la lista de seleccionados
                    // O mejor, dibujamos el path base
                    const isHovered = false; // Implementar hover si se desea
                    
                    return (
                        <path
                            key={key}
                            d={zone.path}
                            fill="#f3f4f6" // gray-100
                            stroke="#d1d5db" // gray-300
                            strokeWidth="1"
                            className={`transition-colors duration-200 ${mode === 'edit' ? 'hover:fill-red-100 hover:stroke-red-300' : ''}`}
                            onClick={(e) => handlePartClick(zone.id, e)}
                        />
                    );
                })}

                {/* Puntos Marcados */}
                {selectedPoints.map((point, index) => (
                    <g key={index} onClick={(e) => removePoint(index, e)} className={mode === 'edit' ? 'cursor-pointer hover:opacity-80' : ''}>
                        <circle 
                            cx={point.x} 
                            cy={point.y} 
                            r="6" 
                            fill="rgba(239, 68, 68, 0.2)" // red-500 con opacidad (halo)
                        />
                        <circle 
                            cx={point.x} 
                            cy={point.y} 
                            r="3" 
                            fill="#ef4444" // red-500
                            stroke="white"
                            strokeWidth="1"
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}
