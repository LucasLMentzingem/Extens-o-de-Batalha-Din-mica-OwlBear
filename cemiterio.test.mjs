import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {novo,adicionar,validar,aplicar,dadoLocal,caAtual,ataquesEquipados,opcoesDisponiveis,derivarOpcaoCirculo,publico,bonusIniciativa} from './site/engine.mjs';
import {compactarEstado,compactarFicha,definicaoItem} from './site/catalog.mjs';
const pasta=new URL('./conteudo/aventura-no-cemiterio/',import.meta.url);
const fonte=n=>JSON.parse(fs.readFileSync(new URL(n+'.json',pasta)));
const gm={id:'m',role:'GM'},rolar=(f,m)=>dadoLocal(f,m),cmd=(s,t,extra={})=>aplicar(s,{rev:s.rev,tipo:t,...extra},gm,rolar);
function mesa(corpo='goblin-1') {const s=novo(),origem=adicionar(s,validar(fonte('drow-necromante-6'))),alvo=adicionar(s,validar(fonte(corpo)));origem.x=alvo.x=0;alvo.y=1;alvo.pv=0;alvo.estadoVida='morto';alvo.token='token-corpo';return {s,origem,alvo};}
const reanimar=(s,o,a,extra={})=>cmd(s,'reanimarCorpo',{ator:a.id,conjuradorId:o.id,confirmado:true,minutoConcluido:true,...extra});
test('todas as fichas portadas validam no motor e mantêm CA, PV e recursos esperados',()=>{
  for(const nome of fs.readdirSync(pasta)){const a=adicionar(novo(),validar(JSON.parse(fs.readFileSync(new URL(nome,pasta)))));assert.ok(a.pv>0);}
  const p=adicionar(novo(),validar(fonte('padre-quevedo')));assert.equal(caAtual(p),18);assert.equal(p.rec['canalizar-divindade'],2);assert.equal(p.ficha.preparacao.preparadas.length,9);assert.equal(p.ficha.preparacao.semprePreparadas.length,6);
  const g=adicionar(novo(),validar(fonte('goblin-1')));assert.equal(caAtual(g),15);g.ficha.inventario.itens.find(i=>i.catalogoRef==='item.escudo').equipado=false;assert.equal(caAtual(g),13);
  const m=adicionar(novo(),validar(fonte('mimico')));assert.equal(m.pv,58);assert.equal(bonusIniciativa(m),3);
});
test('sobrepõe goblin e resguarda original; loot restante mantém IDs e itens prévios não reaparecem',async()=>{
  const {s,origem,alvo}=mesa();const retirado=alvo.ficha.inventario.itens.shift().id,ids=alvo.ficha.inventario.itens.map(i=>i.id);alvo.efeitosAtivos=[{id:'velho',nome:'Velho'}];
  const n=await reanimar(s,origem,alvo),a=n.atores.find(x=>x.id===alvo.id);assert.equal(a.ficha.id,'cemiterio-zumbigoblin');assert.equal(a.pv,15);assert.equal(caAtual(a),8);assert.equal(a.token,'token-corpo');assert.equal(a.sobreposicaoFicha.fichaOriginal.id,'cemiterio-goblin-1');assert.deepEqual(a.ficha.inventario.itens.map(i=>i.id),ids);assert.ok(a.ficha.inventario.itens.every(i=>!i.equipado));assert.ok(!a.efeitosAtivos);assert.equal(n.atores.find(x=>x.id===origem.id).rec['espaco-3'],2);assert.equal(s.atores[1].pv,0,'entrada não é mutada');
  // Persistência real por JSON, seguida de hidratação das fichas ativas.
  const salvo=JSON.parse(JSON.stringify(compactarEstado(n)));for(const x of salvo.atores)x.ficha=validar(x.ficha);const restaurado=await cmd(salvo,'removerSobreposicaoFicha',{ator:a.id,confirmado:true});const r=restaurado.atores.find(x=>x.id===a.id);assert.equal(r.ficha.id,'cemiterio-goblin-1');assert.equal(r.pv,0);assert.equal(r.estadoVida,'morto');assert.deepEqual(r.ficha.inventario.itens.map(i=>i.id),ids);assert.ok(!r.ficha.inventario.itens.some(i=>i.id===retirado));
  assert.ok(!JSON.stringify(publico(n)).includes('fichaOriginal'));
});
test('humanoide morto recebe sobreposição zumbi, vivo, fera, feérico comum e PJ inconsciente são rejeitados',async()=>{
  const {s,origem,alvo}=mesa('irineu-ladino-3');const n=await reanimar(s,origem,alvo);assert.equal(n.atores[1].ficha.id,'cemiterio-zumbi-reanimado');
  for(const mudar of [a=>{a.pv=1;},a=>{a.ficha.tipoCriatura='fera';},a=>{a.ficha.tipoCriatura='feerico';},a=>{a.ficha.tipo='pj';a.estadoVida='inconsciente';}]){const c=structuredClone(s);mudar(c.atores[1]);await assert.rejects(()=>reanimar(c,c.atores[0],c.atores[1]));}
});
test('reanimação exige mestre, confirmação, espaço e alcance; rejeita segunda camada sem cobrar novamente',async()=>{
  const {s,origem,alvo}=mesa();await assert.rejects(()=>aplicar(s,{rev:s.rev,tipo:'reanimarCorpo',ator:alvo.id,conjuradorId:origem.id,confirmado:true,minutoConcluido:true},{id:'p',role:'PLAYER'},rolar),/mestre/);
  await assert.rejects(()=>reanimar(s,origem,alvo,{confirmado:false}));const sem=structuredClone(s);sem.atores[0].rec['espaco-3']=0;await assert.rejects(()=>reanimar(sem,origem,alvo));const longe=structuredClone(s);longe.atores[1].y=3.1;await assert.rejects(()=>reanimar(longe,origem,alvo));
  const n=await reanimar(s,origem,alvo);n.atores[1].pv=0;await assert.rejects(()=>reanimar(n,n.atores[0],n.atores[1]));assert.equal(n.atores[0].rec['espaco-3'],2);
});
test('saque depois da segunda morte transfere o loot original sem duplicar instância',async()=>{
  const {s,origem,alvo}=mesa();let n=await reanimar(s,origem,alvo);const corpo=n.atores.find(x=>x.id===alvo.id);corpo.pv=0;corpo.estadoVida='morto';const jogador=adicionar(n,validar({...fonte('irineu-ladino-3'),tipo:'pj'}));jogador.x=0;jogador.y=0;
  n=await cmd(n,'usar',{ator:jogador.id,opcao:'saquear',alvo:corpo.id,confirmado:true});const id=corpo.ficha.inventario.itens[0].id,sessao=n.atores.find(x=>x.id===jogador.id).saqueAberto;
  n=await cmd(n,'confirmarSaque',{ator:jogador.id,saqueId:sessao.id,itens:[{itemId:id,quantidade:1}],confirmado:true});assert.equal(n.atores.find(x=>x.id===jogador.id).ficha.inventario.itens.filter(i=>i.id===id).length,1);assert.ok(!n.atores.find(x=>x.id===corpo.id).ficha.inventario.itens.some(i=>i.id===id));
});
test('cura de Vida escala e aplica bônus uma vez; cura real e Bênção debitam espaços',async()=>{
  const s=novo(),p=adicionar(s,validar(fonte('padre-quevedo')));p.pv=1;
  const curar=p.ficha.opcoes.find(x=>x.id==='curar');assert.equal(derivarOpcaoCirculo(p,curar,1).automacao.formula,'2d8+7');assert.equal(derivarOpcaoCirculo(p,curar,3).automacao.formula,'6d8+9');
  let n=await cmd(s,'usar',{ator:p.id,opcao:'curar',alvo:p.id,circulo:1});assert.ok(n.atores[0].pv>=10);assert.equal(n.atores[0].rec['espaco-1'],3);
  n=await cmd(n,'usar',{ator:p.id,opcao:'bencao',alvos:[p.id]});assert.equal(n.atores[0].rec['espaco-1'],2);assert.ok(n.atores[0].bencao);
  n=await cmd(n,'usar',{ator:p.id,opcao:'preservar',alvos:[p.id]});assert.equal(n.atores[0].rec['canalizar-divindade'],1);
});
test('transformação de adaga mantém posse e ID, não acumula antigo dano e consome dose só no altar',async()=>{
  const s=novo(),a=adicionar(s,validar(fonte('seu-furtado-zumbi-4'))),p=adicionar(s,validar(fonte('padre-quevedo'))),i=a.ficha.inventario.itens.find(x=>x.catalogoRef==='item.adaga-do-ultimo-rito'),agua=p.ficha.inventario.itens.find(x=>x.catalogoRef==='item.agua-benta-da-purificacao');
  const args={ator:a.id,itemId:i.id,resultado:'purificada',confirmado:true,ritoConcluido:true,aguaAtorId:p.id,aguaItemId:agua.id};await assert.rejects(()=>cmd(s,'transformarAdagaMissao',args));const n=await cmd(s,'transformarAdagaMissao',{...args,altarOriginal:true});const result=n.atores[0].ficha.inventario.itens.find(x=>x.id===i.id);assert.equal(result.danoExtraAoAcertar.elemento,'radiante');assert.equal(result.danoExtraAoAcertar.formula,'1d4');assert.equal(result.modificadores.ataque,1);assert.ok(!n.atores[1].ficha.inventario.itens.some(x=>x.id===agua.id));assert.equal(n.atores[0].ficha.inventario.itens.filter(x=>x.id===i.id).length,1);await assert.rejects(()=>cmd(n,'transformarAdagaMissao',{...args,resultado:'profanada'}));
});
test('adagas novas derivam ataque +1, dano base sem bônus e parcelas elementais no normal, crítico e arremesso',async()=>{
  for(const elemento of ['radiante','necrotico'])for(const critico of [false,true])for(const arremesso of [false,true]){
    const s=novo(),f=fonte('irineu-ladino-3');f.tipo='pj';f.inventario.itens=[{id:'arma-unica',ref:'item.adaga-sagrada-'+(elemento==='radiante'?'purificada':'profanada')+'-mais-2',quantidade:1,equipado:true,equipadoSlot:'mao_forte'}];f.proficienciasEquipamento.maestrias=[];const a=adicionar(s,validar(f)),b=adicionar(s,validar(fonte('zumbi-padrao-3')));b.x=1;b.y=0;b.ficha.caBase=0;const o=ataquesEquipados(a).find(o=>!o.requisitosUso&&(arremesso?o.automacao.modoArma==='arremesso'||/arremesso/i.test(o.nome):!/arremesso/i.test(o.nome)));assert.ok(o);assert.equal(o.automacao.bonus,6);assert.equal(o.automacao.dano,'1d4+3');let visto;
    const dados=(formula,meta)=>{if(meta.tipo==='dano'){visto=meta;const base=dadoLocal(formula,meta),extra=meta.adicionais?.find(x=>x.automatico);if(extra){const r=dadoLocal(extra.formula,meta);return {...base,resultados:[base,r],total:base.total+r.total,recursosAtivos:[extra.id]};}return base;}if(meta.tipo==='ataque')return {total:critico?26:21,natural:critico?20:15,formula};return dadoLocal(formula,meta);};
    await aplicar(s,{tipo:'usar',rev:s.rev,ator:a.id,opcao:o.id,alvo:b.id,confirmado:true},gm,dados);assert.ok(visto);const extra=visto.adicionais.find(x=>x.automatico);assert.equal(extra.elemento,elemento);assert.equal(extra.formula,critico?'2d4':'1d4');assert.ok(!visto.adicionais.some(x=>x.formula==='1'));
  }
});

