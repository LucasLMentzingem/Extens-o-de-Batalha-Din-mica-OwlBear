import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {agruparAtoresMestre} from './site/grupos-mestre.mjs';
import {novo,adicionar,aplicar,validar} from './site/engine.mjs';
import {compactarEstado} from './site/catalog.mjs';
import {sincronizarCopiasNpc,chaveFichaNpc} from './site/npc-duplicates.mjs';
const ficha=async id=>JSON.parse(await fs.readFile('site/fichas/'+id+'.json','utf8'));

test('listas do mestre: aventureiros primeiro, grupos antigos e importados sem duplicar atores',()=>{
 const atores=[{id:'a',ficha:{id:'soldado',tipo:'npc'}},{id:'b',ficha:{id:'qualquer',tipo:'pj'},grupoFicha:{id:'pasta',nome:'Pasta'}},{id:'c',ficha:{id:'custom',tipo:'npc'},grupoFicha:{id:'pasta',nome:'Pasta'}},{id:'d',ficha:{id:'reino',tipo:'npc'}},{id:'e',ficha:{id:'outro',tipo:'npc'}}];
 const grupos=agruparAtoresMestre(atores,[{id:'soldados-do-reino',nome:'Soldados do Reino',fichas:[{id:'reino'}]}]);
 assert.deepEqual(grupos.map(g=>g.nome),['Aventureiros','Soldados do Reino','Pasta','Outros personagens']);assert.equal(grupos[1].atores.length,2);assert.equal(grupos.flatMap(g=>g.atores).length,atores.length);
});

test('origem do grupo persiste ao importar, compactar/reabrir e duplicar token NPC',async()=>{
 let s=novo();s=await aplicar(s,{tipo:'adicionarGrupo',fichas:[await ficha('soldado')],origemGrupo:{id:'aliados',nome:'Aliados da torre'},rev:s.rev},{id:'gm',role:'GM'});
 s=compactarEstado(s);s.atores.forEach(a=>a.ficha=validar(a.ficha));const origem=s.atores[0];origem.token='original';
 sincronizarCopiasNpc(s,[{id:'copia',type:'IMAGE',layer:'CHARACTER',position:{x:10,y:10},metadata:{[chaveFichaNpc]:{atorId:origem.id,tokenId:'original'}}}],100);
 assert.equal(s.atores.length,2);assert.deepEqual(s.atores[1].grupoFicha,origem.grupoFicha);assert.equal(agruparAtoresMestre(s.atores)[0].atores.length,2);
});

test('grupo importado usa o nome salvo e agrupar não altera a ordem de iniciativa',async()=>{
 let s=novo();s.gruposFichas=[{id:'pasta-exemplo',nome:'Guarnição',fichas:[await ficha('soldado')]}];
 s=await aplicar(s,{tipo:'adicionarGrupo',grupoId:'pasta-exemplo',rev:s.rev},{id:'gm',role:'GM'});adicionar(s,await ficha('nikki'));s.ordem=s.atores.map(a=>a.id);const antes=[...s.ordem];
 assert.equal(s.atores[0].grupoFicha.nome,'Guarnição');assert.equal(agruparAtoresMestre(s.atores)[0].nome,'Aventureiros');assert.deepEqual(s.ordem,antes);
});
