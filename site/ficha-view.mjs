import {bonusEfeito,bonusEquipamento,bonusPassiva,caAtual,pvMaximosAtuais,deslocamentoMaximo,inventarioNormalizado,pesoInventario,slotsEquipamento,slotsOcupadosItem,opcaoPreparada,opcaoDisponivel,opcoesCalculadas,proficienteComArma} from './engine.mjs?v=0.8.1';
export const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function detalhes(o,f){
  const r=o.automacao??{},s=o.selecao;
  const custos=(o.custo??[]).map(c=>c.quantidade+' '+(c.tipo==='recurso'?f.recursos?.find(x=>x.id===c.id)?.nome??c.id:({acao:'ação',bonus:'ação bônus',reacao:'reação'})[c.tipo]));
  const modificadores=r.efeito?.modificadores??{},bonus=Object.entries(modificadores).map(([k,v])=>({ca:'CA',pvMaximos:'PV máximo',deslocamentoM:'deslocamento'}[k]??k)+' '+(v>=0?'+':'')+v).join(' · ');
  const linhas=[o.nome,o.descricao,custos.length?'Custo: '+custos.join(' + '):'',r.alcanceM!=null?'Alcance: '+r.alcanceM+' m':'',r.dano?'Dano: '+r.dano+' '+(r.elemento??''):'',r.cd?'Salvaguarda: '+(r.atributos??[r.atributo]).map(x=>x.toUpperCase()).join(' ou ')+' · CD '+r.cd:'',r.bonus!=null?'Ataque: '+(r.bonus>=0?'+':'')+r.bonus:'',r.deslocamentoForcado?'Deslocamento: empurra '+r.deslocamentoForcado.distanciaM+' m para longe da origem':'',r.efeito?'Efeito: '+r.efeito.nome+(bonus?' · '+bonus:''):'',s?.max>1?'Seleção: '+s.min+' a '+s.max+(s.repetirAlvo?' · permite repetir':' · alvos distintos'):'','Uso: dentro ou fora de combate nesta versão',o.origem?'Origem: '+o.origem:''];
  return linhas.filter(Boolean).join('\n');
}
export function cabecalhoFicha(a){
  const f=a.ficha;
  const classe=f.classes.map(c=>c.nome??c.id).join(' / ');
  const nivel=f.classes.reduce((t,c)=>t+c.nivel,0);
  return '<div class="identidade"><div class="selo">'+(f.id==='soldado'?'<img src="fichas/soldado.png" alt="">':esc(a.nome[0]))+'</div><div><h2>'+esc(a.nome)+'</h2><small>'+esc(classe)+' · Nível '+nivel+'</small></div></div>'+
    '<div class="atributos">'+Object.entries(f.atributos).map(([k,n])=>{const b=Math.floor((n-10)/2);return '<button type="button" class="atributo" data-save="'+esc(k)+'" title="Clique com o botão direito para rolar a salvaguarda"><small>'+esc(k.toUpperCase())+'</small><strong>'+(b>=0?'+':'')+b+'</strong><span>'+n+'</span></button>';}).join('')+'</div>';
}
const campo=(rotulo,nome,valor,tipo='text',extra='',bloqueado='')=>'<label>'+rotulo+'<input name="'+nome+'" type="'+tipo+'" value="'+esc(valor)+'" '+extra+' '+bloqueado+'></label>';
const nomesSlots={cabeca:'Cabeça',capa:'Capa',vestes:'Vestes',botas:'Botas',mao_forte:'Mão forte',mao_fraca:'Mão fraca',arma_distancia:'Arma à distância',colar:'Colar',acessorio_1:'Acessório I',acessorio_2:'Acessório II'};
const resumoItem=(i,f)=>{
  const mods=Object.entries(i.modificadores??{}).map(([k,v])=>({ca:'CA',pvMaximos:'PV máximo',deslocamentoM:'Deslocamento',ataque:'Ataque',dano:'Dano'}[k]??k)+' '+(v>=0?'+':'')+v);
  const ca=i.classeArmadura?['CA',i.classeArmadura.tipo==='base'?'base':'bônus',i.classeArmadura.valor].join(' '):'';
  const arma=i.categoria==='arma'?['Arma: '+i.tipoArma.replaceAll('_',' ')+' · '+i.grupoProficiencia,'Propriedades: '+(i.propriedades??[]).join(', '),proficienteComArma(f,i)?'Personagem proficiente':'Personagem sem proficiência']:[];
  const armadura=i.categoriaArmadura?'Classificação: '+i.categoriaArmadura+(i.requisitos?.forca?' · FOR '+i.requisitos.forca:''):'';
  return [i.nome,'Tipo: '+i.tipo,...arma,armadura,i.descricao,ca,...mods,'Quantidade: '+i.quantidade,'Peso: '+((Number(i.pesoKg)||0)*i.quantidade).toLocaleString('pt-BR')+' kg'].filter(Boolean).join('\n');
};
function inventarioFicha(a,podeEditar){
  const inv=inventarioNormalizado(a.ficha),itens=inv.itens,equipados=Object.fromEntries(itens.filter(i=>i.equipado).flatMap(i=>slotsOcupadosItem(i).map(slot=>[slot,i])));
  const po=itens.filter(i=>i.tipo==='moeda'&&(!i.moeda||i.moeda==='po')).reduce((n,i)=>n+i.quantidade,0);
  const carregados=itens.filter(i=>!i.equipado),totalCelulas=Math.max(25,Math.ceil(carregados.length/5)*5),peso=pesoInventario({...a,ficha:{...a.ficha,inventario:inv}}),percentual=Math.min(100,100*peso/inv.capacidadeCargaKg);
  const icone=i=>'<b>'+(i.icone?'<img src="'+esc(i.icone)+'" alt="">':esc(i.nome.slice(0,2).toUpperCase()))+'</b>';
  const info=(i,comparar=true)=>{const equivalente=comparar&&i.slotEquipamento?(i.slotEquipamento==='acessorio'?(equipados.acessorio_1??equipados.acessorio_2):equipados[i.slotEquipamento]):null;return resumoItem(i,a.ficha)+(equivalente&&equivalente!==i?'\n\nEQUIPADO NO MESMO SLOT\n'+resumoItem(equivalente,a.ficha):'');};
  const slots=slotsEquipamento.map(slot=>{const i=equipados[slot],dupla=i&&slotsOcupadosItem(i).length===2;return '<article class="slot-equipamento '+(i?'ocupado ':'')+(dupla?'duas-maos':'')+'"><small>'+nomesSlots[slot]+'</small>'+(i?'<button type="button" class="icone-item" data-item-id="'+esc(i.id)+'" data-item-slot="'+slot+'" data-item-local="equipado" data-info="'+esc(info(i,false))+'">'+icone(i)+'<span>'+esc(i.nome)+(dupla?' · 2 mãos':'')+'</span></button>':'<div class="slot-vazio">+</div>')+'</article>';}).join('');
  const celulas=Array.from({length:totalCelulas},(_,n)=>{const i=carregados[n];if(!i)return '<div class="celula-item vazia" aria-hidden="true"></div>';return '<button type="button" class="celula-item" data-item-id="'+esc(i.id)+'" data-item-local="inventario" data-info="'+esc(info(i))+'">'+icone(i)+(i.quantidade>1?'<em>'+i.quantidade+'</em>':'')+'<span>'+esc(i.nome)+'</span></button>';}).join('');
  return '<section class="pagina-inventario"><header><div><small>INVENTÁRIO</small><h2>Equipamentos e carga</h2></div><strong class="contador-po">◉ '+po+' PO</strong></header><h3>Equipamentos</h3><p class="muted">Clique com o botão direito para equipar ou desequipar. Em combate a troca custa 1 ação.</p><div class="slots-equipamento">'+slots+'</div><h3>Inventário</h3><div class="grade-inventario">'+celulas+'</div><div class="carga-inventario"><div><span style="width:'+percentual+'%"></span></div><strong>'+peso.toLocaleString('pt-BR',{maximumFractionDigits:2})+' / '+inv.capacidadeCargaKg.toLocaleString('pt-BR')+' kg</strong></div>'+(podeEditar?'':'<p class="muted">Inventário disponível somente para consulta.</p>')+'</section>';
}
const habilidadeIcone=o=>'<button type="button" class="icone-habilidade '+(o.preparada?'preparada ':'')+(o.ativa?'ativa ':'')+(o.indisponivel?'indisponivel':'')+'" data-habilidade-id="'+esc(o.id??'')+'" data-habilidade-tipo="'+esc(o.tipoLivro??'opcao')+'" data-info="'+esc(o.info??o.descricao??o.nome)+'"><b>'+esc((o.nome??'?').slice(0,2).toUpperCase())+'</b><span>'+esc(o.nome??'')+'</span></button>';
function livroHabilidades(a,pagina='classe',podeEditar=false){
  const f=a.ficha,prep=f.preparacao??{vagas:0,preparadas:[],semprePreparadas:[]},preparadas=new Set(prep.preparadas),sempre=new Set(prep.semprePreparadas);
  const opcoes=opcoesCalculadas(a);
  const classeNome=f.classes.map(c=>c.nome??c.id.replace(/(^|-)(\w)/g,(_,s,l)=>(s?' ':'')+l.toUpperCase())).join(' / ');
  const comInfo=o=>({...o,info:o.tipoLivro==='passiva'?(o.nome+'\n'+(o.descricao??'')):detalhes(o,f)});
  const magiasBase=opcoes.filter(o=>o.categoria==='magia'&&!o.varianteDe),reacoes=opcoes.filter(o=>o.custo?.some(c=>c.tipo==='reacao')&&opcaoPreparada(f,o));
  const grade=(titulo,ops,extra='')=>ops.length?'<section class="secao-habilidades"><header><h3>'+titulo+'</h3>'+extra+'</header><div>'+ops.map(comInfo).map(habilidadeIcone).join('')+'</div></section>':'';
  const comum=o=>o.categoria!=='magia'&&(/ataque de oportunidade|golpe desarmado|soco|torrente de golpes|agarrar|imobilizar|derrubar|empurrar|disparada|correr|desengajar|esquivar|ajudar|esconder|analisar|usar objeto|procurar|preparar \| ação|estudar|influenciar|utilizar|usar magia/i.test(o.nome)||o.geradaPorItem||o.automacao?.tipo==='ataque'&&!o.origem);
  let corpo='';
  if(pagina==='reacoes')corpo=grade('Reações disponíveis',reacoes.map(o=>({...o,ativa:o.ativa!==false,indisponivel:o.ativa===false})));
  else if(pagina==='comum'){
    const comuns=opcoes.filter(o=>comum(o)&&!o.custo?.some(c=>c.tipo==='reacao'));
    corpo=grade('Truques',magiasBase.filter(o=>(o.circuloBase??0)===0))+grade('Ações de arma',comuns.filter(o=>o.automacao?.tipo==='ataque').map(o=>({...o,indisponivel:!opcaoDisponivel(a,o)})))+grade('Ações comuns',comuns.filter(o=>o.automacao?.tipo!=='ataque'))+grade('Passivas',(f.passivas??[]).map(o=>({...o,tipoLivro:'passiva',ativa:o.ativa!==false,indisponivel:o.ativa===false})));
  }else{
    const magias=magiasBase.filter(o=>!o.custo?.some(c=>c.tipo==='reacao'));
    const acoes=opcoes.filter(o=>o.categoria!=='magia'&&!comum(o)&&!o.custo?.some(c=>c.tipo==='reacao'));
    corpo=grade('Ações de classe',acoes)+grade('Truques',magias.filter(o=>(o.circuloBase??0)===0))+grade('Magias sempre preparadas',magias.filter(o=>(o.circuloBase??0)>0&&sempre.has(o.id)).map(o=>({...o,preparada:true})))+grade('Magias preparadas',magias.filter(o=>preparadas.has(o.id)).map(o=>({...o,preparada:true})),'<small>'+preparadas.size+'/'+prep.vagas+'</small>');
    const circulos=[...new Set(magias.map(o=>o.circuloBase??0).filter(Boolean))].sort((x,y)=>y-x);
    corpo+=circulos.map(n=>grade(n+'º círculo',magias.filter(o=>(o.circuloBase??0)===n).map(o=>({...o,preparada:preparadas.has(o.id)||sempre.has(o.id),indisponivel:!preparadas.has(o.id)&&!sempre.has(o.id)})))).join('')+grade('Habilidades de classe passivas',(f.passivas??[]).map(o=>({...o,tipoLivro:'passiva',ativa:o.ativa!==false,indisponivel:o.ativa===false})));
  }
  const nomes={classe:classeNome,comum:'Comum',reacoes:'Reações'};
  return '<section class="livro-habilidades"><header><div><small>LIVRO DE HABILIDADES</small><h2>'+esc(nomes[pagina])+'</h2></div><nav>'+['classe','comum','reacoes'].map(id=>'<button type="button" data-livro-aba="'+id+'" aria-pressed="'+(pagina===id)+'">'+esc(nomes[id])+'</button>').join('')+'</nav></header><p class="muted">'+(podeEditar?'Clique com o botão direito para preparar magias ou ativar e desativar passivas e reações.':'Livro disponível somente para consulta.')+'</p>'+corpo+'</section>';
}
export function fichaEditavel(a,podeEditar,pagina='personagem',paginaLivro='classe'){
  const f=a.ficha,bloqueado=podeEditar?'':'disabled',nivel=f.classes.reduce((n,c)=>n+c.nivel,0);
  const bonusTotal=campo=>bonusEfeito(a,campo)+bonusEquipamento(a,campo)+bonusPassiva(a,campo),bonusCA=bonusTotal('ca'),bonusPV=bonusTotal('pvMaximos'),bonusMov=bonusTotal('deslocamentoM');
  const classes=f.classes.map((c,i)=>'<div class="linha-classe">'+campo('Classe','classe-id-'+i,c.nome??c.id,'text','data-classe="'+i+'"',bloqueado)+campo('Nível','classe-nivel-'+i,c.nivel,'number','min="1" max="10" data-nivel="'+i+'"',bloqueado)+'</div>').join('');
  const atributos=Object.entries(f.atributos).map(([k,n])=>{const b=Math.floor((n-10)/2);return '<label class="atributo-editavel"><span>'+esc(k.toUpperCase())+'</span><b>'+(b>=0?'+':'')+b+'</b><input name="atributo-'+esc(k)+'" type="number" min="1" max="30" value="'+n+'" '+bloqueado+'></label>';}).join('');
  const salvas=Object.keys(f.atributos).map(k=>campo(k.toUpperCase(),'salva-'+k,f.salvaguardas?.[k]??Math.floor((f.atributos[k]-10)/2),'number','min="-30" max="50"',bloqueado)).join('');
  const pericias=Object.entries({Acrobacia:'des','Lidar com Animais':'sab',Arcanismo:'int',Atletismo:'for','Atuação':'car','Enganação':'car',Furtividade:'des','História':'int','Intimidação':'car','Intuição':'sab','Investigação':'int',Medicina:'sab',Natureza:'int','Percepção':'sab','Persuasão':'car','Prestidigitação':'des','Religião':'int','Sobrevivência':'sab'}).map(([k,at])=>campo(k,'pericia-'+k,f.pericias?.[k]??Math.floor((f.atributos[at]-10)/2),'number','min="-30" max="50"',bloqueado)).join('');
  const recursos=(f.recursos??[]).map(r=>'<div class="recurso-editavel" data-recurso="'+esc(r.id)+'"><label><span>'+esc(r.nome)+'</span><input name="recurso-nome" value="'+esc(r.nome)+'" '+bloqueado+'></label><label>Atual<input name="recurso-atual" type="number" min="0" max="9999" value="'+esc(a.rec?.[r.id]??r.saldoInicial)+'" '+bloqueado+'></label><label>Máximo<input name="recurso-max" type="number" min="0" max="9999" value="'+r.maximo+'" '+bloqueado+'></label></div>').join('')||'<p class="muted">Esta ficha não possui recursos com saldo.</p>';
  const baseBonus=(classe,rotuloBase,nomeBase,valorBase,extraBase,rotuloBonus,valorBonus,sufixo='')=>'<div class="valor-com-bonus '+classe+'">'+campo(rotuloBase,nomeBase,valorBase,'number',extraBase,bloqueado)+campo(rotuloBonus,nomeBase+'-bonus',(valorBonus>=0?'+':'')+valorBonus+sufixo,'text','','disabled')+'</div>';
  const conteudoFicha=
    '<section class="cabecalho-dnd"><div class="marca-dnd">D&amp;D</div><div class="identificacao-ficha">'+campo('Nome do personagem','nome',f.nome,'text','required maxlength="100"',bloqueado)+'<div class="classes-ficha">'+classes+'</div></div><div class="identificacao-menor">'+campo('Espécie','especie',f.especie??'','text','',bloqueado)+campo('Bônus de proficiência','proficiencia',f.proficiencia??(2+Math.floor((nivel-1)/4)),'number','min="0" max="10"',bloqueado)+'</div></section>'+
    '<section class="atributos-editaveis">'+atributos+'</section>'+
    '<section class="combate-ficha"><h3>Combate <small>Totais: '+pvMaximosAtuais(a)+' PV · CA '+caAtual(a)+' · '+deslocamentoMaximo(a)+' m</small></h3><div class="valores-combate">'+campo('PV atual','pv-atual',a.pv,'number','min="0" max="9999"',bloqueado)+baseBonus('pv-total','PV máximo · base','pv-max',f.pvMaximos,'min="1" max="9999"','Bônus',bonusPV)+baseBonus('ca-total','CA · base','ca',f.caBase,'min="0" max="99"','Bônus',bonusCA)+baseBonus('mov-total','Deslocamento · base','deslocamento',f.deslocamentosM.andar,'min="0" max="999" step="0.5"','Bônus',bonusMov,' m')+'</div></section>'+efeitosFicha(a)+
    '<div class="corpo-ficha"><section><h3>Salvaguardas</h3><div class="campos-ficha salvas-editaveis">'+salvas+'</div><h3>Perícias</h3><div class="campos-ficha pericias-editaveis">'+pericias+'</div></section><section><h3>Recursos</h3><div class="recursos-editaveis">'+recursos+'</div><h3>Características</h3><div class="campos-ficha texto-ficha">'+campo('Sentidos','sentidos',f.sentidos??'','text','',bloqueado)+campo('Idiomas','idiomas',f.idiomas??'','text','',bloqueado)+'<label>Anotações livres<textarea name="anotacoes" rows="6" '+bloqueado+'>'+esc(f.anotacoes??'')+'</textarea></label></div></section></div>'+
    '<details class="editor-avancado"><summary>Editor avançado · ações, magias, equipamentos e passivas</summary><p class="muted">Use quando precisar alterar campos que ainda não possuem uma caixa própria. O formato JSON completo continua compatível com a importação.</p><textarea id="fichaJson" rows="18" spellcheck="false" '+bloqueado+'>'+esc(JSON.stringify(f,null,2))+'</textarea></details>';
  const abas=[['personagem','Ficha de personagem'],['inventario','Inventário'],['habilidades','Livro de Habilidades']];
  return '<form id="formFicha" class="ficha-dnd" data-nivel="'+nivel+'"><div class="barra-salvar"><div><strong>'+esc(abas.find(x=>x[0]===pagina)?.[1]??abas[0][1])+'</strong><small>'+(podeEditar?'Você pode alterar esta ficha.':'Somente o mestre ou o dono pode editar.')+'</small></div><nav class="abas-ficha">'+abas.map(([id,nome])=>'<button type="button" data-ficha-aba="'+id+'" aria-pressed="'+(pagina===id)+'">'+nome+'</button>').join('')+'</nav><button type="submit" class="primario" '+bloqueado+'>Salvar alterações</button></div><div class="conteudo-pagina-ficha" '+(pagina==='personagem'?'':'hidden')+'>'+conteudoFicha+'</div><div class="conteudo-pagina-ficha" '+(pagina==='inventario'?'':'hidden')+'>'+inventarioFicha(a,podeEditar)+'</div><div class="conteudo-pagina-ficha" '+(pagina==='habilidades'?'':'hidden')+'>'+livroHabilidades(a,paginaLivro,podeEditar)+'</div></form>';
}
export function efeitosFicha(a){
  const lista=[...(a.efeitosAtivos??[])];if(a.concentracaoAtiva)lista.unshift({nome:a.concentracaoAtiva.nome,tipo:'concentracao',descricao:'Concentração ativa'});
  if(!lista.length)return '<section class="efeitos-ficha"><h3>Buffs, condições e concentração</h3><p class="muted">Nenhum efeito ativo.</p></section>';
  const resumo=e=>{const m=e.modificadores??{},mods=Object.entries(m).map(([k,v])=>({ca:'CA',pvMaximos:'PV máximo',deslocamentoM:'deslocamento'}[k]??k)+' '+(v>=0?'+':'')+v),restante=e.duracao?.restante??e.turnos;return [e.descricao,...mods,restante!=null?restante+' turno(s)':e.removeEm==='descanso_longo'?'Até o descanso longo':e.removeEm==='descanso_curto'?'Até o descanso curto':e.tipo==='concentracao'?'Termina ao perder ou encerrar a concentração':'Duração especial'].filter(Boolean).join(' · ');};
  return '<section class="efeitos-ficha"><h3>Buffs, condições e concentração</h3><div>'+lista.map(e=>'<article class="efeito '+esc(e.tipo??'efeito')+'" title="'+esc(resumo(e))+'"><b>'+(e.tipo==='condicao'?'⚠':e.tipo==='concentracao'?'◉':'✦')+'</b><span><strong>'+esc(e.nome)+'</strong><small>'+esc(resumo(e))+'</small></span></article>').join('')+'</div></section>';
}
export function biblioteca(a){
  const f=a.ficha,opcoes=opcoesCalculadas(a),grupos=[
    ['Ações',opcoes.filter(o=>o.categoria!=='magia'&&!o.custo?.some(c=>c.tipo==='reacao'))],
    ['Magias',opcoes.filter(o=>o.categoria==='magia').sort((a,b)=>(b.circuloBase??0)-(a.circuloBase??0))],
    ['Reações',opcoes.filter(o=>o.custo?.some(c=>c.tipo==='reacao'))],
    ['Equipamentos',(f.inventario?.itens??f.equipamentos??[]).map(e=>({nome:e.nome??e.name,descricao:e.descricao??e.description}))],
    ['Passivas e notas',[...(f.passivas??[]),...(f.notas??[])]]
  ];

  const prep=f.preparacao;
  const nomes=ids=>ids.map(id=>f.opcoes.find(o=>o.id===id)?.nome??id).join('\n');
  const preparadas=prep?'<details class="preparadas"><summary>Preparadas · '+prep.preparadas.length+'/'+prep.vagas+'</summary><p>'+esc(nomes(prep.preparadas))+'</p><strong>Sempre preparadas</strong><p>'+esc(nomes(prep.semprePreparadas))+'</p></details>':'';
  return preparadas+'<div class="biblioteca">'+grupos.filter(([,ops])=>ops.length).map(([titulo,ops])=>'<section><h3>'+titulo+'</h3>'+ops.map(o=>'<details><summary>'+esc(o.nome)+'</summary><p>'+esc(detalhes(o,f).split('\n').slice(1).join('\n'))+'</p></details>').join('')+'</section>').join('')+'</div>';
}
