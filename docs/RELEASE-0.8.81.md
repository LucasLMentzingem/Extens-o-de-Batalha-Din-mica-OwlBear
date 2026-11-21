# Versão 0.8.81 — expansão do rodapé pelo retrato

O rodapé volta a expandir sem esperar uma nova medição quando o layout anterior continua válido. O controlador conserva geometria e HTML dos modos compacto/expandido em cache local limitado, envia a configuração aos medidores antes de aguardar outras janelas e elimina chamadas close redundantes sobre grupos já fechados.

O cache exige a mesma revisão, personagem, linhas, dimensões, nomes, filtros, recurso selecionado, movimento dinâmico e imagem do token. Ações/rolagens em andamento não usam esse atalho. Troca de cena limpa o cache. Nenhum popover invisível é mantido sobre o mapa; o comportamento de duplo clique no retrato permanece.

## Evidência e validação

- Ensaio local de dez expansões, mestre/jogador, duas linhas: com 120 ms simulados por open, média 587→277 ms e máximo 623→321 ms; dez closes redundantes por expansão caem a zero. Sem espera adicional por open: média 172→165 ms. Os números não representam latência medida na sala autenticada.
- 512 testes Node aprovados, incluindo quatro casos novos de cache/invalidação/memória.
- Seis verificações específicas de expansão, 24 gerais de HUD, sete de estabilidade, 21 da barra de efeitos e oito de regressão A; estes últimos incluem 160 cliques no canvas local e arrastes.
- Versão/cache e catálogo runtime válidos. Sem alteração de fichas, recursos ou regras de combate. Validação nativa na sala autenticada fica para o responsável; seu navegador não foi controlado.

[Diagnóstico e comparação completos](FIX-LOCAL-EXPANSAO-RODAPE-2026-11-21.md).

A [arquitetura e decisões aprovadas para o descanso curto com Dados de Vida](ARQUITETURA-DESCANSO-CURTO-DADOS-DE-VIDA.md) ficam registradas neste commit para implementação futura. Esta versão não implementa esse novo fluxo.
