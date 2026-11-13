import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {novo,adicionar,aplicar,atual,publico,validar,caAtual,pvMaximosAtuais,deslocamentoMaximo} from './site/engine.mjs';
const ficha=async name=>JSON.parse(await readFile(new URL('./site/fichas/'+name+'.json',import.meta.url),'utf8'));
const nikki=await ficha('nikki'),soldado=await ficha('soldado');
const gm={id:'m',role:'GM'},player={id:'p',role:'PLAYER'};
function mesa(){
  let s=novo();
  const a=adicionar(s,nikki),b=adicionar(s,soldado,'Soldado I'),c=adicionar(s,soldado,'Soldado II');
  const go=async(tipo,extra={},u=gm,dados=[])=>{
    const rolarUma=async formula=>{
      assert.ok(dados.length,'faltou um dado no teste');
      if(!/d20/.test(formula))return {total:dados.shift(),natural:null,formula,resumo:formula};
      const m=/(\d+)d20(?:(kh|kl)1)?/.exec(formula),faces=Array.from({length:Number(m[1])},()=>{assert.ok(dados.length,'faltou um d20');return dados.shift();});
      const natural=m[2]==='kh'?Math.max(...faces):m[2]==='kl'?Math.min(...faces):faces[0];let total=natural;
      for(const termo of formula.replace(m[0],'').match(/[+-](?:\d+d\d+|\d+)/g)??[]){const sinal=termo[0]==='-'?-1:1;total+=sinal*(termo.includes('d')?(assert.ok(dados.length,'faltou dado extra'),dados.shift()):Number(termo.slice(1)));}
      return {total,natural,formula,resumo:formula+' = '+total};
    };
    const rolar=async formula=>Array.isArray(formula)?{resultados:await Promise.all(formula.map(rolarUma))}:rolarUma(formula);
    s=await aplicar(s,{rev:s.rev,tipo,...extra},u,rolar);return s;
  };
  const iniciar=async()=>{
    await go('vincular',{ator:a.id,dono:'p',token:'n'});
    await go('iniciar');
    await go('iniciativa',{ator:a.id},player,[18]);
    await go('iniciativa',{ator:b.id},gm,[12]);await go('iniciativa',{ator:c.id},gm,[8]);
  };
  return {a,b,c,go,iniciar,get s(){return s;}};
}
test('importa números das fichas originais e separa as instâncias dos soldados',()=>{
 const m=mesa();assert.equal(m.a.pv,20);assert.equal(m.a.rec.feiticaria,3);assert.equal(m.b.pv,24);assert.equal(m.b.ficha.caBase,16);assert.notEqual(m.b.id,m.c.id);assert.equal(nikki.preparacao.preparadas.length,6);
 assert.equal(publico(m.s).atores[1].ficha.caBase,undefined);
});
test('autorização de vínculo, comando do jogador e ação excepcional do mestre',async()=>{
 const m=mesa();await m.iniciar();
 await assert.rejects(m.go('vincular',{ator:m.b.id,dono:'p'},player));
 await assert.rejects(m.go('passar',{ator:m.b.id},player));
 await assert.rejects(m.go('passar',{ator:m.a.id}),/Confirme/);
 await m.go('passar',{ator:m.a.id,confirmado:true});assert.equal(atual(m.s).id,m.b.id);assert.match(m.s.historico[0],/Mestre por Nikki/);
});
test('Nikki ataca, o soldado responde e o próximo soldado permanece independente',async()=>{
 const m=mesa();await m.iniciar();
 const fogo=nikki.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao);
 await m.go('usar',{ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player,[15,7]);
 assert.equal(m.s.atores[1].pv,17);assert.equal(m.s.atores[2].pv,24);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player),/Saldo/);
 await m.go('passar',{ator:m.a.id},player);
 await m.go('usar',{ator:m.b.id,opcao:soldado.opcoes.find(o=>o.automacao?.tipo==='ataque').id,alvo:m.a.id},gm,[12,5]);
 assert.equal(m.s.atores[0].pv,15);
});
test('salva por alvo e um dano compartilhado, círculo gasto, resistência e crítico',async()=>{
 const m=mesa();await m.iniciar();const sh=nikki.opcoes.find(o=>o.automacao?.raioM);
 await m.go('usar',{ator:m.a.id,opcao:sh.id,ponto:{x:1,y:0}},player,[12,19,1,18]);
 assert.deepEqual(m.s.atores.map(a=>a.pv),[14,12,18]);assert.equal(m.s.atores[0].rec['espaco-2'],1);
 const second=mesa();await second.iniciar();let formulas=[];
 const hit=nikki.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao);
 await aplicar(second.s,{tipo:'usar',rev:second.s.rev,ator:second.a.id,opcao:hit.id,alvo:second.b.id},player,async f=>{formulas.push(f);return formulas.length===1?20:7;});assert.deepEqual(formulas,['1d20+5','2d10']);
});
test('salva de alvo acontece antes do dano, aplica efeito na falha e consome a penalidade futura',async()=>{
 const m=mesa();await m.iniciar();const talho=m.a.ficha.opcoes.find(o=>o.nome.includes('Talho Mental'));
 assert.equal(talho.automacao.tipo,'salva');assert.equal(talho.automacao.atributo,'int');
 await m.go('usar',{ator:m.a.id,opcao:talho.id,alvo:m.b.id},player,[10,4]);
 assert.equal(m.s.atores[1].pv,20);assert.equal(m.s.atores[1].efeitosAtivos[0].penalidadeProximaSalva,'1d4');assert.equal(m.s.atores[0].acao,0);
 await m.go('teste',{ator:m.b.id,grupo:'salvaguardas',chave:'con'},gm,[10,3]);
 assert.match(m.s.historico[0],/11/);assert.equal(m.s.atores[1].efeitosAtivos.length,0);
});
test('sucesso que anula o efeito cancela a rolagem de dano',async()=>{
 const m=mesa();await m.iniciar();const talho=m.a.ficha.opcoes.find(o=>o.nome.includes('Talho Mental'));let chamadas=0;
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:talho.id,alvo:m.b.id},player,async(formula,meta)=>{chamadas++;assert.equal(meta.tipo,'salvaguarda');return {total:18,natural:18,formula,resumo:'18'};});
 assert.equal(chamadas,1);assert.equal(next.atores[1].pv,24);assert.equal(next.atores[1].efeitosAtivos?.length??0,0);
});
test('salva com metade rola depois do teste no alvo direto; área rola dano antes e envia cada teste ao controlador',async()=>{
 const m=mesa();await m.iniciar();const sussurros=m.a.ficha.opcoes.find(o=>o.nome.includes('Sussurros Dissonantes')),ordem=[];
 const alvo=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:sussurros.id,alvo:m.b.id},player,async(formula,meta)=>{ordem.push(meta.tipo);return meta.tipo==='salvaguarda'?{total:18,natural:18,formula,resumo:'18'}:{total:8,natural:null,formula,resumo:'8'};});
 assert.deepEqual(ordem,['salvaguarda','dano']);assert.equal(alvo.atores[1].pv,20);
 const area=mesa();await area.iniciar();const desp=area.a.ficha.opcoes.find(o=>o.automacao?.raioM&&!o.automacao.origemArea),chamadas=[];
 await aplicar(area.s,{tipo:'usar',rev:area.s.rev,ator:area.a.id,opcao:desp.id,ponto:{x:1,y:0}},player,async(formula,meta)=>{chamadas.push(meta);return {total:meta.tipo==='dano'?12:20,natural:meta.tipo==='salvaguarda'?16:null,formula,resumo:'teste'};});
 assert.equal(chamadas[0].tipo,'dano');assert.deepEqual(chamadas.filter(x=>x.tipo==='salvaguarda').map(x=>x.destinoId),['p','GM','GM']);
});
test('mover 3,4 custa cinco metros e não se pode exceder o saldo',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[1].x=20;m.s.atores[2].x=22;await m.go('mover',{ator:m.a.id,x:3,y:4},player);assert.equal(m.s.atores[0].metros,4);
 await assert.rejects(m.go('mover',{ator:m.a.id,x:7,y:8},player),/insuficiente/);
});
test('Agarrar, Derrubar e Empurrar são habilidades distintas; Empurrar desloca só na falha',async()=>{
 const nomes=mesa().a.ficha.opcoes.map(o=>o.nome);assert.ok(nomes.includes('Agarrar | ação'));assert.ok(nomes.includes('Derrubar | ação'));assert.ok(nomes.includes('Empurrar | ação'));assert.ok(!nomes.some(n=>n.includes('Agarrar ou empurrar')));
 const antiga=structuredClone(nikki),base='be7ecce8-1c0b-5ee4-a39b-09dc4c33f0fe';antiga.opcoes=antiga.opcoes.filter(o=>!o.id.startsWith(base));antiga.opcoes.push({id:base,nome:'Agarrar ou empurrar | ação',categoria:'acao',descricao:'Opção antiga combinada.',custo:[{tipo:'acao',quantidade:1}]});const migrada=validar(antiga);assert.deepEqual(migrada.opcoes.filter(o=>o.id.startsWith(base)).map(o=>o.nome),['Agarrar | ação','Derrubar | ação','Empurrar | ação']);
 const falha=mesa();await falha.iniciar();const empurrar=falha.a.ficha.opcoes.find(o=>o.nome==='Empurrar | ação');
 await falha.go('usar',{ator:falha.a.id,opcao:empurrar.id,alvo:falha.b.id},player,[5]);assert.equal(falha.s.atores[1].x,2.5);assert.equal(falha.s.atores[1].y,0);assert.match(falha.s.historico[0],/empurrado 1.5 m/);
 const sucesso=mesa();await sucesso.iniciar();const outra=sucesso.a.ficha.opcoes.find(o=>o.nome==='Empurrar | ação');await sucesso.go('usar',{ator:sucesso.a.id,opcao:outra.id,alvo:sucesso.b.id},player,[10]);assert.equal(sucesso.s.atores[1].x,1);
});
test('deslocamento forçado de área usa o centro da magia como origem do vetor',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'onda-area',nome:'Onda de teste',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'salva',atributos:['for','des'],cd:20,alcanceM:18,raioM:3,excluirConjurador:true,deslocamentoForcado:{distanciaM:1.5,direcao:'afastar'}}});
 await m.iniciar();m.s.atores[1].x=2;m.s.atores[1].y=0;m.s.atores[2].x=1;m.s.atores[2].y=1;
 await m.go('usar',{ator:m.a.id,opcao:'onda-area',ponto:{x:1,y:0}},player,[1,1]);
 assert.equal(m.s.atores[1].x,3.5);assert.equal(m.s.atores[1].y,0);assert.equal(m.s.atores[2].x,1);assert.equal(m.s.atores[2].y,2.5);
});
test('falha de dados, revisão obsoleta e alvo fora do alcance preservam saldos',async()=>{
 const m=mesa();await m.iniciar();const o=nikki.opcoes.find(o=>o.automacao?.raioM);
 const antes=structuredClone(m.s);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,ponto:{x:50,y:0}},player),/alcance/);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,ponto:{x:0,y:0}},player));
 await assert.rejects(m.go('passar',{ator:m.a.id,rev:-1},player),/mudou/);assert.deepEqual(m.s,antes);
});
test('reação fora do turno consome uso gratuito só uma vez; descanso recupera',async()=>{
 const m=mesa();await m.iniciar();await m.go('passar',{ator:m.a.id},player);
 const opt=nikki.opcoes.find(o=>o.nome.includes('| Repreensão Diabólica'));
 await m.go('reagir',{ator:m.a.id,opcao:opt.id},player);assert.equal(m.s.atores[0].rec.repreensao,0);
 await assert.rejects(m.go('reagir',{ator:m.a.id,opcao:opt.id},player));await m.go('encerrar');await m.go('descanso',{periodo:'longo'});assert.equal(m.s.atores[0].rec.repreensao,1);
});
test('vínculo duplicado ou JSON inválido são rejeitados; nível dez e campos extensíveis sobrevivem',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,token:'x'});await assert.rejects(m.go('vincular',{ator:m.b.id,token:'x'}));
 const f=structuredClone(nikki);f.classes=[{id:'feiticeiro',nivel:6},{id:'bardo',nivel:4}];f.concentracao={origem:'efeito'};assert.deepEqual(validar(f).concentracao,f.concentracao);f.classes[1].nivel++;assert.throws(()=>validar(f));
});
test('Feitiçaria Inata custa uma ação bônus, conserva a ação e modifica a CD da classe',async()=>{
 const m=mesa();await m.iniciar();
 await m.go('usar',{ator:m.a.id,opcao:'feiticaria-inata'},player);
 assert.equal(m.s.atores[0].bonus,0);assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[0].rec.inata,1);
 const sh=nikki.opcoes.find(o=>o.automacao?.raioM);
 await m.go('usar',{ator:m.a.id,opcao:sh.id,ponto:{x:1,y:0}},player,[10,20,9,20]);
 // Soldado I rola 9+4 = 13, insuficiente contra CD 14.
 assert.equal(m.s.atores[1].pv,14);
});
test('ataque declarativo usa escala de nível total e proficiência',()=>{
 const f=structuredClone(nikki);f.classes[0].nivel=10;
 f.opcoes.push({id:'teste',nome:'Ataque escalonado',categoria:'magia',selecao:{tipo:'alvos',max:1,alcanceM:36},etapas:[{tipo:'ataque_contra_ca',atributo:'car',somarProficiencia:true},{tipo:'dano',quando:'acerto',parcelas:[{tipo:'fogo',dados:'1d10',escalaPorNivelTotal:[{nivel:5,dados:'2d10'}]}]}]});
 assert.equal(validar(f).opcoes.find(o=>o.id==='teste').automacao.dano,'2d10');
});


