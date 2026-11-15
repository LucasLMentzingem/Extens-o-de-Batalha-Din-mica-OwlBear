// M05 — Zonas persistentes (issue #44) e consulta de trajetória do M08 (issue #47).
// Geometria pura em metros, euclidiana e contínua: o grid é só visual.
// O motor (autoridade do mestre) e a prévia da HUD usam as mesmas funções.

const EPS=1e-9;

// Polígono convexo da zona, em coordenadas absolutas. Círculos retornam null.
export function poligonoZona(z){
  const c=z.centro,g=z.geometria??{};
  if(g.forma==='quadrado'){const m=g.tamanhoM/2;return [{x:c.x-m,y:c.y-m},{x:c.x+m,y:c.y-m},{x:c.x+m,y:c.y+m},{x:c.x-m,y:c.y+m}];}
  if(g.forma==='cone'||g.forma==='linha'){
    const o=g.origem??c,dx=c.x-o.x,dy=c.y-o.y,n=Math.hypot(dx,dy)||1,ux=dx/n,uy=dy/n,l=g.comprimentoM,px=-uy,py=ux;
    const w=(g.larguraM??(g.forma==='cone'?l:1.5))/2;
    if(g.forma==='cone')return [{x:o.x,y:o.y},{x:o.x+ux*l+px*w,y:o.y+uy*l+py*w},{x:o.x+ux*l-px*w,y:o.y+uy*l-py*w}];
    return [{x:o.x+px*w,y:o.y+py*w},{x:o.x+ux*l+px*w,y:o.y+uy*l+py*w},{x:o.x+ux*l-px*w,y:o.y+uy*l-py*w},{x:o.x-px*w,y:o.y-py*w}];
  }
  return null;
}

export function pontoNaZona(z,p){
  const g=z.geometria??{};
  if(g.forma==='circulo')return Math.hypot(p.x-z.centro.x,p.y-z.centro.y)<=g.raioM+1e-8;
  const pol=poligonoZona(z);if(!pol)return false;
  let sinal=0;
  for(let i=0;i<pol.length;i++){
    const a=pol[i],b=pol[(i+1)%pol.length],cruz=(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
    if(Math.abs(cruz)<=1e-8)continue;const s=Math.sign(cruz);if(sinal&&s!==sinal)return false;sinal=s;
  }
  return true;
}

// Trecho [t0,t1] (0..1) do segmento a→b que fica dentro da zona, ou null.
export function trechoNaZona(z,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,g=z.geometria??{};
  if(Math.hypot(dx,dy)<=EPS)return pontoNaZona(z,a)?[0,0]:null;
  if(g.forma==='circulo'){
    const fx=a.x-z.centro.x,fy=a.y-z.centro.y,A=dx*dx+dy*dy,B=2*(fx*dx+fy*dy),C=fx*fx+fy*fy-g.raioM*g.raioM,delta=B*B-4*A*C;
    if(delta<0)return null;
    const r=Math.sqrt(delta),t0=Math.max(0,(-B-r)/(2*A)),t1=Math.min(1,(-B+r)/(2*A));
    return t0<=t1+EPS?[t0,Math.max(t0,t1)]:null;
  }
  const pol=poligonoZona(z);if(!pol)return null;
  // Cyrus–Beck: recorte do segmento por polígono convexo (orientação detectada).
  let area=0;for(let i=0;i<pol.length;i++){const p=pol[i],q=pol[(i+1)%pol.length];area+=p.x*q.y-q.x*p.y;}
  const orient=area>=0?1:-1;let t0=0,t1=1;
  for(let i=0;i<pol.length;i++){
    const p=pol[i],q=pol[(i+1)%pol.length],nx=-(q.y-p.y)*orient,ny=(q.x-p.x)*orient; // normal para dentro
    const num=nx*(a.x-p.x)+ny*(a.y-p.y),den=nx*dx+ny*dy;
    if(Math.abs(den)<=EPS){if(num<-1e-8)return null;continue;}
    const t=-num/den;
    if(den>0)t0=Math.max(t0,t);else t1=Math.min(t1,t);
    if(t0>t1+EPS)return null;
  }
  return [t0,Math.max(t0,t1)];
}

// A zona afeta esta criatura? (base da "hostilidade" mostrada na prévia)
export function zonaAfeta(z,ator){
  if(!ator)return false;
  if(z.afetaConjurador===false&&ator.id===z.origemAtorId)return false;
  return true;
}

// Primeiro contato de uma trajetória com zonas que afetam o movente.
// Considera trajetos que começam e terminam fora, mas atravessam a área.
export function primeiroContato(zonas,a,b,movente){
  let melhor=null;
  for(const z of zonas??[]){
    if(!zonaAfeta(z,movente))continue;
    const tr=trechoNaZona(z,a,b);if(!tr)continue;
    if(!melhor||tr[0]<melhor.t)melhor={zona:z,t:tr[0],ponto:{x:a.x+(b.x-a.x)*tr[0],y:a.y+(b.y-a.y)*tr[0]}};
  }
  return melhor;
}

// Metros de terreno difícil impostos por zonas no trajeto. Zonas sobrepostas não somam duas vezes.
export function terrenoDificilDasZonas(zonas,a,b,movente){
  const d=Math.hypot(b.x-a.x,b.y-a.y);if(d<=EPS)return 0;
  const trechos=(zonas??[]).filter(z=>z.terrenoDificil&&zonaAfeta(z,movente)).map(z=>trechoNaZona(z,a,b)).filter(Boolean).sort((x,y)=>x[0]-y[0]);
  let total=0,fim=-1;
  for(const [t0,t1] of trechos){const ini=Math.max(t0,fim);if(t1>ini)total+=t1-ini;fim=Math.max(fim,t1);}
  return total*d;
}

// Zonas em que o trajeto entra (estava fora no início e cruza a borda), em ordem de contato.
export function entradasNaTrajetoria(zonas,a,b,movente){
  return (zonas??[]).filter(z=>zonaAfeta(z,movente)&&!pontoNaZona(z,a)).map(z=>({zona:z,trecho:trechoNaZona(z,a,b)})).filter(x=>x.trecho).sort((x,y)=>x.trecho[0]-y.trecho[0]).map(x=>x.zona);
}

// Representação pública compacta (marcas no mapa).
export function marcaZona(z){
  const g=z.geometria??{};
  return {id:z.id,nome:z.nome,cor:z.cor??'#5fae5b',forma:g.forma,centro:z.centro,raioM:g.raioM,poligono:poligonoZona(z)};
}
