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
        // --- VISTA FRONTAL (X: 0 - 200) ---
        head_front: { id: 'head_neck', path: "M150,15 C138,15 130,25 130,40 C130,55 138,62 142,64 L158,64 C162,62 170,55 170,40 C170,25 162,15 150,15 Z" }, 
        neck_front: { id: 'head_neck', path: "M142,64 L142,72 C142,75 158,75 158,72 L158,64 Z" },
        
        shoulder_left_front: { id: 'shoulder', path: "M142,72 L120,78 L115,95 L130,95 L142,85 Z" },
        shoulder_right_front: { id: 'shoulder', path: "M158,72 L180,78 L185,95 L170,95 L158,85 Z" },
        
        chest: { id: 'thoracic_spine', path: "M142,85 L158,85 L158,120 L142,120 Z M130,95 L142,85 L142,120 L130,115 Z M170,95 L158,85 L158,120 L170,115 Z" }, 
        abdomen: { id: 'abdomen', path: "M130,115 L142,120 L158,120 L170,115 L165,145 L135,145 Z" },
        
        arm_left_front: { id: 'arm_elbow', path: "M120,78 L108,115 L118,118 L125,90 L130,95 Z" },
        arm_right_front: { id: 'arm_elbow', path: "M180,78 L192,115 L182,118 L175,90 L170,95 Z" },
        
        forearm_left_front: { id: 'arm_elbow', path: "M108,115 L100,150 L110,155 L118,118 Z" },
        forearm_right_front: { id: 'arm_elbow', path: "M192,115 L200,150 L190,155 L182,118 Z" },
        
        /* 
        hand_left_front: { id: 'wrist_hand', path: "M100,150 L95,170 L105,170 L110,155 Z" },
        hand_right_front: { id: 'wrist_hand', path: "M200,150 L205,170 L195,170 L190,155 Z" },
        */
        
        hip_front: { id: 'hip', path: "M135,145 L165,145 L170,165 L130,165 Z" },
        
        thigh_left_front: { id: 'thigh', path: "M130,165 L148,165 L145,215 L125,215 Z" },
        thigh_right_front: { id: 'thigh', path: "M152,165 L170,165 L175,215 L155,215 Z" },
        
        knee_left_front: { id: 'knee', path: "M125,215 L145,215 L143,235 L127,235 Z" },
        knee_right_front: { id: 'knee', path: "M155,215 L175,215 L173,235 L157,235 Z" },
        
        leg_left_front: { id: 'leg_ankle', path: "M127,235 L143,235 L140,285 L128,285 Z" },
        leg_right_front: { id: 'leg_ankle', path: "M157,235 L173,235 L172,285 L160,285 Z" },
        
        foot_left_front: { id: 'foot', path: "M128,285 L140,285 L145,300 L125,300 Z" },
        foot_right_front: { id: 'foot', path: "M160,285 L172,285 L175,300 L155,300 Z" },

        // --- VISTA TRASERA (Offset X + 150 -> Center at 300) ---
        head_back: { id: 'head_neck', path: "M300,15 C288,15 280,25 280,40 C280,55 288,62 292,64 L308,64 C312,62 320,55 320,40 C320,25 312,15 300,15 Z" },
        neck_back: { id: 'head_neck', path: "M292,64 L292,72 C292,75 308,75 308,72 L308,64 Z" },
        
        shoulder_left_back: { id: 'shoulder', path: "M292,72 L270,78 L265,95 L280,95 L292,85 Z" },
        shoulder_right_back: { id: 'shoulder', path: "M308,72 L330,78 L335,95 L320,95 L308,85 Z" },
        
        thoracic_back: { id: 'thoracic_spine', path: "M292,85 L308,85 L308,120 L292,120 Z M280,95 L292,85 L292,120 L280,115 Z M320,95 L308,85 L308,120 L320,115 Z" },
        lumbar_back: { id: 'lumbar_spine', path: "M280,115 L292,120 L308,120 L320,115 L315,145 L285,145 Z" },
        
        arm_left_back: { id: 'arm_elbow', path: "M270,78 L258,115 L268,118 L275,90 L280,95 Z" },
        arm_right_back: { id: 'arm_elbow', path: "M330,78 L342,115 L332,118 L325,90 L320,95 Z" },
        
        forearm_left_back: { id: 'arm_elbow', path: "M258,115 L250,150 L260,155 L268,118 Z" },
        forearm_right_back: { id: 'arm_elbow', path: "M342,115 L350,150 L340,155 L332,118 Z" },
        
        /*
        hand_left_back: { id: 'wrist_hand', path: "M250,150 L245,170 L255,170 L260,155 Z" },
        hand_right_back: { id: 'wrist_hand', path: "M350,150 L355,170 L345,170 L340,155 Z" },
        */
        
        glutes_back: { id: 'hip', path: "M285,145 L315,145 L320,170 L280,170 Z" },
        
        thigh_left_back: { id: 'thigh', path: "M280,170 L298,170 L295,215 L275,215 Z" },
        thigh_right_back: { id: 'thigh', path: "M302,170 L320,170 L325,215 L305,215 Z" },
        
        knee_left_back: { id: 'knee', path: "M275,215 L295,215 L293,235 L277,235 Z" }, // Popliteal
        knee_right_back: { id: 'knee', path: "M305,215 L325,215 L323,235 L307,235 Z" },
        
        leg_left_back: { id: 'leg_ankle', path: "M277,235 L293,235 L290,285 L278,285 Z" },
        leg_right_back: { id: 'leg_ankle', path: "M307,235 L323,235 L322,285 L310,285 Z" },
        
        foot_left_back: { id: 'foot', path: "M278,285 L290,285 L285,300 L265,300 Z" },
        foot_right_back: { id: 'foot', path: "M310,285 L322,285 L325,300 L305,300 Z" },
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
