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
    const labels = { 'scheduled': 'Programada', 'confirmed': 'Confirmada', 'checked_in': 'Llegó', 'in_progress': 'Atención', 'completed': 'Hecha', 'cancelled': 'Anulada', 'not_show': 'Ausente' };
    return labels[status] || status;
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
