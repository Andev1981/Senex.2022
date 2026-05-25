import{R as p,j as e}from"./app-DcTjFqic.js";import{C as h}from"./check-BqGE607E.js";function u({className:o="",label:a,checked:t,onChange:s,...n}){const[c,l]=p.useState(n.defaultChecked||!1),r=t!==void 0?t:c,d=i=>{l(i.target.checked),s&&s(i)};return e.jsxs("label",{className:`inline-flex items-center gap-3 cursor-pointer group select-none ${o}`,children:[e.jsxs("div",{className:"relative flex items-center justify-center",children:[e.jsx("input",{...n,type:"checkbox",className:"sr-only peer",checked:r,onChange:d}),e.jsx("div",{className:`
                    w-6 h-6 rounded-xl border-2 transition-all duration-300 ease-out flex items-center justify-center
                    ${r?"bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/30 scale-100":"bg-white border-gray-200 hover:border-brand-primary/50 hover:bg-gray-50"}
                `,children:e.jsx(h,{className:`
                            w-3.5 h-3.5 text-white transition-all duration-300
                            ${r?"opacity-100 scale-100 rotate-0":"opacity-0 scale-50 -rotate-90"}
                        `,strokeWidth:4})}),e.jsx("div",{className:"absolute inset-0 rounded-xl bg-brand-primary/20 scale-0 peer-focus:scale-150 transition-transform duration-300 opacity-0 peer-focus:opacity-100 -z-10"})]}),a&&e.jsx("span",{className:`
                    text-[10px] font-black uppercase tracking-widest transition-colors duration-300
                    ${r?"text-brand-primary":"text-gray-400 group-hover:text-gray-600"}
                `,children:a})]})}export{u as C};