test('Mísseis Mágicos migram, repetem alvos e gastam um espaço por conjuração',async()=>{
 const m=mesa();await m.iniciar();
 const o=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe);
 await m.go('usar',{ator:m.a.id,opcao:o.id,alvos:[m.b.id,m.b.id,m.c.id]},player,[3,4,5]);
 assert.deepEqual(m.s.atores.map(a=>a.pv),[20,17,19]);assert.equal(m.s.atores[0].rec['espaco-1'],3);
});
test('Mísseis Mágicos enviam todas as setas em uma rolagem conjunta identificada',async()=>{
 const m=mesa();await m.iniciar();const o=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe);let chamada;
 const proximo=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:o.id,alvos:[m.b.id,m.b.id,m.c.id]},player,async(formulas,meta)=>{chamada={formulas,meta};return {resultados:[4,5,6]};});
 assert.deepEqual(chamada.formulas,['1d4+1','1d4+1','1d4+1']);assert.equal(chamada.meta.tipo,'dano-lote');
 assert.deepEqual(chamada.meta.instancias.map(x=>x.alvo),['Soldado I','Soldado I','Soldado II']);assert.deepEqual(proximo.atores.map(a=>a.pv),[20,15,18]);
});
test('alvos incompletos, duplicados proibidos ou ausentes não gastam recursos',async()=>{
 const m=mesa();await m.iniciar();
 const o=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,alvos:[m.b.id]},player),/Quantidade/);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,alvos:[m.b.id,m.b.id,'inexistente']},player),/ausente/);
 assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[0].rec['espaco-1'],4);
});
test('Bênção permite menos alvos, recusa repetição e aplica dado nas salvas',async()=>{
 const m=mesa();
 m.a.ficha.opcoes.push({id:'bencao-teste',nome:'Bênção',categoria:'magia',circuloBase:1,custo:[{tipo:'acao',quantidade:1},{tipo:'recurso',id:'espaco-1',quantidade:1}]});
 await m.iniciar();
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:'bencao-teste',alvos:[m.a.id,m.a.id]},player),/diferentes/);
 await m.go('usar',{ator:m.a.id,opcao:'bencao-teste',alvos:[m.a.id]},player);
 assert.deepEqual(m.s.atores[0].bencao.alvos,[m.a.id]);
 await m.go('teste',{ator:m.a.id,grupo:'salvaguardas',chave:'con'},player,[10,3]);
 assert.match(m.s.historico[0],/17/);
});
test('rajada com testes de ataque resolve cada projétil e suporta alvos repetidos',async()=>{
 const m=mesa();
 m.a.ficha.opcoes.push({id:'rajada',nome:'Rajada',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],selecao:{tipo:'alvos',min:3,max:3,repetirAlvo:true},automacao:{tipo:'ataque',bonus:5,dano:'1d6',elemento:'fogo',alcanceM:18}});
 await m.iniciar();
 await m.go('usar',{ator:m.a.id,opcao:'rajada',alvos:[m.b.id,m.c.id,m.b.id]},player,[12,1,18,3,4]);
 assert.deepEqual(m.s.atores.map(a=>a.pv),[20,17,24]);
});
test('círculo superior requer quatro dardos e gasta o recurso correto',async()=>{
 const m=mesa();await m.iniciar();
 const o=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&o.circuloBase===2);
 assert.equal(o.selecao.max,4);
 await m.go('usar',{ator:m.a.id,opcao:o.id,alvos:[m.b.id,m.b.id,m.b.id,m.b.id]},player,[2,2,2,2]);
 assert.equal(m.s.atores[0].rec['espaco-1'],4);assert.equal(m.s.atores[0].rec['espaco-2'],1);
});
test('ataque aceita dado extra e modificador antes da rolagem',async()=>{
 const m=mesa();await m.iniciar();const fogo=m.a.ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao);
 await m.go('usar',{ator:m.a.id,opcao:fogo.id,alvo:m.b.id,dadosAjuste:['1d4'],ajuste:0},player,[10,2,7]);
 assert.equal(m.s.atores[1].pv,17);assert.match(m.s.historico[0],/total 17/);
});
test('ataque de oportunidade pausa e interrompe o movimento no ponto do acerto',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[2].x=8;
 await m.go('mover',{ator:m.a.id,x:4,y:0},player);
 assert.equal(m.s.atores[0].x,0);assert.equal(m.s.reacaoPendente.alvo,m.a.id);assert.equal(m.s.reacaoPendente.reator,m.b.id);
 const opcao=m.b.ficha.opcoes.find(o=>o.gatilho==='sair_alcance');
 await m.go('resolverReacao',{ator:m.b.id,opcao:opcao.id,modo:'normal',ajuste:0,dadosAjuste:[]},gm,[15,5]);
 assert.equal(m.s.atores[0].pv,15);assert.equal(m.s.atores[0].x,2.5);assert.equal(m.s.atores[0].metros,6.5);assert.equal(m.s.atores[1].reacao,0);assert.equal(m.s.reacaoPendente,undefined);
 await m.go('mover',{ator:m.a.id,x:4,y:0},player);assert.equal(m.s.atores[0].x,4);
});
test('recusar oportunidade continua o movimento e perícia ausente usa o atributo',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[2].x=8;
 await m.go('mover',{ator:m.a.id,x:4,y:0},player);
 await m.go('resolverReacao',{ator:m.b.id,opcao:null},gm);
 assert.equal(m.s.atores[0].x,4);assert.equal(m.s.atores[0].metros,5);
 await m.go('passar',{ator:m.a.id},player);await m.go('teste',{ator:m.b.id,grupo:'pericias',chave:'Acrobacia'},gm,[10]);
 assert.match(m.s.historico[0],/11/);
});
test('perícias e salvaguardas podem ser roladas antes e fora do próprio turno',async()=>{
 const m=mesa();await m.go('teste',{ator:m.b.id,grupo:'pericias',chave:'Acrobacia'},gm,[10]);assert.match(m.s.historico[0],/11/);
 await m.iniciar();await m.go('teste',{ator:m.b.id,grupo:'salvaguardas',chave:'con'},gm,[10]);assert.match(m.s.historico[0],/14/);
 assert.equal(m.s.atores[1].acao,1);assert.equal(m.s.atores[1].bonus,1);assert.equal(m.s.atores[1].reacao,1);
});
test('mestre retira e recoloca uma ficha sem perder o vínculo',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p',token:'n'});await m.go('vincular',{ator:m.b.id,token:'b'});await m.go('alternarCombate',{ator:m.b.id});assert.equal(m.s.atores[1].emCombate,false);
 await m.go('iniciar');await m.go('iniciativa',{ator:m.a.id},player,[18]);await m.go('iniciativa',{ator:m.c.id},gm,[8]);
 assert.deepEqual(m.s.ordem,[m.a.id,m.c.id]);await m.go('alternarCombate',{ator:m.b.id},gm,[12]);
 assert.equal(m.s.atores[1].emCombate,true);assert.ok(m.s.ordem.includes(m.b.id));assert.equal(m.s.atores[1].token,'b');
});
test('painel de contexto altera valor atual e máximo de PV e recursos',async()=>{
 const m=mesa();await m.go('definirRecurso',{ator:m.a.id,campo:'pv',atual:23,maximo:25});assert.equal(m.s.atores[0].pv,23);assert.equal(m.s.atores[0].ficha.pvMaximos,25);
 await m.go('definirRecurso',{ator:m.a.id,campo:'feiticaria',atual:4,maximo:5});assert.equal(m.s.atores[0].rec.feiticaria,4);assert.equal(m.s.atores[0].ficha.recursos.find(r=>r.id==='feiticaria').maximo,5);
});

