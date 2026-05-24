// resources/js/pages/kine-mobile/Partials/StatsBadge.jsx
import React from "react";

const colorClasses = {
  gray: {
    bg: "bg-slate-50",
    icon: "text-slate-400",
    text: "text-slate-600",
    label: "text-slate-400"
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-500",
    text: "text-green-700",
    label: "text-green-600/60"
  },
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-500",
    text: "text-blue-700",
    label: "text-blue-600/60"
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-500",
    text: "text-red-700",
    label: "text-red-600/60"
  },
  orange: {
    bg: "bg-orange-50",
    icon: "text-orange-500",
    text: "text-orange-700",
    label: "text-orange-600/60"
  },
  brand: {
    bg: "bg-brand-primary/5",
    icon: "text-brand-primary",
    text: "text-brand-primary",
    label: "text-brand-primary/60"
  },
};

export default function StatsBadge({
  icon: Icon,
  label,
  value,
  color = "gray",
  onClick,
}) {
  const theme = colorClasses[color] || colorClasses.gray;
  
  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={`w-full py-3 px-1 rounded-[24px] border border-transparent transition-all active:scale-95 ${theme.bg} ${!onClick ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white shadow-sm mb-0.5`}>
            <Icon className={`w-3.5 h-3.5 ${theme.icon}`} />
        </div>
        <span className={`text-[7px] font-black uppercase tracking-tighter ${theme.label} leading-none truncate w-full px-1`}>
          {label}
        </span>
        <span className={`text-sm font-black tracking-tighter ${theme.text} leading-none`}>
          {value}
        </span>
      </div>
    </button>
  );
}
