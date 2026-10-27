/* ---------- pärlfärger ---------- */
import{rgb2lab}from'./color.js';

export const PAL=[
['01','Vit','#F1F1EE'],['02','Krämvit','#EFE6C2'],['03','Gul','#F2C200'],['04','Orange','#EB6A21'],
['05','Röd','#C2252F'],['06','Rosa','#EA8FB0'],['07','Lila','#6E4A93'],['08','Mörkblå','#1F3C8F'],
['09','Blå','#2E6BC6'],['10','Grön','#1E8A4C'],['11','Ljusgrön','#5DBB6A'],['12','Brun','#5C3A28'],
['17','Grå','#8A8C8E'],['18','Svart','#1E1E20'],['20','Rödbrun','#8A3B2B'],['21','Ljusbrun','#B0733F'],
['22','Mörkröd','#8E1F2C'],['26','Hudrosa','#E6A58E'],['27','Beige','#D9B98E'],['28','Mörkgrön','#21452F'],
['29','Karmin','#C83A63'],['30','Vinröd','#6A2338'],['31','Turkos','#4FA3B5'],['43','Pastellgul','#F2EB8A'],
['44','Pastellröd','#F08A86'],['45','Pastellila','#B49AD6'],['46','Pastellblå','#86B5E4'],['47','Pastellgrön','#90D6A0'],
['48','Pastellrosa','#F0B4D2'],['49','Azurblå','#33A9DD'],['60','Teddybrun','#A57A44'],['70','Ljusgrå','#BFC2C3'],
['71','Mörkgrå','#4E5254'],['82','Plommon','#8B2A6E'],['83','Petrol','#16727F'],['84','Olivgrön','#6E7A3A']
].map(([code,name,hex])=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return{code,name,hex,rgb:[r,g,b],lab:rgb2lab(r,g,b)}});
export const SYMS='ABCDEFGHJKLMNPRSTUVXYZ23456789+#%&=?<>*';
