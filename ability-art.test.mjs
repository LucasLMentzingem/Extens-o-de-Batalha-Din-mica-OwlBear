import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {visualHabilidade,arteHabilidade,testeVisual} from './site/ability-art.mjs';
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
 const c={comum:'comum-generico.png',raca:'raca-generico.png',classe:'classe-generico.png'};
 for(const [familia,arquivo] of Object.entries(c))assert.equal(visualHabilidade({nome:'Exemplo',origemTipo:familia}).arquivo,'assets/habilidades/'+arquivo);
 assert.equal(visualHabilidade(testeVisual('pericias','Prestidigitação',4)).arquivo,'assets/habilidades/comum-pericia.png');
 for(const chave of ['for','des','con','int','sab','car'])assert.equal(visualHabilidade(testeVisual('salvaguardas',chave,2)).arquivo,'assets/habilidades/salvaguarda-'+chave+'.png');
 const arremesso=visualHabilidade({nome:'Adaga arremesso',origemItem:'x',geradaPorItem:true,automacao:{tipo:'ataque',arremesso:true}},{inventario:{itens:[{id:'x',icone:'assets/itens/adaga.webp'}]}});
 assert.equal(arremesso.arquivo,'assets/itens/adaga.webp');assert.equal(arremesso.varianteImagem,'assets/habilidades/variante-arremesso.png');
 const especificas=[['1º | Saraivada de Espinhos','magia-saraivada-espinhos.png'],['1º | Mísseis Mágicos','magia-misseis-magicos.png'],['Truque | Raio de Fogo','magia-raio-fogo.png'],['Torrente de Golpes +5','monge-torrente-golpes.png']];
 for(const [nome,arquivo] of especificas)assert.equal(visualHabilidade({nome}).arquivo,'assets/habilidades/'+arquivo);
 for(const arquivo of [...Object.values(c).map(n=>'site/assets/habilidades/'+n),'site/assets/habilidades/comum-pericia.png',...['for','des','con','int','sab','car'].map(n=>'site/assets/habilidades/salvaguarda-'+n+'.png'),'site/assets/habilidades/variante-arremesso.png','site/assets/habilidades/magia-saraivada-espinhos.png','site/assets/habilidades/magia-misseis-magicos.png','site/assets/habilidades/magia-raio-fogo.png','site/assets/habilidades/monge-torrente-golpes.png']){
  const bytes=await readFile(new URL('./'+arquivo,import.meta.url));assert.ok(bytes.length>1000,arquivo);
 }
});
