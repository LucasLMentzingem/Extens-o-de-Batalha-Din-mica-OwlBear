# Expansão do rodapé pelo retrato — correção local

Estado: implementada e testada sobre 0.8.80, preparada para publicação na 0.8.81 após autorização do responsável. Solicitação de 21/11/2026, após guardar a arquitetura de descanso curto.

## Causa e mudança

Ao recolher, o controlador fecha as dez janelas dos grupos não visíveis. A medição compacta substituía a geometria expandida, de modo que expandir exigia outra ida ao medidor. O controlador também aguardava a abertura/reposicionamento de todas as janelas antes de enviar a configuração aos medidores. Ao reabrir os grupos fechados, enviava outro close antes de cada open. A latência do host se acumulava nessas etapas.

- Cache local dos dois modos, limitado a 16 entradas e orçamento de 2 MiB de conteúdo serializado estimado. Não mantém popovers invisíveis nem fichas em novas janelas.
- Reutilização exige personagem, revisão, linhas, largura, limite de altura, nomes, filtros, recursos selecionados, movimento dinâmico e imagem do token compatíveis. Não restaura cache durante ação/rolagem ou estado ocupado. Mudanças de cena liberam o cache.
- A configuração chega aos medidores antes de aguardar as operações do host. Em caso sem cache válido, a medição ainda começa mais cedo.
- Uma janela comprovadamente fechada pelo controlador não recebe outro close antes de reabrir. Inicialização, recuperação de janelas antigas e falhas continuam com limpeza defensiva.
- Mantém fechadas as janelas recolhidas. A correção não introduz superfícies transparentes sobre o mapa e não altera a mecânica do duplo clique no retrato.

## Comparação reproduzível local

Dez expansões por cenário: cinco do mestre e cinco do jogador, grade de duas linhas, mesmo personagem entre recolher/expandir. Inclui automação do duplo clique e espera até a grade conter botões. Os valores não são latências medidas no Owlbear autenticado.

| Cenário | Antes, média / máximo | Depois, média / máximo |
|---|---:|---:|
| Host simulado sem espera adicional por open | 172 / 184 ms | 165 / 174 ms |
| Host com 120 ms simulados por open | 587 / 623 ms | 277 / 321 ms |

Redução de aproximadamente 53% na média do cenário com latência. As dez chamadas close redundantes por expansão caem para zero. Os grupos visíveis ainda precisam de open; não se promete latência zero nem a mesma redução em toda máquina/host.

## Validação

- 512 testes Node aprovados, quatro novos cobrindo validade/invalidação e limites do cache.
- Seis verificações específicas: iniciar recolhido sem cache; filtro Perícias; PV alterados durante recolhimento sem restaurar revisão antiga; resize recolhido; troca de personagem recolhido; 12 comandos rápidos convergindo sem travar.
- 24 verificações gerais, sete de estabilidade, 21 da barra de efeitos B e oito de A aprovadas. A incluiu 160 cliques no canvas e arrastes.
- Versão/cache 0.8.81 e catálogo runtime válidos. SDK/host e sala simulados localmente; nenhum navegador do responsável controlado. Sem alteração de fichas ou regras.

Evidências locais em `work/rodape-expansao/` e na pasta de entrega `outputs/ajuste-expansao-rodape` do workspace do chat.

[Arquitetura de descanso curto guardada separadamente](ARQUITETURA-DESCANSO-CURTO-DADOS-DE-VIDA.md).
