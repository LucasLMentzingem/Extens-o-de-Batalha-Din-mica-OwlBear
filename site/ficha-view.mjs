export const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function detalhes(o,f){
  const r=o.automacao??{},s=o.selecao;
  const custos=(o.custo??[]).map(c=>c.quantidade+' '+(c.tipo==='recurso'?f.recursos?.find(x=>x.id===c.id)?.nome??c.id:({acao:'ação',bonus:'ação bônus',reacao:'reação'})[c.tipo]));
  const linhas=[o.nome,o.descricao,custos.length?'Custo: '+custos.join(' + '):'',r.alcanceM!=null?'Alcance: '+r.alcanceM+' m':'',r.dano?'Dano: '+r.dano+' '+(r.elemento??''):'',r.cd?'Salvaguarda: '+r.atributo.toUpperCase()+' · CD '+r.cd:'',r.bonus!=null?'Ataque: '+(r.bonus>=0?'+':'')+r.bonus:'',s?.max>1?'Seleção: '+s.min+' a '+s.max+(s.repetirAlvo?' · permite repetir':' · alvos distintos'):'',o.origem?'Origem: '+o.origem:''];
  return linhas.filter(Boolean).join('\n');
}
export function cabecalhoFicha(a){
  const f=a.ficha;
  const classe=f.classes.map(c=>c.nome??c.id).join(' / ');
  const nivel=f.classes.reduce((t,c)=>t+c.nivel,0);
  return '<div class="identidade"><div class="selo">'+(f.id==='soldado'?'<img src="fichas/soldado.png" alt="">':esc(a.nome[0]))+'</div><div><h2>'+esc(a.nome)+'</h2><small>'+esc(classe)+' · Nível '+nivel+'</small></div></div>'+
    '<div class="atributos">'+Object.entries(f.atributos).map(([k,n])=>{const b=Math.floor((n-10)/2);return '<button type="button" class="atributo" data-save="'+esc(k)+'" title="Clique com o botão direito para rolar a salvaguarda"><small>'+esc(k.toUpperCase())+'</small><strong>'+(b>=0?'+':'')+b+'</strong><span>'+n+'</span></button>';}).join('')+'</div>';
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
