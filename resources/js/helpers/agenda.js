export const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const formatLocalDate = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isToday = (date) => {
  const t = new Date();
  return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
};

export const isDatePast = (date) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date); checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

export const getAppointmentsForDate = (date, appointments = []) => {
    const dateStr = formatLocalDate(date);
    return appointments.filter((apt) => apt.date === dateStr);
};

export const getNextHourTimes = () => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const endHour = new Date(nextHour);
    endHour.setHours(nextHour.getHours() + 1);
    return {
        start: nextHour.toTimeString().substring(0, 5),
        end: endHour.toTimeString().substring(0, 5)
    };
};

export const getStatusLabel = (status) => {
    if (!status) return "";
    const cleanStatus = String(status).toLowerCase();
    const labels = { 
        'scheduled': 'PROGRAMADA', 
        'confirmed': 'CONFIRMADA', 
        'checked_in': 'LLEGÓ', 
        'in_progress': 'EN ATENCIÓN', 
        'completed': 'REALIZADA', 
        'cancelled': 'ANULADA', 
        'not_show': 'AUSENTE',
        'no_show': 'AUSENTE' 
    };
    return labels[cleanStatus] || String(status).toUpperCase();
};

export const getStatusColors = (status, isStale = false) => {
    if (isStale) {
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', isStale: true };
    }
    switch (status?.toLowerCase()) {
        case 'scheduled':
        case 'programada':
            return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', dot: 'bg-blue-400' };
        case 'confirmed':
        case 'confirmada':
            return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', dot: 'bg-brand-primary' };
        case 'checked_in':
        case 'llegó':
            return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', dot: 'bg-orange-400' };
        case 'in_progress':
        case 'en box':
            return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' };
        case 'completed':
        case 'realizada':
            return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', dot: 'bg-green-500' };
        case 'cancelled':
        case 'anulada':
            return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', dot: 'bg-red-500' };
        case 'not_show':
        case 'not-show':
        case 'no asistió':
            return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
        default:
            return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', dot: 'bg-brand-primary' };
    }
};

export const formatLongDate = (date) => {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
    if (isNaN(d.getTime())) return "";
    return `${d.getDate()} de ${monthNames[d.getMonth()]} del ${d.getFullYear()}`;
};

export const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7, days = [];
    for (let i = 0; i < startOffset; i++) days.push({ date: new Date(year, month, -startOffset + i + 1), isCurrentMonth: false });
    for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    while (days.length < 42) days.push({ date: new Date(year, month + 1, days.length - (lastDay.getDate() + startOffset) + 1), isCurrentMonth: false });
    return days;
};

export const getWeekDays = (selectedDate) => {
    const startOfWeek = new Date(selectedDate);
    const day = selectedDate.getDay() || 7;
    startOfWeek.setDate(selectedDate.getDate() - day + 1);
    const days = [];
    for (let i = 0; i < 7; i++) { const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); days.push(d); }
    return days;
};
