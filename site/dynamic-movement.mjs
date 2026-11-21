import {centroAlvo,raioAlvo} from './target-geometry.mjs?v=0.8.76';
import {terrenoDificilDasZonas} from './zonas.mjs?v=0.8.76';
const EPS=1e-8,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Projeção sobre a interseção dos discos de alcance. Não procura desvios.
export function pontoMaisProximo(origem,discos){
 const cabe=p=>discos.every(d=>dist(p,d)<=d.raio+EPS);
 if(cabe(origem))return {x:origem.x,y:origem.y};
 const candidatos=[];
 for(const d of discos){const n=dist(origem,d);candidatos.push(n?{x:d.x+(origem.x-d.x)*d.raio/n,y:d.y+(origem.y-d.y)*d.raio/n}:{x:d.x,y:d.y});}
 for(let i=0;i<discos.length;i++)for(let j=i+1;j<discos.length;j++){
  const a=discos[i],b=discos[j],n=dist(a,b);if(n<=EPS||n>a.raio+b.raio+EPS||n<Math.abs(a.raio-b.raio)-EPS)continue;
  const k=(a.raio*a.raio-b.raio*b.raio+n*n)/(2*n),h=Math.sqrt(Math.max(0,a.raio*a.raio-k*k)),x=a.x+(b.x-a.x)*k/n,y=a.y+(b.y-a.y)*k/n;
  for(const s of [-1,1])candidatos.push({x:x-s*(b.y-a.y)*h/n,y:y+s*(b.x-a.x)*h/n});
 }
 return candidatos.filter(cabe).sort((a,b)=>dist(origem,a)-dist(origem,b))[0]??null;
}
export const custoTrajeto=(s,a,destino)=>dist(a,destino)+terrenoDificilDasZonas(s.zonas,a,destino,a);
export function planejarMovimentoDinamico(s,a,c,o,{levantar=0}={}){
 const falha=motivo=>({possivel:false,motivo});let destino;
 if(c.tipo==='mover')destino={x:c.x,y:c.y};
 else{
  const discos=[],rule=o?.automacao;
  const adicionar=(id,r)=>{if(id===a.id)return;const alvo=s.atores.find(x=>x.id===id);if(!alvo||!Number.isFinite(r))throw Error('Alvo ou alcance indisponível.');discos.push({...centroAlvo(alvo),raio:Math.min(18,r)+raioAlvo(alvo)});};
  try{
   if(c.composicao?.length)for(const [i,entrada] of c.composicao.entries()){const m=o?.composicao?.modos.find(x=>x.id===entrada.modoId),anterior=o?.composicao?.modos.find(x=>x.id===c.composicao[i-1]?.modoId);adicionar(entrada.alvoId,m?.automacao?.alcanceM??(m?.destruidorDeHordas?anterior?.automacao?.alcanceM:undefined)??rule?.alcanceM);}
   else if(c.alvos?.length)for(const id of c.alvos)adicionar(id,rule?.alcanceM);
   else if(c.alvo)adicionar(c.alvo,rule?.alcanceM);
   else if(c.ponto)discos.push({...c.ponto,raio:Math.min(18,rule?.alcanceM??0)});
  }catch(e){return falha(e.message);}
  destino=pontoMaisProximo(a,discos);if(!destino)return falha('Nenhuma posição permite executar a seleção inteira.');
 }
 if(!destino||![destino.x,destino.y].every(Number.isFinite))return falha('Destino inválido.');
 const distancia=dist(a,destino),custo=distancia>EPS?custoTrajeto(s,a,destino)+levantar:0;
 if(custo>(a.metros??0)+EPS)return {...falha('Deslocamento insuficiente: precisa de '+Number(custo.toFixed(2))+' m.'),destino,custo,distancia};
 return {possivel:true,destino,custo,distancia};
}
