Original prompt: Implementar ajuste de rolagens antes de ataques, grade da HUD configurável de 1 a 5 linhas, reações automáticas com janela de 20 segundos, salvaguardas pelo atributo, lista completa de períícias, HUD compactável, foco de câmera pelo carrossel e ataques de oportunidade que interrompem o movimento no ponto do acerto.

## Estado

- Versão publicada antes desta etapa: 0.3.0.
- O motor já resolve ataques, magias, múltiplos alvos e custos de ação.
- A HUD já possui carrossel, barra de habilidades, seleção no mapa e confirmação de movimento.

## Trabalho desta etapa

- [x] Ajustes com dados extras e modificador antes de ataques.
- [x] Grade da HUD de 1 a 5 linhas.
- [x] Reação automática de ataque de oportunidade com tempo de 20 segundos.
- [x] Seta de ameaça no trajeto e interrupção do movimento no acerto.
- [x] Perícias em botões e salvaguardas por clique direito nos atributos.
- [x] HUD compactável pelo retrato e foco de câmera pelo carrossel.
- [x] Testes do motor, integração simulada e inspeção visual.

## Notas da implementação

- O deslocamento ameaçado fica pendente no estado da sala; recusar ou errar continua o trajeto, acertar move até o ponto exato de saída do alcance e encerra esse deslocamento.
- O ataque de oportunidade escolhe o melhor ataque corpo a corpo automatizado da ficha e sempre alveja quem iniciou o movimento.
- O formato aceita até quatro fórmulas de dados extras por rolagem, além do modificador estático entre -20 e +20.
- Testes unitários: 18 aprovados após a primeira implementação.
- O primeiro teste de navegador encontrou o cronômetro reconstruindo os botões a cada meio segundo; o contador passou a atualizar apenas o texto para não interromper cliques ou apagar ajustes digitados.
- Integração simulada aprovada para ajuste pré-ataque, seta de oportunidade, reação com dados extras, interrupção do movimento, grade de uma linha, HUD compacta, foco de câmera, 18 perícias e salvaguarda por clique direito.
- Inspeção visual concluída nas capturas `work/reacao-oportunidade-v04.png`, `work/pericias-v04.png` e `work/ficha-selecionada-v04.png`.

## Etapa seguinte: testes rápidos na HUD

- [x] Abas Perícias e Salva guarda ao lado de Linhas.
- [x] Dezoito perícias com os bônus da ficha ou o modificador do atributo quando não declaradas.
- [x] Seis salvaguardas com os bônus da ficha.
- [x] Rolagens disponíveis fora do turno e sem consumir ação, bônus ou reação.
- [x] Testar a revisão antes e durante o combate.
- [x] Publicar a revisão 0.4.1.

- Testes finais: 19 testes do motor, integração simulada da HUD e cliente de navegador sem erros novos.
- Capturas conferidas: `work/pericias-hud-v041.png` e `work/pericias-pre-combate-v041.png`.

## Etapa seguinte: menu de contexto da ficha

- [x] Segmento incorporado no menu de contexto para tokens de Personagem.
- [x] Retirar e recolocar a ficha na ordem de combate sem perder o vínculo.
- [x] Abrir diretamente a ficha do personagem.
- [x] Barras e campos Atual/Máximo para PV e todos os recursos declarados no JSON.
- [x] Bloquear o token ao entrar e restaurar seu bloqueio anterior ao sair do combate.
- [x] Teste integrado do painel, edição de Pontos de Feitiçaria e inspeção visual.
- [x] Publicar a versão 0.5.0.

- Testes finais: 21 testes do motor, painel de contexto integrado, HUD completa e navegador sem erros novos.
- Captura conferida: `work/contexto-recursos-v05.png`.

## Etapa seguinte: rolagens compostas e resultado central

- [x] Abrir o ajuste imediatamente antes de toda rolagem, inclusive dano, iniciativa e concentração.
- [x] Enviar ao Dice+ uma única expressão composta, com vantagem, bônus e dados extras juntos.
- [x] Validar a expressão pelo próprio canal de validação do Dice+ antes de executar.
- [x] Exibir no centro o resumo da conta e Acerto, Falha, Acerto crítico ou Falha crítica.
- [x] Conferir ataque contra a CA sem revelar os valores internos da ficha do adversário no estado público.
- [x] Pré-configurar o dado adicional de dano após um 20 natural.
- [x] Manter a janela de resultado até o jogador confirmar a continuação.

- Testes finais: 22 testes do motor, incluindo expressão única, CA, natural 20 e dano crítico.
- Cliente genérico carregado sem erros novos; inspeção principal preservada em `work/rolagem-v06/shot-0.png`.

## Correção 0.6.1: sequência interativa da rolagem

