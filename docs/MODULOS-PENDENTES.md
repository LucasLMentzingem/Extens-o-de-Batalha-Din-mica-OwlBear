# Módulos a fechar — revisão 0.8.22

Consolidação em 15/11/2026 a partir do código publicado, histórico, arquitetura M04 e issues abertas. Não representa uma nova auditoria exaustiva das 320 entradas do mapeamento. A meta prioritária continua sendo a etapa de nível 3, seguida por 5, 7 e 10.

## Prioridade imediata: regressões e base de resolução

- [#4](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/4): 0 PV, inconsciência e salvaguardas contra a morte.
- [#63](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/63): Bênção deve expirar pelo avanço de tempo fora de combate.
- [#64](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/64): oportunidade em trajetos que começam fora e entram e saem do alcance no mesmo movimento.
- [#65](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/65): paridade de maestrias e aprimoramentos entre ataques simples e compostos.

As quatro issues permanecem abertas; a existência de testes próximos não comprova a correção desses casos.

## Contratos gerais

| Módulo | Estado | O que falta para fechar | Issue |
|---|---|---|---|
| M01 — Ciclo de efeitos | Parcial | Empilhamento, remoção composta e duração uniforme entre estados especiais e efeitos declarativos | [#40](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/40) |
| M02 — Gatilhos e interceptações | Parcial | Eventos ordenados, prioridade, cancelamento, redirecionamento e retomada genérica | [#41](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/41) |
| M03 — Escolhas declarativas | Parcial | Escolher atributo, benefício, condição e área; persistir escolhas quando a regra exigir | [#42](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/42) |
| M04 — Compositor de ações | Parcial | Reservas e custos condicionais; conflitos; janelas M02; migração geral de manobras, metamagias, Smites e maestrias | [#43](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/43) |
| M05 — Zonas persistentes | Sem módulo geral | Entidade de zona, entrada/saída/turno, mobilidade e geometrias restantes | [#44](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/44) |
| M06 — Entidades vinculadas | Sem módulo geral | Familiar/invocação com origem, controlador, iniciativa, comandos, duração e encerramento | [#45](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/45) |
| M07 — Transformações | Sem módulo geral | Sobreposição reversível de ficha, PV, ações, sentidos, tamanho, equipamentos e token | [#46](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/46) |
| M08 — Movimento avançado | Parcial | Puxar, direção livre, voo, escalada, salto, colisão, zonas e correção #64 | [#47](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/47) |
| M09 — Modificadores de rolagem | Parcial | Mínimo/máximo, substituição genérica, filtros compostos e integração com dados explosivos | [#48](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/48) |
| M10 — Tags e restrições | Parcial | Tipo/tamanho de criatura, imunidades funcionais e predicados combináveis | [#49](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/49) |
| M11 — Efeitos em equipamentos | Sem módulo geral | Encantamento temporário ligado à instância de arma/armadura, acompanhando troca e portador | [#50](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/50) |
| M12 — Agendador | Parcial | Fila persistida, genérica e cancelável de dano, cura, testes e efeitos futuros | [#51](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/51) |
| M13 — Dados estendidos | Sem módulo geral | Dados explosivos e transformações recursivas com limites de segurança | [#52](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/52) |
| M14 — Adjudicação estruturada | Sem módulo geral | Pedido ao mestre com contexto, escolhas, aprovar/alterar/negar, consequência e auditoria | [#53](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/53) |
| M15 — Escalonamento | Parcial | Tabela única por nível total, classe e círculo para dados, alvos, área, duração e recursos | [#54](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/54) |
| M16 — Reservas de cura/recursos | Parcial | Distribuição interativa, teto por alvo e confirmação de consumo parcial | [#55](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/55) |

## Avanços que não devem ser perdidos

- **M04:** gaveta reutilizável; círculo e custos derivados; planejamento 2×7 e execução 2×4; sequência Ágil de Zurich com alvos próprios e custo único. Restam os contratos acima e os aceites visuais de scroll/redimensionamento ainda desmarcados na arquitetura.
- **M06:** 0.8.22 adicionou clonagem idempotente de NPC e vínculo automático da cópia ao token. É infraestrutura de atores independentes, sem ciclo de vida de invocação.
- **M08:** geometria euclidiana, teleporte e empurrão já existem; a travessia completa de alcance na mesma trajetória permanece pendente.
- Catálogo central, fichas por referência, inventário/equipamentos, lojas Victor e La Arte, trocas, saque e grupos fixos já possuem implementação. Permanecem sujeitos à auditoria de interações da [issue #39](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/39).

## Dependências das sete fichas

Esta matriz conserva os bloqueios declarados nas issues de fechamento; não transforma um fluxo validado em garantia de todas as combinações.

| Ficha | Módulos apontados para o fechamento | Issue |
|---|---|---|
| Dragoberto | M02, M03, M14 | [#56](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/56) |
| Draven Thorne | M03, M04 | [#57](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/57) |
| Hannah Montana | M03, M14 | [#58](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/58) |
| Loteria | M03, M04 | [#59](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/59) |
| Nikki Lauda | M02, M03, M04, M09, M13, M14 | [#60](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/60) |
| Skimi | M03, M06, M07, M10, M14 | [#61](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/61) |
| Zurich | M02, M05, M14; revisar M04 pela #65 | [#62](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/62) |

M01 e correções sistêmicas de turno/movimento também podem afetar todas as fichas. Os demais módulos continuam necessários para o escopo completo de nível 3, mesmo sem bloqueio nominal nesta seleção de sete personagens.

## Ordem sugerida de retomada

1. Resolver #4, #63, #64 e #65 antes de declarar estáveis os fluxos envolvidos.
2. Retomar M04 no ponto de reservas/custos condicionais; integrar M01–M03 e testar Loteria, Draven, Zurich e Nikki.
3. M14 para formalizar o uso assistido; M05–M07 para zonas, familiares e transformações.
4. Completar M08–M13 e M15–M16 conforme as dependências do catálogo; remapear e testar a etapa de nível 3 antes de encerrá-la.

O M04 permanece pausado pela instrução anterior; este registro organiza a retomada e não autoriza desenvolvimento adicional por si só.
