import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {novo,adicionar} from './site/engine.mjs';
import {novoRegistroExecucoes,admitirExecucao,iniciarExecucao,avancarExecucao,aplicarResultadoExecucao,validarDependenciasExecucao,encerrarExecucao,cancelarExecucao} from './site/executions.mjs';
const f=JSON.parse(await fs.readFile(new URL('./site/fichas/nikki.json',import.meta.url)));
function mesa(){const s=novo(),a=adicionar(s,f),b=adicionar(s,f);a.dono='p1';b.dono='p2';return {s,a,b,r:novoRegistroExecucoes()};}
const usuario=id=>({id,role:'PLAYER',name:id});
const cmd=(s,a)=>({tipo:'teste',ator:a.id,grupo:'pericias',chave:'Arcanismo',rev:s.rev});
async function concluir(r,e,s){let p=await avancarExecucao(r,e);assert.ok(p.pedido);p.pedido.resultado={total:15,natural:12,formula:p.pedido.formula};p=await avancarExecucao(r,e);const next=aplicarResultadoExecucao(p.base,p.next,s);encerrarExecucao(r,e,'Concluída');return next;}
test('perícias de atores diferentes aplicam sem invalidar pela revisão global',async()=>{
 let {s,a,b,r}=mesa();const e1=admitirExecucao(r,cmd(s,a),usuario('p1'),'um',s),e2=admitirExecucao(r,cmd(s,b),usuario('p2'),'dois',s);
 assert.ok(iniciarExecucao(r,e1,s));assert.ok(iniciarExecucao(r,e2,s));s=await concluir(r,e1,s);s=await concluir(r,e2,s);
 assert.equal(s.rev,2);assert.equal(s.historico.length,2);assert.deepEqual(r.bases,{});
});
test('mesmo ator aguarda sem falhar e a base é tomada só ao iniciar',async()=>{
 let {s,a,r}=mesa();const e1=admitirExecucao(r,cmd(s,a),usuario('p1'),'um',s),e2=admitirExecucao(r,cmd(s,a),usuario('p1'),'dois',s);
 assert.ok(iniciarExecucao(r,e1,s));assert.equal(iniciarExecucao(r,e2,s),false);assert.equal(e2.baseRef,undefined);
 s=await concluir(r,e1,s);assert.ok(iniciarExecucao(r,e2,s));assert.equal(e2.comando.rev,1);s=await concluir(r,e2,s);assert.equal(s.rev,2);
});
test('recarga conserva diário; resposta registrada não pede nem sorteia dados de novo',async()=>{
 const {s,a,r}=mesa(),e=admitirExecucao(r,cmd(s,a),usuario('p1'),'persistente',s);iniciarExecucao(r,e,s);
 let p=await avancarExecucao(r,e);p.pedido.resultado={total:17,natural:14};const restaurado=JSON.parse(JSON.stringify(r));
 p=await avancarExecucao(restaurado,restaurado.lista[0]);assert.ok(p.next);assert.match(p.next.historico[0],/17/);
});
test('reexecução conserva identidades e relógio, inclusive depois de um pedido',async()=>{
 const {s,a,r}=mesa(),e=admitirExecucao(r,cmd(s,a),usuario('p1'),'identidades',s);iniciarExecucao(r,e,s);const vistos=[];
 const executar=async(s,c,u,rolar,ctx)=>{const um=ctx.uuid(),hora=ctx.agora();await rolar('1d20',{tipo:'teste'});vistos.push([um,hora,ctx.uuid()]);return s;};
 let p=await avancarExecucao(r,e,{executar,uuid:()=>crypto.randomUUID(),agora:()=>100});p.pedido.resultado={total:12};p=await avancarExecucao(r,e,{executar,agora:()=>999});
 assert.equal(vistos[0][0],e.ids[0]);assert.equal(vistos[0][1],100);assert.equal(vistos[0][2],e.ids[1]);
});
test('cancelamento simples é terminal; cancelamento após dados exige intervenção',async()=>{
 const {s,a,r}=mesa(),u=usuario('p1'),e=admitirExecucao(r,cmd(s,a),u,'cancelar',s);iniciarExecucao(r,e,s);let p=await avancarExecucao(r,e);
 assert.throws(()=>cancelarExecucao(r,e.id,usuario('p2')),/outro participante/);
 p.pedido.snapshot={tipo:'rolando'};assert.ok(cancelarExecucao(r,e.id,u).solicitado);assert.notEqual(e.estado,'Cancelada');
 assert.throws(()=>cancelarExecucao(r,e.id,{id:'gm',role:'GM'}),/Confirme/);
 cancelarExecucao(r,e.id,{id:'gm',role:'GM'},{confirmado:true});assert.equal(e.estado,'Cancelada');assert.equal(await avancarExecucao(r,e),null);assert.ok(cancelarExecucao(r,e.id,u).terminal);
});
test('aceite repetido não duplica intenção e alterações concorrentes incompatíveis são recusadas',()=>{
 const {s,a,r}=mesa(),c=cmd(s,a),e=admitirExecucao(r,c,usuario('p1'),'unica',s);assert.equal(admitirExecucao(r,c,usuario('p1'),'unica',s),e);assert.equal(r.lista.length,1);
 assert.throws(()=>admitirExecucao(r,{...c,chave:'História'},usuario('p1'),'unica',s),/outra intenção/);
 const next=structuredClone(s),atual=structuredClone(s);next.atores[0].pv=5;atual.atores[0].pv=8;assert.throws(()=>aplicarResultadoExecucao(s,next,atual),/mudou/);
});
test('ramificações de salvaguarda chegam às próprias pendências sem esperar outro controlador',async()=>{
 const {s,a,r}=mesa(),e=admitirExecucao(r,cmd(s,a),usuario('p1'),'ramificacoes',s);iniciarExecucao(r,e,s);
 const executar=async(s,c,u,rolar)=>{await Promise.all([ (async()=>{await rolar('1d20',{tipo:'salvaguarda',alvo:'NPC1'});await rolar('1d20',{tipo:'salvaguarda',alvo:'NPC2'});})(),rolar('1d20',{tipo:'salvaguarda',alvo:'P2'}) ]);return s;};
 let p=await avancarExecucao(r,e,{executar});assert.deepEqual(p.pedidos.map(x=>x.meta.alvo),['NPC1','P2']);p.pedidos[0].resultado={total:10};
 p=await avancarExecucao(r,e,{executar});assert.deepEqual(new Set(p.pedidos.map(x=>x.meta.alvo)),new Set(['NPC2','P2']));
});
test('troca de controlador ou ficha durante a espera impede aplicação antiga; deslocamento não invalida perícia',()=>{
 const {s,a,r}=mesa(),e=admitirExecucao(r,cmd(s,a),usuario('p1'),'dep',s),atual=structuredClone(s);atual.atores[0].x=50;validarDependenciasExecucao(e,s,atual);
 atual.atores[0].dono='outro';assert.throws(()=>validarDependenciasExecucao(e,s,atual),/mudou/);
});
test('recibo terminal deduplica a intenção mesmo depois de aparar o histórico visual',()=>{
 const {s,a,r}=mesa(),u=usuario('p1'),c={...cmd(s,a),emitidaEm:100},e=admitirExecucao(r,c,u,'antigo',s,{agora:100});encerrarExecucao(r,e,'Concluída',undefined,{agora:101});
 for(let i=0;i<40;i++){const j=admitirExecucao(r,{...c,emitidaEm:102+i},u,'novo'+i,s,{agora:102+i});encerrarExecucao(r,j,'Concluída',undefined,{agora:103+i});}
 assert.equal(r.lista.length,30);assert.equal(admitirExecucao(r,c,u,'antigo',s).estado,'Concluída');assert.equal(r.lista.length,30);
});