- [x] Botões Normal, Vantagem e Desvantagem diretamente no ajuste do d20.
- [x] Liberar Rolar, Continuar e Cancelar enquanto a ação aguarda o Dice+.
- [x] Retirar eventos de rolagem da fila serial que aguarda a própria ação terminar.
- [x] Evitar que Continuar apague o próximo pedido de dano por condição de corrida.
- [x] Confirmar que o dano abre em uma janela própria e que a ação chega a zero após a resolução.

- Testes: 22 testes do motor aprovados e fluxo Playwright de ajuste/resultado/próxima rolagem aprovado.
- Capturas conferidas: `work/ajuste-vantagem-v061.png` e `work/ajuste-dano-v061.png`.

## Correção 0.6.2: falha no envio local do mestre

- [x] Corrigir `Cannot read properties of undefined (reading 'catch')` no `BroadcastChannel.postMessage`.
- [x] Preservar a sequência: acerto → ajuste de dano → dano → confirmação dos custos.
- [x] Validar acertos e falhas consumindo a ação após a resolução completa.

## Versão 0.7.0: painel de ação e armas arremessáveis

- [x] Criar ações de arremesso separadas para opções ligadas a armas arremessáveis.
- [x] Usar alcance normal/longo, aplicando desvantagem automaticamente além do alcance normal.
- [x] Abrir um painel persistente de ação no centro-esquerda com informações em formato de carta.
- [x] Reunir no painel instrução de alvo, Desfazer, Executar seleção e Cancelar.
- [x] Desenhar uma trajetória por alvo selecionado.
- [x] Separar visualmente trajetórias repetidas de Mísseis Mágicos contra o mesmo alvo.

- Testes do motor: 24 aprovados.
- Integração Playwright aprovada para variante de arremesso, painel da ação, seleção 2/3, botão bloqueado e trajetórias repetidas.
- Capturas conferidas: `work/painel-arremesso-v07.png`, `work/painel-misseis-v07.png` e `work/painel-acao-v07.png`.

## Versão 0.7.1: rajadas agrupadas e linhas sobre os tokens

- [x] Colocar alcance, trajetória de ataque, movimento e ameaça de oportunidade na camada de controle, acima dos tokens.
- [x] Reunir os danos de Mísseis Mágicos e outras rajadas em uma única solicitação ao Dice+.
- [x] Mostrar um campo configurável por seta, com Normal, Vantagem e Desvantagem independentes.
- [x] Manter apenas um botão **Rolar dados** para toda a rajada.
- [x] Exibir conta, alvo e dano de cada seta em seções próprias no resultado conjunto.
- [x] Preservar crítico, resistência, vulnerabilidade, imunidade e concentração por alvo.

- Testes do motor: 25 aprovados, incluindo fórmulas agrupadas, alvos repetidos e danos separados.
- Integração Playwright aprovada para três setas, ajuste individual da segunda, uma única execução, resultados separados e itens visuais na camada frontal.
- Capturas conferidas: `work/ajuste-rajada-v071.png` e `work/resultado-rajada-v071.png`.

## Versão 0.7.2: painel de ação no centro-direita

- [x] Mover a instância persistente da ação do centro-esquerda para o centro da metade direita da tela.
- [x] Limitar a posição para manter o painel inteiramente visível em janelas menores.

- Integração Playwright confirmou o centro horizontal do painel na metade direita, sem regressão na seleção e execução de ações.
- Captura conferida: `painel-acao-centro-direita-v072.png`.

## Versão 0.7.3: salvaguardas por alvo e área

- [x] Migrar Talho Mental, Sussurros Dissonantes, Braços de Hadar e Acalmar Emoções para automação estruturada.
- [x] Exigir seleção de alvo para magias de salvaguarda direta.
- [x] Resolver salvaguardas diretas antes do dano e omitir o dano quando todos os sucessos o anularem.
- [x] Rolar o dano de área antes das salvaguardas e aplicar dano integral, reduzido ou nulo individualmente.
- [x] Enviar a janela de salvaguarda para o jogador que controla o alvo; manter NPCs em fila na tela do mestre.
- [x] Mostrar alvo e CD no ajuste e Sucesso ou Falha no resultado.
- [x] Aplicar efeitos estruturados de falha, incluindo a penalidade do Talho Mental e consumo de reação.

- Testes do motor: 28 aprovados.
- Integração Playwright aprovada para seleção, falha contra CD, dano posterior, efeito persistente e salvaguarda distribuída à tela do jogador com dano retornando ao mestre.
- Capturas conferidas: `painel-salva-v073.png`, `ajuste-salva-v073.png`, `resultado-salva-v073.png` e `salva-distribuida-player-v073.png`.

## Versão 0.7.4: controle de fichas e painel do mestre

