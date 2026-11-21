// Compartilhado pelo renderer completo e pelas janelas leves; sem carregar catálogo.
export function preencherBalaoHabilidade(container,alvo,texto){
  container.replaceChildren();const arte=alvo?.querySelector('.habilidade-arte');
  if(arte){const mini=arte.cloneNode(true);mini.classList.add('habilidade-miniatura','sem-texto');for(const img of mini.querySelectorAll('[data-art-detalhe]'))img.src=img.dataset.artDetalhe;container.append(mini);}
  const corpo=container.ownerDocument.createElement('span');corpo.className='habilidade-explicacao';corpo.textContent=texto??'';container.append(corpo);
}
