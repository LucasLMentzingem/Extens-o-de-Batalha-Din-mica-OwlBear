Original prompt: Implementar ajuste de rolagens antes de ataques, grade da HUD configurável de 1 a 5 linhas, reações automáticas com janela de 20 segundos, salvaguardas pelo atributo, lista completa de períícias, HUD compactável, foco de câmera pelo carrossel e ataques de oportunidade que interrompem o movimento no ponto do acerto.

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

