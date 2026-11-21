import {artesHabilidades,temasHabilidades} from './catalogos/artes-habilidades.mjs?v=0.8.82';
import {miniaturasHabilidades} from './catalogos/miniaturas-habilidades.mjs?v=0.8.82';
import {definicaoHabilidade} from './catalog.mjs?v=0.8.82';
import {identidadeArteHabilidade,nomeConceitoArte} from './ability-art-id.mjs?v=0.8.82';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normal=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const slug=x=>normal(x).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const nomesAtributos={for:'Força',des:'Destreza',con:'Constituição',int:'Inteligência',sab:'Sabedoria',car:'Carisma'};
const arquivoSeguro=x=>typeof x==='string'&&/^(?:\.?\/?assets\/|https:\/\/)/.test(x)?x:null;
export function visualHabilidade(h={},f={}){
  const original=[...(f.opcoes??[]),...(f.passivas??[])].find(x=>x.id===h.id);
  if(original)h={...original,...h,visual:{...original.visual,...h.visual}};
  const base=h.catalogoRef?definicaoHabilidade(h.catalogoRef):null;
  if(base)h={...base,...h,visual:{...base.visual,...h.visual}};
  const v=h.visual??{},origem=normal(h.origemTipo??h.origemConcessao?.tipo??h.filtroHud),nome=String(h.nome??'Habilidade');
  const deItem=Boolean(h.origemItem),item=(f.inventario?.itens??[]).find(i=>i.id===h.origemItem);
  const classe=origem==='classe'||h.categoria==='magia'||(f.classes??[]).some(c=>normal(c.id)===normal(h.origem)&&h.origem);
  const familia=deItem?'comum':['comum','raca','classe'].includes(v.familia)?v.familia:origem==='raca'?'raca':origem==='comum'?'comum':classe?'classe':'comum';
  const arteId=v.arteId??(artesHabilidades[h.catalogoRef]?h.catalogoRef:identidadeArteHabilidade(h));
  // Origem define somente fundo/moldura. Nunca emprestar a arte de outra habilidade.
  const tema=temasHabilidades[familia],registro=artesHabilidades[arteId]??{};
  // A prévia pública identifica a fonte para não confundir fallback do item com override da skill.
  const arquivoHabilidade=(v.fonteArte==='item'?null:arquivoSeguro(v.arquivo))??arquivoSeguro(registro.arquivo);
  const arquivoItem=deItem?(arquivoSeguro(item?.icone)??(v.fonteArte==='item'?arquivoSeguro(v.arquivo):null)):null;
  const arquivo=arquivoHabilidade??arquivoItem,fonteArte=arquivoHabilidade?'habilidade':arquivoItem?'item':null;
  const textoCurto=v.textoCurto??nomeConceitoArte(h);
  const variante=v.variante??(h.automacao?.arremesso?'Arremesso':h.nome?.includes('duas mãos')?'2 mãos':item?.equipadoSlot==='mao_fraca'?'Mão fraca':'');
  const varianteImagem=h.automacao?.arremesso?arquivoSeguro(artesHabilidades['variante.arremesso']?.arquivo):null;
  return {arteId,familia,arquivo,fonteArte,fundo:arquivoSeguro(tema.fundo),moldura:arquivoSeguro(tema.moldura),layout:v.layout==='texto'?'texto':'ilustracao',textoCurto,alt:registro.alt??nome,variante,varianteImagem};
}
export function opcaoConsumoItem(item){
  return {id:'consumir-'+item.id,nome:item.nome+' ×'+item.quantidade,categoria:'item',origemItem:item.id,geradaPorItem:true,descricao:item.descricao??'',custo:[{tipo:'acao',quantidade:1}],...(item.visual?{visual:structuredClone(item.visual)}:{})};
}
export function testeVisual(grupo,chave,bonus){
  const salva=grupo==='salvaguardas',nome=salva?'Salva de '+(nomesAtributos[chave]??chave):chave;
  const arteId=(salva?'salvaguarda.':'pericia.')+slug(chave);
  return {id:arteId,nome,origemTipo:'comum',visual:{arteId,familia:'comum',layout:'texto',textoCurto:salva?(nomesAtributos[chave]??chave):nome},bonusVisual:bonus};
}
export function arteHabilidade(h={},f={},classe=''){
  const v=visualHabilidade(h,f),img=(src,cls)=>{if(!src)return '';const derivado=miniaturasHabilidades[src];return '<img class="'+cls+'" src="'+esc(derivado?.mini??src)+'" '+(derivado?'data-art-detalhe="'+esc(derivado.detalhe)+'" ':'')+'alt="" loading="lazy" decoding="async" width="128" height="128" draggable="false">';};
  return '<span class="habilidade-arte '+v.familia+' '+v.layout+' '+(/^(pericia|salvaguarda)\./.test(v.arteId)?'teste-arte ':'')+(v.arquivo?'com-arte':'sem-arte')+' '+esc(classe)+'" role="img" aria-label="'+esc(h.nome??v.alt)+'">'+
    '<span class="habilidade-fundo" aria-hidden="true"></span>'+img(v.fundo,'habilidade-fundo-imagem')+img(v.arquivo,'habilidade-recorte')+
    '<span class="habilidade-moldura" aria-hidden="true"></span>'+img(v.moldura,'habilidade-moldura-imagem')+
    '<span class="habilidade-nome">'+esc(v.textoCurto)+'</span>'+(h.bonusVisual!=null?'<span class="habilidade-bonus">'+esc((h.bonusVisual>=0?'+':'')+h.bonusVisual)+'</span>':'')+
    (v.variante?'<span class="habilidade-variante" aria-hidden="true" title="'+esc(v.variante)+'">'+(v.varianteImagem?img(v.varianteImagem,'habilidade-variante-imagem'):esc(v.variante))+'</span>':'')+'</span>';
}
export {preencherBalaoHabilidade} from './ability-tooltip.mjs?v=0.8.82';
// Uma URL inválida ou indisponível nunca remove o nome nem bloqueia a habilidade.
if(typeof document!=='undefined')document.addEventListener('error',e=>{
  if(e.target?.matches?.('.habilidade-arte img')){e.target.hidden=true;if(e.target.classList.contains('habilidade-recorte')){const pai=e.target.closest('.habilidade-arte');pai.classList.remove('com-arte');pai.classList.add('sem-arte');}}
},true);
