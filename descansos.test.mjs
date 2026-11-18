import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {novo,adicionar,aplicar,validar,atoresElegiveisDescanso} from './site/engine.mjs';
import {compactarEstado} from './site/catalog.mjs';
const nomes=['nikki','zurich','skimi','loteria','hannah-montana','dragoberto','draven-thorne'];
const fichas=await Promise.all(nomes.map(async n=>JSON.parse(await fs.readFile(new URL('./site/fichas/'+n+'.json',import.meta.url)))));
const gm={id:'gm',role:'GM'},rolar=()=>{throw Error('Descanso não deve solicitar dados automaticamente.');};
function mesa(){const s=novo();for(const f of fichas){const a=adicionar(s,f);a.emCombate=false;a.pv=1;for(const id of Object.keys(a.rec))a.rec[id]=0;}return s;}
const curto={skimi:{'espaco-2':2},loteria:{'pontos-de-foco':3,'pico-de-adrenalina':2},'draven-thorne':{'dados-de-superioridade':4,'recuperar-folego':1,'surto-de-acao':1}};
for(const periodo of ['curto','longo'])test('descanso '+periodo+' dos sete aventureiros fora da iniciativa respeita cada recurso',async()=>{
 let s=mesa();const ids=atoresElegiveisDescanso(s).map(a=>a.id);assert.equal(ids.length,7);
 s=await aplicar(s,{tipo:'descanso',periodo,atores:ids,rev:s.rev},gm,rolar);
 for(const a of s.atores){for(const r of a.ficha.recursos)assert.equal(a.rec[r.id],periodo==='longo'?r.maximo:curto[a.ficha.id]?.[r.id]??0,a.nome+' · '+r.nome);assert.equal(a.pv,periodo==='longo'?a.ficha.pvMaximos:1);assert.equal(a.emCombate,false);}
});
test('descanso afeta somente PJs vivos; NPC habilitado também permanece excluído',async()=>{
 const s=mesa(),npc={...fichas[0],id:'npc-descanso',tipo:'npc',descansoNpc:true};const habilitado=adicionar(s,npc),comum=adicionar(s,{...npc,id:'npc-comum',descansoNpc:false});habilitado.emCombate=false;habilitado.rec.feiticaria=comum.rec.feiticaria=0;
 const morto=s.atores[0];morto.estadoVida='morto';morto.pv=0;
 const ids=atoresElegiveisDescanso(s).map(a=>a.id);assert.ok(!ids.includes(habilitado.id));assert.ok(!ids.includes(comum.id));assert.ok(!ids.includes(morto.id));
 for(const periodo of ['curto','longo']){const next=await aplicar(s,{tipo:'descanso',periodo,atores:[...ids,habilitado.id],rev:s.rev},gm,rolar);assert.equal(next.atores.find(a=>a.id===habilitado.id).rec.feiticaria,0);assert.equal(next.atores.find(a=>a.id===comum.id).rec.feiticaria,0);assert.equal(next.atores[0].pv,0);assert.equal(next.atores[0].estadoVida,'morto');}
});
test('descanso individual continua limitado à seleção; longo completa o Fôlego após curto',async()=>{
 let s=mesa(),dr=s.atores.at(-1);s=await aplicar(s,{tipo:'descanso',periodo:'curto',atores:[dr.id],rev:s.rev},gm,rolar);assert.equal(s.atores.at(-1).rec['recuperar-folego'],1);assert.equal(s.atores[2].rec['espaco-2'],0);
 s=await aplicar(s,{tipo:'descanso',periodo:'longo',atores:[dr.id],rev:s.rev},gm,rolar);assert.equal(s.atores.at(-1).rec['recuperar-folego'],2);assert.equal(s.atores[0].rec.feiticaria,0);
});
test('recursos de itens respeitam curto, longo e amanhecer, inclusive após persistência',async()=>{
 const f=structuredClone(fichas[0]);f.inventario.itens.push(...[['capa','item.la-arte.capa-mensageiro'],['veste','item.la-arte.veste-ultimo-folego'],['colar','item.colar-da-ultima-palavra']].map(([id,ref])=>({id:'descanso-'+id,ref,quantidade:1})));
 let s=novo(),a=adicionar(s,f);a.emCombate=false;for(const r of a.ficha.recursos)a.rec[r.id]=0;
 const ids={curto:'item-descanso-capa-passo-mensageiro',longo:'item-descanso-veste-ultimo-folego',amanhecer:'item-descanso-colar-ultima-palavra'};
 s=await aplicar(s,{tipo:'descanso',periodo:'curto',rev:s.rev},gm,rolar);assert.equal(s.atores[0].rec[ids.curto],1);assert.equal(s.atores[0].rec[ids.longo],0);assert.equal(s.atores[0].rec[ids.amanhecer],0);
 s=await aplicar(s,{tipo:'descanso',periodo:'longo',rev:s.rev},gm,rolar);assert.equal(s.atores[0].rec[ids.longo],1);assert.equal(s.atores[0].rec[ids.amanhecer],0);
 s=JSON.parse(JSON.stringify(compactarEstado(s)));s.atores[0].ficha=validar(s.atores[0].ficha);assert.equal(s.atores[0].rec[ids.longo],1);assert.equal(s.atores[0].ficha.inventario.itens.find(i=>i.id==='descanso-veste').saldosRecursos['ultimo-folego'],1);
});
test('jogador não executa descanso global e o mestre não descansa durante combate',async()=>{
 const s=mesa();await assert.rejects(aplicar(s,{tipo:'descanso',periodo:'longo',rev:s.rev},{id:'p1',role:'PLAYER'},rolar),/Somente o mestre/);
 s.fase='turnos';await assert.rejects(aplicar(s,{tipo:'descanso',periodo:'longo',rev:s.rev},gm,rolar),/fora do combate/);
});
