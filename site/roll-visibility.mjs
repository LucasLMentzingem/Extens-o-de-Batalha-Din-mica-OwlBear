// Remove saldos ocultos antes de guardar uma rolagem no histórico do jogador.
export function rolagemParaUsuario(d,eu){
 if(eu?.role==='GM')return d;
 const out=structuredClone(d),alvos=new Map((d.meta?.alvosDano??(d.meta?.alvoDano?[d.meta.alvoDano]:[])).map(a=>[a.id,a]));
 const limparAlvo=a=>{if(a.pvPublico===true)return;for(const k of ['pv','pvMaximos','pvTemporarios'])delete a[k];a.pvOculto=true;};
 if(out.meta?.alvoDano)limparAlvo(out.meta.alvoDano);for(const a of out.meta?.alvosDano??[])limparAlvo(a);
 const limparRelatorio=r=>{if(!r||alvos.get(r.alvoId)?.pvPublico===true)return;for(const k of ['pvAntes','pvDepois','pvTemporariosAntes','pvTemporariosDepois','excesso'])delete r[k];r.pvOculto=true;};
 const visitar=r=>{if(!r)return;limparRelatorio(r.relatorioDano);for(const x of r.relatoriosDano??[])limparRelatorio(x);for(const x of r.resultados??[])visitar(x);};visitar(out.resultado);
 return out;
}

const TIPOS_COMPACTOS=new Set(['iniciativa','iniciativa_lote','salvaguarda']);

export const rolagemTemAnuncioCompacto=d=>Boolean(d?.meta&&TIPOS_COMPACTOS.has(d.meta.tipo));

export function visibilidadeRolagem(d,eu){
  if(!d||!eu)return {tipo:'ignorar'};
  if(d.tipo==='fechar')return {tipo:'fechar',pedido:d.pedido};
  const podeEditar=eu.role==='GM'||d.destino===eu.id;
  const evento={...rolagemParaUsuario(d,eu),podeEditar};
  if(!podeEditar&&rolagemTemAnuncioCompacto(d)){
    return d.tipo==='resultado'?{tipo:'anuncio',anuncio:evento}:{tipo:'ignorar'};
  }
  return {tipo:'pedido',pedido:evento};
}
