Original prompt: Implementar ajuste de rolagens antes de ataques, grade da HUD configurável de 1 a 5 linhas, reações automáticas com janela de 20 segundos, salvaguardas pelo atributo, lista completa de períícias, HUD compactável, foco de câmera pelo carrossel e ataques de oportunidade que interrompem o movimento no ponto do acerto.

## 2026-11-14 — integração do PR 36 e cones ancorados 0.8.1

- O PR 36 foi revisado, validado com 127 testes, mesclado em `main` e publicado como base 0.8.0.
- A revisão do PR confirmou que ele excluía quem soprava, mas não resolvia cones com `origemArea: conjurador`: o motor ainda substituía o ponto direcional pelo próprio ator e zerava o vetor.
- Cones e linhas ancorados agora mantêm o personagem como origem geométrica e usam o ponto marcado apenas como direção.
- O Sopro de Dragão da Nikki deixou de ser assistido: aplica um buff de concentração que concede cinco ações de cone de 4,5 m (ácido, elétrico, gélido, ígneo e venenoso).
- As ações concedidas por efeitos entram dinamicamente no rodapé, desaparecem com o efeito e preservam a CD da origem, incluindo Feitiçaria Inata.
- O conjurador é excluído tanto da prévia visual quanto da resolução do motor.
- Verificação integrada: 128 testes unitários e fluxo visual Playwright com cinco variantes, cartão, direção travada e confirmação.

## 2026-11-13 — hotfix de abertura da HUD 0.7.18

- O controlador agora fecha pop-ups órfãos pelo ID antes de abrir rodapé, carrossel e demais janelas.
- A abertura das partes da HUD é independente; uma falha identifica a janela afetada sem deixar as demais silenciosamente bloqueadas.
- A inicialização limpa instâncias que tenham sobrevivido à atualização do background do Owlbear.
- Próxima pendência: corrigir regras de ocupação das mãos e equipamento inicial.

## Reações preventivas

- O gatilho `ser_atingido` pausa um ataque depois do acerto e antes da rolagem de dano.
- A resolução pendente conserva fonte, alvo, fórmula, elemento e estado crítico sem expor esses dados no estado público.
- `reduzir_dano` rola a reação, retoma o dano com o controlador original e aplica apenas o restante.
- Recusar ou deixar o temporizador terminar também retoma automaticamente a rolagem de dano.
- Integrado ao pacote das sete fichas.

## Modificadores e dano persistente

- Rerrolagens completas de d20 podem ser escolhidas na página de resultado e cobram o recurso somente quando usadas.
- `conceder_dado` entrega um modificador temporário a outro ator; ele aparece bloqueado no ajuste, combina a fórmula com o d20 e some quando escolhido.
- Efeitos podem declarar dano persistente condicionado à origem e às tags do ataque, com aplicação automática e crítica da campanha.
- A base cobre Pontos de Sorte, Inspiração de Bardo e Marca do Predador; decisões após uma falha conhecida e rerrolagem de dados individuais ainda serão ampliadas.
- Integrado ao pacote das sete fichas.

## Formas de área

- O motor aceita círculo, quadrado, cone e linha com dimensões declaradas no JSON.
- Cone e linha usam direção, projeção e largura; quadrados usam o centro escolhido.
- A HUD desenha polígonos correspondentes e lista os participantes realmente contidos antes da confirmação.
- Salvaguardas, dano, efeitos e deslocamento forçado reutilizam a mesma lista geométrica.
- Integrado ao pacote das sete fichas. A suíte completa possui 64 testes unitários.

## 2026-11-13 — primeira fila genérica de reações 0.7.14

- O gatilho declarativo `sofrer_dano` abre uma reação fora do turno somente durante o combate.
- A janela identifica o evento, mostra apenas opções válidas, conserva o temporizador de 20 segundos e chega ao dono da ficha ou ao GM responsável pelo NPC.
- Reações podem executar ataque ou salvaguarda, aplicar dano e efeito, cobrar reação e outros recursos e então devolver o controle à mesa.
- Salvaguardas da reação são encaminhadas ao controlador do alvo, não ao controlador de quem reagiu.
- Vários alvos atingidos pela mesma área entram numa fila e respondem em ordem; a próxima reação abre depois de resolver ou recusar a atual.
- A fila ainda não é exposta no estado público antes de cada reação ficar ativa.
- Testes: 57 unitários e fluxo visual Playwright com o pop-up de Repreensão Diabólica.

