# Barra de Atividades da Mesa

Integrada à versão 0.8.49 em 17/11/2026. Complementa a transmissão pública de prévias e rolagens; não torna simultâneas as transações do motor.

## Apresentação

- Barra horizontal inferior direita: teste e dano acima da skill, retrato do token abaixo. Recentes à esquerda; antigas à direita; execução própria fixada à esquerda. Largura limitada e scroll horizontal.
- A seta grande à esquerda da instância abre a barra e pulsa com outras atividades em andamento; sem instância, fica junto à borda direita. A seta à esquerda da barra recolhe o histórico para a direita.
- Clique seleciona; duplo clique abre. Ícones ativos pulsam; resultado confirmado para de rolar. Números usam carretéis locais e respeitam preferência de movimento reduzido.
- Própria ação tem prioridade; iniciar recolhe a barra, guarda o modo anterior e o restaura ao concluir/cancelar. Pausar preserva alvos, composição e fórmula digitada. Cliques no mapa não modificam a seleção enquanto ela está pausada. Prazos do motor seguem normalmente.
- Histórico: últimas 30 execuções concluídas, além das ativas; somente leitura. Nesta implementação o histórico dura a sessão do controlador na cena: recarregar ou trocar de cena limpa esse histórico, sem afetar o estado persistido do jogo.

## Organização

`activity-feed.mjs` guarda execuções separadas, seleção, prioridade e modo local. `hud-controller.mjs` integra as prévias autorizadas, pedidos de dados e janelas. `hud-ui.mjs` e `hud.css` apresentam a barra e as animações.

Cada comando iniciado na HUD recebe atividadeId. O mestre repassa esse ID às rolagens, ligando ataque, dano e rerrolagens à mesma execução. Prévia, atividade e pedido de dado têm identidades distintas. Rerrolagem atualiza o mesmo pedido; fechar um pedido não encerra uma ação composta.

Resultados de dano somam relatórios de perda de PV, quando disponíveis. Ao confirmar uma ação, a transmissão de conclusão informa a variação efetiva de PV por alvo visível; o balão separa PV temporários absorvidos. Antes da confirmação, áreas sem relatório por alvo exibem o dano rolado provisório. A conclusão considera a variação líquida de PV da transação; futuras habilidades que curem e causem dano ao mesmo alvo na mesma transação poderão precisar de um relatório de parcelas aplicadas do motor.

A política de salvaguarda/iniciativa continua em roll-visibility.mjs: espectadores recebem somente anúncio de resultado; dono e GM conservam seus controles. Pedidos destinados ao usuário têm prioridade, comandos dos dados identificam o pedido e históricos fechados não aceitam edição. Atores que deixam de estar na vista autorizada também saem do histórico local e perdem as marcas de prévia desse cliente.

Prévia de cada participante tem sua própria coleção de marcas. Não há envio de eventos para piscar ou girar números. Rascunhos circulam somente no BroadcastChannel local. Layout agrupa atualizações concorrentes; a fila visual de prévias não fica presa aguardando a resolução dos dados da própria ação.

## Verificação

- Testes unitários: concorrência, prioridade própria, restauração do modo, participação obrigatória, histórico limitado, resultados preservados e rerrolagens.
- Regressão completa da 0.8.49: 301 testes passaram, incluindo manter baú aberto ao equipar, golpes compostos e escolhas de iniciativa.
- Navegador headless com SDK simulado: duas prévias remotas, própria ação, pausa/retomada, retorno à barra, histórico somente leitura e fórmula 1d20+7 preservada ao recolher/abrir antes de rolar e concluir. Mantido o teste de recuperação do arremesso após falha transitória do SDK.
- Não houve teste na sala real nesta etapa. Layout e latência precisam ser conferidos no Owlbear real após uma publicação autorizada.

## Ajuste 0.8.50

- Cancelar/concluir a própria atividade deixa a tela sem seleção automática do histórico. Recolher a barra também limpa a inspeção antiga.
- Inspeções de GM e jogadores são somente leitura e mostram Fechar na instância e no resultado, voltando à barra. Fechar uma inspeção não cancela uma ação própria pausada.
- A seta para abrir permanece disponível sem seleção/histórico. Com instância fica à esquerda dela; sem instância fica junto à borda direita. A barra aberta possui seta na sua borda esquerda para recolher à direita. O brilho de atividade permanece.
- Instâncias e miniaturas dos balões não sobrepõem nomes às imagens. Pós-acerto e rerrolagens exibem o nome fora da imagem, abaixo dela; ajuste de rolagem tem mais espaço.
- 302 testes automatizados aprovados. Navegador com SDK simulado confirmou Fechar, ausência de Executar/Cancelar no histórico, retorno à barra, seta na borda, rascunhos preservados e nome pós-acerto abaixo do ícone. Falta validação na sala real. Integrado à publicação 0.8.50.

## Ajuste local após 0.8.50 — execuções e PV

A lista visual inclui somente ações que começaram a execução ou foram concluídas. Preparar/selecionar permanece como prévia de trabalho e não entra na barra histórica. Cancelar ou falhar remove a atividade e impede que atualizações atrasadas da mesma identidade a recriem. A própria preparação pode ser pausada pela barra e retomada ao recolhê-la, sem ser registrada como execução.

A projeção de rolagem para jogadores retira PV anterior/restante/máximo e excesso dos inimigos NPCs, inclusive nos relatórios aninhados e no ajuste. A quantidade de dano e suas parcelas continuam disponíveis. O GM recebe o relatório completo; o dado original de resolução não é alterado. As fichas de PJs conservam a política de PV público já usada pela mesa.

308 testes passaram e a interface com SDK simulado confirmou cancelamento sem histórico e resultado de dano nas visões de jogador/GM. Ainda local, sem nova publicação.
