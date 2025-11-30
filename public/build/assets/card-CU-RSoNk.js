import{j as t}from"./app-DHCAgeO8.js";const c=({children:r,className:s="",variant:e="default",padding:a="md",shadow:o="md",hover:d=!1,onClick:l,...n})=>{const m={default:"bg-[var(--surface-00)] border-[var(--border-light)]",elevated:"bg-[var(--surface-00)] border-[var(--border-light)] shadow-lg",outline:"bg-transparent border-[var(--border-medium)] border-2",ghost:"bg-transparent border-[var(--border-light)]"},x={xs:"p-2",sm:"p-3",md:"p-4",lg:"p-6",xl:"p-8"},b={sm:"shadow-sm",md:"shadow-md",lg:"shadow-lg",xl:"shadow-xl",none:"shadow-none"};return t.jsx("div",{className:`
        rounded-lg border
        transition-all duration-200
        ${m[e]}
        ${x[a]}
        ${b[o]}
        ${d?"hover:shadow-lg hover:-translate-y-1 cursor-pointer":""}
        ${s}
      `,onClick:l,...n,children:r})},g=({children:r,className:s="",bordered:e=!1,...a})=>t.jsx("div",{className:`
        ${e?"border-b border-[var(--border-light)] pb-4 mb-4":"mb-4"}
        ${s}
      `,...a,children:r}),h=({children:r,className:s="",size:e="lg",...a})=>{const o={sm:"text-lg",md:"text-xl",lg:"text-2xl",xl:"text-3xl"};return t.jsx("h3",{className:`
        font-semibold text-[var(--text-primary)]
        ${o[e]}
        ${s}
      `,...a,children:r})},p=({children:r,className:s="",...e})=>t.jsx("p",{className:`
        text-sm text-[var(--text-secondary)] mt-1
        ${s}
      `,...e,children:r}),v=({children:r,className:s="",...e})=>t.jsx("div",{className:s,...e,children:r});export{c as C,g as a,h as b,v as c,p as d};