## 2026-11-13 — ataques encadeados e pré-requisitos 0.7.13

- O JSON pode exigir ataque ou acerto anterior, tags do golpe anterior, novo alvo próximo e diferente e uso único por turno.
- A HUD bloqueia habilidades dependentes até o requisito básico de turno ser cumprido.
- Sequências declarativas executam perfis diferentes de ataque e dano dentro de uma única habilidade, cobrando a ação apenas uma vez.
- Cada golpe registra seu próprio alvo, tags, acerto, elemento, crítico e dano; isso alimenta habilidades seguintes como ataque com a mão secundária e Destruidor de Hordas.
- O esquema de importação valida que uma sequência possua exatamente um alvo selecionado para cada perfil de ataque.
- Testes: 55 unitários e regressão visual Playwright do fluxo completo de dano adicional/rerrolagem.

## 2026-11-13 — gatilhos após acerto e rerrolagem 0.7.12

- Habilidades `apos_acerto` passam a ser oferecidas somente depois que o ataque acerta e antes de confirmar o dano.
- A habilidade válida brilha na barra; quando selecionada, seu dado aparece bloqueado e em cor própria no ajuste.
- O Dice+ recebe dano base e danos adicionais simultaneamente, mantendo os resultados separados.
- Custos dos dados adicionais são cobrados somente ao confirmar a rolagem; ignorar a habilidade preserva o recurso.
- Críticos usam a regra da campanha e acrescentam um dado também ao aprimoramento aplicável.
- Aprimoramentos podem pedir salvaguarda após o dano e aplicar condições, como Amedrontado.
- Recursos `apos_rolagem_dano` aparecem no resultado, habilitam **Rerrolar** e retornam à tela de ajuste.
- Dano base e parcelas adicionais do mesmo ataque contam como uma única fonte para a salvaguarda de concentração.
- Testes: 52 unitários e um fluxo visual Playwright completo.

## 2026-11-13 — alcance global 0.7.11

- Todo ataque, magia, item e habilidade passa a ter alcance de seleção limitado a 18 m.
- O limite também corrige fichas JSON antigas durante a importação.
- Áreas mantêm seu raio original; apenas a distância até o centro escolhido é limitada.

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

## Versão 0.7.8: habilidades fora de combate

- [x] Impedir que atualizações da sala na fase de preparação fechem a seleção de uma habilidade recém-aberta.
- [x] Restaurar a apresentação de ação, ação bônus, reação e deslocamento quando o combate é encerrado.
- [x] Preservar o uso livre fora de combate: a economia de turno não é consumida, mas espaços e demais recursos continuam sendo gastos.
- [ ] Retomar o mapeamento SRD 5.2.1 de recursos de personagens até o nível 10.

## Versão 0.7.9: economia livre na HUD

- [x] Ignorar ação, ação bônus e reação ao calcular disponibilidade de habilidades fora de combate.
- [x] Continuar bloqueando custos reais de recursos, como espaços de magia, foco e Pontos de Feitiçaria.
- [x] Mostrar `∞ ação · ∞ bônus · ∞ reação` no cabeçalho enquanto o combate estiver parado.

## Em desenvolvimento: módulos de combate das sete fichas

Meta atual: construir primeiro os módulos reutilizáveis, depois configurar as skills e finalmente importar as sete fichas de jogadores para testes integrados.

## 2026-11-13 — sete fichas integradas e catálogo configurado 0.7.15

- [x] Converter e validar Dragoberto, Draven Thorne, Hannah Montana, Loteria, Nikki Lauda, Skimi e Zurich no formato próprio da extensão.
- [x] Carregar as sete fichas juntas no simulador e no controle do mestre.
- [x] Automatizar economia adicional, cura própria, Disparada, Desengajar, Esquivar e recuperação de recursos.
- [x] Configurar Surto de Ação, Recuperar Fôlego, Defesa Paciente, Passo do Vento, Metabolismo Incomum e Pico de Adrenalina.
- [x] Configurar manobras, dados concedidos, rerrolagens, condições, concentração, áreas e reações das fichas.
- [x] Automatizar ações comuns mensuráveis, como ataques desarmados, Agarrar e Derrubar.
- [x] Manter ilusões, familiares, telepatia e decisões narrativas como resolução assistida pelo mestre.
- [x] Criar **Conteúdo configurado**, com classes e nível coberto, raças, comuns, itens e módulos em seções retraídas com contadores.
- [x] Gerar o catálogo a partir das próprias fichas para evitar divergência manual.

