# Escudo Arcano e Veste do Último Fôlego como reação ao ser atingido — 0.8.73

Pedido do Lucas (19/11/2026): o Escudo Arcano deve aparecer como reação ao receber um ataque, aumentar a CA e, se for o caso, transformar o acerto em erro. A Veste do Último Fôlego, quando equipada, deve gerar a reação de reduzir o dano.

## Problemas encontrados

1. **Ataques pela Gaveta de Composição** (Golpe Certeiro, golpe desarmado da Loteria, Explosão Elemental, Cimitarra do Zurich e outros) aplicavam o dano direto, sem abrir a janela "ao ser atingido". Por isso nem a Veste nem o Escudo eram oferecidos. Só abria a janela "depois de sofrer dano", quando já não havia como evitar ou reduzir o golpe. Nos ataques simples a reação já funcionava.
2. **Escudo Arcano do Mago do Reino:** estava cadastrado como habilidade assistida, sem gatilho e sem automação, e nunca aparecia como reação.
3. **Gaveta com mais de um golpe:** uma reação "depois de sofrer dano" aberta no meio da sequência impedia a reação de antes do dano nos golpes seguintes.

## Correção

- **A Gaveta para no acerto.** Quando um golpe acerta um alvo que tem uma reação "ao ser atingido" disponível, a sequência para antes do dano. Depois da resposta do alvo, continua daquele mesmo golpe:
  - Escudo Arcano: +5 na CA até o início do próximo turno. Se o total do ataque ficar abaixo da nova CA, o golpe vira erro. Crítico continua acertando.
  - Veste: o dano daquele golpe é reduzido.
  - Recusar a reação: o golpe segue com o dano inteiro.
  - Os golpes seguintes rolam normalmente e podem pausar de novo.
- **Sem cobrança dupla:** a continuação não cobra a ação nem os recursos outra vez. Os dados de dano do atacante continuam indo para quem o controla.
- **Continuação protegida:** a continuação é um estado interno da mesa, e um comando forjado por um jogador é recusado.
- **Escudo Arcano em qualquer ficha:** toda opção chamada "Escudo Arcano" com custo de reação e sem automação vira reação automática ao ser atingido. O catálogo do Mago do Reino também foi atualizado.
- **Fila de reações:** as reações "depois de sofrer dano" ficam na fila enquanto a Gaveta está em andamento e abrem no fim da sequência.

## Fora desta correção

- Dano de magias com salvaguarda (sem jogada de ataque) não abre a Veste, que reage a ataques.
- Ataques de oportunidade feitos durante outra reação também não abrem a janela, porque só existe uma reação pendente por vez.

## Verificação

- `reacoes-preventivas.test.mjs` com 7 testes:
  - Veste pela Gaveta, com redução e a ação cobrada uma vez;
  - recusar a reação;
  - Escudo transformando o acerto em erro;
  - Escudo que não basta contra um total alto;
  - Escudo no ataque simples;
  - Gaveta de dois golpes com duas pausas;
  - continuação forjada recusada.
- Todos os arquivos de teste passam (479). `validar-versao` e `gerar-catalogo-runtime --check` passam.
- **Ainda não verificado:** nada foi testado numa sala real do Owlbear com Dice+.
