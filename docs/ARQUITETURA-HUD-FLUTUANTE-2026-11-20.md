# Arquitetura da HUD de combate flutuante

**Execução aprovada:** a primeira implementação está documentada na [0.8.75](RELEASE-0.8.75.md), em popover único para o responsável validar no Owlbear. O esclarecimento posterior exige que a largura respeite a linha inteira de recursos, mesmo quando a grade de habilidades couber em menos colunas. O plano B de janelas por grupo continua condicionado ao resultado desse teste de entrada.

Proposta para avaliação em 20/11/2026. Referência técnica: extensão 0.8.74, commit `7907b231cba8e8cfcf3122791fc9846465d50d3b`. Esta etapa entrega design e preview; não altera nem publica a extensão.

O rodapé passa a ser um agrupamento de controles flutuantes. Desaparecem a placa verde, a moldura externa, os divisores decorativos, a faixa vazia antes das categorias e a linha de log abaixo delas. Permanecem os ícones atuais e a ordem dos controles. A largura acompanha a quantidade de colunas da grade e a altura acompanha o conteúdo real.

## 1. Regras visuais consolidadas

| Solicitação | Proposta |
|---|---|
| Eliminar a faixa vermelha | Retirar a reserva vertical que sobra entre grade e categorias. Categorias ficam imediatamente abaixo dos ícones, com 6–8 px de respiro. |
| Retirar a linha de log inferior | Não renderizar `.resultado` no rodapé. Histórico continua no sistema; erros, falta de recursos e respostas importantes continuam com feedback apropriado. Não transferir automaticamente todo texto comercial para Atividades. |
| Tornar a faixa amarela responsiva | Calcular a largura pelas colunas realmente necessárias e pelos controles fixos. Mais linhas normalmente significam menos colunas, menor largura e maior altura. |
| Remover o verde e suas bordas | Fundo, borda, sombra interna e divisores da caixa externa ficam transparentes/ausentes. Não aplicar transparência global aos filhos. |
| Manter botões flutuantes | Cada botão conserva área própria, contraste e estado de foco. Ícones de recursos e habilidades conservam artes, molduras, nomes, saldos e comportamento de Aa. |
| Adicionar Token | Depois de Ficha, Inventário e Livro de habilidades. Centraliza a câmera e aproxima o token vinculado, sem mover a peça, gastar deslocamento, abrir ficha ou encerrar ação. |
| Ajustar retrato e vida | Retrato de 64–72 px à esquerda; PV imediatamente abaixo, com uma pequena superfície própria. Redesenho do suporte, sem substituir o token do personagem. |

## 2. Composição recomendada

Manter os grupos na mesma sequência e região, usando alinhamento e proximidade para organizá-los:

1. **Esquerda:** retrato do personagem, barra de PV e saldo. Buffs continuam na lateral externa, com o comportamento atual de rolagem vertical.
2. **Topo do conteúdo:** nome à esquerda; Ficha → Inventário → Livro de habilidades → Token à direita.
3. **Linha seguinte:** recursos na ordem atual; Aa → Linhas → Perícias → Salva guarda à direita.
4. **Centro:** grade de habilidades à esquerda; Movimento dinâmico acima de Mover à direita; saldo de deslocamento e medidor ao lado/abaixo.
5. **Base:** Comum → Classe → Raça → Itens → Passivas → Personalizado, com as variações já configuradas, incluindo Usos gratuitos e Encerrar concentração quando aplicáveis. Finalizar turno permanece à direita.
6. **Acima do rodapé:** Atividades da mesa continua acima da altura real do conjunto, aberta ou fechada. Não usar o espaço removido para colocar outro painel permanente.

O retrato alinha ao centro vertical do bloco útil de recursos/grade, com PV logo abaixo. Não deve criar uma faixa vazia para igualar artificialmente sua altura com uma grade de uma linha.

Com uma única linha, Movimento dinâmico e Mover ainda formam uma pilha mais alta que um ícone. Nesse caso, categorias continuam imediatamente abaixo da grade e Finalizar turno acompanha o fim da pilha direita; não reservar essa altura extra ao longo de toda a largura. Essa pequena diferença de alinhamento elimina o corredor vazio sem inverter controles.

## 3. Direção de arte

Recomendação: fantasia discreta com interação contemporânea. A identidade permanece nas ilustrações e molduras existentes, enquanto os controles de texto ficam mais sóbrios.

