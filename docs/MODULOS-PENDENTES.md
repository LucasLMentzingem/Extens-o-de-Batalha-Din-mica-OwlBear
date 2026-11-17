# Módulos a fechar — revisão 0.8.49

Consolidação em 17/11/2026 a partir do código, histórico, arquitetura M04 e estado das issues. Suíte da publicação: 301 testes. Não representa uma nova auditoria exaustiva das 320 entradas do mapeamento. A meta prioritária continua sendo a etapa de nível 3, seguida por 5, 7 e 10.

## Prioridade imediata: regressões e base de resolução

- [#4](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/4): fechada; 0 PV, inconsciência, salvaguardas contra a morte e recuperação possuem regressões.
- [#63](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/63): concluída na 0.8.24; relógio fora de combate reduz Bênção, a duração também avança 6 s por rodada e concentração não apaga Bênção alheia.
- [#64](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/64): concluída na 0.8.24; interseção contínua detecta entrada e saída do alcance no mesmo trajeto e ordena vários reatores.
- [#65](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/65): critérios de motor cumpridos na 0.8.26. Assassino de Colossos coberto em ataque simples, composto e de oportunidade ("uma vez por turno" vale em cada turno da mesa); crítico de reação dobra todos os dados; ataques compostos usam a mesma regra de vantagem/desvantagem do simples (#8, Caído, alcance longo, Enfeitiçado); Destruidor de Hordas com e sem Gaveta e limite compartilhado; uma manobra por instância. Falta apenas o smoke test visual em Owlbear (prévia do círculo e reabertura da sala).

As issues #4, #63, #64 e #65 já estão fechadas no GitHub. Os aceites visuais restantes continuam nas issues específicas das sete fichas, sem reabrir os defeitos de motor concluídos.

## Contratos gerais

| Módulo | Estado | O que falta para fechar | Issue |
|---|---|---|---|
| M01 — Ciclo de efeitos | Parcial | Empilhamento, remoção composta e duração uniforme entre estados especiais e efeitos declarativos | [#40](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/40) |
| M02 — Gatilhos e interceptações | Parcial | Inclui escolha persistida na iniciativa (0.8.49). Faltam eventos ordenados, prioridade, cancelamento, redirecionamento e retomada genérica | [#41](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/41) |
| M03 — Escolhas declarativas | Parcial | Escolha após descanso (`trocaAposDescanso`) e escolha de iniciativa (0.8.49) com pendência persistida, confirmação do dono ou do mestre. Falta escolher atributo, benefício, condição e área | [#42](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/42) |
| M04 — Compositor de ações | Parcial | 0.8.49: custos por modo, golpe unificado e terceiro golpe da Torrente; preservados Hordas, Duplicada e uma manobra por instância. Mão de Dolo agora somente pós-acerto. Falta reserva genérica de custos condicionais, Smites e janelas M02 | [#43](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/43) |
| M05 — Zonas persistentes | Parcial (0.8.28) | Entidade de zona, gatilhos de entrada e início/fim de turno, terreno difícil, concentração, relógio e restauração entregues com Emaranhar. Faltam saída, áreas móveis, cubo/cilindro/parede e o smoke visual | [#44](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/44) |
| M06 — Entidades vinculadas | Parcial (0.8.28) | Familiar e Mãos Mágicas como entidades e Ilusão Menor como peça visual entregues. Força Fantasmagórica com token público entregue na 0.8.35. Faltam formas oficiais do familiar, limite de distância da mão e o smoke visual dos tokens | [#45](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/45) |
| M07 — Transformações | Sem módulo geral | Sobreposição reversível de ficha, PV, ações, sentidos, tamanho, equipamentos e token | [#46](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/46) |
| M08 — Movimento avançado | Parcial | Zonas no trajeto (primeiro contato e terreno difícil) entregues na 0.8.28. Faltam puxar, direção livre, voo, escalada, salto e colisão | [#47](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/47) |
| M09 — Modificadores de rolagem | Parcial | 0.8.26: rerrolagem parcial de até N dados (Magia Potencializada). Dados explosivos limitados entregues na 0.8.28; faltam mínimo/máximo, substituição genérica e filtros compostos | [#48](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/48) |
| M10 — Tags e restrições | Parcial | Tamanho de criatura entregue na 0.8.28 (Prostrador) e tipo de criatura na 0.8.35 (Imobilizar Pessoa, Enfeitiçar Pessoa, Acalmar Emoções). Faltam imunidades funcionais e predicados combináveis | [#49](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/49) |
| M11 — Efeitos em equipamentos | Sem módulo geral | Encantamento temporário ligado à instância de arma/armadura, acompanhando troca e portador | [#50](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/50) |
| M12 — Agendador | Parcial | Fila persistida, genérica e cancelável de dano, cura, testes e efeitos futuros | [#51](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/51) |
| M13 — Dados estendidos | Parcial (0.8.28) | Dados explosivos com limite (Explosão Elemental) entregues. Faltam outras transformações recursivas | [#52](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/52) |
| M14 — Adjudicação estruturada | Melhoria de fluxo | Pedido ao mestre com contexto e auditoria. Opcional para efeitos de interpretação nas quatro etapas. | [#53](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/53) |
| M15 — Escalonamento | Parcial | Tabela única por nível total, classe e círculo para dados, alvos, área, duração e recursos | [#54](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/54) |
| M16 — Reservas de cura/recursos | Parcial | Distribuição interativa, teto por alvo e confirmação de consumo parcial | [#55](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/55) |

## Avanços que não devem ser perdidos

- **M02/M03:** escolha `rolar_iniciativa` persistida e sem relógio; dono confirma ou GM assume se ausente. O módulo genérico continua parcial. Consulte [Metabolismo e iniciativa](METABOLISMO-INICIATIVA.md).
- **M04:** custos por modo e limites por etapa implementados na 0.8.49; Mão de Dolo somente pós-acerto. Gaveta reutilizável; círculo e custos derivados; planejamento 2×7 e execução 2×4; sequência Ágil de Zurich com alvos próprios e custo único. Restam os contratos acima e os aceites visuais de scroll/redimensionamento ainda desmarcados na arquitetura.
- **M06:** 0.8.22 adicionou clonagem idempotente de NPC e vínculo automático da cópia ao token. É infraestrutura de atores independentes, sem ciclo de vida de invocação.
- **M08:** geometria euclidiana, teleporte, empurrão e travessia completa de alcance já possuem regressões (#64 fechada). Permanecem os contratos gerais de movimento avançado.
- Catálogo central, fichas por referência, inventário/equipamentos, lojas Victor e La Arte, trocas, saque e grupos fixos já possuem implementação. Permanecem sujeitos à auditoria de interações da [issue #39](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/39).

## Reaproveitamento nas etapas seguintes

| Módulos | Contrato a compartilhar |
|---|---|
| M01 e M12 | Associar marcador, ação concedida e token a um efeito de origem. Expirar o conjunto em combate, no avanço do relógio pelo mestre ou no fim da concentração. Serve para Emaranhar, Disfarçar-se, Mente Desperta, Taumaturgia e Força Fantasmagórica. |
| M02 e M04 | Um ataque pode oferecer opções no gatilho ou receber seleção antecipada na gaveta. Ambos usam a mesma validação, com limite por ataque ou turno e cobrança no gatilho. Reutilizar em Ataque Extra, manobras, maestrias e efeitos pós-acerto. |
| M03 | Escolhas após descanso declaradas por habilidade e persistidas na ficha. O dono online confirma. O mestre confirma para fichas sem dono ou com dono offline. Reutilizar para outras escolhas elegíveis por descanso, como Táticas Defensivas do Caçador no nível 7. |
| M05 e M08 | Zonas públicas têm duração e hostilidade. Uma consulta geométrica comum encontra o primeiro contato da trajetória e colore a prévia a partir dali. Cada habilidade declara suas consequências e seus gatilhos. |
| M06 | Separar token de cenário sem ficha de entidade controlável com ficha e ações. Compartilhar criação e remoção da peça, com regras de controle e iniciativa por definição. Força Fantasmagórica usa token público com efeito restrito ao alvo original. |
| M04 e M11 | Desarme provisório usa a remoção do slot e o inventário existente. A futura peça de item no chão poderá usar o mesmo resultado de desarme, preservando a instância do item. |

## Dependências das sete fichas

Esta matriz lista os bloqueios mecânicos. Habilidades de interpretação são verificadas pelo registro e custo, sem dependência do M14.

| Ficha | Módulos apontados para o fechamento | Issue |
|---|---|---|
| Dragoberto | Smoke visual do Destruidor de Hordas e da escolha pós-descanso. Os fluxos específicos do M02/M03/M04 e Assassino de Colossos estão cobertos; o barramento genérico segue em #41 para o nível 3 completo | [#56](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/56) |
| Draven Thorne | Smoke visual. Prostrador por tamanho coberto na 0.8.28; Desarme e limite de manobras na 0.8.26 | [#57](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/57) |
| Hannah Montana | Smoke visual da Ilusão Menor (peça coberta no motor na 0.8.28) | [#58](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/58) |
| Loteria | Aceite em sala real. Na 0.8.49: golpe único Ação/Bônus, Torrente com terceiro golpe por Ação, Mão de Dolo só pós-acerto, escolha de Metabolismo na iniciativa e Pico de Adrenalina revisado. Testes de motor e navegador com SDK simulado passaram. | [#59](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/59) |
| Nikki Lauda | Smoke visual. Taumaturgia, Mãos Mágicas, dados explosivos e registro de Queda Suave cobertos no motor na 0.8.28. Magia Potencializada e Magia Duplicada cobertas na 0.8.26. Queda Suave interpretativa. | [#60](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/60) |
| Skimi | Smoke visual em sala real. Disfarçar-se, Mente Desperta, Força Fantasmagórica e tipo de criatura cobertos no motor na 0.8.35. Taumaturgia e Encontrar Familiar na 0.8.28 | [#61](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/61) |
| Zurich | Smoke visual de Emaranhar (M05 coberto no motor na 0.8.28). Caçador (M03/M04) e #65 cobertos na 0.8.26 | [#62](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/62) |

M01 e correções sistêmicas de turno/movimento também podem afetar todas as fichas. Priorize os demais módulos conforme os efeitos mecânicos do escopo de nível 3.

## Ordem sugerida de retomada

1. Conferir em sala real a 0.8.49 e fechar os aceites das sete fichas (#56–#62) e da auditoria #39; validar o estresse multicliente do loot #76. #4, #63, #64 e #65 já estão fechadas.
2. Retomar M04 no ponto de reservas/custos condicionais; integrar M01–M03 e testar Loteria, Draven, Zurich e Nikki.
3. M05–M07 para zonas, familiares e transformações. M14 passa a ser uma melhoria de fluxo para as habilidades [classificadas como interpretação](HABILIDADES-DE-INTERPRETACAO.md).
4. Completar M08–M13 e M15–M16 conforme as dependências do catálogo; remapear e testar a etapa de nível 3 antes de encerrá-la.

O M04 foi retomado na 0.8.26 por pedido do responsável, com prioridade no fechamento das sete fichas de nível 3.
