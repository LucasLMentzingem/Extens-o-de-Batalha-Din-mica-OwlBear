export const chaveTokenReanimado='aventura-dnd.combate.v1/token-reanimado';
export const artesTokensReanimacao=Object.freeze({
  zumbi:{arquivo:'assets/tokens/cemiterio/zumbi.png',width:1254,height:1254,celulas:1},
  zumbigoblin:{arquivo:'assets/tokens/cemiterio/zumbigoblin.png',width:1254,height:1254,celulas:1}
});
const clone=x=>structuredClone(x),igual=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const visual=i=>({image:clone(i.image),grid:clone(i.grid),scale:clone(i.scale??{x:1,y:1})});

// Atualiza a imagem na mesma peça: vínculos, posição, rotação, visibilidade,
// bloqueio e anexos permanecem no item original do SDK.
export function criarSincronizadorTokensReanimados({items,baseUrl}){
  return async function sincronizar(s){
    const tokens=await items.getItems(i=>i.type==='IMAGE'&&i.layer==='CHARACTER');
    const atores=new Map((s.atores??[]).filter(a=>a.token).map(a=>[a.token,a]));
    const ajustes=new Map(),restaurados=[];
    for(const token of tokens){
      const a=atores.get(token.id),camada=a?.sobreposicaoFicha,arte=artesTokensReanimacao[camada?.modelo];
      const marcador=token.metadata?.[chaveTokenReanimado];
      if(arte){
        const salvo=camada.tokenOriginal?.tokenId===token.id?camada.tokenOriginal
          :a.restauracaoTokenPendente?.tokenId===token.id?a.restauracaoTokenPendente
          :marcador?.tokenId===token.id&&marcador.atorId===a.id?marcador.original:null;
        const original=salvo??{tokenId:token.id,...visual(token)};
        // Guardado antes da chamada do SDK: uma falha pode ser persistida e repetida.
        camada.tokenOriginal=clone(original);
        delete a.restauracaoTokenPendente;
        const desejado={image:{url:new URL(arte.arquivo,baseUrl).href,mime:'image/png',width:arte.width,height:arte.height},grid:{dpi:arte.width/arte.celulas,offset:{x:arte.width/2,y:arte.height/2}},scale:{x:1,y:1}};
        const backup={atorId:a.id,tokenId:token.id,modelo:camada.modelo,original:clone(original)};
        if(!igual(visual(token),desejado)||!igual(marcador,backup))ajustes.set(token.id,{...desejado,backup});
      }else{
        const pendente=a?.restauracaoTokenPendente;
        const original=pendente?.tokenId===token.id?pendente:marcador?.tokenId===token.id&&(!a||marcador.atorId===a.id)?marcador.original:null;
        if(!original)continue;
        const desejado={image:clone(original.image),grid:clone(original.grid),scale:clone(original.scale)};
        if(!igual(visual(token),desejado)||marcador)ajustes.set(token.id,{...desejado,backup:null});
        if(pendente?.tokenId===token.id)restaurados.push(a);
      }
    }
    if(ajustes.size)await items.updateItems([...ajustes.keys()],lista=>{
      for(const i of lista){const ajuste=ajustes.get(i.id);if(!ajuste)continue;
        i.image=ajuste.image;i.grid=ajuste.grid;i.scale=ajuste.scale;i.metadata??={};
        if(ajuste.backup)i.metadata[chaveTokenReanimado]=ajuste.backup;else delete i.metadata[chaveTokenReanimado];
      }
    });
    for(const a of restaurados)delete a.restauracaoTokenPendente;
  };
}
