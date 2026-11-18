import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {hitboxToken,centroAlvo,distanciaAoAlvo,dentroDaArea} from './site/target-geometry.mjs';
import {novo,adicionar,aplicar,avaliarFormula,oportunidades,opcoesDisponiveis,validar} from './site/engine.mjs';
import {pontoNaZona,primeiroContato,entradasNaTrajetoria,terrenoDificilDasZonas} from './site/zonas.mjs';
import {validarDependenciasExecucao} from './site/executions.mjs';
const alvo=(x,y,r=.75)=>({x,y,hitbox:{raioM:r}}),origem={x:0,y:0};
test('hitbox física acompanha dimensões, grid, escala, espelhamento e pivô rotacionado',()=>{
 const t={image:{width:200,height:100},grid:{dpi:100,offset:{x:50,y:50}},scale:{x:-2,y:3},rotation:90};
 const h=hitboxToken(t);assert.equal(h.raioM,2.25);assert.ok(Math.abs(h.offsetX)<1e-8);assert.equal(h.offsetY,-1.5);
 assert.equal(centroAlvo({...alvo(8,4),hitbox:h}).y,2.5);
 assert.equal(hitboxToken({}),undefined);assert.equal(hitboxToken({...t,grid:{dpi:0}}),undefined);
 assert.equal(distanciaAoAlvo(origem,{x:2.25,y:0}),2.25,'sem token não inventa tamanho');
});
test('alcance toca borda, respeita diagonal e não acrescenta raio do atacante',()=>{
 assert.equal(distanciaAoAlvo({...origem,hitbox:{raioM:10}},alvo(2.25,0)),1.5);
 assert.ok(distanciaAoAlvo(origem,alvo(2.251,0))>1.5);
 assert.ok(Math.abs(distanciaAoAlvo(origem,alvo(1.35,1.8))-1.5)<1e-8);
 assert.equal(distanciaAoAlvo(origem,alvo(.1,0)),0);
});
test('círculo e quadrado atingem tangência sem aceitar o canto de uma caixa ampliada',()=>{
 const c={raioM:1.5},q={area:{forma:'quadrado',tamanhoM:3}};
 assert.equal(dentroDaArea(origem,origem,alvo(2.25,0),c),true);
 assert.equal(dentroDaArea(origem,origem,alvo(2.26,0),c),false);
 assert.equal(dentroDaArea(origem,origem,alvo(2.1,2.1),q),false);
 assert.equal(dentroDaArea(origem,origem,alvo(1.95,2.1),q),true);
});
test('cone preserva o triângulo do Sopro e intersecta lateral, base e vértice',()=>{
 const r={area:{forma:'cone',comprimentoM:4.5,larguraM:4.5}},p={x:4.5,y:0};
 for(const a of [alvo(2,1.7),alvo(5.25,0),alvo(-.75,0),alvo(4.95,2.7)])assert.equal(dentroDaArea(origem,p,a,r),true,JSON.stringify(a));
 for(const a of [alvo(2,1.9),alvo(5.251,0),alvo(5.1,2.85)])assert.equal(dentroDaArea(origem,p,a,r),false,JSON.stringify(a));
 assert.equal(dentroDaArea(origem,origem,alvo(0,0),r),false,'vetor nulo não cria cone');
 assert.equal(dentroDaArea(origem,p,{x:2,y:1.01},r),false,'sem raio mantém regra do centro');
});
test('linha rotacionada usa bordas e cantos arredondados, inclusive além da extremidade',()=>{
 const r={area:{forma:'linha',comprimentoM:6,larguraM:1.5}},p={x:0,y:1};
 assert.equal(dentroDaArea(origem,p,alvo(1.5,3),r),true);
 assert.equal(dentroDaArea(origem,p,alvo(0,6.75),r),true);
 assert.equal(dentroDaArea(origem,p,alvo(1.4,6.65),r),false);
});
const gm={id:'gm',role:'GM'};
async function mesa(){const s=novo(),f=JSON.parse(await readFile(new URL('./site/fichas/soldado.json',import.meta.url)));const a=adicionar(s,f),b=adicionar(s,f),c=adicionar(s,f);Object.assign(a,origem);Object.assign(b,alvo(2.25,0));Object.assign(c,alvo(2.251,0));return {s,a,b,c};}
const dados=async f=>Array.isArray(f)?{resultados:f.map(x=>avaliarFormula(x,()=>12))}:avaliarFormula(f,()=>12);
const executar=(s,a,o,c={})=>aplicar(s,{tipo:'usar',ator:a.id,opcao:o,rev:s.rev,confirmado:true,...c},gm,dados);
test('motor aplica habilidade direta e rejeita fora sem gastar; cliente não amplia alcance por comando',async()=>{
 const {s,a,b,c}=await mesa();a.ficha.opcoes.push({id:'teste-hitbox',nome:'Teste',custo:[],automacao:{tipo:'cura',alcanceM:1.5,valor:1}});b.pv--;c.pv--;
 const out=await executar(s,a,'teste-hitbox',{alvo:b.id});assert.equal(out.atores[1].pv,b.pv+1);
 await assert.rejects(executar(s,a,'teste-hitbox',{alvo:c.id,hitbox:{raioM:99}}),/alcance/);
 assert.equal(s.rev,0);assert.equal(c.pv,s.atores[2].pv);
});
test('motor de área inclui só discos em contato e preserva alcance do ponto no chão',async()=>{
 const {s,a,b,c}=await mesa();a.ficha.opcoes.push({id:'teste-area',nome:'Área',custo:[],automacao:{tipo:'salva',alcanceM:1.5,raioM:1.5,atributo:'des',cd:40,dano:'1',elemento:'acido',excluirConjurador:true}});
 const out=await executar(s,a,'teste-area',{ponto:origem});assert.equal(out.atores[1].pv,b.pv-1);assert.equal(out.atores[2].pv,c.pv);
 await assert.rejects(executar(s,a,'teste-area',{ponto:{x:1.501,y:0},hitbox:{raioM:99}}),/alcance/);
});
test('tokens redimensionados durante uma jogada invalidam resultado pendente',async()=>{
 const {s,a,b}=await mesa(),hoje=structuredClone(s);hoje.atores[1].hitbox.raioM=1.5;
 assert.throws(()=>validarDependenciasExecucao({comando:{tipo:'usar'},recursos:['ator:'+a.id,'ator:'+b.id]},s,hoje),/hitbox/);
});
test('zona persistente detecta contato da borda, entrada e travessia sem mudar custo de terreno',()=>{
 const z={id:'zona',centro:origem,geometria:{forma:'quadrado',tamanhoM:3},terrenoDificil:true},a=alvo(-4,2),b={x:4,y:2};
 assert.equal(pontoNaZona(z,alvo(0,2.25)),true);
 assert.equal(pontoNaZona(z,alvo(0,2.251)),false);
 assert.equal(entradasNaTrajetoria([z],a,b,a).length,1);
 const c=primeiroContato([z],a,b,a);assert.ok(c&&c.ponto.x<-1.5&&c.ponto.x>-2.25);
 assert.equal(terrenoDificilDasZonas([z],a,b,a),0);
 assert.deepEqual(entradasNaTrajetoria([z],alvo(0,2),b,a),[],'já tocava a área: não duplica entrada');
});
test('oportunidade só dispara quando a hitbox deixa inteiramente o alcance',async()=>{
 const {s,a,b}=await mesa();s.atores=[a,b];s.fase='turnos';a.ficha.lado='inimigo';b.ficha.lado='jogador';a.ficha.opcoes.push({id:'reacao-teste',nome:'Reação',gatilho:'sair_alcance',custo:[{tipo:'reacao',quantidade:1}],automacao:{tipo:'ataque',alcanceM:1.5,bonus:0,dano:'1',elemento:'contundente'}});
 assert.equal(oportunidades(s,b,{x:2.25,y:0}).length,0);
 const ameaças=oportunidades(s,b,{x:3,y:0});assert.equal(ameaças.length,1);assert.equal(ameaças[0].ponto.x,2.25);
 s.pvp=true;assert.ok(oportunidades(s,{...a},{x:4,y:0}).every(x=>x.reator!==a.id),'prévia usa cópia do ator sem provocar reação contra si');
});
test('composição real da Loteria valida cada golpe pela borda da hitbox',async()=>{
 const {s,b,c}=await mesa(),a=adicionar(s,JSON.parse(await readFile(new URL('./site/fichas/loteria.json',import.meta.url))));
 Object.assign(a,origem);s.fase='turnos';s.rodada=1;s.vez=0;s.ordem=[a.id,b.id,c.id];
 const o=opcoesDisponiveis(a).find(o=>o.composicao?.custosPorModo);
 const out=await executar(s,a,o.id,{composicao:[{modoId:'soco-bonus',alvoId:b.id},{modoId:'soco-acao',alvoId:b.id}]});
 assert.ok(out.atores.find(x=>x.id===b.id).pv<b.pv);
 await assert.rejects(executar(s,a,o.id,{composicao:[{modoId:'soco-bonus',alvoId:b.id},{modoId:'soco-acao',alvoId:c.id}]}),/alcance/);
});
test('lista de alvos aplica cura na borda e rejeita um integrante fora dela',async()=>{
 const {s,a,b,c}=await mesa();a.ficha.opcoes.push({id:'teste-lista',nome:'Lista',custo:[],selecao:{tipo:'alvos',min:1,max:2,repetirAlvo:false},automacao:{tipo:'cura',alcanceM:1.5,valor:1}});a.ficha=validar(a.ficha);b.pv--;c.pv--;
 const out=await executar(s,a,'teste-lista',{alvos:[b.id]});assert.equal(out.atores[1].pv,b.pv+1);
 await assert.rejects(executar(s,a,'teste-lista',{alvos:[b.id,c.id]}),/alcance/);
});
test('Animar Mortos real aceita a hitbox do corpo na borda e preserva sobreposição',async()=>{
 const {s,b}=await mesa(),a=adicionar(s,JSON.parse(await readFile(new URL('./conteudo/aventura-no-cemiterio/drow-necromante-6.json',import.meta.url))));
 Object.assign(a,origem);Object.assign(b,alvo(3.75,0));b.pv=-1;b.estadoVida='morto';
 const out=await executar(s,a,'animar-mortos',{alvo:b.id});assert.ok(out.atores[1].sobreposicaoFicha);assert.equal(out.atores[1].sobreposicaoFicha.estadoOriginal.pv,-1);
 b.x=3.751;await assert.rejects(executar(s,a,'animar-mortos',{alvo:b.id}),/alcance/);
});
