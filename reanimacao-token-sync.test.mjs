import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {criarSincronizadorTokensReanimados,chaveTokenReanimado} from './site/reanimacao-token-sync.mjs';
import {novo,adicionar,validar,dadoLocal,publico} from './site/engine.mjs';
import {aplicar} from './test-helpers/acao-confirmada.mjs';
import {compactarEstado} from './site/catalog.mjs';
const fonte=n=>JSON.parse(fs.readFileSync(new URL('./conteudo/aventura-no-cemiterio/'+n+'.json',import.meta.url)));
const token=(id='token')=>({id,type:'IMAGE',layer:'CHARACTER',name:'Nome original',image:{url:'https://original/token.png',mime:'image/png',width:600,height:800},grid:{dpi:300,offset:{x:170,y:321}},scale:{x:-1.2,y:1.3},position:{x:170.5,y:22.9},rotation:37,visible:false,locked:true,metadata:{outro:'preservar'},attachedTo:'ancora',text:{plainText:'rótulo'}});
function ambiente(){const store=new Map([['token',token()]]),calls={update:0};let falhar=false;
  const items={getItems:async filtro=>structuredClone([...store.values()].filter(filtro)),updateItems:async(ids,fn)=>{calls.update++;if(falhar){falhar=false;throw Error('RateLimitHit');}const copia=structuredClone(ids.map(id=>store.get(id)));fn(copia);for(const i of copia)store.set(i.id,i);}};
  return {store,calls,fail:()=>falhar=true,sync:criarSincronizadorTokensReanimados({items,baseUrl:'https://example.org/extension/background.html'})};
}
const estado=modelo=>({atores:[{id:'ator',token:'token',pv:15,sobreposicaoFicha:{modelo}}]});
test('zumbi e zumbigoblin usam as artes fornecidas e ocupam uma célula em qualquer DPI',async()=>{
  for(const modelo of ['zumbi','zumbigoblin'])for(const dpi of [70,100,150,300]){const m=ambiente(),s=estado(modelo),antes=structuredClone(m.store.get('token'));await m.sync(s);const i=m.store.get('token');assert.equal(i.image.url,'https://example.org/extension/assets/tokens/cemiterio/'+modelo+'.png');assert.equal(i.image.width,1254);assert.equal(i.image.width/i.grid.dpi*i.scale.x*dpi,dpi);assert.equal(i.image.height/i.grid.dpi*i.scale.y*dpi,dpi);assert.deepEqual(i.position,antes.position);assert.equal(i.rotation,37);assert.equal(i.visible,false);assert.equal(i.locked,true);assert.equal(i.id,antes.id);assert.equal(i.attachedTo,'ancora');assert.deepEqual(i.text,antes.text);assert.equal(i.metadata.outro,'preservar');assert.deepEqual(s.atores[0].sobreposicaoFicha.tokenOriginal.image,antes.image);}
});
test('sincronização estável e segunda morte não regravam nem perdem a imagem original',async()=>{
  const m=ambiente(),s=estado('zumbigoblin');await m.sync(s);const original=structuredClone(s.atores[0].sobreposicaoFicha.tokenOriginal);s.atores[0].pv=0;for(let i=0;i<20;i++)await m.sync(s);assert.equal(m.calls.update,1);assert.deepEqual(s.atores[0].sobreposicaoFicha.tokenOriginal,original);
});
test('restauração após salvar/reabrir devolve imagem, alinhamento e escala; preserva movimento atual',async()=>{
  const m=ambiente(),s=estado('zumbi'),antes=structuredClone(m.store.get('token'));await m.sync(s);const salvo=JSON.parse(JSON.stringify(s)),a=salvo.atores[0];a.restauracaoTokenPendente=a.sobreposicaoFicha.tokenOriginal;delete a.sobreposicaoFicha;m.store.get('token').position={x:777,y:888};await m.sync(salvo);const i=m.store.get('token');assert.deepEqual(i.image,antes.image);assert.deepEqual(i.grid,antes.grid);assert.deepEqual(i.scale,antes.scale);assert.deepEqual(i.position,{x:777,y:888});assert.ok(!i.metadata[chaveTokenReanimado]);assert.ok(!a.restauracaoTokenPendente);await m.sync(salvo);assert.equal(m.calls.update,2);
});
test('falha visual permite recuperação sem duplicar token e sem sobrescrever o backup',async()=>{
  const m=ambiente(),s=estado('zumbi');m.fail();await assert.rejects(()=>m.sync(s),/RateLimitHit/);assert.equal(m.store.get('token').image.url,'https://original/token.png');assert.ok(s.atores[0].sobreposicaoFicha.tokenOriginal);const salvo=JSON.parse(JSON.stringify(s));await m.sync(salvo);assert.equal(m.store.size,1);assert.equal(salvo.atores[0].sobreposicaoFicha.tokenOriginal.image.url,'https://original/token.png');
  salvo.atores[0].restauracaoTokenPendente=salvo.atores[0].sobreposicaoFicha.tokenOriginal;delete salvo.atores[0].sobreposicaoFicha;m.fail();await assert.rejects(()=>m.sync(salvo));assert.ok(salvo.atores[0].restauracaoTokenPendente);await m.sync(salvo);assert.equal(m.store.get('token').image.url,'https://original/token.png');
});
test('metadata recupera original após interrupção e não restaura por engano um token duplicado',async()=>{
  const m=ambiente(),s=estado('zumbi');await m.sync(s);delete s.atores[0].sobreposicaoFicha.tokenOriginal;await m.sync(s);assert.equal(s.atores[0].sobreposicaoFicha.tokenOriginal.image.url,'https://original/token.png');m.store.set('copia',{...structuredClone(m.store.get('token')),id:'copia'});s.atores=[];await m.sync(s);assert.equal(m.store.get('token').image.url,'https://original/token.png');assert.match(m.store.get('copia').image.url,/zumbi.png$/);
});
test('trocar vínculo de token guarda um backup específico para cada peça',async()=>{
  const m=ambiente(),s=estado('zumbi');await m.sync(s);m.store.set('novo',token('novo'));m.store.get('novo').image.url='https://original/novo.png';s.atores[0].token='novo';await m.sync(s);assert.equal(m.store.get('token').image.url,'https://original/token.png');assert.equal(s.atores[0].sobreposicaoFicha.tokenOriginal.image.url,'https://original/novo.png');
});
test('fluxo real: reanimar goblin, persistir, morrer, remover camada e restaurar token',async()=>{
  const s=novo(),d=adicionar(s,validar(fonte('drow-necromante-6'))),g=adicionar(s,validar(fonte('goblin-1')));d.x=g.x=0;g.pv=0;g.estadoVida='morto';g.token='token';const gm={id:'m',role:'GM'};
  let n=await aplicar(s,{tipo:'reanimarCorpo',rev:s.rev,ator:g.id,conjuradorId:d.id,confirmado:true,minutoConcluido:true},gm,dadoLocal);const m=ambiente();await m.sync(n);assert.match(m.store.get('token').image.url,/zumbigoblin.png$/);n=JSON.parse(JSON.stringify(compactarEstado(n)));for(const a of n.atores)a.ficha=validar(a.ficha);n.atores[1].pv=0;n.atores[1].estadoVida='morto';await m.sync(n);assert.ok(!JSON.stringify(publico(n)).includes('original/token.png'));n=await aplicar(n,{tipo:'removerSobreposicaoFicha',rev:n.rev,ator:g.id,confirmado:true},gm,dadoLocal);assert.ok(n.atores[1].restauracaoTokenPendente);assert.ok(!JSON.stringify(publico(n)).includes('restauracaoTokenPendente'));await m.sync(n);assert.equal(m.store.get('token').image.url,'https://original/token.png');assert.equal(n.atores[1].pv,0);assert.equal(n.atores[1].ficha.id,'cemiterio-goblin-1');
});
