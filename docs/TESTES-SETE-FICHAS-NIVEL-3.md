# Fechamento das sete fichas de nível 3

Estado em 0.8.34. As issues #56–#62 foram revistas para retirar entregas comprovadas das pendências. A suíte tem 236 testes passando; verificações em sala real permanecem abertas.

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
| Draven Thorne | Espada Grande, Surto de Ação, Recuperar Fôlego, Atacante Selvagem, Queimadura de Fogo, Ataque Ameaçador e duração de Caído. **0.8.26:** uma manobra por ataque também nas composições, sem gasto quando o ataque erra; Ataque de Desarme retira a arma do slot (60/40 entre duas armas diferentes) e reequipar gasta uma ação; crítico do ataque de oportunidade dobra os dados e escolhe a melhor arma. | Prostrador verifica tamanho Grande ou menor desde a 0.8.28. Falta o smoke visual em sala real de um turno com manobra. |
| Hannah Montana | Adagas/mão fraca, Inspiração de Bardo, Fogo das Fadas, Zombaria Viciosa e Ancestralidade Feérica. **0.8.28:** Ilusão Menor como peça visual estática pública com duração. | Smoke visual da peça em sala real. |
| Loteria | Lança, Golpe Desarmado, soco bônus, Torrente de Golpes com composição independente dos dois golpes, Mão de Cura, Defletir Ataques, Valentão de Taverna e Metabolismo Aprimorado. **0.8.26:** Mão de Dolo oferecida após acerto do Golpe Desarmado e pré-selecionável na Gaveta da Torrente ("Soco + Mão de Dolo"), cobrando 1 Foco quando aplicada e com limite compartilhado. | Pré-seleção na Gaveta da Ação entregue na 0.8.28. Falta a pré-seleção no soco bônus das Artes Marciais e o smoke visual em sala real. |
| Nikki Lauda | Adagas, Mísseis Mágicos, Explosão Elemental com sete tipos na Gaveta de Composição, Sopro de Dragão, Fonte de Magia, Feitiçaria Inata, Talho Mental, Toque Chocante e Passo Nebuloso gratuito. **0.8.26:** Magia Potencializada rerrola até 3 dados escolhidos por 1 ponto e usa os novos resultados; Magia Duplicada na Gaveta antes da conjuração (+1 círculo efetivo, mesmo espaço, 1 ponto), oferecida só para magias que ganham alvo. Nenhuma magia preparada atual da Nikki é elegível, então a opção não aparece para ela hoje. | Dados explosivos, Taumaturgia, Mãos Mágicas e registro/custo de Queda Suave entregues na 0.8.28. Falta validar em sala real do Owlbear/Dice+ os fluxos de magia, invocação e Metamagia. |
| Skimi | Adagas, Rajada Mística, Imobilizar Pessoa, Riso Histérico, Invisibilidade, Sussurros Dissonantes, Astúcia Mágica, Ponto de Sorte e Inspiração Heroica. | Familiar, Mãos Mágicas e Taumaturgia entregues na 0.8.28. Pendentes Força Fantasmagórica, marcadores de Disfarçar-se e Mente Desperta, restrições por tipo de criatura e validação em sala real. |
| Zurich | Arco/cimitarra/espada curta, Ágil, Marca do Predador, Lentidão, Emaranhar, Orientação, Saraivada de Espinhos, resistências por alvo e sequência de arma leve. **0.8.26:** Assassino de Colossos em ataque simples, composto e de oportunidade, com limite por turno da mesa; Ágil + Destruidor de Hordas na mesma Ação quando ativo; escolha da Presa do Caçador no descanso. | Área persistente de Emaranhar e trajetória hostil entregues na 0.8.28. Falta o smoke visual em sala real da zona e da Gaveta com três etapas. |

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
2. Zurich: smoke visual da área persistente de Emaranhar e da prévia vermelha (motor coberto na 0.8.28).
3. Nikki e Skimi: conjuração, reação, concentração, variantes e múltiplos alvos.
4. Hannah: suporte, dados concedidos, condições e ações narrativas assistidas.

## Resultado da 0.8.28

