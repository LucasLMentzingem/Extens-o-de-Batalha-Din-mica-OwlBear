import test from 'node:test';import assert from 'node:assert/strict';
import {normalizarFavorito,chaveFavorito,lerFavoritos,mudarFavorito} from './site/hud-favorites.mjs';
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
test('favoritos guardam referências sem cópias de ficha e validam o tipo de teste',()=>{
 assert.deepEqual(normalizarFavorito({tipo:'opcao',id:'ataque',ficha:{segredo:true}}),{tipo:'opcao',id:'ataque'});
 for(const x of [null,{},[],{tipo:'opcao',id:''},{tipo:'opcao',id:'a'.repeat(201)},{tipo:'teste',grupo:'invalido',chave:'for'}])assert.equal(normalizarFavorito(x),null);
 assert.notEqual(chaveFavorito({tipo:'opcao',id:'a'}),chaveFavorito({tipo:'opcao',id:'a',gratuito:true}));
});
test('incluir é idempotente e remover só altera o favorito escolhido',()=>{
 const s=storage(),a={tipo:'opcao',id:'a'},b={tipo:'passiva',id:'b'};
 mudarFavorito(s,'pj',a);mudarFavorito(s,'pj',b);mudarFavorito(s,'pj',a);assert.deepEqual(lerFavoritos(s,'pj'),[a,b]);
 mudarFavorito(s,'pj',a,true);assert.deepEqual(lerFavoritos(s,'pj'),[b]);mudarFavorito(s,'pj',a,true);assert.deepEqual(lerFavoritos(s,'pj'),[b]);
});
test('usuário e personagem ficam isolados pelas chaves e a leitura restaura preferências',()=>{
 const s=storage(),f={tipo:'teste',grupo:'pericias',chave:'Religião'};mudarFavorito(s,'jogador/pj1',f);
 assert.deepEqual(lerFavoritos(s,'jogador/pj1'),[f]);assert.deepEqual(lerFavoritos(s,'mestre/pj1'),[]);assert.deepEqual(lerFavoritos(s,'jogador/pj2'),[]);
});
test('dados corrompidos não quebram a HUD e listas antigas são normalizadas sem duplicação',()=>{
 const s=storage();s.setItem('k','{');assert.deepEqual(lerFavoritos(s,'k'),[]);s.setItem('k','{}');assert.deepEqual(lerFavoritos(s,'k'),[]);
 s.setItem('k',JSON.stringify([null,{tipo:'item',id:'pocao'},{tipo:'item',id:'pocao'}]));assert.deepEqual(lerFavoritos(s,'k'),[{tipo:'item',id:'pocao'}]);
});
test('limite de favoritos não impede remover e falha de gravação não anuncia sucesso',()=>{
 const s=storage();for(let n=0;n<256;n++)mudarFavorito(s,'k',{tipo:'opcao',id:String(n)});
 assert.throws(()=>mudarFavorito(s,'k',{tipo:'opcao',id:'excesso'}),/Limite/);mudarFavorito(s,'k',{tipo:'opcao',id:'0'},true);assert.equal(lerFavoritos(s,'k').length,255);
 assert.throws(()=>mudarFavorito({getItem:()=>null,setItem:()=>{throw Error('quota');}},'k',{tipo:'item',id:'pocao'}),/quota/);
});
