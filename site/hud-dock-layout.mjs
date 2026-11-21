// Geometria local da HUD: não participa do estado compartilhado do combate.
export function larguraLinhaRecursos(quantidade){
  const n=Math.max(0,Math.floor(Number(quantidade)||0));return n*42+Math.max(0,n-1)*3;
}
export function gradeRodape(quantidade,linhas){
  const itens=Math.max(0,Math.floor(Number(quantidade)||0)),preferencia=Math.max(1,Math.min(5,Math.floor(Number(linhas)||1)));
  const efetivas=Math.min(preferencia,Math.max(1,itens)),colunas=Math.ceil(itens/efetivas);
  return {linhas:efetivas,colunas,largura:colunas?colunas*50+(colunas-1)*3:180,altura:itens?efetivas*50+(efetivas-1)*3:50};
}
export function medidaRodapeValida(d,{atorId,linhas,rev}){
  return d?.parte==='barra'&&d.atorId===atorId&&d.linhas===linhas&&d.rev===rev&&
    ['larguraIdeal','larguraMedida','altura'].every(k=>Number.isFinite(d[k])&&d[k]>0&&d[k]<=8192)&&d.altura>=60;
}
export function caixaRodape({larguraMaxima,alturaMaxima,linhas,medida}){
  const largura=Math.max(1,Math.min(1120,Math.floor(larguraMaxima))),altura=Math.max(1,Math.floor(alturaMaxima));
  return {largura:Math.min(largura,Math.max(Math.min(300,largura),Math.ceil(medida?.larguraIdeal??largura))),
    altura:Math.min(altura,Math.max(1,Math.ceil(medida?.altura??(132+gradeRodape(999,linhas).altura))))};
}
