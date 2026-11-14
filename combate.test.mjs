import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {novo,adicionar,aplicar,atual,publico,validar,atualizarMagias,caAtual,pvMaximosAtuais,deslocamentoMaximo,bonusIniciativa,restricoesAtivas,temCondicao,dentroDaArea,pesoInventario,opcoesDisponiveis,ordenarOpcoesRodape,slotsOcupadosItem,ataquesEquipados,proficienteComArma,dadoLocal,planoCustoOpcao,usoGratuitoDisponivel,LIMITE_ALCANCE_M} from './site/engine.mjs';
import {TIPOS_DANO,aplicarRelatorioDano,defesasDanoDoAtor,infoTipoDano,normalizarTipoDano,resolverDano} from './site/damage.mjs';
import {visibilidadeRolagem} from './site/roll-visibility.mjs';
const ficha=async name=>JSON.parse(await readFile(new URL('./site/fichas/'+name+'.json',import.meta.url),'utf8'));
const nikki=await ficha('nikki'),soldado=await ficha('soldado');
const catalogoVictor=JSON.parse(await readFile(new URL('./site/catalogo-victor.json',import.meta.url),'utf8'));
const conteudoConfigurado=JSON.parse(await readFile(new URL('./site/conteudo-configurado.json',import.meta.url),'utf8'));
const idsJogadores=['dragoberto','draven-thorne','hannah-montana','loteria','nikki','skimi','zurich'];
const fichasJogadores=await Promise.all(idsJogadores.map(ficha));
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
 const m=mesa();assert.equal(m.a.pv,20);assert.equal(m.a.rec.feiticaria,3);assert.equal(m.b.pv,24);assert.equal(m.b.ficha.caBase,10);assert.equal(caAtual(m.b),16);assert.notEqual(m.b.id,m.c.id);assert.equal(nikki.preparacao.preparadas.length,6);
 assert.equal(publico(m.s).atores[1].ficha.caBase,undefined);
});
test('mestre rola iniciativas selecionadas em um único lote',async()=>{
 let s=novo();const a=adicionar(s,nikki),b=adicionar(s,soldado,'Soldado I'),c=adicionar(s,soldado,'Soldado II');
 s=await aplicar(s,{tipo:'iniciar',rev:s.rev},gm,()=>{throw Error('não deveria rolar ao iniciar');});
 let chamadas=0,metaRecebida;
 s=await aplicar(s,{tipo:'iniciativas',rev:s.rev,atores:[a.id,b.id,c.id]},gm,async(formulas,meta)=>{
   chamadas++;metaRecebida=meta;assert.deepEqual(formulas,['1d20+2','1d20+1','1d20+1']);
   return {resultados:[{total:12,natural:10,formula:formulas[0],resumo:'10 + 2 = 12'},{total:18,natural:17,formula:formulas[1],resumo:'17 + 1 = 18'},{total:7,natural:6,formula:formulas[2],resumo:'6 + 1 = 7'}]};
 });
 assert.equal(chamadas,1);assert.equal(metaRecebida.tipo,'iniciativa_lote');assert.deepEqual(metaRecebida.instancias.map(x=>x.titulo),['Nikki Lauda','Soldado I','Soldado II']);
 assert.deepEqual(s.atores.map(x=>x.init),[12,18,7]);assert.equal(s.fase,'turnos');assert.deepEqual(s.ordem,[b.id,a.id,c.id]);assert.match(s.historico[0],/Nikki Lauda 12.*Soldado I 18.*Soldado II 7/);
});
test('lote parcial mantém a iniciativa aberta e só resolve as fichas escolhidas',async()=>{
 let s=novo();const a=adicionar(s,nikki),b=adicionar(s,soldado,'Soldado I'),c=adicionar(s,soldado,'Soldado II');
 s=await aplicar(s,{tipo:'iniciar',rev:s.rev},gm,()=>0);
 s=await aplicar(s,{tipo:'iniciativas',rev:s.rev,atores:[a.id,c.id]},gm,async formulas=>({resultados:formulas.map((formula,i)=>({total:[15,9][i],natural:[13,8][i],formula,resumo:String([15,9][i])}))}));
 assert.equal(s.fase,'iniciativa');assert.equal(s.atores.find(x=>x.id===a.id).init,15);assert.equal(s.atores.find(x=>x.id===b.id).init,null);assert.equal(s.atores.find(x=>x.id===c.id).init,9);
 s=await aplicar(s,{tipo:'iniciativas',rev:s.rev,atores:[b.id]},gm,async formulas=>({resultados:[{total:11,natural:10,formula:formulas[0],resumo:'11'}]}));
 assert.equal(s.fase,'turnos');assert.deepEqual(s.ordem,[a.id,b.id,c.id]);
});
test('jogador não pode executar o lote de iniciativa do mestre',async()=>{
 let s=novo();const a=adicionar(s,nikki),b=adicionar(s,soldado);s=await aplicar(s,{tipo:'iniciar',rev:s.rev},gm,()=>0);
 await assert.rejects(aplicar(s,{tipo:'iniciativas',rev:s.rev,atores:[a.id,b.id]},player,()=>0),/Somente o mestre/);
});
test('controle do mestre exclui ficha somente durante a preparação',async()=>{
 let s=novo();const a=adicionar(s,nikki),b=adicionar(s,soldado,'Soldado I');
 await assert.rejects(aplicar(s,{tipo:'remover',rev:s.rev,ator:a.id},player,()=>0),/Somente o mestre/);
 s=await aplicar(s,{tipo:'remover',rev:s.rev,ator:b.id},gm,()=>0);assert.deepEqual(s.atores.map(x=>x.id),[a.id]);
 const c=adicionar(s,soldado,'Soldado II');s=await aplicar(s,{tipo:'iniciar',rev:s.rev},gm,()=>0);
 await assert.rejects(aplicar(s,{tipo:'remover',rev:s.rev,ator:c.id},gm,()=>0),/preparação/i);
});
test('as sete fichas salvas já estão normalizadas pelas regras atuais',()=>{
 for(const f of fichasJogadores){
   assert.deepEqual(validar(f),f,f.nome+' ainda dependia de migração em memória');
   assert.ok(f.opcoes.every(o=>(o.automacao?.alcanceM??0)<=LIMITE_ALCANCE_M),f.nome+' excede o alcance do sistema');
   assert.ok(f.inventario.itens.every(i=>Number.isFinite(i.pesoKg)&&i.pesoKg>=0),f.nome+' possui item sem peso');
   const ocupados=new Map();
   for(const item of f.inventario.itens.filter(i=>i.equipado))for(const slot of slotsOcupadosItem(item)){assert.ok(!ocupados.has(slot),f.nome+' possui conflito em '+slot);ocupados.set(slot,item.id);}
 }
});
test('auditoria de nível 3 preserva progressão, perícias e recursos sem custos falsos da conversão',()=>{
 const porId=id=>fichasJogadores.find(f=>f.id===id);
 for(const f of fichasJogadores){assert.equal(f.classes.reduce((n,c)=>n+c.nivel,0),3,f.nome);assert.equal(f.proficiencia,2,f.nome);assert.ok(f.classes[0].subclasse,f.nome+' sem subclasse');}
 assert.equal(porId('loteria').pvMaximos,21);assert.equal(porId('loteria').pericias.Medicina,3);assert.equal(porId('loteria').opcoes.find(o=>o.id==='metabolismo-incomum-acao').automacao.cura,'1d6+3');
 assert.equal(porId('hannah-montana').pericias.Persuasão,7);assert.equal(porId('hannah-montana').pericias.Investigação,4);assert.equal(porId('zurich').pericias.Percepção,6);assert.equal(porId('dragoberto').pericias.Sobrevivência,4);assert.equal(porId('draven-thorne').pericias.Intimidação,1);assert.equal(porId('skimi').pericias.Prestidigitação,4);
 const draven=porId('draven-thorne');assert.ok(draven.opcoes.filter(o=>o.id!=='surto-de-acao-acao').every(o=>!o.custo?.some(c=>c.id==='surto-de-acao')));
 const hannah=porId('hannah-montana');assert.ok(hannah.opcoes.every(o=>!o.custo?.some(c=>c.id==='magia-fascinante')));
 assert.ok(porId('skimi').opcoes.filter(o=>o.id!=='astucia-magica-acao').every(o=>!o.custo?.some(c=>c.id==='astucia-magica')));
 // "Gastar Dado de Vida" (#25) é a única opção legítima que consome o recurso.
 for(const f of fichasJogadores)assert.ok(f.opcoes.every(o=>o.id==='gastar-dado-de-vida'||!o.custo?.some(c=>c.id==='dados-de-vida')),f.nome+' ainda gasta Dado de Vida em uma ação comum');
 const dragoberto=porId('dragoberto'),sopros=dragoberto.opcoes.filter(o=>o.id.startsWith('ataque-de-sopro-'));assert.deepEqual(sopros.map(o=>o.automacao.area.forma).sort(),['cone','linha']);assert.ok(sopros.every(o=>o.automacao.dano==='1d10'&&o.automacao.metade&&o.automacao.cd===11));
 assert.deepEqual(dragoberto.opcoes.filter(o=>o.grupoExclusivo==='presa-do-cacador'&&o.ativa!==false).map(o=>o.id),['habilitado-destruidor-de-hordas-18']);
 assert.deepEqual(porId('zurich').opcoes.filter(o=>o.grupoExclusivo==='presa-do-cacador'&&o.ativa!==false).map(o=>o.id),['assassino-de-colossos-18']);
});
test('Pau pra Toda Obra melhora iniciativa e as defesas do Monge dependem de estar sem armadura',()=>{
 const s=novo(),h=adicionar(s,fichasJogadores.find(f=>f.id==='hannah-montana')),l=adicionar(s,fichasJogadores.find(f=>f.id==='loteria'));
 assert.equal(bonusIniciativa(h),3);assert.equal(caAtual(l),14);assert.equal(deslocamentoMaximo(l),12);
 l.ficha.inventario.itens.push({id:'couro-teste',nome:'Armadura de Couro',tipo:'equipamento',quantidade:1,pesoKg:5,slotEquipamento:'vestes',equipado:true,equipadoSlot:'vestes',categoriaArmadura:'leve',classeArmadura:{tipo:'base',valor:11,classe:'leve',atributo:'des'}});
 assert.equal(caAtual(l),14);assert.equal(deslocamentoMaximo(l),9);
});
test('usos gratuitos pertencem à habilidade, são exclusivos na aba e precedem o custo normal',async()=>{
 const porId=id=>fichasJogadores.find(f=>f.id===id),hannah=porId('hannah-montana'),zurich=porId('zurich'),dragoberto=porId('dragoberto'),n=porId('nikki');
 const configuradas=[
  [hannah,'1-passos-largos-elfo-31','passos-largos-da-linhagem'],
  [zurich,'1-marca-do-predador-sempre-concentracao-27','marca-do-predador'],
  [zurich,'1-palavra-curativa-iniciado-31','palavra-curativa-do-talento'],
  [zurich,'1-passos-largos-elfo-32','passos-largos-da-linhagem'],
  [dragoberto,'1-marca-do-predador-25','marca-do-predador'],
  [n,'af0ac3c8-7d39-5ef0-97e9-25839f116262','repreensao']
 ];
 for(const [f,id,recurso] of configuradas){const o=f.opcoes.find(x=>x.id===id);assert.equal(o.usoGratuito.recursoId,recurso);assert.ok(o.custo.some(c=>c.id==='espaco-1'),'o custo normal deve continuar disponível em '+id);}
 let s=novo(),a=adicionar(s,hannah),o=a.ficha.opcoes.find(x=>x.id==='1-passos-largos-elfo-31');
 assert.equal(usoGratuitoDisponivel(a,o),true);assert.equal(planoCustoOpcao(a,o).gratuito,true);assert.equal(planoCustoOpcao(a,o,'normal').gratuito,false);
 s=await aplicar(s,{tipo:'usar',rev:s.rev,ator:a.id,opcao:o.id,alvo:a.id,confirmado:true,modoCusto:'automatico'},gm,async()=>1);
 a=s.atores[0];assert.equal(a.rec['passos-largos-da-linhagem'],0);assert.equal(a.rec['espaco-1'],4);assert.equal(usoGratuitoDisponivel(a,o),false);
 s=await aplicar(s,{tipo:'usar',rev:s.rev,ator:a.id,opcao:o.id,alvo:a.id,confirmado:true,modoCusto:'automatico'},gm,async()=>1);
 a=s.atores[0];assert.equal(a.rec['espaco-1'],3);
 await assert.rejects(aplicar(s,{tipo:'usar',rev:s.rev,ator:a.id,opcao:o.id,alvo:a.id,confirmado:true,modoCusto:'gratuito'},gm,async()=>1),/Saldo insuficiente/);
 assert.equal(s.atores[0].rec['espaco-1'],3,'a aba gratuita não pode cair silenciosamente no custo normal');
});
test('rolagens públicas preservam edição do dono e GM e resumem iniciativa e salvaguardas para observadores',()=>{
 const ajuste={tipo:'ajuste',pedido:'r1',destino:'p',formula:'1d20+4',meta:{tipo:'ataque',titulo:'Ataque'}},resultado={...ajuste,tipo:'resultado',resultado:{total:17},status:'Acerto'};
 assert.equal(visibilidadeRolagem(ajuste,{id:'m',role:'GM'}).pedido.podeEditar,true);
 assert.equal(visibilidadeRolagem(ajuste,{id:'p',role:'PLAYER'}).pedido.podeEditar,true);
 assert.equal(visibilidadeRolagem(ajuste,{id:'q',role:'PLAYER'}).pedido.podeEditar,false);
 const salva={...ajuste,meta:{tipo:'salvaguarda',titulo:'Salvaguarda de DES'}};
 assert.equal(visibilidadeRolagem(salva,{id:'q',role:'PLAYER'}).tipo,'ignorar');
 assert.equal(visibilidadeRolagem({...salva,tipo:'resultado',resultado:{total:15},status:'Sucesso'},{id:'q',role:'PLAYER'}).tipo,'anuncio');
 assert.equal(visibilidadeRolagem({...resultado,meta:{tipo:'iniciativa'}},{id:'q',role:'PLAYER'}).tipo,'anuncio');
 assert.equal(visibilidadeRolagem({tipo:'fechar',pedido:'r1'},{id:'q',role:'PLAYER'}).tipo,'fechar');
});
test('salvaguardas automáticas são encaminhadas ao dono da ficha e continuam disponíveis ao GM',async()=>{
 let s=novo();const atacante=adicionar(s,soldado,'Soldado'),alvo=adicionar(s,nikki);alvo.dono='p';alvo.concentracaoAtiva={id:'concentracao',nome:'Concentração'};
 const ataque=atacante.ficha.opcoes.find(o=>o.automacao?.tipo==='ataque'),metas=[];
 await aplicar(s,{tipo:'usar',rev:s.rev,ator:atacante.id,opcao:ataque.id,alvo:alvo.id},gm,async(formula,meta)=>{
   metas.push(meta);
   if(meta.tipo==='ataque')return {total:18,natural:16,formula,resumo:'16 + 2 = 18'};
   if(meta.tipo==='dano')return {total:4,natural:null,formula,resumo:'4'};
   return {total:12,natural:10,formula,resumo:'10 + 2 = 12'};
 });
 const salva=metas.find(x=>x.tipo==='salvaguarda');assert.equal(salva.destinoId,'p');assert.equal(salva.roladorNome,'Nikki Lauda');assert.match(salva.titulo,/Concentração/);
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
 const fogo=nikki.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao);m.s.atores[0].x=-3; // à distância, sem inimigo colado (#8)
 await m.go('usar',{ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player,[15,7]);
 assert.equal(m.s.atores[1].pv,17);assert.equal(m.s.atores[2].pv,24);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player),/Saldo/);
 await m.go('passar',{ator:m.a.id},player);m.s.atores[0].x=0;
 await m.go('usar',{ator:m.b.id,opcao:soldado.opcoes.find(o=>o.automacao?.tipo==='ataque').id,alvo:m.a.id},gm,[12,5]);
 assert.equal(m.s.atores[0].pv,15);
});
test('salva por alvo e um dano compartilhado, círculo gasto, resistência e crítico',async()=>{
 const m=mesa();await m.iniciar();const sh=nikki.opcoes.find(o=>o.automacao?.raioM);
 await m.go('usar',{ator:m.a.id,opcao:sh.id,ponto:{x:1,y:0}},player,[12,19,1,18]);
 assert.deepEqual(m.s.atores.map(a=>a.pv),[14,12,18]);assert.equal(m.s.atores[0].rec['espaco-2'],1);
 const second=mesa();await second.iniciar();let formulas=[];
 const hit=nikki.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao);second.s.atores[0].x=-3;
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
 const opcao=validar(f).opcoes.find(o=>o.id==='teste');
 assert.equal(opcao.automacao.dano,'2d10');assert.equal(opcao.automacao.alcanceM,18);assert.equal(opcao.selecao.alcanceM,18);
});
test('alcances acima de 18 m são limitados sem reduzir o raio da área',()=>{
 const f=structuredClone(nikki);
 f.opcoes.push({id:'area-longa',nome:'Área longa',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'salva',atributo:'des',cd:13,alcanceM:45,raioM:6,dano:'2d6'},descricao:'Ação · 45 m · esfera de 6 m.'});
 const o=validar(f).opcoes.find(x=>x.id==='area-longa');
 assert.equal(o.automacao.alcanceM,18);assert.equal(o.automacao.raioM,6);assert.match(o.descricao,/18 m/);
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
 m.a.ficha.preparacao.semprePreparadas.push('bencao-teste');
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
 await m.iniciar();m.s.atores[0].x=-3;
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
 const m=mesa();await m.iniciar();const fogo=m.a.ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao);m.s.atores[0].x=-3;
 await m.go('usar',{ator:m.a.id,opcao:fogo.id,alvo:m.b.id,dadosAjuste:['1d4'],ajuste:0},player,[10,2,7]);
 assert.equal(m.s.atores[1].pv,17);assert.match(m.s.historico[0],/total 17/);
});
test('ataque de oportunidade pausa e interrompe o movimento no ponto do acerto',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[2].x=8;
 await m.go('mover',{ator:m.a.id,x:4,y:0},player);
 assert.equal(m.s.atores[0].x,0);assert.equal(m.s.reacaoPendente.alvo,m.a.id);assert.equal(m.s.reacaoPendente.reator,m.b.id);
 const opcao=m.b.ficha.opcoes.find(o=>o.gatilho==='sair_alcance');
 await m.go('resolverReacao',{ator:m.b.id,opcao:opcao.id,modo:'normal',ajuste:0,dadosAjuste:[]},gm,[15,5]);
 assert.equal(m.s.reacaoPendente.gatilho,'sofrer_dano');await m.go('resolverReacao',{ator:m.a.id,opcao:null},player);
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

test('Armadura Arcana: CA 12 sem armadura (#9), aplica +2 fora de combate e termina no descanso longo',async()=>{
 const m=mesa(),o=m.a.ficha.opcoes.find(o=>o.nome.includes('Armadura Arcana'));
 assert.equal(m.a.ficha.caBase,12);assert.equal(o.automacao.tipo,'efeito');assert.equal(caAtual(m.a),12);
 await m.go('vincular',{ator:m.a.id,dono:'p'});const espacos=m.a.rec['espaco-1'];
 await m.go('usar',{ator:m.a.id,opcao:o.id,alvo:m.a.id},player);
 assert.equal(m.s.atores[0].acao,1);assert.equal(m.s.atores[0].rec['espaco-1'],espacos-1);assert.equal(caAtual(m.s.atores[0]),15);
 assert.equal(m.s.atores[0].efeitosAtivos[0].modificadores.ca,3);assert.equal(m.s.atores[0].efeitosAtivos[0].removeEm,'descanso_longo');
 await m.go('descanso',{periodo:'curto'});assert.equal(caAtual(m.s.atores[0]),15);
 await m.go('descanso',{periodo:'longo'});assert.equal(caAtual(m.s.atores[0]),12);assert.equal(m.s.atores[0].efeitosAtivos.length,0);
});

test('Armadura Arcana rejeita alvo com armadura sem gastar o espaço',async()=>{
 const m=mesa(),o=m.a.ficha.opcoes.find(o=>o.nome.includes('Armadura Arcana')),antes=structuredClone(m.s);
 await m.go('vincular',{ator:m.a.id,dono:'p'});
 const estado=structuredClone(m.s);await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,alvo:m.b.id},player),/usando armadura/);assert.deepEqual(m.s,estado);assert.notDeepEqual(m.s,antes);
});
test('Armadura Arcana aceita veste comum, mas escudo e armaduras leve, média ou pesada bloqueiam',async()=>{
 const preparar=(categoria,nome='Veste de viagem')=>{const m=mesa(),o=m.a.ficha.opcoes.find(o=>o.nome.includes('Armadura Arcana'));m.b.ficha.inventario.itens=m.b.ficha.inventario.itens.map(i=>({...i,equipado:false,equipadoSlot:undefined}));m.b.ficha.inventario.itens.push({id:'proteção-teste',nome,descricao:'',tipo:'equipamento',quantidade:1,pesoKg:1,slotEquipamento:categoria==='escudo'?'mao_fraca':'vestes',equipado:true,equipadoSlot:categoria==='escudo'?'mao_fraca':'vestes',categoriaArmadura:categoria,classeArmadura:{tipo:categoria==='escudo'?'bonus':'base',valor:categoria==='veste'?10:12,classe:categoria}});return {m,o};};
 const comum=preparar('veste');await comum.m.go('vincular',{ator:comum.m.a.id,dono:'p'});await comum.m.go('usar',{ator:comum.m.a.id,opcao:comum.o.id,alvo:comum.m.b.id},player);assert.equal(comum.m.s.atores[1].efeitosAtivos.at(-1).nome,'Armadura Arcana');
 for(const categoria of ['leve','media','pesada','escudo']){const {m,o}=preparar(categoria,categoria==='escudo'?'Escudo':'Armadura '+categoria);await m.go('vincular',{ator:m.a.id,dono:'p'});await assert.rejects(m.go('usar',{ator:m.a.id,opcao:o.id,alvo:m.b.id},player),/usando armadura/);}
});

