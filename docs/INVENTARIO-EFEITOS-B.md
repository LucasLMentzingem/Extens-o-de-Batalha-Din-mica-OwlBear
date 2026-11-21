# B — inventário e arquitetura da barra de efeitos

Atualização 0.8.80, em 21/11/2026. Levantamento do catálogo central, fichas validadas, condições do motor, geração de efeitos em engine.mjs e prototipos-cemiterio.mjs. A exibição é uma projeção local: não muda condições, regras, fichas ou loot.

## Posição, tamanho e entrada

A barra sai da lateral do retrato e fica no canto inferior esquerdo, após Extras e antes da barra central de ativos/ferramentas do Owlbear. Uma única linha, caixa limitada ao conteúdo e dez posições visíveis; a partir do 11º efeito há scroll horizontal. Em 1920 px são dez ícones de 60 px; em 1366 px, dez de 35 px. A caixa de um único efeito tem só uma posição, sem superfície invisível cobrindo outras nove.

Quando a faixa entre os controles nativos não comporta dez ícones utilizáveis, a barra sobe acima deles e distribui os dez slots na largura disponível. O rodapé se ajusta para não cobrir os efeitos. Atividades continua acima do rodapé. O cálculo usa uma reserva central de 420 px, compatível com a referência enviada; não há API para ler os retângulos privados das ferramentas de outras extensões. Validar outras disposições de barras na mesa real.

## Camadas e semântica

| Tipo | Aparência | Sinal adicional |
|---|---|---|
| Buff | fundo verde profundo, metal dourado, borda em escudo/folhas | + |
| Debuff | fundo vinho, metal cobre, recortes e espinhos | − |
| Condição prejudicial | fundo âmbar queimado, cantos chanfrados | ! |
| Concentração | fundo azul profundo, prata e curvas trançadas | ◉ |
| Marcador neutro | fundo violeta grafite, borda prateada discreta | • |

Invisível usa o tema benéfico. Expulsão e restrições prejudiciais não herdam a classificação buff de alguns protótipos. Prece já recebida e conjuração em curso são marcadores neutros. Nome curto sobre a arte, sem faixa opaca; Aa alterna o nome e conserva os contadores. Duração/saldo ficam legíveis e a dica apresenta descrição, modificadores e término. A barra conserva nós, imagens e scroll nas atualizações.

## Condições do motor (14)

| Condição | Arte padrão |
|---|---|
| Agarrado | Reutiliza Imobilizar |
| Amedrontado | Reutiliza Ataque Ameaçador |
| Atordoado | Nova: atordoado |
| Caído | Reutiliza Derrubar |
| Cego | Nova: cego |
| Enfeitiçado | Reutiliza Enfeitiçar Pessoa |
| Envenenado | Nova: envenenado |
| Incapacitado | Nova: incapacitado |
| Inconsciente | Nova: inconsciente |
| Imobilizado | Reutiliza Emaranhar |
| Contido | Reutiliza Emaranhar |
| Invisível | Reutiliza Invisibilidade |
| Paralisado | Reutiliza Imobilizar Pessoa |
| Surdo | Nova: surdo |

A habilidade de origem tem prioridade sobre esse padrão. Por exemplo, Contido pode mostrar Emaranhar ou Golpe Constritor conforme a aplicação; Enfeitiçado pode mostrar Amizade, Sugestão ou Enfeitiçar Pessoa.

## Efeitos declarados no catálogo/fichas (35 nomes)

Esta lista inclui nomes de resolução instantânea; eles só aparecem na barra se houver um efeito persistente no estado. Desarmado, por exemplo, pode apenas remover a arma, sem criar chip artificial.

