import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {novo,adicionar,validar,aplicar,resolverCA,caAtual,atualizarMagias} from './site/engine.mjs';
import {compactarFicha,resolverInstanciaItem} from './site/catalog.mjs';
import {recuperarEstado} from './site/state-recovery.mjs';
import {fichaEditavel} from './site/ficha-view.mjs';
const gm={id:'gm',role:'GM'},player={id:'p1',role:'PLAYER'};
const fonte=async id=>JSON.parse(await fs.readFile('site/fichas/'+id+'.json','utf8'));
const mesa=async id=>{const s=novo(),a=adicionar(s,await fonte(id));a.dono=player.id;return {s,a};};
const valores=a=>{const r=resolverCA(a);assert.equal(r.base+r.bonusTotal,r.total);assert.equal(r.fontes.reduce((n,f)=>n+f.valor,0),r.bonusTotal);return [r.base,r.bonusTotal,r.total];};
const item=async(s,a,i,op,u=gm)=>aplicar(s,{tipo:'inventario',ator:a.id,itemId:i.id,operacao:op,rev:s.rev,confirmado:true},u);
const armor=a=>a.ficha.inventario.itens.find(i=>i.equipado&&i.categoriaArmadura==='leve');

test('PJ legado v1 ganha a regra dinâmica na primeira validação, sem piso e sem ajuste artificial',async()=>{
  let {a}=await mesa('hannah-montana');const f=structuredClone(a.ficha);delete f.defesaCA;delete f.inventario;
  f.equipamentos=[{nome:'Armadura de Couro',descricao:'CA 11 + DES',inUse:true}];f.caBase=19;
  const v=validar(f);assert.equal(v.defesaCA.revisao,2);assert.equal(v.defesaCA.ajusteManual,0);
  const x={ficha:v,efeitosAtivos:[]};assert.deepEqual(valores(x),[11,2,13]);
  v.inventario.itens.forEach(i=>i.equipado=false);assert.deepEqual(valores(x),[10,2,12]);
});

test('reparo de ajuste automático 0.8.71 é idempotente e conserva ajuste manual explícito',async()=>{
  const {a}=await mesa('dragoberto');
  a.ficha.defesaCA={versao:1,semArmadura:{base:10,atributos:[{atributo:'des'}]},ajusteManual:3,ajusteLegado:true};
  a.ficha=validar(a.ficha);assert.deepEqual(valores(a),[13,0,13]);
  assert.equal(a.ficha.defesaCA.ajusteLegado,undefined);
  const d=structuredClone(a.ficha.defesaCA);atualizarMagias(a.ficha);assert.deepEqual(a.ficha.defesaCA,d);
  a.ficha.defesaCA={versao:1,semArmadura:{base:10,atributos:[{atributo:'des'}]},ajusteManual:2};
  a.ficha=validar(a.ficha);assert.deepEqual(valores(a),[13,2,15]);
});

test('aventureiro já importado sem armadura não conserva base congelada da 0.8.71',async()=>{
  const {a}=await mesa('skimi');for(const i of a.ficha.inventario.itens)i.equipado=false;
  a.ficha.defesaCA={versao:1,semArmadura:{base:13,atributos:[]},ajusteManual:0};
  a.ficha=validar(a.ficha);assert.deepEqual(valores(a),[10,2,12]);
  a.ficha.atributos.des=18;assert.deepEqual(valores(a),[10,4,14]);
});

test('equipar/desequipar por GM ou jogador muda CA base e preserva o bônus de atributo permitido',async()=>{
  for(const u of [gm,player]){
    let {s,a}=await mesa('hannah-montana'),arm=armor(a);assert.deepEqual(valores(a),[11,2,13]);
    s=await item(s,a,arm,'desequipar',u);a=s.atores[0];assert.deepEqual(valores(a),[10,2,12]);
    s=await item(s,a,arm,'equipar',u);assert.deepEqual(valores(s.atores[0]),[11,2,13]);
  }
});

test('armadura tem prioridade sobre traço superior; escudo/efeitos/luvas só entram na CA extra',async()=>{
  const {a}=await mesa('loteria');assert.deepEqual(valores(a),[10,4,14]);
  a.ficha.proficienciasEquipamento={armaduras:['media','escudo']};
  a.ficha.inventario.itens.push(resolverInstanciaItem({id:'malha',ref:'item.la-arte.camisao-malha-mais-2',quantidade:1,equipado:true,equipadoSlot:'vestes'}),resolverInstanciaItem({id:'escudo',ref:'item.la-arte.escudo-mais-1',quantidade:1,equipado:true,equipadoSlot:'mao_fraca'}),resolverInstanciaItem({id:'guarda',ref:'item.la-arte.luvas-guarda-mais-1',quantidade:1,equipado:true,equipadoSlot:'luvas'}));
  a.efeitosAtivos=[{id:'fe',modificadores:{ca:2}},{id:'shield',modificadores:{ca:5}}];a.ficha.defesaCA.ajusteManual=1;
  assert.deepEqual(valores(a),[13,15,28]); // DES 2 + encantamento 2 + escudo 3 + efeitos 7 + manual 1
  a.ficha.atributos.des=8;assert.deepEqual(valores(a),[13,12,25]);
  for(const i of a.ficha.inventario.itens)if(['malha','escudo'].includes(i.id))i.equipado=false;
  assert.deepEqual(valores(a),[10,9,19]); // DES -1 + SAB 1 + luvas 1 + efeitos 7 + manual 1
});

