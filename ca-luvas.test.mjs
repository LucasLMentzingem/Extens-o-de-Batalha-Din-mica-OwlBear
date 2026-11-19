import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {novo,adicionar,validar,aplicar,caAtual,resolverCA,slotsEquipamento} from './site/engine.mjs';
import {compactarEstado,resolverInstanciaItem} from './site/catalog.mjs';

// #77 Slot de Luvas e CA dinâmica por equipamento, traços e efeitos.
const gm={id:'m',role:'GM'};
const ficha=async id=>JSON.parse(await fs.readFile('site/fichas/'+id+'.json','utf8'));
const mesa=async id=>{const s=novo();const a=adicionar(s,validar(await ficha(id)));return {s,a};};
const desequipar=async(s,a,item)=>aplicar(s,{tipo:'inventario',ator:a.id,operacao:'desequipar',itemId:item.id,rev:s.rev,confirmado:true},gm);
const armaduraDe=a=>a.ficha.inventario.itens.find(i=>i.equipado&&i.classeArmadura?.tipo==='base');

test('migração usa as regras das fichas, sem fabricar ajuste para conservar o total antigo',async()=>{
  const ids=(await fs.readdir('site/fichas')).filter(n=>n.endsWith('.json')&&n!=='ficha.schema.json').map(n=>n.replace('.json',''));
  const esperado={'dragoberto':13,'draven-thorne':16,'hannah-montana':13,'loteria':14,'nikki':12,'skimi':13,'zurich':15,'saco-de-pancadas':1};
  for(const id of ids){
    const {a}=await mesa(id);assert.equal(a.ficha.defesaCA?.versao,1,id+' migrou');
    if(esperado[id]!==undefined)assert.equal(caAtual(a),esperado[id],id);
  }
});

test('A02: tirar a armadura derruba a CA (a CA salva não é mais piso)',async()=>{
  for(const [id,semArmadura] of [['draven-thorne',null],['hannah-montana',null],['skimi',null],['zurich',null]]){
    let {s,a}=await mesa(id);const antes=caAtual(a),armadura=armaduraDe(a);assert.ok(armadura,id+' usa armadura');
    s=await desequipar(s,a,armadura);const depois=caAtual(s.atores[0]),r=resolverCA(s.atores[0]);
    assert.ok(depois<antes||armadura.classeArmadura.valor<=10,id+': '+antes+' → '+depois);
    assert.equal(r.origemBase.tipo,'sem_armadura',id);
    assert.equal(depois,10+Math.floor((a.ficha.atributos.des-10)/2)+r.bonusEscudos+r.bonusItens+r.bonusTracos+r.bonusManual,id+' = 10 + DES + bônus');
  }
});

test('A03: sem armadura, mudar DES recalcula a CA',async()=>{
  const {a}=await mesa('nikki');assert.equal(caAtual(a),12);
  a.ficha.atributos.des=18;assert.equal(caAtual(a),14,'10 + DES 4');
});

test('A04/A05: Defesa sem Armadura vem do traço ativo e escudo a bloqueia',async()=>{
  const {a}=await mesa('loteria');const r=resolverCA(a);assert.equal(r.total,14);assert.equal(r.origemBase.tipo,'traco');
  const passiva=a.ficha.passivas.find(p=>p.formulaCA);assert.ok(passiva,'passiva com fórmula');
  passiva.ativa=false;assert.equal(caAtual(a),10+Math.floor((a.ficha.atributos.des-10)/2),'traço desativado: só 10 + DES');
  passiva.ativa=true;a.ficha.proficienciasEquipamento={...(a.ficha.proficienciasEquipamento??{}),armaduras:['escudo']};
  a.ficha.inventario.itens.push({id:'escudo-teste',nome:'Escudo',tipo:'equipamento',quantidade:1,slotEquipamento:'mao_fraca',equipado:true,equipadoSlot:'mao_fraca',categoriaArmadura:'escudo',classeArmadura:{tipo:'bonus',valor:2,classe:'escudo'}});
  assert.equal(caAtual(a),10+Math.floor((a.ficha.atributos.des-10)/2)+2,'com escudo a fórmula do Monge não vale; 10 + DES + escudo');
});

test('A06: Armadura Arcana é fórmula dinâmica (13 + DES) e soma com outro +2',async()=>{
  const {a}=await mesa('nikki');
  a.efeitosAtivos=[{id:'aa',nome:'Armadura Arcana',tipo:'buff',caMinima:13,requisitos:{semArmadura:true},modificadores:{ca:1}}]; // delta legado congelado ignorado
  assert.equal(caAtual(a),15,'13 + DES 2');
  a.efeitosAtivos.push({id:'fe',nome:'Escudo da Fé',tipo:'buff',modificadores:{ca:2}});assert.equal(caAtual(a),17,'com +2: 17');
  a.efeitosAtivos=a.efeitosAtivos.filter(e=>e.id!=='fe');assert.equal(caAtual(a),15,'sem o +2: 15');
  a.ficha.atributos.des=18;assert.equal(caAtual(a),17,'acompanha a DES');
});

