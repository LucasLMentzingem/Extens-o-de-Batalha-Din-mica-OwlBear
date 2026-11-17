const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const elementoValido=new Set(['neutro','perfurante','cortante','contundente','necrotico','raio','frio','fogo']);

export function classeVisualItem(item={}){
  const raridade=String(item.raridade??'comum').toLowerCase();
  const raridadeValida=['comum','incomum','raro'].includes(raridade)?raridade:'comum';
  let elemento=String(item.iconeElemento??item.danoExtraAoAcertar?.elemento??item.modelosAcoes?.find(x=>x.tipoDano)?.tipoDano??'neutro').toLowerCase();
  if(elemento==='necrótico')elemento='necrotico';
  if(elemento==='gelo')elemento='frio';
  if(elemento==='relampago'||elemento==='relâmpago')elemento='raio';
  if(!elementoValido.has(elemento))elemento='neutro';
  return {elemento,raridade:raridadeValida};
}

export function arteItem(item={},classe=''){
  const nome=String(item.nome??'Item');
  const {elemento,raridade}=classeVisualItem(item);
  const src=item.icone;
  if(!src)return '<span class="item-arte item-arte-vazio '+esc(classe)+'" aria-label="'+esc(nome)+'"><b>'+esc(nome.slice(0,2).toUpperCase())+'</b></span>';
  const moldura='assets/itens/molduras/'+elemento+'-'+raridade+'.svg';
  return '<span class="item-arte '+esc(classe)+' '+elemento+' '+raridade+'" role="img" aria-label="'+esc(nome)+'">'+
    '<img class="item-arte-moldura" src="'+moldura+'" alt="" draggable="false">'+
    '<img class="item-arte-recorte" src="'+esc(src)+'" alt="" draggable="false">'+
    '</span>';
}

export function criarExameItem(doc=document){
  let dialog=doc.getElementById('examinarItem');
  if(!dialog){
    dialog=doc.createElement('dialog');dialog.id='examinarItem';dialog.className='examinar-item-dialog';
    dialog.innerHTML='<header><h2></h2><button type="button" data-examinar-fechar aria-label="Fechar exame do item">×</button></header><div class="examinar-item-arte"></div>';
    doc.body.append(dialog);
  }
  dialog.querySelector('[data-examinar-fechar]').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  return {abrir(item){dialog.querySelector('h2').textContent=item?.nome??'Item';dialog.querySelector('.examinar-item-arte').innerHTML=arteItem(item,'item-arte-exame');if(!dialog.open)dialog.showModal();},fechar(){dialog.close();}};
}
