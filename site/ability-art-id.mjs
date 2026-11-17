// Identidade visual da habilidade, independente de bônus, custo e origem da concessão.
// As exceções aprovadas são o mesmo golpe desarmado, arma real e variantes da mesma magia.
export const normalizarNomeArte=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function nomeConceitoArte(h={}){
  const nome=String(h.nome??'Habilidade').replace(/^(?:Passivas?|Perícia|Truque|\d+º)\s*\|\s*/i,'').replace(/^\(Habilitado\)\s*/i,'');
  const detalhado=/^(?:Fonte de Magia|Ataque de Sopro|Arco\s*·)/i.test(nome);
  return nome.split(detalhado?/\s*[|—]\s*/:/\s*[|·—]\s*/)[0].replace(/\s+[+-]\d+\b/g,'').replace(/\s*\(2º círculo\)/i,'').trim();
}
export function identidadeArteHabilidade(h={}){
  const nome=normalizarNomeArte(nomeConceitoArte(h));
  if(/^Perícia\s*\|/i.test(h.nome??''))return 'pericia.'+nome.replace(/[^a-z0-9]+/g,'-');
  if(h.contextoVisual&&/explosao elemental/.test(normalizarNomeArte(h.contextoVisual)))return 'habilidade.explosao-elemental-'+nome.replace(/[^a-z0-9]+/g,'-');
  if(/^(?:golpe desarmado|soco(?: \(golpe desarmado\))?)$/.test(nome))return 'comum.soco';
  if(nome==='saraivada de espinhos')return 'magia.saraivada-de-espinhos';
  if(nome==='misseis magicos')return 'magia.misseis-magicos';
  if(nome==='raio de fogo')return 'magia.raio-de-fogo';
  if(nome==='torrente de golpes')return 'monge.torrente-de-golpes';
  return 'habilidade.'+nome.replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
