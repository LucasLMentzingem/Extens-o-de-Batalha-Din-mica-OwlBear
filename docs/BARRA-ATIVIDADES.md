# Barra de Atividades da Mesa

Implementação local em 17/11/2026. Complementa a transmissão pública de prévias e rolagens; não torna simultâneas as transações do motor.

## Apresentação

- Barra horizontal inferior direita: teste e dano acima da skill, retrato do token abaixo. Recentes à esquerda; antigas à direita; execução própria fixada à esquerda. Largura limitada e scroll horizontal.
- Seta acima da barra troca para instância e dados selecionados. No modo expandido, botão inferior no início da região direita volta à barra e pulsa se há outras ações em andamento.
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
- Regressão completa: 290 testes passaram (incluindo o ajuste local de manter baú aberto ao equipar).
- Navegador headless com SDK simulado: duas prévias remotas, própria ação, pausa/retomada, retorno à barra, histórico somente leitura e fórmula 1d20+7 preservada ao recolher/abrir antes de rolar e concluir. Mantido o teste de recuperação do arremesso após falha transitória do SDK.
- Não houve teste na sala real nesta etapa. Layout e latência precisam ser conferidos no Owlbear real após uma publicação autorizada.