test('ações e magias ficam liberadas fora de combate sem consumir a economia de turno',async()=>{
 const m=mesa();await m.go('vincular',{ator:m.a.id,dono:'p'});
 const adaga=m.a.ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe),misseis=m.a.ficha.opcoes.find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe),espacos=m.a.rec['espaco-1'];
 m.s.atores[0].acao=0;m.s.atores[0].bonus=0;m.s.atores[0].reacao=0;
 await m.go('usar',{ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,[15,3]);
 assert.equal(m.s.atores[0].acao,0);assert.equal(m.s.atores[0].bonus,0);assert.equal(m.s.atores[0].reacao,0);assert.equal(m.s.atores[1].pv,21);
 await m.go('usar',{ator:m.a.id,opcao:misseis.id,alvos:[m.b.id,m.b.id,m.c.id]},player,[2,2,2]);
 assert.equal(m.s.atores[0].acao,0);assert.equal(m.s.atores[0].rec['espaco-1'],espacos-1);
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
 const m=mesa();await m.iniciar();const fogo=m.a.ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao),chamadas=[];m.s.atores[0].x=-3;
 const rolar=async(formula,meta)=>{chamadas.push({formula,meta});return chamadas.length===1?{total:27,natural:20,formula,resumo:'20+7=27'}:{total:14,natural:null,formula,resumo:'14'};};
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:fogo.id,alvo:m.b.id,modo:'vantagem',ajuste:2,dadosAjuste:['1d4']},player,rolar);
 assert.equal(chamadas.length,2);assert.equal(chamadas[0].formula,'2d20kh1+7+1d4');assert.equal(chamadas[0].meta.cd,16);
 assert.equal(chamadas[1].formula,'2d10');assert.equal(chamadas[1].meta.critico,true);assert.equal(s.atores[1].pv,10);assert.equal(s.atores[0].acao,0);
});

test('ataque que falha também confirma o custo da ação',async()=>{
 const m=mesa();await m.iniciar();const fogo=m.a.ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao),chamadas=[];m.s.atores[0].x=-3;
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player,async(formula,meta)=>{chamadas.push({formula,meta});return {total:9,natural:4,formula,resumo:'4+5=9'};});
 assert.equal(chamadas.length,1);assert.equal(s.atores[0].acao,0);assert.equal(s.atores[1].pv,24);assert.match(s.historico[0],/errou/);
});

test('armas arremessáveis recebem ações próprias e desvantagem após o alcance normal',async()=>{
 const m=mesa(),variantes=opcoesDisponiveis(m.a).filter(o=>o.geradaPorItem&&o.automacao.arremesso);
 assert.equal(variantes.length,2);assert.deepEqual(variantes.map(o=>o.automacao.alcanceNormalM),[6,6]);assert.ok(variantes.every(o=>o.automacao.alcanceM===18));
 await m.iniciar();m.s.atores[1].x=10;const adaga=variantes[0],formulas=[];
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,async f=>{formulas.push(f);return {total:9,natural:4,formula:f,resumo:'4+5=9'};});
 assert.equal(formulas[0],'2d20kl1+4');assert.equal(s.atores[0].acao,0);assert.match(s.historico[0],/errou/);
});

