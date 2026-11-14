# Política de versionamento

A linha de desenvolvimento está travada em `0.8.x`.

- Apenas o último número pode avançar: `0.8.3`, `0.8.4`, …, `0.8.99`.
- Não publicar `0.9.0`, `1.0.0` ou alterar `0.8` sem pedido explícito do responsável pelo projeto.
- Cada publicação deve atualizar `site/manifest.json` e todos os parâmetros de cache `?v=` usados pelo site.
- A revisão do catálogo (`versaoCatalogo` e `revisao` de cada entrada) é independente da versão da extensão.
- Alterar uma definição existente exige aumentar a `revisao` daquela entrada quando a mudança afetar sua regra ou comportamento.

Chegar a `0.8.99` não autoriza automaticamente uma nova linha. A próxima versão deve ser decidida pelo responsável pelo projeto.