| Nome configurado | Fonte/arte |
|---|---|
| Agarrado | Reutiliza Imobilizar — ação |
| Armadura Arcana | Reutiliza 1º — Armadura Arcana · defesa · classe |
| Ataque Ameaçador | Reutiliza Ataque Ameaçador |
| Ataque Prostrador | Reutiliza Ataque Prostrador |
| Caído | Reutiliza Derrubar — ação |
| Contido (Golpe Constritor) | Reutiliza 1º — Golpe Constritor |
| Contido por Emaranhar | Reutiliza 1º — Emaranhar · Concentração |
| Desarmado | Reutiliza Ataque de Desarme |
| Disfarçado | Reutiliza 1º — Disfarçar-se |
| Emoções acalmadas | Reutiliza 2º — Acalmar Emoções · salva de CAR · concentração · aberrante |
| Enfeitiçado | Reutiliza 1º — Enfeitiçar Pessoa |
| Envenenado | Nova arte de status, ou ícone do item de origem |
| Escudo da Fé | Reutiliza 1º — Escudo da Fé |
| Força Fantasmagórica | Reutiliza 2º — Força Fantasmagórica |
| Fuga Dissonante | Reutiliza 1º — Sussurros Dissonantes |
| Iluminado por Fogo das Fadas | Reutiliza 1º — Fogo das Fadas · Concentração |
| Invisível | Reutiliza 2º — Invisibilidade |
| Lentidão de Raio de Gelo | Nova arte de status, ou ícone do item de origem |
| Marca do Predador | Reutiliza 1º — Marca do Predador |
| Mente Desperta | Reutiliza Mente Desperta |
| Mente Talhada | Reutiliza Truque — Talho Mental · salva de INT · aberrante |
| Paralisado | Reutiliza 2º — Imobilizar Pessoa |
| Passos Largos | Reutiliza 1º — Passos Largos · Elfo |
| Proteção contra Lâminas | Reutiliza Truque — Proteção contra Lâminas |
| Raio de Gelo · lentidão | Nova arte de status, ou ícone do item de origem |
| Respiração Aquática | Nova arte de status, ou ícone do item de origem |
| Rindo no chão | Reutiliza 1º — Riso Histérico de Tasha |
| Sem reações | Reutiliza 1º — Braços de Hadar · salva de FOR · aberrante |
| Sem reações (Toque Chocante) | Reutiliza Truque — Toque Chocante · ataque +5 · classe |
| Sob Sugestão | Reutiliza 2º — Sugestão |
| Sombra Curta | Nova arte de status, ou ícone do item de origem |
| Sopro de Dragão | Reutiliza 2º — Sopro de Dragão · salva de DES · concentração · classe |
| Taumaturgia | Reutiliza Truque — Taumaturgia |
| Toque Arrepiante · cura bloqueada | Nova arte de status, ou ícone do item de origem |
| Zombado | Reutiliza Truque — Zombaria Perversa |

## Efeitos gerados pelo motor e pelos protótipos

| Efeito ou situação | Exibição/arte |
|---|---|
| Feitiçaria Inata | Própria arte da habilidade; buff de conjuração |
| Orientação | Própria arte; dado concedido e duração |
| Inspiração de Bardo | Própria arte; dado concedido |
| Esquiva | Reutiliza Esquivar |
| Lentidão da maestria | Ícone da arma de origem; padrão novo sem gelo |
| Escudo Arcano | Nova arte, distinta de Escudo da Fé |
| Raio do Enfraquecimento e próximo ataque enfraquecido | Nova arte de enfraquecimento |
| Toque Vampírico mantido | Nova arte; concentração e opção concedida |
| Luz | Novo cristal luminoso |
| Santuário | Nova cúpula protetora |
| Proteção contra o Bem e o Mal | Novo escudo sagrado |
| Prece de Cura recebida | Nova arte de oração; marcador até descanso longo |
| Auxílio | Novo coração alado; PV máximos fortalecidos |
| Bênção no alvo | Nova arte; deriva o vínculo do conjurador e mantém duração |
| Expulsar Mortos-vivos / Abrasar | Nova arte; condição/medo, nunca buff por engano |
| Conjurando uma magia longa | Arte da magia quando disponível, moldura neutra |
| Concentração ativa | Arte da magia; padrão existente de concentração |
| Desengajado | Reutiliza Desengajar; deriva o campo do turno |
| PV temporários | Novo escudo/coração; não revela saldo de NPC ao jogador |
| Inconsciente a 0 PV | Condição própria, sem duplicar um efeito já explícito |
| Estável | Reutiliza Acudir os Moribundos; continua inconsciente |
| Morto | Nova caveira; estado de vida |
| Maldição personalizada | Novo selo atravessado por agulhas |
| Buff/debuff/marcador personalizado sem arte | Três símbolos genéricos distintos |

