// Preferências pessoais. Só referências, nunca cópias de habilidades/fichas.
export function normalizarFavorito(f){
  if(!f||!['opcao','passiva','item','teste'].includes(f.tipo))return null;
  if(f.tipo==='teste')return ['pericias','salvaguardas'].includes(f.grupo)&&typeof f.chave==='string'&&f.chave.length>0&&f.chave.length<=100?{tipo:f.tipo,grupo:f.grupo,chave:f.chave}:null;
  if(typeof f.id!=='string'||!f.id.length||f.id.length>200)return null;
  return {tipo:f.tipo,id:f.id,...(f.tipo==='opcao'&&f.gratuito===true?{gratuito:true}:{})};
}
export const chaveFavorito=f=>JSON.stringify(normalizarFavorito(f));
export function lerFavoritos(storage,chave){
  try{const lista=JSON.parse(storage.getItem(chave)??'[]');if(!Array.isArray(lista))return [];const vistos=new Set();return lista.map(normalizarFavorito).filter(f=>{if(!f)return false;const id=chaveFavorito(f);if(vistos.has(id))return false;vistos.add(id);return true;}).slice(0,256);}catch{return [];}
}
export function mudarFavorito(storage,chave,f,remover=false){
  f=normalizarFavorito(f);if(!f)throw Error('Favorito inválido.');
  const lista=lerFavoritos(storage,chave),id=chaveFavorito(f),existe=lista.some(x=>chaveFavorito(x)===id);
  if(!remover&&!existe&&lista.length>=256)throw Error('Limite de 256 favoritos por personagem.');
  const nova=remover?lista.filter(x=>chaveFavorito(x)!==id):existe?lista:[...lista,f];
  storage.setItem(chave,JSON.stringify(nova));return nova;
}
