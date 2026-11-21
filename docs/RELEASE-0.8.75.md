# Versão 0.8.75 — HUD de combate flutuante

Implementa a proposta visual aprovada em 20/11/2026. O rodapé perde a placa verde, moldura externa e divisor do cabeçalho. Os botões flutuam sobre o mapa, com superfícies próprias para preservar contraste. O retrato e os PV continuam à esquerda. Ícones, artes, recursos e ordem de habilidades permanecem os mesmos.

## Layout e comandos

- Removida a linha de histórico que repetia a última mensagem abaixo das categorias. O histórico do sistema e o acompanhamento nas Atividades/instâncias continuam funcionando.
- A grade deixa de crescer verticalmente só para preencher a janela. Categorias ficam imediatamente abaixo dela; a pilha de Movimento dinâmico/Mover fica à direita, com Finalizar turno abaixo.
- A largura é calculada a partir das colunas do filtro atual **e da linha completa de recursos**, além dos mínimos dos atalhos/categorias. Mais linhas podem reduzir a largura até esse piso. Não são contados só os primeiros recursos.
- Removido o antigo teto fixo de 1120 px como restrição de conteúdo; o limite efetivo é a região disponível da viewport, respeitando a carta da habilidade. Em telas sem espaço, grade/recursos/categorias podem rolar horizontalmente, mantendo os ícones quadrados.
- Altura e largura são medidas localmente pelo renderer e comunicadas ao controlador. São validadas por sessão, documento, ator, linhas, revisão e limites numéricos. A janela mantém a âncora inferior e prefere `setWidth/setHeight`, preservando o documento.
- **Token**, depois de Ficha/Inventário/Livro de habilidades, aproxima e centraliza a peça vinculada usando a câmera local existente. Sem token, fica indisponível; o foco não move a peça, gasta recursos ou altera o combate.
- O modo recolhido também perde a placa externa; PV mantêm um suporte legível. Aa mantém saldos visíveis. Atividades permanece acima da altura real do rodapé.

## Primeira versão para validação de entrada

Esta entrega mantém **um único popover de barra**, com a caixa reduzida ao conteúdo. Fundo transparente não garante passagem de cliques pelo retângulo do iframe do Owlbear. A área externa da janela menor fica liberada; os intervalos transparentes internos ainda precisam da validação do responsável no host real com Move (W), seleção e arraste.

O responsável autorizou publicar assim para experimentar. Se o retângulo interno atrapalhar, o plano B é separar poucos grupos em popovers compactos. Não foi implementado um popover por botão, nem prometida passagem completa pelo iframe via CSS.

## Verificação

- **488 testes** do projeto aprovados, incluindo seis testes novos de geometria, linha inteira de recursos e rejeição de medidas inválidas/atrasadas.
- **19 verificações de navegador** com UI/controlador reais e SDK simulado, duas sessões GM/jogador: transparência, ausência do log, ordem/arte/tamanho de ícones, linhas 1–5, filtros, Aa/saldos, foco de Token sem mudar o estado, carta sem invadir a barra, estabilidade, compactar/expandir, F5, viewport menor e fora de combate.
- No cenário de Nikki, com 22 habilidades comuns e 11 recursos, a barra mede 1358 × 220 px com uma linha e 871 × 233 px com duas, em viewport 1440 × 1000. Com três linhas, o piso de 871 px é mantido pela linha de recursos/controles. São medidas desse cenário, não tamanhos fixos para todas as fichas.
- Versão e catálogo conferidos. Nenhuma imagem nova, regra de combate, ficha, item, custo ou recurso alterado. Reações de Escudo/Veste e Mísseis da 0.8.74 cobertas pela suíte.

Não é necessário reimportar fichas. O ensaio não operou uma sala autenticada do usuário; a captura de cliques do popover real é o ponto específico desta validação publicada.
