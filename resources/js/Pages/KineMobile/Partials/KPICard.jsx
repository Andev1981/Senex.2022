import React from "react";

const colorClasses = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  teal: "bg-teal-50 border-teal-200 text-teal-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  red: "bg-red-50 border-red-200 text-red-700",
};

export default function KPICard({
  icon: Icon,
  label,
  value,
  color = "blue",
  small = false,
}) {
  return (
    <div className={`p-4 border rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`font-medium mb-1 ${small ? "text-xs" : "text-sm"}`}>
            {label}
          </p>
          <p className={`font-bold ${small ? "text-lg" : "text-2xl"}`}>
            {value}
          </p>
        </div>
        <Icon className={`${small ? "w-5 h-5" : "w-6 h-6"} opacity-60`} />
      </div>
    </div>
  );
}
