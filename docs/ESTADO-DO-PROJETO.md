# Estado do projeto

## Entrega — 0.8.82 — Favoritos e status compactos — 21/11/2026

Status com ícones até 32 px e caixa até 44 px, sem elevar o rodapé. Personalizado habilitado como Favoritos, inclusão/remoção por menu de botão direito, referências locais por sala/usuário/personagem e custos/restrições preservados. 517 testes Node e verificações locais de menu, F5, modos gratuitos e regressões da HUD. Publicação autorizada pelo responsável. [Implementação e limites](FAVORITOS-E-STATUS-COMPACTOS-2026-11-21.md).

## Entrega — 0.8.81 — expansão do rodapé e plano de descanso — 21/11/2026

Guardadas a [arquitetura e decisões aprovadas do descanso curto por Dados de Vida](ARQUITETURA-DESCANSO-CURTO-DADOS-DE-VIDA.md), ainda sem implementar essa funcionalidade. Priorizada a demora ao expandir pelo retrato: cache válido de geometria/HTML dos modos, medição antecipada e remoção de close redundante. Preparada para publicação após autorização do responsável. No cenário com 120 ms por abertura simulada, média 587→277 ms; 512 testes e 66 verificações de interface aprovados, incluindo 160 cliques no canvas. [Diagnóstico, comparação e limites](FIX-LOCAL-EXPANSAO-RODAPE-2026-11-21.md).

## Entrega — 0.8.80 — B: barra flutuante de efeitos — 21/11/2026

Barra inferior esquerda entre Extras e ferramentas centrais; dez slots, scroll horizontal, caixa limitada ao conteúdo, adaptação em telas estreitas e reserva no rodapé. Artes próprias de habilidades/itens reutilizadas; 25 PNGs inéditos produzidos pelo subagente GPT 6 Luna, convertidos em WebP 100×100 (146.668 bytes), com cinco fundos e cinco molduras SVG compartilhados. Condições, concentração e estados derivados exibidos sem alterar regras/fichas; privacidade dos saldos NPC preservada. 508 testes; 21 cenários específicos B, 24 gerais, 7 de estabilidade e 8 de A com 160 cliques no canvas local. [Inventário e arquitetura](INVENTARIO-EFEITOS-B.md) · [Notas e limites](RELEASE-0.8.80.md).

## Entrega — 0.8.79 — estabilidade e latência da HUD — 21/11/2026

Corrigida a recriação explícita dos grupos em mudanças de geometria. ID/URL/documento estáveis; resize em posição fixa; quadro anterior preservado até a medição, bloqueando comandos do ator anterior. DOM incremental mantém imagens; handshake aceita o primeiro pedido mesmo antes da resposta de abertura. Cache limitado de medidas por ator/linhas, propagação de resize aos medidores e recuperação de falhas de abertura. No ensaio local de 12 trocas: média 551→176 ms, chamadas close 336→0 e nenhuma observação sem grade após a correção. 496 testes, 24 verificações gerais, 7 de estabilidade e 8 de regressão A com 160 cliques no canvas. Sem controle do navegador do responsável. [Notas e limites](RELEASE-0.8.79.md).

## Entrega — 0.8.78 — hotfix A: medição fora da camada do mapa — 21/11/2026

Removidos os popovers invisíveis `barra`/`ordem` de 1 px da 0.8.77. Agora os dois documentos de medição ficam dentro do iframe visível de Atividades, sem área própria sobre o mapa ou a interface do host. Limpeza dos IDs antigos na inicialização e recuperação; filtros e confirmações preservados quando Atividades se move. 494 testes, 24 verificações gerais e 8 cenários de regressão com 160 cliques entregues ao canvas local. SDK verdadeiro nos medidores internos; host/sala simulados. Sem controlar o navegador do responsável. A reforma B ficou somente [registrada](PENDENCIA-B-BARRA-DE-EFEITOS.md). [Notas e limites](RELEASE-0.8.78.md).

## Entrega — 0.8.77 — entrada no mapa e tema dos carrosséis — 20/11/2026