- Testes do motor: 64 aprovados.
- Validação visual Playwright aprovada para o catálogo e o carregamento simultâneo das sete fichas.
- Capturas conferidas: `work/conteudo-configurado-v0715.png` e `work/sete-fichas-v0715.png`.

### Núcleo de condições, duração e concentração

- [x] Criar catálogo normalizado de condições e suas restrições de combate.
- [x] Aplicar vantagem/desvantagem, falhas automáticas e críticos corpo a corpo derivados das condições.
- [x] Criar duração por evento: início/fim do turno do alvo ou da origem.
- [x] Criar concentração genérica com uma única concentração por personagem.
- [x] Remover efeitos vinculados ao trocar, falhar ou encerrar a concentração.
- [x] Pedir salvaguarda de CON ao sofrer dano e encerrar concentração a 0 PV.
- [x] Mostrar concentração na HUD e na ficha, com comando para encerrá-la.
- [x] Preservar efeitos e concentração ao simplesmente encerrar o modo de combate.

- Testes do motor: 43 aprovados.
- Cliente de jogo carregado sem erros; captura inicial conferida em `work/condicoes-v0710/shot-0.png`.
- Próximo módulo: cura, PV temporários, estado de 0 PV e salvaguardas contra a morte.

### Versão 0.7.16: Inventário e Livro de Habilidades

- [x] Criar navegação entre Ficha de personagem, Inventário e Livro de Habilidades.
- [x] Inventário com dez slots de equipamento, grade 5 × 5 expansível, pilhas, PO e carga.
- [x] Aplicar dinamicamente CA, PV máximo, deslocamento, ações de arma e habilidades concedidas pelos equipamentos.
- [x] Travar troca gratuita durante combate e cobrar 1 ação para equipar, desequipar ou consumir.
- [x] Adicionar aba Itens à HUD de combate.
- [x] Livro de Habilidades com páginas Classe, Comum e Reações.
- [x] Organizar magias do maior círculo para o menor, com truques e passivas em seções próprias.
- [x] Implementar preparação de magias e ativação de passivas e reações pelo botão direito.
- [x] Usar as capturas de BG3 fornecidas como referência de hierarquia e estados.

- Testes do motor: 69 aprovados.
- Validação visual Playwright aprovada para dez slots, grade 5×5, menu contextual, páginas do Livro e preparação.
- Capturas conferidas: `work/inventario-v0716.png` e `work/livro-habilidades-v0716.png`.

Especificação detalhada: `outputs/aventura DnD/Extensao-Owlbear/Expansao-Ficha-Inventario-Livro-Habilidades.md` no projeto principal.

### Versão 0.7.19: ocupação de mãos, Livro e catálogo do Victor

- [x] Migrar pilhas de armas para itens individuais e equipar primeiro a arma com maior bônus de ataque.
- [x] Equipar as duas adagas da Nikki, uma em cada mão, mantendo a lança guardada.
- [x] Fazer armas de duas mãos ocuparem mão forte e mão fraca ao mesmo tempo.
- [x] Corrigir equipar e desequipar pelo menu de contexto do botão direito.
- [x] Igualar a grade do Livro de Habilidades aos ícones 50 × 50 da HUD e reutilizar os balões detalhados.
- [x] Substituir o rótulo genérico “Classe” pelo nome real da classe da ficha.
- [x] Classificar vestes, armaduras e escudos; veste comum não bloqueia Armadura Arcana, mas armaduras e escudos bloqueiam.
- [x] Suportar CA base com atributo, limite de atributo e bônus de escudo.
- [x] Configurar os 24 itens comuns da Ferraria de Victor com preços, slots, mãos, CA e modelos de ataque.
- [x] Incluir os itens do Victor na página Conteúdo configurado.

- Testes do motor: 72 aprovados.
- Validações visuais Playwright aprovadas para inventário, clique direito, Livro de Habilidades e catálogo.

