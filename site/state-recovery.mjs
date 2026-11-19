import {validar,atualizarMagias,normalizarComercio,normalizarZonas} from './engine.mjs?v=0.8.72';

// A ficha original isolada nunca é normalizada nem compactada: permite recuperar/exportar o dado exato.
export function recuperarEstado(salvo){
  const s=structuredClone(salvo);
  if(!s||!Array.isArray(s.atores))throw Error('O estado salvo da mesa está inválido. Exporte o backup antes de restaurar.');
  s.quarentenaFichas=Array.isArray(s.quarentenaFichas)?s.quarentenaFichas:[];
  const validos=[],novas=[];
  for(const original of s.atores){
    try{
      if(!original||typeof original.id!=='string')throw Error('Registro de personagem sem identificador.');
      const ator=structuredClone(original);ator.ficha=validar(ator.ficha);atualizarMagias(ator.ficha);validos.push(ator);
    }catch(e){
      const registro={id:crypto.randomUUID(),atorId:original?.id??null,nome:original?.nome??original?.ficha?.nome??'Ficha sem nome',erro:e.message,original:structuredClone(original)};
      novas.push(registro);s.quarentenaFichas.push(registro);
    }
  }
  s.atores=validos;
  if(novas.length){
    // Não avançar combate com um participante ou dependência que deixou de ser válido.
    s.fase='preparo';s.ordem=[];s.vez=0;s.rodada=0;s.filaReacoes=[];
    delete s.reacaoPendente;delete s.resolucaoPendente;delete s.movimentoPendente;
    const ids=new Set(novas.map(x=>x.atorId).filter(Boolean));
    for(const ator of s.atores)if(ids.has(ator.saqueAberto?.origem?.id))delete ator.saqueAberto;
    for(const troca of s.comercio?.trocas??[])if(troca.status==='ofertas'||troca.status==='final')troca.status='cancelada';
    s.rev=(s.rev??0)+1;
    s.historico??=[];s.historico.unshift(novas.length+' ficha(s) inválida(s) isolada(s) para recuperação. Originais preservados para o mestre.');
  }
  normalizarComercio(s);normalizarZonas(s);
  return {estado:s,novas};
}

export function excluirFichaIsolada(s,id,u,{confirmado,confirmacaoFinal,rev}={}){
  if(u.role!=='GM')throw Error('Somente o mestre pode excluir fichas em recuperação.');
  if(!confirmado||!confirmacaoFinal)throw Error('Confirme a exclusão nas duas etapas.');
  if(rev!==s.rev)throw Error('A mesa mudou. Atualize antes de excluir.');
  const registro=s.quarentenaFichas?.find(x=>x.id===id);
  if(!registro)throw Error('Ficha em recuperação não encontrada.');
  s.quarentenaFichas=s.quarentenaFichas.filter(x=>x!==registro);s.rev++;
  return registro;
}
