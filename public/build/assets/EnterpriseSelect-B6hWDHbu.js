import{j as e}from"./app-CK7MXvlU.js";import{C as x}from"./chevron-down-6XgtF3m3.js";const h=({label:t,value:i,onChange:o,options:c=[],placeholder:n="-- Seleccionar --",disabled:p=!1,className:d="",error:r=null,required:l=!1,icon:a=null})=>e.jsxs("div",{className:`space-y-1 ${d}`,children:[t&&e.jsxs("label",{className:"enterprise-label ml-1 opacity-60",children:[t," ",l&&e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsxs("div",{className:"relative group",children:[a&&e.jsx("div",{className:"absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors",children:e.jsx(a,{className:"w-4 h-4"})}),e.jsxs("select",{value:i||"",onChange:s=>o(s.target.value),disabled:p,required:l,className:`
                        w-full appearance-none pr-12 py-4 
                        rounded-2xl border-gray-100 bg-gray-100 
                        font-black text-xs uppercase tracking-tight
                        focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary 
                        shadow-inner transition-all outline-none cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${a?"pl-12":"pl-6"} 
                        ${r?"border-red-500 ring-red-100":""}
                    `,children:[n&&e.jsx("option",{value:"",children:n}),c.map(s=>e.jsx("option",{value:s.value,children:s.label},s.value))]}),e.jsx("div",{className:"absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors",children:e.jsx(x,{className:"w-4 h-4"})})]}),r&&e.jsx("p",{className:"mt-1 text-[10px] font-black uppercase text-red-600 ml-2 tracking-widest",children:r})]});export{h as E};
