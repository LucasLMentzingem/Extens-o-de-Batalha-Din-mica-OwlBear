// Apenas consultas de estado podem ser reenviadas; ações nunca são repetidas.
export function consultarComReenvio(enviar,{intervalo=2000,limite=30000}={}){
  return new Promise((resolve,reject)=>{
    let terminou=false;
    const finalizar=erro=>{if(terminou)return;terminou=true;clearInterval(reenvio);clearTimeout(prazo);erro?reject(erro):resolve();};
    const tentar=()=>{Promise.resolve().then(enviar).then(()=>finalizar(),erro=>{if(erro?.controladorRespondeu)finalizar(erro);});};
    const reenvio=setInterval(tentar,intervalo);
    const prazo=setTimeout(()=>finalizar(Error('Sem resposta do controlador da sala. Mantenha o mestre conectado com a cena aberta e tente reconectar.')),limite);
    tentar();
  });
}

// Os pacotes de duas vistas podem chegar intercalados ou fora de ordem.
export function receptorDeEstado(){
  const pacotes=new Map();
  return d=>{
    if(!d||typeof d.seq!=='string'||!Number.isInteger(d.i)||d.i<0||typeof d.parte!=='string')return null;
    if(!pacotes.has(d.seq)){
      if(pacotes.size>=8)pacotes.delete(pacotes.keys().next().value);
      pacotes.set(d.seq,{partes:new Map(),fim:null});
    }
    const p=pacotes.get(d.seq);p.partes.set(d.i,d.parte);
    if(d.final)p.fim=d.i+d.parte.length;
    if(p.fim===null)return null;
    let texto='',i=0;
    while(p.partes.has(i)){const parte=p.partes.get(i);if(!parte.length)return null;texto+=parte;i+=parte.length;}
    if(i!==p.fim)return null;
    pacotes.delete(d.seq);
    return JSON.parse(texto);
  };
}
