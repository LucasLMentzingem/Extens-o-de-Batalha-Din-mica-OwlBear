# Estado do projeto

Revisão de 15 de novembro de 2026, versão 0.8.33, linha 0.8.x. Contribuição de Soneka integrada a partir do commit `34654e1`, com revisão de compatibilidade e testes adicionais.

A 0.8.33 restaura o raio do livro nas áreas circulares e calibra a cena para 1,5 m por célula. Motor, HUD, zonas, alvos, deslocamentos e tokens usam a mesma conversão entre pixels e metros. A régua nativa é configurada em metros e distância euclidiana. Estados anteriores são migrados uma única vez, preservando a posição no desenho. Uma trajetória pendente precisa de nova seleção para recalcular oportunidades na escala corrigida.

Verificação da 0.8.33 com 228 testes automatizados e Chromium headless com SDK simulado. A HUD mostrou Despedaçar com raio de duas células, alcance de 18 m com doze células, movimento de 1,5 m com uma célula, zona antiga no mesmo ponto do mapa e reabertura idempotente, sem erros de página. A confirmação em sala real do Owlbear permanece pendente.

## Entregas recentes

| Versão | Entrega | Impacto |
| --- | --- | --- |
| 0.8.12 | Início do M04 | Círculo de conjuração derivado, custos reativos e compositor expandido |
| 0.8.13 | Sequência Ágil | Ataque principal e secundário com alvos independentes e custo único |
| 0.8.14 | Controles do mestre | Avanço de duração fora de combate, descansos, PvP por encontro e reforços |
| 0.8.15 | Fix de HUD | Recursos ordenados, filtro de truques, custo derivado de magias menores, controles recolhíveis e altura responsiva |
| 0.8.16 | Filtro de círculos | Magias de círculo menor continuam classificáveis mesmo quando usam espaços de Pacto superiores |
| 0.8.17 | Venda e moedas | Vender exige catálogo aberto da loja escolhida; PO sem peso |
| 0.8.18 | Saque | Inventário de derrotados, seleção em lote, quantidades e limite de carga |
| 0.8.19–0.8.20 | Recuperação | Diagnóstico de carregamento, backup, recuperação de valores inválidos e precisão monetária; retorno à numeração normal após versões excepcionais autorizadas |
| 0.8.21 | Grupos de fichas | Aventureiros e Soldados do Reino, listas recolhíveis, adição individual ou em grupo com cena já ocupada |
| 0.8.22 | Duplicação de NPCs | Token duplicado recebe ator independente; equipamentos e escolhas preservados, PV/recursos iniciais, sem efeitos temporários ou dono |
| 0.8.24 | Estabilização | Bênção no relógio, oportunidades na trajetória inteira e primeira paridade de ataques compostos |
| 0.8.25 | Importação de pastas | Pastas de fichas viram grupos reutilizáveis |
| 0.8.28 | M05, M06 e fichas | Zonas persistentes (Emaranhar), prévia vermelha de trajetória, entidades invocadas (Familiar, Mãos Mágicas), Ilusão Menor, Prostrador por tamanho, dados explosivos, Taumaturgia e Mão de Dolo na Gaveta do golpe avulso |
| 0.8.26 | Fichas de nível 3 | Paridade #65, Destruidor de Hordas na Gaveta, Desarme, Mão de Dolo preparada, Magia Potencializada por dados, Magia Duplicada e escolha da Presa do Caçador no descanso |

O manual de criação de fichas está em [MANUAL-CRIACAO-FICHAS.md](MANUAL-CRIACAO-FICHAS.md).

A integração da 0.8.26 preserva os grupos de pastas da 0.8.25 e acrescenta proteção aos limites por turno entre combates e na atualização de mesas antigas. O fluxo avulso de Destruidor de Hordas usa o alcance real da arma e mantém sua prévia após selecionar o alvo. Validação local com 202 testes de motor e verificação da interface e da ponte Dice+ simulada. Os detalhes e as verificações ainda pendentes em sala real estão em [TESTES-SETE-FICHAS-NIVEL-3.md](TESTES-SETE-FICHAS-NIVEL-3.md#resultado-da-0826).

## Prioridade

O M04 foi retomado na 0.8.26, seguindo [a arquitetura aprovada](ARQUITETURA-M04-COMPOSITOR-ACOES.md): manobras, Destruidor de Hordas, Mão de Dolo preparada e as metamagias de Nikki já usam as regras comuns. Permanecem pendentes a reserva genérica de custos condicionais, Smites e as janelas do M02.

A meta de cobertura continua organizada em níveis 3, 5, 7 e 10 no [roadmap](../ROADMAP-COBERTURA-REGRAS.md). A presença de uma definição no catálogo não comprova cobertura completa da classe.

A lista consolidada de módulos e bloqueios está em [MODULOS-PENDENTES.md](MODULOS-PENDENTES.md). Nenhum dos 16 contratos gerais foi declarado concluído: dez estão parciais e seis ainda não possuem o módulo geral. A cópia independente de NPCs é infraestrutura reutilizável, mas não implementa vínculo de invocação, controlador, duração ou encerramento do M06.

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

Na 0.8.22, passaram 176 testes do motor; catálogo de runtime consistente com 259 habilidades, 117 itens e duas lojas; versionamento validado. O teste headless do bridge com SDK simulado confirmou marcação de origem, cópia independente, idempotência, filtro de eventos de movimento e confirmação de sincronização. A auditoria de todas as combinações possíveis não está concluída.

Testes headless usam o simulador e SDK controlado. A integração em uma sala real do Owlbear continua sendo uma etapa de validação da mesa.
