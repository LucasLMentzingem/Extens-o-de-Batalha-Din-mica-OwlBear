const pontoValido=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
const corValida=c=>typeof c==='string'&&/^#[0-9a-f]{3,8}$/i.test(c);

export function remetentePodePublicarPrevia(remetente,ator){
  return Boolean(remetente&&ator&&(remetente.role==='GM'||(remetente.role==='PLAYER'&&ator.ficha?.tipo==='pj'&&ator.dono===remetente.id)));
}

export function compactarMarcas(items){
  return items.flatMap(item=>{
    if(item.type==='LINE')return [{tipo:'linha',inicio:item.startPosition,fim:item.endPosition,cor:item.style?.strokeColor,largura:item.style?.strokeWidth}];
    if(item.type==='CURVE')return [{tipo:'curva',posicao:item.position,pontos:item.points,cor:item.style?.strokeColor,largura:item.style?.strokeWidth,
      preenchimento:item.style?.fillColor,opacidade:item.style?.fillOpacity,fechada:Boolean(item.style?.closed)}];
    return [];
  });
}

export function marcasPublicasValidas(marcas){
  return Array.isArray(marcas)&&marcas.length<=80&&marcas.every(m=>{
    if(m?.tipo==='linha')return pontoValido(m.inicio)&&pontoValido(m.fim)&&corValida(m.cor)&&Number.isFinite(m.largura)&&m.largura>0&&m.largura<=12;
    if(m?.tipo==='curva')return pontoValido(m.posicao)&&Array.isArray(m.pontos)&&m.pontos.length>=2&&m.pontos.length<=120&&m.pontos.every(pontoValido)&&
      corValida(m.cor)&&corValida(m.preenchimento)&&Number.isFinite(m.largura)&&m.largura>0&&m.largura<=12&&Number.isFinite(m.opacidade)&&m.opacidade>=0&&m.opacidade<=.5;
    return false;
  });
}