test('nova concentração encerra a anterior e remove seus efeitos de todos os alvos',async()=>{
 const m=mesa();
 m.a.ficha.opcoes.push(
  {id:'concentracao-a',nome:'Concentração A',categoria:'magia',concentracao:true,custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'efeito',alcanceM:18,efeito:{nome:'Imobilizado A',tipo:'condicao',condicao:'imobilizado',duracao:{turnos:10,expira:'inicio_origem'}}}},
  {id:'concentracao-b',nome:'Concentração B',categoria:'magia',concentracao:true,custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'efeito',alcanceM:18,efeito:{nome:'Imobilizado B',tipo:'condicao',condicao:'imobilizado',duracao:{turnos:10,expira:'inicio_origem'}}}}
 );
 await m.go('vincular',{ator:m.a.id,dono:'p'});
 await m.go('usar',{ator:m.a.id,opcao:'concentracao-a',alvo:m.b.id},player);const primeira=m.s.atores[0].concentracaoAtiva.id;
 assert.ok(temCondicao(m.s.atores[1],'imobilizado'));assert.equal(m.s.atores[1].efeitosAtivos[0].concentracaoId,primeira);
 await m.go('usar',{ator:m.a.id,opcao:'concentracao-b',alvo:m.c.id},player);
 assert.notEqual(m.s.atores[0].concentracaoAtiva.id,primeira);assert.equal(m.s.atores[1].efeitosAtivos.length,0);assert.ok(temCondicao(m.s.atores[2],'imobilizado'));
 await m.go('encerrarConcentracao',{ator:m.a.id},player);assert.equal(m.s.atores[0].concentracaoAtiva,undefined);assert.equal(m.s.atores[2].efeitosAtivos.length,0);
});

test('dano pede salvaguarda de concentração e remove efeito vinculado na falha',async()=>{
 const m=mesa();
 m.a.ficha.opcoes.push({id:'concentracao-dano',nome:'Concentração de teste',categoria:'magia',concentracao:true,custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'efeito',alcanceM:18,efeito:{nome:'Alvo preso',tipo:'condicao',condicao:'imobilizado',duracao:{turnos:10,expira:'inicio_origem'}}}});
 await m.go('vincular',{ator:m.a.id,dono:'p'});
 await m.go('usar',{ator:m.a.id,opcao:'concentracao-dano',alvo:m.b.id},player);await m.iniciar();await m.go('passar',{ator:m.a.id},player);await m.go('passar',{ator:m.b.id},gm);
 m.s.atores[2].x=1;const ataque=m.c.ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');await m.go('usar',{ator:m.c.id,opcao:ataque.id,alvo:m.a.id},gm,[15,5,4]);
 assert.equal(m.s.atores[0].concentracaoAtiva,undefined);assert.equal(m.s.atores[1].efeitosAtivos.length,0);assert.match(m.s.historico[1],/perdeu a concentração/);
});

test('duração expira no evento configurado e condições alimentam restrições genéricas',async()=>{
 const m=mesa();
 m.a.ficha.opcoes.push({id:'efeito-curto',nome:'Efeito curto',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'efeito',alcanceM:18,efeito:{nome:'Imobilizado',tipo:'condicao',condicao:'imobilizado',duracao:{turnos:1,expira:'fim_origem'}}}});
 await m.go('vincular',{ator:m.a.id,dono:'p'});
 await m.go('usar',{ator:m.a.id,opcao:'efeito-curto',alvo:m.b.id},player);assert.deepEqual(restricoesAtivas(m.s.atores[1]).desvantagemSalvas,['des']);
 await m.iniciar();assert.ok(temCondicao(m.s.atores[1],'imobilizado'));await m.go('passar',{ator:m.a.id},player);assert.equal(m.s.atores[1].efeitosAtivos.length,0);
});

test('salvaguarda falha automaticamente quando a condição determina',async()=>{
 const m=mesa();m.b.efeitosAtivos=[{id:'atordoado',nome:'Atordoado',tipo:'condicao',condicao:'atordoado'}];let rolou=false;
 const s=await aplicar(m.s,{tipo:'teste',rev:m.s.rev,ator:m.b.id,grupo:'salvaguardas',chave:'for'},gm,async()=>{rolou=true;return 20;});
 assert.equal(rolou,false);assert.match(s.historico[0],/falha automática/);
});

test('condições alteram vantagem de ataques e crítico corpo a corpo',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[1].x=10;m.s.atores[1].efeitosAtivos=[{id:'paralisado',nome:'Paralisado',tipo:'condicao',condicao:'paralisado'}];
 const fogo=m.s.atores[0].ficha.opcoes.find(o=>o.nome.includes('Raio de Fogo')&&o.automacao),formulas=[];
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:fogo.id,alvo:m.b.id},player,async(formula,meta)=>{formulas.push({formula,meta});return formulas.length===1?{total:19,natural:14,formula,resumo:'19'}:{total:8,natural:null,formula,resumo:'8'};});
 assert.equal(formulas[0].formula,'2d20kh1+5');assert.equal(formulas[1].formula,'1d10');assert.equal(s.atores[1].pv,16);
 const corpo=mesa();await corpo.iniciar();corpo.s.atores[1].efeitosAtivos=[{id:'paralisado',nome:'Paralisado',tipo:'condicao',condicao:'paralisado'}];
 const adaga=corpo.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe),usadas=[];
 await aplicar(corpo.s,{tipo:'usar',rev:corpo.s.rev,ator:corpo.a.id,opcao:adaga.id,alvo:corpo.b.id},player,async(formula,meta)=>{usadas.push({formula,meta});return usadas.length===1?{total:19,natural:15,formula,resumo:'19'}:{total:6,natural:null,formula,resumo:'6'};});
 assert.equal(usadas[0].formula,'2d20kh1+4');assert.equal(usadas[1].formula,'2d4+2');assert.equal(usadas[1].meta.critico,true);
});

test('cura respeita PV máximo e remove o estado inconsciente',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'cura-teste',nome:'Cura de teste',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'cura',alcanceM:18,formula:'1d8+3'}});await m.go('vincular',{ator:m.a.id,dono:'p'});
 m.s.atores[1].pv=0;m.s.atores[1].estadoVida='inconsciente';m.s.atores[1].salvaguardasMorte={sucessos:1,falhas:2};
 await m.go('usar',{ator:m.a.id,opcao:'cura-teste',alvo:m.b.id},player,[9]);assert.equal(m.s.atores[1].pv,9);assert.equal(m.s.atores[1].estadoVida,'consciente');assert.deepEqual(m.s.atores[1].salvaguardasMorte,{sucessos:0,falhas:0});
 m.s.atores[1].pv=22;await m.go('usar',{ator:m.a.id,opcao:'cura-teste',alvo:m.b.id},player,[9]);assert.equal(m.s.atores[1].pv,24);
});

test('PV temporários conservam o maior valor e absorvem dano antes dos PV',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'temp-oito',nome:'PV temporários 8',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'pv_temporario',alcanceM:18,valor:8}},{id:'temp-cinco',nome:'PV temporários 5',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'pv_temporario',alcanceM:18,valor:5}});await m.go('vincular',{ator:m.a.id,dono:'p'});
 await m.go('usar',{ator:m.a.id,opcao:'temp-oito',alvo:m.b.id},player);await m.go('usar',{ator:m.a.id,opcao:'temp-cinco',alvo:m.b.id},player);assert.equal(m.s.atores[1].pvTemporarios,8);
 await m.go('ajustar',{ator:m.b.id,campo:'pv',valor:-10});assert.equal(m.s.atores[1].pvTemporarios,0);assert.equal(m.s.atores[1].pv,22);
});

test('redução a 0 PV, salvaguarda contra a morte e 20 natural recuperando 1 PV',async()=>{
 const m=mesa();await m.iniciar();await m.go('ajustar',{ator:m.a.id,campo:'pv',valor:-20,confirmado:true});assert.equal(m.s.atores[0].pv,0);assert.equal(m.s.atores[0].estadoVida,'inconsciente');
 await m.go('salvaguardaMorte',{ator:m.a.id},player,[20]);assert.equal(m.s.atores[0].pv,1);assert.equal(m.s.atores[0].estadoVida,'consciente');assert.match(m.s.historico[0],/20 natural/);
});

test('dano massivo mata e estabilizar encerra salvaguardas contra a morte',async()=>{
 const m=mesa();await m.go('ajustar',{ator:m.b.id,campo:'pv',valor:-50});assert.equal(m.s.atores[1].estadoVida,'morto');
 const outro=mesa();outro.a.ficha.opcoes.push({id:'estabilizar',nome:'Estabilizar',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'estabilizar',alcanceM:1.5}});await outro.go('vincular',{ator:outro.a.id,dono:'p'});outro.s.atores[1].pv=0;outro.s.atores[1].estadoVida='inconsciente';outro.s.atores[1].salvaguardasMorte={sucessos:1,falhas:2};
 await outro.go('usar',{ator:outro.a.id,opcao:'estabilizar',alvo:outro.b.id},player);assert.equal(outro.s.atores[1].estadoVida,'estavel');assert.deepEqual(outro.s.atores[1].salvaguardasMorte,{sucessos:0,falhas:0});
});