Aplicado o plano B: grupos do rodapé em popovers menores; o retângulo transparente antigo deixa de cobrir o mapa. Limite de 1120 px, linha de recursos, ordem dos controles e artes preservados. Carrossel de turnos e ferramentas GM com o mesmo tema flutuante. Janelas novas recebem somente HTML e metadados locais, sem importar catálogo/fichas. 494 testes e 19 verificações de navegador com GM/jogador e SDK simulado aprovados. A captura final de eventos pelo host autenticado continua sendo a validação na mesa real. [Notas e limites](RELEASE-0.8.77.md).

## Entrega — 0.8.76 — largura máxima da HUD — 20/11/2026

Restaurado o teto antigo de 1120 px, também na estimativa inicial; viewport/carta podem impor um limite menor. Recursos completos continuam no cálculo, com rolagem quando não couberem. O responsável restringiu esta revisão à largura, adiando plano B e tema dos carrosséis. [Notas](RELEASE-0.8.76.md).

## Entrega — 0.8.75 — HUD flutuante — 20/11/2026

Sem placa verde, moldura externa, divisor ou log inferior. Largura por conteúdo da grade, recursos completos e controles; altura medida sem faixa vazia. Token focaliza a peça. 488 testes e 19 verificações de navegador com SDK simulado. O responsável validará a captura dos espaços transparentes no Owlbear; se necessário, plano B de grupos em janelas menores. [Notas](RELEASE-0.8.75.md).

## Entregas recebidas — 0.8.73 e 0.8.74

Reações preventivas de Escudo Arcano/Veste na Gaveta, com retomada sem cobrança dupla, e anulação de Mísseis Mágicos protegidos sem rolar seus dados. [0.8.73](FIX-REACOES-ESCUDO-VESTE-0.8.73.md) · [0.8.74](FIX-ESCUDO-MISSEIS-0.8.74.md). Baseline da retomada: 482 testes.

## Entrega — 0.8.72 — CA base + extra, migração e salvamento — 18/11/2026

Revisão da PR #78: base da armadura ou regra sem armadura/traço; todos os bônus em CA extra, inclusive manual. Removido ajuste automático criado para conservar total antigo, reparadas fichas v1 e dados da 0.8.71, variantes mágicas antigas e salvamento compacto pelo jogador. Sem reimportação de fichas. 472 testes e 18 cenários de interface em duas sessões com SDK simulado. [Notas e limites da verificação](RELEASE-0.8.72.md).

## Entrega — 0.8.70 — confirmação e área do movimento dinâmico — 18/11/2026

Clique/duplo clique só selecionam; execução exclusiva pelo botão da instância. Círculo de deslocamento ao ativar, atualizado com o saldo e sem acompanhar o cursor. Destinos fora do círculo ou sem saldo suficiente são recusados. Nove cenários de navegador com SDK simulado, incluindo regressão completa das etapas e recarga. [Notas](RELEASE-0.8.70.md).

## Entrega — 0.8.69 — trajetória após clique — 18/11/2026

Movimento dinâmico sem atualização ao passar o cursor. Trajeto e custo são definidos após clicar; plano de habilidade permanece visível e estável até confirmar. Mecânicas da 0.8.68 preservadas. Oito cenários GM/P1 com verificações de cursor antes/depois do clique. [Notas](RELEASE-0.8.69.md).

## Entrega — 0.8.68 — movimento dinâmico — 18/11/2026

Botão acima de Mover, clique para andar e aproximação automática em linha reta para habilidades. Custo em metros na carta; oportunidades e zonas resolvidas antes da habilidade, com interrupção sem consumir seus recursos. Etapas persistentes, recuperação sem repetir rolagens/custos e cancelamento com limpeza de continuação. 451 testes, oito cenários GM/jogador e 12 layouts conferidos com SDK simulado. Publicação autorizada. [Notas](RELEASE-0.8.68.md).

## Entrega — 0.8.67 — alcance pela hitbox — 18/11/2026

Alvos passam a contar pelo contato de sua hitbox circular com alcance/área. HUD, motor, composições, protótipos e zonas compartilham a regra; Sopro de Dragão preservado. 439 testes e sete cenários GM/jogador completos conferidos com SDK simulado. Publicação autorizada; detalhes em [RELEASE-0.8.67.md](RELEASE-0.8.67.md) e [FIX-ALCANCE-HITBOX.md](FIX-ALCANCE-HITBOX.md).

## Entrega — 0.8.66 — 18/11/2026