test('dono salva sua ficha sem alterar identidade, tipo ou vínculo',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p',token:'nikki-token'});
 const editada=structuredClone(m.a.ficha);editada.id='tentativa-de-troca';editada.tipo='npc';editada.nome='Nikki Editada';editada.atributos.car=18;editada.pvMaximos=22;editada.recursos.find(r=>r.id==='feiticaria').maximo=4;
 await m.go('atualizarFicha',{ator:m.a.id,ficha:editada,pv:19,rec:{...m.a.rec,feiticaria:4}},player);
 const a=m.s.atores[0];assert.equal(a.ficha.id,'nikki');assert.equal(a.ficha.tipo,'pj');assert.equal(a.nome,'Nikki Editada');assert.equal(a.ficha.atributos.car,18);assert.equal(a.pv,19);assert.equal(a.rec.feiticaria,4);assert.equal(a.token,'nikki-token');assert.equal(a.dono,'p');
});

test('jogador não edita NPC e mestre edita qualquer ficha com confirmação para PJ',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p'});const npc=structuredClone(m.b.ficha);npc.caBase=18;
 await assert.rejects(m.go('atualizarFicha',{ator:m.b.id,ficha:npc,pv:m.b.pv,rec:{}},player),/não controla/);
 await m.go('atualizarFicha',{ator:m.b.id,ficha:npc,pv:m.b.pv,rec:{}},gm);assert.equal(m.s.atores[1].ficha.caBase,18);
 const pj=structuredClone(m.a.ficha);pj.caBase=17;await assert.rejects(m.go('atualizarFicha',{ator:m.a.id,ficha:pj,pv:m.a.pv,rec:m.a.rec},gm),/Confirme/);
 await m.go('atualizarFicha',{ator:m.a.id,ficha:pj,pv:m.a.pv,rec:m.a.rec,confirmado:true},gm);assert.equal(m.s.atores[0].ficha.caBase,17);
});

