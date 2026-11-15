# Estado do projeto

Revisão de 15 de novembro de 2026, linha 0.8.x.

## Entregas recentes

| Versão | Entrega | Impacto |
| --- | --- | --- |
| 0.8.12 | Início do M04 | Círculo de conjuração derivado, custos reativos e compositor expandido |
| 0.8.13 | Sequência Ágil | Ataque principal e secundário com alvos independentes e custo único |
| 0.8.14 | Controles do mestre | Avanço de duração fora de combate, descansos, PvP por encontro e reforços |
| 0.8.15 | Fix de HUD | Recursos ordenados, filtro de truques, custo derivado de magias menores, controles recolhíveis e altura responsiva |

O manual de criação de fichas está em [MANUAL-CRIACAO-FICHAS.md](MANUAL-CRIACAO-FICHAS.md).

## Prioridade

O M04 está pausado por solicitação do responsável. Ao retomar, seguir [a arquitetura aprovada](ARQUITETURA-M04-COMPOSITOR-ACOES.md). Permanecem pendentes reservas e custos condicionais, integração geral de manobras, metamagias e Smites.

A meta de cobertura continua organizada em níveis 3, 5, 7 e 10 no [roadmap](../ROADMAP-COBERTURA-REGRAS.md). A presença de uma definição no catálogo não comprova cobertura completa da classe.

## Revisão de impacto

- Skimi possui espaços de 2º círculo. O rodapé agora deriva o custo das magias de 1º para esses espaços, incluindo a seleção pelo filtro de recurso.
- A ordenação dos círculos usa IDs independentes por recurso. Outros recursos preservam sua ordem relativa e Reação aparece por último.
- A compactação ao abrir Ficha é local ao usuário. A altura das instâncias é calculada a partir do conteúdo, limitada pela tela e pelo máximo de 590 px antes da rolagem.
- O avanço de tempo processa a duração dos efeitos ativos e encerra concentrações cujos efeitos vinculados expiraram. Um turno corresponde a 6 segundos. Condições como Caído conservam sua regra própria de remoção.
- O avanço não executa dano periódico, testes repetidos ou gatilhos de combate. Esses eventos continuam dependendo do fluxo de combate ou da arbitragem.
- PvP controla a identificação de adversários para oportunidade e ameaça adjacente em ataques à distância. A seleção direta de alvos continua disponível para a mesa.

## Lacunas encontradas na revisão

1. Bênção usa estado próprio em `ator.bencao`. O avanço externo de tempo percorre `efeitosAtivos`, exigindo integração adicional para esse estado. [Issue #63](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/63).
2. A detecção de oportunidade ainda exige que o movimento comece dentro do alcance. Um trajeto que entra e sai do alcance num único movimento precisa da interseção completa do segmento. [Issue #64](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/64).
3. O caminho de ataques compostos precisa de revisão das maestrias e dos aprimoramentos de acerto que o ataque individual oferece. A sequência Ágil e seu custo estão testados, mas a composição geral segue parcial. [Issue #65](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/65).

## Validação

Na revisão inicial, os 168 testes de combate passaram, o catálogo continha 250 habilidades, 115 itens e duas lojas e o versionamento estava sincronizado em 0.8.14. O fix de HUD acrescenta validação de interface para os filtros de Skimi e Nikki e os controles expandidos/recolhidos do mestre.

Testes headless usam o simulador e SDK controlado. A integração em uma sala real do Owlbear continua sendo uma etapa de validação da mesa.
