import {artesEfeitos,artesEfeitosPorNome,temasEfeitos} from './catalogos/artes-efeitos.mjs?v=0.8.80';
import {artesHabilidades} from './catalogos/artes-habilidades.mjs?v=0.8.80';
import {miniaturasHabilidades} from './catalogos/miniaturas-habilidades.mjs?v=0.8.80';
import {visualHabilidade} from './ability-art.mjs?v=0.8.80';
import {listarEfeitosHud,normalizarEfeito,temaEfeito,resumoEfeito} from './effect-state.mjs?v=0.8.80';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mini=src=>miniaturasHabilidades[src]?.mini??src;
const condicoes={agarrado:'imobilizar',amedrontado:'ataque-ameacador',caido:'derrubar',enfeiticado:'enfeiticar-pessoa',imobilizado:'emaranhar',contido:'emaranhar',invisivel:'invisibilidade',paralisado:'imobilizar-pessoa'};
const aliases={
  'raio-do-enfraquecimento':'enfraquecimento','protecao-contra-o-bem-e-o-mal':'protecao-bem-mal','protecao-contra-bem-e-mal':'protecao-bem-mal',
  'prece-de-cura':'prece-recebida','expulsar-mortos-vivos-abrasar':'expulsar-mortos-vivos','toque-arrepiante':'cura-bloqueada',
  'lentidao-de-raio-de-gelo':'gelo-lentidao','raio-de-gelo':'gelo-lentidao'
};
function origemEfeito(e,a,atores){
  const origem=atores.find(x=>x.id===e.origemAtorId)??a;
  const lista=[...(origem.ficha?.opcoes??[]),...(origem.ficha?.passivas??[])].sort((x,y)=>(y.id?.length??0)-(x.id?.length??0));
  const opcao=lista.find(o=>e.opcaoId===o.id||e.id===o.id||typeof e.id==='string'&&e.id.startsWith(o.id+'-'));
  const arquivo=opcao?visualHabilidade(opcao,origem.ficha).arquivo:null;if(arquivo)return arquivo;
  const item=[...(origem.ficha?.inventario?.itens??[])].sort((x,y)=>(y.id?.length??0)-(x.id?.length??0)).find(i=>typeof e.id==='string'&&e.id.startsWith('item-'+normalizarEfeito(i.id).slice(0,64)+'-'));
  return typeof item?.icone==='string'&&/^(?:assets\/|https:\/\/)/.test(item.icone)?item.icone:null;
}
export function visualEfeito(e,a={},atores=[]){
  const tema=temaEfeito(e),nome=normalizarEfeito(e.conjuracaoLonga?String(e.nome).replace(/^Conjurando\s+/i,''):e.nome);
  const origem=origemEfeito(e,a,atores),porNome=artesEfeitosPorNome[nome];
  const condicao=condicoes[e.condicao]&&artesHabilidades['habilidade.'+condicoes[e.condicao]]?.arquivo;
  const estado=(e.maldicao?artesEfeitos.maldicao:null)??artesEfeitos[aliases[nome]??nome]??artesEfeitos[e.condicao];
  const concentracao=e.tipo==='concentracao'&&artesHabilidades['habilidade.concentracao-e-turno']?.arquivo;
  const arquivo=mini(origem??porNome??condicao??estado??concentracao??artesEfeitos['generico-'+(tema==='buff'?'buff':['debuff','condicao'].includes(tema)?'debuff':'neutro')]);
  return {tema,arquivo,...temasEfeitos[tema],fonte:origem?'habilidade de origem':porNome||condicao?'arte relacionada':estado?'arte de status':concentracao?'concentração':'genérica'};
}
export function renderizarEfeitosHud(a,atores=[],{nomes=true,revelarValores=true}={}){
  const lista=listarEfeitosHud(a,atores);if(!lista.length)return '';
  const simbolos={buff:'+',debuff:'−',condicao:'!',concentracao:'◉',neutro:'•'};
  const img=(src,classe)=>src?'<img class="'+classe+'" src="'+esc(src)+'" alt="" width="100" height="100" decoding="async" draggable="false">':'';
  return '<div class="efeitos-hud flutuante" role="list" aria-label="Buffs, debuffs, condições e concentração" data-nomes="'+nomes+'">'+lista.map(e=>{
    const visual=visualEfeito(e,a,atores),titulo=resumoEfeito(e,{revelarValores}),restante=e.duracao?.restante??e.turnos,contador=e.hudSaldo!=null?(revelarValores?e.hudSaldo:''):restante??'';
    const nome=e.tipo==='concentracao'?'Conc.':e.nome;
    return '<span class="efeito-hud tema-'+visual.tema+'" role="listitem" tabindex="0" data-hud-key="'+esc(e.hudId)+'" data-info="'+esc(titulo)+'" aria-label="'+esc(titulo)+'">'+img(visual.fundo,'efeito-fundo')+img(visual.arquivo,'efeito-icone')+img(visual.moldura,'efeito-moldura')+'<i class="efeito-tipo" aria-hidden="true">'+simbolos[visual.tema]+'</i><small class="efeito-nome">'+esc(nome)+'</small>'+(contador!==''?'<b class="efeito-tempo">'+esc(contador)+'</b>':'')+'</span>';
  }).join('')+'</div>';
}
