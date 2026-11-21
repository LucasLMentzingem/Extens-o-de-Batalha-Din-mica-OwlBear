// Os medidores pertencem ao documento de Atividades, nunca à camada de
// popovers do Owlbear. O iframe externo já limita a área de entrada visível.
export function criarMedidoresHud({document,canal,sessaoHud,url}){
  const frames=new Map();
  function atualizar(medidas={}){
    for(const parte of ['barra','ordem']){
      const medida=medidas[parte];let frame=frames.get(parte);
      if(!medida){frame?.remove();frames.delete(parte);continue;}
      if(!frame||frame.dataset.documentoHud!==medida.documentoHud){
        frame?.remove();frame=document.createElement('iframe');
        frame.dataset.medidorHud=parte;frame.dataset.documentoHud=medida.documentoHud;
        frame.title='Medição interna da HUD';frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');
        frame.style.cssText='position:fixed;left:0;top:0;border:0;visibility:hidden;pointer-events:none;';
        const pagina=new URL(url);pagina.search='';
        pagina.searchParams.set('v',new URL(url).searchParams.get('v'));
        pagina.searchParams.set('parte',parte);pagina.searchParams.set('medicaoInterna','1');
        pagina.searchParams.set('canalHud',canal);pagina.searchParams.set('sessaoHud',sessaoHud);
        pagina.searchParams.set('documentoHud',medida.documentoHud);frame.src=pagina.href;
        frames.set(parte,frame);document.body.append(frame);
      }
      frame.style.width=medida.largura+'px';frame.style.height=Math.max(102,medida.altura)+'px';
    }
  }
  function fechar(){for(const f of frames.values())f.remove();frames.clear();}
  return {atualizar,fechar};
}
