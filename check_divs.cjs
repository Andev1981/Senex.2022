const fs = require('fs');
const code = fs.readFileSync('resources/js/pages/agendas/AgendaCalendar.jsx', 'utf8');
const lines = code.split('\n');
let b = 0;
for(let i=0; i<lines.length; i++) {
    b += (lines[i].match(/<div[\s>]/g) || []).length - (lines[i].match(/<\/div>/g) || []).length;
    if (lines[i].includes('viewMode === "month"')) console.log('After month line:', b);
    if (lines[i].includes('viewMode === "week"')) console.log('After week line:', b);
    if (lines[i].includes('viewMode === "day"')) console.log('After day line:', b);
    if (lines[i].includes('showNewAppointment &&')) console.log('After new appt:', b);
    if (lines[i].includes('selectedAppointment &&')) console.log('After selected appt:', b);
    if (lines[i].includes('showCheckInModal &&')) console.log('After checkin:', b);
    if (lines[i].includes('<BoxMapModal')) console.log('After BoxMapModal:', b);
}
console.log('Final:', b);
