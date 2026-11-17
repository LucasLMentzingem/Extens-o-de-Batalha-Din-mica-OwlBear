import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {novo,adicionar,aplicar,opcoesDisponiveis,validar} from './site/engine.mjs';
import {compactarEstado,compactarFicha} from './site/catalog.mjs';
import {livroHabilidades} from './site/ficha-view.mjs';

const gm={id:'gm',role:'GM'},player={id:'p',role:'PLAYER'};
const meta=a=>opcoesDisponiveis(a).find(o=>o.gatilho==='rolar_iniciativa');
const roll=async(formula,info)=>info.tipo==='iniciativa_lote'?{resultados:formula.map((f,i)=>({total:18-i,formula:f}))}:{total:info.tipo==='cura'?7:18,formula};
async function mesa({pv=10,foco=1,uso=1}={}){
 const s=novo(),a=adicionar(s,JSON.parse(await fs.readFile('site/fichas/loteria.json','utf8'))),b=adicionar(s,JSON.parse(await fs.readFile('site/fichas/soldado.json','utf8')));
 a.dono=player.id;a.pv=pv;a.rec['pontos-de-foco']=foco;a.rec['metabolismo-incomum']=uso;
 return {s,a,b};
}
const enviar=(s,c,u=gm,r=roll)=>aplicar(s,{rev:s.rev,confirmado:true,...c},u,r);
async function iniciativa(config){const {s,a,b}=await mesa(config);let next=await enviar(s,{tipo:'iniciar'});next=await enviar(next,{tipo:'iniciativa',ator:a.id},player);return {s:next,a:next.atores[0],b:next.atores[1]};}

test('Metabolismo: escolha exclusiva da iniciativa, sem relógio, recupera Foco e cura sem gastar ações',async()=>{
 const {s,a}=await iniciativa();const p=a.reacaoIniciativa;
 assert.ok(p);assert.equal(p.terminaEm,undefined);assert.equal(meta(a).categoria,'reacao');
 assert.ok(livroHabilidades(a,'reacoes').includes('Metabolismo Incomum'));
 const pedidos=[];const next=await enviar(s,{tipo:'responderIniciativa',ator:a.id,pendenciaId:p.id,opcao:meta(a).id},player,async(f,m)=>{pedidos.push({f,m});return {total:7};});const n=next.atores[0];
 assert.equal(n.pv,17);assert.equal(n.rec['pontos-de-foco'],3);assert.equal(n.rec['metabolismo-incomum'],0);
 assert.deepEqual([n.acao,n.bonus,n.reacao],[a.acao,a.bonus,a.reacao]);assert.equal(n.reacaoIniciativa,undefined);
 assert.equal(pedidos[0].f,'1d6+3');assert.equal(pedidos[0].m.destinoId,'p');assert.equal(pedidos[0].m.tipo,'cura');
 await assert.rejects(()=>enviar(next,{tipo:'responderIniciativa',ator:a.id,pendenciaId:p.id,opcao:meta(a).id},player),/não está mais disponível/);
});

test('Metabolismo: só oferece se houver benefício e uso disponível; basta faltar PV ou Foco',async()=>{
 for(const [config,oferece] of [[{pv:21,foco:3},false],[{pv:21,foco:2},true],[{pv:20,foco:3},true],[{pv:20,foco:2,uso:0},false]]){
  const {a}=await iniciativa(config);assert.equal(Boolean(a.reacaoIniciativa),oferece,JSON.stringify(config));
 }
 const {s,a}=await iniciativa({pv:20,foco:3});const n=(await enviar(s,{tipo:'responderIniciativa',ator:a.id,pendenciaId:a.reacaoIniciativa.id,opcao:meta(a).id},player)).atores[0];assert.equal(n.pv,21,'cura respeita PV máximos');
});

test('Metabolismo: recusar mantém o uso, não permite guardá-lo para a barra e não deixa agir com escolha pendente',async()=>{
 let {s,a,b}=await iniciativa();s=await enviar(s,{tipo:'iniciativa',ator:b.id});a=s.atores[0];
 for(const c of [{tipo:'usar',opcao:meta(a).id},{tipo:'passar'},{tipo:'mover',x:1,y:1}])await assert.rejects(()=>enviar(s,{...c,ator:a.id},player),/Resolva a escolha de Iniciativa/);
 const before=JSON.stringify(s);await assert.rejects(()=>enviar(s,{tipo:'responderIniciativa',ator:a.id,pendenciaId:'antiga',opcao:meta(a).id},player),/não está mais disponível/);assert.equal(JSON.stringify(s),before);
 s=await enviar(s,{tipo:'responderIniciativa',ator:a.id,pendenciaId:a.reacaoIniciativa.id},player);assert.equal(s.atores[0].rec['metabolismo-incomum'],1);
 await assert.rejects(()=>enviar(s,{tipo:'usar',ator:a.id,opcao:meta(a).id},player),/somente na janela de Iniciativa/);
 s=await enviar(s,{tipo:'encerrar'});await assert.rejects(()=>enviar(s,{tipo:'usar',ator:a.id,opcao:meta(a).id},player),/somente na janela de Iniciativa/);
});