Atalhos diretos às três abas da ficha, retrato com token vinculado e buffs compactos sem scroll horizontal. GM/P1, dez aberturas de abas e 24 combinações de efeitos conferidos; publicação autorizada. [Notas e validação](RELEASE-0.8.66.md).

## Entrega — 0.8.65 — 18/11/2026

Ícones de perícias/salvaguardas sem véu no rodapé, balão e carta. Rolagens acima da instância, ambas com margem direita de 75 px; divisão de altura em telas baixas. Layout atualiza durante espera da jogada. Custo/recursos atuais e permanência da carta da 0.8.64 preservados. [Notas e validação](RELEASE-0.8.65.md).

## Entrega — 0.8.64 — 18/11/2026

Custo/recursos atuais nas instâncias; carta preservada durante rolagens e salvaguardas filhas. Dados ao lado quando há espaço; controles de execução bloqueados durante a jogada. Publicação autorizada pelo usuário. [Notas e validação](RELEASE-0.8.64.md).

## Entrega — 0.8.63 — 18/11/2026

Fundos das letras removidos dos recursos; custos nas habilidades com o mesmo padrão do rodapé; Aa sincronizado entre janelas. Atividades aberta/recolhida sempre acima do rodapé. Imagens WebP anteriores reutilizadas. 426 testes e 12 combinações de layout verificadas. [Notas e limites](RELEASE-0.8.63.md).

## Entrega — 0.8.62 — 18/11/2026

Ícones dos recursos aplicados com fundo e moldura compartilhados; título/saldo sobre a arte, saldo sempre visível com Aa desligado. 37 WebP 100×100 somam 168.080 bytes. Originais fora de site; imagens com hash de conteúdo. Publicação autorizada pelo usuário. [Notas e validação](RELEASE-0.8.62.md).

## Entrega — 0.8.61 — 18/11/2026

Correções autorizadas dos dois bugs de HUD e todos os ajustes locais acumulados. Rodapé/cache unificados, controlador único, mensagens tipadas, iframe estável, limpeza de mira e recuperação acessível ao jogador. Aa nos recursos, atividades centrais com filtros Salvaguardas/Ataque e descanso somente para PJs vivos independentemente da participação na iniciativa. 426 testes e cenários de navegador aprovados; SDK/Dice+ simulados. Ver [notas e limites](RELEASE-0.8.61.md).

## Entrega — 0.8.60 — 18/11/2026

Fix do plano de Atividades da mesa, com publicação autorizada após a validação de 415 testes e 26 cenários de integração. Baseline 0.8.59 congelada antes das alterações; comparação e evidências entregues no chat em `outputs/fix-mesa`. Ver [notas da versão](RELEASE-0.8.60.md).

Revisão de 17 de novembro de 2026, versão **0.8.59**, linha travada em 0.8.x até 0.8.99.

## Entrega — 0.8.59

- Novo grupo Treino com Saco de Pancadas: CA 1, 500 PV, sem resistências, imunidades, ataques ou loot. Objeto, sem elegibilidade para Animar Mortos.
- Token de couro com transparência, sem moldura de moeda; Criar token desta ficha usa o PNG próprio com uma célula de 1,5 m. Arte e fallback anteriores preservados.
- Ficha/PNG/prompt/ZIP entregues. 394 testes e fluxo de criação em navegador com SDK simulado; não testado em sala real.

## Entrega — 0.8.58

- Animar Mortos transforma imediatamente ao executar, sem minuto de espera ou concentração. Uma ação em combate e um espaço; mantém outra concentração. Painel do mestre segue o mesmo fluxo.
- Temporizadores antigos descartados sem custo extra; Prece conserva dez minutos. Token, sobreposição, loot, defesas dos zumbis e Sopro de Dragão preservados.
- 391 testes e confirmação visual do uso imediato pela HUD com SDK simulado.

## Entrega — 0.8.57

- Excluir ficha individual e grupo inteiro na lista de grupos importados, com confirmação e validação de revisão/identidade. Último modelo remove o grupo vazio.
- Exclusão apenas da biblioteca: unidades em cena, tokens, loot e JSONs originais preservados. Grupos embutidos continuam disponíveis.
- 390 testes; ensaio visual em Chromium com SDK simulado: exclusão seguida de Animar Mortos pela HUD e conclusão pelo botão 1 Min. Token Zumbigoblin e sobreposição 15 PV/CA 8 confirmados; imagem de evidência entregue. Não testado em sala real.

