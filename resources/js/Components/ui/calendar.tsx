import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Importamos los estilos base esenciales de v9
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        // Contenedores principales
        months: "flex flex-col sm:flex-row gap-8",
        month: "space-y-4",
        
        // Cabecera (Mes y Navegación)
        month_caption: "flex justify-center pt-1 relative items-center h-10",
        caption_label: "text-sm font-bold text-foreground",
        
        // Navegación
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 z-10 border-none shadow-none"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 z-10 border-none shadow-none"
        ),
        
        // Grilla de días
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex mb-2",
        weekday: "text-muted-foreground rounded-md w-9 font-medium text-[0.75rem] uppercase text-center",
        week: "flex w-full mt-1",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 transition-all flex items-center justify-center rounded-md cursor-pointer hover:bg-muted"
        ),
        
        // Estados de selección (Estilo Celeste/Azul)
        day_button: "h-full w-full flex items-center justify-center rounded-md",
        selected: "bg-blue-600! text-white! rounded-md!", // Forzado con ! para Tailwind 4
        range_start: "rounded-l-md rounded-r-none bg-blue-600 text-white",
        range_end: "rounded-r-md rounded-l-none bg-blue-600 text-white",
        range_middle: "bg-blue-50! text-blue-700! rounded-none!",
        
        // Otros estados
        today: "text-blue-600 font-bold underline underline-offset-4",
        outside: "text-muted-foreground opacity-30",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
