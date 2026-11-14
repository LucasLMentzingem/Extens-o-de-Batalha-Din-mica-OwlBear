const TIPOS_COMPACTOS=new Set(['iniciativa','iniciativa_lote','salvaguarda']);

export const rolagemTemAnuncioCompacto=d=>Boolean(d?.meta&&TIPOS_COMPACTOS.has(d.meta.tipo));

export function visibilidadeRolagem(d,eu){
  if(!d||!eu)return {tipo:'ignorar'};
  if(d.tipo==='fechar')return {tipo:'fechar',pedido:d.pedido};
  const podeEditar=eu.role==='GM'||d.destino===eu.id;
  const evento={...d,podeEditar};
  if(!podeEditar&&rolagemTemAnuncioCompacto(d)){
    return d.tipo==='resultado'?{tipo:'anuncio',anuncio:evento}:{tipo:'ignorar'};
  }
  return {tipo:'pedido',pedido:evento};
}
