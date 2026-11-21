export const normalizarEfeito=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^(?:truque|\d+º)\s*\|\s*/,'').split(/\s*[|·]\s*/)[0].trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function listarEfeitosHud(a,atores=[]){
  if(!a)return [];
  const lista=(a.efeitosAtivos??[]).map((e,i)=>({...e,hudId:'efeito-'+(e.id??i)}));
  if(a.concentracaoAtiva)lista.unshift({hudId:'concentracao-'+a.concentracaoAtiva.id,nome:a.concentracaoAtiva.nome,tipo:'concentracao',opcaoId:a.concentracaoAtiva.opcao,origemAtorId:a.id,descricao:'Concentração ativa. Termina ao perder ou encerrar a concentração.'});
  for(const origem of atores)if(origem.bencao?.alvos?.includes(a.id))lista.push({hudId:'bencao-'+origem.id,nome:'Bênção',tipo:'buff',origemAtorId:origem.id,opcaoId:origem.ficha?.opcoes?.find(o=>o.automacao?.tipo==='bencao')?.id,descricao:'Adiciona 1d4 aos ataques e salvaguardas enquanto a bênção durar.',duracao:{restante:origem.bencao.turnos},concentracaoId:origem.bencao.concentracaoId});
  if(a.desengajado&&!lista.some(e=>normalizarEfeito(e.nome)==='desengajado'))lista.push({hudId:'desengajado',nome:'Desengajado',tipo:'buff',descricao:'Seu deslocamento não provoca os ataques de oportunidade tratados pelo sistema até o próximo turno.'});
  if(a.pvTemporarios>0)lista.push({hudId:'pv-temporarios',nome:'PV temporários',tipo:'buff',hudSaldo:a.pvTemporarios,descricao:'Pontos de vida temporários ativos.'});
  if(a.estadoVida==='inconsciente'&&!lista.some(e=>e.condicao==='inconsciente'))lista.push({hudId:'vida-inconsciente',nome:'Inconsciente',tipo:'condicao',condicao:'inconsciente',descricao:'Inconsciente a 0 PV; pode precisar de salvaguardas contra a morte.'});
  if(a.estadoVida==='estavel')lista.push({hudId:'vida-estavel',nome:'Estável',tipo:'neutro',descricao:'Inconsciente, mas estável. Não faz salvaguardas contra a morte enquanto permanecer estável.'});
  if(a.estadoVida==='morto')lista.push({hudId:'vida-morto',nome:'Morto',tipo:'condicao',descricao:'Personagem morto.'});
  return lista;
}
export function temaEfeito(e){
  const nome=normalizarEfeito(e.nome),r=e.restricoes??{};
  if(e.tipo==='concentracao')return 'concentracao';
  if(e.preceRecebida||nome==='estavel'||e.conjuracaoLonga)return 'neutro';
  if(e.condicao==='invisivel')return 'buff';
  if(e.condicao||e.tipo==='condicao'||e.expulsao||nome==='morto')return 'condicao';
  if(e.maldicao||e.tipo==='debuff'||e.reducaoDanoFormula||e.bloqueiaCura||e.penalidadeProximaSalva||e.danoInicioTurno||e.zerarReacao)return 'debuff';
  if(Object.values(e.modificadores??{}).some(n=>Number(n)<0)||r.semAcoes||r.semBonus||r.semReacao||r.vantagemAtaquesContra||r.desvantagemAtaques||r.anulaInvisivel||r.desvantagemD20?.length)return 'debuff';
  if(e.tipo==='buff'||e.vantagemAtaque||e.bonusCD>0||e.suprimeCondicoes?.length||e.opcoesConcedidas?.length||e.vantagemPericias?.length||Object.values(e.modificadores??{}).some(n=>Number(n)>0))return 'buff';
  return 'neutro';
}
export function resumoEfeito(e,{revelarValores=true}={}){
  const mods=Object.entries(e.modificadores??{}).map(([k,n])=>({ca:'CA',pvMaximos:'PV máximo',deslocamentoM:'Deslocamento'}[k]??k)+' '+(n>=0?'+':'')+n);
  const restante=e.duracao?.restante??e.turnos;
  const tempo=restante!=null?'Duração: '+restante+' turno(s)':e.removeEm==='descanso_longo'?'Até o descanso longo':e.removeEm==='descanso_curto'?'Até o descanso curto':e.tipo==='concentracao'?'Concentração':'Duração especial';
  return [e.tipo==='concentracao'?'Concentração · '+e.nome:e.nome,e.descricao,...mods,e.hudSaldo!=null&&revelarValores?e.hudSaldo+' PV temporários':null,tempo,e.elemento?'Elemento: '+e.elemento:null].filter(Boolean).join('\n');
}
