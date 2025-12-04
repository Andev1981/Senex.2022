import{r as p,j as a,F as E,a as e,H as B,L as _,b}from"./app-12bcd6c7.js";import"./index-a8363777.js";const y=r=>new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",minimumFractionDigits:0}).format(r||0),P=r=>{if(!r)return"-";const d=r.replace(/[^0-9kK]/g,"").toUpperCase();if(d.length<2)return r;const m=d.slice(-1);let h=d.slice(0,-1),i="",o=0;for(let c=h.length-1;c>=0;c--)i=h[c]+i,o++,o===3&&c>0&&(i="."+i,o=0);return`${i}-${m}`};function j({patients:r,filters:d,stats:m}){const[h,i]=p.useState(d.search||""),[o,c]=p.useState([]),[t,k]=p.useState(["mail"]),[f,x]=p.useState(null),[N,g]=p.useState(!1),w=n=>{n.preventDefault(),b.get(route("admin.payment-reminders.index"),{search:h},{preserveState:!0,preserveScroll:!0})},v=n=>{c(l=>l.includes(n)?l.filter(u=>u!==n):[...l,n])},C=()=>{o.length===r.data.length?c([]):c(r.data.map(n=>n.id))},s=n=>{k(l=>l.includes(n)?l.filter(u=>u!==n):[...l,n])},F=(n,l=t)=>{if(l.length===0){alert("Selecciona al menos un canal de envío");return}x(n),b.post(route("admin.payment-reminders.send",n),{channels:l},{preserveScroll:!0,onFinish:()=>x(null)})},S=()=>{if(o.length===0){alert("Selecciona al menos un paciente");return}if(t.length===0){alert("Selecciona al menos un canal de envío");return}b.post(route("admin.payment-reminders.send-bulk"),{patient_ids:o,channels:t},{preserveScroll:!0,onSuccess:()=>{g(!1),c([])}})};return a(E,{children:[e(B,{title:"Recordatorios de Pago"}),a("div",{className:"reminders-page",children:[a("div",{className:"page-header",children:[a("div",{children:[e("h1",{children:"Recordatorios de Pago"}),e("p",{children:"Envía recordatorios a pacientes con deudas pendientes"})]}),e("div",{className:"header-actions",children:e("a",{href:route("portal.pago"),target:"_blank",className:"btn-secondary",children:"Ver Portal de Pagos"})})]}),a("div",{className:"stats-grid",children:[a("div",{className:"stat-card",children:[e("span",{className:"stat-value",children:m.total_patients_with_debt}),e("span",{className:"stat-label",children:"Pacientes con deuda"})]}),a("div",{className:"stat-card",children:[e("span",{className:"stat-value",children:y(m.total_pending_amount)}),e("span",{className:"stat-label",children:"Total pendiente"})]}),a("div",{className:"stat-card",children:[e("span",{className:"stat-value",children:m.total_pending_sessions}),e("span",{className:"stat-label",children:"Sesiones pendientes"})]})]}),a("div",{className:"toolbar",children:[a("form",{onSubmit:w,className:"search-form",children:[e("input",{type:"text",placeholder:"Buscar por nombre, RUT o email...",value:h,onChange:n=>i(n.target.value)}),e("button",{type:"submit",children:"Buscar"})]}),o.length>0&&a("button",{className:"btn-primary",onClick:()=>g(!0),children:["Enviar a ",o.length," seleccionados"]})]}),a("div",{className:"channels-selector",children:[e("span",{children:"Canales de envío:"}),a("label",{className:`channel-option ${t.includes("mail")?"active":""}`,children:[e("input",{type:"checkbox",checked:t.includes("mail"),onChange:()=>s("mail")}),e("span",{className:"channel-icon",children:"📧"}),"Email"]}),a("label",{className:`channel-option ${t.includes("sms")?"active":""}`,children:[e("input",{type:"checkbox",checked:t.includes("sms"),onChange:()=>s("sms")}),e("span",{className:"channel-icon",children:"📱"}),"SMS"]}),a("label",{className:`channel-option ${t.includes("whatsapp")?"active":""}`,children:[e("input",{type:"checkbox",checked:t.includes("whatsapp"),onChange:()=>s("whatsapp")}),e("span",{className:"channel-icon",children:"💬"}),"WhatsApp"]})]}),e("div",{className:"table-container",children:a("table",{children:[e("thead",{children:a("tr",{children:[e("th",{className:"checkbox-col",children:e("input",{type:"checkbox",checked:o.length===r.data.length&&r.data.length>0,onChange:C})}),e("th",{children:"Paciente"}),e("th",{children:"RUT"}),e("th",{children:"Contacto"}),e("th",{className:"text-center",children:"Sesiones"}),e("th",{className:"text-right",children:"Monto"}),e("th",{className:"text-center",children:"Acciones"})]})}),e("tbody",{children:r.data.length===0?e("tr",{children:e("td",{colSpan:"7",className:"empty-state",children:"No hay pacientes con deudas pendientes"})}):r.data.map(n=>a("tr",{className:o.includes(n.id)?"selected":"",children:[e("td",{className:"checkbox-col",children:e("input",{type:"checkbox",checked:o.includes(n.id),onChange:()=>v(n.id)})}),e("td",{children:e("span",{className:"patient-name",children:n.name})}),e("td",{children:e("span",{className:"patient-rut",children:P(n.rut)})}),e("td",{children:a("div",{className:"contact-info",children:[n.email&&a("span",{className:"contact-item",children:["📧 ",n.email]}),n.phone&&a("span",{className:"contact-item",children:["📱 ",n.phone]}),!n.email&&!n.phone&&e("span",{className:"no-contact",children:"Sin contacto"})]})}),e("td",{className:"text-center",children:e("span",{className:"badge",children:n.pending_sessions_count})}),e("td",{className:"text-right",children:e("span",{className:"amount",children:y(n.pending_amount)})}),e("td",{className:"text-center",children:e("button",{className:"btn-send",onClick:()=>F(n.id),disabled:f===n.id||t.length===0,children:f===n.id?"Enviando...":"Enviar"})})]},n.id))})]})}),r.last_page>1&&e("div",{className:"pagination",children:r.links.map((n,l)=>e(_,{href:n.url||"#",className:`page-link ${n.active?"active":""} ${n.url?"":"disabled"}`,dangerouslySetInnerHTML:{__html:n.label},preserveScroll:!0},l))}),N&&e("div",{className:"modal-overlay",onClick:()=>g(!1),children:a("div",{className:"modal",onClick:n=>n.stopPropagation(),children:[e("h2",{children:"Enviar recordatorios"}),a("p",{children:["Se enviará un recordatorio a"," ",e("strong",{children:o.length})," pacientes."]}),a("div",{className:"modal-channels",children:[a("label",{children:[e("input",{type:"checkbox",checked:t.includes("mail"),onChange:()=>s("mail")}),"📧 Email"]}),a("label",{children:[e("input",{type:"checkbox",checked:t.includes("sms"),onChange:()=>s("sms")}),"📱 SMS"]}),a("label",{children:[e("input",{type:"checkbox",checked:t.includes("whatsapp"),onChange:()=>s("whatsapp")}),"💬 WhatsApp"]})]}),a("div",{className:"modal-actions",children:[e("button",{className:"btn-cancel",onClick:()=>g(!1),children:"Cancelar"}),e("button",{className:"btn-confirm",onClick:S,disabled:t.length===0,children:"Enviar recordatorios"})]})]})})]}),e("style",{children:`
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

                .amount {
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
            `})]})}export{j as default};
