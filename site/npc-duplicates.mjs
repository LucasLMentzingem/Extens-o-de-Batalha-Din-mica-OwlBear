import {adicionar} from './engine.mjs?v=0.8.53';
import {compactarFicha} from './catalog.mjs?v=0.8.53';

export const chaveFichaNpc='aventura-dnd.combate.v1/ficha-npc';
export const chaveBloqueioNpc='aventura-dnd.combate.v1/bloqueio-anterior';

// O marcador é copiado pelo Owlbear. O vínculo real continua sendo o ID
// exclusivo do token, de modo que repetir um evento nunca cria outra ficha.
export function sincronizarCopiasNpc(estado,itens,pixelsMetro){
  if(!Number.isFinite(pixelsMetro)||pixelsMetro<=0)throw Error('Escala da cena inválida.');
  const tokens=itens.filter(i=>i.type==='IMAGE'&&i.layer==='CHARACTER');
  const vinculados=new Map(estado.atores.filter(a=>a.token).map(a=>[a.token,a]));
  const porId=new Map(estado.atores.map(a=>[a.id,a]));
  const alteracoes=[],novos=[];
  for(const token of tokens){
    let ator=vinculados.get(token.id);
    const marcador=token.metadata?.[chaveFichaNpc];
    if(!ator&&marcador?.tokenId!==token.id){
      const origem=porId.get(marcador?.atorId);
      if(origem?.ficha.tipo==='npc'&&origem.token===marcador.tokenId){
        const base=origem.nome.replace(/ \(\d+\)$/,'');
        let indice=2;
        while(estado.atores.some(a=>a.nome===base+' ('+indice+')'))indice++;
        const ficha=compactarFicha(origem.ficha);
        for(const item of ficha.inventario?.itens??[])delete item.saldosRecursos;
        ator=adicionar(estado,ficha,base+' ('+indice+')');
        if(origem.grupoFicha)ator.grupoFicha=structuredClone(origem.grupoFicha);
        ator.token=token.id;ator.dono=null;
        ator.x=token.position.x/pixelsMetro;ator.y=token.position.y/pixelsMetro;
        ator.emCombate=estado.fase==='preparo';
        vinculados.set(token.id,ator);porId.set(ator.id,ator);novos.push(ator.id);
      }
    }
    if(ator?.ficha.tipo==='npc'){
      if(marcador?.atorId!==ator.id||marcador?.tokenId!==token.id){
        alteracoes.push({tokenId:token.id,marcador:{atorId:ator.id,tokenId:token.id},nome:novos.includes(ator.id)?ator.nome:undefined,
          liberar:novos.includes(ator.id)&&typeof token.metadata?.[chaveBloqueioNpc]==='boolean'?token.metadata[chaveBloqueioNpc]:undefined});
      }
    }else if(marcador&&ator){
      alteracoes.push({tokenId:token.id,marcador:null});
    }
  }
  if(novos.length)estado.rev++;
  return {novos,alteracoes};
}