## Entrega — 0.8.56

- Drow e Padre Quevedo com habilidades identificadas como protótipos no catálogo visível; seleção de alvos/escolhas, custos, efeitos e concentração integrados.
- Animar Mortos pela própria skill: corpo humanoide a 0 PV ou menos, um minuto de conjuração, slot na conclusão, sobreposição/token/loot preservados. Goblin marcado vira Zumbigoblin.
- Escudo preventivo, efeitos dos raios e toque, Enfraquecimento, vampirismo, Auxílio, Restauração, Prece, Santuário, Dissipar e demais habilidades descritos em [Funcionamento e limites](PROTOTIPOS-HABILIDADES-CEMITERIO.md).
- Zumbis: radiante ×2 e necrótico ×¼, inclusive nas camadas e em fichas já importadas; imunidade a veneno preservada.
- 384 testes e fluxo de HUD com SDK simulado; duas fichas e ZIPs atualizados. Sopro de Dragão e adagas preservados.

## Entrega — 0.8.55

- Revenda das duas adagas finais ajustada para 1.260 PO cada (preço-base 1.800 PO), perto dos 1.300 PO do colar. A inicial mantém revenda 245 PO.
- Artes finais refeitas a partir da adaga inicial, mantendo guarda, cabo, pomo e silhueta; variações sagrada e vermelho-sangue. PNGs transparentes com caminhos novos para renovar cache.
- 340 testes aprovados e valores de revenda conferidos no motor.

## Entrega — 0.8.54

- Reanimação troca automaticamente a imagem do token pelos PNGs fornecidos de Zumbi e Zumbigoblin, ambos com uma célula de 1,5 m.
- Imagem, escala e alinhamento originais resguardados; remoção da camada restaura o visual, preservando posição e vínculos. Recuperação por metadata após recarga/falha do SDK.
- 340 testes aprovados, incluindo 154 ataques cruzados entre 11 fichas novas e sete aventureiros, além de cura/Bênção e sincronização de tokens. SDK simulado; sala real ainda não validada.

## Entrega — 0.8.53

- Concluídas as artes das sete fichas: 173 identidades disponíveis, zero pendentes, mais variantes de itens. Corrigidas associações antigas e as duas conversões de Fonte de Magia.
- Publicadas as artes de Skimi, Zurich, Dragoberto e Hannah; revisão para uma figura humanoide por arte nas cenas refeitas. Herança Dracônica agora inclui o PNG gerado no pacote.
- Reanimação aplica sobreposição com ficha original resguardada e inventário único. Humanoide morto recebe Zumbi; goblin marcado da aventura recebe Zumbigoblin. Remoção e exportação da original disponíveis ao mestre; saque após a segunda morte preserva o loot restante.
- Grupo importável com 11 fichas em `conteudo/aventura-no-cemiterio/` e ZIP público. Quatro itens de missão com artes; desfecho da adaga preserva instância e posse.
- Padre: cura e Discípulo, Bênção, Escudo da Fé e Canalizar Divindade; demais efeitos complexos assistidos. Descanso habilitado para padre/necromante NPC. [Detalhes](PROTOTIPO-SOBREPOSICAO-CEMITERIO.md).
- 325 testes automatizados aprovados. Fix publicado de Sopro de Dragão preservado; validação em sala real ainda pendente.

## Entrega — 0.8.52

- Sopro de Dragão usa composição de efeito: escolher um único elemento e beneficiário na conjuração. O sopro concedido mantém o elemento, CD da origem, concentração e duração de dez rodadas/60 segundos; círculos superiores acrescentam 1d6 por círculo.
- Em si mesmo, a opção concedida fica imediatamente após a magia na Classe. Em outro beneficiário, fica em Comum. Ambos também mostram a opção em Usos gratuitos, cobrando uma Ação por sopro e nenhum novo espaço.
- Buffs antigos sem elemento salvo são limitados à primeira variante existente (ácido no catálogo antigo); para escolher outro elemento é preciso conjurar novamente.
- Incluídas as 31 artes concluídas de Nikki, oito artes recuperadas de Skimi e o novo Saquear com bolsa em destaque. Loteria, Draven e Nikki estão completos no mapa visual; 41 artes globais continuam pendentes.
- 310 testes automatizados aprovados. Validação na sala real permanece pendente.

