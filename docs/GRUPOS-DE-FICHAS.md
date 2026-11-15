# Grupos fixos de fichas

O Controle de fichas do mestre lê `site/grupos-fichas.json`. Os grupos começam recolhidos e permitem adicionar unidades ou o grupo inteiro. A importação acrescenta fichas às existentes e cada cópia recebe uma identidade de ator própria, sem token ou jogador vinculado.

## Aventureiros

Dragoberto, Draven Thorne, Hannah Montana, Loteria, Nikki Lauda, Skimi e Zurich. As definições continuam em seus sete arquivos de referência.

## Soldados do Reino

Foram adaptadas as versões mais recentes da guarda da aventura anterior.

| Ficha | Fonte | PV | CA equipada |
| --- | --- | --- | --- |
| Soldado do Reino, nível 3 | Soldado-Nv3.json | 24 | 16 |
| Comandante do Reino, nível 4 | Comandante-Nv4.json | 42 | 17 |
| Mago do Reino, nível 3 | Mago-Nv3.json | 21 | 12 |
| Arqueiro do Reino, nível 3 | Arqueiro-Nv3.json | 21 | 14 |

As fontes ficam no projeto de campanha, em Asset/Tokens/character/Guarda do marques. Esses NPCs caseiros usam níveis de campanha. Eles possuem apenas as características declaradas e não recebem a progressão completa de classes de jogador.

As fichas publicadas em `site/fichas/reino-*.json` usam o formato 2, com referências compartilhadas. Armas e armaduras são itens reais e podem ser saqueados. Os ataques são derivados dos atributos e equipamentos. Alcances seguem o teto sistêmico de 18 m.

O Mago possui quatro espaços de 1º círculo e dois de 2º. Raio de Gelo, Mísseis Mágicos e Passo Nebuloso utilizam automações disponíveis. Graxa e Escudo Arcano conservam custos, preparação e descrições com efeito assistido pelo mestre.

Conter avanço, Disparo preparado, Golpe de comando, Reposicionar soldado e Aparar preservam as regras caseiras como habilidades assistidas. Os usos por combate de Disparo preparado e Golpe de comando recuperam ao iniciar um combate. Reposicionar soldado possui três usos por descanso longo.

Durante um combate, as fichas acrescentadas entram pelo fluxo de reforços, com iniciativa em desvantagem ajustável. A importação de grupo é uma transação única. Uma ficha inválida impede a operação inteira.

## Acrescentar grupos

Adicione um registro com `id`, `nome` e uma lista `fichas`. Cada entrada informa o ID do arquivo JSON sem extensão e o nome exibido. Os arquivos precisam passar por `validar` do motor e referenciar entradas existentes nos catálogos. Consulte o manual de criação de fichas.
