import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {validar} from './site/engine.mjs';

const raiz=new URL('./',import.meta.url),pastaFichas=new URL('./site/fichas/',raiz),pastaCatalogos=new URL('./site/catalogos/',raiz);
const ids=['dragoberto','draven-thorne','hannah-montana','loteria','nikki','skimi','zurich','soldado'];
const ler=async url=>JSON.parse(await readFile(url,'utf8'));
const ordenar=x=>Array.isArray(x)?x.map(ordenar):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,ordenar(x[k])])):x;
const assinatura=x=>JSON.stringify(ordenar(x));
const slug=s=>String(s??'conteudo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72)||'conteudo';
const hash=s=>createHash('sha256').update(s).digest('hex').slice(0,8);
const sem=x=>{const y=structuredClone(x);for(const k of ['id','catalogoRef','ativa'])delete y[k];return y;};
const semInstancia=x=>{const y=structuredClone(x);for(const k of ['id','catalogoRef','quantidade','equipado','equipadoSlot','preferido'])delete y[k];return y;};

const fontes=ids.map(id=>JSON.parse(execFileSync('git',['show','HEAD:site/fichas/'+id+'.json'],{encoding:'utf8'})));
if(fontes.every(f=>f.versaoFormato===2)){console.log('As fichas do HEAD já estão no formato 2; nenhuma migração foi necessária.');process.exit(0);}
if(fontes.some(f=>f.versaoFormato!==1))throw Error('O conjunto histórico mistura formatos de ficha; migre-o a partir de uma base uniforme.');
const fichas=fontes.map(validar);

function coletor(prefixo){
  const porAssinatura=new Map(),idsUsados=new Set(),lista=[];
  return {adicionar(nome,definicao){
    const sig=assinatura(definicao);if(porAssinatura.has(sig))return porAssinatura.get(sig);
    let id=prefixo+'.'+slug(nome);if(idsUsados.has(id))id+='-'+hash(sig);while(idsUsados.has(id))id+='x';
    idsUsados.add(id);porAssinatura.set(sig,id);lista.push({id,revisao:1,definicao});return id;
  },lista};
}
const habilidades=coletor('habilidade'),itens=coletor('item');
const catalogoVictor=JSON.parse(execFileSync('git',['show','HEAD:site/catalogo-victor.json'],{encoding:'utf8'}));
for(const item of catalogoVictor.itens??[])itens.adicionar(item.nome,semInstancia(item));

for(const ficha of fichas){
  const concessoes=[];
  for(const opcao of ficha.opcoes??[])concessoes.push({id:opcao.id,ref:habilidades.adicionar(opcao.nome,sem(opcao)),tipo:'habilidade',...(opcao.ativa===false?{ativa:false}:{})});
  for(const passiva of ficha.passivas??[])concessoes.push({id:passiva.id,ref:habilidades.adicionar(passiva.nome,sem(passiva)),tipo:'passiva',...(passiva.ativa===false?{ativa:false}:{})});
  const instancias=(ficha.inventario?.itens??[]).map(item=>({
    id:item.id,ref:itens.adicionar(item.nome,semInstancia(item)),quantidade:item.quantidade??1,
    ...(item.equipado?{equipado:true,equipadoSlot:item.equipadoSlot}:{}),...(item.preferido?{preferido:true}:{})
  }));
  const compacta=structuredClone(ficha);
  compacta.versaoFormato=2;compacta.versaoCatalogo=1;compacta.concessoes=concessoes;
  delete compacta.opcoes;delete compacta.passivas;delete compacta.equipamentos;
  compacta.inventario={versaoOcupacao:6,capacidadeCargaKg:ficha.inventario?.capacidadeCargaKg,itens:instancias};
  ficha.__compacta=compacta;
}

// Caso de arquitetura solicitado para a campanha: Nikki ganhou Passo Nebuloso uma vez por descanso longo.
const passoNebuloso={
  nome:'2º | Passo Nebuloso · recompensa de aventura',categoria:'magia',circuloBase:2,
  descricao:'Ação bônus. Teleporte-se para um espaço desocupado que você possa ver a até 9 m.',
  custo:[{tipo:'bonus',quantidade:1}],automacao:{tipo:'teleporte',alcanceM:9},foraCombate:true
};
const passoRef='magia.passo-nebuloso';
habilidades.lista.push({id:passoRef,revisao:1,definicao:passoNebuloso});
const nikki=fichas.find(f=>f.id==='nikki').__compacta;
nikki.recursos.push({id:'passo-nebuloso-gratis',nome:'Passo Nebuloso gratuito',maximo:1,saldoInicial:1,recuperacao:[{evento:'descanso_longo',modo:'completar'}]});
nikki.concessoes.push({
  id:'passo-nebuloso-recompensa-aventura',ref:passoRef,tipo:'habilidade',origem:{tipo:'recompensa_aventura',nome:'Recompensa de aventura'},
  usoGratuito:{recursoId:'passo-nebuloso-gratis',quantidade:1,nome:'Uso gratuito de Passo Nebuloso'},somenteUsoGratuito:true
});
nikki.preparacao.semprePreparadas.push('passo-nebuloso-recompensa-aventura');

await mkdir(pastaCatalogos,{recursive:true});
await writeFile(new URL('habilidades.json',pastaCatalogos),JSON.stringify({versaoCatalogo:1,habilidades:habilidades.lista.sort((a,b)=>a.id.localeCompare(b.id))},null,2)+'\n');
await writeFile(new URL('itens.json',pastaCatalogos),JSON.stringify({versaoCatalogo:1,itens:itens.lista.sort((a,b)=>a.id.localeCompare(b.id))},null,2)+'\n');
for(const ficha of fichas)await writeFile(new URL(ficha.id+'.json',pastaFichas),JSON.stringify(ficha.__compacta,null,2)+'\n');
console.log(`Migração concluída: ${habilidades.lista.length} habilidades, ${itens.lista.length} itens e ${fichas.length} fichas compactas.`);
