import {readFile,writeFile,readdir} from 'node:fs/promises';

const raiz=new URL('./',import.meta.url),pasta=new URL('./site/catalogos/',raiz),destino=new URL('catalogo-gerado.mjs',pasta);
const ler=async nome=>JSON.parse(await readFile(new URL(nome,pasta),'utf8'));
const habilidades=await ler('habilidades.json'),itens=await ler('itens.json');
const {default:lojaLaArte,variantesLaArte}=await import('./site/catalogo-la-arte.mjs');
const idValido=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9.-]+$/.test(id);
function validarLista(lista,tipo){
  if(!Array.isArray(lista))throw Error(tipo+' deve ser uma lista.');
  const ids=new Set();
  for(const entrada of lista){
    if(!idValido(entrada?.id)||!Number.isInteger(entrada.revisao)||entrada.revisao<1||!entrada.definicao||typeof entrada.definicao!=='object')throw Error('Entrada inválida em '+tipo+': '+JSON.stringify(entrada?.id));
    if(ids.has(entrada.id))throw Error('ID duplicado em '+tipo+': '+entrada.id);ids.add(entrada.id);
    if(typeof entrada.definicao.nome!=='string'||!entrada.definicao.nome.trim())throw Error('Definição sem nome em '+entrada.id);
  }
}
if(habilidades.versaoCatalogo!==itens.versaoCatalogo)throw Error('Os catálogos devem usar a mesma versão.');
validarLista(habilidades.habilidades,'habilidades');validarLista(itens.itens,'itens');
const objeto=x=>x&&typeof x==='object'&&!Array.isArray(x),mesclar=(base,ajustes)=>{const out=structuredClone(base);for(const [k,v] of Object.entries(ajustes??{}))out[k]=objeto(v)&&objeto(out[k])?mesclar(out[k],v):structuredClone(v);return out;};
for(const variante of variantesLaArte){
  const base=itens.itens.find(x=>x.id===variante.baseRef);if(!base)throw Error('Base da La Arte inexistente: '+variante.baseRef);
  itens.itens.push({id:'item.la-arte.'+variante.id,revisao:1,definicao:mesclar(base.definicao,variante.ajustes)});
}
validarLista(itens.itens,'itens expandidos');
const moedas=new Set(['pc','pp','pe','po','pl']);
for(const entrada of itens.itens){
  const p=entrada.definicao.preco;
  if(!p||!Number.isFinite(p.valor)||p.valor<=0||!moedas.has(p.moeda))throw Error('Preço inválido ou ausente em '+entrada.id);
  if(entrada.definicao.negociavel!==undefined&&typeof entrada.definicao.negociavel!=='boolean')throw Error('Campo negociavel inválido em '+entrada.id);
}
const loja=JSON.parse(await readFile(new URL('../catalogo-victor.json',pasta),'utf8')),lojas=[loja,lojaLaArte];
for(const l of lojas)if(!/^loja\.[a-z0-9.-]+$/.test(l.id)||typeof l.nome!=='string'||!Array.isArray(l.itens))throw Error('Catálogo de loja inválido: '+(l.nome??l.id));
const catalogo={versaoCatalogo:habilidades.versaoCatalogo,habilidades:habilidades.habilidades,itens:itens.itens,lojas};
const refsHabilidades=new Set(catalogo.habilidades.map(x=>x.id)),refsItens=new Set(catalogo.itens.map(x=>x.id));
for(const nome of await readdir(new URL('../fichas/',pasta))){
  if(!nome.endsWith('.json')||nome==='ficha.schema.json')continue;
  const ficha=JSON.parse(await readFile(new URL('../fichas/'+nome,pasta),'utf8'));if(ficha.versaoFormato!==2)continue;
  for(const c of ficha.concessoes??[])if(c.ref&&!refsHabilidades.has(c.ref))throw Error(nome+' referencia habilidade inexistente: '+c.ref);
  for(const i of ficha.inventario?.itens??[])if(i.ref&&!refsItens.has(i.ref))throw Error(nome+' referencia item inexistente: '+i.ref);
  const recursos=new Set((ficha.recursos??[]).map(r=>r.id));
  for(const c of ficha.concessoes??[])if(c.usoGratuito&&!recursos.has(c.usoGratuito.recursoId))throw Error(nome+' referencia recurso inexistente: '+c.usoGratuito.recursoId);
}
for(const l of lojas)for(const item of l.itens??[])if(!refsItens.has(item.ref))throw Error('A loja '+l.nome+' referencia item inexistente: '+item.ref);
const fonte='// Gerado por gerar-catalogo-runtime.mjs. Não edite manualmente.\nexport default '+JSON.stringify(catalogo,null,2)+';\n';
if(process.argv.includes('--check')){
  const atual=await readFile(destino,'utf8').catch(()=>null);
  if(atual!==fonte)throw Error('catalogo-gerado.mjs está desatualizado. Execute: node gerar-catalogo-runtime.mjs');
  console.log(`Catálogo válido: ${catalogo.habilidades.length} habilidades, ${catalogo.itens.length} itens e ${catalogo.lojas.length} lojas.`);
}else{
  await writeFile(destino,fonte);console.log(`Runtime gerado: ${catalogo.habilidades.length} habilidades, ${catalogo.itens.length} itens e ${catalogo.lojas.length} lojas.`);
}
