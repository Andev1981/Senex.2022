// resources/js/pages/kine-mobile/Partials/PatientCard.jsx
import React from "react";
import { Phone, Activity, ChevronRight, CheckCircle, Clock, AlertCircle } from "lucide-react";

const AVATAR_COLORS = [
    "from-violet-500 to-purple-600",
    "from-teal-400 to-cyan-600",
    "from-rose-400 to-pink-600",
    "from-amber-400 to-orange-500",
    "from-blue-500 to-indigo-600",
    "from-emerald-400 to-green-600",
];

function getAvatarColor(name = "") {
    const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx] ?? AVATAR_COLORS[0];
}

function getInitials(name = "") {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function ProgressRing({ percentage, size = 44, colorClass = "text-teal-500" }) {
    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percentage / 100) * circ;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-slate-100"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={`${colorClass} transition-all duration-700`}
            />
        </svg>
    );
}

export default function PatientCard({ patient, onClick }) {
    const hasActiveTreatment = !!patient.active_treatment;
    const progressStr = patient.active_treatment?.progress ?? "0/0";
    const [completed, total] = progressStr.includes("∞")
        ? [patient.completed_sessions, null]
        : progressStr.split("/").map(Number);
    const percentage = total && total > 0 ? Math.round((completed / total) * 100) : 0;
    const avatarColor = getAvatarColor(patient.name);

    const pendingSOAP =
        patient.total_sessions > 0 &&
        patient.completed_sessions < patient.total_sessions &&
        hasActiveTreatment;

    const isCompleted = hasActiveTreatment && patient.active_treatment.status === 'completed';
    const isEvaluation = hasActiveTreatment && patient.active_treatment.status === 'evaluation';

    return (
        <div
            onClick={onClick}
            className={`group relative bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                isCompleted ? 'hover:border-slate-300' : isEvaluation ? 'hover:border-blue-200' : 'hover:border-teal-200'
            }`}
        >
            {/* Accent top bar */}
            {hasActiveTreatment && (
                <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-b-full bg-gradient-to-r ${
                    isCompleted
                        ? 'from-slate-300 to-slate-400'
                        : isEvaluation
                        ? 'from-blue-400 to-indigo-400'
                        : 'from-teal-400 to-cyan-400'
                }`} />
            )}

            {/* Header row */}
            <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div
                    className={`relative flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-black text-sm shadow-sm`}
                >
                    {getInitials(patient.name)}
                    {hasActiveTreatment && (
                        <span className={`absolute -top-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                            isCompleted ? 'bg-slate-400' : isEvaluation ? 'bg-blue-400' : 'bg-teal-400'
                        }`} />
                    )}
                </div>

                {/* Name & RUT */}
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-slate-900 text-sm leading-tight truncate transition-colors ${
                        isCompleted ? 'group-hover:text-slate-700' : isEvaluation ? 'group-hover:text-blue-700' : 'group-hover:text-teal-700'
                    }`}>
                        {patient.name}
                    </h3>
                    {patient.rut && (
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{patient.rut}</p>
                    )}
                    {patient.phone && (
                        <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3 text-slate-300" />
                            <span className="text-xs text-slate-400">{patient.phone}</span>
                        </div>
                    )}
                </div>

                <ChevronRight className={`w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1 ${
                    isCompleted ? 'group-hover:text-slate-500' : isEvaluation ? 'group-hover:text-blue-500' : 'group-hover:text-teal-500'
                }`} />
            </div>

            {/* Treatment block */}
            {hasActiveTreatment ? (
                <div className={`bg-gradient-to-br rounded-xl p-3 border ${
                    isCompleted
                        ? 'from-slate-50 to-slate-100/50 border-slate-200/60'
                        : isEvaluation
                        ? 'from-blue-50 to-indigo-50 border-blue-100'
                        : 'from-teal-50 to-cyan-50 border-teal-100'
                }`}>
                    <div className="flex items-center gap-3">
                        {/* Progress ring */}
                        {total !== null ? (
                            <div className="relative flex-shrink-0">
                                <ProgressRing
                                    percentage={percentage}
                                    size={44}
                                    colorClass={isCompleted ? 'text-slate-400' : isEvaluation ? 'text-blue-500' : 'text-teal-500'}
                                />
                                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${
                                    isCompleted ? 'text-slate-600' : isEvaluation ? 'text-blue-700' : 'text-teal-700'
                                }`}>
                                    {percentage}%
                                </span>
                            </div>
                        ) : (
                            <div className="w-11 h-11 flex items-center justify-center">
                                <Activity className={`w-5 h-5 ${
                                    isCompleted ? 'text-slate-400' : isEvaluation ? 'text-blue-500' : 'text-teal-500'
                                }`} />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${
                                isCompleted ? 'text-slate-500' : isEvaluation ? 'text-blue-600' : 'text-teal-600'
                            }`}>
                                {isCompleted ? 'Tratamiento Finalizado' : isEvaluation ? 'En Evaluación' : 'Tratamiento Activo'}
                            </p>
                            <p className="text-xs font-semibold text-slate-800 truncate">
                                {patient.active_treatment.session_type}
                            </p>
                            {patient.active_treatment.diagnosis && (
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {patient.active_treatment.diagnosis}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Session progress bar */}
                    {total !== null && (
                        <div className="mt-2">
                            <div className={`flex justify-between text-[10px] font-semibold mb-1 ${
                                isCompleted ? 'text-slate-500' : isEvaluation ? 'text-blue-600' : 'text-teal-600'
                            }`}>
                                <span>{completed} sesiones completadas</span>
                                <span>{total} total</span>
                            </div>
                            <div className="h-1.5 bg-white rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                        isCompleted
                                            ? 'bg-slate-400'
                                            : isEvaluation
                                            ? 'bg-gradient-to-r from-blue-400 to-indigo-400'
                                            : 'bg-gradient-to-r from-teal-400 to-cyan-400'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-xs text-slate-400 font-medium">Sin tratamiento activo</span>
                </div>
            )}

            {/* Stats footer */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-[11px] text-slate-500 font-medium">
                        <span className="font-bold text-slate-700">{patient.total_sessions}</span> sesiones
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-slate-500 font-medium">
                        <span className="font-bold text-emerald-600">{patient.completed_sessions}</span> completadas
                    </span>
                </div>
            </div>
        </div>
    );
}