test('padre e necromante NPC recuperam seus recursos sem recuperar NPCs comuns',async()=>{
  const s=novo(),p=adicionar(s,validar(fonte('padre-quevedo'))),d=adicionar(s,validar(fonte('drow-necromante-6'))),g=adicionar(s,validar(fonte('goblin-1')));
  p.rec['canalizar-divindade']=0;p.rec['espaco-1']=0;d.rec['espaco-3']=0;p.pv=10;g.pv=1;
  const curto=await cmd(s,'descanso',{periodo:'curto',atores:[p.id,d.id,g.id]});assert.equal(curto.atores[0].rec['canalizar-divindade'],1);assert.equal(curto.atores[0].rec['espaco-1'],0);assert.equal(curto.atores[1].rec['espaco-3'],0);
  const longo=await cmd(curto,'descanso',{periodo:'longo',atores:[p.id,d.id,g.id]});assert.equal(longo.atores[0].rec['canalizar-divindade'],2);assert.equal(longo.atores[0].rec['espaco-1'],4);assert.equal(longo.atores[1].rec['espaco-3'],3);assert.equal(longo.atores[0].pv,38);assert.equal(longo.atores[2].pv,1);
});

test('curas no turno cobram ação/bônus e espaço certo com resultado exato e limite de PV',async()=>{
  for(const [opcao,circulo,formula,economia] of [['curar',1,'2d8+7','acao'],['palavra-curativa',3,'6d4+9','bonus']]){
    const s=novo(),p=adicionar(s,validar(fonte('padre-quevedo'))),alvo=adicionar(s,validar(fonte('irineu-ladino-3')));alvo.pv=1;p.x=alvo.x=0;p.y=alvo.y=0;s.fase='turnos';s.ordem=[p.id,alvo.id];s.vez=0;s.rodada=1;
    let vista;const dados=(f,m)=>{vista=f;return {formula:f,total:opcao==='curar'?9:15};};
    const n=await aplicar(s,{rev:s.rev,tipo:'usar',ator:p.id,opcao,alvo:alvo.id,circuloUsado:circulo},gm,dados);assert.equal(vista,formula);assert.equal(n.atores[1].pv,opcao==='curar'?10:16);assert.equal(n.atores[0][economia],0);assert.equal(n.atores[0].rec['espaco-'+circulo],p.rec['espaco-'+circulo]-1);assert.equal(n.atores[0][economia==='acao'?'bonus':'acao'],1);
    await assert.rejects(()=>cmd(n,'usar',{ator:p.id,opcao,alvo:alvo.id,circuloUsado:circulo}));assert.equal(s.atores[1].pv,1);
  }
});

