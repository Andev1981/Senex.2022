import{r as h,j as e,H as E,L as S,b as g}from"./app-xipf3BHj.js";import"./app-BA3btQSw.js";const f=a=>new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",minimumFractionDigits:0}).format(a||0),F=a=>{if(!a)return"-";const i=a.replace(/[^0-9kK]/g,"").toUpperCase();if(i.length<2)return a;const d=i.slice(-1);let m=i.slice(0,-1),o="",r=0;for(let l=m.length-1;l>=0;l--)o=m[l]+o,r++,r===3&&l>0&&(o="."+o,r=0);return`${o}-${d}`};function P({patients:a,filters:i,stats:d}){const[m,o]=h.useState(i.search||""),[r,l]=h.useState([]),[s,j]=h.useState(["mail"]),[u,b]=h.useState(null),[y,p]=h.useState(!1),k=n=>{n.preventDefault(),g.get(route("admin.payment-reminders.index"),{search:m},{preserveState:!0,preserveScroll:!0})},N=n=>{l(t=>t.includes(n)?t.filter(x=>x!==n):[...t,n])},w=()=>{r.length===a.data.length?l([]):l(a.data.map(n=>n.id))},c=n=>{j(t=>t.includes(n)?t.filter(x=>x!==n):[...t,n])},v=(n,t=s)=>{if(t.length===0){alert("Selecciona al menos un canal de envío");return}b(n),g.post(route("admin.payment-reminders.send",n),{channels:t},{preserveScroll:!0,onFinish:()=>b(null)})},C=()=>{if(r.length===0){alert("Selecciona al menos un paciente");return}if(s.length===0){alert("Selecciona al menos un canal de envío");return}g.post(route("admin.payment-reminders.send-bulk"),{patient_ids:r,channels:s},{preserveScroll:!0,onSuccess:()=>{p(!1),l([])}})};return e.jsxs(e.Fragment,{children:[e.jsx(E,{title:"Recordatorios de Pago"}),e.jsxs("div",{className:"reminders-page",children:[e.jsxs("div",{className:"page-header",children:[e.jsxs("div",{children:[e.jsx("h1",{children:"Recordatorios de Pago"}),e.jsx("p",{children:"Envía recordatorios a pacientes con deudas pendientes"})]}),e.jsx("div",{className:"header-actions",children:e.jsx("a",{href:route("portal.pago"),target:"_blank",className:"btn-secondary",children:"Ver Portal de Pagos"})})]}),e.jsxs("div",{className:"stats-grid",children:[e.jsxs("div",{className:"stat-card",children:[e.jsx("span",{className:"stat-value",children:d.total_patients_with_debt}),e.jsx("span",{className:"stat-label",children:"Pacientes con deuda"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("span",{className:"stat-value",children:f(d.total_pending_amount)}),e.jsx("span",{className:"stat-label",children:"Total pendiente"})]}),e.jsxs("div",{className:"stat-card",children:[e.jsx("span",{className:"stat-value",children:d.total_pending_sessions}),e.jsx("span",{className:"stat-label",children:"Sesiones pendientes"})]})]}),e.jsxs("div",{className:"toolbar",children:[e.jsxs("form",{onSubmit:k,className:"search-form",children:[e.jsx("input",{type:"text",placeholder:"Buscar por nombre, RUT o email...",value:m,onChange:n=>o(n.target.value)}),e.jsx("button",{type:"submit",children:"Buscar"})]}),r.length>0&&e.jsxs("button",{className:"btn-primary",onClick:()=>p(!0),children:["Enviar a ",r.length," seleccionados"]})]}),e.jsxs("div",{className:"channels-selector",children:[e.jsx("span",{children:"Canales de envío:"}),e.jsxs("label",{className:`channel-option ${s.includes("mail")?"active":""}`,children:[e.jsx("input",{type:"checkbox",checked:s.includes("mail"),onChange:()=>c("mail")}),e.jsx("span",{className:"channel-icon",children:"📧"}),"Email"]}),e.jsxs("label",{className:`channel-option ${s.includes("sms")?"active":""}`,children:[e.jsx("input",{type:"checkbox",checked:s.includes("sms"),onChange:()=>c("sms")}),e.jsx("span",{className:"channel-icon",children:"📱"}),"SMS"]}),e.jsxs("label",{className:`channel-option ${s.includes("whatsapp")?"active":""}`,children:[e.jsx("input",{type:"checkbox",checked:s.includes("whatsapp"),onChange:()=>c("whatsapp")}),e.jsx("span",{className:"channel-icon",children:"💬"}),"WhatsApp"]})]}),e.jsx("div",{className:"table-container",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"checkbox-col",children:e.jsx("input",{type:"checkbox",checked:r.length===a.data.length&&a.data.length>0,onChange:w})}),e.jsx("th",{children:"Paciente"}),e.jsx("th",{children:"RUT"}),e.jsx("th",{children:"Contacto"}),e.jsx("th",{className:"text-center",children:"Sesiones"}),e.jsx("th",{className:"text-right",children:"Monto"}),e.jsx("th",{className:"text-center",children:"Acciones"})]})}),e.jsx("tbody",{children:a.data.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:"7",className:"empty-state",children:"No hay pacientes con deudas pendientes"})}):a.data.map(n=>e.jsxs("tr",{className:r.includes(n.id)?"selected":"",children:[e.jsx("td",{className:"checkbox-col",children:e.jsx("input",{type:"checkbox",checked:r.includes(n.id),onChange:()=>N(n.id)})}),e.jsx("td",{children:e.jsx("span",{className:"patient-name",children:n.name})}),e.jsx("td",{children:e.jsx("span",{className:"patient-rut",children:F(n.rut)})}),e.jsx("td",{children:e.jsxs("div",{className:"contact-info",children:[n.email&&e.jsxs("span",{className:"contact-item",children:["📧 ",n.email]}),n.phone&&e.jsxs("span",{className:"contact-item",children:["📱 ",n.phone]}),!n.email&&!n.phone&&e.jsx("span",{className:"no-contact",children:"Sin contacto"})]})}),e.jsx("td",{className:"text-center",children:e.jsx("span",{className:"badge",children:n.pending_sessions_count})}),e.jsx("td",{className:"text-right",children:e.jsx("span",{className:"amount_clp",children:f(n.pending_amount)})}),e.jsx("td",{className:"text-center",children:e.jsx("button",{className:"btn-send",onClick:()=>v(n.id),disabled:u===n.id||s.length===0,children:u===n.id?"Enviando...":"Enviar"})})]},n.id))})]})}),a.last_page>1&&e.jsx("div",{className:"pagination",children:a.links.map((n,t)=>e.jsx(S,{href:n.url||"#",className:`page-link ${n.active?"active":""} ${n.url?"":"disabled"}`,dangerouslySetInnerHTML:{__html:n.label},preserveScroll:!0},t))}),y&&e.jsx("div",{className:"modal-overlay",onClick:()=>p(!1),children:e.jsxs("div",{className:"modal",onClick:n=>n.stopPropagation(),children:[e.jsx("h2",{children:"Enviar recordatorios"}),e.jsxs("p",{children:["Se enviará un recordatorio a"," ",e.jsx("strong",{children:r.length})," pacientes."]}),e.jsxs("div",{className:"modal-channels",children:[e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",checked:s.includes("mail"),onChange:()=>c("mail")}),"📧 Email"]}),e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",checked:s.includes("sms"),onChange:()=>c("sms")}),"📱 SMS"]}),e.jsxs("label",{children:[e.jsx("input",{type:"checkbox",checked:s.includes("whatsapp"),onChange:()=>c("whatsapp")}),"💬 WhatsApp"]})]}),e.jsxs("div",{className:"modal-actions",children:[e.jsx("button",{className:"btn-cancel",onClick:()=>p(!1),children:"Cancelar"}),e.jsx("button",{className:"btn-confirm",onClick:C,disabled:s.length===0,children:"Enviar recordatorios"})]})]})})]}),e.jsx("style",{children:`
                .reminders-page {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                }

                .page-header h1 {
                    font-size: 1.75rem;
                    font-weight: 600;
                    margin: 0 0 0.25rem;
                }

                .page-header p {
                    color: #6B7280;
                    margin: 0;
                }

                .btn-secondary {
                    padding: 0.625rem 1.25rem;
                    background: #F3F4F6;
                    color: #374151;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .btn-secondary:hover {
                    background: #E5E7EB;
                }

                /* Stats */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                }

                .stat-value {
                    display: block;
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #111827;
                }

                .stat-label {
                    display: block;
                    font-size: 0.875rem;
                    color: #6B7280;
                    margin-top: 0.25rem;
                }

                /* Toolbar */
                .toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .search-form {
                    display: flex;
                    gap: 0.5rem;
                }

                .search-form input {
                    width: 300px;
                    padding: 0.625rem 1rem;
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    font-size: 0.9375rem;
                }

                .search-form input:focus {
                    outline: none;
                    border-color: #0066CC;
                }

                .search-form button {
                    padding: 0.625rem 1.25rem;
                    background: #0066CC;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .btn-primary {
                    padding: 0.625rem 1.25rem;
                    background: #10B981;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                /* Channels */
                .channels-selector {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: #F9FAFB;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                }

                .channels-selector > span {
                    font-weight: 500;
                    color: #374151;
                }

                .channel-option {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.5rem 1rem;
                    background: white;
                    border: 1px solid #E5E7EB;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .channel-option input {
                    display: none;
                }

                .channel-option.active {
                    background: #EEF2FF;
                    border-color: #6366F1;
                    color: #4F46E5;
                }

                .channel-icon {
                    font-size: 1rem;
                }

                /* Table */
                .table-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                    overflow: hidden;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th, td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid #F3F4F6;
                }

                th {
                    background: #F9FAFB;
                    font-weight: 600;
                    font-size: 0.8125rem;
                    color: #6B7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .checkbox-col {
                    width: 48px;
                    text-align: center;
                }

                tr.selected {
                    background: #EEF2FF;
                }

                .patient-name {
                    font-weight: 500;
                }

                .patient-rut {
                    font-family: monospace;
                    color: #6B7280;
                }

                .contact-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .contact-item {
                    font-size: 0.8125rem;
                    color: #6B7280;
                }

                .no-contact {
                    font-size: 0.8125rem;
                    color: #9CA3AF;
                    font-style: italic;
                }

                .text-center { text-align: center; }
                .text-right { text-align: right; }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 28px;
                    height: 28px;
                    padding: 0 0.5rem;
                    background: #FEF3C7;
                    color: #92400E;
                    border-radius: 14px;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .amount_clp {
                    font-weight: 600;
                    color: #DC2626;
                }

                .btn-send {
                    padding: 0.5rem 1rem;
                    background: #0066CC;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-send:hover:not(:disabled) {
                    background: #004C99;
                }

                .btn-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: #9CA3AF;
                }

                /* Pagination */
                .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 0.25rem;
                    margin-top: 1.5rem;
                }

                .page-link {
                    padding: 0.5rem 0.875rem;
                    background: white;
                    border: 1px solid #E5E7EB;
                    border-radius: 6px;
                    color: #374151;
                    text-decoration: none;
                    font-size: 0.875rem;
                }

                .page-link.active {
                    background: #0066CC;
                    border-color: #0066CC;
                    color: white;
                }

                .page-link.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 50;
                }

                .modal {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    width: 100%;
                    max-width: 400px;
                }

                .modal h2 {
                    font-size: 1.25rem;
                    margin: 0 0 0.5rem;
                }

                .modal p {
                    color: #6B7280;
                    margin: 0 0 1.5rem;
                }

                .modal-channels {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .modal-channels label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }

                .btn-cancel {
                    padding: 0.625rem 1.25rem;
                    background: #F3F4F6;
                    color: #374151;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .btn-confirm {
                    padding: 0.625rem 1.25rem;
                    background: #10B981;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .btn-confirm:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .toolbar {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .search-form {
                        width: 100%;
                    }

                    .search-form input {
                        flex: 1;
                    }

                    .channels-selector {
                        flex-wrap: wrap;
                    }
                }
            `})]})}export{P as default};
