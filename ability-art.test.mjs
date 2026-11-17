import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {visualHabilidade,arteHabilidade,testeVisual,opcaoConsumoItem} from './site/ability-art.mjs';
import {validar,opcoesDisponiveis,adicionar,novo} from './site/engine.mjs';
import {compactarFicha} from './site/catalog.mjs';

test('arte compartilhada acompanha arma equipada e permanece Comum no observador',()=>{
 const f={inventario:{itens:[{id:'arma',icone:'assets/itens/item-adaga.webp',equipadoSlot:'mao_fraca'}]}};
 const h={nome:'Adaga',origemItem:'arma',geradaPorItem:true,origemTipo:'classe',automacao:{tipo:'ataque',arremesso:true}};
 const visual=visualHabilidade(h,f);
 assert.equal(visual.familia,'comum');assert.equal(visual.arquivo,f.inventario.itens[0].icone);assert.equal(visual.variante,'Arremesso');
 assert.deepEqual(visualHabilidade({...h,visual},{}),visual);
 f.inventario.itens[0].icone='assets/itens/item-azagaia.webp';assert.equal(visualHabilidade(h,f).arquivo,f.inventario.itens[0].icone);
});
test('origem da concessão, exceção autoral e soco sem arquivo',()=>{
 assert.equal(visualHabilidade({origemTipo:'raca'}).familia,'raca');
 assert.equal(visualHabilidade({origemConcessao:{tipo:'classe'}}).familia,'classe');
 assert.equal(visualHabilidade({origemTipo:'classe',visual:{familia:'comum'}}).familia,'comum');
 assert.equal(visualHabilidade({nome:'Golpe desarmado'}).arteId,'comum.soco');
 assert.equal(visualHabilidade({nome:'Golpe desarmado'}).arquivo,'assets/habilidades/comum-soco.png');
 assert.match(arteHabilidade({nome:'Golpe desarmado'}),/habilidade-recorte/);
});
test('testes mantêm nome completo, família comum, bônus e escape de texto',()=>{
 const h=testeVisual('salvaguardas','con',-2),v=visualHabilidade(h);
 assert.equal(v.layout,'texto');assert.equal(v.familia,'comum');assert.match(v.textoCurto,/Constituição/);
 assert.match(arteHabilidade(h),/>-2<\/span>/);
 const html=arteHabilidade({nome:'<img src=x onerror=alert(1)>',visual:{arquivo:'javascript:alert(1)'}});
 assert.ok(!html.includes('src="javascript:'));assert.ok(html.includes('&lt;img'));
});
test('metadados de adicional recuperam arte da opção original da ficha',()=>{
 const f={opcoes:[{id:'extra',origemTipo:'classe',visual:{arteId:'classe.manobra'}}]};
 const v=visualHabilidade({id:'extra',nome:'Manobra'},f);assert.equal(v.arteId,'classe.manobra');assert.equal(v.familia,'classe');
});
test('sete fichas renderizam sem alterar conteúdo ou persistir arte resolvida',async()=>{
 for(const nome of ['nikki','draven-thorne','zurich','skimi','dragoberto','hannah-montana','loteria']){
  const f=validar(JSON.parse(await readFile(new URL('./site/fichas/'+nome+'.json',import.meta.url),'utf8'))),a=adicionar(novo(),f),antes=JSON.stringify(compactarFicha(a.ficha));
  for(const h of [...opcoesDisponiveis(a),...(a.ficha.passivas??[])]){const html=arteHabilidade(h,a.ficha);assert.match(html,/habilidade-arte/);assert.ok(!html.includes('undefined'));}
  assert.equal(JSON.stringify(compactarFicha(a.ficha)),antes);
 }
});
test('famílias, perícias, salvaguardas e arremesso usam artes e camadas locais',async()=>{
 const c={};
 for(const familia of ['comum','raca','classe'])assert.equal(visualHabilidade({nome:'Exemplo',origemTipo:familia}).arquivo,null);
 assert.equal(visualHabilidade(testeVisual('pericias','Prestidigitação',4)).arquivo,null);
 assert.equal(visualHabilidade(testeVisual('pericias','Investigação',4)).arquivo,'assets/habilidades/comum-pericia.png');
 for(const chave of ['for','des','con','int','sab','car'])assert.equal(visualHabilidade(testeVisual('salvaguardas',chave,2)).arquivo,'assets/habilidades/salvaguarda-'+chave+'.png');
 const arremesso=visualHabilidade({nome:'Adaga arremesso',origemItem:'x',geradaPorItem:true,automacao:{tipo:'ataque',arremesso:true}},{inventario:{itens:[{id:'x',icone:'assets/itens/adaga.webp'}]}});
 assert.equal(arremesso.arquivo,'assets/itens/adaga.webp');assert.equal(arremesso.varianteImagem,'assets/habilidades/variante-arremesso.png');
 const especificas=[['1º | Saraivada de Espinhos','magia-saraivada-espinhos.png'],['1º | Mísseis Mágicos','magia-misseis-magicos.png'],['Truque | Raio de Fogo','magia-raio-fogo.png'],['Torrente de Golpes +5','monge-torrente-golpes.png']];
 for(const [nome,arquivo] of especificas)assert.equal(visualHabilidade({nome}).arquivo,'assets/habilidades/'+arquivo);
 for(const arquivo of [...Object.values(c).map(n=>'site/assets/habilidades/'+n),'site/assets/habilidades/comum-pericia.png',...['for','des','con','int','sab','car'].map(n=>'site/assets/habilidades/salvaguarda-'+n+'.png'),'site/assets/habilidades/variante-arremesso.png','site/assets/habilidades/magia-saraivada-espinhos.png','site/assets/habilidades/magia-misseis-magicos.png','site/assets/habilidades/magia-raio-fogo.png','site/assets/habilidades/monge-torrente-golpes.png']){
  const bytes=await readFile(new URL('./'+arquivo,import.meta.url));assert.ok(bytes.length>1000,arquivo);
 }
});
test('habilidades distintas não emprestam ilustração de origem, perícia ou soco',()=>{
 const a=visualHabilidade({nome:'Mão de Cura',origemTipo:'classe'}),b=visualHabilidade({nome:'Defesa Paciente',origemTipo:'classe'});
 assert.notEqual(a.arteId,b.arteId);assert.equal(a.fundo,b.fundo);assert.equal(a.moldura,b.moldura);assert.equal(a.arquivo,null);assert.equal(b.arquivo,null);
 const torrente=visualHabilidade({nome:'Torrente de Golpes',automacao:{tags:['desarmado']}});
 assert.equal(torrente.arteId,'monge.torrente-de-golpes');assert.notEqual(torrente.arquivo,visualHabilidade({nome:'Soco'}).arquivo);
 assert.equal(visualHabilidade(testeVisual('salvaguardas','for',2)).textoCurto,'Força');
 assert.equal(testeVisual('salvaguardas','for',2).nome,'Salva de Força');
});
test('todas as habilidades de itens usam tema Comum e priorizam a arte configurada da skill',()=>{
 const item={id:'colar',nome:'Colar',icone:'assets/itens/colar.webp',quantidade:1};
 const f={inventario:{itens:[item]}},h={id:'mortos',nome:'Falar com os Mortos',origemItem:'colar',concedidaPorItem:'colar',categoria:'item',origemTipo:'classe'};
 const padrao=visualHabilidade(h,f);assert.equal(padrao.familia,'comum');assert.equal(padrao.arquivo,item.icone);assert.equal(padrao.fonteArte,'item');assert.deepEqual(visualHabilidade({...h,visual:padrao}),padrao);
 const custom={...h,visual:{arteId:'magia.raio-de-fogo',familia:'classe'}};
 const propria=visualHabilidade(custom,f);assert.equal(propria.familia,'comum');assert.equal(propria.arquivo,'assets/habilidades/magia-raio-fogo.png');assert.equal(propria.fonteArte,'habilidade');assert.deepEqual(visualHabilidade({...custom,visual:propria}),propria);
 const arquivo=visualHabilidade({...h,visual:{arquivo:'assets/habilidades/autoral.png'}},f);assert.equal(arquivo.arquivo,'assets/habilidades/autoral.png');
 const pendente=visualHabilidade({...h,visual:{arteId:'magia.ainda-sem-imagem'}},f);assert.equal(pendente.arquivo,item.icone);
 const consumo=opcaoConsumoItem({...item,tipo:'consumivel',visual:{arteId:'magia.raio-de-fogo'}});assert.equal(visualHabilidade(consumo,f).arquivo,propria.arquivo);assert.equal(consumo.origemItem,item.id);
});