- Placa externa inteiramente ausente. O mapa aparece entre os grupos e nos intervalos entre ícones.
- Botões de texto em carvão escuro com boa cobertura, borda fina neutra e canto de 5–6 px. Transparência somente se a legibilidade no mapa for preservada; não usar vidro muito claro.
- Categoria selecionada e Finalizar turno recebem o destaque dourado já familiar. Não dourar todas as bordas.
- Nome com a tipografia de fantasia existente; controles e números com fonte de interface. PV e saldos numéricos devem ser fáceis de comparar.
- Manter ícones quadrados de 50 × 50 px. Recursos mantêm a arte quadrada de 42 × 42 px. Não esticar artes para preencher espaços.
- Sombra curta no nome e na leitura de PV; nenhuma sombra ampla que reconstrua visualmente a placa antiga.
- Não adicionar blur em toda a HUD. Menos composição gráfica, menos dependência do contraste do cenário e nenhuma imagem nova necessária.
- Hover e foco mostram somente o controle apontado. O modo desligado/indisponível deve continuar reconhecível sem deixar textos ilegíveis.

Sugestão adicional: o botão Token pode ter texto visível e um pequeno símbolo de localização; a palavra permanece para evitar um comando novo sem identificação. No preview foi mantido apenas o texto.

## 4. Largura e altura pelo conteúdo

### 4.1 Regra horizontal

Entradas: quantidade de ícones visíveis `N`, linhas escolhidas `R`, lado `S = 50`, espaçamento `G = 4`, largura útil da viewport e limite imposto pela carta da habilidade.

```text
colunasDesejadas = ceil(N / R)
larguraGrade = colunasDesejadas × S + max(0, colunasDesejadas − 1) × G
larguraCentro = larguraGrade + intervalo + larguraMovimento
larguraConteudo = max(larguraCentro, mínimoCabeçalho, mínimoRecursos, mínimoCategorias)
larguraHUD = retrato + intervalo + larguraConteudo + margens
larguraFinal = min(larguraHUD, espaçoDisponível)
```

Os mínimos dos controles são medidos pelo conteúdo; não são constantes escolhidas para repetir a largura antiga. Assim, o botão Token, nomes longos e muitas categorias não ficam cortados.

- **Uma linha:** a grade usa a largura horizontal disponível, com rolagem horizontal se necessário, como hoje. Os ícones mantêm o lado e a ordem.
- **Duas a cinco linhas:** recalcular as colunas e encolher a janela. Movimento, ferramentas e Finalizar turno acompanham a nova borda direita; não ficam presos na borda anterior.
- Ao trocar de filtro, contar os itens do filtro atual; não dimensionar pela maior lista de toda a ficha.
- Ordem de preenchimento continua **por coluna**, como no CSS atual (`grid-auto-flow: column`). Não ordenar habilidades novamente nem mudar os atalhos durante este redesign.
- Categorias ou atalhos podem determinar um piso de largura. Se cinco linhas não produzirem outra redução, isso pode ser um limite legítimo dos controles, não um espaço reservado invisível.
- Zero itens: mensagem curta no espaço da grade, sem conservar o comprimento da grade anterior. Não abrir uma grade vazia com cinco linhas forçadas.
- Se houver poucos itens, linhas visuais efetivas não precisam superar a quantidade de itens; a preferência escolhida continua salva.

### 4.2 Regra vertical

Hoje o controlador reserva `176 + linhas × 54` pixels e a área central expande com `flex: 1`. Isso mantém espaço vazio mesmo com duas linhas de ícones.

A nova altura deve vir da soma das linhas efetivas, recursos, cabeçalho, categorias e seus intervalos. Remover a reserva do log, a altura artificial do centro e o crescimento para preencher a janela inteira. `ResizeObserver` mede o conteúdo após wrap; o controlador ajusta a caixa mantendo a ancoragem inferior. A medição não deve entrar em um ciclo de redimensionamento.

Usar tolerância de 2–4 px e uma atualização por frame, emitir somente quando a dimensão realmente mudar e reconciliar por revisão da vista. Reaproveitar `popover.setWidth/setHeight` antes de fechar/reabrir janelas. Não atualizar dimensões continuamente conforme o cursor passa nos botões.

### 4.3 Telas pequenas e cartas abertas

- Manter limites de segurança da viewport, margem inferior do Owlbear e espaço da carta à direita, com a margem direita de 75 px já definida.
- Se faltar largura, reordenar apenas a quebra de linha dos grupos: atalhos quebram como grupo; ferramentas podem ocupar a linha seguinte. A ordem interna continua igual.
- Rolagem horizontal fica limitada à grade e às listas que excedam a largura. Evitar dois eixos de rolagem no conjunto.
- Não diminuir indefinidamente os ícones para fazer tudo caber. Em telas baixas, limitar a área útil mantendo Finalizar turno e controles necessários acessíveis.
- Ao abrir/fechar carta, reconfigurar as caixas sem perder filtro, linha, scroll da grade, alvo selecionado ou ação em andamento.

## 5. Botão Token e comportamento da câmera