test('salvamento inválido é atômico e não corrompe a ficha carregada',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p'});const antes=structuredClone(m.s),ruim=structuredClone(m.a.ficha);ruim.atributos.for=99;
 await assert.rejects(m.go('atualizarFicha',{ator:m.a.id,ficha:ruim,pv:20,rec:m.a.rec},player),/atributos/);assert.deepEqual(m.s,antes);
});

test('Armadura Arcana usa CA base 13, aplica +2 fora de combate e termina no descanso longo',async()=>{
 const m=mesa(),o=m.a.ficha.opcoes.find(o=>o.nome.includes('Armadura Arcana'));
 assert.equal(m.a.ficha.caBase,13);assert.equal(o.automacao.tipo,'efeito');assert.equal(caAtual(m.a),13);
 await m.go('vincular',{ator:m.a.id,dono:'p'});const espacos=m.a.rec['espaco-1'];
 await m.go('usar',{ator:m.a.id,opcao:o.id,alvo:m.a.id},player);
 assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[0].rec['espaco-1'],espacos-1);assert.equal(caAtual(m.s.atores[0]),15);
 assert.equal(m.s.atores[0].efeitosAtivos[0].modificadores.ca,2);assert.equal(m.s.atores[0].efeitosAtivos[0].removeEm,'descanso_longo');
 await m.go('descanso',{periodo:'curto'});assert.equal(caAtual(m.s.atores[0]),15);
 await m.go('descanso',{periodo:'longo'});assert.equal(caAtual(m.s.atores[0]),13);assert.equal(m.s.atores[0].efeitosAtivos.length,0);
});

