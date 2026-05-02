import React, { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";

/**
 * Componente SideModal Enterprise (Lateral)
 * @param {Object} props
 * @param {boolean} props.open - Estado de visibilidad
 * @param {function} props.onClose - Función para cerrar
 * @param {string} props.title - Título principal (Estilo Hero)
 * @param {string} props.subtitle - Subtítulo secundario (Estilo Hero)
 * @param {React.ElementType} props.icon - Icono de Lucide para el Hero
 * @param {React.ReactNode} props.footer - Contenido para el footer fijo (botones)
 * @param {string} props.width - Ancho (sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, full)
 */
export default function SideModal({
  children,
  open = false,
  onClose,
  title,
  subtitle,
  icon: Icon,
  footer,
  width = "md",
  hideDefaultHeader = false, // Nueva prop, por defecto false
}) {
  const widthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    full: "max-w-full w-full",
  }[width];

  return (
    <Transition show={!!open} leave="duration-200">
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop con desenfoque */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel
                  className={`pointer-events-auto w-screen ${widthClass}`}
                >
                  <div className="flex flex-col h-full bg-white shadow-2xl relative overflow-hidden">
                    {/* 1. HEADER HERO PREMIUM (RENDERIZADO CONDICIONALMENTE) */}
                    {!hideDefaultHeader && (title ? (
                        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            
                            <div className="flex items-center gap-4 relative z-10">
                                {Icon && (
                                    <div className="p-2.5 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20 transform rotate-3">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                                        {title}
                                    </h2>
                                    {subtitle && (
                                        <p className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em] opacity-60">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2.5 text-gray-400 hover:text-brand-primary hover:bg-white rounded-xl transition-all active:scale-90 border border-transparent hover:border-gray-100 shadow-sm relative z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        /* Botón de cierre discreto si no hay título */
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2.5 text-gray-400 hover:text-brand-primary bg-white/80 backdrop-blur rounded-xl transition-all active:scale-90 border border-gray-100 shadow-xl"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    ))}

                    {/* 2. CONTENIDO SCROLLABLE */}
                    <div className={`flex-1 flex flex-col min-h-0 ${!hideDefaultHeader && title ? 'p-8 overflow-y-auto custom-scrollbar' : 'p-0 overflow-hidden'}`}>
                      {children}
                    </div>

                    {/* 3. FOOTER FIJO (Opcional) */}
                    {footer && (
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                            {footer}
                        </div>
                    )}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}