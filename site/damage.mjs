export const TIPOS_DANO=Object.freeze({
  acido:{nome:'Ácido',cor:'#A3E635',simbolo:'◌',modelo:'Acido'},
  contundente:{nome:'Contundente',cor:'#D6B98C',simbolo:'●',modelo:'Contundente'},
  frio:{nome:'Frio',cor:'#67E8F9',simbolo:'❄',modelo:'Frio'},
  fogo:{nome:'Fogo',cor:'#FF6B3D',simbolo:'▲',modelo:'Fogo'},
  forca:{nome:'Força',cor:'#D8B4FE',simbolo:'✦',modelo:'Forca'},
  raio:{nome:'Raio',cor:'#FDE047',simbolo:'ϟ',modelo:'Raio'},
  necrotico:{nome:'Necrótico',cor:'#8B5CF6',simbolo:'✢',modelo:'Necrotico'},
  perfurante:{nome:'Perfurante',cor:'#94A3B8',simbolo:'◆',modelo:'Perfurante'},
  veneno:{nome:'Veneno',cor:'#4ADE80',simbolo:'⬡',modelo:'Veneno'},
  psiquico:{nome:'Psíquico',cor:'#F472B6',simbolo:'◈',modelo:'Psiquico'},
  radiante:{nome:'Radiante',cor:'#FDE68A',simbolo:'☀',modelo:'Radiante'},
  cortante:{nome:'Cortante',cor:'#FB7185',simbolo:'╱',modelo:'Cortante'},
  trovejante:{nome:'Trovejante',cor:'#60A5FA',simbolo:'))) ',modelo:'Trovejante'}
});

