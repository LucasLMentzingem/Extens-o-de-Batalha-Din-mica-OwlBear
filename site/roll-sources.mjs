// Cada parcela conserva a identidade da fonte, independentemente da seleção.
export function identificarParcelas(resultado,formula,adicionais=[]){
 const bases=Array.isArray(formula)?formula:[formula];
 const fontes=[...bases.map((f,i)=>({fonteId:i===0?'base':'base:'+i,fonteNome:bases.length>1?'Dano base '+(i+1):'Dano base',formulaFonte:f})),...adicionais.map(a=>({fonteId:a.id,fonteNome:a.nome,tipoFonte:a.elemento,formulaFonte:a.formula}))];
 const partes=resultado.resultados??(fontes.length===1?[{...resultado}]:null);
 if(!partes||partes.length!==fontes.length)throw Error('O resultado não contém todas as fontes da rolagem.');
 return {...resultado,resultados:partes.map((r,i)=>({...r,...fontes[i]}))};
}
export function parcelasPorFonte(resultado,adicionais=[]){
 const partes=resultado.resultados?.length?resultado.resultados:[resultado];
 if(!partes.some(p=>p.fonteId))return partes;
 const mapa=new Map();
 for(const p of partes){if(!p.fonteId||mapa.has(p.fonteId))throw Error('Fonte de dano ausente ou duplicada.');mapa.set(p.fonteId,p);}
 return ['base',...adicionais.map(a=>a.id)].map(id=>{const p=mapa.get(id);if(!p)throw Error('Resultado ausente para a fonte de dano '+id+'.');return p;});
}
export const destinoDicePublico=(usuario)=>usuario?.secreta||usuario?.role==='GM'?'dm':'everyone';
