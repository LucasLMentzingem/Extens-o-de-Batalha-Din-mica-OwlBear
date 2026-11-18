import {modelosReanimacao} from './modelos/reanimacao.mjs?v=0.8.70';

const normalizar=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function modeloReanimacao(ator){
  if(!ator||ator.pv>0||ator.ficha.tipo==='pj'&&ator.estadoVida!=='morto')return null;
  if(ator.sobreposicaoFicha||/morto.?vivo|zumbi/.test(normalizar(ator.ficha.tipoCriatura+' '+ator.ficha.especie)))return null;
  if(ator.ficha.reanimacao?.aventura==='aventura-no-cemiterio'&&ator.ficha.reanimacao.modelo==='zumbigoblin')return 'zumbigoblin';
  const tipo=normalizar(ator.ficha.tipoCriatura);
  if(tipo)return tipo==='humanoide'?'zumbi':null;
  return /humano|elfo|drow|anao|halfling|gnomo|draconato|tiferino/.test(normalizar(ator.ficha.especie))?'zumbi':null;
}

// O inventário atual é a única fonte de loot. O retrato da ficha original não
// contém itens, evitando ressuscitar objetos já saqueados ou transferidos.
export function sobreporMortoVivo(s,alvo,conjurador,{validar,compactarFicha,encerrarConcentracao}){
  const modelo=modeloReanimacao(alvo);if(!modelo)throw Error('Escolha um humanoide morto ou um goblin marcado da aventura.');
  const ficha=validar(modelosReanimacao[modelo]);
  const original=compactarFicha(alvo.ficha);original.inventario.itens=[];
  const estadoOriginal={pv:alvo.pv,pvTemporarios:alvo.pvTemporarios,estadoVida:alvo.estadoVida,rec:structuredClone(alvo.rec),dono:alvo.dono,salvaguardasMorte:structuredClone(alvo.salvaguardasMorte)};
  const itens=alvo.ficha.inventario.itens;
  for(const i of itens){i.equipado=false;i.preferido=false;delete i.equipadoSlot;}
  ficha.inventario.itens=itens;
  encerrarConcentracao(s,alvo,'reanimação');
  for(const a of s.atores){
    if(a.saqueAberto?.origem?.id===alvo.id||a.saqueAberto?.alvoId===alvo.id)delete a.saqueAberto;
  }
  s.filaReacoes=(s.filaReacoes??[]).filter(r=>r.reator!==alvo.id&&r.alvo!==alvo.id);
  for(const k of ['efeitosAtivos','auxilioRegistrado','concentracaoAtiva','bencao','modificadoresRolagem','saqueAberto','reacaoIniciativa','escolhasDescanso','invocacao','jaAgiuNoCombate','reforcoAdiantado'])delete alvo[k];
  alvo.sobreposicaoFicha={tipo:'reanimacao',modelo,conjuradorId:conjurador.id,nomeOriginal:alvo.nome,fichaOriginal:original,estadoOriginal,inventarioCompartilhado:true,controleAssistido:true};
  alvo.ficha=ficha;alvo.nome=(modelo==='zumbigoblin'?'Zumbigoblin':'Zumbi')+' · '+alvo.nome;
  alvo.pv=ficha.pvMaximos;alvo.pvTemporarios=0;alvo.estadoVida='consciente';alvo.salvaguardasMorte={sucessos:0,falhas:0};
  alvo.rec=Object.fromEntries(ficha.recursos.map(r=>[r.id,r.saldoInicial]));
  alvo.usosTurno={};alvo.eventosTurno={ataques:[],acertos:[]};alvo.dono=null;
  // Entra sem ação disponível durante o turno em curso; economia volta na vez seguinte.
  alvo.acao=s.fase==='preparo'?1:0;alvo.bonus=s.fase==='preparo'?1:0;alvo.reacao=s.fase==='preparo'?1:0;alvo.metros=s.fase==='preparo'?ficha.deslocamentosM.andar:0;
  return modelo;
}

export function removerSobreposicao(alvo,validar){
  const camada=alvo.sobreposicaoFicha;if(!camada)throw Error('Esta ficha não possui sobreposição.');
  if(camada.tokenOriginal)alvo.restauracaoTokenPendente=structuredClone(camada.tokenOriginal);
  const ficha=validar(camada.fichaOriginal);
  ficha.inventario.itens=alvo.ficha.inventario.itens;
  alvo.ficha=ficha;alvo.nome=camada.nomeOriginal;
  Object.assign(alvo,structuredClone(camada.estadoOriginal));
  delete alvo.efeitosAtivos;delete alvo.concentracaoAtiva;delete alvo.saqueAberto;
  delete alvo.sobreposicaoFicha;
}
