# Arte visual dos itens

O catálogo visual cobre as 120 referências atuais com 97 ilustrações individuais reutilizáveis. Itens de mesmo modelo compartilham o recorte quando sua silhueta é igual; variantes encantadas recebem moldura temática própria conforme elemento e raridade.

## Arquivos

- `site/assets/itens/*.webp`: recortes individuais de 500 × 500 px, com canal alfa e fundo transparente.
- `site/assets/itens/molduras/`: molduras SVG separadas por tipo de dano e raridade.
- `site/catalogos/icones-itens.json`: associa cada ID estável do catálogo ao recorte reutilizável.
- `site/item-art.mjs`: compõe moldura, item e assinatura na interface e cria o exame ampliado.
- `work/gerar-prompts-icones.mjs`, `work/preparar-icone-item.mjs`, `work/gerar-molduras-itens.mjs` e `work/gerar-mapa-icones-itens.mjs`: ferramentas locais de geração; não são necessárias em execução.

## Como o sistema escolhe a moldura

`gerar-catalogo-runtime.mjs` incorpora `icone` e `iconeElemento` às definições em `site/catalogos/catalogo-gerado.mjs`. O componente visual lê também `raridade`. Tipos elementais aceitos são neutro, perfurante, cortante, contundente, necrótico, raio, frio e fogo. Gelo é apresentado como frio e relâmpago como raio. Quando não há raridade, usa comum; quando não há dano elemental, usa neutro. As artes próprias da La Arte já trazem a assinatura integrada ao item.

Cada item combina duas camadas: SVG de moldura e recorte transparente. Nos itens da La Arte, a assinatura aparece gravada, estampada ou bordada diretamente no material do próprio item; ela faz parte do recorte, nunca é uma etiqueta ou uma camada externa. Os demais recortes ficam sem texto ou marca para poderem ser reutilizados em outras telas.

## Exame do item

O botão **Examinar 500×500** abre um diálogo com a composição completa e um botão de fechar. O exame pode ser aberto pelo menu contextual da mochila, das lojas, da troca e do saque. A grade e o balão da ficha usam a mesma arte composta em tamanho reduzido.

## Lore visual da Adaga do Último Rito

A adaga é uma arma originalmente sagrada, agora profanada. O glifo de sangue escuro está gravado e impregnado na lâmina e não pode ser removido. A arte conserva motivos sagrados sutis sob a profanação, com sangue seco vermelho-escuro e sem gore. A lâmina isolada em `site/assets/itens/item-adaga-do-ultimo-rito.webp` não contém fundo nem moldura; a interface aplica a moldura correspondente à raridade.

## Adicionar novos itens

1. Acrescente a definição ao catálogo compartilhado e um recorte transparente de 500 × 500 px em `site/assets/itens/`. Se for um item La Arte, integre a marca ao material da peça (gravação em metal, relevo no couro ou bordado no tecido), sem plaqueta externa.
2. Acrescente o ID e o caminho no mapa `site/catalogos/icones-itens.json`.
3. Marque `raridade` e o tipo elemental (`iconeElemento` ou dano nos modelos de ação) na definição para selecionar a moldura correta.
4. Execute `node gerar-catalogo-runtime.mjs` e `node gerar-catalogo-runtime.mjs --check`.

Não grave caminhos de imagens diretamente em fichas de personagem: a referência é do catálogo central e permanece válida quando o mesmo item é transferido para outra ficha.
