import {METROS_POR_CELULA} from './scene-scale.mjs?v=0.8.69';
// Alcance parte da origem desenhada; basta tocar o disco do alvo. Metros contínuos.
// A hitbox vem do token da cena, nunca de parâmetros enviados pelo jogador.
export function hitboxToken(t){
  const w=t?.image?.width,h=t?.image?.height,dpi=t?.grid?.dpi;
  const sx=t?.scale?.x??1,sy=t?.scale?.y??1;
  if(![w,h,dpi,sx,sy].every(Number.isFinite)||w<=0||h<=0||dpi<=0)return undefined;
  const fator=METROS_POR_CELULA/dpi,ang=(t.rotation??0)*Math.PI/180;
  const dx=(w/2-(t.grid.offset?.x??w/2))*sx*fator,dy=(h/2-(t.grid.offset?.y??h/2))*sy*fator;
  // Disco inscrito: não inclui os cantos transparentes nem amplia tokens achatados.
  return {raioM:Math.min(w*Math.abs(sx),h*Math.abs(sy))*fator/2,
    offsetX:dx*Math.cos(ang)-dy*Math.sin(ang),offsetY:dx*Math.sin(ang)+dy*Math.cos(ang)};
}
export const raioAlvo=a=>Number.isFinite(a?.hitbox?.raioM)?Math.max(0,a.hitbox.raioM):0;
export const centroAlvo=a=>({x:a.x+(a.hitbox?.offsetX??0),y:a.y+(a.hitbox?.offsetY??0)});
export function distanciaAoAlvo(origem,alvo){
  const c=centroAlvo(alvo);return Math.max(0,Math.hypot(origem.x-c.x,origem.y-c.y)-raioAlvo(alvo));
}
function distanciaSegmento(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,n=dx*dx+dy*dy;
  const t=n?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/n)):0;
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
export function discoNoPoligono(alvo,pol){
  const c=centroAlvo(alvo),r=raioAlvo(alvo);let sinal=0,dentro=true;
  for(let i=0;i<pol.length;i++){
    const a=pol[i],b=pol[(i+1)%pol.length],cruz=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
    if(distanciaSegmento(c,a,b)<=r+1e-8)return true;
    if(Math.abs(cruz)<=1e-8)continue;
    if(sinal&&Math.sign(cruz)!==sinal)dentro=false;sinal=Math.sign(cruz);
  }
  return dentro;
}
export function dentroDaArea(origem,ponto,alvo,regra){
  const area=regra?.area??(regra?.raioM?{forma:'circulo',raioM:regra.raioM}:null);if(!area)return false;
  const c=ponto;
  if(area.forma==='circulo')return distanciaAoAlvo(c,alvo)<=area.raioM+1e-8;
  if(area.forma==='quadrado'){
    const m=area.tamanhoM/2,p=centroAlvo(alvo);
    return Math.hypot(Math.max(0,Math.abs(p.x-c.x)-m),Math.max(0,Math.abs(p.y-c.y)-m))<=raioAlvo(alvo)+1e-8;
  }
  const dx=c.x-origem.x,dy=c.y-origem.y,n=Math.hypot(dx,dy);if(n<=1e-8)return false;
  const ux=dx/n,uy=dy/n,l=area.comprimentoM,w=(area.larguraM??(area.forma==='cone'?l:1.5))/2;
  const fim={x:origem.x+ux*l,y:origem.y+uy*l},a={x:fim.x-uy*w,y:fim.y+ux*w},b={x:fim.x+uy*w,y:fim.y-ux*w};
  if(area.forma==='cone')return discoNoPoligono(alvo,[origem,a,b]);
  if(area.forma==='linha')return discoNoPoligono(alvo,[{x:origem.x-uy*w,y:origem.y+ux*w},a,b,{x:origem.x+uy*w,y:origem.y-ux*w}]);
  return false;
}