- [x] Separar **Controle de fichas** e **Controle do mestre** em abas próprias.
- [x] Manter o painel do mestre invisível para jogadores.
- [x] Mostrar ao mestre a lista completa do combate, com iniciativa, PV, estado e controles para abrir, retirar ou recolocar cada ficha.
- [x] Iniciar e parar o combate diretamente no painel exclusivo do mestre.
- [x] Mostrar aos jogadores somente fichas de PJ e deixar fichas de outros donos em modo de leitura.
- [x] Agrupar os NPCs ao final da lista do mestre em uma seção recolhível com +/−.
- [x] Remodelar a ficha como formulário de D&D com identidade, classe, nível, atributos, combate, salvaguardas, perícias, recursos e características.
- [x] Fixar **Salvar alterações** no topo e restringir edição ao GM ou dono da ficha.
- [x] Preservar ID, tipo, dono e token durante a edição e manter um editor JSON avançado para todas as variáveis do nível 1 ao 10.

- Testes do motor: 31 aprovados, incluindo propriedade, edição de NPC pelo GM, proteção de identidade e falha atômica.
- Integração Playwright aprovada nas visões de mestre e jogador, com edição persistente, NPCs recolhíveis e isolamento do painel do GM.
- Capturas conferidas: `work/controle-mestre-v074.png`, `work/ficha-editavel-gm-v074.png` e `work/ficha-editavel-player-v074.png`.

## Versão 0.7.5: bônus derivados, buffs e condições

- [x] Separar valores-base dos bônus ativos de CA, PV máximo e deslocamento.
- [x] Mostrar cada bônus em um campo curto imediatamente à direita do respectivo valor-base.
- [x] Usar os totais derivados em ataques contra CA, barras de PV, movimento e painel de contexto.
- [x] Criar um modelo genérico de efeito para buffs e condições, com modificadores, requisitos, duração e restrições.
- [x] Exibir buffs e condições na ficha e como ícones flutuantes semitransparentes à direita da HUD.
- [x] Mostrar a descrição completa do efeito ao passar o mouse ou focar o ícone.
- [x] Automatizar Armadura Arcana com alvo, requisito sem armadura, uso dentro ou fora de combate e remoção no descanso longo.
- [x] Corrigir a Nikki para CA base 13 e bônus +2 da Armadura Arcana, migrando também encontros já armazenados.
- [x] Permitir que o mesmo modelo aumente PV máximo/atual e deslocamento.

- Testes do motor: 34 aprovados, incluindo Armadura Arcana, requisito de armadura, descanso longo, PV adicional, deslocamento e condição de congelamento.
- Integração Playwright aprovada para conjuração fora do combate, seleção do alvo, ícone flutuante, tooltip e campos base/bônus da ficha.
- Capturas conferidas: `work/buff-armadura-hud-v075.png` e `work/ficha-buff-v075.png`.

## Versão 0.7.6: grade de efeitos e sincronização do token

- [x] Mover buffs e condições para uma faixa transparente à esquerda do corpo da HUD.
- [x] Fixar a visualização em uma grade de 2 colunas por 3 linhas, com rolagem pelo mouse a partir do sétimo item.
- [x] Manter tooltip, foco de teclado e distinção visual entre buff e condição.
- [x] Acompanhar movimentos normais dos tokens pelo evento `scene.items.onChange`, agrupado por quadro, sem polling adicional.
- [x] Recalcular o centro, alcance e trajetórias da ação pendente quando conjurador ou alvo se move.
- [x] Liberar temporariamente todas as ações e magias fora de combate, preservando o gasto de recursos e ignorando a economia de turno.

- Testes do motor: 35 aprovados, incluindo arma e magia fora de combate.
- Integração Playwright aprovou centro sincronizado após movimento normal, área transparente, grade `50px 50px`, seis itens visíveis e rolagem do sétimo.
- Captura conferida: `work/buffs-grid-esquerda-v076.png`.

## Versão 0.7.7: Empurrar e deslocamento forçado

- [x] Separar Agarrar, Derrubar e Empurrar em habilidades distintas, migrando também fichas antigas que possuíam a opção combinada.
- [x] Automatizar Empurrar com alcance de 1,5 m, CD 10 e a melhor salvaguarda entre FOR e DES.
- [x] Criar o contrato reutilizável `deslocamentoForcado`, com distância e direção para longe da origem.
- [x] Desenhar uma seta branca do alvo até seu destino previsto antes da confirmação.
- [x] Usar personagem/conjurador como origem em habilidades de alvo e o centro escolhido em habilidades de área.
- [x] Mover a ficha e o token real somente após falha na salvaguarda ou acerto da habilidade.
- [x] Sincronizar qualquer posição alterada pelo motor com o token correspondente, incluindo movimento normal, reações e empurrões.

- Testes do motor: 37 aprovados, incluindo falha, sucesso e vetores diferentes para dois alvos de uma área.
- Integração Playwright aprovou habilidades separadas, carta com FOR ou DES, três segmentos brancos da seta, distância visual de 150 px para 1,5 m e token movido ao destino previsto.
- Capturas conferidas: `work/empurrar-previa-v077.png` e `work/empurrar-resolvido-v077.png`.
- Próximo passo sugerido: detectar paredes, limites e terrenos bloqueados antes de encurtar ou cancelar o deslocamento forçado.

