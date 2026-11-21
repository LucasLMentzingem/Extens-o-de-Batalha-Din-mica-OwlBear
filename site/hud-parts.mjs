// Grupos visuais, nunca um popover por habilidade. Só HTML já renderizado, sem fichas.
export const gruposRodape=Object.freeze({
  'barra-identidade':'aside','barra-nome':'article>header>strong','barra-atalhos':'.atalhos-ficha',
  'barra-recursos':'.recursos-hud','barra-ferramentas':'.ferramentas-hud','barra-grade':'.grade',
  'barra-movimento':'.movimento-botoes','barra-medidor':'.barra-movimento','barra-saldo':'.movimento-hud>b',
  'barra-categorias':'.categorias-hud','barra-finalizar':'.finalizar-hud'
});
export const gruposMesa=Object.freeze({'mesa-turnos':'#hud>nav','mesa-ferramentas':'.mesa-fora,.controles-mesa,.confirmacao-mesa,.expandir-mesa'});
export const partesLeves=Object.freeze([...Object.keys(gruposRodape),...Object.keys(gruposMesa),'barra-dica']);
export function comandoDoAtorHudValido(d,atorId){return !Object.hasOwn(gruposRodape,d.parteHud??'')||!d.tipo||d.tipo==='dicaRodape'||d.atorHud===atorId;}
export function chaveParte(ns,sala,conexao,parte){return [ns,'hud-parte',sala,conexao,parte].join('/');}
export function chaveEntrada(ns,sala,conexao){return [ns,'hud-entrada',sala,conexao].join('/');}
export function grupoHudValido(g,origem,largura,altura){
  const mapa=origem==='barra'?gruposRodape:origem==='ordem'?gruposMesa:{};
  return Boolean(g&&Object.hasOwn(mapa,g.parte)&&typeof g.html==='string'&&g.html.length<=160000&&
    ['x','y','width','height'].every(k=>Number.isFinite(g[k]))&&g.x>=-1&&g.y>=-1&&g.width>0&&g.height>0&&g.x+g.width<=largura+2&&g.y+g.height<=altura+2);
}
export function extrairGrupos(root,origem,{compacto=false}={}){
  const base=root.getBoundingClientRect(),mapa=origem==='barra'?(compacto?{'barra-identidade':gruposRodape['barra-identidade']}:gruposRodape):gruposMesa;
  const grupos=[];
  for(const [parte,seletor] of Object.entries(mapa)){
    const el=root.querySelector(seletor);if(!el)continue;
    const r=el.getBoundingClientRect();if(r.width<1||r.height<1)continue;
    let width=r.width;
    if(['barra-recursos','barra-categorias'].includes(parte)&&el.lastElementChild)width=Math.min(width,Math.max(1,el.lastElementChild.getBoundingClientRect().right-r.left));
    const alvo=el.cloneNode(true);alvo.setAttribute('data-alvo-parcial','');
    // A viewport de uma janela pequena não é a viewport do layout inteiro.
    // Congelar só as medidas sensíveis às media queries evita aplicar o tema
    // mobile a um retrato de 76 px ou aos botões de uma janela estreita.
    const fontes=[el,...el.querySelectorAll('*')],copias=[alvo,...alvo.querySelectorAll('*')];
    for(let i=0;i<fontes.length;i++){
      const f=fontes[i],c=copias[i];if(!f.matches('button,select,label,small,strong,b,.retrato'))continue;
      const s=f.ownerDocument.defaultView.getComputedStyle(f);c.style.fontSize=s.fontSize;c.style.lineHeight=s.lineHeight;
      if(f.matches('button,select'))c.style.padding=s.padding;
      if(f.matches('.retrato,.movimento-botoes button')){c.style.width=s.width;c.style.height=s.height;}
    }
    let html=alvo.outerHTML,pai=el.parentElement;
    while(pai&&pai!==root){const c=pai.cloneNode(false);c.removeAttribute('id');c.setAttribute('data-contexto-parcial','');c.innerHTML=html;html=c.outerHTML;pai=pai.parentElement;}
    grupos.push({parte,x:Math.max(0,Math.floor(r.left-base.left)),y:Math.max(0,Math.floor(r.top-base.top)),width:Math.ceil(width),height:Math.ceil(r.height),html});
  }
  return grupos;
}
