import {distanciaAoAlvo,centroAlvo,raioAlvo} from './target-geometry.mjs?v=0.8.79';
// Protótipos explícitos: usam a mesma autoridade, transação e relógio do motor.
export const modosPrototipo=new Set(['animar','enfraquecer','vampirico','taumaturgia','luz','santuario','detectar','protecao','prece','acalmar','dissipar','remover','auxilio','restauracao','revivificar','preservar','centelha','expulsar']);
const normal=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const distancia=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const assert=(x,m)=>{if(!x)throw Error(m);};
const mod=n=>Math.floor((n-10)/2);
export const protegidoContra=(alvo,origem)=>Boolean(alvo?.efeitosAtivos?.some(e=>e.protecaoTipos?.includes(normal(origem?.ficha?.tipoCriatura).replace(/[- ]/g,''))));
export const imunePorProtecao=(alvo,origem,condicao)=>['enfeiticado','amedrontado','possuido'].includes(condicao)&&protegidoContra(alvo,origem);
export function validarPrototipo(s,a,o,c,modeloReanimacao){
  const r=o.automacao;if(r?.tipo!=='prototipo')return;
  assert(modosPrototipo.has(r.modo),'Protótipo desconhecido.');
  for(const e of r.escolhas??[])assert(e.valores.some(v=>v.id===(c.parametros?.[e.id]??e.valores[0].id)),'Escolha inválida: '+e.nome);
  const ids=o.selecao?c.alvos:r.pessoal?[a.id]:[c.alvo],alvos=ids?.map(id=>s.atores.find(p=>p.id===id));
  assert(alvos?.length&&alvos.every(p=>p&&distanciaAoAlvo(a,p)<=r.alcanceM+1e-8),'Escolha alvos válidos ao alcance.');
  assert(new Set(ids).size===ids.length,'Escolha criaturas diferentes.');
  if(r.modo==='animar')assert(alvos.every(p=>p!==a&&modeloReanimacao(p)&&['pequeno','medio'].includes(p.ficha.tamanho??'medio')),'Escolha um humanoide morto Pequeno/Médio a 0 PV ou menos, ou goblin marcado da aventura. PJs devem estar mortos.');
  if(r.modo==='prece')assert(alvos.every(p=>p.estadoVida!=='morto'&&!p.efeitosAtivos?.some(e=>e.preceRecebida)),'Prece exige criaturas vivas que ainda não receberam esta magia desde o último descanso longo.');
  if(r.modo==='revivificar'){
    assert(alvos[0].estadoVida==='morto','Revivificar exige uma criatura morta.');
    assert(c.parametros?.morteRecente==='sim','Confirme morte há até 1 minuto, corpo apto e morte não causada por velhice.');
    assert(componente(a,'diamante'),'Falta um diamante cadastrado de pelo menos 300 PO (nome ou componenteMagico: diamante).');
  }
  if(r.modo==='protecao')assert(componente(a,'protecao'),'Falta água benta comum ou pó de prata e ferro cadastrado para o componente consumido. Água benta de missão não é consumida por este protótipo.');
  if(r.modo==='expulsar')assert(alvos.every(p=>normal(p.ficha.tipoCriatura).replace(/[- ]/g,'')==='mortovivo'),'Expulsar só aceita mortos-vivos.');
  if(r.modo==='acalmar'){
    assert(alvos.every(p=>normal(p.ficha.tipoCriatura??'humanoide')==='humanoide'),'Acalmar Emoções exige humanoides.');
    const centros=alvos.map(centroAlvo);for(let i=0;i<alvos.length;i++)for(let j=i+1;j<alvos.length;j++){
      const p=centroAlvo(alvos[i]),q=centroAlvo(alvos[j]),d=distancia(p,q),r=6+raioAlvo(alvos[i]),t=6+raioAlvo(alvos[j]);if(!d||d>r+t||d<Math.abs(r-t))continue;
      const k=(r*r-t*t+d*d)/(2*d),h=Math.sqrt(Math.max(0,r*r-k*k)),x=p.x+k*(q.x-p.x)/d,y=p.y+k*(q.y-p.y)/d;
      for(const sinal of [-1,1])centros.push({x:x+sinal*h*(q.y-p.y)/d,y:y-sinal*h*(q.x-p.x)/d});
    }
    assert(centros.some(c=>alvos.every(p=>distanciaAoAlvo(c,p)<=6+1e-8)),'Os alvos devem caber em uma esfera de raio 6 m.');
  }
  if(r.modo==='restauracao')assert(alvos[0].efeitosAtivos?.some(e=>e.condicao===(c.parametros?.condicao??'cego')),'O alvo não possui a condição escolhida.');
}
function componente(a,tipo){return a.ficha.inventario.itens.find(i=>i.quantidade>0&&(tipo==='diamante'
  ?(i.componenteMagico==='diamante'||normal(i.nome).includes('diamante'))&&Number(i.valorPo??i.precoPo??(i.preco?.moeda==='po'?i.preco.valor:0))>=300
  :i.componenteMagico==='protecao'||normal(i.nome)==='agua benta'||/po de prata e ferro/.test(normal(i.nome))));}