test('Metabolismo: lote do mestre mantém escolhas por ficha, autorização e estado ao reabrir',async()=>{
 const {s,a,b}=await mesa();let next=await enviar(s,{tipo:'iniciar'});next=await enviar(next,{tipo:'iniciativas',atores:[a.id,b.id]});
 assert.equal(next.fase,'iniciativa');assert.ok(next.atores[0].reacaoIniciativa);assert.equal(next.atores[1].reacaoIniciativa,undefined);
 const salvo=compactarEstado(next);salvo.atores.forEach(a=>a.ficha=validar(a.ficha));const p=salvo.atores[0].reacaoIniciativa;
 await assert.rejects(()=>enviar(salvo,{tipo:'responderIniciativa',ator:a.id,pendenciaId:p.id,opcao:meta(salvo.atores[0]).id},{id:'outro',role:'PLAYER'}),/controle|controla|permiss|vinculada/i);
 const n=await enviar(salvo,{tipo:'responderIniciativa',ator:a.id,pendenciaId:p.id,opcao:meta(salvo.atores[0]).id});assert.equal(n.atores[0].rec['metabolismo-incomum'],0);assert.equal(n.fase,'turnos');
 const encerrado=await enviar(next,{tipo:'encerrar'});assert.equal(encerrado.atores[0].reacaoIniciativa,undefined);
});

test('Metabolismo: reforço em combate também recebe escolha e falha na cura não consome nada',async()=>{
 const {s,a,b}=await mesa();a.emCombate=false;const c=adicionar(s,JSON.parse(await fs.readFile('site/fichas/soldado.json','utf8')));
 let next=await enviar(s,{tipo:'iniciar'});next=await enviar(next,{tipo:'iniciativas',atores:[b.id,c.id]});next=await enviar(next,{tipo:'alternarCombate',ator:a.id});
 const n=next.atores[0];assert.ok(n.reacaoIniciativa);const antes=JSON.stringify(next);
 await assert.rejects(()=>enviar(next,{tipo:'responderIniciativa',ator:a.id,pendenciaId:n.reacaoIniciativa.id,opcao:meta(n).id},player,async()=>{throw Error('rolagem cancelada');}),/rolagem cancelada/);assert.equal(JSON.stringify(next),antes);
 next=await enviar(next,{tipo:'alternarCombate',ator:a.id});assert.equal(next.atores[0].reacaoIniciativa,undefined);
});

test('Pico de Adrenalina: Correr + PV temporários, custos e recarga curta/longa; Metabolismo só longa',async()=>{
 const {s,a}=await mesa();const pico=opcoesDisponiveis(a).find(o=>o.nome==='Pico de Adrenalina');assert.match(pico.descricao,/PV temporários/);
 s.fase='turnos';s.rodada=1;s.ordem=s.atores.map(a=>a.id);s.vez=0;const metros=a.metros;
 let next=await enviar(s,{tipo:'usar',ator:a.id,opcao:pico.id},player);const n=next.atores[0];assert.equal(n.metros,metros+12);assert.equal(n.pvTemporarios,2);assert.equal(n.bonus,0);assert.equal(n.acao,1);assert.equal(n.rec['pico-de-adrenalina'],1);
 next=await enviar(next,{tipo:'encerrar'});next.atores[0].rec['pico-de-adrenalina']=0;next.atores[0].rec['metabolismo-incomum']=0;
 next=await enviar(next,{tipo:'descanso',periodo:'curto'});assert.equal(next.atores[0].rec['pico-de-adrenalina'],2);assert.equal(next.atores[0].rec['metabolismo-incomum'],0);
 next.atores[0].rec['pico-de-adrenalina']=0;next=await enviar(next,{tipo:'descanso',periodo:'longo'});assert.equal(next.atores[0].rec['pico-de-adrenalina'],2);assert.equal(next.atores[0].rec['metabolismo-incomum'],1);
 assert.equal(meta({...a,ficha:validar(compactarFicha(a.ficha))}).gatilho,'rolar_iniciativa');
});


test('Metabolismo a 0 PV: a escolha precede o primeiro turno e a recuperação evita teste de morte indevido',async()=>{
 const {s,a,b}=await mesa({pv:0,foco:0});a.estadoVida='inconsciente';let next=await enviar(s,{tipo:'iniciar'});const pedidos=[];
 const dados=async(f,m)=>{pedidos.push(m.tipo);return m.tipo==='iniciativa_lote'?{resultados:[{total:30},{total:1}]}:{total:7};};
 next=await enviar(next,{tipo:'iniciativas',atores:[a.id,b.id]},gm,dados);assert.equal(next.fase,'iniciativa');assert.deepEqual(pedidos,['iniciativa_lote']);
 const pend=next.atores[0].reacaoIniciativa;next=await enviar(next,{tipo:'responderIniciativa',ator:a.id,pendenciaId:pend.id,opcao:meta(next.atores[0]).id},player,dados);
 assert.equal(next.fase,'turnos');assert.equal(next.atores[0].pv,7);assert.equal(next.atores[0].estadoVida,'consciente');assert.deepEqual([next.atores[0].acao,next.atores[0].bonus,next.atores[0].reacao],[1,1,1]);assert.deepEqual(pedidos,['iniciativa_lote','cura']);
});
