import{r as a,j as r}from"./app-D_MNQjbf.js";import{C as l}from"./circle-check-BzCogxoy.js";import{c as o}from"./scale-D6Jvfeye.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],x=o("CircleAlert",m);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],k=o("X",u),g=({flash:e})=>{const[d,t]=a.useState(!1),[s,c]=a.useState(null);if(a.useEffect(()=>{e!=null&&e.success?(c({text:e.success,type:"success"}),t(!0)):e!=null&&e.error?(c({text:e.error,type:"error"}),t(!0)):t(!1)},[e]),a.useEffect(()=>{if(!d)return;const n=setTimeout(()=>{t(!1)},5e3);return()=>clearTimeout(n)},[d,s]),!d||!s)return null;const i=s.type==="success";return r.jsxs("div",{className:`fixed top-4 end-4 z-50 flex max-w-md items-start gap-3 rounded-xl p-4 shadow-lg transition-all duration-300 border ${i?"bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-800":"bg-red-50 text-red-900 border-red-200 dark:bg-red-950/90 dark:text-red-100 dark:border-red-800"}`,role:"alert",children:[i?r.jsx(l,{className:"h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5"}):r.jsx(x,{className:"h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5"}),r.jsx("div",{className:"flex-1 text-sm font-medium leading-snug",children:s.text}),r.jsx("button",{type:"button",onClick:()=>t(!1),className:"shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity","aria-label":"Dismiss alert",children:r.jsx(k,{className:"h-4 w-4"})})]})};export{x as C,g as F,k as X};