test('ramos de duas etapas conservam identidades quando a ordem de respostas muda',async()=>{
 const {s,a,r}=mesa(),e=admitirExecucao(r,cmd(s,a),usuario('p1'),'ordem',s);iniciarExecucao(r,e,s);
 const executar=async(s,c,u,rolar)=>{await Promise.all(['GM','P2'].map(async alvo=>{await rolar('1d20',{tipo:'salvaguarda',alvo,titulo:alvo+'1'});await rolar('1d20',{tipo:'salvaguarda',alvo,titulo:alvo+'2'});}));return s;};
 let p=await avancarExecucao(r,e,{executar});p.pedidos[1].resultado={total:12};
 p=await avancarExecucao(r,e,{executar});const p2=e.rolagens.find(x=>x.meta.titulo==='P22');assert.ok(p2);
 e.rolagens[0].resultado={total:10};p=await avancarExecucao(r,e,{executar});const gm=e.rolagens.find(x=>x.meta.titulo==='GM2');assert.ok(gm);assert.equal(e.rolagens.find(x=>x.meta.titulo==='P22').id,p2.id);
 p2.resultado={total:15};gm.resultado={total:13};assert.ok((await avancarExecucao(r,e,{executar})).next);assert.equal(e.rolagens.length,4);
});

test('mil encerramentos limitam recibos e impedem repetição de intenção já expirada',()=>{
 const {s,a,r}=mesa(),u=usuario('p1');for(let i=1;i<=1000;i++){const e=admitirExecucao(r,{...cmd(s,a),emitidaEm:i},u,'id'+i,s,{agora:i});encerrarExecucao(r,e,'Concluída',undefined,{agora:i});}
 assert.equal(r.lista.length,30);assert.equal(Object.keys(r.encerramentos).length,512);assert.equal(r.expirouAntes,488);
 assert.throws(()=>admitirExecucao(r,{...cmd(s,a),emitidaEm:1},u,'id1',s),/expirou/);
});
