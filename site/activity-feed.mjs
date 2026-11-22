// Apresentação por usuário; a execução pertence ao controlador da sala.
export class AtividadesMesa{
 constructor({modo='painel',limite=30,agora=Date.now}={}){Object.assign(this,{modo,limite,agora,lista:new Map(),descartadas:new Set(),sequencia:0,selecionada:null,propria:null,anterior:null,manualHistorico:false,pausada:false,atenderFila:true});}
 obter(id){if(!this.lista.has(id))this.lista.set(id,{id,ordem:++this.sequencia,evento:this.sequencia,criadaEm:this.agora(),atualizadaEm:this.agora(),ativa:true,rolagens:[],estado:'Preparando'});return this.lista.get(id);}
 acao(p,{propria=false,remetenteId}={}){
  if(!p?.id||this.descartadas.has(p.id))return;
  const a=this.obter(p.id);if(!a.ativa||a.execucao&&['Concluída','Cancelada','Falhou'].includes(a.execucao.estado))return a;
  Object.assign(a,{acao:structuredClone(p),atorId:p.atorId,titulo:p.titulo,remetenteId:remetenteId??a.remetenteId,atualizadaEm:this.agora()});if(p.rolagem)a.executada=true;else if(!a.execucao)a.estado=p.verificandoUso?'Aguardando confirmação de uso':'Preparando';
  if(propria&&this.propria!==a.id){this.anterior=this.selecionada;this.propria=a.id;this.pausada=false;this.manualHistorico=false;this.atenderFila=false;this.selecionada=a.id;}
  this.aparar();return a;
 }
 dado(d){
  const id=d.atividadeId??'rolagem:'+d.pedido;if(this.descartadas.has(id))return;
  const pai=d.atividadeOrigemId&&this.lista.get(d.atividadeOrigemId);if(pai?.execucao&&['Cancelada','Falhou'].includes(pai.execucao.estado))return;
  const a=this.obter(id);if(['Cancelada','Erro','Falhou'].includes(a.estado)||a.execucao&&['Concluída','Cancelada','Falhou'].includes(a.execucao.estado))return a;
  a.executada=true;a.atorId=d.atorId??a.atorId;a.atividadeOrigemId=d.atividadeOrigemId??a.atividadeOrigemId;a.execucaoId=d.execucaoId??a.execucaoId;a.titulo=d.meta?.titulo??a.titulo??'Rolagem';
  const i=a.rolagens.findIndex(r=>r.pedido===d.pedido),anterior=a.rolagens[i];if(anterior?.fechada&&d.tipo!=='fechar')return a;
  const r={...anterior,...structuredClone(d),fechada:d.tipo==='fechar'};if(d.tipo==='erro')r.tipo='ajuste';if(d.tipo==='resultado')r.rascunho=null;
  if(i<0)a.rolagens.push(r);else a.rolagens[i]=r;
  a.evento=++this.sequencia;a.atualizadaEm=this.agora();
  a.estado=d.tipo==='resultado'?'Resultado disponível':d.tipo==='rolando'?'Rolando dados':d.tipo==='indeterminada'?'Resultado desconhecido':d.tipo==='fechar'?'Aguardando conclusão':'Aguardando resposta';
  if(!a.acao&&a.rolagens.every(r=>r.fechada)){a.ativa=false;a.estado='Concluída';}
  this.aparar();return a;
 }
 descansos(s){
  for(const ator of s.atores){const p=ator.ficha.tipo==='pj'&&ator.descansoVida;if(!p)continue;
   const a=this.obter(p.participacaoId);a.descansoVida=true;a.atorId=ator.id;a.titulo='Descanso curto · '+ator.nome;a.executada=true;
   if(!a.execucao||['Concluída','Cancelada','Falhou'].includes(a.execucao.estado)){a.ativa=p.estado==='pendente';a.estado=({pendente:'Aguardando escolha',concluido:'Concluído',dispensado:'Dispensado'})[p.estado];}
   if(p.resultado)a.aplicacao={cura:p.resultado.curaAplicada,total:0,alvos:[]};
  }
 }
 execucao(e){
  const a=this.obter(e.atividadeId??e.id);if(a.execucao?.id===e.id&&a.execucao.versao>e.versao)return a;
  if(e.descansoVida){a.descansoVida=true;if(e.descansoVida.resultado)a.aplicacao={cura:e.descansoVida.resultado.curaAplicada,total:0,alvos:[]};}
  if(e.acao&&!a.acao)a.acao=structuredClone(e.acao);
  Object.assign(a,{...(e.atividadeOrigemId?{atividadeOrigemId:e.atividadeOrigemId}:{}),execucao:structuredClone(e),execucaoId:e.id,atorId:e.atorId,titulo:e.titulo,estado:e.estado,executada:true,ativa:!['Concluída','Cancelada','Falhou'].includes(e.estado),atualizadaEm:this.agora()});
  for(const p of e.pedidos??[])if(p.concluido&&p.tipo!=='salvaguarda'&&!a.rolagens.some(r=>r.pedido===p.pedido)&&p.resultado)a.rolagens.push({pedido:p.pedido,tipo:'resultado',meta:{tipo:p.tipo,titulo:p.titulo},resultado:structuredClone(p.resultado),fechada:true});
  for(const p of e.pedidos??[])if(p.tipo==='salvaguarda'&&p.atorRespondenteId){
   const filha=this.obter(p.pedido);Object.assign(filha,{atividadeOrigemId:a.id,execucaoId:e.id,atorId:p.atorRespondenteId,titulo:p.titulo??'Salvaguarda',executada:true});
   if(p.concluido){filha.ativa=false;filha.estado='Concluída';if(!filha.rolagens.length&&p.resultado)filha.rolagens.push({pedido:p.pedido,tipo:'resultado',meta:{tipo:p.tipo,titulo:p.titulo},resultado:p.resultado,fechada:true});}
  }
  if(!a.ativa)this.concluir(a.id,e.estado);this.aparar();return a;
 }
 fecharDado(pedido){for(const a of this.lista.values()){const r=a.rolagens.find(r=>r.pedido===pedido);if(!r)continue;r.fechada=true;if(!a.acao&&a.rolagens.every(r=>r.fechada)){a.ativa=false;a.estado='Concluída';}return a;}}
 concluir(id,estado='Concluída'){
  const a=this.lista.get(id);if(!a)return;if(a.execucao&&['Concluída','Cancelada','Falhou'].includes(a.execucao.estado))estado=a.execucao.estado;a.ativa=false;a.estado=estado;if(a.acao)a.acao.rolagem=false;for(const r of a.rolagens)r.fechada=true;
  for(const filha of this.lista.values())if(filha.atividadeOrigemId===id&&filha.ativa){filha.ativa=false;filha.estado=estado;for(const r of filha.rolagens)r.fechada=true;}
  if(this.propria===id){this.propria=null;this.pausada=false;this.selecionada=null;this.manualHistorico=false;this.atenderFila=true;}
  else if(this.selecionada===id&&!this.manualHistorico)this.selecionada=null;
  if(!a.executada&&['Cancelada','Erro'].includes(estado)){this.lista.delete(id);this.descartadas.add(id);}else a.executada=true;this.aparar();
 }
 fecharVisual(){this.selecionada=null;this.manualHistorico=false;this.modo='painel';this.pausada=false;this.atenderFila=true;}
 recolherBarra(){this.fecharVisual();}
 alternar(){if(this.modo==='barra')this.fecharVisual();else this.modo='barra';}
 selecionar(id,abrir=false){if(!this.lista.has(id))return;this.selecionada=id;this.manualHistorico=true;this.pausada=id!==this.propria;if(abrir)this.modo='painel';}
 pendencias(destinatario){return [...this.lista.values()].filter(a=>a.ativa&&a.rolagens.some(r=>!r.fechada&&r.destino===destinatario&&r.tipo!=='rolando')).sort((a,b)=>a.ordem-b.ordem);}
 atual(destinatario){
  const propria=this.lista.get(this.propria),pendentes=this.pendencias(destinatario),dependente=pendentes.find(a=>a.atividadeOrigemId===this.propria);if(dependente)return dependente;
  if(this.manualHistorico&&this.lista.has(this.selecionada))return this.lista.get(this.selecionada);
  if(propria?.ativa&&!this.pausada&&!this.atenderFila)return propria;
  if(pendentes.length)return pendentes[0];if(propria?.ativa&&!this.pausada)return propria;
  return [...this.lista.values()].filter(a=>a.ativa&&a.executada).sort((a,b)=>b.evento-a.evento)[0]??null;
 }
 obrigatoria(id){return this.pendencias(id).length>0;}
 aparar(){
  const finalizadas=[...this.lista.values()].filter(a=>!a.ativa).sort((a,b)=>a.ordem-b.ordem);
  while(finalizadas.length>this.limite){const a=finalizadas.shift();if(this.selecionada===a.id)this.selecionada=null;this.lista.delete(a.id);}
  for(const a of this.lista.values())if(a.id!==this.propria&&a.ativa&&!a.executada&&this.agora()-a.atualizadaEm>15*60*1000)this.lista.delete(a.id);
  const rascunhos=[...this.lista.values()].filter(a=>!a.executada&&a.id!==this.propria);while(rascunhos.length>128)this.lista.delete(rascunhos.shift().id);
  while(this.descartadas.size>128)this.descartadas.delete(this.descartadas.values().next().value);
 }
 vista(){this.aparar();return [...this.lista.values()].filter(a=>a.executada||a.acao?.verificandoUso).sort((a,b)=>b.ordem-a.ordem).map(a=>structuredClone(a));}
}