test('Armadura Arcana rejeita alvo com armadura sem gastar o espaço',async()=>{
 const m=mesa(),o=m.a.ficha.opcoes.find(o=>o.nome.includes('Armadura Arcana')),antes=structuredClone(m.s);
 await m.go('vincular',{ator:m.a.id,dono:'p'});m.b.ficha.armaduraEquipada=true;
 const estado=structuredClone(m.s);await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,alvo:m.b.id},player),/usando armadura/);assert.deepEqual(m.s,estado);assert.notDeepEqual(m.s,antes);
});

test('ações e magias ficam liberadas fora de combate sem consumir a economia de turno',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p'});
 const adaga=m.a.ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe),misseis=m.a.ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe),espacos=m.a.rec['espaco-1'];
 await m.go('usar',{ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,[15,3]);
 assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[1].pv,21);
 await m.go('usar',{ator:m.a.id,opcao:misseis.id,alvos:[m.b.id,m.b.id,m.c.id]},player,[2,2,2]);
 assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[0].rec['espaco-1'],espacos-1);
});

test('encerrar restaura a barra e permite usar outra habilidade fora de combate',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p'});await m.iniciar();
 const adaga=m.a.ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe);
 await m.go('usar',{ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,[15,3]);
 assert.equal(m.s.atores[0].acao,0);
 await m.go('encerrar');
 assert.equal(m.s.fase,'preparo');assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[0].bonus,1);assert.equal(m.s.atores[0].reacao,1);
 await m.go('usar',{ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,[15,3]);
 assert.equal(m.s.atores[0].acao,1);
});

