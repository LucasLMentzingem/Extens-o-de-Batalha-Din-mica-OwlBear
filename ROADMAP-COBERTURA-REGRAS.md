# Roadmap de cobertura das regras

Este documento define a ordem de prioridade para colaboradores e agentes. **Enquanto a Etapa 1 estiver aberta, a prioridade do projeto é completar e testar as regras até o nível 3.** Correções críticas continuam tendo precedência, mas novas funcionalidades devem, sempre que possível, fechar lacunas da etapa atual ou criar módulos reutilizáveis por ela.

## Etapa 1 — cobertura até o nível 3

Meta atual. Abrange as 12 classes, subclasses do SRD, 9 espécies, talentos, maestrias, invocações, metamagias e magias disponíveis até o nível 3.

Referência: [mapeamento de nível 3](docs/mapeamento-nivel-3/README.md).

## Etapa 2 — cobertura até o nível 5

Começa apenas depois dos critérios da Etapa 1. Acrescenta progressões e magias até o nível 5, incluindo Ataque Extra e traços de espécie que surgem no nível 5.

## Etapa 3 — cobertura até o nível 7

Amplia as definições centrais e os módulos reutilizáveis para todas as opções oficiais disponíveis até o nível 7.

## Etapa 4 — cobertura até o nível 10

Conclui o escopo original do protótipo: fichas e interações de personagens até o nível 10.

## Critério de conclusão de cada etapa

Uma etapa só termina quando:

1. todas as opções do escopo estiverem inventariadas e classificadas;
2. as definições reutilizáveis estiverem no catálogo central, sem cópias desnecessárias nas fichas;
3. cada opção automatizável tiver testes de regra, custo, recurso, alvo e interação relevante;
4. opções ainda assistidas estiverem explicitamente documentadas, sem parecer automação completa;
5. as sete fichas de referência carregarem e funcionarem após a migração;
6. inventário, equipamentos, descansos, reações e concentração tiverem regressões compatíveis;
7. lacunas e decisões restantes estiverem registradas em issues.

## Orientação para contribuições

- Escolha primeiro uma lacuna da etapa atual.
- Prefira módulos genéricos a exceções por nome de habilidade.
- Atualize catálogo, documentação e testes na mesma contribuição.
- Não avance silenciosamente uma ficha para um formato incompatível.
- Marque claramente o que é automático, parcial ou assistido pelo mestre.
- Preserve o versionamento `0.8.x` até `0.8.99`, salvo decisão explícita do responsável.
