import {readFile,writeFile,readdir} from 'node:fs/promises';

const raiz=new URL('./',import.meta.url),pasta=new URL('./site/catalogos/',raiz),destino=new URL('catalogo-gerado.mjs',pasta);
const ler=async nome=>JSON.parse(await readFile(new URL(nome,pasta),'utf8'));
const habilidades=await ler('habilidades.json'),itens=await ler('itens.json');
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
const catalogo={versaoCatalogo:habilidades.versaoCatalogo,habilidades:habilidades.habilidades,itens:itens.itens};
const refsHabilidades=new Set(catalogo.habilidades.map(x=>x.id)),refsItens=new Set(catalogo.itens.map(x=>x.id));
for(const nome of await readdir(new URL('../fichas/',pasta))){
  if(!nome.endsWith('.json')||nome==='ficha.schema.json')continue;
  const ficha=JSON.parse(await readFile(new URL('../fichas/'+nome,pasta),'utf8'));if(ficha.versaoFormato!==2)continue;
  for(const c of ficha.concessoes??[])if(c.ref&&!refsHabilidades.has(c.ref))throw Error(nome+' referencia habilidade inexistente: '+c.ref);
  for(const i of ficha.inventario?.itens??[])if(i.ref&&!refsItens.has(i.ref))throw Error(nome+' referencia item inexistente: '+i.ref);
  const recursos=new Set((ficha.recursos??[]).map(r=>r.id));
  for(const c of ficha.concessoes??[])if(c.usoGratuito&&!recursos.has(c.usoGratuito.recursoId))throw Error(nome+' referencia recurso inexistente: '+c.usoGratuito.recursoId);
}
const loja=JSON.parse(await readFile(new URL('../catalogo-victor.json',pasta),'utf8'));
for(const item of loja.itens??[])if(!refsItens.has(item.ref))throw Error('A loja '+loja.loja+' referencia item inexistente: '+item.ref);
const fonte='// Gerado por gerar-catalogo-runtime.mjs. Não edite manualmente.\nexport default '+JSON.stringify(catalogo,null,2)+';\n';
if(process.argv.includes('--check')){
  const atual=await readFile(destino,'utf8').catch(()=>null);
  if(atual!==fonte)throw Error('catalogo-gerado.mjs está desatualizado. Execute: node gerar-catalogo-runtime.mjs');
  console.log(`Catálogo válido: ${catalogo.habilidades.length} habilidades e ${catalogo.itens.length} itens.`);
}else{
  await writeFile(destino,fonte);console.log(`Runtime gerado: ${catalogo.habilidades.length} habilidades e ${catalogo.itens.length} itens.`);
}
