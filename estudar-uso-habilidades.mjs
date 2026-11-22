import fs from 'node:fs';import {novo,adicionar,validar,aplicar,opcoesDisponiveis,avaliarFormula} from './site/engine.mjs';
const resultados=[];
async function prova(id,arquivo,find,{fora=false,tipo='usar',cmd={},setup}={}){
 const s=novo(),a=adicionar(s,JSON.parse(fs.readFileSync(arquivo))),b=adicionar(s,JSON.parse(fs.readFileSync('site/fichas/soldado.json')));a.dono='j1';a.x=a.y=0;b.x=.75;b.y=0;s.pvp=true;
 if(!fora){s.fase='turnos';s.rodada=1;s.ordem=[a.id,b.id];s.vez=0;a.init=20;b.init=10;}
 if(setup)setup(s,a,b);const o=opcoesDisponiveis(a).find(find);if(!o)throw Error('Não achou '+id);const before=structuredClone(a),calls=[];
 try{const n=await aplicar(s,{tipo,rev:s.rev,ator:a.id,opcao:o.id,alvo:b.id,assistido:!o.automacao,...cmd},a.ficha.tipo==='pj'?{id:'j1',role:'PLAYER'}:{id:'gm',role:'GM'},async(f,m)=>{calls.push({formula:f,tipo:m?.tipo});if(Array.isArray(f))return {total:0,resultados:f.map(x=>avaliarFormula(x.formula??x,l=>Math.min(4,l)))};return avaliarFormula(f,l=>Math.min(4,l));});const p=n.atores.find(x=>x.id===a.id);resultados.push({id,arquivo,habilidade:o.nome,opcao:o.id,aceito:true,comando:{tipo,opcao:o.id,assistido:!o.automacao,...cmd},custo:o.custo,recAntes:before.rec,recDepois:p.rec,acaoAntes:before.acao,acaoDepois:p.acao,reacaoAntes:before.reacao,reacaoDepois:p.reacao,pvAntes:before.pv,pvDepois:p.pv,rolagens:calls,historico:n.log?.slice(-1)??n.historico?.slice(-1)});}catch(e){resultados.push({id,arquivo,habilidade:o.nome,opcao:o.id,aceito:false,comando:{tipo,opcao:o.id,assistido:!o.automacao,...cmd},erro:e.message,rolagens:calls});}
}
const f=n=>'site/fichas/'+n+'.json';
await prova('P01-mao-dolo-avulsa',f('loteria'),o=>o.gatilho==='apos_acerto');
await prova('P02-manobra-avulsa',f('draven-thorne'),o=>o.id==='manobra-prostrar');
await prova('P03-saraivada-avulsa',f('zurich'),o=>o.gatilho==='apos_acerto'&&/saraivada/i.test(o.nome));
await prova('P04-rerrolagem-avulsa',f('nikki'),o=>o.gatilho==='apos_rolagem_dano');
await prova('P05-sorte-avulsa',f('skimi'),o=>o.gatilho==='apos_rolagem_d20');
await prova('P06-constritor-sem-acerto',f('dragoberto'),o=>o.requisitosUso?.aposAcerto);
await prova('P07-golpe-comando-sem-acerto',f('reino-comandante-4'),o=>o.id==='reino-comandante-4-habilidade-4');
await prova('P08-repreensao-manual',f('nikki'),o=>o.gatilho==='sofrer_dano',{tipo:'reagir'});
await prova('P09-oportunidade-manual',f('zurich'),o=>o.gatilho==='sair_alcance',{tipo:'reagir'});
await prova('P10-escudo-manual','site/downloads/fichas-prototipo-0.8.58/drow-necromante-6.json',o=>o.gatilho==='ser_atingido',{tipo:'reagir',setup:(s,a)=>{a.ficha.tipo='pj';}});
await prova('P11-queda-suave-fora-combate',f('nikki'),o=>/queda suave/i.test(o.nome),{fora:true,tipo:'reagir'});
await prova('P12-dv-sem-descanso',f('loteria'),o=>o.id==='gastar-dado-de-vida',{fora:true,setup:(s,a)=>{a.pv=1;}});
await prova('P13-astucia-sem-espera',f('skimi'),o=>o.id==='astucia-magica-acao',{fora:true,setup:(s,a)=>{for(const k of Object.keys(a.rec))if(k.startsWith('espaco-'))a.rec[k]=0;}});
await prova('P14-reflexos',f('hannah-montana'),o=>/reflexos/i.test(o.nome));
await prova('P15-ajudar',f('zurich'),o=>/^Ajudar \|/.test(o.nome));
await prova('P16-metabolismo-avulso',f('loteria'),o=>o.gatilho==='rolar_iniciativa');
await prova('P17-segunda-arma-sem-ataque',f('skimi'),o=>o.geradaPorItem&&o.requisitosUso?.aposAtaque);
await prova('P18-conter-avanco-sem-acerto',f('reino-soldado-3'),o=>o.id==='reino-soldado-3-habilidade-4');
await prova('P19-reacao-fora-do-proprio-turno',f('nikki'),o=>o.gatilho==='sofrer_dano',{tipo:'reagir',setup:(s)=>{s.vez=1;}});
await prova('P20-astucia-em-combate',f('skimi'),o=>o.id==='astucia-magica-acao');
fs.writeFileSync('docs/mapeamento-uso-habilidades/provas-20-cenarios.json',JSON.stringify(resultados,null,2));for(const r of resultados)console.log(JSON.stringify({id:r.id,n:r.habilidade,aceito:r.aceito,erro:r.erro,rolagens:r.rolagens.length,gasto:r.aceito?Object.keys(r.recAntes).filter(k=>r.recAntes[k]!==r.recDepois[k]).map(k=>k+':'+r.recAntes[k]+'->'+r.recDepois[k]):undefined,reacao:r.aceito?r.reacaoAntes+'->'+r.reacaoDepois:undefined,pv:r.aceito?r.pvAntes+'->'+r.pvDepois:undefined}));
