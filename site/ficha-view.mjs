import {bonusEfeito,caAtual,pvMaximosAtuais,deslocamentoMaximo} from './engine.mjs';
export const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function detalhes(o,f){
  const r=o.automacao??{},s=o.selecao;
  const custos=(o.custo??[]).map(c=>c.quantidade+' '+(c.tipo==='recurso'?f.recursos?.find(x=>x.id===c.id)?.nome??c.id:({acao:'ação',bonus:'ação bônus',reacao:'reação'})[c.tipo]));
  const modificadores=r.efeito?.modificadores??{},bonus=Object.entries(modificadores).map(([k,v])=>({ca:'CA',pvMaximos:'PV máximo',deslocamentoM:'deslocamento'}[k]??k)+' '+(v>=0?'+':'')+v).join(' · ');
  const linhas=[o.nome,o.descricao,custos.length?'Custo: '+custos.join(' + '):'',r.alcanceM!=null?'Alcance: '+r.alcanceM+' m':'',r.dano?'Dano: '+r.dano+' '+(r.elemento??''):'',r.cd?'Salvaguarda: '+r.atributo.toUpperCase()+' · CD '+r.cd:'',r.bonus!=null?'Ataque: '+(r.bonus>=0?'+':'')+r.bonus:'',r.efeito?'Efeito: '+r.efeito.nome+(bonus?' · '+bonus:''):'',s?.max>1?'Seleção: '+s.min+' a '+s.max+(s.repetirAlvo?' · permite repetir':' · alvos distintos'):'','Uso: dentro ou fora de combate nesta versão',o.origem?'Origem: '+o.origem:''];
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
export function fichaEditavel(a,podeEditar){
  const f=a.ficha,bloqueado=podeEditar?'':'disabled',nivel=f.classes.reduce((n,c)=>n+c.nivel,0);
  const bonusCA=bonusEfeito(a,'ca'),bonusPV=bonusEfeito(a,'pvMaximos'),bonusMov=bonusEfeito(a,'deslocamentoM');
  const classes=f.classes.map((c,i)=>'<div class="linha-classe">'+campo('Classe','classe-id-'+i,c.nome??c.id,'text','data-classe="'+i+'"',bloqueado)+campo('Nível','classe-nivel-'+i,c.nivel,'number','min="1" max="10" data-nivel="'+i+'"',bloqueado)+'</div>').join('');
  const atributos=Object.entries(f.atributos).map(([k,n])=>{const b=Math.floor((n-10)/2);return '<label class="atributo-editavel"><span>'+esc(k.toUpperCase())+'</span><b>'+(b>=0?'+':'')+b+'</b><input name="atributo-'+esc(k)+'" type="number" min="1" max="30" value="'+n+'" '+bloqueado+'></label>';}).join('');
  const salvas=Object.keys(f.atributos).map(k=>campo(k.toUpperCase(),'salva-'+k,f.salvaguardas?.[k]??Math.floor((f.atributos[k]-10)/2),'number','min="-30" max="50"',bloqueado)).join('');
  const pericias=Object.entries({Acrobacia:'des','Adestrar Animais':'sab',Arcanismo:'int',Atletismo:'for','Atuação':'car','Enganação':'car',Furtividade:'des','História':'int','Intimidação':'car','Intuição':'sab','Investigação':'int',Medicina:'sab',Natureza:'int','Percepção':'sab','Persuasão':'car','Prestidigitação':'des','Religião':'int','Sobrevivência':'sab'}).map(([k,at])=>campo(k,'pericia-'+k,f.pericias?.[k]??Math.floor((f.atributos[at]-10)/2),'number','min="-30" max="50"',bloqueado)).join('');
  const recursos=(f.recursos??[]).map(r=>'<div class="recurso-editavel" data-recurso="'+esc(r.id)+'"><label><span>'+esc(r.nome)+'</span><input name="recurso-nome" value="'+esc(r.nome)+'" '+bloqueado+'></label><label>Atual<input name="recurso-atual" type="number" min="0" max="9999" value="'+esc(a.rec?.[r.id]??r.saldoInicial)+'" '+bloqueado+'></label><label>Máximo<input name="recurso-max" type="number" min="0" max="9999" value="'+r.maximo+'" '+bloqueado+'></label></div>').join('')||'<p class="muted">Esta ficha não possui recursos com saldo.</p>';
  const baseBonus=(classe,rotuloBase,nomeBase,valorBase,extraBase,rotuloBonus,valorBonus,sufixo='')=>'<div class="valor-com-bonus '+classe+'">'+campo(rotuloBase,nomeBase,valorBase,'number',extraBase,bloqueado)+campo(rotuloBonus,nomeBase+'-bonus',(valorBonus>=0?'+':'')+valorBonus+sufixo,'text','','disabled')+'</div>';
  return '<form id="formFicha" class="ficha-dnd" data-nivel="'+nivel+'"><div class="barra-salvar"><div><strong>Ficha de personagem</strong><small>'+(podeEditar?'Você pode alterar esta ficha.':'Somente o mestre ou o dono pode editar.')+'</small></div><button type="submit" class="primario" '+bloqueado+'>Salvar alterações</button></div>'+
    '<section class="cabecalho-dnd"><div class="marca-dnd">D&amp;D</div><div class="identificacao-ficha">'+campo('Nome do personagem','nome',f.nome,'text','required maxlength="100"',bloqueado)+'<div class="classes-ficha">'+classes+'</div></div><div class="identificacao-menor">'+campo('Espécie','especie',f.especie??'','text','',bloqueado)+campo('Bônus de proficiência','proficiencia',f.proficiencia??(2+Math.floor((nivel-1)/4)),'number','min="0" max="10"',bloqueado)+'</div></section>'+
    '<section class="atributos-editaveis">'+atributos+'</section>'+
    '<section class="combate-ficha"><h3>Combate <small>Totais: '+pvMaximosAtuais(a)+' PV · CA '+caAtual(a)+' · '+deslocamentoMaximo(a)+' m</small></h3><div class="valores-combate">'+campo('PV atual','pv-atual',a.pv,'number','min="0" max="9999"',bloqueado)+baseBonus('pv-total','PV máximo · base','pv-max',f.pvMaximos,'min="1" max="9999"','Bônus',bonusPV)+baseBonus('ca-total','CA · base','ca',f.caBase,'min="0" max="99"','Bônus',bonusCA)+baseBonus('mov-total','Deslocamento · base','deslocamento',f.deslocamentosM.andar,'min="0" max="999" step="0.5"','Bônus',bonusMov,' m')+'</div></section>'+efeitosFicha(a)+
    '<div class="corpo-ficha"><section><h3>Salvaguardas</h3><div class="campos-ficha salvas-editaveis">'+salvas+'</div><h3>Perícias</h3><div class="campos-ficha pericias-editaveis">'+pericias+'</div></section><section><h3>Recursos</h3><div class="recursos-editaveis">'+recursos+'</div><h3>Características</h3><div class="campos-ficha texto-ficha">'+campo('Sentidos','sentidos',f.sentidos??'','text','',bloqueado)+campo('Idiomas','idiomas',f.idiomas??'','text','',bloqueado)+'<label>Anotações livres<textarea name="anotacoes" rows="6" '+bloqueado+'>'+esc(f.anotacoes??'')+'</textarea></label></div></section></div>'+
    '<details class="editor-avancado"><summary>Editor avançado · ações, magias, equipamentos e passivas</summary><p class="muted">Use quando precisar alterar campos que ainda não possuem uma caixa própria. O formato JSON completo continua compatível com a importação.</p><textarea id="fichaJson" rows="18" spellcheck="false" '+bloqueado+'>'+esc(JSON.stringify(f,null,2))+'</textarea></details></form>';
}
export function efeitosFicha(a){
  const lista=a.efeitosAtivos??[];if(!lista.length)return '<section class="efeitos-ficha"><h3>Buffs e condições ativas</h3><p class="muted">Nenhum efeito ativo.</p></section>';
  const resumo=e=>{const m=e.modificadores??{},mods=Object.entries(m).map(([k,v])=>({ca:'CA',pvMaximos:'PV máximo',deslocamentoM:'deslocamento'}[k]??k)+' '+(v>=0?'+':'')+v);return [e.descricao,...mods,e.turnos!=null?e.turnos+' turno(s)':e.removeEm==='descanso_longo'?'Até o descanso longo':e.removeEm==='descanso_curto'?'Até o descanso curto':'Duração especial'].filter(Boolean).join(' · ');};
  return '<section class="efeitos-ficha"><h3>Buffs e condições ativas</h3><div>'+lista.map(e=>'<article class="efeito '+esc(e.tipo??'efeito')+'" title="'+esc(resumo(e))+'"><b>'+(e.tipo==='condicao'?'⚠':'✦')+'</b><span><strong>'+esc(e.nome)+'</strong><small>'+esc(resumo(e))+'</small></span></article>').join('')+'</div></section>';
}
export function biblioteca(a){
  const f=a.ficha,grupos=[
    ['Ações',f.opcoes.filter(o=>o.categoria!=='magia'&&!o.custo?.some(c=>c.tipo==='reacao'))],
    ['Magias',f.opcoes.filter(o=>o.categoria==='magia').sort((a,b)=>(b.circuloBase??0)-(a.circuloBase??0))],
    ['Reações',f.opcoes.filter(o=>o.custo?.some(c=>c.tipo==='reacao'))],
    ['Equipamentos',(f.equipamentos??[]).map(e=>({nome:e.nome??e.name,descricao:e.descricao??e.description}))],
    ['Passivas e notas',[...(f.passivas??[]),...(f.notas??[])]]
  ];

  const prep=f.preparacao;
  const nomes=ids=>ids.map(id=>f.opcoes.find(o=>o.id===id)?.nome??id).join('\n');
  const preparadas=prep?'<details class="preparadas"><summary>Preparadas · '+prep.preparadas.length+'/'+prep.vagas+'</summary><p>'+esc(nomes(prep.preparadas))+'</p><strong>Sempre preparadas</strong><p>'+esc(nomes(prep.semprePreparadas))+'</p></details>':'';
  return preparadas+'<div class="biblioteca">'+grupos.filter(([,ops])=>ops.length).map(([titulo,ops])=>'<section><h3>'+titulo+'</h3>'+ops.map(o=>'<details><summary>'+esc(o.nome)+'</summary><p>'+esc(detalhes(o,f).split('\n').slice(1).join('\n'))+'</p></details>').join('')+'</section>').join('')+'</div>';
}
