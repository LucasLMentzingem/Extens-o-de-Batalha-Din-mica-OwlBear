// Só HTML/geometria local, nunca janelas invisíveis sobre o mapa. Uma revisão
// ou configuração diferente exige medir de novo, inclusive saldos e filtros.
const chave=c=>JSON.stringify([c.atorId,c.linhas,c.compacto,c.largura,c.alturaMax,c.rev,c.nomes,c.estadoLocal,c.contexto]);
export class CacheLayoutRodape{
  constructor(limite=16,maxBytes=2*1024*1024){this.limite=limite;this.maxBytes=maxBytes;this.entradas=new Map();this.bytes=0;}
  guardar(g,alturaMax,contexto){
    const id=chave({...g,alturaMax,contexto}),bytes=JSON.stringify(g).length*2;
    this.remover(id);if(bytes>this.maxBytes)return;
    this.entradas.set(id,{g,bytes});this.bytes+=bytes;
    while(this.entradas.size>this.limite||this.bytes>this.maxBytes)this.remover(this.entradas.keys().next().value);
  }
  remover(id){this.bytes-=this.entradas.get(id)?.bytes??0;this.entradas.delete(id);}
  obter(config){return this.entradas.get(chave(config))?.g;}
  limpar(){this.entradas.clear();this.bytes=0;}
}
