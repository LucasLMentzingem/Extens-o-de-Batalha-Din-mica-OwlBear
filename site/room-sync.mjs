// Apenas consultas de estado podem ser reenviadas; ações nunca são repetidas.
// Uma tentativa por vez: reenviar enquanto a anterior ainda espera só multiplicava
// as transmissões da mesa inteira pelo controlador (0.8.45).
export function consultarComReenvio(enviar,{intervalo=2000,limite=30000}={}){
  return new Promise((resolve,reject)=>{
    let terminou=false,emAndamento=false,ultimoErro=null;
    const finalizar=erro=>{if(terminou)return;terminou=true;clearInterval(reenvio);clearTimeout(prazo);erro?reject(erro):resolve();};
    const tentar=()=>{
      if(terminou||emAndamento)return;emAndamento=true;
      Promise.resolve().then(enviar).then(()=>finalizar(),e=>{ultimoErro=e;}).finally(()=>{emAndamento=false;});
    };
    const reenvio=setInterval(tentar,intervalo);
    const prazo=setTimeout(()=>{
      // Mostra o motivo real informado pelo controlador (ex.: cena fechada, outro mestre), quando houver.
      const detalhe=ultimoErro?.message&&!/^(Sem resposta|Aguardando os dados)/.test(ultimoErro.message)?' Último erro do controlador: '+ultimoErro.message:'';
      finalizar(Error('Sem resposta do controlador da sala. Mantenha o mestre conectado com a cena aberta e tente reconectar.'+detalhe));
    },limite);
    tentar();
  });
}

// Divide a vista em partes que cabem no limite de 16 KB do broadcast do Owlbear,
// medindo os bytes reais (UTF-8 e escapes JSON) em vez de um número fixo de caracteres.
// Partes de 2000 caracteres geravam ~130 mensagens por sincronização numa mesa típica.
export function fatiarParaBroadcast(texto,maxBytes=12000){
  const enc=new TextEncoder(),partes=[];let i=0;
  while(i<texto.length){
    let n=Math.min(texto.length-i,maxBytes);
    while(n>1&&enc.encode(JSON.stringify(texto.slice(i,i+n))).length>maxBytes)n=Math.max(1,Math.floor(n*0.85));
    const c=texto.charCodeAt(i+n-1);if(n>1&&i+n<texto.length&&c>=0xD800&&c<=0xDBFF)n--; // não separa pares surrogate
    partes.push({i,parte:texto.slice(i,i+n)});i+=n;
  }
  return partes;
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