test('efeitos genéricos somam PV máximo e deslocamento e condições restringem o turno',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'vigor-movel',nome:'Vigor e mobilidade',categoria:'magia',foraCombate:true,custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'efeito',alcanceM:1.5,efeito:{nome:'Vigor e mobilidade',tipo:'buff',modificadores:{pvMaximos:5,deslocamentoM:3},removeEm:'descanso_longo',aumentaPVAtual:true}}});
 await m.go('vincular',{ator:m.a.id,dono:'p'});await m.go('usar',{ator:m.a.id,opcao:'vigor-movel',alvo:m.a.id},player);
 assert.equal(m.s.atores[0].pv,25);assert.equal(pvMaximosAtuais(m.s.atores[0]),25);assert.equal(deslocamentoMaximo(m.s.atores[0]),12);
 m.s.atores[0].efeitosAtivos.push({id:'congelado',nome:'Congelado',tipo:'condicao',restricoes:{imovel:true,semReacao:true}});
 await m.iniciar();assert.equal(m.s.atores[0].metros,0);assert.equal(m.s.atores[0].reacao,0);
});

test('rolagem composta envia um comando ao Dice+ e pré-configura o dano crítico',async()=>{
 const m=mesa();await m.iniciar();const fogo=m.a.ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao),chamadas=[];
 const rolar=async(formula,meta)=>{chamadas.push({formula,meta});return chamadas.length===1?{total:27,natural:20,formula,resumo:'20+7=27'}:{total:14,natural:null,formula,resumo:'14'};};
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:fogo.id,alvo:m.b.id,modo:'vantagem',ajuste:2,dadosAjuste:['1d4']},player,rolar);
 assert.equal(chamadas.length,2);assert.equal(chamadas[0].formula,'2d20kh1+7+1d4');assert.equal(chamadas[0].meta.cd,16);
 assert.equal(chamadas[1].formula,'2d10');assert.equal(chamadas[1].meta.critico,true);assert.equal(s.atores[1].pv,10);assert.equal(s.atores[0].acao,0);
});

test('ataque que falha também confirma o custo da ação',async()=>{
 const m=mesa();await m.iniciar();const fogo=m.a.ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao),chamadas=[];
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player,async(formula,meta)=>{chamadas.push({formula,meta});return {total:9,natural:4,formula,resumo:'4+5=9'};});
 assert.equal(chamadas.length,1);assert.equal(s.atores[0].acao,0);assert.equal(s.atores[1].pv,24);assert.match(s.historico[0],/errou/);
});

test('armas arremessáveis recebem ações próprias e desvantagem após o alcance normal',async()=>{
 const m=mesa(),variantes=m.a.ficha.opcoes.filter(o=>o.varianteArremessoDe);
 assert.deepEqual(variantes.map(o=>o.nome),['Adaga +4 · arremesso | ação','Segunda adaga +4 · arremesso | ação bônus','Lança +2 · arremesso | ação · uma mão']);
 await m.iniciar();m.s.atores[1].x=10;const adaga=variantes[0],formulas=[];
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,async f=>{formulas.push(f);return {total:9,natural:4,formula:f,resumo:'4+5=9'};});
 assert.equal(formulas[0],'2d20kl1+4');assert.equal(s.atores[0].acao,0);assert.match(s.historico[0],/errou/);
});
