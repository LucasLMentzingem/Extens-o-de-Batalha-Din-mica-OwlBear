import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {novo,adicionar,aplicar,avaliarFormula,validar,cancelarMovimentoDinamico} from './site/engine.mjs';
import {pontoMaisProximo,planejarMovimentoDinamico,custoTrajeto} from './site/dynamic-movement.mjs';
import {novoRegistroExecucoes,admitirExecucao,iniciarExecucao,avancarExecucao,checkpointDinamico,podeIniciarExecucao} from './site/executions.mjs';
const gm={id:'gm',role:'GM'},fixo=face=>async f=>Array.isArray(f)?{resultados:f.map(x=>avaliarFormula(x,n=>n===20?face:4))}:avaliarFormula(f,n=>n===20?face:4);
async function mesa({ameacas=0}={}){
 const s=novo(),f=JSON.parse(await readFile(new URL('./site/fichas/soldado.json',import.meta.url))),a=adicionar(s,f),b=adicionar(s,f);
 s.fase='turnos';s.rodada=1;s.vez=0;s.ordem=[a.id,b.id];Object.assign(a,{x:0,y:0,metros:9,hitbox:{raioM:.75}});Object.assign(b,{x:6,y:0,hitbox:{raioM:.75}});
 a.ficha.lado='jogador';b.ficha.lado='inimigo';a.ficha.recursos.push({id:'carga-teste',nome:'Carga',maximo:3,saldoInicial:3});a.rec['carga-teste']=3;
 a.ficha.opcoes.push({id:'habilidade-teste',nome:'Habilidade',categoria:'acao',custo:[{tipo:'acao',quantidade:1},{tipo:'recurso',id:'carga-teste',quantidade:1}],automacao:{tipo:'ataque',bonus:30,alcanceM:1.5,dano:'1d4',elemento:'contundente',tags:['corpo_a_corpo','arma']}});a.ficha=validar(a.ficha);
 const reatores=[];for(let i=0;i<ameacas;i++){const r=adicionar(s,f);Object.assign(r,{x:i,y:1,hitbox:{raioM:.75}});r.ficha.lado='inimigo';reatores.push(r);}
 return {s,a,b,reatores};
}
const iniciar=(s,a,c={})=>aplicar(s,{tipo:'usar',ator:a.id,opcao:'habilidade-teste',alvo:s.atores[1].id,rev:s.rev,confirmado:true,movimentoDinamico:true,movimentoDinamicoId:'din',atividadeId:'atividade',...c},gm,fixo(12));
const continuar=(s,a,rolar=fixo(12))=>aplicar(s,{tipo:'continuarDinamico',ator:a.id,rev:s.rev,confirmado:true,movimentoDinamicoId:'din'},gm,rolar);
const reagir=(s,opcao,face=1)=>aplicar(s,{tipo:'resolverReacao',ator:s.reacaoPendente.reator,rev:s.rev,confirmado:true,opcao},gm,fixo(face));
test('destino mínimo atende a todos os discos, inclusive interseção e seleção impossível',()=>{
 assert.deepEqual(pontoMaisProximo({x:0,y:0},[{x:6,y:0,raio:2.25}]),{x:3.75,y:0});
 const p=pontoMaisProximo({x:0,y:0},[{x:6,y:1,raio:2},{x:6,y:-1,raio:2}]);assert.ok(Math.abs(p.x-(6-Math.sqrt(3)))<1e-8);assert.ok(Math.abs(p.y)<1e-8);
 assert.equal(pontoMaisProximo({x:0,y:0},[{x:6,y:4,raio:2},{x:6,y:-4,raio:2}]),null);
});
test('andar é checkpoint: movimento debitado antes, habilidade gasta uma vez na continuação',async()=>{
 const {s,a,b}=await mesa();let n=await iniciar(s,a);assert.equal(n.atores[0].x,3.75);assert.equal(n.atores[0].metros,5.25);assert.equal(n.atores[0].acao,1);assert.equal(n.atores[0].rec['carga-teste'],3);assert.equal(n.atores[1].pv,b.pv);
 n=await continuar(n,a);assert.equal(n.atores[0].acao,0);assert.equal(n.atores[0].rec['carga-teste'],2);assert.ok(n.atores[1].pv<b.pv);assert.equal(n.acaoDinamica.fase,'concluida');
 const r=await continuar(n,a);assert.equal(r.atores[0].rec['carga-teste'],2);assert.equal(r.atores[1].pv,n.atores[1].pv);
});
test('deslocamento ou recurso insuficiente não move nem gasta nada; já no alcance não anda',async()=>{
 const {s,a}=await mesa();a.metros=1;await assert.rejects(iniciar(s,a),/Deslocamento insuficiente/);assert.equal(a.x,0);a.metros=9;a.rec['carga-teste']=0;
 await assert.rejects(iniciar(s,a),/Saldo insuficiente/);assert.equal(a.metros,9);
 a.rec['carga-teste']=3;s.atores[1].x=2;const n=await iniciar(s,a);assert.equal(n.atores[0].x,0);assert.equal(n.atores[0].metros,9);assert.equal(n.atores[0].rec['carga-teste'],2);
});
test('acerto de oportunidade cancela habilidade e cobra somente percurso até o contato',async()=>{
 const {s,a,b}=await mesa({ameacas:1});let n=await iniciar(s,a);assert.ok(n.reacaoPendente);assert.equal(n.atores[0].x,0);
 const r=n.atores.find(x=>x.id===n.reacaoPendente.reator),op=r.ficha.opcoes.find(x=>x.gatilho==='sair_alcance');n=await reagir(n,op.id,20);
 assert.equal(n.acaoDinamica.fase,'cancelada');const x=n.atores[0].x;assert.ok(x>0&&x<3.75);assert.ok(Math.abs(n.atores[0].metros-(9-x))<1e-8);assert.equal(n.atores[0].acao,1);assert.equal(n.atores[0].rec['carga-teste'],3);assert.equal(n.atores[1].pv,b.pv);assert.equal(n.atores.find(x=>x.id===r.id).reacao,0);
 n=await continuar(n,a);assert.equal(n.atores[0].x,x);assert.equal(n.atores[0].rec['carga-teste'],3);
});
test('oportunidades em ordem: recusa/erro continuam; habilidade espera a última reação',async()=>{
 const {s,a,b}=await mesa({ameacas:2});let n=await iniciar(s,a);const primeiro=n.reacaoPendente.reator;n=await reagir(n,null);assert.ok(n.reacaoPendente);assert.notEqual(n.reacaoPendente.reator,primeiro);assert.equal(n.atores[0].rec['carga-teste'],3);
 const r=n.atores.find(x=>x.id===n.reacaoPendente.reator);n=await reagir(n,r.ficha.opcoes.find(x=>x.gatilho==='sair_alcance').id,1);assert.equal(n.reacaoPendente,undefined);assert.equal(n.atores[0].x,3.75);assert.equal(n.atores[1].pv,b.pv);
 n=await continuar(n,a);assert.equal(n.atores[0].rec['carga-teste'],2);
});
test('zona prejudicial no trajeto reto é resolvida na entrada e pode impedir continuação',async()=>{
 const {s,a}=await mesa();s.zonas=[{id:'armadilha',nome:'Raízes',centro:{x:2.5,y:0},geometria:{forma:'quadrado',tamanhoM:1},gatilhos:[{evento:'entrada',efeito:{nome:'Preso',tipo:'condicao',condicao:'agarrado'}}]}];
 let n=await iniciar(s,a);assert.equal(n.atores[0].x,1.25);assert.ok(n.atores[0].efeitosAtivos.some(e=>e.condicao==='agarrado'));n=await continuar(n,a);assert.equal(n.acaoDinamica.fase,'cancelada');assert.equal(n.atores[0].acao,1);assert.equal(n.atores[0].rec['carga-teste'],3);
});
test('zona de dano não cria desvio, não repete entrada e caminho completo cobra terreno exato',async()=>{
 const {s,a}=await mesa();s.zonas=[{id:'fogo',nome:'Fogo',centro:{x:2.5,y:0},geometria:{forma:'quadrado',tamanhoM:1},terrenoDificil:true,gatilhos:[{evento:'entrada',dano:'1d4',elemento:'fogo'}]}];
 const previsto=custoTrajeto(s,a,{x:3.75,y:0});let n=await iniciar(s,a);const pv=n.atores[0].pv;assert.ok(pv<a.pv);n=await continuar(n,a);assert.equal(n.atores[0].x,3.75);assert.equal(n.atores[0].y,0);assert.equal(n.atores[0].pv,pv);assert.equal(n.atores[0].metros,9-previsto);n=await continuar(n,a);assert.equal(n.acaoDinamica.fase,'concluida');
});
test('se alvo sair do alcance após andar, cancela habilidade mantendo o movimento gasto',async()=>{
 const {s,a}=await mesa();let n=await iniciar(s,a);n.atores[1].x=20;n=await continuar(n,a);assert.equal(n.acaoDinamica.fase,'cancelada');assert.equal(n.atores[0].metros,5.25);assert.equal(n.atores[0].rec['carga-teste'],3);
});
test('checkpoint recuperado permite reação filha sem liberar comandos concorrentes',async()=>{
 const {s,a}=await mesa({ameacas:1}),registro=novoRegistroExecucoes(),c={tipo:'usar',ator:a.id,opcao:'habilidade-teste',alvo:s.atores[1].id,rev:s.rev,confirmado:true,movimentoDinamico:true,atividadeId:'atividade'},e=admitirExecucao(registro,c,gm,'din',s);
 assert.equal(iniciarExecucao(registro,e,s),true);const passo=await avancarExecucao(registro,e);assert.ok(passo.next.movimentoPendente);checkpointDinamico(registro,e,passo.next);
 const recuperado=JSON.parse(JSON.stringify(registro)),pai=recuperado.lista[0];assert.equal(iniciarExecucao(recuperado,pai,passo.next),false);
 const filha=admitirExecucao(recuperado,{tipo:'resolverReacao',ator:passo.next.reacaoPendente.reator,rev:passo.next.rev},gm,'filha',passo.next);assert.equal(podeIniciarExecucao(recuperado,filha),true);
 const outra=admitirExecucao(recuperado,{tipo:'teste',ator:a.id},gm,'outra',passo.next);assert.equal(podeIniciarExecucao(recuperado,outra),false);
 const cancelada=cancelarMovimentoDinamico(passo.next,'din');assert.equal(cancelada.movimentoPendente,undefined);assert.equal(cancelada.atores[0].metros,9);assert.equal(cancelada.acaoDinamica.fase,'cancelada');
 const aposContato=structuredClone(passo.next);delete aposContato.movimentoPendente;aposContato.acaoDinamica.fase='cancelada';
 const extra=admitirExecucao(recuperado,{tipo:'resolverReacao',ator:a.id,rev:aposContato.rev},gm,'reacao-ao-dano',aposContato);assert.equal(extra.paiDinamico,'din');
});
test('área no chão mantém o ponto escolhido e aproxima somente o alcance necessário',async()=>{
 const {s,a}=await mesa();const o={id:'area-teste',nome:'Área',categoria:'acao',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'salva',atributo:'des',cd:40,alcanceM:3,raioM:1,dano:'1d4',elemento:'acido'}};a.ficha.opcoes.push(o);a.ficha=validar(a.ficha);
 const plano=planejarMovimentoDinamico(s,a,{tipo:'usar',ponto:{x:6,y:0}},o);assert.equal(plano.destino.x,3);
 let n=await iniciar(s,a,{opcao:o.id,alvo:undefined,ponto:{x:6,y:0}});assert.equal(n.atores[0].x,3);assert.deepEqual(n.acaoDinamica.comando.ponto,{x:6,y:0});n=await continuar(n,a);assert.equal(n.atores[0].acao,0);assert.ok(n.atores[1].pv<s.atores[1].pv);
});
test('composição real da Loteria aproxima uma vez e executa os golpes do mesmo lugar',async()=>{
 const {s,a,b}=await mesa();const monge=adicionar(s,JSON.parse(await readFile(new URL('./site/fichas/loteria.json',import.meta.url))));Object.assign(monge,{x:0,y:0,metros:9});s.atores=s.atores.filter(x=>x.id!==a.id);s.ordem=[monge.id,b.id];
 const {opcoesDisponiveis}=await import('./site/engine.mjs'),o=opcoesDisponiveis(monge).find(x=>x.composicao?.custosPorModo);
 let n=await iniciar(s,monge,{opcao:o.id,alvo:undefined,composicao:[{modoId:'soco-bonus',alvoId:b.id},{modoId:'soco-acao',alvoId:b.id}]});assert.equal(n.atores.find(x=>x.id===monge.id).x,3.75);n=await continuar(n,monge);assert.equal(n.acaoDinamica.fase,'concluida');assert.equal(n.atores.find(x=>x.id===monge.id).metros,5.25);assert.ok(n.atores.find(x=>x.id===b.id).pv<b.pv);
});
test('cancelar após trecho com dano preserva PV e deslocamento gastos, sem cobrar a habilidade',async()=>{
 const {s,a}=await mesa();s.zonas=[{id:'fogo',nome:'Fogo',centro:{x:2.5,y:0},geometria:{forma:'quadrado',tamanhoM:1},gatilhos:[{evento:'entrada',dano:'1d4',elemento:'fogo'}]}];
 const n=await iniciar(s,a),c=cancelarMovimentoDinamico(n,'din');assert.equal(c.atores[0].x,1.25);assert.equal(c.atores[0].metros,7.75);assert.equal(c.atores[0].pv,n.atores[0].pv);assert.equal(c.atores[0].acao,1);assert.equal(c.atores[0].rec['carga-teste'],3);
});
