// Grupos da lista de atores; a origem é persistida no ator, não na definição JSON.
export function agruparAtoresMestre(atores,grupos=[]){
 const mapa=new Map();
 for(const a of atores){
  const origem=a.grupoFicha??grupos.find(g=>g.fichas.some(f=>f.id===a.ficha.id))??(['soldado','soldado-guarda'].includes(a.ficha.id)?{id:'soldados-do-reino',nome:'Soldados do Reino'}:null);
  const g=a.ficha.tipo==='pj'?{id:'aventureiros',nome:'Aventureiros'}:origem??{id:a.invocacao?'invocacoes':'outros',nome:a.invocacao?'Invocações':'Outros personagens'};
  if(!mapa.has(g.id))mapa.set(g.id,{id:g.id,nome:g.nome,atores:[]});mapa.get(g.id).atores.push(a);
 }
 return [...mapa.values()].sort((a,b)=>a.id==='aventureiros'?-1:b.id==='aventureiros'?1:0);
}
