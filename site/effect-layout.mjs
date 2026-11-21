// Área entre Extras (esquerda) e a barra central do Owlbear. Sem janela vazia.
export function caixaEfeitos({largura,altura,quantidade}){
  if(!quantidade)return null;
  const esquerda=72,gap=3,padding=4,capacidade=10;
  const inicioFerramentas=(largura-420)/2,livre=inicioFerramentas-16-esquerda;
  const colunas=Math.min(capacidade,quantidade),acima=livre<colunas*28+(colunas-1)*gap+padding;
  const disponivel=acima?Math.max(1,Math.min(650,largura-esquerda-16)):livre;
  const icone=Math.max(12,Math.min(32,Math.floor((disponivel-(colunas-1)*gap-padding)/colunas)));
  const width=Math.min(disponivel,colunas*icone+(colunas-1)*gap+padding);
  const height=icone+12,bottom=acima?64:4;
  return {x:esquerda,y:Math.max(8,altura-bottom-height),width,height,icone,gap,capacidade,acima,reservaInferior:48};
}
