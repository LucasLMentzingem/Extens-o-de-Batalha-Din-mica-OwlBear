import catalogo from './catalogos/catalogo-gerado.mjs?v=0.8.7';

const habilidades=new Map(catalogo.habilidades.map(x=>[x.id,x])),itens=new Map(catalogo.itens.map(x=>[x.id,x])),lojas=new Map((catalogo.lojas??[]).map(x=>[x.id,x]));
const clone=x=>structuredClone(x);
const objeto=x=>x&&typeof x==='object'&&!Array.isArray(x);
function mesclar(base,ajustes){
  if(!objeto(ajustes))return ajustes===undefined?clone(base):clone(ajustes);
  const out=objeto(base)?clone(base):{};
  for(const [k,v] of Object.entries(ajustes))out[k]=objeto(v)&&objeto(out[k])?mesclar(out[k],v):clone(v);
  return out;
}
const ordenar=x=>Array.isArray(x)?x.map(ordenar):objeto(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,ordenar(x[k])])):x;
const assinatura=x=>JSON.stringify(ordenar(x));
function semHabilidade(x){const y=clone(x);for(const k of ['id','catalogoRef','ativa'])delete y[k];return y;}
function semItem(x){const y=clone(x);for(const k of ['id','catalogoRef','quantidade','equipado','equipadoSlot','preferido'])delete y[k];return y;}
const refsHabilidade=new Map(catalogo.habilidades.map(x=>[assinatura(x.definicao),x.id]));
const refsItem=new Map(catalogo.itens.map(x=>[assinatura(x.definicao),x.id]));

export const versaoCatalogo=catalogo.versaoCatalogo;
export const catalogoCentral=()=>clone(catalogo);
export const itensCatalogo=()=>clone(catalogo.itens);
export const definicaoHabilidade=id=>clone(habilidades.get(id)?.definicao);
export const definicaoItem=id=>clone(itens.get(id)?.definicao);
export const lojasCatalogo=()=>clone([...lojas.values()]);
export const definicaoLoja=id=>clone(lojas.get(id));
export function resolverCatalogoLoja(loja){
  const out=clone(loja);out.itens=(loja.itens??[]).map(registro=>{
    const base=registro.ref?itens.get(registro.ref)?.definicao:registro.definicaoLocal;
    if(!base)throw Error('Item de loja não encontrado no catálogo: '+(registro.ref??registro.id));
    return {...mesclar(base,registro.ajustes),...clone(registro),id:registro.id,catalogoRef:registro.ref};
  });return out;
}
export const resolverLoja=id=>{const loja=lojas.get(id);return loja?resolverCatalogoLoja(loja):undefined;};

function resolverConcessao(c){
  const entrada=c.ref?habilidades.get(c.ref):null,base=entrada?.definicao??c.definicaoLocal;
  if(!base)throw Error('Habilidade não encontrada no catálogo: '+(c.ref??c.id));
  const out=mesclar(base,c.ajustes);out.id=c.id;out.catalogoRef=c.ref;
  if(c.ativa!==undefined)out.ativa=c.ativa;
  if(c.usoGratuito)out.usoGratuito=clone(c.usoGratuito);
  if(c.somenteUsoGratuito)out.somenteUsoGratuito=true;
  if(c.origem)out.origemConcessao=clone(c.origem);
  return out;
}
function resolverInstancia(i){
  const entrada=i.ref?itens.get(i.ref):null,base=entrada?.definicao??i.definicaoLocal;
  if(!base)throw Error('Item não encontrado no catálogo: '+(i.ref??i.id));
  const out=mesclar(base,i.ajustes);out.id=i.id;out.catalogoRef=i.ref;out.quantidade=i.quantidade??1;out.equipado=Boolean(i.equipado);
  if(i.equipado)out.equipadoSlot=i.equipadoSlot;
  if(i.preferido)out.preferido=true;
  return out;
}
export const resolverInstanciaItem=resolverInstancia;

