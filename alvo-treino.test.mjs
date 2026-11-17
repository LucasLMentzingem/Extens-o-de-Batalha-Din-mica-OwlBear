import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {novo,adicionar,validar,aplicar,caAtual,deslocamentoMaximo} from './site/engine.mjs';
import {compactarEstado} from './site/catalog.mjs';
import {modeloReanimacao} from './site/substituicao-ficha.mjs';
import {visualTokenFicha} from './site/tokens-fichas.mjs';
const fonte=async()=>JSON.parse(await fs.readFile('site/fichas/saco-de-pancadas.json','utf8'));

test('saco de pancadas entra pelo grupo Treino com CA 1, 500 PV e persiste sem equipamento ou loot',async()=>{
 const f=await fonte(),grupos=JSON.parse(await fs.readFile('site/grupos-fichas.json','utf8'));assert.ok(grupos.grupos.find(g=>g.id==='treino').fichas.some(x=>x.id===f.id));
 const s=await aplicar(novo(),{tipo:'adicionarGrupo',rev:0,fichas:[f],origemGrupo:{id:'treino',nome:'Treino'}},{id:'m',role:'GM'});
 const a=s.atores[0];assert.equal(a.pv,500);assert.equal(caAtual(a),1);assert.equal(deslocamentoMaximo(a),0);assert.equal(a.ficha.tipoCriatura,'objeto');assert.deepEqual(a.ficha.inventario.itens,[]);
 const n=JSON.parse(JSON.stringify(compactarEstado(s)));n.atores[0].ficha=validar(n.atores[0].ficha);assert.equal(caAtual(n.atores[0]),1);assert.equal(n.atores[0].pv,500);
});
test('alvo de treino recebe dano físico, radiante e necrótico integral e não é cadáver de humanoide',async()=>{
 for(const elemento of ['perfurante','radiante','necrotico']){
  const s=novo(),a=adicionar(s,await fonte()),origem=adicionar(s,await fonte());origem.x=0;a.x=1;
  origem.ficha.opcoes.push({id:'golpe',nome:'Golpe de teste',categoria:'acao',custo:[],automacao:{tipo:'ataque',bonus:5,dano:'16',elemento,alcanceM:1.5}});
  const n=await aplicar(s,{tipo:'usar',rev:s.rev,ator:origem.id,opcao:'golpe',alvo:a.id},{id:'m',role:'GM'},(f,m)=>m.tipo==='ataque'?{natural:10,total:15}:{total:16});
  assert.equal(n.atores[0].pv,484);n.atores[0].pv=0;n.atores[0].estadoVida='morto';assert.equal(modeloReanimacao(n.atores[0]),null);
 }
});
test('Criar token seleciona PNG próprio com alpha e dimensões corretas, mantendo as artes anteriores',async()=>{
 const f=await fonte(),v=visualTokenFicha(f),png=await fs.readFile(new URL(v.arquivo, new URL('./site/',import.meta.url)));
 assert.equal(v.mime,'image/png');assert.equal(v.arquivo,'./assets/tokens/treino/saco-de-pancadas.png');assert.equal(png.readUInt32BE(16),v.largura);assert.equal(png.readUInt32BE(20),v.altura);assert.equal(png[25],6,'PNG RGBA conserva transparência');
 assert.equal(visualTokenFicha({id:'soldado'}).arquivo,'./fichas/soldado.png');assert.equal(visualTokenFicha({id:'outro'}).arquivo,'./icone.svg');
 v.arquivo='alterado';assert.notEqual(visualTokenFicha(f).arquivo,'alterado');
});
