# Descanso curto — recuperação paralela por Dados de Vida

Arquitetura e decisões aprovadas em 21/11/2026. Implementada localmente em 22/11/2026 após autorização; ainda sem publicação. [Implementação, migração, testes e limites de retomada](IMPLEMENTACAO-DESCANSO-CURTO-DADOS-DE-VIDA-2026-11-22.md). O texto abaixo preserva o plano aprovado.

## Fluxo aprovado

1. O mestre concede descanso curto fora de combate. A recuperação configurada de recursos acontece uma única vez e cria uma sessão identificada de recuperação de PV.
2. São elegíveis à escolha somente fichas de jogador, inclusive fora da iniciativa, com ao menos 1 PV, abaixo do máximo e com Dados de Vida disponíveis. NPCs não recebem janela nem entram nos pendentes; PJs sem dados ou com PV completos ficam dispensados automaticamente.
3. Cada jogador vê token, PV atual/máximo, saldo/tipo de Dados de Vida, Constituição atual, quantidade e previsão da fórmula. Quantidade inicial 1, limitada ao saldo. Botões: Não gastar; Rolar e recuperar.
4. Ao escolher quantidade e rolar, gasta os dados, recebe cura e sai dos pendentes após confirmação persistida. Não exige botão adicional para continuar; resultado fica no histórico.
5. O mestre acompanha Aguardando escolha, Rolando, Concluído e Dispensado. Pode escolher quantidade e rolar por qualquer pendente, inclusive desconectados, ou dispensá-lo. Ao assumir uma rolagem já iniciada, usa a mesma execução.
6. Cada personagem tem execução independente; rolagens acontecem em paralelo, sem bloquear toda a mesa nem sobrescrever alterações dos outros personagens. Recuperações aparecem em Atividades da mesa com token e identificação Descanso curto.

## Regras e cálculo

- Seguir a edição 2024 já adotada no motor: Constituição em cada dado e cura mínima de 1 PV por dado, calculada individualmente. Limitar a cura aplicada aos PV máximos atuais.
- Gastar todos os dados selecionados, inclusive quando a cura exceder o máximo. Descanso curto não recupera Dados de Vida; longo recupera todos.
- Quantidade significa dados a gastar para curar, não dados a recuperar.
- Tipos diferentes de dado em multiclasse exigem seleção por tipo. Não inferir silenciosamente um tipo incorreto a partir da primeira classe.

## Decisões aceitas

1. Uma escolha de quantidade por participação. É a simplificação solicitada da regra que permite decidir após cada dado. O mestre pode reabrir a escolha para gastar mais durante o mesmo descanso, sem restaurar recursos novamente.
2. Dispensar automaticamente quem está com PV completos ou sem dados.
3. Sem prazo automático: ausência não gasta dados nem dispensa o personagem.
4. Antes de novo descanso curto, o mestre resolve ou encerra as pendências anteriores. Cliques repetidos não criam descansos duplicados.
5. Descanso longo encerra escolhas antigas, tratando primeiro rolagens em andamento.
6. Rolagens e resultados públicos dos PJs seguem o padrão da mesa.

## Cancelamento, recuperação e consistência

- Fechar a janela antes de rolar apenas minimiza; continua pendente. Não gastar conclui sem consumo.
- Falha antes de lançar permite tentar novamente. Depois de lançar, recuperar o resultado registrado sem rerrolar.
- F5/reconexão restaura pendência ou resultado confirmado.
- Desconto, cura e conclusão devem ser gravados juntos e de forma idempotente por sessão/participante/execução. Jogador e mestre não podem concluir a mesma participação duas vezes.
- Validar saldo, elegibilidade, controle e condições atuais na aplicação. Nunca substituir o estado inteiro por um snapshot antigo de outro jogador.

## Integrações identificadas

- `site/engine.mjs`: comando descanso e seleção de elegíveis; recursos `dv`/`dados-de-vida`; adaptação da opção Gastar Dado de Vida; cálculo da cura e sessão de descanso.
- `site/executions.mjs`: bloqueio por ator, pedidos/resultados persistentes, aplicação/merge e dependências da sessão; não usar bloqueio global de mesa para cada recuperação.
- `site/bridge.mjs`: autorização, distribuição dos pedidos, retomada e assumir pelo mestre; resultados públicos conforme regras de privacidade existentes.
- `site/hud-controller.mjs`, `site/hud-ui.mjs` e protocolos/estilos: escolha individual, lista do mestre e vínculo com Atividades. Reaproveitar a experiência de iniciativa sem mudar a fase global do encontro para iniciativa.
- `site/prototipos-cemiterio.mjs`: Prece de Cura deve abrir a mesma escolha aos PJs beneficiados quando concede descanso curto. Não remover seus demais efeitos em NPCs nem aplicar recuperação de recursos duas vezes.
- Normalização/migração: preservar saldos legados; Constituição atual; identificar dados por classe/nível/tipo. Alterar/reexportar fichas somente se a informação necessária não puder ser obtida com segurança dos dados existentes.

## Verificação necessária na implementação

- Mestre e 1/2+ jogadores rolando em paralelo; múltiplos PJs por dono; ausente/sem dono; somente NPCs; saldo zero; vida cheia; morto/0 PV.
- Quantidades/saldos, limites de PV, Constituição negativa e mínimo por dado; multiclasse; modificadores de cura suportados.
- Clique duplo; mestre e jogador concorrendo; atualização de outro ator; F5 antes/durante/depois; resultado recebido com aplicação pendente; falha/reentrega sem repetir cura ou gasto.
- Reabrir sem recarga; novo descanso; longo com pendências; Prece de Cura; Atividades e Dice+; privacidade e regressões de recursos/combate/HUD.

Referências de regras: [descanso curto 2024](https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#ShortRest), [descanso longo 2024](https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#LongRest).
