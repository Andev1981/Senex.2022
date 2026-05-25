import{R as l,j as e}from"./app-DcTjFqic.js";function h({className:c="",label:t="",checked:s,onChange:n,...a}){const d=l.useId(),i=a.id||d,[u,p]=l.useState(a.defaultChecked||!1),r=s!==void 0?s:u,x=o=>{p(o.target.checked),n&&n(o)};return e.jsxs("label",{htmlFor:i,className:`relative inline-flex items-center cursor-pointer group select-none ${c}`,children:[e.jsx("input",{...a,id:i,type:"checkbox",className:"sr-only peer",checked:r,onChange:x}),e.jsx("div",{className:`
          w-11 h-6 rounded-full transition-all duration-300 ease-in-out border-2
          ${r?"bg-brand-primary border-brand-primary shadow-inner":"bg-gray-100 border-gray-200 group-hover:bg-gray-200"}
        `}),e.jsx("div",{className:`
          absolute top-[4px] left-[4px] w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ease-spring
          ${r?"translate-x-5":"translate-x-0"}
        `}),e.jsx("div",{className:"absolute inset-0 rounded-full ring-4 ring-brand-primary/10 scale-0 peer-focus:scale-110 transition-transform opacity-0 peer-focus:opacity-100"}),t&&e.jsx("span",{className:`
            ml-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-300
            ${r?"text-gray-900":"text-gray-400 group-hover:text-gray-600"}
        `,children:t})]})}export{h as S};