test('estado inconsciente concede vantagem e ataques corpo a corpo causam duas falhas',async()=>{
 const m=mesa();await m.iniciar();m.s.atores[1].pv=0;m.s.atores[1].estadoVida='inconsciente';m.s.atores[1].salvaguardasMorte={sucessos:0,falhas:0};
 const adaga=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe),formulas=[];
 const s=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:adaga.id,alvo:m.b.id},player,async(formula,meta)=>{formulas.push({formula,meta});return formulas.length===1?{total:19,natural:15,formula,resumo:'19'}:{total:4,natural:null,formula,resumo:'4'};});
 assert.equal(formulas[0].formula,'2d20kh1+4');assert.equal(formulas[1].formula,'2d4+2');assert.equal(s.atores[1].salvaguardasMorte.falhas,2);
});
test('aprimoramento após acerto entra no ajuste de dano e só então gasta o recurso',async()=>{
 const m=mesa();m.a.ficha.recursos.push({id:'superioridade',nome:'Dados de Superioridade',maximo:4,saldoInicial:4});m.a.rec.superioridade=4;
 m.a.ficha.opcoes.push({id:'ataque-ameacador',nome:'Ataque Ameaçador',categoria:'acao',descricao:'Após acertar, some 1d8 e force salva de SAB.',gatilho:'apos_acerto',umaVezPorTurno:true,custo:[{tipo:'recurso',id:'superioridade',quantidade:1}],aprimoramento:{dano:'1d8',elemento:'perfurante',requisitos:{tagsAtaque:['arma']},salva:{atributo:'sab',cd:13,efeitoFalha:{nome:'Amedrontado',condicao:'amedrontado',turnos:1,expira:'fim_origem'}}}});
 await m.iniciar();const ataque=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe),chamadas=[];
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player,async(formula,meta)=>{
   chamadas.push({formula,meta});if(meta.tipo==='ataque')return {total:17,natural:15,formula,resumo:'15 + 2 = 17'};
   if(meta.tipo==='dano'){assert.equal(meta.adicionais[0].id,'ataque-ameacador');return {total:11,natural:null,formula,resumo:'dano',resultados:[{total:6,resumo:'1d8 = 6'},{total:5,resumo:'1d8 = 5'}],recursosAtivos:['ataque-ameacador'],rerrolagensUsadas:[]};}
   return {total:9,natural:7,formula,resumo:'7 + 2 = 9'};
 });
 assert.equal(next.atores[0].rec.superioridade,3);assert.equal(next.atores[1].pv,13);assert.equal(next.atores[1].efeitosAtivos.at(-1).condicao,'amedrontado');assert.equal(next.atores[0].usosTurno['ataque-ameacador'],true);
 assert.deepEqual(chamadas.map(x=>x.meta.tipo),['ataque','dano','salvaguarda']);
});
test('ignorar aprimoramento preserva o recurso e crítico prepara seu dado adicional',async()=>{
 const m=mesa();m.a.ficha.recursos.push({id:'superioridade',nome:'Dados de Superioridade',maximo:4,saldoInicial:4});m.a.rec.superioridade=4;
 m.a.ficha.opcoes.push({id:'manobra',nome:'Manobra',categoria:'acao',gatilho:'apos_acerto',custo:[{tipo:'recurso',id:'superioridade',quantidade:1}],aprimoramento:{dano:'1d8',elemento:'perfurante'}});
 await m.iniciar();const ataque=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe);
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player,async(formula,meta)=>{
   if(meta.tipo==='ataque')return {total:20,natural:20,formula,resumo:'20'};
   assert.equal(meta.adicionais[0].formula,'2d8');return {total:7,natural:null,formula,resumo:'2d8 = 7',recursosAtivos:[],rerrolagensUsadas:[]};
 });
 assert.equal(next.atores[0].rec.superioridade,4);assert.equal(next.atores[1].pv,17);
});
test('recurso de rerrolagem é oferecido no resultado e cobrado quando usado',async()=>{
 const m=mesa();m.a.ficha.recursos.push({id:'sorte',nome:'Sorte',maximo:2,saldoInicial:2});m.a.rec.sorte=2;
 m.a.ficha.opcoes.push({id:'rerrolar-dano',nome:'Sorte no Dano',categoria:'acao',descricao:'Rerrole o dano.',gatilho:'apos_rolagem_dano',custo:[{tipo:'recurso',id:'sorte',quantidade:1}],rerrolagem:{tipo:'dano',modo:'todos'}});
 await m.iniciar();const ataque=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe);
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player,async(formula,meta)=>{
   if(meta.tipo==='ataque')return {total:17,natural:15,formula,resumo:'17'};
   assert.equal(meta.rerrolagens[0].id,'rerrolar-dano');return {total:8,natural:null,formula,resumo:'1d8 = 8',recursosAtivos:[],rerrolagensUsadas:['rerrolar-dano']};
 });
 assert.equal(next.atores[0].rec.sorte,1);assert.equal(next.atores[1].pv,16);
});
test('segundo golpe exige ataque anterior e respeita limite de uma vez por turno',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'segunda-arma',nome:'Segunda arma',categoria:'acao',custo:[{tipo:'bonus',quantidade:1}],requisitosUso:{aposAtaque:true,tagsAtaqueAnterior:['arma'],umaVezPorTurno:'segunda-arma'},automacao:{tipo:'ataque',bonus:4,dano:'1d4',elemento:'perfurante',alcanceM:1.5}});
 await m.iniciar();await assert.rejects(m.go('usar',{ator:m.a.id,opcao:'segunda-arma',alvo:m.b.id},player),/depois de realizar/);
 const principal=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe);await m.go('usar',{ator:m.a.id,opcao:principal.id,alvo:m.b.id},player,[15,5]);
 await m.go('usar',{ator:m.a.id,opcao:'segunda-arma',alvo:m.b.id},player,[15,3]);assert.equal(m.s.atores[0].bonus,0);assert.equal(m.s.atores[1].pv,16);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:'segunda-arma',alvo:m.b.id},player),/já foi usada|Saldo insuficiente/);
});
test('sequência resolve armas diferentes contra dois alvos pagando uma única ação',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'duas-armas',nome:'Cimitarra + Espada',categoria:'acao',custo:[{tipo:'acao',quantidade:1}],selecao:{tipo:'alvos',min:2,max:2,repetirAlvo:true},automacao:{tipo:'ataque',bonus:5,dano:'1d6+3',elemento:'cortante',alcanceM:1.5,ataques:[{bonus:5,dano:'1d6+3',elemento:'cortante',alcanceM:1.5,tags:['arma']},{bonus:5,dano:'1d6',elemento:'perfurante',alcanceM:1.5,tags:['arma']}]}});
 m.c.x=1.4;
 await m.iniciar();await m.go('usar',{ator:m.a.id,opcao:'duas-armas',alvos:[m.b.id,m.c.id]},player,[15,14,9,4]);
 assert.deepEqual(m.s.atores.map(a=>a.pv),[20,15,20]);assert.equal(m.s.atores[0].acao,0);assert.equal(m.s.atores[0].eventosTurno.ataques.length,2);assert.equal(m.s.atores[0].eventosTurno.acertos.length,2);
});
test('segundo alvo condicionado precisa ser diferente e próximo do primeiro',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'horda',nome:'Destruidor de Hordas',categoria:'acao',requisitosUso:{aposAtaque:true,tagsAtaqueAnterior:['arma'],umaVezPorTurno:'horda',alvoDiferenteDoAnterior:true,distanciaDoAlvoAnteriorM:1.5},automacao:{tipo:'ataque',bonus:4,dano:'1d6',elemento:'perfurante',alcanceM:18}});
 await m.iniciar();const principal=m.s.atores[0].ficha.opcoes.find(o=>o.nome.startsWith('Adaga +4')&&!o.varianteArremessoDe);await m.go('usar',{ator:m.a.id,opcao:principal.id,alvo:m.b.id},player,[15,5]);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:'horda',alvo:m.b.id},player),/diferente/);m.s.atores[2].x=2.4;
 await m.go('usar',{ator:m.a.id,opcao:'horda',alvo:m.c.id},player,[15,15,4]); // à distância com inimigo colado: Desvantagem (#8)assert.equal(m.s.atores[2].pv,20);
});
test('reação genérica ao sofrer dano pausa a mesa, usa o controlador correto e retoma depois',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'repreensao-teste',nome:'Repreensão Diabólica',categoria:'magia',gatilho:'sofrer_dano',descricao:'Quando sofrer dano de uma criatura visível, reaja com fogo infernal.',custo:[{tipo:'reacao',quantidade:1},{tipo:'recurso',id:'espaco-1',quantidade:1}],automacao:{tipo:'salva',atributo:'des',cd:13,dano:'2d10',metade:true,elemento:'fogo',alcanceM:18}});
 await m.iniciar();await m.go('passar',{ator:m.a.id},player);const ataque=m.s.atores[1].ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');
 await m.go('usar',{ator:m.b.id,opcao:ataque.id,alvo:m.a.id},gm,[15,5]);assert.equal(m.s.atores[0].pv,15);assert.equal(m.s.reacaoPendente.gatilho,'sofrer_dano');assert.equal(m.s.reacaoPendente.reator,m.a.id);assert.equal(m.s.reacaoPendente.alvo,m.b.id);
 await assert.rejects(m.go('passar',{ator:m.b.id},gm),/reação pendente/);
 await m.go('resolverReacao',{ator:m.a.id,opcao:'repreensao-teste'},player,[10,8]);assert.equal(m.s.atores[1].pv,16);assert.equal(m.s.atores[0].reacao,0);assert.equal(m.s.atores[0].rec['espaco-1'],3);assert.equal(m.s.reacaoPendente,undefined);
});
test('fila de reações apresenta em ordem todos os alvos que sofreram dano',async()=>{
 const m=mesa(),reacao={id:'resposta-dano',nome:'Resposta ao dano',categoria:'acao',gatilho:'sofrer_dano',custo:[{tipo:'reacao',quantidade:1}],automacao:{tipo:'ataque',bonus:4,dano:'1d6',elemento:'perfurante',alcanceM:18}};m.b.ficha.opcoes.push(reacao);m.c.ficha.opcoes.push(structuredClone(reacao));
 await m.iniciar();const area=m.a.ficha.opcoes.find(o=>o.automacao?.raioM);await m.go('usar',{ator:m.a.id,opcao:area.id,ponto:{x:1,y:0}},player,[12,12,12,6]);
 const primeiro=m.s.reacaoPendente.reator;assert.equal(m.s.filaReacoes.length,1);await m.go('resolverReacao',{ator:primeiro,opcao:null},gm);assert.notEqual(m.s.reacaoPendente.reator,primeiro);assert.equal(m.s.filaReacoes.length,0);
 await m.go('resolverReacao',{ator:m.s.reacaoPendente.reator,opcao:null},gm);assert.equal(m.s.reacaoPendente,undefined);
});
test('reação preventiva interrompe o ataque entre o acerto e o dano',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'defletir-teste',nome:'Defletir Ataques',categoria:'acao',gatilho:'ser_atingido',custo:[{tipo:'reacao',quantidade:1}],automacao:{tipo:'reduzir_dano',formula:'1d10+3'}});
 await m.iniciar();await m.go('passar',{ator:m.a.id},player);const ataque=m.s.atores[1].ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');
 await m.go('usar',{ator:m.b.id,opcao:ataque.id,alvo:m.a.id},gm,[15]);assert.equal(m.s.atores[0].pv,20);assert.equal(m.s.atores[1].acao,0);assert.equal(m.s.reacaoPendente.gatilho,'ser_atingido');assert.equal(m.s.resolucaoPendente.tipo,'dano_ataque');
 await m.go('resolverReacao',{ator:m.a.id,opcao:'defletir-teste'},player,[4,5]);assert.equal(m.s.atores[0].pv,19);assert.equal(m.s.atores[0].reacao,0);assert.equal(m.s.reacaoPendente,undefined);assert.equal(m.s.resolucaoPendente,undefined);
});
test('rerrolagem de d20 aparece no resultado e cobra o recurso somente quando usada',async()=>{
 const m=mesa();m.a.ficha.recursos.push({id:'sorte-d20',nome:'Ponto de Sorte',maximo:1,saldoInicial:1});m.a.rec['sorte-d20']=1;m.a.ficha.opcoes.push({id:'sorte-d20-opcao',nome:'Ponto de Sorte',categoria:'acao',gatilho:'apos_rolagem_d20',custo:[{tipo:'recurso',id:'sorte-d20',quantidade:1}],rerrolagem:{tipo:'d20',modo:'todos'}});
 await m.iniciar();const ataque=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');let chamada=0;
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player,async(formula,meta)=>{chamada++;if(chamada===1){assert.equal(meta.rerrolagens[0].id,'sorte-d20-opcao');return {total:19,natural:15,formula,resumo:'15 + 4 = 19',rerrolagensUsadas:['sorte-d20-opcao']};}return {total:5,natural:null,formula,resumo:'5'};});
 assert.equal(next.atores[0].rec['sorte-d20'],0);assert.equal(next.atores[1].pv,19);
});
test('dado concedido acompanha o alvo, entra no ajuste de d20 e some quando escolhido',async()=>{
 const m=mesa();m.a.ficha.recursos.push({id:'inspiracao',nome:'Inspiração de Bardo',maximo:1,saldoInicial:1});m.a.rec.inspiracao=1;m.a.ficha.opcoes.push({id:'inspirar-teste',nome:'Inspiração de Bardo',categoria:'acao',custo:[{tipo:'bonus',quantidade:1},{tipo:'recurso',id:'inspiracao',quantidade:1}],automacao:{tipo:'conceder_dado',alcanceM:18,modificador:{nome:'Inspirado',formula:'1d6',tipos:['ataque','salvaguarda','teste'],removeAoUsar:true,removeEm:'descanso_longo'}}});
 await m.go('usar',{ator:m.a.id,opcao:'inspirar-teste',alvo:m.b.id,confirmado:true},gm);assert.equal(m.s.atores[0].rec.inspiracao,0);assert.equal(m.s.atores[1].efeitosAtivos[0].modificadorRolagem.formula,'1d6');
 await m.iniciar();await m.go('passar',{ator:m.a.id},player);const ataque=m.s.atores[1].ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');let chamada=0,id=m.s.atores[1].efeitosAtivos[0].id;
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.b.id,opcao:ataque.id,alvo:m.c.id},gm,async(formula,meta)=>{chamada++;if(chamada===1){assert.equal(meta.adicionais[0].formula,'1d6');assert.equal(meta.combinarAdicionais,true);return {total:19,natural:14,formula,resumo:'14 + 4 + 1 = 19',recursosAtivos:[id]};}return {total:5,natural:null,formula,resumo:'5'};});
 assert.equal(next.atores[1].efeitosAtivos.some(e=>e.id===id),false);assert.equal(next.atores[2].pv,19);
});
test('marca persistente adiciona dano automaticamente nos ataques válidos da origem',async()=>{
 const m=mesa();m.a.ficha.opcoes.push({id:'marca-teste',nome:'Marca do Predador',categoria:'magia',concentracao:true,custo:[{tipo:'bonus',quantidade:1}],automacao:{tipo:'efeito',alcanceM:18,efeito:{nome:'Marcado pelo Predador',tipo:'debuff',descricao:'Ataques com arma da origem causam 1d6 adicional.',danoAoSerAtingido:{formula:'1d6',elemento:'perfurante',tagsAtaque:['arma']}}}});
 await m.iniciar();await m.go('usar',{ator:m.a.id,opcao:'marca-teste',alvo:m.b.id},player);const marca=m.s.atores[1].efeitosAtivos[0];assert.equal(marca.danoAoSerAtingido.origemAtorId,m.a.id);assert.ok(m.s.atores[0].concentracaoAtiva);
 const ataque=m.s.atores[0].ficha.opcoes.find(o=>o.automacao?.tipo==='ataque');let chamada=0;
 const next=await aplicar(m.s,{tipo:'usar',rev:m.s.rev,ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player,async(formula,meta)=>{chamada++;if(chamada===1)return {total:19,natural:15,formula,resumo:'19'};assert.equal(meta.adicionais[0].automatico,true);assert.equal(meta.adicionais[0].formula,'1d6');return {total:8,natural:null,formula,resumo:'5 + 3',recursosAtivos:[marca.id],resultados:[{total:5,resumo:'5'},{total:3,resumo:'3'}]};});
 assert.equal(next.atores[1].pv,16);assert.equal(next.atores[1].efeitosAtivos.some(e=>e.id===marca.id),true);
});
test('áreas de quadrado, cone e linha usam a geometria declarada',async()=>{
 assert.equal(dentroDaArea({x:0,y:0},{x:3,y:0},{x:2,y:0.5},{area:{forma:'cone',comprimentoM:3,larguraM:3}}),true);assert.equal(dentroDaArea({x:0,y:0},{x:3,y:0},{x:2,y:2},{area:{forma:'cone',comprimentoM:3,larguraM:3}}),false);
 assert.equal(dentroDaArea({x:0,y:0},{x:3,y:0},{x:2.5,y:.6},{area:{forma:'linha',comprimentoM:3,larguraM:1.5}}),true);assert.equal(dentroDaArea({x:0,y:0},{x:3,y:0},{x:2.5,y:1},{area:{forma:'linha',comprimentoM:3,larguraM:1.5}}),false);
 const m=mesa();m.a.ficha.opcoes.push({id:'quadrado-teste',nome:'Área quadrada',categoria:'magia',custo:[{tipo:'acao',quantidade:1}],automacao:{tipo:'salva',atributo:'des',cd:13,dano:'2d6',metade:true,elemento:'fogo',alcanceM:18,area:{forma:'quadrado',tamanhoM:2}}});
 await m.iniciar();await m.go('usar',{ator:m.a.id,opcao:'quadrado-teste',ponto:{x:1.5,y:0}},player,[6,10,15]);assert.deepEqual(m.s.atores.map(x=>x.pv),[20,18,21]);
});
test('as sete fichas de jogadores carregam juntas com recursos e automações próprias',async()=>{
 for(const f of fichasJogadores)validar(f);
 let s=novo();s=await aplicar(s,{tipo:'grupoTeste',rev:s.rev,fichas:fichasJogadores,ensaio:true},gm,async()=>1);
 assert.equal(s.atores.length,7);assert.deepEqual(new Set(s.atores.map(a=>a.ficha.id)),new Set(idsJogadores));
 assert.ok(s.atores.every(a=>a.dono==='teste'&&a.token==='sim-'+a.id));
 assert.ok(s.atores.every(a=>a.ficha.inventario.itens.every(i=>i.pesoKg>0)),'todos os itens das sete fichas precisam ter peso');
 const porId=id=>s.atores.find(a=>a.ficha.id===id).ficha;
 assert.equal(porId('draven-thorne').opcoes.find(o=>o.id==='surto-de-acao-acao').automacao.tipo,'economia');
 assert.equal(porId('loteria').opcoes.find(o=>/Defletir Ataques/i.test(o.nome)).gatilho,'ser_atingido');
 assert.equal(porId('hannah-montana').opcoes.find(o=>o.id==='inspiracao-bardo-acao').automacao.tipo,'conceder_dado');
 assert.equal(porId('skimi').opcoes.find(o=>o.id==='ponto-sorte-rerrolagem').gatilho,'apos_rolagem_d20');
});
test('economia genérica automatiza Surto de Ação, Recuperar Fôlego e recursos',async()=>{
 let s=novo(),d=adicionar(s,fichasJogadores.find(f=>f.id==='draven-thorne')),g=adicionar(s,soldado,'Alvo');
 const rolar=async formula=>({total:/d20/.test(formula)?20:/d10/.test(formula)?8:5,natural:/d20/.test(formula)?20:null,formula,resumo:'teste'});
 const go=async(tipo,extra={},u=gm)=>s=await aplicar(s,{tipo,rev:s.rev,...extra},u,rolar);
 await go('vincular',{ator:d.id,dono:'p'});await go('iniciar');await go('iniciativa',{ator:d.id},player);await go('iniciativa',{ator:g.id});
 await go('usar',{ator:d.id,opcao:'surto-de-acao-acao'},player);assert.equal(s.atores[0].acao,2);assert.equal(s.atores[0].rec['surto-de-acao'],0);
 await go('ajustar',{ator:d.id,campo:'pv',valor:-10,confirmado:true});await go('usar',{ator:d.id,opcao:'recuperar-folego-acao'},player);
 assert.equal(s.atores[0].pv,s.atores[0].ficha.pvMaximos-2);assert.equal(s.atores[0].bonus,0);assert.equal(s.atores[0].rec['recuperar-folego'],1);
 const monge=fichasJogadores.find(f=>f.id==='loteria'),metabolismo=monge.opcoes.find(o=>o.id==='metabolismo-incomum-acao');
 assert.deepEqual(metabolismo.automacao.recuperarRecursos,['pontos-de-foco']);assert.equal(monge.opcoes.find(o=>o.id==='pico-adrenalina').automacao.disparada,true);
});
test('Astúcia Mágica recupera somente um espaço e apenas fora de combate',async()=>{
 let s=novo(),b=adicionar(s,fichasJogadores.find(f=>f.id==='skimi'));b.rec['espaco-2']=0;
 s=await aplicar(s,{tipo:'usar',rev:s.rev,ator:b.id,opcao:'astucia-magica-acao',confirmado:true},gm,async()=>1);
 assert.equal(s.atores[0].rec['espaco-2'],1);assert.equal(s.atores[0].rec['astucia-magica'],0);
 s=novo();b=adicionar(s,fichasJogadores.find(f=>f.id==='skimi'));s.fase='turnos';s.ordem=[b.id];s.vez=0;
 await assert.rejects(aplicar(s,{tipo:'usar',rev:s.rev,ator:b.id,opcao:'astucia-magica-acao',confirmado:true},gm,async()=>1),/fora de combate/);
});
test('Queimadura de Fogo entra após o acerto e Atacante Selvagem modifica somente o primeiro dano do turno',async()=>{
 let s=novo(),d=adicionar(s,fichasJogadores.find(f=>f.id==='draven-thorne')),g=adicionar(s,soldado,'Alvo'),gmLocal={id:'m',role:'GM'},jogador={id:'p',role:'PLAYER'};
 const comando=async(tipo,extra={},u=gmLocal,rolar=async()=>1)=>s=await aplicar(s,{tipo,rev:s.rev,...extra},u,rolar);
 await comando('vincular',{ator:d.id,dono:'p'});await comando('iniciar');
 await comando('iniciativa',{ator:d.id},jogador,async f=>({total:20,natural:17,formula:f,resumo:'20'}));
 await comando('iniciativa',{ator:g.id},gmLocal,async f=>({total:5,natural:4,formula:f,resumo:'5'}));
 const ataque=ataquesEquipados(s.atores[0])[0];let etapa=0;
 await comando('usar',{ator:d.id,opcao:ataque.id,alvo:g.id},jogador,async(formula,meta)=>{
   etapa++;if(etapa===1)return {total:20,natural:15,formula,resumo:'15 + 5 = 20'};
   assert.equal(meta.modificadorDano.id,'atacante-selvagem');assert.equal(meta.modificadorDano.tipo,'rolar_duas_escolher_maior');
   assert.ok(meta.adicionais.some(x=>x.id==='queimadura-de-fogo-apos-acerto'));
   return {total:15,natural:null,formula,resumo:'10 + 5',recursosAtivos:['queimadura-de-fogo-apos-acerto'],resultados:[{total:10,resumo:'10'},{total:5,resumo:'5'}]};
 });
 assert.equal(s.atores[1].pv,9);assert.equal(s.atores[0].rec['queimadura-de-fogo'],1);assert.equal(s.atores[0].usosTurno['atacante-selvagem'],true);
 s.atores[0].acao=1;etapa=0;
 await comando('usar',{ator:d.id,opcao:ataque.id,alvo:g.id},jogador,async(formula,meta)=>{etapa++;if(etapa===1)return {total:20,natural:15,formula,resumo:'20'};assert.equal(meta.modificadorDano,null);return {total:3,formula,resumo:'3',recursosAtivos:[]};});
 assert.equal(s.atores[1].pv,6);
 const local=dadoLocal('2d6+3',{modificadorDano:{id:'atacante-selvagem',nome:'Atacante Selvagem',tipo:'rolar_duas_escolher_maior'}});
 assert.equal(local.alternativasDano.length,2);assert.equal(local.total,Math.max(...local.alternativasDano.map(x=>x.total)));
});

test('inventário legado separa armas, prioriza o melhor acerto e ocupa uma mão por adaga',()=>{
 const f=validar(nikki),moedas=f.inventario.itens.find(i=>i.tipo==='moeda');
 const adagas=f.inventario.itens.filter(i=>i.nome==='Adaga'),lanca=f.inventario.itens.find(i=>i.nome==='Lança');
 assert.ok(f.inventario.capacidadeCargaKg>0);assert.equal(moedas.quantidade,28);assert.equal(moedas.tipo,'moeda');
 assert.equal(adagas.length,2);assert.deepEqual(adagas.map(i=>i.equipadoSlot).sort(),['mao_forte','mao_fraca']);assert.equal(lanca.equipado,false);
 assert.ok(f.inventario.itens.every(i=>i.pesoKg>0),'todos os itens migrados precisam ter peso');
});
test('escudo do soldado ocupa a mão fraca e altera a CA ao ser guardado',async()=>{
 const m=mesa(),escudo=m.b.ficha.inventario.itens.find(i=>i.nome==='Escudo');
 assert.ok(escudo?.equipado&&escudo.equipadoSlot==='mao_fraca');assert.equal(caAtual(m.b),16);
 await m.go('inventario',{ator:m.b.id,operacao:'desequipar',itemId:escudo.id});
 assert.equal(caAtual(m.s.atores[1]),14);
});
test('equipar troca o slot e aplica modificadores dinâmicos de CA, PV e deslocamento',async()=>{
 const m=mesa();m.a.dono='p';const pesoAntes=pesoInventario(m.a);m.a.ficha.inventario.itens.push(
  {id:'capa-teste',nome:'Capa de teste',descricao:'',tipo:'equipamento',quantidade:1,pesoKg:1,slotEquipamento:'capa',equipado:false,modificadores:{ca:1,pvMaximos:3,deslocamentoM:1.5}},
  {id:'capa-antiga',nome:'Capa antiga',descricao:'',tipo:'equipamento',quantidade:1,pesoKg:2,slotEquipamento:'capa',equipado:true,equipadoSlot:'capa',modificadores:{ca:2}}
 );
 assert.equal(caAtual(m.a),14);await m.go('inventario',{ator:m.a.id,operacao:'equipar',itemId:'capa-teste'},player);
 const a=m.s.atores[0];assert.equal(caAtual(a),13);assert.equal(pvMaximosAtuais(a),23);assert.equal(deslocamentoMaximo(a),10.5);assert.equal(a.ficha.inventario.itens.find(i=>i.id==='capa-antiga').equipado,false);assert.equal(pesoInventario(a),pesoAntes+3);
});
test('trocar equipamento ou usar consumível em combate exige o turno e gasta uma ação',async()=>{
 const m=mesa();m.a.ficha.inventario.itens.push({id:'pocao-teste',nome:'Poção',descricao:'',tipo:'consumivel',quantidade:2,pesoKg:.5});
 m.b.ficha.inventario.itens.push({id:'elmo-teste',nome:'Elmo',descricao:'',tipo:'equipamento',quantidade:1,pesoKg:1,slotEquipamento:'cabeca',equipado:false});
 await m.iniciar();
 await assert.rejects(m.go('inventario',{ator:m.b.id,operacao:'equipar',itemId:'elmo-teste'},gm),/turno/);
 await m.go('inventario',{ator:m.a.id,operacao:'usar',itemId:'pocao-teste'},player);const a=m.s.atores[0];assert.equal(a.acao,0);assert.equal(a.ficha.inventario.itens.find(i=>i.id==='pocao-teste').quantidade,1);
 await assert.rejects(m.go('inventario',{ator:m.a.id,operacao:'usar',itemId:'pocao-teste'},player),/ação disponível/);
});
test('equipamento controla dinamicamente os ataques exibidos',async()=>{
 const m=mesa();m.a.dono='p';const item=m.a.ficha.inventario.itens.find(i=>i.nome==='Adaga'&&i.equipadoSlot==='mao_forte'),ataque=opcoesDisponiveis(m.a).find(o=>o.origemItem===item.id&&!o.automacao.arremesso);
 assert.ok(item.equipado&&ataque&&opcoesDisponiveis(m.a).some(o=>o.id===ataque.id));
 await m.go('inventario',{ator:m.a.id,operacao:'desequipar',itemId:item.id},player);
 assert.equal(opcoesDisponiveis(m.s.atores[0]).some(o=>o.id===ataque.id),false);
 await assert.rejects(m.go('usar',{ator:m.a.id,opcao:ataque.id,alvo:m.b.id},player),/Opção desconhecida|equipamento adequado/);
});
test('migração de encontro antigo religa ataques às armas e oculta a lança guardada',()=>{
 const m=mesa(),f=m.a.ficha;
 for(const o of f.opcoes)delete o.requerItemEquipado;
 for(const i of f.inventario.itens)delete i.acoes;
 atualizarMagias(f);
 const visiveis=opcoesDisponiveis(m.a).map(o=>o.nome);
 assert.ok(visiveis.some(n=>n.startsWith('Adaga +4')));
 assert.equal(visiveis.filter(n=>n.startsWith('Adaga')).length,4);
 assert.equal(visiveis.some(n=>n.startsWith('Lança +2')),false);
});
test('HUD lógica oferece apenas magias preparadas, sempre preparadas e truques',()=>{
 const m=mesa(),p=m.a.ficha.preparacao,magias=m.a.ficha.opcoes.filter(o=>o.categoria==='magia'&&!o.varianteDe);
 const preparada=magias.find(o=>p.preparadas.includes(o.id));
 const sempre=magias.find(o=>p.semprePreparadas.includes(o.id));
 const truque=magias.find(o=>(o.circuloBase??0)===0);
 assert.ok(preparada&&sempre&&truque);
 p.preparadas=p.preparadas.filter(id=>id!==preparada.id);
 const disponiveis=opcoesDisponiveis(m.a).map(o=>o.id);
 assert.equal(disponiveis.includes(preparada.id),false);
 assert.equal(disponiveis.includes(sempre.id),true);
 assert.equal(disponiveis.includes(truque.id),true);
});
test('arma de duas mãos ocupa as duas mãos e guarda as armas anteriores',async()=>{
 const m=mesa();m.a.dono='p';m.a.ficha.inventario.itens.push({id:'espada-grande-teste',nome:'Espada grande',descricao:'Arma de duas mãos.',tipo:'equipamento',quantidade:1,pesoKg:3,slotEquipamento:'mao_forte',duasMaos:true,equipado:false});
 await m.go('inventario',{ator:m.a.id,operacao:'equipar',itemId:'espada-grande-teste',slot:'mao_forte'},player);
 const itens=m.s.atores[0].ficha.inventario.itens,espada=itens.find(i=>i.id==='espada-grande-teste');
 assert.equal(espada.equipadoSlot,'mao_forte');assert.deepEqual(slotsOcupadosItem(espada),['mao_forte','mao_fraca']);assert.equal(itens.filter(i=>i.nome==='Adaga').some(i=>i.equipado),false);
 await m.go('inventario',{ator:m.a.id,operacao:'desequipar',itemId:espada.id},player);assert.equal(m.s.atores[0].ficha.inventario.itens.find(i=>i.id===espada.id).equipado,false);
});
test('Livro de Habilidades prepara magias, alterna passivas e trava em combate',async()=>{
 const m=mesa();m.a.dono='p';const p=m.a.ficha.preparacao,id=p.preparadas[0],passiva=m.a.ficha.passivas[0];
 await m.go('livro',{ator:m.a.id,operacao:'despreparar',habilidadeId:id},player);assert.equal(m.s.atores[0].ficha.preparacao.preparadas.includes(id),false);
 await m.go('livro',{ator:m.a.id,operacao:'preparar',habilidadeId:id},player);assert.equal(m.s.atores[0].ficha.preparacao.preparadas.includes(id),true);
 await m.go('livro',{ator:m.a.id,operacao:'desativar',habilidadeId:passiva.id},player);assert.equal(m.s.atores[0].ficha.passivas[0].ativa,false);
 await m.iniciar();await assert.rejects(m.go('livro',{ator:m.a.id,operacao:'ativar',habilidadeId:passiva.id},player),/somente fora de combate/);
});
test('catálogo do Victor registra todas as armas, proteções, acessórios e suprimentos',()=>{
 assert.equal(catalogoVictor.itens.length,24);assert.equal(new Set(catalogoVictor.itens.map(i=>i.id)).size,24);
 const armas=catalogoVictor.itens.filter(i=>i.categoria==='arma'),placas=catalogoVictor.itens.find(i=>i.id==='victor-armadura-placas'),escudo=catalogoVictor.itens.find(i=>i.id==='victor-escudo'),veste=catalogoVictor.itens.find(i=>i.id==='victor-veste-simples');
 assert.equal(armas.length,9);assert.ok(armas.every(i=>i.modelosAcoes?.length));assert.equal(placas.preco.valor,1500);assert.equal(placas.classeArmadura.valor,18);assert.equal(escudo.slotEquipamento,'mao_fraca');assert.equal(escudo.classeArmadura.valor,2);assert.equal(veste.categoriaArmadura,'veste');
});
test('ataques de arma são derivados somente dos itens equipados e desarmados continuam livres',()=>{
 const f=fichasJogadores.find(x=>x.id==='draven-thorne'),s=novo(),d=adicionar(s,f),nomes=opcoesDisponiveis(d).map(o=>o.nome);
 const armas=ataquesEquipados(d);assert.deepEqual(armas.map(o=>o.dadosEquipamento.tipoArma),['espada_grande']);
 assert.equal(armas[0].automacao.bonus,5);assert.equal(armas[0].automacao.dano,'2d6+3');assert.equal(armas[0].automacao.elemento,'cortante');assert.equal(armas[0].dadosEquipamento.proficiente,true);assert.equal(armas[0].dadosEquipamento.maestria,true);
 assert.equal(nomes.some(n=>/Azagaia|Mangual/.test(n)),false);assert.equal(nomes.some(n=>/Golpe desarmado/i.test(n)),true);
});
test('rodapé começa pelas armas equipadas e mantém cada arremesso logo depois',()=>{
 const m=mesa(),ordenadas=ordenarOpcoesRodape(m.a),armas=ordenadas.slice(0,4),itens=new Map(m.a.ficha.inventario.itens.map(i=>[i.id,i]));
 assert.ok(armas.every(o=>o.geradaPorItem));assert.deepEqual(armas.map(o=>itens.get(o.origemItem).equipadoSlot),['mao_forte','mao_forte','mao_fraca','mao_fraca']);assert.deepEqual(armas.map(o=>Boolean(o.automacao.arremesso)),[false,true,false,true]);
 const s=novo(),zurichAtor=adicionar(s,fichasJogadores.find(x=>x.id==='zurich')),primeiras=ordenarOpcoesRodape(zurichAtor).filter(o=>o.geradaPorItem).slice(0,3),itensZurich=new Map(zurichAtor.ficha.inventario.itens.map(i=>[i.id,i]));
 assert.deepEqual(primeiras.map(o=>itensZurich.get(o.origemItem).equipadoSlot),['mao_forte','mao_fraca','arma_distancia']);
});
test('o mesmo item recalcula acerto, dano e proficiência para o novo portador',()=>{
 const s=novo(),d=adicionar(s,fichasJogadores.find(x=>x.id==='draven-thorne')),n=adicionar(s,nikki),espada=structuredClone(d.ficha.inventario.itens.find(i=>i.tipoArma==='espada_grande'));
 for(const i of n.ficha.inventario.itens)if(i.equipado&&['mao_forte','mao_fraca'].includes(i.equipadoSlot)){i.equipado=false;delete i.equipadoSlot;}
 espada.id='espada-transferida';espada.equipado=true;espada.equipadoSlot='mao_forte';n.ficha.inventario.itens.push(espada);
 const original=ataquesEquipados(d)[0],transferida=ataquesEquipados(n).find(o=>o.origemItem===espada.id);
 assert.equal(original.automacao.bonus,5);assert.equal(original.automacao.dano,'2d6+3');assert.equal(transferida.automacao.bonus,0);assert.equal(transferida.automacao.dano,'2d6');assert.equal(transferida.dadosEquipamento.proficiente,false);assert.equal(proficienteComArma(n.ficha,espada),false);
});
test('acuidade, distância, arremesso, duas mãos e Artes Marciais usam os dados do item',()=>{
 const s=novo(),n=adicionar(s,nikki),z=adicionar(s,fichasJogadores.find(x=>x.id==='zurich')),l=adicionar(s,fichasJogadores.find(x=>x.id==='loteria'));
 const adaga=ataquesEquipados(n).find(o=>o.automacao.arremesso),arco=ataquesEquipados(z).find(o=>o.dadosEquipamento.tipoArma==='arco_longo'),lanca=ataquesEquipados(l).find(o=>o.dadosEquipamento.tipoArma==='lanca'&&!o.automacao.arremesso);
 assert.equal(adaga.dadosEquipamento.atributo,'des');assert.equal(adaga.automacao.bonus,4);assert.equal(adaga.automacao.elemento,'perfurante');
 assert.equal(arco.dadosEquipamento.atributo,'des');assert.equal(arco.automacao.bonus,7);assert.equal(arco.automacao.alcanceM,18);
 assert.equal(lanca.dadosEquipamento.atributo,'des');assert.equal(lanca.automacao.dano,'1d8+3');
});
test('todo ataque ou habilidade respeita o teto sistêmico de dezoito metros',()=>{
 for(const ficha of [...fichasJogadores,soldado]){const s=novo(),a=adicionar(s,ficha);for(const o of opcoesDisponiveis(a)){if(Number.isFinite(o.automacao?.alcanceM))assert.ok(o.automacao.alcanceM<=LIMITE_ALCANCE_M,o.nome);if(Number.isFinite(o.selecao?.alcanceM))assert.ok(o.selecao.alcanceM<=LIMITE_ALCANCE_M,o.nome);}}
});
test('armadura pesada usa classificação, escudo independente e requisito de força',()=>{
 const s=novo(),n=adicionar(s,nikki),placas=structuredClone(catalogoVictor.itens.find(i=>i.id==='victor-armadura-placas')),escudo=structuredClone(catalogoVictor.itens.find(i=>i.id==='victor-escudo'));
 for(const i of n.ficha.inventario.itens)i.equipado=false;Object.assign(placas,{id:'placas-teste',quantidade:1,equipado:true,equipadoSlot:'vestes'});Object.assign(escudo,{id:'escudo-teste',quantidade:1,equipado:true,equipadoSlot:'mao_fraca'});n.ficha.inventario.itens.push(placas,escudo);
 assert.equal(caAtual(n),20);assert.equal(deslocamentoMaximo(n),6);assert.equal(placas.categoriaArmadura,'pesada');assert.equal(escudo.categoriaArmadura,'escudo');
});
test('Conteúdo configurado cobre os itens das sete fichas, soldados e Forja do Victor',()=>{
 const normal=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),nomes=new Set(conteudoConfigurado.itens.map(i=>normal(i.nome)));
 for(const f of [...fichasJogadores,soldado])for(const item of f.equipamentos??f.inventario?.itens??[])assert.ok(nomes.has(normal(item.nome??item.name)),'faltou '+(item.nome??item.name));
 for(const item of catalogoVictor.itens)assert.ok(nomes.has(normal(item.nome)),'faltou '+item.nome);
 assert.equal(conteudoConfigurado.sistemaEquipamentos.alcanceMaximoM,18);assert.equal(conteudoConfigurado.sistemaEquipamentos.status,'Configurado');
});

