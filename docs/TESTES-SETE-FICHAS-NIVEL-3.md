# Fechamento das sete fichas de nível 3

Estado na versão 0.8.7: testes em andamento. Este documento separa o que já foi comprovado pelo motor do que ainda depende dos módulos propostos para a cobertura completa do nível 3.

## Base comum já comprovada

- As sete fichas carregam simultaneamente por referências do catálogo central.
- Toda ficha conclui um ataque básico com a arma equipada, consome a Ação e aplica o dano ao alvo.
- Ataques guardados não aparecem; arremesso, mão fraca, duas mãos, acuidade, distância, proficiência e Artes Marciais derivam do item e do portador atual.
- Iniciativa, perícias, salvaguardas, concentração, condições, descanso, carga, lojas, troca, resistências e treze tipos de dano possuem regressão automatizada.
- As opções ainda não portáteis continuam utilizáveis como declaração assistida, mas não contam como fechamento mecânico da ficha.

## Matriz por personagem

| Ficha | Fluxos principais já testados | Pendências relevantes para o fechamento |
|---|---|---|
| Dragoberto | Cimitarra/arco, Arquearia, Golpe Certeiro, duas formas de Sopro Dracônico, Marca do Predador, Golpe Constritor e Destruidor de Hordas. | Presa do Caçador ainda é assistida; variantes narrativas dependem de M03/M14. |
| Draven Thorne | Espada Grande, Surto de Ação, Recuperar Fôlego, Atacante Selvagem, Queimadura de Fogo, Ataque Ameaçador e duração de Caído. | Ataque Prostrador, Desarme e parte da seleção de manobras precisam do compositor M04 e escolhas M03. |
| Hannah Montana | Adagas/mão fraca, Inspiração de Bardo, Fogo das Fadas, Zombaria Viciosa e Ancestralidade Feérica. | Arrombar, Detectar Magia, Falar com Animais, Arte Druídica e Ilusão Menor exigem adjudicação estruturada M14 ou efeitos declarativos adicionais. |
| Loteria | Lança, Golpe Desarmado, soco bônus, Torrente de Golpes, Mão de Dolo, Mão de Cura, Defletir Ataques, Valentão de Taverna e Metabolismo Aprimorado. | Mão de Dolo fora da Torrente e escolhas situacionais precisam ser consolidadas no compositor M04/M03. |
| Nikki Lauda | Adagas, Mísseis Mágicos, Sopro de Dragão, Fonte de Magia, Feitiçaria Inata, Magia Potencializada, Talho Mental, Toque Chocante e Passo Nebuloso gratuito. | Magia Duplicada, Detectar Pensamentos, Queda Suave, Mãos Mágicas, Taumaturgia e Fala Telepática dependem sobretudo de M02/M03/M14. |
| Skimi | Adagas, Rajada Mística, Imobilizar Pessoa, Riso Histérico, Invisibilidade, Sussurros Dissonantes, Astúcia Mágica, Ponto de Sorte e Inspiração Heroica. | Familiar exige M06; Força Fantasmagórica, Detectar Pensamentos, Disfarçar-se, Mãos Mágicas, Mensagem, Taumaturgia e Mente Desperta exigem M07/M14 e escolhas. |
| Zurich | Arco/cimitarra/espada curta, Ágil, Marca do Predador, Lentidão, Emaranhar, Orientação, Saraivada de Espinhos, resistências por alvo e sequência de arma leve. | Assassino de Colossos precisa ser generalizado no barramento M02; Falar com Animais e Arte Druídica permanecem assistidas por M14. |

## Critério de fechamento

Uma ficha será marcada como fechada quando:

1. ataque, magia, recurso, descanso e reação principais tiverem teste automatizado;
2. todas as suas opções mecânicas forem portáteis ou parciais com módulo identificado;
3. opções narrativas abrirem um pedido estruturado ao mestre em vez de depender de texto solto;
4. um smoke test visual concluir um turno padrão sem erro de console;
5. compactar, salvar e reabrir a ficha não duplicar definições nem perder estado.

## Próxima ordem de testes

1. Loteria e Draven: sequências marciais e consumo combinado de recursos.
2. Zurich e Dragoberto: marcas, áreas, ataques adicionais e gatilhos por alvo.
3. Nikki e Skimi: conjuração, reação, concentração, variantes e múltiplos alvos.
4. Hannah: suporte, dados concedidos, condições e ações narrativas assistidas.

