import {aplicar,validar,opcoesDisponiveis} from './engine.mjs?v=0.8.62';
import {compactarEstado,compactarFicha} from './catalog.mjs?v=0.8.62';

export const encerrada=e=>['Concluída','Cancelada','Falhou'].includes(e.estado);
const clone=x=>structuredClone(x),igual=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const novoRegistroExecucoes=()=>({formato:1,versao:0,lista:[],bases:{},encerramentos:{},expirouAntes:0});
export class PedidoDeRolagem extends Error{constructor(formula,meta,indice){super('Aguardando rolagem');Object.assign(this,{formula:clone(formula),meta:clone(meta),indice});}}
export function recursosDaExecucao(s,c){
 if(c.tipo==='teste')return ['ator:'+c.ator];
 if(c.tipo!=='usar')return ['mesa'];
 const a=s.atores.find(x=>x.id===c.ator),o=a&&opcoesDisponiveis(a).find(x=>x.id===c.opcao);
 const alvos=[c.ator,c.alvo,...(c.alvos??[]),...(c.composicao??[]).map(x=>x.alvoId)].filter(Boolean);
 const area=o?.automacao?.raioM||o?.automacao?.area||o?.composicao?.modos?.some(x=>x.automacao?.area||x.automacao?.raioM);
 return [...new Set([...(area?s.atores.map(x=>x.id):alvos).map(id=>'ator:'+id),...(s.fase==='preparo'?[]:['turno'])])];
}
export function podeIniciarExecucao(registro,e){
 const ocupadas=registro.lista.filter(x=>x.id!==e.id&&!encerrada(x)&&x.iniciadaEm);
 return !ocupadas.some(x=>x.recursos.includes('mesa')||e.recursos.includes('mesa')||x.recursos.some(r=>e.recursos.includes(r)));
}
export function admitirExecucao(registro,c,u,id,s,{agora=Date.now()}={}){
 const anterior=registro.lista.find(x=>x.id===id)??registro.encerramentos?.[id];
 if(anterior){if(anterior.usuario.id!==u.id||!igual(anterior.intencao,{...c,rev:undefined}))throw Error('Identificador de execução já utilizado por outra intenção.');return anterior;}
 if(registro.expirouAntes&&(!Number.isFinite(c.emitidaEm)||c.emitidaEm<=registro.expirouAntes))throw Error('Esta intenção expirou. Confira o histórico e atualize antes de preparar uma nova ação.');
 if(registro.lista.filter(x=>!encerrada(x)).length>=256)throw Error('Há muitas jogadas pendentes. Encerre algumas antes de enviar outra.');
 const a=s.atores.find(x=>x.id===c.ator);
 if(u.role!=='GM'&&(!a||a.dono!==u.id||(a.ficha.tipo!=='pj'&&!a.invocacao?.controlavel)))throw Error('Você não controla esse personagem.');
 const e={id,atividadeId:c.atividadeId??id,usuario:{id:u.id,name:u.name,role:u.role},atorId:c.ator,intencao:{...clone(c),rev:undefined},comando:clone(c),recursos:recursosDaExecucao(s,c),estado:'Recebida',criadaEm:agora,versao:1,rolagens:[],ids:[],tempos:[]};
 registro.lista.push(e);registro.versao++;return e;
}
export function iniciarExecucao(registro,e,s,{agora=Date.now()}={}){
 if(e.iniciadaEm)return true;
 if(!podeIniciarExecucao(registro,e)){e.estado='Na fila';e.motivo='Aguardando personagem, alvo ou turno de outra execução.';return false;}
 const base=compactarEstado(s);delete base.__execucoes;
 const texto=JSON.stringify(base);let ref=Object.keys(registro.bases).find(id=>JSON.stringify(registro.bases[id])===texto);
 if(!ref){ref=e.id;registro.bases[ref]=base;}
 e.baseRef=ref;e.comando.rev=s.rev;e.iniciadaEm=agora;e.estado='Em andamento';delete e.motivo;e.versao++;registro.versao++;return true;
}
export async function avancarExecucao(registro,e,{executar=aplicar,agora=Date.now,uuid=()=>crypto.randomUUID()}={}){
 if(encerrada(e))return null;
 const salvo=registro.bases[e.baseRef];if(!salvo)throw Error('Base da execução indisponível. Cancele ou restaure o backup.');
 const base=clone(salvo);for(const a of base.atores)a.ficha=validar(a.ficha);
 let id=0,t=0;const faltantes=[],ocorrencias=new Map();
 const contexto={uuid:()=>{const n=id++;return e.ids[n]??(e.ids[n]=uuid());},agora:()=>{const n=t++;return e.tempos[n]??(e.tempos[n]=agora());}};
 // As ramificações independentes alcançam seu próximo pedido antes de pausar.
 // Promessas sem callbacks externos não são persistidas: só os pedidos/diário.
 const trabalho=executar(base,e.comando,e.usuario,async(formula,meta)=>{
  // Ramos paralelos podem avançar em ordens diferentes. A identidade de uma
  // etapa vem do pedido e da ocorrência, não da ordem temporal dos callbacks.
  const assinatura=JSON.stringify([formula,meta.tipo,meta.alvo,meta.atributo,meta.atorRespondenteId,meta.titulo]);
  const ocorrencia=ocorrencias.get(assinatura)??0;ocorrencias.set(assinatura,ocorrencia+1);
  const r=e.rolagens.filter(x=>x.assinatura===assinatura)[ocorrencia];
  if(r?.resultado)return clone(r.resultado);
  const n=r?.indice??e.rolagens.length+faltantes.filter(x=>!e.rolagens[x.indice]).length;
  const falta=new PedidoDeRolagem(formula,meta,n);falta.assinatura=assinatura;faltantes.push(falta);
  return new Promise(()=>{});
 },contexto).then(next=>({next}),erro=>({erro}));
 let timer;
 const rodada=await Promise.race([trabalho,new Promise(resolve=>{timer=setTimeout(()=>resolve({espera:true}),0);})]);clearTimeout(timer);
 if(rodada.erro)throw rodada.erro;
 if(rodada.next)return {base,next:rodada.next};
 if(!faltantes.length)throw Error('O motor aguardou uma etapa sem pedido recuperável.');
 for(const falta of faltantes)if(!e.rolagens[falta.indice])e.rolagens[falta.indice]={id:e.id+':'+falta.indice,indice:falta.indice,formula:falta.formula,meta:falta.meta,assinatura:falta.assinatura};
 const pedidos=faltantes.map(f=>e.rolagens[f.indice]),r=pedidos[0];
 e.estado=r.snapshot?.tipo==='resultado'?'Resultado disponível':r.snapshot?.tipo==='rolando'?'Resultado desconhecido':'Aguardando resposta';e.versao++;registro.versao++;
 return {pedido:r,pedidos};
}
export function aplicarResultadoExecucao(base,next,atual){
 const out=clone(atual),porId=new Map(out.atores.map(a=>[a.id,a]));
 for(const a of next.atores){
  const antes=base.atores.find(x=>x.id===a.id),hoje=porId.get(a.id);
  if(!antes){if(hoje)throw Error('Conflito ao criar personagem da execução.');out.atores.push(clone(a));continue;}
  if(!hoje)throw Error('Um personagem da execução foi removido.');
  for(const k of new Set([...Object.keys(antes),...Object.keys(a)]))if(!igual(antes[k],a[k])){
   if(!igual(antes[k],hoje[k]))throw Error('O personagem mudou durante a execução: '+a.nome+'.');
   if(k in a)hoje[k]=clone(a[k]);else delete hoje[k];
  }
 }
 for(const a of base.atores)if(!next.atores.some(x=>x.id===a.id)){
  if(!igual(porId.get(a.id),a))throw Error('Conflito ao remover personagem.');out.atores=out.atores.filter(x=>x.id!==a.id);
 }
 for(const k of new Set([...Object.keys(base),...Object.keys(next)]))if(!['atores','historico','rev','__execucoes'].includes(k)&&!igual(base[k],next[k])){
  if(!igual(base[k],atual[k]))throw Error('A condição da mesa mudou durante a execução: '+k+'.');
  if(k in next)out[k]=clone(next[k]);else delete out[k];
 }
 out.rev=(atual.rev??0)+1;out.historico=[next.historico[0],...(atual.historico??[])].filter(Boolean).slice(0,45);return out;
}
export function validarDependenciasExecucao(e,base,atual){
 for(const k of ['fase','rodada','vez','ordem'])if(!igual(base[k],atual[k]))throw Error('O turno mudou durante a execução. Confira a jogada antes de aplicar.');
 const ids=e.recursos.includes('mesa')?base.atores.map(a=>a.id):e.recursos.filter(x=>x.startsWith('ator:')).map(x=>x.slice(5));
 const campos=['dono','token','emCombate','pv','pvTemporarios','estadoVida','rec','acao','bonus','reacao','efeitosAtivos','concentracaoAtiva','bencao'];if(e.comando.tipo!=='teste')campos.push('x','y');
 for(const id of ids){const a=base.atores.find(x=>x.id===id),b=atual.atores.find(x=>x.id===id);if(!a||!b)throw Error('Um participante da jogada foi removido.');
  for(const k of campos)if(!igual(a[k],b[k]))throw Error('Uma condição de '+a.nome+' mudou durante a jogada: '+k+'.');
  if(!igual(compactarFicha(a.ficha),compactarFicha(b.ficha)))throw Error('A ficha de '+a.nome+' mudou durante a jogada.');
 }
}
export function encerrarExecucao(registro,e,estado,erro,{agora=Date.now()}={}){
 if(encerrada(e))return false;
 Object.assign(e,{estado,erro,encerradaEm:agora,versao:e.versao+1});delete e.motivo;registro.versao++;
 registro.encerramentos??={};registro.encerramentos[e.id]={id:e.id,atividadeId:e.atividadeId,usuario:{id:e.usuario.id},intencao:clone(e.intencao),estado,erro,encerradaEm:agora,emitidaEm:e.comando.emitidaEm??e.criadaEm};
 const recibos=Object.values(registro.encerramentos).sort((a,b)=>a.encerradaEm-b.encerradaEm);
 while(recibos.length>512){const velho=recibos.shift();registro.expirouAntes=Math.max(registro.expirouAntes??0,velho.emitidaEm);delete registro.encerramentos[velho.id];}
 // A base é compartilhada por operações da mesma revisão; liberar só sem referências vivas.
 const usadas=new Set(registro.lista.filter(x=>!encerrada(x)).map(x=>x.baseRef));
 for(const ref of Object.keys(registro.bases))if(!usadas.has(ref))delete registro.bases[ref];
 delete e.baseRef;
 const fins=registro.lista.filter(encerrada);while(fins.length>30){const velha=fins.shift();registro.lista=registro.lista.filter(x=>x!==velha);}
 return true;
}
export function cancelarExecucao(registro,id,u,{confirmado=false}={}){
 const e=registro.lista.find(x=>x.id===id);if(!e)throw Error('Execução não encontrada.');
 if(u.role!=='GM'&&e.usuario.id!==u.id)throw Error('Você não pode cancelar a ação de outro participante.');
 if(encerrada(e))return {execucao:e,terminal:true};
 const comDados=e.rolagens.some(r=>r.dadosLancados||r.resultado||r.snapshot?.resultado||['rolando','indeterminada'].includes(r.snapshot?.tipo));
 if(comDados&&u.role!=='GM'){e.cancelamentoSolicitado=true;e.versao++;registro.versao++;return {execucao:e,solicitado:true};}
 if(comDados&&!confirmado)throw Error('Confirme o cancelamento de uma ação com dados já lançados.');
 encerrarExecucao(registro,e,'Cancelada','Cancelada por '+(u.name??u.id));return {execucao:e,terminal:true};
}
export function resumoExecucao(e,s){
 const a=s.atores.find(x=>x.id===e.atorId),o=a&&opcoesDisponiveis(a).find(x=>x.id===e.comando.opcao);
 return {id:e.id,atividadeId:e.atividadeId,atorId:e.atorId,donoId:e.usuario.id,titulo:o?.nome??(e.comando.tipo==='teste'?'Teste · '+e.comando.chave:e.comando.tipo),estado:e.estado,versao:e.versao,criadaEm:e.criadaEm,encerradaEm:e.encerradaEm,erro:e.erro,motivo:e.motivo,cancelamentoSolicitado:e.cancelamentoSolicitado===true,pedidos:e.rolagens.map(r=>({pedido:r.id,tipo:r.meta.tipo,titulo:r.meta.titulo,atorRespondenteId:r.meta.atorRespondenteId,destino:r.snapshot?.destino,concluido:!!r.resultado,resultado:r.resultado?{total:r.resultado.total,natural:r.resultado.natural,resumo:r.resultado.resumo,resultados:r.resultado.resultados?.map(x=>({total:x.total,natural:x.natural,resumo:x.resumo,fonteId:x.fonteId,fonteNome:x.fonteNome,tipoFonte:x.tipoFonte,formulaFonte:x.formulaFonte}))}:undefined}))};
}
