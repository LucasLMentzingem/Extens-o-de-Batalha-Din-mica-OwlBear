import {artesRecursos} from './catalogos/artes-recursos.mjs?v=0.8.62';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function chaveArteRecurso(id){
 const chave=String(id).replace(/^recurso:/,'');
 if(artesRecursos[chave])return chave;
 // Reservas concedidas por itens incluem o ID da instância no começo.
 return chave.startsWith('item-')?Object.keys(artesRecursos).find(k=>chave.endsWith('-'+k))??chave:chave;
}
export function arteRecurso(id){
 const chave=chaveArteRecurso(id);
 const arquivo=artesRecursos[chave]??artesRecursos.feiticaria;
 const imagem=(src,classe)=>'<img class="'+classe+'" src="'+esc(src)+'" alt="" width="100" height="100" decoding="async" draggable="false">';
 return imagem(artesRecursos.fundo,'recurso-fundo')+imagem(arquivo,'recurso-icone')+imagem(artesRecursos.moldura,'recurso-moldura');
}
