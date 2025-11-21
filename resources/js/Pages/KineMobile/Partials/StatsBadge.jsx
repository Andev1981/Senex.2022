// resources/js/Pages/KineMobile/Components/StatsBadge.jsx
import React from "react";

const colorClasses = {
  gray: "bg-gray-100 text-gray-700 border-gray-200",
  green: "bg-green-100 text-green-700 border-green-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  red: "bg-red-100 text-red-700 border-red-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200",
};

export default function StatsBadge({
  icon: Icon,
  label,
  value,
  color = "gray",
}) {
  return (
    <div className={`p-2 border rounded-lg text-center ${colorClasses[color]}`}>
      <Icon className="w-4 h-4 mx-auto mb-1" />
      <p className="text-xs font-medium">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