### Versão 0.7.20: reinicialização real da HUD

- [x] Remover registros antigos da ferramenta de mira antes de recriá-la após F5 ou atualização.
- [x] Impedir que IDs de ferramenta preservados pelo Owlbear interrompam o controlador antes do rodapé e do carrossel.
- [x] Exibir uma notificação visível se a inicialização da HUD falhar novamente.

### Versão 0.7.21: grade ampliada e buffs transparentes

- [x] Ampliar a largura máxima e a altura útil do rodapé para dar mais espaço à grade de habilidades.
- [x] Separar buffs, condições e concentração em uma camada própria à esquerda do rodapé.
- [x] Remover o painel escuro que ocupava os espaços vazios entre os ícones de efeitos.
- [x] Manter o conjunto de buffs centralizado e independente da quantidade de linhas da grade.

- Testes do motor: 72 aprovados.
- Validação Playwright aprovada para a grade ampliada e a transparência dos efeitos.

### Versão 0.7.22: buffs legíveis, escudos e carga real

- [x] Deixar os ícones de buffs e condições com 100% de opacidade.
- [x] Abrir a descrição completa do efeito em um balão independente, amplo e sem recorte.
- [x] Separar camisa de malha e escudo dos soldados em dois itens equipáveis.
- [x] Calcular CA 14 com camisa de malha e CA 16 somente quando o escudo estiver equipado.
- [x] Migrar automaticamente soldados já carregados sem perder o estado do encontro.
- [x] Atribuir pesos realistas aos itens legados dos sete jogadores e dos soldados.
- [x] Exibir os balões do inventário com o mesmo padrão visual dos balões de habilidades.
- [x] Posicionar a barra vertical de deslocamento à direita do botão Mover, inclusive em telas estreitas.

- Testes do motor: 73 aprovados.
- Validações Playwright aprovadas para rodapé, buffs, inventário, escudo, pesos e Livro de Habilidades.

### Versão 0.7.23: grade de uma linha e opções realmente disponíveis

- [x] Aumentar ligeiramente a altura do rodapé quando a grade usa uma linha, preservando os 50 px dos ícones e a barra de rolagem.
- [x] Reaplicar em encontros persistidos o vínculo entre ataques e o item de origem.
- [x] Exibir golpes somente das armas atualmente equipadas; a lança guardada da Nikki não aparece mais na HUD.
- [x] Confirmar que a HUD oferece somente magias preparadas, sempre preparadas e truques.

- Testes do motor: 75 aprovados, incluindo migração de encontro antigo, arma guardada e preparação de magias.
- Cliente Playwright executado sem erros novos; a inspeção visual final da HUD permanece vinculada ao popover do Owlbear.

### Versão 0.7.24: controle central de fichas e vínculos

- [x] Separar no painel exclusivo do mestre o Controle do combate e o Controle de fichas.
- [x] Reunir importação JSON, vínculo com tokens e vínculo com jogadores online no Controle de fichas.
- [x] Adicionar “Configurar” à lista de combate para levar diretamente ao vínculo do participante.
- [x] Mostrar o token selecionado no mapa e permitir ligá-lo a uma ficha ainda sem token.
- [x] Permitir o mesmo vínculo pelo menu de contexto da extensão em um token sem ficha.

- Testes do motor: 75 aprovados.
- Integração Playwright aprovada para sete fichas, upload JSON, tokens selecionados, jogadores online e vínculo pelo menu de contexto.
- Capturas conferidas: `work/controle-fichas-v0724.png` e `work/contexto-vinculo-v0724.png`.

### Versão 0.7.25: hotfix de inicialização da HUD

- [x] Impedir que uma falha temporária ao registrar a ferramenta de mira encerre o controlador do rodapé e do carrossel.
- [x] Tornar o registro do menu de contexto idempotente após atualizações da extensão.
- [x] Versionar as entradas do background, painel, HUD, CSS e menu de contexto para evitar arquivos antigos no cache do Owlbear/Chrome.
- [x] Preservar a HUD funcional mesmo quando a ferramenta de mira falha durante a inicialização.

- Testes do motor: 75 aprovados.
- Integração Playwright aprovada em inicialização normal e com falha simulada da ferramenta de mira.
- Captura conferida: `work/rodape-v0717.png`, com carrossel, rodapé, recursos, habilidades e efeitos visíveis.

