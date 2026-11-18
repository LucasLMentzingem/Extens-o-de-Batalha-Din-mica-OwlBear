import OBR from './vendor/sdk.mjs';
const ns='aventura-dnd.combate.v1';
// Compartilhado entre painel e background: confirma sucesso antes de marcar a janela como aberta.
export async function abrirJanelaInventario(tipo,atorId,sessaoId){
  const chave=ns+'/janela-inventario/'+OBR.room.id+'/'+tipo,identidade=atorId+'/'+sessaoId;
  let atual;try{atual=JSON.parse(localStorage.getItem(chave)||'null');}catch{}
  if(atual?.identidade===identidade&&Date.now()-atual.quando<2500)return false;
  const nonce=crypto.randomUUID();localStorage.setItem(chave,JSON.stringify({identidade,nonce,quando:Date.now()}));
  const id=ns+'/'+tipo;
  try{
    const [w,h]=await Promise.all([OBR.viewport.getWidth(),OBR.viewport.getHeight()]);
    const width=Math.min(tipo==='saque'?560:680,Math.max(240,w-16)),height=Math.min(tipo==='saque'?720:820,Math.max(220,h-32));
    const url=new URL('./'+tipo+'.html?v=0.8.69',import.meta.url);url.searchParams.set('ator',atorId);if(tipo==='troca')url.searchParams.set('troca',sessaoId);
    await OBR.popover.close(id).catch(()=>{});
    await OBR.popover.open({id,url:url.href,width,height,hidePaper:true,disableClickAway:true,marginThreshold:0,anchorReference:'POSITION',anchorPosition:{left:Math.max(8,w-width-12),top:16},transformOrigin:{horizontal:'LEFT',vertical:'TOP'}});
    return true;
  }catch(e){if(JSON.parse(localStorage.getItem(chave)||'null')?.nonce===nonce)localStorage.removeItem(chave);throw e;}
}

export function trocaParaUsuario(s,eu,preferido){
  if(s.fase!=='preparo')return null;
  const online=new Set((eu.players??[]).filter(x=>x.role!=='GM').map(x=>x.id));
  for(const t of s.comercio?.trocas??[]){
    if(!['solicitada','ofertas','final'].includes(t.status))continue;
    const atores=[t.solicitante,t.destinatario].map(id=>s.atores.find(a=>a.id===id)).filter(Boolean);
    const a=eu.role==='PLAYER'?atores.find(a=>a.dono===eu.id):atores.find(a=>a.id===preferido)??atores.find(a=>a.id===t.destinatario&&(!a.dono||!online.has(a.dono)));
    if(a)return {troca:t,ator:a};
  }
  return null;
}
