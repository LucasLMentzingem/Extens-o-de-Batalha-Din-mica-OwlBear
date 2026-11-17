import {pontosInteracaoRecipiente,chaveSelecaoRecipiente} from './loot-geometry.mjs?v=0.8.54';
const ns='aventura-dnd.combate.v1',prefixoRecipiente='laarte-recipiente-';
// Une operações por lote e só grava os campos que realmente mudaram.
export function criarSincronizadorRecipientes({items,buildImage,buildCurve,baseUrl}){
return async function sincronizarTokensRecipientes(s,pixelsMetro){
  const itens=await items.getItems(),porId=new Map(itens.map(i=>[i.id,i])),novos=[],ajustes=new Map();
  const chave=ns+'/recipiente',vivos=new Set((s.recipientes??[]).map(r=>r.id));
  const orfaos=itens.filter(i=>i.metadata?.[chave]&&!vivos.has(i.metadata[chave])).map(i=>i.id);
  const ajustar=(original,desejado)=>{const patch={};for(const [k,v] of Object.entries(desejado))if(JSON.stringify(original[k])!==JSON.stringify(v))patch[k]=v;if(Object.keys(patch).length)ajustes.set(original.id,patch);};
  for(const r of s.recipientes??[]){
    const id=r.tokenId??(prefixoRecipiente+r.id),hitId=id+'-selecao',existente=porId.get(id),hit=porId.get(hitId),camada=r.tipo==='chao'?'ATTACHMENT':'PROP';
    const atual=hit??existente;if(atual)r.posicaoM={x:atual.position.x/pixelsMetro,y:atual.position.y/pixelsMetro};
    const caminho=r.tipo==='caixa'?'assets/props/bau-madeira-saque-75graus.webp':(r.itens?.[0]?.icone??'assets/props/loot-no-chao.svg');
    const url=/^(?:https?:|data:|blob:)/.test(caminho)?caminho:new URL('./'+caminho.replace(/^\.\//,''),baseUrl).href;
    let imagem=existente;
    if(!imagem){
      const w=r.tipo==='caixa'?1536:500,h=r.tipo==='caixa'?1024:500;
      imagem=buildImage({url,mime:/\.svg(?:\?|$)/i.test(url)?'image/svg+xml':/\.webp(?:\?|$)/i.test(url)?'image/webp':'image/png',width:w,height:h},{dpi:r.tipo==='caixa'?1536:750,offset:{x:w/2,y:h/2}}).id(id).name(r.nome).layer(camada).position({x:r.posicaoM.x*pixelsMetro,y:r.posicaoM.y*pixelsMetro}).metadata({[chave]:r.id}).build();
      Object.assign(imagem,{disableHit:true,attachedTo:hitId,disableAttachmentBehavior:r.tipo==='chao'?['SCALE']:[]});novos.push(imagem);
    }else{
      const desejado={name:r.nome,disableHit:true,attachedTo:hitId,disableAttachmentBehavior:r.tipo==='chao'?['SCALE']:[],metadata:{...imagem.metadata,[chave]:r.id}};
      if(r.tipo==='chao')Object.assign(desejado,{layer:camada,scale:{x:1,y:1},image:{...imagem.image,width:500,height:500},grid:{dpi:750,offset:{x:250,y:250}}});
      ajustar(imagem,desejado);imagem={...imagem,...desejado};
    }
    if(!hit){
      novos.push(buildCurve().id(hitId).name(r.nome).layer(camada).visible(imagem.visible!==false).position(imagem.position).rotation(imagem.rotation??0).points(pontosInteracaoRecipiente(r,pixelsMetro,imagem,pixelsMetro*1.5)).tension(0).closed(true).fillColor('#d9bf89').fillOpacity(.01).strokeOpacity(0).strokeWidth(0).metadata({[chave]:r.id,[chaveSelecaoRecipiente]:true}).build());
    }else ajustar(hit,{name:r.nome,...(r.tipo==='chao'?{layer:camada,scale:{x:1,y:1}}:{})});
    r.tokenId=id;
  }
  if(orfaos.length)await items.deleteItems(orfaos);
  if(novos.length)await items.addItems(novos);
  if(ajustes.size)await items.updateItems([...ajustes.keys()],items=>{for(const i of items)Object.assign(i,ajustes.get(i.id));});
}
}