test('Bênção termina ao trocar de concentração; Escudo da Fé modifica CA e dura 10 minutos',async()=>{
  const s=novo(),p=adicionar(s,validar(fonte('padre-quevedo'))),alvo=adicionar(s,validar(fonte('irineu-ladino-3')));p.x=alvo.x=0;
  let n=await cmd(s,'usar',{ator:p.id,opcao:'bencao',alvos:[p.id,alvo.id]});assert.deepEqual(n.atores[0].bencao.alvos,[p.id,alvo.id]);
  const ca=caAtual(n.atores[1]);n=await cmd(n,'usar',{ator:p.id,opcao:'escudo-fe',alvo:alvo.id});assert.ok(!n.atores[0].bencao);assert.equal(caAtual(n.atores[1]),ca+2);
  for(let i=0;i<10;i++)n=await cmd(n,'avancarTempo',{passo:'1min'});assert.equal(caAtual(n.atores[1]),ca);
});

test('protótipos exigem alvos/componentes antes de consumir recursos; assistido não contorna a validação',async()=>{
  for(const [opcao,recurso] of [['preservar','canalizar-divindade'],['expulsar','canalizar-divindade'],['centelha-dano','canalizar-divindade'],['palavra-massa','espaco-3'],['revivificar','espaco-3']]){
    const s=novo(),p=adicionar(s,validar(fonte('padre-quevedo')));p.pv=7;const antes=JSON.stringify(s);await assert.rejects(()=>cmd(s,'usar',{ator:p.id,opcao,assistido:true}));assert.equal(JSON.stringify(s),antes);
  }
});