### Versão 0.7.17: Rodapé tático por recursos

- [x] Transformar ação, ação bônus, reação, espaços de magia e demais reservas em botões quadrados.
- [x] Esmaecer recursos gastos e mostrar saldo atual/máximo nos recursos com cargas.
- [x] Filtrar a grade ao clicar em um recurso, mantendo as habilidades de todas as origens compatíveis.
- [x] Reorganizar a grade central com filtros Comum, classe, Itens, Passivas e Personalizado reservado.
- [x] Manter Linhas, Perícias e Salva guarda ao lado dos recursos.
- [x] Levar Mover, saldo de metros e barra vertical de deslocamento para a direita.
- [x] Deixar a área de buffs, condições e concentração totalmente transparente.

- Testes do motor: 69 aprovados.
- Validação Playwright aprovada para recursos, filtros, perícias, movimento e efeitos.
- Captura conferida: `work/rodape-v0717.png`.

### Cura, PV temporários e estado de 0 PV

- [x] Criar automações genéricas de cura, PV temporários e estabilização.
- [x] Impedir cura acima do máximo e restaurar consciência ao recuperar PV.
- [x] Manter somente o maior valor de PV temporários e absorver dano por eles primeiro.
- [x] Diferenciar consciente, inconsciente, estável e morto.
- [x] Implementar três sucessos/falhas contra a morte, 1 e 20 naturais.
- [x] Aplicar duas falhas ao sofrer crítico inconsciente e morte por dano massivo.
- [x] Exibir PV temporários, estado e marcadores de morte na HUD.
- [x] Disponibilizar a salvaguarda contra a morte no próprio turno.

- Testes do motor: 47 aprovados.
- Próximo módulo: composição de ataques e gatilhos após acerto.

### Versão 0.7.26: equipamentos portáteis e ataques derivados

- [x] Aplicar o teto sistêmico de 18 m a ataques, magias, habilidades e modos de arremesso/distância.
- [x] Substituir ataques estáticos de armas por ações geradas somente a partir dos itens equipados.
- [x] Manter golpes desarmados livres mesmo com armas equipadas.
- [x] Recalcular atributo, proficiência, bônus de ataque, dano, tipo de dano e maestria para o portador atual do item.
- [x] Cobrir acuidade, distância, arremesso, mão fraca, duas mãos, versátil, munição e Artes Marciais.
- [x] Registrar proficiências de armas, armaduras e maestrias nas sete fichas e no soldado.
- [x] Classificar vestes sem armadura, armaduras leves, médias, pesadas e escudos; aplicar requisito de FOR das pesadas ao deslocamento.
- [x] Completar as definições das nove armas e todas as proteções, acessórios e suprimentos da Forja do Victor.
- [x] Exibir classificação e proficiência calculada nos balões do inventário.
- [x] Documentar a regra e todos os itens das sete fichas, soldados e Forja do Victor em Conteúdo configurado.
- [x] Adicionar cache-busting 0.7.26 também nas dependências internas dos módulos.

- Testes do motor: 81 aprovados.
- Fluxo visual de inventário, equipar/desequipar e Livro de Habilidades aprovado em Playwright.
- Capturas conferidas: `work/playwright-v0726/shot-0.png`, `work/playwright-v0726-carregado/shot-0.png`, `work/playwright-v0726-catalogo/shot-0.png`, `work/inventario-v0716.png` e `work/livro-habilidades-v0716.png`.
- Próxima expansão sugerida: operações de transferir, saquear e furtar reutilizando o item portátil já implementado.

### Versão 0.7.27: iniciativa conjunta e fichas materializadas

- [x] Mostrar ao jogador somente a iniciativa da ficha de PJ vinculada ao seu ID.
- [x] Mostrar ao mestre todos os jogadores e NPCs com iniciativa pendente.
- [x] Permitir selecionar qualquer subconjunto, selecionar todos ou limpar a seleção.
- [x] Enviar um único lote ao Dice+, com um d20 e ajuste independente para cada personagem.
- [x] Resolver lote parcial sem iniciar os turnos antes das iniciativas restantes.
- [x] Suportar corretamente também um lote com apenas uma ficha.
- [x] Adicionar exclusão confirmada de fichas ao Controle de fichas do mestre, limitada à preparação.
- [x] Materializar nos sete JSONs de jogadores todas as migrações atuais de inventário, mãos, ataques derivados, magias preparadas, pesos e limite de 18 m.

