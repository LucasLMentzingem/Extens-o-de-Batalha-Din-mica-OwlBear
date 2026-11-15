# Fechamento das sete fichas de nível 3

Estado em 0.8.26: testes em andamento; cobertura de motor ampliada para Dragoberto, Draven, Loteria, Nikki e Zurich. Este documento separa o que já foi comprovado pelo motor do que ainda depende dos módulos propostos para a cobertura completa do nível 3.

A [classificação aprovada de habilidades de interpretação](HABILIDADES-DE-INTERPRETACAO.md) define os casos que exigem apenas registro e custo aplicável. As decisões posteriores de invocação estão na [pré-arquitetura do M06](mapeamento-nivel-3/PRE-ARQUITETURA-MODULOS.md#m06--entidades-familiares-e-objetos-vinculados--ausente).

## Base comum já comprovada

- As sete fichas carregam simultaneamente por referências do catálogo central.
- Toda ficha conclui um ataque básico com a arma equipada, consome a Ação e aplica o dano ao alvo.
- Ataques guardados não aparecem; arremesso, mão fraca, duas mãos, acuidade, distância, proficiência e Artes Marciais derivam do item e do portador atual.
- Iniciativa, perícias, salvaguardas, concentração, condições, descanso, carga, lojas, troca, resistências e treze tipos de dano possuem regressão automatizada.
- Bênção expira após 60 segundos no relógio fora de combate e avança por rodada em combate; oportunidades consideram toda a linha percorrida, inclusive cruzamentos completos e múltiplos inimigos no trajeto.
- Ataque composto de Zurich aplica Marca do Predador em cada acerto e oferece o dano persistente no ajuste de cada instância.
- Ataques compostos também aplicam dano garantido quando erram, efeitos de maestria quando acertam e vantagem/desvantagem por instância. A suíte cobre esses fluxos no motor.
- As opções ainda não portáteis continuam utilizáveis como declaração assistida, mas não contam como fechamento mecânico da ficha.

## Matriz por personagem

| Ficha | Fluxos principais já testados | Pendências relevantes para o fechamento |
|---|---|---|
| Dragoberto | Cimitarra/arco, Arquearia, Golpe Certeiro com Gaveta de Composição para arma e dano, duas formas de Sopro Dracônico, Marca do Predador, Golpe Constritor. **0.8.26:** Destruidor de Hordas avulso e pela Gaveta (mesma arma, 1,5 m do alvo original, alcance, alvo não atacado, ataque inicial pode errar, limite compartilhado), prévia dos alvos elegíveis, Assassino de Colossos quando ativo e escolha da Presa do Caçador no descanso. | Smoke visual: círculo de 1,5 m e destaque dos alvos no Owlbear, nos dois fluxos; reabrir a sala no meio do turno. |
| Draven Thorne | Espada Grande, Surto de Ação, Recuperar Fôlego, Atacante Selvagem, Queimadura de Fogo, Ataque Ameaçador e duração de Caído. **0.8.26:** uma manobra por ataque também nas composições, sem gasto quando o ataque erra; Ataque de Desarme retira a arma do slot (60/40 entre duas armas diferentes) e reequipar gasta uma ação; crítico do ataque de oportunidade dobra os dados e escolhe a melhor arma. | Ataque Prostrador ainda não verifica tamanho Grande ou menor (M10). Smoke visual de um turno com manobra. |
| Hannah Montana | Adagas/mão fraca, Inspiração de Bardo, Fogo das Fadas, Zombaria Viciosa e Ancestralidade Feérica. | Ilusão Menor: token visual estático, sem ficha. |
| Loteria | Lança, Golpe Desarmado, soco bônus, Torrente de Golpes com composição independente dos dois golpes, Mão de Cura, Defletir Ataques, Valentão de Taverna e Metabolismo Aprimorado. **0.8.26:** Mão de Dolo no golpe da Ação e na Torrente, preparada na Gaveta ("Soco + Mão de Dolo") só cobrando 1 Foco se acertar, limite de uma vez por turno compartilhado com o botão avulso. | Smoke visual da Gaveta com três modos e da marcação prévia no ajuste de dano. |
| Nikki Lauda | Adagas, Mísseis Mágicos, Explosão Elemental com sete tipos na Gaveta de Composição, Sopro de Dragão, Fonte de Magia, Feitiçaria Inata, Talho Mental, Toque Chocante e Passo Nebuloso gratuito. **0.8.26:** Magia Potencializada rerrola até 3 dados escolhidos por 1 ponto e usa os novos resultados; Magia Duplicada na Gaveta antes da conjuração (+1 círculo efetivo, mesmo espaço, 1 ponto), oferecida só para magias que ganham alvo. Nenhuma magia preparada atual da Nikki é elegível, então a opção não aparece para ela hoje. | Dados explosivos (M13) e buff de Intimidação de Taumaturgia (M01). Mãos Mágicas: token controlável com ficha própria (M06). Queda Suave: verificar custo e registro de uso interpretativo. Smoke visual do seletor de dados com o Dice+. |
| Skimi | Adagas, Rajada Mística, Imobilizar Pessoa, Riso Histérico, Invisibilidade, Sussurros Dissonantes, Astúcia Mágica, Ponto de Sorte e Inspiração Heroica. | Familiar, Força Fantasmagórica, marcador de Disfarçar-se e buff de Intimidação de Taumaturgia. Mãos Mágicas: token controlável com ficha própria. Mente Desperta: marcadores interpretativos nos dois participantes. |
| Zurich | Arco/cimitarra/espada curta, Ágil, Marca do Predador, Lentidão, Emaranhar, Orientação, Saraivada de Espinhos, resistências por alvo e sequência de arma leve. **0.8.26:** Assassino de Colossos em ataque simples, composto e de oportunidade, com limite por turno da mesa; Ágil + Destruidor de Hordas na mesma Ação quando ativo; escolha da Presa do Caçador no descanso. | Área persistente de Emaranhar no M05. Smoke visual da Gaveta com três etapas. |

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

1. Smoke visual em Owlbear dos fluxos entregues na 0.8.26 (Dragoberto, Draven, Loteria, Nikki e Zurich).
2. Zurich: área persistente de Emaranhar (M05).
3. Nikki e Skimi: conjuração, reação, concentração, variantes e múltiplos alvos.
4. Hannah: suporte, dados concedidos, condições e ações narrativas assistidas.

## Resultado da 0.8.26

- Suíte automatizada: 200/200 (`node --test combate.test.mjs`).
- Novos testes: Assassino de Colossos (simples, composto, oportunidade e reabertura), crítico de reação, Destruidor de Hordas (avulso, Gaveta, alvo já atacado, Zurich com Ágil e reabertura), Desarme (arma única e sorteio 60/40), manobra na composição, Mão de Dolo preparada, Magia Potencializada por dados, Magia Duplicada e escolha da Presa do Caçador após descanso.
- Correções sistêmicas encontradas na validação: limite "uma vez por turno" não renovava no turno de outra criatura; ataque de oportunidade não oferecia aprimoramentos pós-acerto e calculava crítico errado; ataque composto não aplicava desvantagem a distância, Caído distante, alcance longo nem a restrição de Enfeitiçado; ativação de habilidades de grupo exclusivo não persistia ao compactar a ficha.
- Smoke local (simulador em navegador headless): páginas carregam sem erro de console; painel de escolha após descanso funciona como mestre. A checagem dentro do Owlbear com Dice+ continua pendente para cada ficha listada acima.

## Ponto de pausa da 0.8.24

O trabalho parou na issue [#65 — paridade de maestrias e aprimoramentos em ataques compostos](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/65). A suíte automatizada terminou com 185/185 testes. Ainda falta provar Assassino de Colossos em ataque simples, composto e reação; limite e consumo de manobras nas composições; Destruidor de Hordas nos fluxos normal e pela Gaveta; e smoke test visual/persistência em Owlbear.