## Entrega — 0.8.51

- Publicada a organização por fichas das artes de habilidades. Loteria (Monge) e Draven estão completos no mapa visual: não têm arte pendente de geração.
- 44 artes individuais novas cobrem as habilidades exclusivas dessas fichas e as ações/perícias compartilhadas entre elas; cada arte é transparente, 500×500 e registrada uma única vez no catálogo central.
- A lista global ainda mostra 80 artes pendentes para as demais fichas; Nikki, Zurich, Skimi, Dragoberto e Hannah continuam na fila por personagem.
- Inclui a organização paginada/recolhível do Controle do Mestre e os ajustes de histórico de atividades e visibilidade de PV feitos nesta branch.
- A publicação automática executa a suíte de integração configurada no GitHub Actions. O mapa atualizado está em `docs/arte/habilidades-sete-fichas.json`.

## Ajuste local — histórico e PV de inimigos

Resultados de dano ocultam saldos de PV dos NPCs para jogadores e mantêm os dados completos para GM. Somente execuções entram na barra histórica; cancelar remove a atividade e descarta atualizações atrasadas. 308 testes passaram, incluindo interface com SDK simulado. Ainda não publicado.

## Próxima entrega local — organização do mestre

Quatro páginas internas e listas recolhíveis por grupo nas páginas de combate e fichas; Aventureiros sempre primeiro. Origem do grupo persistida inclusive para NPCs duplicados. 305 testes passaram. [Detalhes](CONTROLE-MESTRE-PAGINAS.md). Ainda não publicado.

## Ajuste de interface — 0.8.50

- Cancelar/concluir a própria atividade deixa a tela sem seleção automática do histórico. Recolher a barra também limpa a inspeção antiga.
- Inspeções de GM e jogadores são somente leitura e mostram Fechar na instância e no resultado, voltando à barra. Fechar uma inspeção não cancela uma ação própria pausada.
- A seta para abrir permanece disponível sem seleção/histórico. Com instância fica à esquerda dela; sem instância fica junto à borda direita. A barra aberta possui seta na sua borda esquerda para recolher à direita. O brilho de atividade permanece.
- Instâncias e miniaturas dos balões não sobrepõem nomes às imagens. Pós-acerto e rerrolagens exibem o nome fora da imagem, abaixo dela; ajuste de rolagem tem mais espaço.
- 302 testes automatizados aprovados. Navegador com SDK simulado confirmou Fechar, ausência de Executar/Cancelar no histórico, retorno à barra, seta na borda, rascunhos preservados e nome pós-acerto abaixo do ícone. Falta validação na sala real. Integrado à publicação 0.8.50.

## Entrega atual

A 0.8.49 reúne os quatro avanços preparados depois da 0.8.48:

- **Saque:** pegar e equipar fecha apenas o loot do chão esgotado. Em baú/recipiente, retira a unidade e mantém a janela aberta, mesmo quando o recipiente fica vazio.
- **Barra de Atividades:** histórico horizontal à direita, teste/dano e retrato, seleção por clique e abertura por duplo clique. A própria ação tem prioridade; ocultar preserva alvos, composição e rascunho, e concluir restaura o modo anterior. Histórico local de sessão, sem persistir ao recarregar. [Contrato e limites](BARRA-ATIVIDADES.md).
- **Loteria/compositor:** Golpe Desarmado unificado com modos de Ação Bônus e Ação, até dois alvos e custo agregado. Torrente mantém os dois golpes e pode acrescentar um terceiro por Ação; Mão de Cura substitui somente um dos dois originais. **Mão de Dolo saiu de todos os modos preparados**, por pedido posterior do responsável; continua oferecida após acerto elegível, com Foco e limite compartilhado. [Contrato](COMPOSICAO-GOLPES-DESARMADOS.md).
- **Metabolismo Incomum:** escolha ao rolar iniciativa, individual, em lote ou como reforço; sem cronômetro e sem custo de Reação. Só oferece com uso e benefício disponível. Recupera Foco e rola 1d6+3 de cura no nível 3. Ativação direta pela barra é bloqueada no cliente e no motor. O dono decide; o mestre assume sem dono conectado. A iniciativa inicial aguarda as escolhas antes de iniciar os turnos. [Contrato](METABOLISMO-INICIATIVA.md).
- **Pico de Adrenalina:** conferidos Correr com Ação Bônus, 2 PV temporários e dois usos recuperáveis em descanso curto ou longo para Loteria de nível 3; descrição central esclarecida.