test('A08: variantes +1/+2 mantêm o total e escudo mágico sem proficiência não dá bônus parcial',async()=>{
  const {a}=await mesa('nikki');for(const i of a.ficha.inventario.itens)i.equipado=false;
  const escudo=resolverInstanciaItem({id:'e1',ref:'item.la-arte.escudo-mais-1',quantidade:1,equipado:true,equipadoSlot:'mao_fraca'});
  assert.equal(escudo.classeArmadura.valor,2);assert.equal(escudo.modificadores.ca,1);
  a.ficha.inventario.itens.push(escudo);a.ficha.proficienciasEquipamento={...(a.ficha.proficienciasEquipamento??{}),armaduras:[]};
  assert.equal(caAtual(a),12,'sem proficiência: nem proteção nem encantamento');
  a.ficha.proficienciasEquipamento.armaduras=['escudo'];assert.equal(caAtual(a),15,'12 + 2 + 1');
});

test('A01/A09: slot Luvas existe, aceita um par e não aceita acessório comum',async()=>{
  assert.ok(slotsEquipamento.includes('luvas'));
  let {s,a}=await mesa('loteria');
  const par=(id,ref)=>({...resolverInstanciaItem({id,ref,quantidade:1})});
  a.ficha.inventario.itens.push(par('guarda','item.la-arte.luvas-guarda-mais-1'),par('dragao','item.la-arte.luvas-dragao-ascendente-mais-2'));
  assert.equal(a.ficha.inventario.itens.find(i=>i.id==='guarda').slotEquipamento,'luvas');
  const base=caAtual(a);
  s=await aplicar(s,{tipo:'inventario',ator:a.id,operacao:'equipar',itemId:'guarda',rev:s.rev,confirmado:true},gm);
  let x=s.atores[0];assert.equal(x.ficha.inventario.itens.find(i=>i.id==='guarda').equipadoSlot,'luvas');assert.equal(caAtual(x),base+1,'Luvas da Guarda +1 sem armadura');
  s=await aplicar(s,{tipo:'inventario',ator:a.id,operacao:'equipar',itemId:'dragao',rev:s.rev,confirmado:true},gm);
  x=s.atores[0];const g=x.ficha.inventario.itens.find(i=>i.id==='guarda'),d=x.ficha.inventario.itens.find(i=>i.id==='dragao');
  assert.equal(g.equipado,false,'par anterior volta ao inventário');assert.equal(d.equipadoSlot,'luvas');
  assert.equal(x.ficha.inventario.itens.filter(i=>i.equipado&&i.equipadoSlot==='luvas').length,1);
  const anel=x.ficha.inventario.itens.find(i=>i.slotEquipamento==='acessorio')??(()=>{const i={id:'anel',nome:'Anel simples',tipo:'equipamento',quantidade:1,slotEquipamento:'acessorio'};x.ficha.inventario.itens.push(i);return i;})();
  await assert.rejects(aplicar(s,{tipo:'inventario',ator:a.id,operacao:'equipar',itemId:anel.id,slot:'luvas',rev:s.rev,confirmado:true},gm),/incompatível/);
  await assert.rejects(aplicar(s,{tipo:'inventario',ator:a.id,operacao:'equipar',itemId:'guarda',slot:'acessorio_1',rev:s.rev,confirmado:true},gm),/incompatível/);
});

test('migração de fichas antigas com dois pares de luvas nos acessórios: um equipado, outro guardado, nada perdido',async()=>{
  const f=await ficha('loteria');const s=novo(),a=adicionar(s,validar(f));
  const comp=compactarEstado(s).atores[0].ficha;
  comp.inventario.itens.push({id:'l1',ref:'item.la-arte.luvas-guarda-mais-1',quantidade:1,equipado:true,equipadoSlot:'acessorio_1'},{id:'l2',ref:'item.la-arte.luva-boxeador-das-ruas-mais-1',quantidade:1,equipado:true,equipadoSlot:'acessorio_2'});
  delete comp.defesaCA;
  const v=validar(comp),l1=v.inventario.itens.find(i=>i.id==='l1'),l2=v.inventario.itens.find(i=>i.id==='l2');
  assert.ok(l1&&l2,'os dois pares continuam no inventário');
  assert.equal(l1.equipadoSlot,'luvas');assert.equal(l2.equipado,false);
  assert.ok((v.avisosMigracao??[]).some(t=>/Luva/.test(t)));
  const v2=validar(JSON.parse(JSON.stringify(v)));assert.deepEqual(v2.inventario.itens.map(i=>[i.id,i.equipado,i.equipadoSlot??null]),v.inventario.itens.map(i=>[i.id,i.equipado,i.equipadoSlot??null]),'idempotente');
});

test('A15: Dragoberto usa a base 13 cadastrada, sem +3 inventado pela migração',async()=>{
  let {s,a}=await mesa('dragoberto');assert.equal(caAtual(a),13);
  assert.equal(a.ficha.defesaCA.ajusteManual,0);
  assert.deepEqual([resolverCA(a).base,resolverCA(a).bonusTotal],[13,0]);
  s=await desequipar(s,a,armaduraDe(a));
  assert.deepEqual([resolverCA(s.atores[0]).base,resolverCA(s.atores[0]).bonusTotal],[10,3]);
});

test('CA intrínseca: saco de pancadas continua CA 1 e ficha sem atributos fica indisponível',async()=>{
  const {a}=await mesa('saco-de-pancadas');assert.equal(caAtual(a),1);
  assert.equal(resolverCA({ficha:{nome:'Oculto'}}).disponivel,false);
});
