const comandos=new Set(['alternarMovimentoDinamico','restaurarJanelas','cancelarExecucao','assumirPedido','resultadoManual','rascunhoDado','alternarAtividades','selecionarAtividade','fecharAtividade','recolherAtividades','reposicionarMesa','alturaAcao','dicaEfeito','alternarAdicional','rolarDado','rerrolarDado','continuarDado','cancelarDado','linhas','compactar','focar','ficha','ator','alternarGavetaComposicao','parametroPrototipo','alterarCirculo','alternarMagiaDuplicada','alternarIlusaoDano','selecionarModoComposicao','desfazer','concluir','cancelar','confirmar','responderIniciativa','resolverReacao','teste','encerrarConcentracao','usarItem','iniciar','encerrar','avancarTempo','descanso','iniciativas','npcs','usar','mover','passar','iniciativa']);
export function mensagemHudValida(d,sessao){
 if(!d||typeof d!=='object'||Array.isArray(d)||'vista'in d)return false;
 if(d.sessaoHud!=null&&d.sessaoHud!==sessao)return false;
 if(d.tipo==='dimensoesBarra')return d.parte==='barra'&&typeof d.atorId==='string'&&typeof d.documentoHud==='string'&&Number.isInteger(d.rev)&&Number.isInteger(d.linhas)&&d.linhas>=1&&d.linhas<=5&&['larguraIdeal','larguraMedida','altura'].every(k=>Number.isFinite(d[k])&&d[k]>0&&d[k]<=8192)&&d.altura>=60;
 return comandos.has(d.tipo)||d.pedir===true||typeof d.presenca==='string'||typeof d.entradaHud==='string'&&typeof d.pressionado==='boolean';
}
