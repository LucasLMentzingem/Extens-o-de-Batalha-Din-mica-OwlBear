# Correção local de baús, arremessos e saque

O plano de geração de imagens fica congelado. Não regenerar `docs/arte/habilidades-sete-fichas.json` nem `HABILIDADES-A-GERAR.md` e não gerar artes durante este trabalho.

## Comportamento

- Baú usa seleção retangular com as dimensões da imagem, incluindo offset, rotação e escala da prop. Props convertidas preservam sua imagem; baú padrão usa as dimensões reais 1536 × 1024 do WebP, sem declarar uma imagem retangular como quadrada.
- Itens caídos, inclusive armas arremessadas, usam área circular de interação de 1 m de diâmetro, independentemente da silhueta ou transparência da arte. A escala do sistema continua 1,5 m por célula; isso não é uma mudança na regra de alcance.
- Um contorno preenchido quase invisível é a peça selecionável; a imagem é anexada a ele e não intercepta os cliques. Assim o arraste nativo move a arte e a área de seleção juntas. O host lê a posição atual ao executar comandos, sem publicar estado a cada quadro do arraste.
- A configuração de nome, espaços e tranca com Salvar aparece no embed do menu contextual do mestre. O menu não oferece um caminho alternativo de saque. O inventário administrativo completo continua na lista de baús da extensão.
- Saquear pela habilidade comum aceita inimigo derrotado, baú e item caído. A validação autoritativa testa tranca e alcance antes de consumir a ação. Ao confirmar uma transferência, não cobra a ação novamente. Revalida posição e conteúdo atual. Loot vazio desaparece com sua peça de seleção.
- Inventários de personagem, baú e saque usam `inventory-cell.mjs`. A caixa tem exatamente sua capacidade; loot no chão tem uma célula e não aceita depósitos; inventários normais preservam mínimo de 25 células. Seleção, quantidade e equipamento direto ficam separados da arte da célula. Descrição/comparação e exame continuam disponíveis.

## Verificação

- 261 testes automatizados aprovados, incluindo Saquear em baú/chão, tranca antes do custo, conservação da ação, limpeza do loot, raio circular, proporção e rotação de baú.
- Navegador headless e SDK simulado: geração das áreas de seleção, embed GM, execução de Saquear na HUD contra a lança caída, transferência para inventário e remoção da prop vazia. O formulário contextual foi aberto, editado e salvo sem abrir a antiga janela de saque.
- Ainda é necessária conferência visual do arraste e do menu em uma sala real do Owlbear; o teste simulado não reproduz o renderizador nativo nem permissões da sala.

## Referências do SDK

Revisão para publicação 0.8.44: exclusão de imagem ou peça de seleção pela mesa remove o registro do recipiente, conteúdo e sessões de saque correspondentes. Teste headless adicional confirmou exclusão persistida e ausência de recriação após recarregar o controlador.

- [Item: disableHit, attachedTo e comportamento das anexações](https://docs.owlbear.rodeo/extensions/reference/items/item/).
- [Image: dimensões e escala da imagem](https://docs.owlbear.rodeo/extensions/reference/items/image/).
- [Context Menu: controles incorporados com embed](https://docs.owlbear.rodeo/extensions/apis/context-menu/).
