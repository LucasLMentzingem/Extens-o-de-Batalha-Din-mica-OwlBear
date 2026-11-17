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

const gm={id:'gm',role:'GM'};
async function biblioteca(){let s=novo();s=await aplicar(s,{tipo:'salvarGrupoFichas',nome:'Versão antiga',fichas:[await ficha('soldado'),await ficha('nikki')],rev:s.rev},gm);return s;}
test('excluir modelo importado mantém a unidade da cena, token, loot e origem do grupo',async()=>{
 let s=await biblioteca(),g=s.gruposFichas[0];s=await aplicar(s,{tipo:'adicionarGrupo',grupoId:g.id,indice:0,rev:s.rev},gm);
 const a=s.atores[0];a.token='token-original';a.pv=3;const anterior=structuredClone(a),primeiro=g.fichas[0];
 const n=await aplicar(s,{tipo:'excluirFichaGrupo',grupoId:g.id,indice:0,fichaId:primeiro.id,confirmado:true,rev:s.rev},gm);
 assert.deepEqual(n.gruposFichas[0].fichas.map(f=>f.id),['nikki']);assert.deepEqual(n.atores[0],anterior);assert.equal(agruparAtoresMestre(n.atores,n.gruposFichas)[0].nome,'Versão antiga');
 const salvo=JSON.parse(JSON.stringify(compactarEstado(n)));assert.equal(salvo.gruposFichas[0].fichas.length,1);assert.equal(s.gruposFichas[0].fichas.length,2);
});
test('excluir grupo inteiro preserva outros grupos, unidades e ordem de combate',async()=>{
 let s=await biblioteca(),g=s.gruposFichas[0];s=await aplicar(s,{tipo:'salvarGrupoFichas',nome:'Versão nova',fichas:[await ficha('soldado')],rev:s.rev},gm);
 s=await aplicar(s,{tipo:'adicionarGrupo',grupoId:g.id,rev:s.rev},gm);s.fase='turnos';s.ordem=s.atores.map(a=>a.id);s.vez=0;s.rodada=2;
 const atores=structuredClone(s.atores),ordem=[...s.ordem],n=await aplicar(s,{tipo:'excluirGrupoFichas',grupoId:g.id,confirmado:true,rev:s.rev},gm);
 assert.deepEqual(n.gruposFichas.map(g=>g.nome),['Versão nova']);assert.deepEqual(n.atores,atores);assert.deepEqual(n.ordem,ordem);assert.equal(n.rodada,2);assert.equal(n.fase,'turnos');
});
test('última ficha excluída remove apenas o grupo vazio e a exclusão persiste ao reabrir',async()=>{
 let s=await biblioteca(),g=s.gruposFichas[0];for(const f of [...g.fichas]){s=await aplicar(s,{tipo:'excluirFichaGrupo',grupoId:g.id,indice:0,fichaId:f.id,confirmado:true,rev:s.rev},gm);}
 assert.deepEqual(s.gruposFichas,[]);assert.deepEqual(JSON.parse(JSON.stringify(compactarEstado(s))).gruposFichas,[]);
});
test('exclusões exigem mestre, confirmação e revisão atual, sem mutar a entrada quando recusadas',async()=>{
 const s=await biblioteca(),g=s.gruposFichas[0],antes=JSON.stringify(s);
 for(const tipo of ['excluirFichaGrupo','excluirGrupoFichas'])for(const modo of ['jogador','confirmacao','revisao']){
  const c={tipo,grupoId:g.id,indice:0,fichaId:g.fichas[0].id,confirmado:modo!=='confirmacao',rev:modo==='revisao'?s.rev-1:s.rev};
  await assert.rejects(()=>aplicar(s,c,modo==='jogador'?{id:'j',role:'PLAYER'}:gm));assert.equal(JSON.stringify(s),antes);
 }
});
test('alvo alterado, índice inválido, grupo inexistente e grupo embutido não podem excluir outro modelo',async()=>{
 const s=await biblioteca(),g=s.gruposFichas[0],antes=JSON.stringify(s);
 for(const args of [{indice:9,fichaId:g.fichas[0].id},{indice:0,fichaId:'nikki'},{indice:0.5,fichaId:g.fichas[0].id},{indice:0,fichaId:g.fichas[0].id,grupoId:'soldados-do-reino'}])await assert.rejects(()=>aplicar(s,{tipo:'excluirFichaGrupo',grupoId:g.id,confirmado:true,rev:s.rev,...args},gm));
 await assert.rejects(()=>aplicar(s,{tipo:'excluirGrupoFichas',grupoId:'inexistente',confirmado:true,rev:s.rev},gm));assert.equal(JSON.stringify(s),antes);
});
test('biblioteca com modelos de mesmo ID exclui somente a entrada selecionada',async()=>{
 let s=novo(),f=await ficha('soldado');s=await aplicar(s,{tipo:'salvarGrupoFichas',nome:'Duplicatas',fichas:[{...f,nome:'Soldado antigo'},{...f,nome:'Soldado novo'}],rev:s.rev},gm);
 const g=s.gruposFichas[0];s=await aplicar(s,{tipo:'excluirFichaGrupo',grupoId:g.id,indice:0,fichaId:g.fichas[0].id,confirmado:true,rev:s.rev},gm);
 assert.deepEqual(s.gruposFichas[0].fichas.map(f=>f.nome),['Soldado novo']);s=await aplicar(s,{tipo:'adicionarGrupo',grupoId:g.id,rev:s.rev},gm);assert.equal(s.atores[0].nome,'Soldado novo');
});
