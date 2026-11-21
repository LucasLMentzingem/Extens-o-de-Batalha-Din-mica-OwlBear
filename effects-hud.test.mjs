import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {caixaEfeitos} from './site/effect-layout.mjs';
import {listarEfeitosHud,temaEfeito,resumoEfeito} from './site/effect-state.mjs';
import {visualEfeito,renderizarEfeitosHud} from './site/effect-art.mjs';
import {artesEfeitos,temasEfeitos} from './site/catalogos/artes-efeitos.mjs';
import {condicoesCombate} from './site/engine.mjs';
test('B: dez efeitos cabem entre Extras e ferramentas centrais nas telas de referência',()=>{
 for(const largura of [1366,1600,1920,2560]){
  const b=caixaEfeitos({largura,altura:945,quantidade:25});assert.equal(b.acima,false);assert.equal(b.capacidade,10);
  assert.ok(b.x>=64+8);assert.ok(b.x+b.width<=(largura-420)/2-16);assert.ok(b.icone*10+9*b.gap+4<=b.width);
  assert.ok(b.y+b.height<=945-8);assert.ok(b.reservaInferior>=945-b.y+8);
 }
});
test('B: telas estreitas mantêm uma linha acima das ferramentas, sem cobrir Extras',()=>{
 for(const largura of [390,620,900,1024]){const b=caixaEfeitos({largura,altura:800,quantidade:15});assert.equal(b.acima,true);assert.ok(b.x+b.width<=largura-16);assert.ok(b.y+b.height<=800-64);assert.ok(b.icone*10+9*b.gap+4<=b.width);}
});
test('B: sem efeitos não há janela; a caixa de um efeito não captura dez espaços vazios',()=>{
 assert.equal(caixaEfeitos({largura:1920,altura:945,quantidade:0}),null);
 const um=caixaEfeitos({largura:1920,altura:945,quantidade:1}),dez=caixaEfeitos({largura:1920,altura:945,quantidade:10}),onze=caixaEfeitos({largura:1920,altura:945,quantidade:11});
 assert.equal(um.width,um.icone+4);assert.ok(um.width<dez.width);assert.deepEqual(onze,dez);
});
test('B: deriva concentração, Bênção, desengajar, PV temporários e vida sem mudar o estado',()=>{
 const a={id:'a',ficha:{tipo:'pj'},efeitosAtivos:[{id:'x',nome:'Armadura Arcana',tipo:'buff'}],concentracaoAtiva:{id:'c',nome:'Luz',opcao:'luz'},desengajado:true,pvTemporarios:8,estadoVida:'inconsciente'},origem={id:'padre',bencao:{alvos:['a'],turnos:10},ficha:{opcoes:[{id:'bencao',automacao:{tipo:'bencao'}}]}};
 const antes=JSON.stringify([a,origem]),lista=listarEfeitosHud(a,[a,origem]);assert.equal(lista.length,6);assert.equal(new Set(lista.map(e=>e.hudId)).size,6);assert.ok(lista.some(e=>e.nome==='Bênção'&&e.origemAtorId==='padre'));assert.equal(JSON.stringify([a,origem]),antes);
 assert.equal(listarEfeitosHud({id:'b',ficha:{}},[origem]).length,0);
});
test('B: não duplica Inconsciente e distingue Estável de Morto',()=>{
 const a={id:'a',efeitosAtivos:[{id:'i',nome:'Inconsciente',condicao:'inconsciente'}],estadoVida:'inconsciente'};assert.equal(listarEfeitosHud(a).length,1);
 assert.equal(listarEfeitosHud({id:'a',estadoVida:'estavel'})[0].nome,'Estável');assert.equal(listarEfeitosHud({id:'a',estadoVida:'morto'})[0].nome,'Morto');
});
test('B: temas seguem o efeito real, inclusive Invisível benéfico e expulsão prejudicial',()=>{
 for(const [e,t] of [[{tipo:'concentracao'},'concentracao'],[{tipo:'condicao',condicao:'invisivel'},'buff'],[{tipo:'buff',expulsao:true,condicao:'amedrontado'},'condicao'],[{tipo:'buff',preceRecebida:true},'neutro'],[{tipo:'buff',restricoes:{desvantagemD20:['for']}},'debuff'],[{modificadores:{deslocamentoM:-3}},'debuff'],[{modificadores:{ca:2}},'buff'],[{maldicao:true},'debuff'],[{nome:'marcador livre'},'neutro']])assert.equal(temaEfeito(e),t);
});
test('B: arte da habilidade de origem vence o nome genérico da condição',()=>{
 const origem={id:'mago',ficha:{opcoes:[{id:'spell',nome:'Toque Chocante',visual:{arquivo:'assets/habilidades/habilidade-toque-chocante.png'}}]}};
 const v=visualEfeito({id:'spell-acerto',origemAtorId:'mago',nome:'Sem reações'}, {id:'alvo',ficha:{}},[origem]);assert.equal(v.fonte,'habilidade de origem');assert.match(v.arquivo,/toque-chocante/);
});
test('B: efeitos de maestria reconhecem o ícone do item sem recalcular/mutar ataques',()=>{
 const origem={id:'a',ficha:{opcoes:[],inventario:{itens:[{id:'arco-1',icone:'assets/itens/item-arco-longo.webp'}]}}},antes=JSON.stringify(origem);
 const v=visualEfeito({id:'item-arco-1-distancia-acerto',origemAtorId:'a',nome:'Lentidão'},origem,[origem]);assert.equal(v.arquivo,'assets/itens/item-arco-longo.webp');assert.equal(JSON.stringify(origem),antes);
});
test('B: todos os 14 nomes de condição têm arte e Invisível usa a moldura benéfica',()=>{
 for(const [condicao,{nome}] of Object.entries(condicoesCombate)){const v=visualEfeito({nome,condicao,tipo:'condicao'});assert.ok(v.arquivo,condicao);assert.ok(v.fundo&&v.moldura,condicao);if(condicao==='invisivel')assert.equal(v.tema,'buff');}
});
test('B: aliases de protótipos usam arte própria; gelo e maestria têm símbolos distintos',()=>{
 for(const [nome,id] of [['Raio do Enfraquecimento','enfraquecimento'],['Proteção contra o Bem e o Mal','protecao-bem-mal'],['Prece de Cura','prece-recebida'],['Escudo Arcano','escudo-arcano'],['Toque Arrepiante · cura bloqueada','cura-bloqueada']])assert.equal(visualEfeito({nome,tipo:'buff'}).arquivo,artesEfeitos[id]);
 assert.notEqual(visualEfeito({nome:'Lentidão'}).arquivo,visualEfeito({nome:'Raio de Gelo · lentidão'}).arquivo);
});
test('B: texto livre é escapado e os saldos privados de NPC não entram no chip nem na dica',()=>{
 const a={id:'a',ficha:{tipo:'npc'},pvTemporarios:987,efeitosAtivos:[{id:'x',nome:'<script>alert(1)</script>',descricao:'" onfocus="x',tipo:'buff',duracao:{restante:3}}]};
 const html=renderizarEfeitosHud(a,[],{nomes:false,revelarValores:false});assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('987'));assert.ok(html.includes('data-nomes="false"'));assert.ok(html.includes('efeito-tempo">3'));
 assert.ok(!resumoEfeito({nome:'PV temporários',hudSaldo:987},{revelarValores:false}).includes('987'));
});
test('B: todos os assets novos estão publicados e as camadas não copiam imagens para fichas',async()=>{
 assert.equal(Object.keys(artesEfeitos).length,25);assert.equal(Object.keys(temasEfeitos).length,5);
 let total=0;for(const file of [...Object.values(artesEfeitos),...Object.values(temasEfeitos).flatMap(t=>[t.fundo,t.moldura])]){assert.ok(!file.includes('PENDENTE'),file);assert.match(file,/^assets\/efeitos\//);const bytes=await fs.readFile('site/'+file);total+=bytes.length;if(file.endsWith('.webp')){assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');}}
 assert.ok(total<350000,'pacote de ícones e temas deve permanecer leve');
});
