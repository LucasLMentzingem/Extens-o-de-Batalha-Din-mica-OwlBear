import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {novo,adicionar,validar,aplicar,opcoesDisponiveis,caAtual} from './site/engine.mjs';
import {compactarEstado} from './site/catalog.mjs';
const personagens=['dragoberto','draven-thorne','hannah-montana','loteria','nikki','skimi','zurich'];
const grupo=fs.readdirSync(new URL('./conteudo/aventura-no-cemiterio/',import.meta.url)).map(n=>JSON.parse(fs.readFileSync(new URL('./conteudo/aventura-no-cemiterio/'+n,import.meta.url))));
const jogadores=personagens.map(n=>JSON.parse(fs.readFileSync(new URL('./site/fichas/'+n+'.json',import.meta.url))));
const gm={id:'m',role:'GM'};
function dados(formula,meta){
  if(meta.tipo==='ataque')return {total:40,natural:20,formula};
  if(meta.tipo==='salvaguarda')return {total:1,natural:1,formula};
  const extras=(meta.adicionais??[]).filter(x=>x.automatico),base={total:4,formula};
  return {...base,...(extras.length?{total:4*(extras.length+1),resultados:[base,...extras.map(x=>({total:4,formula:x.formula}))],recursosAtivos:extras.map(x=>x.id)}:{})};
}
function ataque(a){return opcoesDisponiveis(a).find(o=>!o.gatilho&&!o.composicao&&!o.requisitosUso&&!o.selecao&&['ataque','salva'].includes(o.automacao?.tipo)&&o.automacao.dano&&!o.automacao.raioM&&!o.automacao.area&&!o.automacao.ataques);}

for(const pj of jogadores){
  test(pj.nome+': ataques contra as 11 fichas novas e resposta dos inimigos',async()=>{
    for(const npc of grupo)for(const inverter of [false,true]){
      const s=novo(),a=adicionar(s,validar(inverter?npc:pj)),b=adicionar(s,validar(inverter?pj:npc));a.x=b.x=0;a.y=0;b.y=1.5;
      const o=ataque(a);assert.ok(o,a.nome+' deve ter um ataque testável');
      const extras={tipo:'usar',rev:s.rev,ator:a.id,opcao:o.id,alvo:b.id,confirmado:true};
      const n=await aplicar(s,extras,gm,dados),origem=n.atores.find(x=>x.id===a.id),alvo=n.atores.find(x=>x.id===b.id);
      assert.ok(alvo.pv<b.pv,a.nome+' deve causar dano a '+b.nome);assert.ok(Number.isFinite(caAtual(origem))&&Number.isFinite(caAtual(alvo)));assert.ok(!n.resolucaoPendente,'Ataque deve concluir');
      for(const c of o.custo??[])if(c.tipo==='recurso')assert.equal(origem.rec[c.id],a.rec[c.id]-c.quantidade);
      assert.equal(s.atores[1].pv,b.pv,'Entrada do comando preservada');
      const salvo=JSON.parse(JSON.stringify(compactarEstado(n)));for(const x of salvo.atores){x.ficha=validar(x.ficha);assert.ok(x.pv>=0);}
    }
  });
}

test('cura e Bênção do padre funcionam para cada um dos sete aventureiros',async()=>{
  const padre=grupo.find(f=>f.id==='padre-quevedo');
  for(const pj of jogadores){const s=novo(),p=adicionar(s,validar(padre)),a=adicionar(s,validar(pj));p.x=a.x=0;a.pv=1;
    let n=await aplicar(s,{tipo:'usar',rev:s.rev,ator:p.id,opcao:'curar',alvo:a.id,circuloUsado:1},gm,()=>({total:12,formula:'2d8+7'}));assert.equal(n.atores[1].pv,Math.min(a.ficha.pvMaximos,13));
    n=await aplicar(n,{tipo:'usar',rev:n.rev,ator:p.id,opcao:'bencao',alvos:[a.id]},gm,dados);assert.ok(n.atores[0].bencao.alvos.includes(a.id));assert.equal(n.atores[0].rec['espaco-1'],2);
  }
});
