import React, { Fragment, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";

export default function SideModal({
  children,
  open,
  onClose,
  title,
  description,
  width = "md",
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

  const addButtonRef = useRef(null);

  return (
    <Transition show={open} leave="duration-200">
      <Dialog
        onClose={onClose}
        className="relative z-50"
        initialFocus={addButtonRef}
      >
        {/* Fondo oscuro */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        {/* Contenedor del modal lateral */}
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
                  <div className="flex flex-col h-full bg-white shadow-xl dark:bg-gray-800">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <label className="text-lg font-bold text-primary-light">
                          {title}
                        </label>
                      </div>
                      <button
                        onClick={onClose}
                        className="px-2 py-1.5 border border-primary text-primary rounded-lg text-sm font-medium leading-4 bg-white hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        X
                      </button>
                    </div>

                    {/* Descripción opcional */}
                    {description && (
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {description}
                        </p>
                      </div>
                    )}

                    {/* Contenido del modal con scroll */}
                    <div className="flex-1 px-4 py-4 overflow-y-auto">
                      {children}
                    </div>
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
