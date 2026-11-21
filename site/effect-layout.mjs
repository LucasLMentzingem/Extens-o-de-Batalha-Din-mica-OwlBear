// Área entre Extras (esquerda) e a barra central do Owlbear. Sem janela vazia.
export function caixaEfeitos({largura,altura,quantidade}){
  if(!quantidade)return null;
  const esquerda=72,gap=3,padding=4,capacidade=10;
  const inicioFerramentas=(largura-420)/2,livre=inicioFerramentas-16-esquerda;
  const acima=livre<capacidade*28+(capacidade-1)*gap+padding;
  const disponivel=acima?Math.max(1,Math.min(650,largura-esquerda-16)):livre;
  const icone=Math.max(12,Math.min(60,Math.floor((disponivel-(capacidade-1)*gap-padding)/capacidade)));
  const colunas=Math.min(capacidade,quantidade),width=Math.min(disponivel,colunas*icone+(colunas-1)*gap+padding);
  const height=icone+14,bottom=acima?64:8;
  return {x:esquerda,y:Math.max(8,altura-bottom-height),width,height,icone,gap,capacidade,acima,reservaInferior:bottom+height+8};
}
