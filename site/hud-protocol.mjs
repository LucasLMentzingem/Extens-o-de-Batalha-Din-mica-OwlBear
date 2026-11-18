const comandos=new Set(['alternarMovimentoDinamico','restaurarJanelas','cancelarExecucao','assumirPedido','resultadoManual','rascunhoDado','alternarAtividades','selecionarAtividade','fecharAtividade','recolherAtividades','reposicionarMesa','alturaAcao','dicaEfeito','alternarAdicional','rolarDado','rerrolarDado','continuarDado','cancelarDado','linhas','compactar','focar','ficha','ator','alternarGavetaComposicao','parametroPrototipo','alterarCirculo','alternarMagiaDuplicada','alternarIlusaoDano','selecionarModoComposicao','desfazer','concluir','cancelar','confirmar','responderIniciativa','resolverReacao','teste','encerrarConcentracao','usarItem','iniciar','encerrar','avancarTempo','descanso','iniciativas','npcs','usar','mover','passar','iniciativa']);
export function mensagemHudValida(d,sessao){
 if(!d||typeof d!=='object'||Array.isArray(d)||'vista'in d)return false;
 if(d.sessaoHud!=null&&d.sessaoHud!==sessao)return false;
 return comandos.has(d.tipo)||d.pedir===true||typeof d.presenca==='string'||typeof d.entradaHud==='string'&&typeof d.pressionado==='boolean';
}