test('Armadura Arcana troca a base e acompanha DES; Fé e Escudo continuam extras',async()=>{
  const {a}=await mesa('nikki');a.efeitosAtivos=[{id:'aa',caMinima:13,modificadores:{ca:99}},{id:'fe',modificadores:{ca:2}}];
  assert.deepEqual(valores(a),[13,4,17]);a.ficha.atributos.des=18;assert.deepEqual(valores(a),[13,6,19]);
  a.efeitosAtivos.shift();assert.deepEqual(valores(a),[10,6,16]);
});

test('traço declarativo independe de classe, respeita ativação e não soma duas fórmulas',async()=>{
  const {a}=await mesa('nikki');a.ficha.passivas.push({id:'natural',nome:'Defesa especial',ativa:true,formulaCA:{base:12,atributos:[{atributo:'sab'}],requisitos:{semArmaduraCorporal:true}}});
  a.ficha.atributos.sab=18;assert.deepEqual(valores(a),[12,4,16]);
  a.ficha.passivas.at(-1).ativa=false;assert.deepEqual(valores(a),[10,2,12]);
});

test('round-trip e recuperação preservam regra/itens/recursos sem exigir reimportação',async()=>{
  let {s,a}=await mesa('hannah-montana');s=await item(s,a,armor(a),'desequipar');a=s.atores[0];
  const antes={itens:a.ficha.inventario.itens.map(i=>[i.id,i.quantidade,i.equipado]),rec:structuredClone(a.rec)};
  a.ficha=compactarFicha(a.ficha);const r=recuperarEstado(JSON.parse(JSON.stringify(s)));assert.equal(r.novas.length,0);
  const b=r.estado.atores[0];assert.deepEqual(valores(b),[10,2,12]);
  assert.deepEqual(b.ficha.inventario.itens.map(i=>[i.id,i.quantidade,i.equipado]),antes.itens);assert.deepEqual(b.rec,antes.rec);
});

test('todas as 29 fontes carregam com defesa e nenhum aventureiro tem dois pares equipados',async()=>{
  let total=0;
  for(const dir of ['site/fichas','conteudo/aventura-no-cemiterio','site/downloads/fichas-prototipo-0.8.56','site/downloads/fichas-prototipo-0.8.58','site/downloads'])for(const nome of await fs.readdir(dir)){
    if(!nome.endsWith('.json')||nome.endsWith('.schema.json'))continue;
    const f=JSON.parse(await fs.readFile(dir+'/'+nome));if(!f.atributos)continue;
    const a=adicionar(novo(),f);assert.equal(a.ficha.defesaCA.revisao,2,dir+'/'+nome);valores(a);total++;
    assert.ok(a.ficha.inventario.itens.filter(i=>i.equipado&&i.slotEquipamento==='luvas').length<=1);
  }
  assert.equal(total,29);
});

test('ficha exibe base, todos os extras e total sem subtrair o ajuste manual da CA extra',async()=>{
  const {a}=await mesa('nikki');a.ficha.defesaCA.ajusteManual=3;const html=fichaEditavel(a,true);
  for(const [nome,valor] of [['ca-base','10'],['ca-bonus','+5'],['ca-total','15']])assert.ok(html.includes('name="'+nome+'" type="text" value="'+valor+'"'),nome);
  assert.ok(html.includes('CA extra'));assert.equal(a.ficha.caBase,12,'render não salva o resultado derivado');
});

test('oito variantes mágicas com definição/ajuste antigo separam encantamento sem duplicar após reabrir',async()=>{
  for(const nome of ['camisao-malha','cota-malha','placas','escudo'])for(const n of [1,2])for(const expandido of [false,true]){
    const {a}=await mesa('nikki');a.ficha.proficienciasEquipamento={armaduras:['media','pesada','escudo']};a.ficha.inventario.itens.forEach(i=>i.equipado=false);
    const i=resolverInstanciaItem({id:'legado',ref:'item.la-arte.'+nome+'-mais-'+n,quantidade:1,equipado:true,equipadoSlot:nome==='escudo'?'mao_fraca':'vestes'}),valorBase=i.classeArmadura.valor;
    i.classeArmadura.valor+=n;i.modificadores.ca=expandido?0:n;
    a.ficha.inventario.itens.push(i);a.ficha._catalogoV2.instancias.push({id:i.id,ref:i.catalogoRef,ajustes:{classeArmadura:{valor:valorBase+n}}});
    a.ficha=validar(a.ficha);const atual=a.ficha.inventario.itens.find(x=>x.id===i.id);
    assert.equal(atual.classeArmadura.valor,valorBase);assert.equal(atual.modificadores.ca,n);
    const antes=valores(a);a.ficha=validar(compactarFicha(a.ficha));assert.deepEqual(valores(a),antes,nome+' +'+n);
  }
});