- Suíte automatizada: 215/215 (`node --test combate.test.mjs`); `validar-versao`, `gerar-catalogo-runtime --check` e sintaxe de todos os módulos de `site/` sem erro.
- **M05 (#44):** módulo `site/zonas.mjs` com geometria euclidiana contínua compartilhada por motor e HUD. Emaranhar cria zona pública com identidade, origem, geometria, duração (10 rodadas), concentração e gatilhos. Testado no motor: conjuração (Contido só para quem falha, conjurador poupado), travessia completa com custo em dobro só no trecho interno e sem salvaguarda, várias zonas sobrepostas sem dupla contagem, gatilho genérico de entrada (salvaguarda + dano), ação de se soltar (Atletismo contra a CD), fim da concentração limpando área e Contido, expiração em combate e pelo avanço de tempo do mestre, e restauração idempotente após JSON/recarga.
- **M08 (#47):** prévia de movimento vermelha a partir do primeiro contato com zona que afeta quem se move, inclusive atravessando a área. A função de contato é testada no motor; o desenho na HUD foi verificado só por sintaxe.
- **M06 (#45):** Encontrar Familiar e Mãos Mágicas criam entidades com ficha própria, dono e lado de quem invocou, iniciativa de reforço em combate, Dispensar, fim por duração, concentração ou 0 PV. Ilusão Menor cria peça visual estática pública. O token real (moeda com T, id fixo, sem duplicar) é criado pelo mestre no bridge; esse trecho e o desenho das peças na HUD não foram executados em sala.
- **Fichas:** Prostrador respeita tamanho Grande ou menor (M10); Explosão Elemental com dados explosivos (até 3 d8, M13); Taumaturgia com Vantagem em Intimidação por 1 minuto; Queda Suave registra e gasta reação e espaço; Gaveta do Golpe Desarmado avulso prepara Mão de Dolo.
- **Bug encontrado na validação:** a entidade invocada nascia do lado "npc" e a própria conjuradora tinha ataque de oportunidade contra ela. Corrigido: a entidade herda o lado de quem invocou.
- **Não verificado em sala real:** nada desta entrega foi executado dentro de uma sala do Owlbear com Dice+. Todos os testes são de motor (Node) com dados simulados. Falta o smoke visual de zonas, peças, tokens de invocação e prévia vermelha.

## Resultado da 0.8.26

- Suíte automatizada: 202/202 (`node --test combate.test.mjs`).
- Novos testes: Assassino de Colossos (simples, composto, oportunidade e reabertura), crítico de reação, Destruidor de Hordas (avulso, Gaveta, alvo já atacado, Zurich com Ágil e reabertura), Desarme (arma única e sorteio 60/40), manobra na composição, Mão de Dolo preparada, Magia Potencializada por dados, Magia Duplicada e escolha da Presa do Caçador após descanso.
- Correções sistêmicas encontradas na validação: limite "uma vez por turno" não renovava no turno de outra criatura; ataque de oportunidade não oferecia aprimoramentos pós-acerto e calculava crítico errado; ataque composto não aplicava desvantagem a distância, Caído distante, alcance longo nem a restrição de Enfeitiçado; ativação de habilidades de grupo exclusivo não persistia ao compactar a ficha.
- Revisão da contribuição de Soneka: testes adicionais comprovam a renovação do limite ao iniciar outro combate com os mesmos participantes e a preservação de usos já gastos em mesas salvas antes da 0.8.26. A ponte recusa dados repetidos antes de solicitar uma rerrolagem.
- Teste local em Chromium headless com SDK Owlbear e respostas Dice+ simulados: Magia Potencializada permite escolher dois dos três d8, altera o total de 6 para 18, cobra um ponto e aplica 18 PV em cada um dos dois alvos após as salvaguardas. O compositor de Magia Duplicada permite selecionar dois alvos. A escolha de Presa do Caçador persiste após recarregar.
- O mesmo teste percorre Destruidor de Hordas pela Gaveta e pelo botão avulso. O cartão avulso mostra o alcance real da arma anterior, recusa o alvo original e conserva o círculo de 1,5 m após selecionar uma criatura elegível. Os grupos importados por pasta também passaram no teste local da interface.
- A checagem dentro de uma sala real do Owlbear com Dice+ continua pendente para cada ficha listada acima.

## Ponto de pausa da 0.8.24

Registro histórico, superado pela integração da 0.8.26. Na 0.8.24, o trabalho parou na issue [#65 — paridade de maestrias e aprimoramentos em ataques compostos](https://github.com/LucasLMentzingem/Extens-o-de-Batalha-Din-mica-OwlBear/issues/65). A suíte automatizada terminou com 185/185 testes. Ainda falta provar Assassino de Colossos em ataque simples, composto e reação; limite e consumo de manobras nas composições; Destruidor de Hordas nos fluxos normal e pela Gaveta; e smoke test visual/persistência em Owlbear.

