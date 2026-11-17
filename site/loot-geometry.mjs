// Área de interação independente dos pixels opacos da imagem.
export const chaveSelecaoRecipiente='aventura-dnd.combate.v1/recipiente-selecao';
export const idSelecaoRecipiente=r=>r.tokenId+'-selecao';
export function pontosInteracaoRecipiente(r,pixelsMetro,imagem,dpi){
  if(r.tipo==='chao')return Array.from({length:48},(_,i)=>({x:Math.cos(i*Math.PI/24)*pixelsMetro/2,y:Math.sin(i*Math.PI/24)*pixelsMetro/2}));
  const w=imagem?.image?.width??500,h=imagem?.image?.height??500,grid=imagem?.grid?.dpi??500*1.5;
  const largura=w*(dpi??pixelsMetro*1.5)/grid*Math.abs(imagem?.scale?.x??1),altura=h*(dpi??pixelsMetro*1.5)/grid*Math.abs(imagem?.scale?.y??1);
  const ox=(imagem?.grid?.offset?.x??w/2)/w*largura,oy=(imagem?.grid?.offset?.y??h/2)/h*altura;
  return [{x:-ox,y:-oy},{x:largura-ox,y:-oy},{x:largura-ox,y:altura-oy},{x:-ox,y:altura-oy}];
}
export function pontoNoRecipiente(p,r,pixelsMetro,imagem,hit){
  const centro=hit?.position??imagem?.position??{x:r.posicaoM.x*pixelsMetro,y:r.posicaoM.y*pixelsMetro};
  const ang=-(hit?.rotation??imagem?.rotation??0)*Math.PI/180,dx=p.x-centro.x,dy=p.y-centro.y,x=dx*Math.cos(ang)-dy*Math.sin(ang),y=dx*Math.sin(ang)+dy*Math.cos(ang);
  if(r.tipo==='chao')return Math.hypot(x,y)<=pixelsMetro/2+1e-8;
  const pontos=hit?.points??pontosInteracaoRecipiente(r,pixelsMetro,imagem);
  const sx=Math.abs(hit?.scale?.x??1),sy=Math.abs(hit?.scale?.y??1);
  return x>=Math.min(...pontos.map(p=>p.x))*sx-1e-8&&x<=Math.max(...pontos.map(p=>p.x))*sx+1e-8&&y>=Math.min(...pontos.map(p=>p.y))*sy-1e-8&&y<=Math.max(...pontos.map(p=>p.y))*sy+1e-8;
}