test('catálogo de dano cobre os treze tipos oficiais com cor e aliases',()=>{
 assert.equal(Object.keys(TIPOS_DANO).length,13);assert.equal(normalizarTipoDano('Fire'),'fogo');assert.equal(normalizarTipoDano('Força'),'forca');assert.equal(normalizarTipoDano('Lightning'),'raio');
 for(const id of Object.keys(TIPOS_DANO)){const info=infoTipoDano(id);assert.match(info.cor,/^#[0-9A-F]{6}$/i);assert.ok(info.nome&&info.simbolo&&info.modelo);}
});
test('resolvedor aplica redução, resistência e vulnerabilidade na ordem oficial',()=>{
 const rel=resolverDano({parcelas:[{valor:28,tipo:'fogo'}],defesas:[{id:'r',nome:'Resistência',operacao:'resistencia',filtro:{tipos:['fogo']}},{id:'v',nome:'Vulnerabilidade',operacao:'vulnerabilidade',filtro:{tipos:['fogo']}}],ajustes:[{id:'red',nome:'Aura',operacao:'reducao_fixa',valor:5}],alvo:{id:'a',nome:'Alvo',pv:50,pvTemporarios:0}});
 assert.equal(rel.parcelas[0].final,22);assert.equal(rel.danoRecebido,22);assert.deepEqual(rel.parcelas[0].passos.map(x=>x.operacao),['reducao_fixa','resistencia','vulnerabilidade']);
});
test('resistências não acumulam e dano misto preserva tipos e tags',()=>{
 const rel=resolverDano({parcelas:[{valor:9,tipo:'cortante',tags:['lamina','arma']},{valor:6,tipo:'fogo',tags:['elemental']}],defesas:[{id:'l1',nome:'Lâminas',operacao:'resistencia',filtro:{tagsAlguma:['lamina']}},{id:'l2',nome:'Cortante',operacao:'resistencia',filtro:{tipos:['cortante']}},{id:'f',nome:'Fogo',operacao:'resistencia',filtro:{tipos:['fogo']}}],alvo:{id:'a',nome:'Alvo',pv:20,pvTemporarios:2}});
 assert.deepEqual(rel.parcelas.map(x=>x.final),[4,3]);assert.equal(rel.danoRecebido,7);assert.equal(rel.absorvidoPorPvTemporario,2);assert.equal(rel.pvPerdido,5);assert.equal(rel.pvDepois,15);
});
test('imunidade, limiar e excesso produzem relatório aplicável idêntico ao PV',()=>{
 const imune=resolverDano({parcelas:[{valor:20,tipo:'veneno'}],defesas:[{id:'i',nome:'Imune',operacao:'imunidade',filtro:{tipos:['veneno']}}],alvo:{id:'a',nome:'Alvo',pv:3,pvTemporarios:0}});assert.equal(imune.pvPerdido,0);
 const baixo=resolverDano({parcelas:[{valor:9,tipo:'contundente'}],defesas:[{id:'l',nome:'Limiar 10',operacao:'limiar',valor:10}],alvo:{id:'a',nome:'Alvo',pv:3,pvTemporarios:0}});assert.equal(baixo.danoRecebido,0);
 const alto=resolverDano({parcelas:[{valor:12,tipo:'contundente'}],defesas:[{id:'l',nome:'Limiar 10',operacao:'limiar',valor:10}],alvo:{id:'a',nome:'Alvo',pv:3,pvTemporarios:0}}),ator={pv:3,pvTemporarios:0,estadoVida:'consciente',salvaguardasMorte:{sucessos:0,falhas:0},ficha:{pvMaximos:10}};aplicarRelatorioDano(ator,alto,{pvMaximos:10});assert.equal(alto.excesso,9);assert.equal(ator.pv,0);assert.equal(ator.estadoVida,'inconsciente');
});
test('defesas podem vir da ficha, passiva, item equipado e buff',()=>{
 const ator={id:'a',ficha:{id:'f',resistencias:['fogo'],passivas:[{id:'p',ativa:true,defesasDano:[{id:'psi',nome:'Mente',operacao:'resistencia',filtro:{tipos:['psiquico']}}]}],inventario:{itens:[{id:'capa',equipado:true,defesasDano:[{id:'frio',nome:'Capa',operacao:'resistencia',filtro:{tipos:['frio']}}]}]}},efeitosAtivos:[{id:'buff',defesasDano:[{id:'raio',nome:'Proteção',operacao:'imunidade',filtro:{tipos:['raio']}}]}]};
 assert.deepEqual(new Set(defesasDanoDoAtor(ator).map(x=>x.id)),new Set(['resistencia-fogo-0','psi','frio','raio']));
});

// ===== Revisão de regras (PR correcoes-revisao-regras) =====
// Rolador que imita a sala: calcula relatoriosDano como o bridge e anexa em cada resultado.
const {relatoriosDaRolagem}=await import('./site/damage.mjs');
const fichaRev=async n=>JSON.parse(await readFile(new URL('./site/fichas/'+n+'.json',import.meta.url),'utf8'));
function roladorSala({d20=15,dano=6,salva=null}={}){
  const formulas=[];
  const rolar=async(formula,meta={})=>{
    const um=f=>{formulas.push({f,meta});if(/d20/.test(f)){const nat=meta.tipo==='salvaguarda'&&salva!==null?salva:d20;return {total:nat+4,natural:nat,formula:f};}return {total:dano,natural:null,formula:f};};
    const r=Array.isArray(formula)?{resultados:formula.map(um)}:um(formula);
    const rel=relatoriosDaRolagem(r,{...meta,adicionais:(meta.adicionais??[]).filter(x=>x.automatico)});
    if(rel.length){r.relatoriosDano=rel;if(r.resultados)r.resultados=r.resultados.map((x,i)=>({...x,relatorioDano:rel[i]}));}
    r.recursosAtivos=(meta.adicionais??[]).filter(x=>x.automatico).map(x=>x.id);
    return r;
  };
  return {rolar,formulas};
}
async function duelo(fichaA,fichaB='soldado',{distancia=1.5}={}){
  let s=novo();const a=adicionar(s,await fichaRev(fichaA)),b=adicionar(s,await fichaRev(fichaB));
  a.dono='p';a.x=0;a.y=0;b.x=distancia;b.y=0;s.fase='turnos';s.rodada=1;s.vez=0;s.ordem=[a.id,b.id];
  for(const x of s.atores){x.init=10;x.acao=1;x.bonus=1;x.reacao=1;x.metros=9;}
  return {s,a,b};
}
const opRev=(a,trecho)=>opcoesDisponiveis(a).find(o=>o.nome.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().includes(trecho));

test('#35 vários acertos no mesmo alvo somam o dano (Mísseis Mágicos e Torrente de Golpes)',async()=>{
  for(const [ficha,trecho,n] of [['nikki','misseis magicos',3],['loteria','torrente',2]]){
    let {s,a,b}=await duelo(ficha);const pv=b.pv;
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,trecho).id,alvos:Array(n).fill(b.id)},player,roladorSala({d20:16,dano:6}).rolar);
    assert.equal(s.atores[1].pv,pv-6*n,trecho);
  }
});

