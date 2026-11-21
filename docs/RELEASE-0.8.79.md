# Versão 0.8.79 — demora e piscadas da HUD

Após confirmar que o A funcionou na 0.8.78, o responsável relatou demora e elementos piscando ao trocar de personagem ou atualizar a tela. O código fechava e reabria popovers quando sua geometria mudava. Ao trocar de ator, descartava também todas as caixas enquanto aguardava a nova medição. Mover Atividades podia reiniciar os dois documentos internos de medição. Havia ainda uma corrida: o iframe podia pedir o conteúdo antes de o controlador registrar seu documento e depender da presença periódica para tentar novamente.

## Alteração

- Mudanças apenas de tamanho usam `setWidth`/`setHeight`. Mudanças de posição reapresentam o mesmo ID e URL, sem fechar explicitamente a janela nem gerar outro identificador de documento. A reabertura completa continua para recuperação de janelas ausentes ou sem presença.
- O último quadro fica visível durante a nova medição. Fica sem interação até a nova vista chegar; o controlador rejeita comandos enviados com a identidade do personagem anterior. Nenhum recurso é gasto por um clique atrasado aplicado ao novo personagem.
- HTML dos grupos é reconciliado com os nós existentes. Saldo, textos, atributos e ordem mudam sem recriar imagens e controles que continuam iguais. Perícias/salvaguardas usam suas chaves próprias; controles repetidos não são colapsados. O scroll permanece preservado.
- O identificador do documento é registrado antes de aguardar `open()`, permitindo responder ao primeiro pedido de conteúdo. Falhas de abertura limpam o registro para a verificação de saúde recuperar a janela.
- Medidas numéricas são lembradas por ator/quantidade de linhas, com limite de 128 entradas e limpeza ao trocar de cena. Mudanças de largura/configuração são transmitidas aos medidores sem depender de recarregar Atividades.

A arquitetura do A permanece: nenhum popover invisível de medição sobre o mapa. Limite de 1120 px, recursos, ícones, ordem de botões, fichas e regras de combate preservados. B não iniciado.

## Comparativo local

Mesmo cenário, mestre, dois PJs, 12 trocas sequenciais entre os personagens e grade com duas linhas. Cada amostra inclui 100 ms fixos de estabilização após o nome aparecer, em ambas as versões.

| Medida | 0.8.78 | 0.8.79 |
|---|---:|---:|
| Média por troca | 551 ms | 176 ms |
| Maior amostra | 597 ms | 200 ms |
| Chamadas `open` | 180 | 74 |
| Chamadas `close` | 336 | 0 |
| Observações da página sem a grade | 50 | 0 |

Redução de aproximadamente **68%** na média do ensaio. As 74 chamadas `open` incluem atualizações de geometria com o mesmo documento, não 74 navegações. O modelo local conserva o iframe ao reapresentar o mesmo ID/URL; o SDK documenta abertura e redimensionamento, mas não garante explicitamente a política interna de remontagem do host. Portanto, o resultado não representa uma medição de latência no Owlbear autenticado. [API oficial usada](https://docs.owlbear.rodeo/extensions/apis/popover/).

## Verificação

- **496 testes** de regras/protocolos aprovados, incluindo proteção contra comandos atrasados do ator anterior.
- **24 verificações gerais** da HUD com mestre e jogador, recarga, recuperação, viewports, linhas, filtros, recursos, instâncias e comandos do mestre.
- **7 verificações de estabilidade**: preenchimento antes de uma confirmação de abertura atrasada; preservação/reordenação de nós e controles; 20 trocas mantendo documentos; atualização de estado sem recriar imagens da grade; alteração de saldo conservando imagens dos recursos; comando atrasado rejeitado; falha de abertura recuperada pela verificação de saúde.
- **8 regressões do A**, com **160 cliques chegando ao canvas local**, além de arrastes. Nenhum medidor na camada de popovers do mapa.
- Versão/cache e catálogo runtime válidos; sem erros não tratados nos ensaios.

## Avisos dos anexos

Os trechos enviados contêm `MaxListenersExceededWarning` e avisos `ObjectMultiplex` em `contentscript.js`. Não há arquivo `contentscript.js` distribuído neste projeto. Os recortes não incluem a URL de origem suficiente para identificar qual script injetado os emitiu. A correção reduz a recriação de contextos da própria HUD; não aumenta o limite de listeners nem afirma eliminar avisos de origem ainda não identificada. Nenhum navegador ou configuração do responsável foi controlado nesta etapa.
