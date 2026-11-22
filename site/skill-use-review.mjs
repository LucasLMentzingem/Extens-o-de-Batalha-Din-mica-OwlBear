import {coberturasUso} from './catalogos/cobertura-uso.mjs?v=0.8.83';
const normal=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const ordenar=x=>Array.isArray(x)?x.map(ordenar):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().filter(k=>x[k]!==undefined).map(k=>[k,ordenar(x[k])])):x;
function hash(x){let h=0xcbf29ce484222325n;for(const c of JSON.stringify(ordenar(x))){h^=BigInt(c.charCodeAt(0));h=BigInt.asUintN(64,h*0x100000001b3n);}return h.toString(16);}
export function coberturaUso(o){
  if(o.aprimoramento&&o.gatilho==='apos_acerto')return {tipo:'contextual',contexto:'acerto',parteManual:'Este adicional pertence ao dano de um acerto elegível. Não será aplicado como habilidade avulsa.'};
  if(o.rerrolagem)return {tipo:'contextual',contexto:'rolagem',parteManual:'Esta opção altera uma rolagem elegível ainda aberta; não cria uma rerrolagem avulsa.'};
  if(o.metamagiaAoConjurar)return {tipo:'contextual',contexto:'conjuracao',parteManual:'Selecione esta metamagia no compositor da magia que será conjurada.'};
  if(o.modificadorDano||o.categoria==='passiva'||['habilidade.manobras','habilidade.presa-do-cacador'].includes(o.catalogoRef))return {tipo:'informativa',parteManual:o.descricao??'Traço ou escolha sem execução independente.'};
  if(o.gatilho==='rolar_iniciativa')return {tipo:'contextual',contexto:'iniciativa',parteManual:'Use esta habilidade somente na janela de Iniciativa.'};
  const explicita=o.revisaoUso;if(explicita&&!(explicita.tipo==='automatica'&&!o.automacao))return explicita;
  const configurada=coberturasUso[o.catalogoRef];if(configurada)return configurada;
  if(o.automacao?.tipo==='prototipo'&&['animar','taumaturgia','luz','detectar','protecao','prece','acalmar','dissipar','remover','revivificar','expulsar'].includes(o.automacao.modo))return {tipo:'hibrida',parteManual:'Aplica a parte configurada do protótipo; objetos, informações e consequências externas continuam assistidos pelo mestre.'};
  if(!o.automacao)return {tipo:'assistida',parteManual:'O sistema registra o uso e cobra os custos indicados. O efeito e os testes necessários serão resolvidos pela mesa.'};
  return {tipo:'automatica'};
}
export function precisaRevisaoUso(o){return Boolean(o&&(coberturaUso(o).tipo!=='automatica'||o.gatilho||o.requisitosUso||normal(o.descricao).includes('ritual')));}
export function avaliarRevisaoUso({s,a,o,c,u,plano,componentes=[],requisitosErro,disponivel=true,restricoes={},pvMaximo}){
  const motivos=[],consequencias=[],cobertura=coberturaUso(o),adicionar=(codigo,texto,severidade='aviso')=>motivos.push({codigo,texto,severidade});
  const fora=s.fase==='preparo'||a.emCombate===false,reacao=o.custo?.some(x=>x.tipo==='reacao'),manual=c.tipo==='reagir'||c.tipo==='usar'&&reacao;
  let resultado='permitir',encaminhamento;
  const bloquear=(codigo,texto)=>{resultado='bloquear';adicionar(codigo,texto,'erro');};
  if(!disponivel)bloquear('indisponivel','Esta habilidade exige preparo, ativação ou equipamento adequado.');
  if(a.pv<=0)bloquear('inconsciente','O personagem precisa estar consciente para executar esta habilidade.');
  if(!plano)bloquear('custo',c.modoCusto==='gratuito'?'Esta habilidade não possui uso gratuito.':'Saldo insuficiente ou custo inválido.');
  if(requisitosErro)bloquear('requisito',requisitosErro);
  if(restricoes.semAcoes||reacao&&restricoes.semReacao)bloquear('impedido','Uma condição impede esta ação ou reação.');
  if(!fora&&!manual&&s.ordem?.[s.vez]!==a.id)bloquear('turno','Aguarde o turno desse personagem.');
  if(o.requisitosUso?.somenteForaCombate&&!fora)bloquear('fora-combate','Esta habilidade só pode ser usada fora de combate.');
  if(a.reacaoIniciativa)bloquear('iniciativa-pendente','Resolva a escolha de Iniciativa antes de agir.');
  const custos=(plano?.custos??[]).filter(x=>!fora||x.tipo==='recurso'||manual&&!fora).map(x=>{
    const saldo=x.tipo==='recurso'?(a.rec?.[x.id]??0):(a[x.tipo]??0),nome=x.tipo==='recurso'?(a.ficha.recursos??[]).find(r=>r.id===x.id)?.nome??x.id:{acao:'Ação',bonus:'Ação bônus',reacao:'Reação'}[x.tipo]??x.tipo;
    return {...x,nome,saldo};
  });
  for(const x of custos)if(x.saldo<x.quantidade)bloquear('saldo','Saldo insuficiente para '+x.nome+'.');
  if(cobertura.tipo==='informativa'){resultado=resultado==='bloquear'?resultado:'informar';adicionar('informativa',cobertura.parteManual);}
  if(cobertura.tipo==='contextual'&&resultado!=='bloquear'){
    resultado='encaminhar';encaminhamento=cobertura.contexto;adicionar('contexto',cobertura.parteManual);
  }
  if(manual){
    if(o.gatilho==='ser_atingido'){bloquear('reacao-preventiva','Use esta habilidade na janela automática de reação ao acerto.');encaminhamento='reacao';}
    else{
      adicionar('reacao-manual','Reação manual: o gatilho não foi verificado por uma janela automática. Este caminho registra e cobra o uso; não executa ataque, dano ou salvaguarda.');
      if(o.descricao)adicionar('gatilho-texto','Gatilho e condições para conferir: '+o.descricao);
      const pend=s.reacaoPendente;if(pend?.reator===a.id&&pend.opcoes?.includes(o.id)){resultado=resultado==='bloquear'?resultado:'encaminhar';encaminhamento='reacao';adicionar('reacao-aberta','Há uma reação automática pendente para esta habilidade. Use essa janela para resolver o efeito.');}
    }
  }else if(cobertura.tipo==='assistida'||cobertura.tipo==='hibrida'){
    adicionar(cobertura.tipo,cobertura.parteManual);
    if(cobertura.tipo==='assistida'&&o.descricao)adicionar('condicoes-texto','Condições para conferir: '+o.descricao);
  }
  if(o.id==='gastar-dado-de-vida'&&(!a.descansoCurtoAtivo||Number.isFinite(a.descansoCurtoAtivo.x)&&Math.hypot(a.x-a.descansoCurtoAtivo.x,a.y-a.descansoCurtoAtivo.y)>1e-6))bloquear('descanso','Gastar Dado de Vida exige um descanso curto concedido pelo mestre, sem deslocamento posterior.');
  if(a.recuperacaoMagica)bloquear('recuperacao','Cancele ou conclua a recuperação em andamento antes de agir.');
  if(o.id==='astucia-magica-acao')adicionar('tempo','Inicia 1 minuto de recuperação. O espaço e o uso serão atualizados somente quando o mestre avançar o tempo.');
  if(normal(o.descricao).includes('ritual'))adicionar('ritual','Este botão usa o modo e os custos configurados abaixo. Uma alternativa ritual não configurada deve ser combinada com o mestre; confirmar não remove automaticamente o custo de espaço.');
  if(o.concentracao&&a.concentracaoAtiva)consequencias.push('Substitui a concentração atual: '+a.concentracaoAtiva.nome+'.');
  if((o.categoria==='magia'||o.automacao?.tipo==='ataque'||o.automacao?.dano)&&(a.efeitosAtivos??[]).some(e=>e.encerraAoAgir))consequencias.push('Encerra proteções ou invisibilidade configuradas para terminar ao agir.');
  if(o.automacao?.tempoSegundos)consequencias.push('Conjuração de '+o.automacao.tempoSegundos+' segundos: o espaço será cobrado na conclusão; interrupção preserva esse espaço.');
  if(c.movimentoDinamico)consequencias.push('O movimento será executado após a confirmação; oportunidades podem interromper a habilidade.');
  for(const x of componentes)consequencias.push('Componente consumido: '+x.quantidade+' × '+x.nome+' (saldo '+x.saldo+').');
  if(resultado==='permitir'&&motivos.length)resultado='confirmar';
  const ids=[...new Set([c.alvo,...(c.alvos??[]),...(c.composicao??[]).map(x=>x.alvoId)].filter(Boolean))];
  const dependencias=ids.map(id=>{const p=s.atores.find(x=>x.id===id);return p?{id,pv:p.pv,estadoVida:p.estadoVida,efeitos:p.efeitosAtivos,concentracao:p.concentracaoAtiva}:id;});
  const intencao={tipo:c.tipo,ator:c.ator,opcao:c.opcao,alvo:c.alvo,alvos:c.alvos,composicao:c.composicao,parametros:c.parametros,circuloUsado:c.circuloUsado,modoCusto:c.modoCusto,magiaDuplicada:c.magiaDuplicada,ilusaoCausaDano:c.ilusaoCausaDano,movimentoDinamico:c.movimentoDinamico,atividadeId:c.atividadeId,ponto:c.ponto,x:c.x,y:c.y,modo:c.modo??'normal',ajuste:c.ajuste??0,dadosAjuste:c.dadosAjuste??[]};
  const impressao=resultado==='permitir'?null:hash({usuario:u.id,ator:a.id,dono:a.dono,fase:s.fase,rodada:s.rodada,vez:s.ordem?.[s.vez],o,intencao,custos,componentes,motivos,consequencias,pv:a.pv,pvMaximo,efeitos:a.efeitosAtivos,concentracao:a.concentracaoAtiva,eventos:a.eventosTurno,usos:a.usosTurno,descanso:a.descansoCurtoAtivo,dependencias});
  return {versao:1,resultado,titulo:o.nome,motivos,custos,consequencias,cobertura,encaminhamento,impressao,codigos:[...new Set(motivos.map(m=>m.codigo))]};
}
export function aceitarRevisaoUso(r,id=crypto.randomUUID()){
  if(r.resultado!=='confirmar')throw Error('Esta revisão não pode ser confirmada.');
  return {versao:1,id,impressao:r.impressao,codigos:r.codigos};
}
export function validarAceiteUso(r,aceite){
  if(r.resultado==='permitir')return;
  if(r.resultado!=='confirmar')throw Error(r.motivos.map(m=>m.texto).join(' '));
  if(!aceite||aceite.versao!==1||typeof aceite.id!=='string'||aceite.id.length<8||aceite.id.length>100||aceite.impressao!==r.impressao||JSON.stringify(aceite.codigos)!==JSON.stringify(r.codigos))throw Error('Confirme a segunda verificação de uso com os custos e o contexto atuais.');
}
export function textoRevisaoUso(r){
  return [...r.motivos.map(m=>m.texto),'Custo efetivo: '+(r.custos.length?r.custos.map(x=>x.quantidade+' '+x.nome+' (saldo '+x.saldo+')').join('; '):'nenhum recurso debitado.'),...r.consequencias].join('\n\n');
}
