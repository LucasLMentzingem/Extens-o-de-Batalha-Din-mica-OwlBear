// Atualiza os nós existentes: mudar um saldo não recria as imagens da barra.
const chave=no=>no.nodeType===1?(no.hasAttribute('data-cmd')?['cmd',no.tagName,...['cmd','id','pagina','modoCusto','grupo','chave','indice','index','circulo'].map(k=>no.dataset[k]??'')].join('|'):no.id?'id|'+no.id:null):null;
const compativel=(a,b)=>a.nodeType===b.nodeType&&(a.nodeType!==1||a.tagName===b.tagName&&chave(a)===chave(b));
function atributos(alvo,novo){
  for(const a of [...alvo.attributes])if(!novo.hasAttribute(a.name))alvo.removeAttribute(a.name);
  for(const a of novo.attributes)if(alvo.getAttribute(a.name)!==a.value)alvo.setAttribute(a.name,a.value);
}
function filhos(alvo,novo){
  let atual=alvo.firstChild;
  for(const modelo of [...novo.childNodes]){
    const id=chave(modelo);
    if(!atual||!compativel(atual,modelo)){
      let existente=null;
      if(id)for(let candidato=atual;candidato;candidato=candidato.nextSibling)if(chave(candidato)===id&&compativel(candidato,modelo)){existente=candidato;break;}
      if(!existente)existente=modelo.cloneNode(true);
      alvo.insertBefore(existente,atual);atual=existente;
    }
    if(modelo.nodeType===1){atributos(atual,modelo);filhos(atual,modelo);if(atual.tagName==='INPUT')atual.checked=modelo.checked;if(atual.tagName==='SELECT'&&atual.value!==modelo.value)atual.value=modelo.value;}
    else if(atual.nodeValue!==modelo.nodeValue)atual.nodeValue=modelo.nodeValue;
    atual=atual.nextSibling;
  }
  while(atual){const seguinte=atual.nextSibling;atual.remove();atual=seguinte;}
}
export function atualizarHtmlHud(root,html){
  const template=root.ownerDocument.createElement('template');template.innerHTML=html;filhos(root,template.content);
}
