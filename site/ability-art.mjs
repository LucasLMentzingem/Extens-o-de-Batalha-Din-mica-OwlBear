import {artesHabilidades,temasHabilidades} from './catalogos/artes-habilidades.mjs?v=0.8.43';
import {definicaoHabilidade} from './catalog.mjs?v=0.8.43';
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
  const arma=Boolean(h.origemItem&&(h.automacao?.tipo==='ataque'||h.geradaPorItem)),item=(f.inventario?.itens??[]).find(i=>i.id===h.origemItem);
  const familia=arma?'comum':['comum','raca','classe'].includes(v.familia)?v.familia:origem==='raca'?'raca':origem==='classe'?'classe':'comum';
  const desarmado=!arma&&(h.automacao?.tags?.includes('desarmado')||/golpe desarmado|soco/i.test(nome));
  const nomeNormal=normal(nome.replace(/^(?:Truque|\d+º)\s*\|\s*/,'').split(/\s*[|·—]\s*/)[0]);
  const artePorNome=/saraivada de espinhos/.test(nomeNormal)?'magia.saraivada-de-espinhos':/misseis magicos/.test(nomeNormal)?'magia.misseis-magicos':/raio de fogo/.test(nomeNormal)?'magia.raio-de-fogo':/torrente de golpes/.test(nomeNormal)?'monge.torrente-de-golpes':null;
  const arteId=v.arteId??(desarmado?'comum.soco':artePorNome??h.catalogoRef??h.id??'habilidade.'+slug(nome.split(/[|·—]/)[0]));
  const tema=temasHabilidades[familia],registro=artesHabilidades[arteId]??(arteId.startsWith('pericia.')?artesHabilidades['pericia.geral']:artesHabilidades['familia.'+familia])??{};
  const arquivo=arquivoSeguro(arma?(item?.icone??v.arquivo):(v.arquivo??registro.arquivo));
  const textoCurto=v.textoCurto??nome.replace(/^(Truque|\d+º)\s*\|\s*/,'').split(/\s*[|·—]\s*/)[0];
  const variante=v.variante??(h.automacao?.arremesso?'Arremesso':h.nome?.includes('duas mãos')?'2 mãos':item?.equipadoSlot==='mao_fraca'?'Mão fraca':'');
  const varianteImagem=h.automacao?.arremesso?arquivoSeguro(artesHabilidades['variante.arremesso']?.arquivo):null;
  return {arteId,familia,arquivo,fundo:arquivoSeguro(tema.fundo),moldura:arquivoSeguro(tema.moldura),layout:v.layout==='texto'?'texto':'ilustracao',textoCurto,alt:registro.alt??nome,variante,varianteImagem};
}
export function testeVisual(grupo,chave,bonus){
  const salva=grupo==='salvaguardas',nome=salva?'Salva de '+(nomesAtributos[chave]??chave):chave;
  const arteId=(salva?'salvaguarda.':'pericia.')+slug(chave);
  return {id:arteId,nome,origemTipo:'comum',visual:{arteId,familia:'comum',layout:'texto',textoCurto:nome},bonusVisual:bonus};
}
export function arteHabilidade(h={},f={},classe=''){
  const v=visualHabilidade(h,f),img=(src,cls)=>src?'<img class="'+cls+'" src="'+esc(src)+'" alt="" loading="lazy" decoding="async" width="500" height="500" draggable="false">':'';
  return '<span class="habilidade-arte '+v.familia+' '+v.layout+' '+(v.arquivo?'com-arte':'sem-arte')+' '+esc(classe)+'" role="img" aria-label="'+esc(h.nome??v.alt)+'">'+
    '<span class="habilidade-fundo" aria-hidden="true"></span>'+img(v.fundo,'habilidade-fundo-imagem')+img(v.arquivo,'habilidade-recorte')+
    '<span class="habilidade-moldura" aria-hidden="true"></span>'+img(v.moldura,'habilidade-moldura-imagem')+
    '<span class="habilidade-nome">'+esc(v.textoCurto)+'</span>'+(h.bonusVisual!=null?'<span class="habilidade-bonus">'+esc((h.bonusVisual>=0?'+':'')+h.bonusVisual)+'</span>':'')+
    (v.variante?'<span class="habilidade-variante" aria-hidden="true" title="'+esc(v.variante)+'">'+(v.varianteImagem?img(v.varianteImagem,'habilidade-variante-imagem'):esc(v.variante))+'</span>':'')+'</span>';
}
export function preencherBalaoHabilidade(container,alvo,texto){
  container.replaceChildren();const arte=alvo?.querySelector('.habilidade-arte');
  if(arte){const mini=arte.cloneNode(true);mini.classList.add('habilidade-miniatura');container.append(mini);}
  const corpo=container.ownerDocument.createElement('span');corpo.className='habilidade-explicacao';corpo.textContent=texto??'';container.append(corpo);
}
// Uma URL inválida ou indisponível nunca remove o nome nem bloqueia a habilidade.
if(typeof document!=='undefined')document.addEventListener('error',e=>{
  if(e.target?.matches?.('.habilidade-arte img')){e.target.hidden=true;if(e.target.classList.contains('habilidade-recorte')){const pai=e.target.closest('.habilidade-arte');pai.classList.remove('com-arte');pai.classList.add('sem-arte');}}
},true);
