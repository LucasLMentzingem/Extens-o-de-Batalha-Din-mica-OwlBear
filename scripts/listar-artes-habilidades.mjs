import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {validar,novo,adicionar,opcoesCalculadas,periciasPadrao} from '../site/engine.mjs';
import {visualHabilidade,testeVisual,nomesAtributos} from '../site/ability-art.mjs';
import {nomeConceitoArte} from '../site/ability-art-id.mjs';

const fichas=['nikki','draven-thorne','zurich','skimi','dragoberto','hannah-montana','loteria'];
const artes=new Map(),armas=new Map();let opcoesDaFicha=[];
function registrar(h,f,local,heranca={}){
  if(h.ataqueLegadoDeItem)return;
  const fonte=h.origemOpcaoId?opcoesDaFicha.find(o=>o.id===h.origemOpcaoId):null;
  const habilidade={...heranca,...(fonte?.geradaPorItem?{origemItem:fonte.origemItem,geradaPorItem:true}:{}),...h},v=visualHabilidade(habilidade,f);
  const reutiliza=Boolean(habilidade.origemItem&&habilidade.geradaPorItem);
  const mapa=reutiliza?armas:artes,chave=reutiliza?habilidade.origemItem+'|'+v.variante:v.arteId;
  let entrada=mapa.get(chave);
  if(!entrada){entrada={arteId:v.arteId,nome:h.visual?.textoCurto??nomeConceitoArte(h),status:reutiliza?'reutilizar_item':v.arquivo?'disponivel':'gerar',arquivo:v.arquivo,familias:[],fichas:[],referencias:[],locais:[],nomes:[],descricao:h.descricao??'',...(reutiliza?{variante:v.variante}:{})};mapa.set(chave,entrada);}
  for(const [campo,valor] of [['familias',v.familia],['fichas',f.nome],['referencias',h.catalogoRef],['locais',local],['nomes',h.nome]])if(valor&&!entrada[campo].includes(valor))entrada[campo].push(valor);
}
function anexos(obj,f,local,heranca={}){
  if(!obj||typeof obj!=='object')return;
  if(Array.isArray(obj)){for(const x of obj)anexos(x,f,local,heranca);return;}
  // Opções concedidas, modos e adicionais têm nome e comportamento próprio.
  if(obj.nome&&(obj.automacao||obj.categoria||obj.aprimoramento||obj.rerrolagem||obj.modificadorDano))registrar(obj,f,local,heranca);
  for(const [k,x] of Object.entries(obj))if(typeof x==='object')anexos(x,f,local+'/'+k,heranca);
}
for(const id of fichas){
  const fonte=JSON.parse(await readFile(new URL('../site/fichas/'+id+'.json',import.meta.url),'utf8'));
  const f=validar(fonte),a=adicionar(novo(),f);
  opcoesDaFicha=opcoesCalculadas(a);
  for(const h of [...opcoesDaFicha,...(f.passivas??[])]){
    registrar(h,f,h.categoria==='passiva'||f.passivas?.includes(h)?'passiva':'opcao');
    for(const [k,x] of Object.entries(h))if(x&&typeof x==='object')anexos(x,f,'opcao/'+k,{origemTipo:h.origemTipo,origemConcessao:h.origemConcessao,categoria:h.categoria,origem:h.origem});
  }
  for(const i of f.inventario?.itens??[])for(const [k,x] of Object.entries(i))if(x&&typeof x==='object')anexos(x,f,'item/'+i.nome+'/'+k,{origemTipo:'comum'});
  for(const nome of Object.keys(periciasPadrao))registrar(testeVisual('pericias',nome,0),f,'teste rapido');
  for(const chave of Object.keys(nomesAtributos))registrar(testeVisual('salvaguardas',chave,0),f,'salvaguarda');
}
const lista=[...artes.values()].sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
const resultado={formato:1,escopo:'Sete fichas: opções calculadas, passivas, anexos, equipamentos e testes rápidos',regra:'Cada habilidade distinta tem arte própria; a mesma habilidade em fichas, custos e círculos diferentes mantém sua identidade. Somente fundo e moldura são compartilhados por seção. Armas usam a arte do item e arremesso acrescenta símbolo separado.',resumo:{habilidades:lista.length,gerar:lista.filter(x=>x.status==='gerar').length,disponiveis:lista.filter(x=>x.status==='disponivel').length,variantesDeItens:armas.size},habilidades:lista,itensReutilizados:[...armas.values()]};
const dir=new URL('../docs/arte/',import.meta.url);await mkdir(dir,{recursive:true});
await writeFile(new URL('habilidades-sete-fichas.json',dir),JSON.stringify(resultado,null,2)+'\n');
const linha=x=>'| '+[x.nome,x.arteId,x.familias.join(', '),x.fichas.join(', ')].map(s=>String(s).replaceAll('|','/')).join(' | ')+' |';
let md='# Artes próprias das habilidades — sete fichas\n\nGerado por `node scripts/listar-artes-habilidades.mjs`. Não editar a lista manualmente.\n\n'+resultado.regra+'\n\n'+resultado.resumo.gerar+' artes pendentes, '+resultado.resumo.disponiveis+' identidades com arte existente. Imagens previstas: recortes transparentes 500 × 500; sem letras, custos ou moldura na arte. Perícias usam ilustração própria da atividade e texto da interface.\n\n## Artes a gerar\n\n| Habilidade | ID visual | Fundo/moldura | Fichas |\n| --- | --- | --- | --- |\n'+lista.filter(x=>x.status==='gerar').map(linha).join('\n')+'\n\n## Artes existentes\n\n| Habilidade | ID visual | Fundo/moldura | Fichas |\n| --- | --- | --- | --- |\n'+lista.filter(x=>x.status==='disponivel').map(linha).join('\n')+'\n\n## Ataques e itens\n\nAtaques de arma reutilizam o recorte do item real, com fundo/moldura Comum. Arremesso conserva essa imagem e sobrepõe `variante.arremesso`. Consumíveis e ações dadas pelo item usam a arte do item quando representarem o próprio objeto; habilidades especiais distintas devem ter sua própria arte.\n\n';
md+=resultado.itensReutilizados.map(x=>'- '+x.nomes.join(' / ')+' — '+x.fichas.join(', ')+' — '+(x.arquivo??'arte de item ausente')).join('\n')+'\n\nAs descrições, nomes originais, referências de catálogo e pontos de uso estão no JSON ao lado, para orientar os prompts e conferir a cobertura após cada geração. Entradas de metadados importadas que ainda aparecem como habilidades na ficha também estão listadas para revisão, sem serem descartadas silenciosamente.\n';
await writeFile(new URL('HABILIDADES-A-GERAR.md',dir),md);
console.log(resultado.resumo);console.log(fileURLToPath(new URL('HABILIDADES-A-GERAR.md',dir)));
