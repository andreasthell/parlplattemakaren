/* ---------- exempelbilder, ritade med kod så att de fungerar offline ---------- */
const PI=Math.PI;
const NIGHT='#1F2A55',DUSK='#3A2466',PURPLE='#6E4A93',BLACK='#1E1E22';

function sun(x){
  const g=x.createLinearGradient(0,0,0,480);g.addColorStop(0,'#6EC3F0');g.addColorStop(1,'#BFE6FA');x.fillStyle=g;x.fillRect(0,0,480,480);
  x.fillStyle='#FFFFFF';[[70,90,34],[110,80,42],[150,96,30],[360,400,36],[400,388,46],[440,404,32]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill()});
  x.fillStyle='#F07A18';x.save();x.translate(240,250);
  for(let i=0;i<12;i++){x.rotate(PI/6);x.beginPath();x.moveTo(-26,-140);x.lineTo(0,-205);x.lineTo(26,-140);x.fill()}x.restore();
  x.fillStyle='#FFD21F';x.beginPath();x.arc(240,250,130,0,7);x.fill();
  x.fillStyle='#F49AA6';x.beginPath();x.arc(178,282,22,0,7);x.arc(302,282,22,0,7);x.fill();
  x.fillStyle='#1E1E22';x.beginPath();x.ellipse(195,225,15,22,0,0,7);x.ellipse(285,225,15,22,0,0,7);x.fill();
  x.fillStyle='#FFFFFF';x.beginPath();x.arc(200,216,5,0,7);x.arc(290,216,5,0,7);x.fill();
  x.strokeStyle='#1E1E22';x.lineWidth=14;x.lineCap='round';x.beginPath();x.arc(240,270,52,0.2*PI,0.8*PI);x.stroke();
}

function pumpkin(x){
  x.fillStyle=NIGHT;x.fillRect(0,0,480,480);
  // stjälk
  x.fillStyle='#3E7A35';x.save();x.translate(248,118);x.rotate(0.18);x.fillRect(-18,-40,36,80);x.restore();
  // sidoklyftor mörkare, mittklyftan ljusast
  x.fillStyle='#C9531A';x.beginPath();x.ellipse(165,285,100,145,0,0,7);x.ellipse(315,285,100,145,0,0,7);x.fill();
  x.fillStyle='#EB6A21';x.beginPath();x.ellipse(240,285,115,155,0,0,7);x.fill();
  // lysande ansikte
  x.fillStyle='#F2C200';
  const tri=(a,b,c)=>{x.beginPath();x.moveTo(...a);x.lineTo(...b);x.lineTo(...c);x.fill()};
  tri([150,265],[205,265],[178,205]);tri([275,265],[330,265],[302,205]);tri([222,305],[258,305],[240,275]);
  // munnen med tänder uppifrån
  x.beginPath();x.moveTo(135,320);
  for(const[px,py]of[[170,365],[205,320],[240,365],[275,320],[310,365],[345,320],[320,405],[160,405]])x.lineTo(px,py);
  x.fill();
}

function ghost(x){
  x.fillStyle=PURPLE;x.fillRect(0,0,480,480);
  x.fillStyle='#F1F1EE';x.beginPath();x.moveTo(105,215);x.arc(240,215,135,PI,0);x.lineTo(375,410);
  // vågig nederkant
  const w=270/4;for(let i=0;i<4;i++){const x0=375-i*w;x.quadraticCurveTo(x0-w/2,(i%2?470:350),x0-w,410)}
  x.closePath();x.fill();
  x.fillStyle=BLACK;x.beginPath();x.ellipse(195,205,20,30,0,0,7);x.ellipse(285,205,20,30,0,0,7);x.fill();
  x.beginPath();x.ellipse(240,290,26,34,0,0,7);x.fill();
  x.fillStyle='#F0B4D2';x.beginPath();x.arc(160,258,18,0,7);x.arc(320,258,18,0,7);x.fill();
}

function cat(x){
  x.fillStyle=NIGHT;x.fillRect(0,0,480,480);
  x.fillStyle='#F2EB8A';x.beginPath();x.arc(240,215,175,0,7);x.fill();
  x.fillStyle=BLACK;
  // svans
  x.strokeStyle=BLACK;x.lineWidth=30;x.lineCap='round';x.beginPath();x.moveTo(320,440);x.quadraticCurveTo(440,420,405,300);x.stroke();
  x.beginPath();x.ellipse(240,375,105,95,0,0,7);x.fill();
  x.beginPath();x.arc(240,235,78,0,7);x.fill();
  x.beginPath();x.moveTo(172,200);x.lineTo(168,118);x.lineTo(228,165);x.fill();
  x.beginPath();x.moveTo(308,200);x.lineTo(312,118);x.lineTo(252,165);x.fill();
  x.fillStyle='#8CD63A';x.beginPath();x.ellipse(208,228,19,22,0,0,7);x.ellipse(272,228,19,22,0,0,7);x.fill();
  x.fillStyle='#F0B4D2';x.beginPath();x.moveTo(228,262);x.lineTo(252,262);x.lineTo(240,276);x.fill();
}

function bat(x){
  x.fillStyle=DUSK;x.fillRect(0,0,480,480);
  x.fillStyle='#F2C200';x.beginPath();x.arc(240,245,185,0,7);x.fill();
  x.fillStyle=BLACK;
  // vänster vinge, speglas till höger
  for(const s of[1,-1]){
    x.save();x.translate(240,0);x.scale(s,1);x.translate(-240,0);
    x.beginPath();x.moveTo(228,235);x.quadraticCurveTo(140,175,25,160);
    for(const[px,py]of[[80,315],[110,265],[145,340],[175,285],[210,350],[232,300]])x.lineTo(px,py);
    x.closePath();x.fill();
    x.beginPath();x.moveTo(206,170);x.lineTo(198,88);x.lineTo(240,150);x.fill();
    x.restore();
  }
  x.beginPath();x.ellipse(240,270,44,78,0,0,7);x.fill();
  x.beginPath();x.arc(240,185,44,0,7);x.fill();
  x.fillStyle='#EB6A21';x.beginPath();x.arc(221,182,14,0,7);x.arc(259,182,14,0,7);x.fill();
}

export const SAMPLES=[
  {id:'sun',name:'Solen',draw:sun},
  {id:'pumpkin',name:'Pumpan',draw:pumpkin},
  {id:'ghost',name:'Spöket',draw:ghost},
  {id:'cat',name:'Katten',draw:cat},
  {id:'bat',name:'Fladdermusen',draw:bat},
];

export function sampleImage(id='sun'){
  const c=document.createElement('canvas');c.width=c.height=480;
  SAMPLES.find(s=>s.id===id).draw(c.getContext('2d'));
  return c;
}