- Testes do motor: 86 aprovados.
- Integração simulada aprovada para visão isolada do jogador, seleção de jogadores e NPCs pelo GM, lote com duas fichas, lote restante unitário e transição para a rodada.
- Capturas conferidas: `work/iniciativa-lote-v0727.png` e `work/playwright-v0727/shot-0.png`.

### Versão 0.7.28: armas primeiro no rodapé

- [x] Colocar ataques das armas equipadas antes das ações comuns.
- [x] Ordenar armas por mão forte, mão fraca e arma à distância.
- [x] Manter o arremesso imediatamente depois do ataque normal da mesma arma.
- [x] Exibir “arremesso” no próprio botão, além do balão detalhado.
- [x] Preservar golpe desarmado e demais ações depois das armas.

- Testes do motor: 87 aprovados.
- Integração visual aprovada com as duas adagas de Nikki em `work/rodape-ordem-armas-v0728.png`.
- Próxima etapa planejada em `PLANO-DANO-RESISTENCIAS.md`: parcelas tipadas, resistências por tipo/tag, relatório de dano efetivo, múltiplos alvos e exceção visual para áreas.

### Arquitetura revisada: dano e resistências

- [x] Conferir os 13 tipos oficiais e a ordem de ajustes, resistência e vulnerabilidade no SRD 5.2.1.
- [x] Separar tipo oficial de dano das tags de origem, como lâmina, arma, mágico e não mágico.
- [x] Projetar pacotes com parcelas tipadas, efeitos defensivos filtráveis e relatório imutável por alvo.
- [x] Separar dano recebido, PV temporários absorvidos, PV perdido e excesso de dano.
- [x] Definir cores, símbolos e nomes opcionais de modelos Dice+ para cada tipo.
- [x] Confirmar que o Dice+ aceita modelos nomeados pela notação `{Modelo}`, mas não oferece na API documentada criação ou alteração direta de cores pela extensão.
- [x] Preservar a exceção de área: defesas ocultas no ajuste e aplicadas individualmente no resultado.

- Documento atualizado: `PLANO-DANO-RESISTENCIAS.md`.
- [x] Implementar catálogo, aliases, cores e símbolos dos 13 tipos.
- [x] Implementar resolvedor puro com parcelas, tags, defesas compostas, PV temporários, limiar e excesso.
- [x] Coletar defesas de ficha, passivas, equipamentos e efeitos ativos.
- [x] Aplicar o mesmo relatório ao estado para manter o PV idêntico ao resultado exibido.
- [x] Integrar ataques diretos, reações, salvaguardas, rajadas, múltiplos alvos e áreas.
- [x] Exibir defesas relevantes no ajuste direto e ocultá-las em áreas.
- [x] Exibir cada tipo com cor própria e detalhamento das defesas no resultado.
- [x] Solicitar opcionalmente modelos nomeados do Dice+, com fallback automático para os dados ativos.

- Versão preparada: 0.7.29.
- Testes do motor: 92 aprovados.
- Resultado colorido validado visualmente em `work/dano-resultado-colorido-v0729.png`.

### Próximas interações registradas

- [ ] Adicionar o filtro Truques antes de Magias no rodapé.
- [ ] Implementar cones ancorados no conjurador, orientados e travados pelo mouse.
- [ ] Migrar cones e áreas originadas no personagem nas sete fichas.
- [ ] Detectar ataques de oportunidade ao cruzar e sair de alcances ao longo de toda a trajetória.
- [ ] Suportar várias reações de oportunidade, uma por inimigo elegível, no mesmo deslocamento.

Especificação detalhada: `PROXIMAS-INTERACOES.md`.

### Versão 0.7.30: gatilhos de dano e auditoria das fichas

