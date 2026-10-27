/* ---------- små hjälpfunktioner ---------- */
import{S}from'./state.js';

export const $=id=>document.getElementById(id);
export function tok(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
export function fmt(n){return n.toLocaleString('sv-SE')}
export function cm(beads){return (beads*parseFloat(S.bead)/10).toLocaleString('sv-SE',{maximumFractionDigits:1})}
