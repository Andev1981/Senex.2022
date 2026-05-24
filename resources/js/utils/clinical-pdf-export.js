import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";

/**
 * Genera un PDF profesional con la ficha clínica del paciente.
 */
export const exportClinicalRecordPDF = (patient, sessions = [], treatment = null) => {
    const doc = new jsPDF();
    const history = patient.medical_history || {};
    const today = moment().format("DD/MM/YYYY HH:mm");

    // --- ESTILOS ---
    const primaryColor = [79, 70, 229]; // Brand Primary (Indigo)
    const grayColor = [107, 114, 128];

    // --- HEADER ---
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("FICHA CLÍNICA PROFESIONAL", 14, 20);
    
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Generado por SENEX Clinical - ${today}`, 14, 28);
    doc.line(14, 32, 196, 32);

    // --- 1. IDENTIDAD DEL PACIENTE ---
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("IDENTIDAD DEL PACIENTE", 14, 42);

    autoTable(doc, {
        startY: 46,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 40 } },
        body: [
            ["Nombre Completo:", `${patient.name} ${patient.last_name}`.toUpperCase()],
            ["RUT:", patient.rut || "N/A"],
            ["Fecha Nacimiento:", moment(patient.birth_date).format("DD/MM/YYYY") + ` (${patient.age} años)`],
            ["Ocupación:", patient.occupation || "No especificada"],
            ["Email:", patient.email || "N/A"],
            ["Teléfono:", patient.phone || "N/A"],
        ],
    });

    // --- 2. ANTECEDENTES CLÍNICOS ---
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("ANTECEDENTES CLÍNICOS & ALERTAS", 14, finalY);

    autoTable(doc, {
        startY: finalY + 4,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [243, 244, 246], textColor: [0,0,0], fontStyle: 'bold' },
        columns: [
            { header: 'Banderas Rojas', dataKey: 'flags' },
            { header: 'Patologías / Cirugías', dataKey: 'history' },
            { header: 'Parámetros', dataKey: 'params' },
        ],
        body: [{
            flags: [
                `Marcapasos: ${history.has_pacemaker ? 'SÍ' : 'No'}`,
                `Implantes: ${history.has_metal_implants ? 'SÍ' : 'No'}`,
                `Cáncer: ${history.cancer_history ? 'SÍ' : 'No'}`,
                `Embarazo: ${history.is_pregnant ? 'Activo' : 'No'}`,
            ].join('\n'),
            history: [
                `Patologías: ${history.pathologies?.join(', ') || 'Sin registros'}`,
                `Cirugías: ${history.surgeries?.join(', ') || 'Sin registros'}`,
                `Medicamentos: ${history.medications?.join(', ') || 'Sin registros'}`,
            ].join('\n'),
            params: [
                `Grupo Sangre: ${history.blood_type || 'N/A'}`,
                `Lateralidad: ${history.handedness === 'right' ? 'Diestro' : history.handedness === 'left' ? 'Zurdo' : 'Ambidiestro'}`,
            ].join('\n'),
        }],
    });

    // --- 3. CONTEXTO DEL TRATAMIENTO (Opcional) ---
    if (treatment) {
        finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text("DETALLES DEL TRATAMIENTO", 14, finalY);

        autoTable(doc, {
            startY: finalY + 4,
            theme: 'striped',
            styles: { fontSize: 9 },
            body: [
                ["Diagnóstico CIE-10:", `[${treatment.diagnostic?.code}] ${treatment.diagnostic?.description}`],
                ["Médico Derivante:", treatment.referral_doctor_name || "N/A"],
                ["Diagnóstico Médico:", treatment.referral_diagnosis || "N/A"],
                ["Sesiones:", `${treatment.completed_sessions} realizadas de ${treatment.is_indefinite ? '∞' : treatment.total_sessions}`],
            ],
        });
    }

    // --- 4. EVOLUCIÓN DE SESIONES (SOAP) ---
    finalY = doc.lastAutoTable.finalY + 10;
    doc.addPage();
    doc.setFontSize(14);
    doc.text("REGISTRO DE EVOLUCIÓN (SOAP)", 14, 20);

    sessions.forEach((session, index) => {
        const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 30;
        
        // Evitar que una sesión se corte a mitad de página si queda poco espacio
        if (currentY > 240) doc.addPage();

        autoTable(doc, {
            startY: doc.lastAutoTable && doc.lastAutoTable.finalY < 250 ? doc.lastAutoTable.finalY + 5 : 30,
            theme: 'grid',
            styles: { fontSize: 8, overflow: 'linebreak' },
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
            columns: [
                { header: `SESIÓN #${sessions.length - index} - ${moment(session.date).format("DD/MM/YYYY")} (${session.time})`, dataKey: 'content' }
            ],
            body: [
                [{ content: `PROFESIONAL: ${session.doctor?.name} ${session.doctor?.last_name || ''}\nDOLOR: EVA ${session.pain_before || session.pain_level || 0} -> ${session.pain_after || 'N/A'}` }],
                [{ content: `[S] SUBJETIVO: ${session.subjective || 'Sin registros'}` }],
                [{ content: `[O] OBJETIVO: ${session.objective || 'Sin registros'}` }],
                [{ content: `[A] ANÁLISIS: ${session.assessment || 'Sin registros'}` }],
                [{ content: `[P] PLAN & TÉCNICAS: ${session.plan || 'Sin registros'}\nProcedimientos: ${session.activities_data?.techniques?.join(', ') || 'N/A'}` }],
            ],
            margin: { left: 14, right: 14 },
        });
    });

    // --- PIE DE PÁGINA ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(`Página ${i} de ${pageCount}`, 196, 285, { align: 'right' });
    }

    const fileName = `Ficha_Clinica_${patient.last_name}_${patient.name}_${moment().format("YYYYMMDD")}.pdf`;
    doc.save(fileName);
};