export function resolverFicha(ficha){
  if(ficha?.versaoFormato!==2)return clone(ficha);
  if(ficha.versaoCatalogo>catalogo.versaoCatalogo)throw Error('A ficha requer um catálogo mais novo que esta extensão.');
  const out=clone(ficha),concessoes=clone(ficha.concessoes??[]),instancias=clone(ficha.inventario?.itens??[]);
  delete out.concessoes;delete out.opcoes;delete out.passivas;delete out.equipamentos;
  out.versaoFormato=1;out.versaoOrigem=2;
  out.opcoes=concessoes.filter(c=>c.tipo!=='passiva').map(resolverConcessao);
  out.passivas=concessoes.filter(c=>c.tipo==='passiva').map(resolverConcessao);
  out.inventario={versaoOcupacao:5,capacidadeCargaKg:ficha.inventario?.capacidadeCargaKg,itens:instancias.map(resolverInstancia)};
  out._catalogoV2={concessoes,instancias,versaoOcupacao:ficha.inventario?.versaoOcupacao??6};
  return out;
}

function concessaoDe(h,tipo,anterior){
  const ref=h.catalogoRef??refsHabilidade.get(assinatura(semHabilidade(h))),base=ref?habilidades.get(ref)?.definicao:null;
  const c=clone(anterior??{id:h.id,tipo});c.id=h.id;c.tipo=tipo;
  if(ref){c.ref=ref;delete c.definicaoLocal;}else{delete c.ref;c.definicaoLocal=semHabilidade(h);}
  if(tipo==='passiva')c.ativa=h.ativa!==false;
  if(h.usoGratuito)c.usoGratuito=clone(h.usoGratuito);else delete c.usoGratuito;
  if(h.somenteUsoGratuito)c.somenteUsoGratuito=true;else delete c.somenteUsoGratuito;
  // Ajustes existentes são decisões da ficha; não calcule um diff automático que voltaria a duplicar toda a definição.
  if(base&&c.ajustes&&Object.keys(c.ajustes).length===0)delete c.ajustes;
  return c;
}
function instanciaDe(i,anterior){
  const ref=i.catalogoRef??refsItem.get(assinatura(semItem(i))),inst=clone(anterior??{id:i.id});inst.id=i.id;
  if(ref){inst.ref=ref;delete inst.definicaoLocal;}else{delete inst.ref;inst.definicaoLocal=semItem(i);}
  inst.quantidade=i.quantidade??1;
  if(i.equipado){inst.equipado=true;inst.equipadoSlot=i.equipadoSlot;}else{delete inst.equipado;delete inst.equipadoSlot;}
  if(i.preferido)inst.preferido=true;else delete inst.preferido;
  return inst;
}
export const compactarInstanciaItem=(i,anterior)=>instanciaDe(i,anterior);

export function compactarFicha(ficha){
  if(!ficha)return ficha;
  const out=clone(ficha),meta=ficha._catalogoV2,anteriores=new Map((meta?.concessoes??[]).map(c=>[c.tipo+':'+c.id,c]));
  out.versaoFormato=2;out.versaoCatalogo=catalogo.versaoCatalogo;
  out.concessoes=[...(ficha.opcoes??[]).filter(h=>!h.concedidaPorItem).map(h=>concessaoDe(h,'habilidade',anteriores.get('habilidade:'+h.id))),...(ficha.passivas??[]).filter(h=>!h.concedidaPorItem).map(h=>concessaoDe(h,'passiva',anteriores.get('passiva:'+h.id)))];
  out.recursos=(ficha.recursos??[]).filter(r=>!r.concedidoPorItem).map(clone);
  const itensAnteriores=new Map((meta?.instancias??[]).map(i=>[i.id,i]));
  out.inventario={versaoOcupacao:6,capacidadeCargaKg:ficha.inventario?.capacidadeCargaKg,itens:(ficha.inventario?.itens??[]).map(i=>instanciaDe(i,itensAnteriores.get(i.id)))};
  delete out.opcoes;delete out.passivas;delete out.equipamentos;delete out.versaoOrigem;delete out._catalogoV2;
  return out;
}

export function compactarEstado(estado){
  const out=clone(estado);for(const a of out.atores??[])a.ficha=compactarFicha(a.ficha);return out;
}