- [x] Tornar Queimadura de Fogo um aprimoramento opcional exibido após um acerto.
- [x] Somar 1d10 ígneo e gastar o uso somente quando o jogador confirmar o dano extra.
- [x] Implementar Atacante Selvagem no primeiro acerto com arma do turno, com duas rolagens simultâneas e escolha automática da maior.
- [x] Preservar dados extras fora da duplicação do dano base do Atacante Selvagem.
- [x] Mostrar as duas alternativas e o resultado escolhido na interface de dano.
- [x] Auditar as sete fichas Forge originais contra a progressão de nível 3 das regras 2024.
- [x] Corrigir perícias omitidas, PV/dado de Loteria, custos falsos de conversão e escolhas exclusivas do Caçador.
- [x] Recuperar as duas formas do Sopro Dracônico de Dragoberto.
- [x] Automatizar Astúcia Mágica recuperando exatamente um espaço fora de combate.
- [x] Corrigir Máscara de Muitas Faces e rituais do Tomo para não gastarem Espaço de Magia de Pacto.
- [x] Registrar Mente Desperta, Pacto do Tomo e o talento Músico.

Auditoria detalhada: `AUDITORIA-FICHAS-NIVEL-3.md`.

- Testes do motor: 96 aprovados.
- Ajuste e resultado de Atacante Selvagem/Queimadura validados visualmente em `work/atacante-ajuste-v0730.png` e `work/atacante-resultado-v0730.png`.
- Smoke test final do painel validado com o cliente Playwright em `work/playwright-v0730-final/shot-0.png`, sem novos erros de console.

### Versão 0.7.31: usos gratuitos por habilidade

- [x] Vincular cada uso gratuito diretamente à habilidade pelo campo `usoGratuito`.
- [x] Preservar na mesma habilidade o custo normal, incluindo espaços de magia.
- [x] Adicionar a aba **Usos gratuitos** somente quando a ficha possuir habilidades configuradas para ela.
- [x] Manter habilidades esgotadas visíveis e bloqueadas nessa aba, sem consumir silenciosamente o custo normal.
- [x] Mostrar no balão da habilidade o saldo atual e máximo do uso gratuito.
- [x] Nas abas Comum, Classe, Itens e Passivas, consumir primeiro o uso gratuito e depois recorrer ao custo normal.
- [x] Configurar Marca do Predador, Passos Largos, Palavra Curativa e Repreensão Diabólica nas fichas que possuem suas conjurações gratuitas.
- [x] Restaurar automaticamente a aba Comum ao trocar para uma ficha sem habilidades gratuitas.

- Testes do motor: 97 aprovados.
- Aba, contador, bloqueio por saldo e prioridade automática validados visualmente em `work/usos-gratuitos-disponivel-v0731.png` e `work/usos-gratuitos-esgotado-v0731.png`.
- Smoke test final do painel validado com o cliente Playwright em `work/playwright-v0731-final/shot-0.png`, sem novos erros de console.

### Versão 0.7.32: rolagens públicas e salvaguardas do jogador

- [x] Transmitir ajustes, estado de rolagem e resultados de ataques, danos, curas, testes e demais dados para toda a mesa.
- [x] Permitir edição e confirmação somente ao mestre e ao dono da rolagem.
- [x] Manter observadores em modo somente leitura, sem acesso a vantagem, fórmula, recursos, rerrolagem, cancelamento ou continuação.
- [x] Fechar a janela pública de todos quando um controlador autorizado conclui ou cancela a rolagem.
- [x] Proteger o canal de resposta: jogadores só podem responder às rolagens destinadas à própria conta; o mestre continua podendo intervir em todas.
- [x] Ocultar de observadores os ajustes de iniciativa e salvaguarda.
- [x] Mostrar os resultados dessas exceções em um balão compacto no centro-esquerda, incluindo lotes de iniciativa.
- [x] Encaminhar automaticamente toda salvaguarda de PJ ao dono da ficha, inclusive concentração e salvaguardas internas de habilidades.
- [x] Manter salvaguardas de NPC sob o controle do mestre e permitir que ele assuma uma salvaguarda de jogador quando necessário.

- Testes do motor e visibilidade: 99 aprovados.
- Modo observador, resultado público e anúncios compactos validados em `work/rolagem-observador-v0732.png`, `work/resultado-publico-v0732.png`, `work/anuncio-salvaguarda-v0732.png` e `work/anuncio-iniciativa-v0732.png`.
- Smoke test final validado com o cliente Playwright em `work/playwright-v0732-final/shot-0.png`, sem novos erros de console e com `render_game_to_text` sincronizado.

