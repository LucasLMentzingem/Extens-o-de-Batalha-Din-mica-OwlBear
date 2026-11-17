// Estado de apresentação por usuário. Não executa ações nem altera recursos.
export class AtividadesMesa{
 constructor({modo='barra',limite=30}={}){this.modo=modo;this.limite=limite;this.lista=new Map();this.descartadas=new Set();this.sequencia=0;this.selecionada=null;this.propria=null;this.anterior=null;this.pausada=false;}
 obter(id){if(!this.lista.has(id))this.lista.set(id,{id,ordem:++this.sequencia,ativa:true,rolagens:[],estado:'Preparando'});return this.lista.get(id);}
 acao(p,{propria=false,remetenteId}={}){
  if(!p?.id||this.descartadas.has(p.id))return;const a=this.obter(p.id);Object.assign(a,{acao:structuredClone(p),atorId:p.atorId,titulo:p.titulo,remetenteId:remetenteId??a.remetenteId});
  if(p.rolagem)a.executada=true;
  if(propria&&this.propria!==a.id){if(!this.propria)this.anterior=this.modo;this.propria=a.id;this.pausada=false;this.modo='painel';this.selecionada=a.id;}
  this.aparar();return a;
 }
 dado(d){
  const id=d.atividadeId??'rolagem:'+d.pedido;if(this.descartadas.has(id))return;const a=this.obter(id);a.executada=true;a.atorId??=d.atorId;a.titulo??=d.meta?.titulo??'Rolagem';
  const i=a.rolagens.findIndex(r=>r.pedido===d.pedido),anterior=a.rolagens[i];
  const r={...anterior,...structuredClone(d),fechada:d.tipo==='fechar'};
  if(d.tipo==='erro')r.tipo='ajuste';if(d.tipo==='resultado')r.rascunho=null;
  if(i<0)a.rolagens.push(r);else a.rolagens[i]=r;
  a.estado=d.tipo==='resultado'?'Resultado disponível':d.tipo==='rolando'?'Rolando dados':d.tipo==='fechar'?'Aguardando conclusão':'Ajustando rolagem';
  if(!a.acao&&a.rolagens.every(r=>r.fechada)){a.ativa=false;a.estado='Concluída';}
  this.aparar();return a;
 }
 fecharDado(pedido){for(const a of this.lista.values()){const r=a.rolagens.find(r=>r.pedido===pedido);if(!r)continue;r.fechada=true;if(!a.acao&&a.rolagens.every(r=>r.fechada)){a.ativa=false;a.estado='Concluída';}return a;}}
 concluir(id,estado='Concluída'){
  const a=this.lista.get(id);if(!a)return;a.ativa=false;a.estado=estado;if(a.acao)a.acao.rolagem=false;for(const r of a.rolagens)r.fechada=true;
  if(this.propria===id){this.propria=null;this.pausada=false;this.modo=this.anterior??'barra';this.anterior=null;this.selecionada=null;}
  else if(this.selecionada===id&&!this.manualHistorico)this.selecionada=null;
  if(['Cancelada','Erro'].includes(estado)){this.lista.delete(id);this.descartadas.add(id);if(this.selecionada===id)this.selecionada=null;}else a.executada=true;
  this.aparar();
 }
 fecharVisual(){this.selecionada=null;this.manualHistorico=false;this.modo='barra';this.pausada=true;}
 recolherBarra(){this.selecionada=this.propria;this.manualHistorico=false;this.modo='painel';this.pausada=!this.propria;}
 alternar(){this.modo=this.modo==='barra'?'painel':'barra';if(this.modo==='barra'&&!this.propria){this.selecionada=null;this.manualHistorico=false;}if(this.propria)this.pausada=this.modo==='barra';}
 selecionar(id,abrir=false){if(!this.lista.has(id))return;this.selecionada=id;this.manualHistorico=!this.lista.get(id).ativa;if(abrir)this.modo='painel';if(this.propria)this.pausada=id!==this.propria||this.modo==='barra';}
 atual(destinatario){
  const obrigatoria=[...this.lista.values()].find(a=>a.rolagens.some(r=>!r.fechada&&r.destino===destinatario));
  if(obrigatoria&&!this.pausada)return obrigatoria;
  if(this.propria&&!this.pausada)return this.lista.get(this.propria);
  return this.lista.get(this.selecionada)??null;
 }
 obrigatoria(id){return !this.pausada&&[...this.lista.values()].some(a=>a.rolagens.some(r=>!r.fechada&&r.destino===id));}
 aparar(){const finalizadas=[...this.lista.values()].filter(a=>!a.ativa);while(finalizadas.length>this.limite){const a=finalizadas.shift();if(this.selecionada===a.id)this.selecionada=null;this.lista.delete(a.id);}}
 vista(){return [...this.lista.values()].filter(a=>a.executada).sort((a,b)=>b.ordem-a.ordem).map(a=>structuredClone(a));}
}