test('protótipos de concentração também encerram a Bênção anterior',async()=>{
  for(const opcao of ['detectar','protecao','acalmar']){const s=novo(),p=adicionar(s,validar(fonte('padre-quevedo')));p.ficha.inventario.itens.push({id:'agua-teste',nome:'Água Benta',quantidade:1});let n=await cmd(s,'usar',{ator:p.id,opcao:'bencao',alvos:[p.id]});n=await aplicar(n,{rev:n.rev,tipo:'usar',ator:p.id,opcao,alvo:p.id,alvos:opcao==='acalmar'?[p.id]:undefined},gm,()=>1);assert.ok(!n.atores[0].bencao);assert.ok(n.atores[0].concentracaoAtiva);}
});

test('Chama Sagrada usa CD 15, causa radiante na falha e zero no sucesso',async()=>{
  for(const sucesso of [true,false]){const s=novo(),p=adicionar(s,validar(fonte('padre-quevedo'))),alvo=adicionar(s,validar(fonte('goblin-1')));p.x=alvo.x=0;let cd,formula;
    const dados=(f,m)=>{if(m.tipo==='salvaguarda'){cd=m.cd;return {total:sucesso?15:14,natural:10,formula:f};}formula=f;return {total:6,formula:f};};
    const n=await aplicar(s,{tipo:'usar',rev:s.rev,ator:p.id,opcao:'chama-sagrada',alvo:alvo.id},gm,dados);assert.equal(cd,15);assert.equal(n.atores[1].pv,sucesso?10:4);if(!sucesso)assert.equal(formula,'2d8');assert.deepEqual(n.atores[0].rec,p.rec);
  }
});

test('Centelha cura 1d8+4 sem Discípulo; Poupar estabiliza sem curar ou ressuscitar',async()=>{
  const s=novo(),p=adicionar(s,validar(fonte('padre-quevedo'))),alvo=adicionar(s,validar({...fonte('irineu-ladino-3'),tipo:'pj'}));p.x=alvo.x=0;alvo.pv=1;let formula;
  const n=await aplicar(s,{tipo:'usar',rev:s.rev,ator:p.id,opcao:'centelha',alvo:alvo.id},gm,(f,m)=>{formula=f;return {total:5,formula:f};});assert.equal(formula,'1d8+4');assert.equal(n.atores[1].pv,6);assert.equal(n.atores[0].rec['canalizar-divindade'],1);assert.equal(n.atores[0].rec['espaco-1'],4);
  n.atores[1].pv=0;n.atores[1].estadoVida='inconsciente';const estavel=await cmd(n,'usar',{ator:p.id,opcao:'poupar',alvo:alvo.id});assert.equal(estavel.atores[1].pv,0);assert.equal(estavel.atores[1].estadoVida,'estavel');estavel.atores[1].estadoVida='morto';await assert.rejects(()=>cmd(estavel,'usar',{ator:p.id,opcao:'poupar',alvo:alvo.id}));
});