const aliases={
  acid:'acido',ácido:'acido',acido:'acido',bludgeoning:'contundente',contundente:'contundente',cold:'frio',frio:'frio',
  fire:'fogo',fogo:'fogo',force:'forca','força':'forca',forca:'forca',lightning:'raio',eletrico:'raio','elétrico':'raio',raio:'raio',
  necrotic:'necrotico','necrótico':'necrotico',necrotico:'necrotico',piercing:'perfurante',perfurante:'perfurante',poison:'veneno',veneno:'veneno',
  psychic:'psiquico','psíquico':'psiquico',psiquico:'psiquico',radiant:'radiante',radiante:'radiante',slashing:'cortante',cortante:'cortante',
  thunder:'trovejante',trovao:'trovejante','trovão':'trovejante',trovejante:'trovejante'
};
const texto=x=>String(x??'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function normalizarTipoDano(tipo){return aliases[texto(tipo)]??(TIPOS_DANO[texto(tipo)]?texto(tipo):'forca');}
export function infoTipoDano(tipo){const id=normalizarTipoDano(tipo);return {id,...TIPOS_DANO[id]};}

const array=x=>Array.isArray(x)?x:[];
const tagsNormalizadas=xs=>[...new Set(array(xs).map(texto).filter(Boolean))];
export function normalizarParcelaDano(p={},indice=0){
  return {id:p.id??'parcela-'+indice,formula:p.formula??p.dano,valor:Math.max(0,Math.floor(Number(p.valor??p.total)||0)),tipo:normalizarTipoDano(p.tipo??p.elemento),tags:tagsNormalizadas(p.tags),origem:p.origem??null};
}
const filtroNormalizado=f=>({
  tipos:array(f?.tipos).map(normalizarTipoDano),todosTipos:Boolean(f?.todosTipos),tiposExcluidos:array(f?.tiposExcluidos).map(normalizarTipoDano),
  tagsTodas:tagsNormalizadas(f?.tagsTodas),tagsAlguma:tagsNormalizadas(f?.tagsAlguma),tagsExcluidas:tagsNormalizadas(f?.tagsExcluidas)
});
export function normalizarDefesaDano(d={},indice=0){
  const operacao=d.operacao??d.efeito??d.tipo;
  return {id:d.id??'defesa-'+indice,nome:d.nome??String(operacao??'Defesa'),operacao,valor:Number(d.valor??0),formula:d.formula,
    fator:Number(d.fator??d.multiplicador??0),escopo:d.escopo??'parcela',aplicacoes:d.aplicacoes??'cada_parcela',chaveAcumulo:d.chaveAcumulo??null,
    filtro:filtroNormalizado(d.filtro??{tipos:d.tipos,tagsTodas:d.tagsTodas,tagsAlguma:d.tagsAlguma,tagsExcluidas:d.tagsExcluidas,todosTipos:d.todosTipos,tiposExcluidos:d.tiposExcluidos}),
    origem:d.origem??null,visibilidade:d.visibilidade??'publica'};
}
function combinarLegado(lista,operacao,origem){return array(lista).map((tipo,i)=>normalizarDefesaDano({id:operacao+'-'+texto(tipo)+'-'+i,nome:(operacao==='resistencia'?'Resistência a ':operacao==='imunidade'?'Imunidade a ':'Vulnerabilidade a ')+infoTipoDano(tipo).nome,operacao,filtro:{tipos:[tipo]},origem},i));}
export function defesasDanoDoAtor(a){
  const fontes=[{valor:a?.ficha,origem:{tipo:'ficha',id:a?.ficha?.id}},{valor:a,origem:{tipo:'ator',id:a?.id}},
    ...array(a?.ficha?.passivas).filter(x=>x.ativa!==false).map(x=>({valor:x,origem:{tipo:'passiva',id:x.id}})),
    ...array(a?.ficha?.inventario?.itens).filter(x=>x.equipado).map(x=>({valor:x,origem:{tipo:'item',id:x.id}})),
    ...array(a?.efeitosAtivos).map(x=>({valor:x,origem:{tipo:x.tipo??'efeito',id:x.id}}))];
  const saida=[];
  for(const {valor,origem} of fontes){
    saida.push(...combinarLegado(valor?.resistencias,'resistencia',origem),...combinarLegado(valor?.imunidades,'imunidade',origem),...combinarLegado(valor?.vulnerabilidades,'vulnerabilidade',origem));
    for(const d of array(valor?.defesasDano))saida.push(normalizarDefesaDano({...d,origem:d.origem??origem},saida.length));
  }
  return saida;
}
export function resumoAlvoDano(a){return {id:a.id,nome:a.nome,pv:Math.max(0,Number(a.pv)||0),pvTemporarios:Math.max(0,Number(a.pvTemporarios)||0),pvMaximos:Math.max(0,Number(a.ficha?.pvMaximos)||0),defesas:defesasDanoDoAtor(a)};}
export function defesaAplica(defesa,parcela){
  const f=defesa.filtro??{},tags=new Set(parcela.tags??[]),tipo=normalizarTipoDano(parcela.tipo);
  if(f.tiposExcluidos?.includes(tipo)||f.tagsExcluidas?.some(x=>tags.has(x)))return false;
  if(!f.todosTipos&&f.tipos?.length&&!f.tipos.includes(tipo))return false;
  if(f.tagsTodas?.some(x=>!tags.has(x)))return false;
  if(f.tagsAlguma?.length&&!f.tagsAlguma.some(x=>tags.has(x)))return false;
  return Boolean(f.todosTipos||f.tipos?.length||f.tagsTodas?.length||f.tagsAlguma?.length||(!f.tiposExcluidos?.length&&!f.tagsExcluidas?.length));
}
const passo=(lista,operacao,antes,depois,defesa)=>lista.push({operacao,antes,depois,defesa:{id:defesa.id,nome:defesa.nome}});
export function resolverDano({parcelas=[],defesas=[],alvo={},ajustes=[]}={}){
  const ds=defesas.map(normalizarDefesaDano),ps=parcelas.map(normalizarParcelaDano),aj=ajustes.map(normalizarDefesaDano),usos=new Set();
  const relatorios=ps.map((parcela,indice)=>{
    let valor=parcela.valor;const passos=[];
    const aplicaveis=[...aj,...ds].filter(d=>defesaAplica(d,parcela));
    for(const d of aplicaveis.filter(x=>['bonus','reducao_fixa','reducao_dado','multiplicador'].includes(x.operacao))){
      if(d.aplicacoes==='uma'&&usos.has(d.id))continue;const antes=valor;
      if(d.operacao==='bonus')valor+=d.valor;else if(d.operacao.startsWith('reducao'))valor=Math.max(0,valor-d.valor);else valor=Math.max(0,Math.floor(valor*(d.fator||1)));
      if(d.aplicacoes==='uma')usos.add(d.id);if(valor!==antes)passo(passos,d.operacao,antes,valor,d);
    }
    const imunidade=aplicaveis.find(d=>d.operacao==='imunidade'||d.operacao==='absorcao');
    if(imunidade){const antes=valor;valor=0;passo(passos,imunidade.operacao,antes,valor,imunidade);}
    if(valor>0){const resistencia=aplicaveis.find(d=>d.operacao==='resistencia');if(resistencia){const antes=valor;valor=Math.floor(valor/2);passo(passos,'resistencia',antes,valor,resistencia);}}
    if(valor>0){const vulnerabilidade=aplicaveis.find(d=>d.operacao==='vulnerabilidade');if(vulnerabilidade){const antes=valor;valor*=2;passo(passos,'vulnerabilidade',antes,valor,vulnerabilidade);}}
    return {...parcela,indice,rolado:parcela.valor,final:Math.max(0,Math.floor(valor)),passos};
  });
  let danoRecebido=relatorios.reduce((n,p)=>n+p.final,0);
  const limiar=[...aj,...ds].filter(d=>d.operacao==='limiar').reduce((n,d)=>Math.max(n,d.valor),0),limiarAtivado=limiar>0&&danoRecebido<limiar;
  if(limiarAtivado){for(const p of relatorios){if(p.final)passo(p.passos,'limiar',p.final,0,{id:'limiar',nome:'Limiar de dano '+limiar});p.final=0;}danoRecebido=0;}
  const pvTempAntes=Math.max(0,Number(alvo.pvTemporarios)||0),pvAntes=Math.max(0,Number(alvo.pv)||0),absorvidoPorPvTemporario=Math.min(pvTempAntes,danoRecebido),restante=danoRecebido-absorvidoPorPvTemporario,pvPerdido=Math.min(pvAntes,restante),excesso=Math.max(0,restante-pvAntes);
  return {alvoId:alvo.id,alvoNome:alvo.nome,parcelas:relatorios,danoBruto:ps.reduce((n,p)=>n+p.valor,0),danoRecebido,absorvidoPorPvTemporario,pvTemporariosAntes:pvTempAntes,pvTemporariosDepois:pvTempAntes-absorvidoPorPvTemporario,pvAntes,pvDepois:pvAntes-pvPerdido,pvPerdido,excesso,limiar,limiarAtivado};
}
export function aplicarRelatorioDano(a,r,{critico=false,pvMaximos}={}){
  a.pvTemporarios=r.pvTemporariosDepois;a.pv=r.pvDepois;
  if(a.pv===0&&r.danoRecebido>0){
    if(a.estadoVida==='inconsciente'||a.estadoVida==='estavel'){
      a.estadoVida='inconsciente';a.salvaguardasMorte=a.salvaguardasMorte??{sucessos:0,falhas:0};a.salvaguardasMorte.falhas=Math.min(3,a.salvaguardasMorte.falhas+(critico?2:1));if(a.salvaguardasMorte.falhas>=3)a.estadoVida='morto';
    }else{a.estadoVida=r.excesso>=Number(pvMaximos??a.ficha?.pvMaximos??0)?'morto':'inconsciente';a.salvaguardasMorte={sucessos:0,falhas:0};}
  }
  return r;
}
export function relatoriosDaRolagem(resultado,meta={}){
  if(!['dano','dano-lote'].includes(meta.tipo))return [];
  const resultados=resultado.resultados?.length?resultado.resultados:[resultado],alvos=meta.alvosDano??(meta.alvoDano?[meta.alvoDano]:[]);
  if(!alvos.length)return [];
  if(meta.tipo==='dano-lote')return resultados.map((r,i)=>resolverDano({parcelas:[{valor:r.total,...(meta.parcelasDano?.[i]??{tipo:meta.instancias?.[i]?.tipoDano})}],defesas:alvos[i]?.defesas,alvo:alvos[i],ajustes:meta.ajustesDano?.[i]??[]}));
  const parcelas=resultados.map((r,i)=>({valor:r.total,...(meta.parcelasDano?.[i]??{tipo:i===0?meta.tipoDano:meta.adicionais?.[i-1]?.elemento})}));
  return alvos.map((alvo,i)=>resolverDano({parcelas,defesas:alvo.defesas,alvo,ajustes:meta.ajustesDanoPorAlvo?.[i]??meta.ajustesDano??[]}));
}
export function notacaoComModelosDano(formulas,parcelas,{ativado=false}={}){
  return formulas.map((formula,i)=>{const info=infoTipoDano(parcelas?.[i]?.tipo);return ativado?formula+'{'+info.modelo+'} # '+info.nome:formula+' # '+info.nome;});
}