O controlador já possui `d.tipo === 'focar'`, usa o token vinculado e chama `OBR.viewport.animateTo`. O botão novo reutiliza esse caminho com o ID do ator atual; não deve assumir o ID de ator como ID do token.

- Câmera local de quem clicou; não deslocar a visão dos demais jogadores.
- Centralizar a posição real atual do token. Não usar somente coordenadas antigas do encontro quando a peça tiver sido movida.
- Aproximar quando estiver distante; preservar zoom atual se já estiver próximo. O comportamento atual usa `max(escalaAtual, 1.35)`; conferir tokens grandes e diferentes escalas antes de definir esse fator como regra visual definitiva.
- Considerar o espaço ocupado pela HUD/carta para não esconder o próprio token atrás dos controles. Usar centro da região livre, quando disponível.
- Token ausente, removido ou fora da cena: botão indisponível com explicação curta. Jogador não pode usar o comando para revelar unidade oculta ou não autorizada.
- Não compactar a HUD, selecionar outra ficha, ativar ferramenta, cancelar mira ou deslocar o personagem como efeito colateral.
- Sem chamadas repetidas ao segurar/clique duplo; respeitar preferência de movimento reduzido caso a API permita controle de animação.

## 6. Transparência visual e captura de cliques

**Remover o fundo não garante que o mapa aceite cliques no espaço transparente.** O popover do SDK continua sendo uma janela retangular. `pointer-events: none` no contêiner HTML não garante atravessar o iframe do Owlbear para o mapa.

Para esta proposta:

1. Primeiro reduzir a caixa externa ao conteúdo real; isso já elimina a maior parte das regiões invisíveis inúteis.
2. Fazer um ensaio mínimo no host real: Move (W), pan, drag, seleção e zoom nos intervalos transparentes e na área amarela removida. Não presumir que o preview HTML com clique atravessando represente a entrada real do SDK.
3. Se o SDK não oferecer passagem de entrada, dividir por poucos grupos compactos: identidade; conteúdo de recursos/grade/categorias; controles de movimento. Atalhos/ferramentas podem permanecer no bloco principal enquanto suas caixas forem justas. A caixa virtual de layout é lógica, não uma placa visual.
4. Não abrir um popover por ícone. Isso multiplicaria eventos, custo de layout e pontos de recuperação. Cada grupo compartilha o mesmo estado/sessão/revisão já usados pela HUD.
5. Mesmo com grupos, não prometer passagem em cada intervalo de 4 px dentro de uma grade. O aceite mínimo é não bloquear mapa fora dos limites dos grupos úteis e não deixar a antiga área vazia capturando entrada.

Essa prova define se a primeira implementação pode manter um único popover compacto ou precisa de agrupamentos separados. O visual proposto independe dessa escolha. Preservar a correção do cursor de mover que bloqueava cliques; transparência não pode ser apenas uma forma de esconder uma janela grande.

## 7. Log, estados e feedback

- Remover do rodapé a linha que hoje repete `s.historico[0]`. Não apagar o histórico do estado.
- Rolagens, salvaguardas e ações em curso continuam acompanhadas nas Atividades e instâncias, com as regras de prioridade atuais.
- Erro de comando e falta de recurso continuam visíveis no canal apropriado de notificação/carta. Não depender da linha eliminada para explicar uma recusa.
- Não criar novo ticker, toast permanente ou placa “ação aberta” ocupando a faixa removida.
- Nomes e saldos dos recursos continuam legíveis com Aa ligado ou desligado; o saldo nunca some.
- O estado de Movimento dinâmico permanece evidente no próprio botão. A mudança de visual não altera a confirmação exclusiva pela instância.
- Estados de PV 0, PV temporário, concentração, buffs, reação pendente e personagem fora do turno precisam do mesmo tratamento atual, sem ocultação para favorecer uma captura bonita.

## 8. Arquivos afetados na futura implementação

| Arquivo | Responsabilidade |
|---|---|
| `site/hud-ui.mjs` | Markup do rodapé, retirada do log, botão Token, agrupamento sem placa, contagem da grade e emissão das medidas reais. Preservar handlers, `data-*`, ordem e estado de scroll. |
| `site/hud.css` | Remover placa de `.dock-corpo`, divisor do header, expansão vertical artificial e medidas rígidas; estilizar controles, retrato/PV e responsividade. Escopo somente no rodapé. |
| `site/hud-controller.mjs` | Substituir altura fixa e largura máxima habitual por geometria do conteúdo; posicionar grupos; reutilizar foco de token; elevar Atividades acima da caixa real. |
| `site/hud.html` | Rever tipos de parte apenas se o ensaio de entrada exigir grupos separados. |
| `site/hud-protocol.mjs` | Se houver novas mensagens de dimensão/partes, validar sessão, ator, revisão e limites antes de aceitar. Não aceitar medidas arbitrárias sem validação. |
| `site/ability-art.css`, `site/ability-art.mjs` | Preservar arte e composição atuais. Não mudar globalmente os ícones ou os fundos/molduras de habilidades para fazer o novo rodapé. |
| `site/resource-art.mjs`, registros de miniaturas/recursos | Reutilizar exatamente os arquivos existentes. Nenhuma geração, nova imagem grande ou nova cópia de assets. |
| `site/bridge.mjs`, motor e execução | Verificar integração; nenhuma mudança nas regras de combate, custos, CA, dados, movimento, reação ou inventário é necessária para o redesign. |
| Testes de HUD/layout e ensaio de duas sessões | Geometria, interação, prevenção de cliques perdidos e preservação de ações. |