test('#25 descanso longo recupera o que é de descanso curto; Dados de Vida e Recuperar Fôlego seguem 2024',async()=>{
  let s=novo();const sk=adicionar(s,await fichaRev('skimi')),dr=adicionar(s,await fichaRev('draven-thorne')),lo=adicionar(s,await fichaRev('loteria'));
  sk.rec['espaco-2']=0;dr.rec['dados-de-superioridade']=0;dr.rec['surto-de-acao']=0;dr.rec['recuperar-folego']=0;lo.rec['pontos-de-foco']=0;
  for(const a of [sk,dr,lo])a.rec['dados-de-vida']=0;
  s=await aplicar(s,{rev:s.rev,tipo:'descanso',periodo:'curto'},gm,()=>0);
  let [a,b,c]=s.atores;
  assert.equal(a.rec['espaco-2'],2);assert.equal(b.rec['recuperar-folego'],1,'curto devolve 1 uso');assert.equal(a.rec['dados-de-vida'],0,'Dados de Vida não voltam no curto');
  s=await aplicar(s,{rev:s.rev,tipo:'descanso',periodo:'longo'},gm,()=>0);[a,b,c]=s.atores;
  assert.equal(a.rec['espaco-2'],2);assert.equal(b.rec['dados-de-superioridade'],4);assert.equal(b.rec['surto-de-acao'],1);assert.equal(b.rec['recuperar-folego'],2);assert.equal(c.rec['pontos-de-foco'],3);
  assert.equal(a.rec['dados-de-vida'],3,'Dados de Vida voltam no longo');
});
test('#25 gastar Dado de Vida fora de combate cura dado + CON',async()=>{
  let s=novo();const a=adicionar(s,await fichaRev('draven-thorne'));a.dono='p';a.pv=10;
  const o=opRev(a,'gastar dado de vida');assert.equal(o.automacao.cura,'1d10+2');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:o.id},player,async()=>7);
  assert.equal(s.atores[0].pv,17);assert.equal(s.atores[0].rec['dados-de-vida'],2);
});