function consumir(a,i){i.quantidade--;if(!i.quantidade)a.ficha.inventario.itens=a.ficha.inventario.itens.filter(x=>x!==i);}
export async function executarPrototipo(s,a,o,c,api,{concentracaoId=null,concluindo=false}={}){
  const r=o.automacao,k=r.modo,circulo=o.circuloUsado??o.circuloBase??0,ids=o.selecao?c.alvos:r.pessoal?[a.id]:[c.alvo],alvos=ids.map(id=>s.atores.find(p=>p.id===id));
  const parametro=id=>c.parametros?.[id]??r.escolhas?.find(e=>e.id===id)?.valores[0].id;
  const efeito=(p,def,turnos=10)=>{
    const id=o.id+'-'+a.id;p.efeitosAtivos=(p.efeitosAtivos??[]).filter(e=>e.id!==id);
    const e={id,nome:o.nome,tipo:'buff',origemAtorId:a.id,circuloMagia:circulo||undefined,magia:o.categoria==='magia',concentracaoId:concentracaoId??undefined,duracao:{turnos,restante:turnos,expira:'inicio_origem'},...def};p.efeitosAtivos.push(e);return e;
  };
  const salva=async(p,atributo,cd=15)=>{
    const bonus=p.ficha.salvaguardas?.[atributo]??mod(p.ficha.atributos[atributo]);
    return (await api.rolarD20(bonus,p,{tipo:'salvaguarda',atributo,cd,titulo:o.nome+' · '+p.nome,alvo:p.nome})).total>=cd;
  };
  if(r.tempoSegundos&&!concluindo){
    a.conjuracaoLonga={opcao:structuredClone(o),comando:structuredClone(c),concentracaoId,restanteSegundos:r.tempoSegundos};
    efeito(a,{nome:'Conjurando '+o.nome,conjuracaoLonga:true,descricao:'Restam '+r.tempoSegundos+' s. Avance o tempo ou mantenha a ação a cada turno. Interromper a concentração cancela sem gastar espaço.'},r.tempoSegundos/6+1);
    return 'iniciou conjuração de '+r.tempoSegundos+' s; espaço será gasto ao concluir';
  }
  if(k==='animar'){
    api.sobrepor(alvos[0],a);return 'sobreposição aplicada; ficha, loot original e troca de token preservados';
  }
  if(k==='enfraquecer'){
    const p=alvos[0],sucesso=await salva(p,'con');
    if(sucesso)efeito(p,{nome:'Enfraquecimento · próximo ataque',restricoes:{desvantagemAtaques:true,consumirAoAtacar:true}},1);
    else efeito(p,{tipo:'debuff',restricoes:{desvantagemD20:['for']},reducaoDanoFormula:'1d8',salvaRepetida:{atributo:'con',cd:15}});
    return p.nome+(sucesso?' resistiu; desvantagem no próximo ataque':' enfraquecido; FOR com desvantagem e −1d8 por rolagem de dano');
  }
  if(k==='vampirico'){
    if(!concluindo){
      const repeticao=structuredClone(o);repeticao.id='repetir-vampirico';repeticao.nome='Toque Vampírico · repetir';repeticao.custo=[{tipo:'acao',quantidade:1}];delete repeticao.concentracao;
      repeticao.categoria='acao';delete repeticao.circuloBase;delete repeticao.circuloUsado;delete repeticao.catalogoRef;
      repeticao.automacao={...r,repetir:true,dados:3+Math.max(0,circulo-3)};delete repeticao.escalaCirculo;
      if(!r.repetir)efeito(a,{opcoesConcedidas:[repeticao]});
    }
    const p=alvos[0];
    const rr=await api.rolarD20(7,a,{tipo:'ataque',atributo:'int',cd:api.caAtual(p),titulo:o.nome,alvo:p.nome,alvoAtorId:p.id});
    if(rr.natural===1||rr.natural!==20&&rr.total<api.caAtual(p))return 'errou '+p.nome;
    const dados=r.dados??3+Math.max(0,circulo-3),critico=rr.natural===20,formula=(critico?dados*2:dados)+'d6';
    if(api.abrirReacao(p,a,{formula,critico,ataqueTotal:rr.total,elemento:'necrotico',tags:['magia','corpo_a_corpo'],nome:o.nome,curaVampirica:true}))return 'aguardando reação de '+p.nome;
    const valor=(await api.resultado(formula,{tipo:'dano',titulo:o.nome,tipoDano:'necrotico'})).total;
    const dano=await api.dano(p,valor,'necrotico',{origem:a,critico,retornarDanoRecebido:true});
    return p.nome+' sofreu '+dano+' necrótico; recuperou '+api.curar(a,Math.floor(dano/2))+' PV';
  }
  if(k==='santuario'){efeito(alvos[0],{santuarioCD:15,encerraAoAgir:true});return alvos[0].nome+' protegido por Santuário (SAB CD 15)';}
  if(k==='protecao'){consumir(a,componente(a,'protecao'));efeito(alvos[0],{protecaoTipos:['aberracao','celestial','elemental','feerico','infernal','mortovivo']},100);return alvos[0].nome+' protegido; componente consumido';}
  if(k==='taumaturgia'){efeito(a,{vantagemPericias:['Intimidação'],descricao:'Prodígio de Taumaturgia; Intimidação com vantagem. Sons, portas e chama são narrativos.'});return 'prodígio registrado por 1 minuto';}
  if(k==='luz'){efeito(alvos[0],{iluminacao:{plenaM:6,penumbraM:6},descricao:'Objeto carregado pelo alvo: luz plena 6 m + penumbra 6 m. Marcador de iluminação; não altera plugins de iluminação.'},600);return 'marcador Luz aplicado por 1 hora';}
  if(k==='detectar'){efeito(a,{detectarMagia:true,descricao:'Percebe magia a 9 m. Auras ocultas e escolas dependem do mestre.'},100);return 'detecção ativa por até 10 minutos';}
  if(k==='prece'){
    const valor=(await api.resultado((2+Math.max(0,circulo-2))+'d8+'+(4+Math.max(0,circulo-2)),{tipo:'cura',titulo:o.nome})).total;
    for(const p of alvos){api.descansoCurto(p);api.curar(p,valor);efeito(p,{preceRecebida:true,removeEm:'descanso_longo',duracao:undefined,descricao:'Já recebeu Prece de Cura; novo uso após descanso longo.'});}
    return 'descanso curto e cura '+valor+' para '+alvos.map(p=>p.nome).join(', ');
  }
  if(k==='acalmar'){
    const falhos=[];for(const p of alvos)if(!await salva(p,'car')){efeito(p,parametro('modo')==='indiferenca'?{indiferenca:true,encerraAoSofrerDano:true,descricao:'Indiferente; agressão a aliados e retomada de hostilidade são arbitradas pelo mestre.'}:{suprimeCondicoes:['amedrontado','enfeiticado']});falhos.push(p.nome);}
    return 'efeito em '+(falhos.join(', ')||'nenhum alvo');
  }
  if(k==='auxilio'){
    const bonus=5*(1+Math.max(0,circulo-2));for(const p of alvos){
      const antigo=(p.efeitosAtivos??[]).filter(e=>e.auxilio).reduce((n,e)=>Math.max(n,e.modificadores?.pvMaximos??0),0);
      if(antigo>bonus)continue;
      p.efeitosAtivos=(p.efeitosAtivos??[]).filter(e=>!e.auxilio);efeito(p,{auxilio:true,modificadores:{pvMaximos:Math.max(antigo,bonus)}},4800);if(bonus>antigo)api.curar(p,bonus-antigo);
    }return '+'+bonus+' PV máximos/atuais por 8 horas (sem acumular)';
  }
  if(k==='restauracao'){const p=alvos[0],condicao=parametro('condicao');p.efeitosAtivos=p.efeitosAtivos.filter(e=>e.condicao!==condicao);return 'encerrou '+condicao+' em '+p.nome;}
  if(k==='remover'){const p=alvos[0];p.efeitosAtivos=(p.efeitosAtivos??[]).filter(e=>!e.maldicao);return 'removeu efeitos marcados maldição; itens amaldiçoados e rito da adaga permanecem sujeitos às próprias regras';}
  if(k==='dissipar'){
    const p=alvos[0],encerrados=[];
    for(const e of [...(p.efeitosAtivos??[])]){
      if(!e.magia&&!e.circuloMagia)continue;const nivel=e.circuloMagia??1;
      if(nivel>circulo&&(await api.rolarD20(4,a,{tipo:'teste',atributo:'sab',cd:10+nivel,titulo:'Dissipar · '+e.nome})).total<10+nivel)continue;
      p.efeitosAtivos=(p.efeitosAtivos??[]).filter(x=>x!==e);encerrados.push(e.nome);
    }
    for(const origem of s.atores)if(origem.bencao?.alvos.includes(p.id)){
      origem.bencao.alvos=origem.bencao.alvos.filter(id=>id!==p.id);encerrados.push('Bênção');if(!origem.bencao.alvos.length){delete origem.bencao;api.encerrarConcentracao(s,origem,'Dissipar Magia');}
    }
    return 'magias encerradas: '+(encerrados.join(', ')||'nenhuma magia cadastrada');
  }
  if(k==='revivificar'){const p=alvos[0];consumir(a,componente(a,'diamante'));p.estadoVida='inconsciente';p.salvaguardasMorte={sucessos:0,falhas:0};p.pv=0;api.curar(p,1);return p.nome+' voltou com 1 PV; diamante consumido';}
  if(k==='preservar'){
    let saldo=25;const curas=[];for(const p of alvos){const n=Math.min(saldo,Math.max(0,Math.floor(api.pvMaximos(p)/2)-p.pv)),curado=api.curar(p,n);saldo-=curado;curas.push(p.nome+' +'+curado);}
    return curas.join(', ')+'; saldo não usado '+saldo+' (distribuição na ordem escolhida, limite de metade dos PV)';
  }
  if(k==='centelha'){const p=alvos[0],sucesso=await salva(p,'con'),bruto=(await api.resultado('1d8+4',{tipo:'dano',titulo:o.nome})).total;const dano=await api.dano(p,sucesso?Math.floor(bruto/2):bruto,parametro('elemento'),{origem:a});return p.nome+' perdeu '+dano+' PV';}
  if(k==='expulsar'){
    const falhos=[];for(const p of alvos)if(!await salva(p,'sab'))falhos.push(p);
    const bruto=falhos.length&&parametro('abrasar')!=='nao'?(await api.resultado('4d8',{tipo:'dano',titulo:'Abrasar Mortos-vivos'})).total:0;
    for(const p of falhos){if(bruto)await api.dano(p,bruto,'radiante',{origem:a});efeito(p,{condicao:'amedrontado',restricoes:{semAcoes:true,semBonus:true,semReacao:true},encerraAoSofrerDano:true,expulsao:true,descricao:'Deve usar o movimento para se afastar do clérigo. Dano posterior encerra; movimento de fuga decidido pela mesa.'});api.encerrarConcentracao(s,p,'Expulsar Mortos-vivos');}
    return 'expulsos: '+(falhos.map(p=>p.nome).join(', ')||'nenhum');
  }
  throw Error('Protótipo sem execução: '+k);
}
export async function avancarConjuracao(s,a,segundos,api){
  const p=a.conjuracaoLonga;if(!p)return '';
  if(a.pv<=0||a.concentracaoAtiva?.id!==p.concentracaoId){delete a.conjuracaoLonga;a.efeitosAtivos=(a.efeitosAtivos??[]).filter(e=>!e.conjuracaoLonga);return 'Conjuração de '+a.nome+' interrompida; nenhum espaço gasto.';}
  p.restanteSegundos-=segundos;
  for(const e of a.efeitosAtivos??[])if(e.conjuracaoLonga)e.descricao='Restam '+Math.max(0,p.restanteSegundos)+' s de conjuração.';
  if(p.restanteSegundos>0)return '';
  // Revalida corpo, alcance, componentes e beneficiários no instante da conclusão.
  try{
    validarPrototipo(s,a,p.opcao,p.comando,api.modeloReanimacao);
    const recurso='espaco-'+p.opcao.circuloUsado;assert(a.rec[recurso]>0,'O espaço reservado não está mais disponível.');
    api.registrarEspaco(a,[{tipo:'recurso',id:recurso,quantidade:1}]);
    const texto=await executarPrototipo(s,a,p.opcao,p.comando,api,{concluindo:true});a.rec[recurso]--;
    api.encerrarConcentracao(s,a);delete a.conjuracaoLonga;return a.nome+' concluiu '+p.opcao.nome+' • '+texto;
  }catch(e){api.encerrarConcentracao(s,a);delete a.conjuracaoLonga;return 'Conjuração cancelada sem gastar espaço: '+e.message;}
}