Animar Mortos altera a sobreposição e o token; não é convertido em buff temporário. Dissipar Magia, Remover Maldição, Restauração Menor, Revivificar, Preservar a Vida e Centelha de dano têm resolução instantânea, sem inventar um status duradouro. Traços permanentes, itens equipados, recursos disponíveis e gatilhos guardados só nos eventos do turno não ganham chips extras por esta reforma.

## Artes inéditas (25)

Lista fornecida ao subagente GPT 6 Luna, conforme solicitado. Originais transparentes em conteudo/arte-originais/efeitos; sem moldura ou fundo. Os arquivos de produção são WebP 100×100 com hash.

| ID | Elemento visual |
|---|---|
| atordoado | rosto de pedra de perfil com três estrelas orbitando a têmpora, desorientação |
| cego | olho esculpido coberto por venda de tecido cinza |
| envenenado | gota de veneno verde em pequena caveira de vidro esmeralda |
| incapacitado | mão de bronze caída, fios de energia interrompidos |
| inconsciente | cabeça adormecida de perfil apoiada sobre lua violeta, olhos fechados |
| surdo | orelha de prata com ondas sonoras quebradas ao lado |
| enfraquecimento | braço musculoso de pedra rachando e perdendo pó sob uma espiral púrpura |
| toque-vampirico | mão espectral violeta sugando uma pequena gota de vida rubra |
| luz | pequeno cristal branco dourado emitindo raios de luz |
| santuario | pequena cúpula dourada protetora envolvendo uma vela sagrada |
| protecao-bem-mal | escudo de prata sagrado repousando sobre uma runa circular azul, duas pequenas sombras repelidas |
| prece-recebida | mãos em oração envolvendo centelha verde restauradora |
| auxilio | coração rubro protegido por duas pequenas asas douradas, vigor fortalecido |
| bencao | pequeno símbolo sagrado dourado de quatro pontas com gotas de luz descendendo |
| expulsar-mortos-vivos | caveira sombria recuando de uma pequena explosão solar dourada |
| gelo-lentidao | bota de couro presa por cristais de gelo azul claro |
| cura-bloqueada | coração de pedra rachado envolvido por espinhos negros e um fio necrótico violeta |
| generico-buff | pequena gema esmeralda lapidada com dois ramos de louro dourados apontando para cima |
| generico-debuff | pequena gema rubra quebrada entre duas garras escuras voltadas para baixo |
| generico-neutro | pequeno nó de energia arcana prateada circular com centro âmbar |
| morto | pequena caveira de osso marfim com flor seca repousando sob a mandíbula |
| maldicao | pequeno selo de cera negra atravessado por três agulhas prateadas e fio roxo |
| pv-temporarios | pequeno escudo azul translúcido contendo uma chama de coração dourada |
| escudo-arcano | pequeno escudo de energia azul com runas douradas bloqueando três dardos mágicos |
| lentidao | bota de couro presa por corrente de bronze e pequena ampulheta de areia, sem gelo |

Além dos ícones, cinco fundos e cinco molduras SVG compartilham o padrão nativo dos temas de habilidades existentes. Não exigem raster grande nem duplicação por efeito. Artes reutilizadas usam as miniaturas já publicadas e o cache existente.

## Arquivos e validação

- effect-state.mjs: lista projetada, classificação e descrições; sem alterar estado.
- effect-art.mjs: origem da habilidade/item, aliases, camadas e HTML escapado.
- effect-layout.mjs: posição, dez slots, limite ao conteúdo e adaptação da faixa inferior.
- catalogos/artes-efeitos.mjs: registro central de arquivos, sem imagens nas fichas.
- gerar-artes-efeitos.mjs: WebP 100×100, hash, temas e relatório de bytes.
- effects-hud.test.mjs: geometria, classificação, origem de arte, imutabilidade, privacidade e cobertura de assets.

Manter as regressões de A e da estabilidade 0.8.79. Validar 1/10/11/25 efeitos, mestre/jogador, compacto/expandido, scroll, Aa, dicas e atualização de duração. Só publicar com todos os assets e testes completos.