As regras CSS hoje agrupam `nav`, `.prompt` e `.dock-corpo` no mesmo fundo. Separar o seletor do rodapé, em vez de remover fundos de todas as instâncias, diálogos e reações.

## 9. Desempenho e robustez

- Somente assets já otimizados e carregados pelas miniaturas atuais. Não usar PNG original como fundo novo.
- Evitar blur, filtros animados, sombras extensas, animação contínua e medição no `pointermove`.
- Recalcular medidas ao mudar linhas, filtro, recursos/quantidade, nome, viewport e abertura da carta; saldos comuns que não alterem o tamanho do grupo não exigem reposicionar tudo.
- Preferir medir elementos estáveis; quando o render substituir o DOM, reconectar o observer uma vez e desconectar o anterior.
- Mensagens de layout locais ao host, sem persistir pixels no estado compartilhado ou enviar pelo broadcast da mesa.
- Se existirem grupos separados, reaproveitar o protocolo de sessão e o estado do controlador; não iniciar hosts ou assinaturas de sala adicionais por grupo.

## 10. Critérios de aceitação

- [ ] Nenhuma placa verde, moldura externa, divisor horizontal ou log inferior no rodapé.
- [ ] A faixa vermelha desaparece em 1–5 linhas, sem cortar ícones nem acrescentar rolagem vertical inútil.
- [ ] Com a mesma lista de 16 habilidades, duas linhas geram 8 colunas e quatro linhas geram 4, até atingir o piso legítimo dos controles.
- [ ] Ícones, artes, molduras e ordem idênticos aos atuais; Aa preserva os saldos.
- [ ] Ficha, Inventário e Livro continuam abrindo suas seções; Token focaliza a unidade correta sem alterar o jogo.
- [ ] Mover e Movimento dinâmico mantêm sua posição relativa e todas as confirmações existentes.
- [ ] PV, PV temporário, 0 PV, vida/morte, concentração e buffs continuam representados.
- [ ] Filtros e Finalizar turno mantêm ordem e posição relativas; sem perda de acesso em telas estreitas.
- [ ] Atividades nunca fica atrás/abaixo do rodapé; cartas e rolagens preservam margem direita e prioridade.
- [ ] Teste de entrada real com Move (W), drag e cliques nos espaços transparentes; nenhuma caixa invisível do tamanho antigo.
- [ ] Alternar linhas/filtro, abrir/fechar/reabrir HUD e F5 não deixam janelas órfãs ou observers duplicados.
- [ ] Sem regressão em simultaneidade, salvaguardas, reações da 0.8.74 ou movimento dinâmico.

## 11. Preview e limites

O preview demonstra a recomendação com ícones existentes do catálogo, retrato demonstrativo, mapa esquemático e seleção de 1–5 linhas. Não substitui as artes da ficha importada M.K. 1 — Terra: as habilidades autorais e seu token não constam como arquivos canônicos deste checkout. Na implementação serão usados os dados da ficha carregada, sem trocar suas imagens.

As interações do preview são locais e não enviam ações ao Owlbear. O botão Token demonstra o foco no mapa de exemplo. A aparência transparente e o encolhimento podem ser avaliados aqui; a passagem de entrada através dos popovers exige a prova descrita na seção 6.

Verificação do preview: 20 combinações de 1–5 linhas nas larguras 1024, 736, 560 e 320 px; imagens carregadas, sem erro de JavaScript, sem overflow externo e sem sobreposição entre grade, movimento e Atividades. Aa mantém os saldos visíveis; filtros e foco demonstrativo respondem. Na largura de 1024 px, a lista ilustrativa de 16 ações ocupa 992 px com uma linha, 630 px com duas e atinge o piso de controles de aproximadamente 585 px a partir de três. São medidas do protótipo, não metas rígidas para todas as fichas.

Próxima etapa, após avaliação do design: validar a entrada do host, implementar apenas a HUD, executar a matriz de testes e então preparar a publicação quando solicitada.