test('#26 teste de perícia recebe Orientação e Ponto de Sorte do personagem',async()=>{
  let s=novo();const z=adicionar(s,await fichaRev('zurich')),k=adicionar(s,await fichaRev('skimi'));
  z.dono='p';k.dono='p';z.x=0;k.x=1.5;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:z.id,opcao:opRev(z,'orientacao').id,alvo:k.id},player,async()=>10);
  let meta=null;
  await aplicar(s,{rev:s.rev,tipo:'teste',ator:k.id,grupo:'pericias',chave:'Enganação'},player,async(f,m={})=>{meta=m;return {total:12,natural:8,formula:f};});
  assert.ok(meta.adicionais.some(x=>x.nome==='Orientação'),'Orientação aparece no teste de perícia');
  assert.ok(meta.rerrolagens.some(x=>/Sorte/.test(x.nome)),'Ponto de Sorte aparece no teste de perícia');
});

test('#3 crítico dobra todos os dados de dano (Espada Grande 2d6+3 vira 4d6+3)',async()=>{
  let {s,a,b}=await duelo('draven-thorne');const r=roladorSala({d20:20,dano:8});
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'espada grande').id,alvo:b.id},player,r.rolar);
  assert.ok(r.formulas.some(x=>x.meta.tipo==='dano'&&/^4d6\+3/.test(x.f)),'fórmula do crítico: '+r.formulas.map(x=>x.f).join(' | '));
});

test('#22 Ataque de Sopro não atinge o próprio Dragoberto e o arco soma Arquearia',async()=>{
  for(const forma of ['cone','linha']){
    let {s,a,b}=await duelo('dragoberto');const pv=a.pv;
    const o=opcoesDisponiveis(a).find(x=>x.automacao?.area?.forma===forma);
    s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:o.id,ponto:{x:2.5,y:0}},player,roladorSala({salva:2,dano:8}).rolar);
    assert.equal(s.atores[0].pv,pv,forma+' não fere quem sopra');assert.ok(s.atores[1].pv<b.pv,forma+' fere o alvo');
  }
  const {a}=await duelo('dragoberto');assert.equal(opRev(a,'arco longo').automacao.bonus,7);
});

test('#7 CD de Agarrar/Derrubar/Empurrar vem da ficha (Monge pode usar DES)',async()=>{
  const esperado={skimi:9,'hannah-montana':9,nikki:10,dragoberto:10,zurich:11,'draven-thorne':13,loteria:13};
  for(const [n,cd] of Object.entries(esperado)){const {a}=await duelo(n);for(const t of ['agarrar','derrubar','empurrar'])assert.equal(opRev(a,t).automacao.cd,cd,n+' '+t);}
});

test('#19/#20 ataque extra Leve exige ataque antes; com Ágil não gasta Ação Bônus',async()=>{
  // Hannah: adaga da mão fraca só depois de atacar com arma Leve
  let {s,a,b}=await duelo('hannah-montana');
  const extra=opcoesDisponiveis(a).find(o=>o.requisitosUso?.aposAtaque&&!o.automacao.arremesso);
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:extra.id,alvo:b.id},player,roladorSala().rolar),/depois de realizar um ataque/);
  // Zurich: Cimitarra (Ágil) + Espada Curta + Marca do Predador no mesmo turno
  ({s,a,b}=await duelo('zurich'));
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'marca do predador').id,alvo:b.id},player,roladorSala().rolar);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(s.atores[0],'cimitarra').id,alvo:b.id},player,roladorSala().rolar);
  const curta=opRev(s.atores[0],'espada curta');assert.deepEqual(curta.custo,[]);assert.match(curta.nome,/Ágil/);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:curta.id,alvo:b.id},player,roladorSala().rolar);
  assert.equal(s.atores[0].bonus,0,'só a Marca gastou a Ação Bônus');assert.equal(s.atores[0].acao,0);
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:curta.id,alvo:b.id},player,roladorSala().rolar),/já foi usada neste turno/);
});
test('#34 Loteria tem Golpe Desarmado com a Ação e o soco bônus exige ataque antes',async()=>{
  let {s,a,b}=await duelo('loteria');
  const bonus=opcoesDisponiveis(a).find(o=>/^Soco \+/.test(o.nome)),acao=opcoesDisponiveis(a).find(o=>/Golpe Desarmado/.test(o.nome)&&o.custo?.some(c=>c.tipo==='acao'));
  assert.ok(acao,'existe o soco com a Ação');
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:bonus.id,alvo:b.id},player,roladorSala().rolar),/depois de realizar um ataque/);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:acao.id,alvo:b.id},player,roladorSala().rolar);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:bonus.id,alvo:b.id},player,roladorSala().rolar);
  assert.equal(s.atores[0].acao,0);assert.equal(s.atores[0].bonus,0);
});

