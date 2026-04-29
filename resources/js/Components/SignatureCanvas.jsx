import React, { useRef, useState, useEffect } from "react";
import { Eraser, Check, X, Ban } from "lucide-react";

export default function SignatureCanvas({ onSave, onCancel, onSkip }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Ajustar tamaño del canvas al contenedor
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 300; // Altura fija para la firma
      
      // Estilos de trazo
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = "#111827"; // Gray-900
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getPointerPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPointerPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    if (!hasSignature) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <button onClick={onCancel} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">Firma del Paciente</h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 p-4">
        <p className="mb-4 text-sm text-center text-gray-600">
          Por favor, solicite al paciente que firme en el recuadro de abajo.
        </p>

        <div className="relative w-full border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 h-[300px]">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full touch-none cursor-crosshair"
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
              <span className="text-sm font-medium text-gray-400">Firma aquí</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={clearCanvas}
            className="flex items-center justify-center gap-2 py-3 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
          >
            <Eraser className="w-5 h-5" />
            Limpiar
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasSignature}
            className="flex items-center justify-center gap-2 py-3 font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            Guardar Firma
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-3">¿El paciente no puede firmar o es de confianza?</p>
          <button
            onClick={onSkip}
            className="flex items-center justify-center gap-2 w-full py-3 font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100"
          >
            <Ban className="w-5 h-5" />
            Omitir Firma Digital
          </button>
        </div>
      </div>
    </div>
  );
}
