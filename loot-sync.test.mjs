import test from 'node:test';import assert from 'node:assert/strict';
import {criarSincronizadorRecipientes} from './site/loot-sync.mjs';
function ambiente(){
 const store=new Map(),calls={read:0,add:0,update:0,delete:0};let falhar=false;
 const items={getItems:async()=>{calls.read++;return structuredClone([...store.values()]);},addItems:async list=>{calls.add++;if(falhar){falhar=false;throw {error:{name:'RateLimitHit',message:'Too many requests'}};}for(const i of list){assert.ok(!store.has(i.id),'Não duplicar peças');store.set(i.id,structuredClone(i));}},updateItems:async(ids,fn)=>{calls.update++;const copy=ids.map(id=>structuredClone(store.get(id)));fn(copy);for(const i of copy)store.set(i.id,i);},deleteItems:async ids=>{calls.delete++;for(const id of ids)store.delete(id);}};
 function builder(type,image,grid){const value={type,visible:true,rotation:0,scale:{x:1,y:1},...(image?{image,grid}:{})};let b; b=new Proxy({}, {get:(_,k)=>k==='build'?()=>structuredClone(value):v=>{value[k]=v;return b;}});return b;}
 const sync=criarSincronizadorRecipientes({items,buildImage:(im,g)=>builder('IMAGE',im,g),buildCurve:()=>builder('CURVE'),baseUrl:'https://example.org/extension/background.html'});
 return {store,calls,sync,fail:()=>falhar=true};
}
const estado=n=>({recipientes:Array.from({length:n},(_,i)=>({id:'r'+i,tokenId:'loot'+i,tipo:i%5?'chao':'caixa',nome:'Loot '+i,posicaoM:{x:i,y:0},itens:[]}))});
test('estresse: 1000 recipientes, 50 sincronizações estáveis e alterações em lote',async()=>{
 const m=ambiente(),s=estado(1000);await m.sync(s,100);assert.equal(m.store.size,2000);assert.equal(m.calls.add,1);
 for(let i=0;i<50;i++)await m.sync(s,100);
 assert.equal(m.calls.update,0,'Peças prontas não podem consumir gravações do SDK');assert.equal(m.calls.add,1);
 for(const r of s.recipientes)r.nome+=' editado';await m.sync(s,100);assert.equal(m.calls.update,1,'Uma gravação para todo o lote');
 s.recipientes=[];await m.sync(s,100);assert.equal(m.calls.delete,1);assert.equal(m.store.size,0);
});
test('RateLimitHit preserva estado e recuperação cria exatamente uma imagem e uma seleção',async()=>{
 const m=ambiente(),s=estado(200);m.fail();await assert.rejects(()=>m.sync(s,100));assert.equal(s.recipientes.length,200);assert.equal(m.store.size,0);
 await m.sync(s,100);await m.sync(s,100);assert.equal(m.store.size,400);assert.equal(m.calls.update,0);
});
test('estado parcial é reparado e movimento do proxy é preservado sem regravar a cena',async()=>{
 const m=ambiente(),s=estado(1);s.recipientes[0].tipo='chao';await m.sync(s,100);
 m.store.delete('loot0-selecao');await m.sync(s,100);assert.equal(m.store.size,2);
 m.store.get('loot0-selecao').position={x:300,y:500};const before=m.calls.update;await m.sync(s,100);
 assert.deepEqual(s.recipientes[0].posicaoM,{x:3,y:5});assert.equal(m.calls.update,before);
 assert.equal(m.store.get('loot0').layer,'ATTACHMENT');
});
