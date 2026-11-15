# Política de versionamento

A linha de desenvolvimento está travada em `0.8.x`.

Em 15/11/2026, o responsável solicitou explicitamente a republicação `0.8.191` para renovar o cache do Owlbear. Essa versão é uma exceção autorizada e contém a mesma correção funcional da `0.8.19`.

A publicação gera também `manifest-recuperacao.json`, com o mesmo conteúdo do manifesto principal. Esse endereço alternativo permite tentar uma nova instalação quando o endereço original retorna uma versão em cache.

A `0.8.192` dá sequência à instalação de recuperação `0.8.191` e corrige a falha monetária reproduzida com o backup da mesa.

Após confirmar a recuperação, o responsável solicitou retorno à contagem normal em `0.8.20`, com a mesma correção da `0.8.192`. As próximas publicações seguem `0.8.21` até `0.8.99`, conforme a política original.

- Apenas o último número pode avançar: `0.8.3`, `0.8.4`, …, `0.8.99`.
- Não publicar `0.9.0`, `1.0.0` ou alterar `0.8` sem pedido explícito do responsável pelo projeto.
- Cada publicação deve atualizar `site/manifest.json` e todos os parâmetros de cache `?v=` usados pelo site.
- A revisão do catálogo (`versaoCatalogo` e `revisao` de cada entrada) é independente da versão da extensão.
- Alterar uma definição existente exige aumentar a `revisao` daquela entrada quando a mudança afetar sua regra ou comportamento.

Chegar a `0.8.99` não autoriza automaticamente uma nova linha. A próxima versão deve ser decidida pelo responsável pelo projeto.
