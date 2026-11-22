// Estado por personagem: conclusões paralelas não disputam uma sessão global.
const classes={barbaro:12,guerreiro:10,guardiao:10,paladino:10,bardo:8,bruxo:8,clerigo:8,druida:8,ladino:8,monge:8,feiticeiro:6,mago:6};
const ladosValidos=[6,8,10,12];
const exigir=(ok,msg)=>{if(!ok)throw Error(msg);};
export const recursoVida=a=>a?.ficha?.recursos?.find(r=>['dv','dados-de-vida'].includes(r.id));
export function adaptarComandoVida(s,c){
 if(c.tipo!=='usar'||c.opcao!=='gastar-dado-de-vida')return c;
 const a=s.atores.find(x=>x.id===c.ator),p=a?.descansoVida,d=dadosVida(a);
 exigir(p?.estado==='pendente','Abra a recuperação de um descanso curto concedido pelo mestre.');exigir(!d.erro,d.erro);
 exigir(d.grupos.length===1,'Escolha os Dados de Vida por tipo na janela de descanso curto.');
 const g=d.grupos.find(g=>g.saldo>0);
 return {...c,tipo:'recuperarDescanso',sessaoId:p.sessaoId,participacaoId:p.participacaoId,dados:{[g?.lados]:1}};
}
export function dadosVida(a){
 const r=recursoVida(a);if(!r)return {grupos:[],saldo:0};
 const saldo=Math.max(0,Math.min(r.maximo,Math.floor(a.rec?.[r.id]??0))),porTipo=new Map();
 for(const c of a.ficha.classes??[]){const lados=classes[c.id];if(lados&&Number.isInteger(c.nivel)&&c.nivel>0)porTipo.set(lados,(porTipo.get(lados)??0)+c.nivel);}
 const explicito=Number(/d(6|8|10|12)(?!\d)/i.exec(r.nome??'')?.[1]);
 if(porTipo.size<=1&&explicito){porTipo.clear();porTipo.set(explicito,r.maximo);}
 if(porTipo.size===1){const lados=[...porTipo.keys()][0];return {recurso:r.id,saldo,grupos:[{lados,maximo:r.maximo,saldo}]};}
 const total=[...porTipo.values()].reduce((n,v)=>n+v,0);
 if(!porTipo.size||total!==r.maximo)return {recurso:r.id,saldo,grupos:[],erro:'O tipo dos Dados de Vida não está definido com segurança na ficha.'};
 const salvos=a.saldosDadosVida,grupos=[...porTipo].sort((a,b)=>a[0]-b[0]).map(([lados,maximo])=>({lados,maximo,saldo:salvos?.[lados]}));
 const valido=grupos.every(g=>Number.isInteger(g.saldo)&&g.saldo>=0&&g.saldo<=g.maximo)&&grupos.reduce((n,g)=>n+g.saldo,0)===saldo;
 if(!valido)for(const g of grupos)g.saldo=saldo===r.maximo?g.maximo:saldo===0?0:null;
 return {recurso:r.id,saldo,grupos,...(grupos.some(g=>g.saldo===null)?{erro:'Saldo legado multiclasse: o mestre precisa distribuir os dados restantes por tipo.'}:{})};
}
export function configurarDadosVida(a,selecao){
 const d=dadosVida(a);exigir(d.grupos.length>1,'Não há distribuição multiclasse para configurar.');
 exigir(selecao&&Object.keys(selecao).length===d.grupos.length&&d.grupos.every(g=>Number.isInteger(selecao[g.lados])&&selecao[g.lados]>=0&&selecao[g.lados]<=g.maximo)&&Object.keys(selecao).every(k=>d.grupos.some(g=>String(g.lados)===k))&&Object.values(selecao).reduce((n,v)=>n+v,0)===d.saldo,'Distribua exatamente o saldo atual entre os tipos de dado.');
 a.saldosDadosVida=structuredClone(selecao);
}
export function abrirRecuperacao(a,{sessaoId,participacaoId,origem='mesa',agora,maximo}){
 if(a.ficha.tipo!=='pj')return;
 const d=dadosVida(a),motivo=a.estadoVida==='morto'?'Personagem morto':a.pv<1?'Personagem a 0 PV':a.pv>=maximo?'PV completos':!d.saldo?'Sem Dados de Vida':null;
 a.descansoVida={sessaoId,participacaoId,origem,criadaEm:agora,estado:motivo?'dispensado':'pendente',...(motivo?{motivo}:{})};
}
export function conferirParticipacao(s,a,c){
 exigir(s.fase==='preparo','Gaste Dados de Vida durante um descanso fora do combate.');
 exigir(a?.ficha.tipo==='pj','A recuperação por Dados de Vida é somente para personagens jogadores.');
 const p=a.descansoVida;exigir(p&&p.sessaoId===c.sessaoId&&p.participacaoId===c.participacaoId&&p.estado==='pendente','Esta participação já terminou ou foi substituída. Atualize o descanso.');return p;
}
export function selecionarDados(a,selecao){
 const d=dadosVida(a);exigir(!d.erro,d.erro);
 exigir(selecao&&typeof selecao==='object'&&!Array.isArray(selecao)&&Object.keys(selecao).every(k=>ladosValidos.includes(Number(k))&&d.grupos.some(g=>String(g.lados)===k)),'Escolha os tipos de Dado de Vida disponíveis.');
 const xs=d.grupos.map(g=>({...g,quantidade:selecao[g.lados]??0}));
 exigir(xs.every(g=>Number.isInteger(g.quantidade)&&g.quantidade>=0&&g.quantidade<=g.saldo),'Quantidade de Dados de Vida inválida ou acima do saldo.');
 const formulas=xs.flatMap(g=>Array.from({length:g.quantidade},()=> '1d'+g.lados));exigir(formulas.length>0&&formulas.length<=100,'Escolha pelo menos um Dado de Vida (máximo 100 por participação).');
 return {dados:d,grupos:xs,formulas};
}
export function concluirRecuperacao(a,plano,resultados,{con,curar,agora}){
 exigir(resultados.length===plano.formulas.length&&resultados.every((r,i)=>Number.isInteger(r.total)&&r.total>=1&&r.total<=Number(plano.formulas[i].slice(2))),'A rolagem não retornou todas as faces válidas dos Dados de Vida.');
 const parcelas=resultados.map((r,i)=>({formula:plano.formulas[i],face:r.total,con,cura:Math.max(1,r.total+con)})),curaRolada=parcelas.reduce((n,r)=>n+r.cura,0),pvAntes=a.pv;
 curar(a,curaRolada);
 a.rec[plano.dados.recurso]-=resultados.length;
 a.saldosDadosVida=Object.fromEntries(plano.grupos.map(g=>[g.lados,g.saldo-g.quantidade]));
 Object.assign(a.descansoVida,{estado:'concluido',concluidaEm:agora,resultado:{parcelas,curaRolada,curaAplicada:a.pv-pvAntes,pvAntes,pvDepois:a.pv,dadosGastos:resultados.length}});
 return a.descansoVida.resultado;
}
export function recuperacoesVisiveis(s,u){return (s?.atores??[]).filter(a=>a.ficha.tipo==='pj'&&a.descansoVida&&(u.role==='GM'||a.dono===u.id));}