test('#16 #23 #33 durações: Zombaria vale no ataque do alvo, Caído dura até levantar, Ameaçador até o próximo turno',async()=>{
  // Zombaria: Hannah → soldado; no turno do soldado o ataque sai com Desvantagem e o efeito é consumido
  let {s,a,b}=await duelo('hannah-montana');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'zombaria').id,alvo:b.id},player,roladorSala({salva:2}).rolar);
  s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,()=>0);
  assert.ok(s.atores[1].efeitosAtivos.some(e=>e.nome==='Zombado'),'Zombado ainda vale no turno do soldado');
  const r=roladorSala({d20:15});
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:b.id,opcao:opcoesDisponiveis(s.atores[1]).find(o=>o.automacao?.tipo==='ataque').id,alvo:a.id},gm,r.rolar);
  assert.match(r.formulas.find(x=>x.meta.tipo==='ataque').f,/^2d20kl1/);assert.ok(!s.atores[1].efeitosAtivos.some(e=>e.nome==='Zombado'),'consumido no ataque');
  // Caído: continua no turno do alvo; levantar custa metade do deslocamento
  ({s,a,b}=await duelo('draven-thorne'));
  b.efeitosAtivos=[{id:'x',nome:'Caído',tipo:'condicao',condicao:'caido',origemAtorId:a.id,duracao:{restante:1,expira:'fim_origem'}}];
  s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,()=>0);
  assert.ok(s.atores[1].efeitosAtivos.some(e=>e.condicao==='caido'),'Caído continua no turno do alvo');
  const metros=s.atores[1].metros;
  s=await aplicar(s,{rev:s.rev,tipo:'mover',ator:b.id,x:1,y:0},gm,()=>0); // fica no alcance do Draven (sem oportunidade)
  assert.ok(!s.atores[1].efeitosAtivos.some(e=>e.condicao==='caido'));assert.equal(s.atores[1].metros,metros-metros/2-0.5);
  // Ataque Ameaçador dura 2 fins de turno do Draven
  assert.deepEqual((({turnos,expira})=>({turnos,expira}))(opRev(a,'ataque ameacador').aprimoramento.salva.efeitoFalha),{turnos:2,expira:'fim_origem'});
});

test('#14 #15 #17 #27 magias: concentração pelo nome, Enfeitiçar sem concentração, Emaranhar contém, Sussurros e Familiar da Skimi',async()=>{
  const nikki=await fichaRev('nikki'),zurich=await fichaRev('zurich'),skimi=await fichaRev('skimi');
  const op=(f,trecho)=>f.opcoes.find(o=>o.nome.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().includes(trecho));
  assert.equal(op(nikki,'sopro de dragao').concentracao,true,'#15 nome diz concentração');
  assert.equal(op(skimi,'enfeiticar pessoa').concentracao,undefined,'#14 Enfeitiçar Pessoa não é concentração');
  assert.equal(op(skimi,'enfeiticar pessoa').selecao.max,2,'espaço de 2º do Pacto: +1 alvo');
  const sussurros=op(skimi,'sussurros dissonantes');assert.ok(sussurros.custo.some(c=>c.tipo==='acao'));assert.equal(sussurros.automacao.dano,'4d6');
  const familiar=op(skimi,'encontrar familiar');assert.deepEqual(familiar.custo,[]);assert.equal(familiar.requisitosUso.somenteForaCombate,true);
  const emaranhar=op(zurich,'emaranhar');assert.equal(emaranhar.automacao.efeitoFalha.condicao,'contido');assert.equal(emaranhar.concentracao,true);
  for(const id of idsJogadores)assert.ok((await fichaRev(id)).opcoes.filter(o=>/^Preparar\b/.test(o.nome)).every(o=>o.custo.some(c=>c.tipo==='acao')),'#27 Preparar usa a Ação');
  // validar de novo não escala duas vezes
  assert.equal(op(validar(structuredClone(skimi)),'sussurros dissonantes').automacao.dano,'4d6');
  // Contido: imóvel, Desvantagem nos ataques e salvas de DES, Vantagem contra
  let {s,a,b}=await duelo('zurich');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'emaranhar').id,alvo:b.id,x:b.x,y:b.y},player,roladorSala({salva:2}).rolar).catch(()=>s);
  b.efeitosAtivos=[{id:'c',nome:'Contido por Emaranhar',tipo:'condicao',condicao:'contido',origemAtorId:a.id}];
  const r=restricoesAtivas(b);assert.equal(r.imovel,true);assert.equal(r.desvantagemAtaques,true);assert.equal(r.vantagemAtaquesContra,true);assert.ok(temCondicao(b,'contido'));
});

test('#6 só um espaço de magia por turno; truques e o turno seguinte continuam liberados',async()=>{
  let {s,a,b}=await duelo('nikki');
  const m1=opcoesDisponiveis(a).find(o=>o.automacao?.tipo==='projeteis'&&!o.varianteDe),m2=opRev(a,'misseis magicos (2');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:m1.id,alvos:[b.id,b.id,b.id]},player,roladorSala().rolar);
  s.atores[0].acao=1;
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:m2.id,alvos:[b.id,b.id,b.id,b.id]},player,roladorSala().rolar),/um espaço de magia neste turno/);
  s.rodada=2;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:m2.id,alvos:[b.id,b.id,b.id,b.id]},player,roladorSala().rolar);
  assert.equal(s.atores[0].espacoNoTurno,'2-0');
});

test('#8 ataque à distância com inimigo a 1,5 m tem Desvantagem; corpo a corpo e inimigo incapacitado não',async()=>{
  let {s,a,b}=await duelo('zurich');const r=roladorSala();
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,r.rolar);
  assert.match(r.formulas.find(x=>x.meta.tipo==='ataque').f,/^2d20kl1/);
  ({s,a,b}=await duelo('zurich',undefined,{distancia:6}));const r2=roladorSala();
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,r2.rolar);
  assert.match(r2.formulas.find(x=>x.meta.tipo==='ataque').f,/^1d20/);
  ({s,a,b}=await duelo('zurich'));b.efeitosAtivos=[{id:'x',nome:'Atordoado',tipo:'condicao',condicao:'atordoado'}];const r3=roladorSala();
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,r3.rolar);
  assert.doesNotMatch(r3.formulas.find(x=>x.meta.tipo==='ataque').f,/kl1/);
  ({s,a,b}=await duelo('zurich'));const r4=roladorSala();
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'cimitarra').id,alvo:b.id},player,r4.rolar);
  assert.match(r4.formulas.find(x=>x.meta.tipo==='ataque').f,/^1d20/);
});

test('#10 jogador declara opção sem automação; #11 monstro a 0 PV é pulado na iniciativa',async()=>{
  let {s,a,b}=await duelo('skimi');
  const assistida=a.ficha.opcoes.find(o=>!o.automacao&&o.custo?.length===1&&o.custo[0].tipo==='bonus');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:assistida.id,assistido:true},player,roladorSala().rolar);
  assert.equal(s.atores[0].bonus,0);assert.match(s.historico.at(-1)??s.historico[0],/declarado/);
  ({s,a,b}=await duelo('draven-thorne'));
  const c=adicionar(s,await fichaRev('soldado'),'Soldado II');c.x=6;c.init=5;s.ordem=[a.id,b.id,c.id];b.pv=0;
  s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,()=>0);
  assert.equal(atual(s).id,c.id,'pulou o soldado a 0 PV');
});

test('#14 #15 #16 #17 Toque Chocante, Fogo das Fadas, Invisibilidade, Orientação e Golpe Certeiro',async()=>{
  // Toque Chocante: o alvo atingido fica sem reação
  let {s,a,b}=await duelo('nikki');
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'toque chocante').id,alvo:b.id},player,roladorSala().rolar);
  assert.equal(s.atores[1].reacao,0);assert.ok(s.atores[1].efeitosAtivos.some(e=>/Toque Chocante/.test(e.nome)));
  // Fogo das Fadas: Invisível não dá vantagem nem desvantagem contra
  b=s.atores[1];b.efeitosAtivos=[{id:'i',nome:'Invisível',condicao:'invisivel'},{id:'f',nome:'Iluminado',restricoes:{vantagemAtaquesContra:true,anulaInvisivel:true}}];
  const r=restricoesAtivas(b);assert.ok(!r.vantagemAtaques&&!r.desvantagemAtaquesContra&&r.vantagemAtaquesContra);
  assert.equal(opRev((await duelo('hannah-montana')).a,'fogo das fadas').automacao.efeitoFalha.restricoes.anulaInvisivel,true);
  // Invisibilidade termina ao atacar
  ({s,a,b}=await duelo('skimi',undefined,{distancia:6}));
  a.efeitosAtivos=[{id:'inv',nome:'Invisível',condicao:'invisivel',encerraAoAgir:true}];
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'rajada mistica').id,alvo:b.id},player,roladorSala().rolar).catch(async()=>aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'rajada mistica').id,alvos:[b.id]},player,roladorSala().rolar));
  assert.ok(!s.atores[0].efeitosAtivos.some(e=>e.condicao==='invisivel'));
  assert.equal(opRev((await duelo('skimi')).a,'invisibilidade').automacao.efeito.encerraAoAgir,true);
  // Orientação dura (não some no primeiro teste) e Golpe Certeiro sem Arquearia
  assert.equal(opRev((await duelo('zurich')).a,'orientacao').automacao.modificador.removeAoUsar,false);
  const golpe=opRev((await duelo('dragoberto')).a,'golpe certeiro');assert.equal(golpe.automacao.bonus,4);
  assert.equal(validar(structuredClone(await fichaRev('dragoberto'))).opcoes.find(o=>o.id===golpe.id).automacao.bonus,4,'não desconta duas vezes');
});

test('#28 Lentidão, Garantido e Ancestralidade Feérica',async()=>{
  // Lentidão: arco longo do Zurich tira 3 m do alvo no turno dele
  let {s,a,b}=await duelo('zurich',undefined,{distancia:6});
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'arco longo').id,alvo:b.id},player,roladorSala().rolar);
  const desl=deslocamentoMaximo(s.atores[1]);assert.ok(s.atores[1].efeitosAtivos.some(e=>e.nome==='Lentidão'));
  s=await aplicar(s,{rev:s.rev,tipo:'passar',ator:a.id},player,()=>0);
  assert.equal(s.atores[1].metros,desl);assert.equal(desl,deslocamentoMaximo({ficha:s.atores[1].ficha,efeitosAtivos:[]})-3);
  // Garantido: Espada Grande do Draven erra e ainda causa o modificador de FOR
  ({s,a,b}=await duelo('draven-thorne'));const pv=b.pv,espada=opRev(a,'espada grande');assert.ok(espada.automacao.danoAoErrar>0);
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:espada.id,alvo:b.id},player,roladorSala({d20:2}).rolar);
  assert.equal(s.atores[1].pv,pv-espada.automacao.danoAoErrar);
  // Ancestralidade Feérica: Hannah tem Vantagem contra Enfeitiçar Pessoa
  ({s,a,b}=await duelo('skimi','hannah-montana'));
  assert.deepEqual(b.ficha.vantagemSalvasContra,['enfeiticado']);
  const r=roladorSala({salva:18});
  await aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'enfeiticar pessoa').id,alvos:[b.id]},player,r.rolar).catch(e=>aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'enfeiticar pessoa').id,alvo:b.id},player,r.rolar));
  assert.match(r.formulas.find(x=>x.meta.tipo==='salvaguarda').f,/^2d20kh1/);
});

test('#31 Inspiração de Bardo só em outra criatura; #21 Torrente de Golpes é desarmada e contundente',async()=>{
  let {s,a,b}=await duelo('hannah-montana');
  const insp=opRev(a,'inspiracao de bardo');
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:insp.id,alvo:a.id},player,roladorSala().rolar),/não pode ser você/);
  const tor=opRev((await duelo('loteria')).a,'torrente');
  assert.ok(tor.automacao.ataques.every(r=>r.tags.includes('desarmado')&&r.elemento==='contundente'));
});

test('#27 #34 sobras escondidas, Defletir só C/C/P, Vigor Implacável e Metabolismo na iniciativa',async()=>{
  for(const id of idsJogadores){const {a}=await duelo(id);assert.ok(!opcoesDisponiveis(a).some(o=>/^(Perícia \||Nota de importação$|Concentração e turno$)/.test(o.nome)),id);}
  let {s,a,b}=await duelo('loteria');
  assert.deepEqual(opRev(a,'defletir').automacao.elementos,['contundente','cortante','perfurante']);
  // Vigor Implacável: cai a 1 PV uma vez
  a.pv=3;a.rec['vigor-implacavel']=1;s.vez=1;
  s=await aplicar(s,{rev:s.rev,tipo:'usar',ator:b.id,opcao:opcoesDisponiveis(b).find(o=>o.automacao?.tipo==='ataque').id,alvo:a.id},gm,roladorSala({dano:10}).rolar);
  if(s.reacaoPendente)s=await aplicar(s,{rev:s.rev,tipo:'resolverReacao',ator:a.id},player,roladorSala({dano:10}).rolar).catch(()=>s);
  assert.equal(s.atores[0].pv,1);assert.equal(s.atores[0].rec['vigor-implacavel'],0);
  // Metabolismo: só antes do primeiro turno terminar
  ({s,a,b}=await duelo('loteria'));a.jaAgiuNoCombate=true;
  await assert.rejects(aplicar(s,{rev:s.rev,tipo:'usar',ator:a.id,opcao:opRev(a,'metabolismo').id},player,roladorSala().rolar),/Iniciativa/);
});
