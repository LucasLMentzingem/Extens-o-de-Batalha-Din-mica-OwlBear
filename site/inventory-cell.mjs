import {arteItem} from './item-art.mjs?v=0.8.73';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function celulaInventario(i,{atributos='',descricao='',selecionada=false}={}){
  if(!i)return '<div class="celula-item vazia" aria-label="Espaço vazio"></div>';
  return '<button type="button" class="celula-item '+(selecionada?'selecionada':'')+'" '+atributos+' data-info="'+esc(descricao||i.descricao||i.nome)+'" aria-label="'+esc(i.nome)+'">'+arteItem(i)+(i.quantidade>1?'<em>'+esc(i.quantidade)+'</em>':'')+'<span>'+esc(i.nome)+'</span></button>';
}
