# Fechamento das sete fichas de nível 3

Estado na versão 0.8.10: testes em andamento. Este documento separa o que já foi comprovado pelo motor do que ainda depende dos módulos propostos para a cobertura completa do nível 3.

A [classificação aprovada de habilidades de interpretação](HABILIDADES-DE-INTERPRETACAO.md) define os casos que exigem apenas registro e custo aplicável. As decisões posteriores de invocação estão na [pré-arquitetura do M06](mapeamento-nivel-3/PRE-ARQUITETURA-MODULOS.md#m06--entidades-familiares-e-objetos-vinculados--ausente).

## Base comum já comprovada

- As sete fichas carregam simultaneamente por referências do catálogo central.
- Toda ficha conclui um ataque básico com a arma equipada, consome a Ação e aplica o dano ao alvo.
- Ataques guardados não aparecem; arremesso, mão fraca, duas mãos, acuidade, distância, proficiência e Artes Marciais derivam do item e do portador atual.
- Iniciativa, perícias, salvaguardas, concentração, condições, descanso, carga, lojas, troca, resistências e treze tipos de dano possuem regressão automatizada.
- As opções ainda não portáteis continuam utilizáveis como declaração assistida, mas não contam como fechamento mecânico da ficha.

## Matriz por personagem

| Ficha | Fluxos principais já testados | Pendências relevantes para o fechamento |
|---|---|---|
| Dragoberto | Cimitarra/arco, Arquearia, Golpe Certeiro com Gaveta de Composição para arma e dano, duas formas de Sopro Dracônico, Marca do Predador, Golpe Constritor e ataque extra de Destruidor de Hordas. | Destruidor de Hordas com visual e seleção nos dois fluxos. Testar Assassino de Colossos quando ativo. Implementar escolha de Presa do Caçador ao fim do descanso. |
| Draven Thorne | Espada Grande, Surto de Ação, Recuperar Fôlego, Atacante Selvagem, Queimadura de Fogo, Ataque Ameaçador e duração de Caído. | Ataque Prostrador, Desarme e parte da seleção de manobras precisam do compositor M04 e escolhas M03. |
| Hannah Montana | Adagas/mão fraca, Inspiração de Bardo, Fogo das Fadas, Zombaria Viciosa e Ancestralidade Feérica. | Ilusão Menor: token visual estático, sem ficha. |
| Loteria | Lança, Golpe Desarmado, soco bônus, Torrente de Golpes com composição independente dos dois golpes, Mão de Dolo, Mão de Cura, Defletir Ataques, Valentão de Taverna e Metabolismo Aprimorado. | Mão de Dolo fora da Torrente e escolhas situacionais ainda precisam ser consolidadas no compositor M04/M03. |
| Nikki Lauda | Adagas, Mísseis Mágicos, Explosão Elemental com sete tipos na Gaveta de Composição, Sopro de Dragão, Fonte de Magia, Feitiçaria Inata, Magia Potencializada, Talho Mental, Toque Chocante e Passo Nebuloso gratuito. | Dados explosivos, Magia Duplicada e buff de Intimidação de Taumaturgia. Mãos Mágicas: token controlável com ficha própria. Queda Suave: verificar custo e registro de uso interpretativo. |
| Skimi | Adagas, Rajada Mística, Imobilizar Pessoa, Riso Histérico, Invisibilidade, Sussurros Dissonantes, Astúcia Mágica, Ponto de Sorte e Inspiração Heroica. | Familiar, Força Fantasmagórica, marcador de Disfarçar-se e buff de Intimidação de Taumaturgia. Mãos Mágicas: token controlável com ficha própria. Mente Desperta: marcadores interpretativos nos dois participantes. |
| Zurich | Arco/cimitarra/espada curta, Ágil, Marca do Predador, Lentidão, Emaranhar, Orientação, Saraivada de Espinhos, resistências por alvo e sequência de arma leve. | Testar Assassino de Colossos em ataques simples, compostos e reações. Área persistente de Emaranhar no M05. Compartilha a escolha de Presa do Caçador e os fluxos de Destruidor de Hordas. |

## Testes do caçador

- **Presa do Caçador:** ao fim do descanso curto ou longo executado pelo mestre, abrir seleção e confirmação para o dono online. Se estiver offline ou sem vínculo, encaminhar ao mestre. Usar o módulo de escolhas após descanso.

- **Destruidor de Hordas:** testar o círculo e a seleção de alvo com e sem a gaveta. Cobrir ataque inicial que erra, mesma arma, alcance, alvo já atacado e uso único compartilhado entre os fluxos.
- **Assassino de Colossos:** conferir o 1d8 contra alvo que já estava ferido antes do acerto, com arma e uma vez por turno. Cobrir alvo com PV completos, ataques compostos e ataques de reação. Corrigir apenas diferenças encontradas na validação.

## Mente Desperta

- A ação bônus cria marcadores interpretativos no conjurador e no alvo. Ambos duram o tempo da característica, 3 minutos no nível atual de Skimi. Se o vínculo for encerrado ou substituído, remover os dois marcadores.
- O mestre resolve a comunicação e a distância durante a interpretação. Os marcadores não dão bônus.

## Força Fantasmagórica

- Skimi posiciona um token visual da ilusão, sem ficha ou iniciativa, visível para todos no mapa. O token mostra a região para selecionar um único alvo. A validação deve manter o alcance de conjuração e a visibilidade do alvo a partir de Skimi. A percepção da ilusão na ficção continua restrita ao alvo.
- Fazer uma única salvaguarda de INT na conjuração. Se falhar, aplicar o marcador negativo **Força Fantasmagórica**. O avanço de turno não repete a salvaguarda.
- Na conjuração, Skimi descreve a ilusão e pode marcar **Ilusão causa dano**. O mestre arbitra se a descrição representar perigo.
- Se a caixa estiver marcada e o alvo falhar na salvaguarda inicial, conceder imediatamente **Força Fantasmagórica · Dano** na seção de usos gratuitos, inclusive no turno da conjuração. Ao clicar no botão, conferir se a ilusão continua ativa e se o alvo original está dentro dela ou a até 1,5 m dela. Se elegível, abrir o ajuste e a rolagem de 2d8 psíquico sem cobrar ação, reação ou outro espaço de magia. Limitar a uma vez em cada turno do conjurador.
- Enquanto afetado, o alvo ganha **Estudar** nas ações comuns. O mestre pode executar a ação pelo alvo. Ela cobra uma ação em combate e rola Inteligência (Investigação) contra a CD guardada da conjuração. Sucesso remove o marcador e o token. O marcador explica essa opção.
- Remover o marcador, Estudar, a opção gratuita do conjurador e o token ao encerrar a ilusão, inclusive por sucesso em Estudar, fim da concentração ou expiração.

## Queda Suave

- Uso interpretativo. O jogador declara a reação de uma queda e registra o uso da magia na ficha, com o custo normal de reação e espaço. O mestre resolve a queda sem depender de detecção automática.
- O mesmo fluxo registra a reação fora de combate, com o gasto normal do espaço de magia. Queda Suave segue as regras de 2024 e não pode ser conjurada como ritual.

## Critério de fechamento

Uma ficha será marcada como fechada quando:

1. ataque, magia, recurso, descanso e reação principais tiverem teste automatizado;
2. todas as suas opções mecânicas tiverem a cobertura exigida pelo escopo da ficha;
3. opções de interpretação aprovadas tiverem registro e custo aplicável verificados, incluindo marcador ou efeito mecânico quando indicado;
4. um smoke test visual concluir um turno padrão sem erro de console;
5. compactar, salvar e reabrir a ficha não duplicar definições nem perder estado.

## Próxima ordem de testes

1. Loteria e Draven: sequências marciais e consumo combinado de recursos.
2. Zurich e Dragoberto: marcas, áreas, ataques adicionais e gatilhos por alvo.
3. Nikki e Skimi: conjuração, reação, concentração, variantes e múltiplos alvos.
4. Hannah: suporte, dados concedidos, condições e ações narrativas assistidas.

