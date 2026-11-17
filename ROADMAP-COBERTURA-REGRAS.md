# Roadmap de cobertura das regras

Este documento define a ordem de prioridade para colaboradores e agentes. **Enquanto a Etapa 1 estiver aberta, a prioridade do projeto é completar e testar as regras até o nível 3.** Correções críticas continuam tendo precedência, mas novas funcionalidades devem, sempre que possível, fechar lacunas da etapa atual ou criar módulos reutilizáveis por ela.

## Etapa 1 — cobertura até o nível 3

Meta atual. Abrange as 12 classes, subclasses do SRD, 9 espécies, talentos, maestrias, invocações, metamagias e magias disponíveis até o nível 3.

Referência: [mapeamento de nível 3](docs/mapeamento-nivel-3/README.md).

A situação consolidada na 0.8.49, com módulos, regressões abertas e dependências das sete fichas, está em [Módulos pendentes](docs/MODULOS-PENDENTES.md). Os módulos não devem ser considerados fechados apenas porque uma parte já funciona.

Os contratos de [reaproveitamento nas etapas seguintes](docs/MODULOS-PENDENTES.md#reaproveitamento-nas-etapas-seguintes) partem das decisões das sete fichas. A etapa 5 reaproveita os gatilhos e limites da sequência com Ataque Extra. A etapa 7 reaproveita a escolha após descanso nas Táticas Defensivas do Caçador. As etapas seguintes devem reaproveitar zonas, entidades e efeitos vinculados conforme cada regra.

## Etapa 2 — cobertura até o nível 5

Começa apenas depois dos critérios da Etapa 1. Acrescenta progressões e magias até o nível 5, incluindo Ataque Extra e traços de espécie que surgem no nível 5.

## Etapa 3 — cobertura até o nível 7

Amplia as definições centrais e os módulos reutilizáveis para todas as opções oficiais disponíveis até o nível 7.

## Etapa 4 — cobertura até o nível 10

Conclui o escopo original do protótipo: fichas e interações de personagens até o nível 10.

## Critério de conclusão de cada etapa

Aplique o [padrão de habilidades de interpretação](docs/HABILIDADES-DE-INTERPRETACAO.md) em todas as etapas. Uma habilidade classificada como interpretação conta como coberta quando a ficha apresenta a regra e registra o uso com o custo aplicável. A adjudicação estruturada do M14 é uma melhoria de fluxo e não bloqueia esses casos.

Uma etapa só termina quando:

1. todas as opções do escopo estiverem inventariadas e classificadas;
2. as definições reutilizáveis estiverem no catálogo central, sem cópias desnecessárias nas fichas;
3. cada opção automatizável tiver testes de regra, custo, recurso, alvo e interação relevante;
4. opções de interpretação estiverem documentadas e testadas quanto ao registro e custo, e lacunas de automação mecânica estiverem identificadas como pendências;
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