Fichas salvas são normalizadas a partir do catálogo central; essas mudanças não exigem apagar/reimportar as sete fichas. Nenhuma imagem nova foi gerada nesta entrega.

## Base integrada

A base preserva as contribuições dos PRs #66–#74 e as correções posteriores. A conexão e recuperação de estado da 0.8.45 foram integradas na 0.8.46. O saque/arremesso recebeu menus, geometria de seleção e criação de loot em ATTACHMENT acima dos personagens. A 0.8.48 corrigiu RateLimitHit: comparação de campos, gravações em lote e uma única fila com espera progressiva; 50 sincronizações estáveis não gravam a cena. [Investigação e estresse](FIX-RATELIMIT-LOOT.md).

Mantidos: escala compartilhada de 1,5 m por célula, posições contínuas e distância euclidiana; áreas com medidas do livro; itens portáteis com efeitos derivados do portador; invocações vinculadas e zonas persistentes; defesa por tipo de dano; grupos de fichas e comércio com dinheiro/carga validados. As decisões #1/#2 permanecem intencionais. As regressões #4, #63, #64 e #65 estão fechadas no GitHub.

## Validação da publicação

- **301 testes automatizados passaram** na suíte completa executada pelo workflow de publicação.
- Catálogo consistente: 260 habilidades, 120 itens e duas lojas; versão/cache sincronizados.
- Navegador headless com SDK/Dice+ simulados: Barra de Atividades e rascunhos, golpes/custos no compositor, Metabolismo sem relógio, barra bloqueada, cura e Foco sem gastar Reação.
- Estresse do reconciliador: 1.000 recipientes/2.000 peças, operações em lote, repetição idempotente e recuperação após falha simulada.
- Esses resultados **não substituem a conferência em uma sala real**. O responsável informou que saque/equipar já funcionavam; a nova regra de permanência e os fluxos novos ainda precisam ser conferidos após instalar a 0.8.49.

## Ponto de retomada

1. Conferir na sala real a Barra de Atividades com dois clientes, prioridade própria, pausa/retomada, rascunhos, resultados e permissões.
2. Conferir Loteria: Golpe Desarmado Ação/Bônus, Torrente com terceiro golpe, Mão de Cura, Mão de Dolo somente pós-acerto, Metabolismo pelo jogador e pelo mestre quando ausente; confirmar custos/recargas.
3. Conferir saque/equipar em baú versus item único e repetir arremessos/depósitos com vários clientes. A #76 separa implementação entregue do estresse real ainda pendente.
4. Encerrar os aceites visuais das sete fichas nas issues #56–#62 e atualizar a auditoria #39 com evidência. Não declarar toda a etapa de nível 3 concluída por passar a suíte atual.
5. Retomar os contratos gerais de M02/M03/M04: ordenação/interceptação genérica, escolhas declarativas e reserva condicional de custos/Smites. Os custos por modo implementados são um avanço parcial, sem fechar o M04 inteiro.
6. Seguir [módulos pendentes](MODULOS-PENDENTES.md) e [roadmap](../ROADMAP-COBERTURA-REGRAS.md): nível 3, depois 5, 7 e 10. A fila de imagens continua congelada na #75 até nova ordem.

## Documentação para contribuir

- [Manual de criação de fichas JSON e grupos](MANUAL-CRIACAO-FICHAS.md).
- [Matriz de testes das sete fichas](TESTES-SETE-FICHAS-NIVEL-3.md).
- [Arquitetura M04](ARQUITETURA-M04-COMPOSITOR-ACOES.md) e [Gaveta](MODULO-GAVETA-COMPOSICAO.md). Direcionamentos históricos de Mão de Dolo preparada foram superados pelo contrato da 0.8.49.
- [Notas 0.8.49](RELEASE-0.8.49.md) e [política de versões](../VERSIONING.md).

O histórico detalhado das versões anteriores está nos commits e nos relatórios específicos. Preserve progresso de outros contribuidores ao integrar; fetch antes de publicar e execute o mesmo conjunto de testes do workflow.
