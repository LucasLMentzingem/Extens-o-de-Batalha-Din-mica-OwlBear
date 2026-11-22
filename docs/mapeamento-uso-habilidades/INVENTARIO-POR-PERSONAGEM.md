# Inventário por personagem — uso contextual e resolução assistida

Gerado por `node mapear-uso-habilidades.mjs`. Base 0.8.82, 21/11/2026. Não implementa confirmação nem altera fichas. Classificação de triagem; [arquitetura e revisão humana](../ARQUITETURA-CONFIRMACAO-USO-HABILIDADES-2026-11-21.md) prevalecem.

- versao: 0.8.82
- commit: 9c66d74d6642dff22efadc131c72a4174cca4bb1
- data: 2026-11-21
- fichas: 24
- opcoes: 399
- passivas: 58
- catalogo: 327
- opcoesSemAutomacao: 122
- catalogoSemAutomacao: 130

O JSON contém todas as definições do catálogo e todas as opções/passivas normalizadas destas fontes. O CSV contém todas as instâncias. As tabelas abaixo focam contextuais, assistidas e híbridas, omitindo ataques/curas comuns sem sinal contextual.

## Drow necromante — Nv6

Fonte: `conteudo/aventura-no-cemiterio/drow-necromante-6.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Escudo Arcano · `escudo-arcano` | reacao | ser_atingido | [{"tipo":"reacao","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Automática antes do dano; manual bloqueada. |
| Animar Mortos · `animar-mortos` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-3","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |

## Goblin 1 — séquito do necromante

Fonte: `conteudo/aventura-no-cemiterio/goblin-1.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Fuga Ágil · Esconder-se · `esconder` | declaracao-assistida | null | [{"tipo":"bonus","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Dano por vantagem · `vantagem` | adicional-pos-acerto | apos_acerto | [] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |

## Goblin 2 — séquito do necromante

Fonte: `conteudo/aventura-no-cemiterio/goblin-2.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Fuga Ágil · Esconder-se · `esconder` | declaracao-assistida | null | [{"tipo":"bonus","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Dano por vantagem · `vantagem` | adicional-pos-acerto | apos_acerto | [] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |

## Zumbigoblin

Fonte: `conteudo/aventura-no-cemiterio/goblin-zumbi.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Fortitude de Morto-vivo · `fortitude` | passiva-ou-traco | null | [] | Sem declaração avulsa normal; consultar gatilho/evento ou texto. Não cobrar recurso outra vez. |

## Irineu — Ladino Nv3

Fonte: `conteudo/aventura-no-cemiterio/irineu-ladino-3.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ação Ardilosa · Esconder-se · `esconder` | declaracao-assistida | null | [{"tipo":"bonus","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque Furtivo — 2d6 · `furtivo` | adicional-pos-acerto | apos_acerto | [] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |
| Mira Firme · `mira` | declaracao-assistida | null | [{"tipo":"bonus","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Mãos Rápidas · `maos-rapidas` | declaracao-assistida | null | [{"tipo":"bonus","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |

## Mímico

Fonte: `conteudo/aventura-no-cemiterio/mimico.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Mudar Forma · `forma` | declaracao-assistida | null | [{"tipo":"bonus","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ácido do mímico · `acido` | adicional-pos-acerto | apos_acerto | [] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |
| Aderência e imunidades · `aderencia` | passiva-ou-traco | null | [] | Sem declaração avulsa normal; consultar gatilho/evento ou texto. Não cobrar recurso outra vez. |

## Padre Quevedo

Fonte: `conteudo/aventura-no-cemiterio/padre-quevedo.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Taumaturgia · `taumaturgia` | hibrida | null | [{"tipo":"acao","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Luz · `luz` | hibrida | null | [{"tipo":"acao","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Detectar Magia · `detectar` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Proteção contra o Bem e o Mal · `protecao` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Prece de Cura · `prece` | hibrida | {"somenteForaCombate":true} | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-2","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Custo e efeito têm etapas; não duplicar confirmação/cobrança na conclusão. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Acalmar Emoções · `acalmar` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-2","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Dissipar Magia · `dissipar` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-3","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Remover Maldição · `remover` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-3","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Revivificar · `revivificar` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-3","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Expulsar Mortos-vivos / Abrasar · `expulsar` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"canalizar-divindade","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |

## Seu Furtado — Zumbi Nv4

Fonte: `conteudo/aventura-no-cemiterio/seu-furtado-zumbi-4.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Mãos da sepultura — reação · `agarrar-passagem` | reacao | null | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Falar com os Mortos · Última Palavra · `item-furtado-colar-unico-falar-com-os-mortos` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"item-furtado-colar-unico-ultima-palavra","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Tenacidade cadavérica · `tenacidade-morta` | passiva-ou-traco | null | [] | Sem declaração avulsa normal; consultar gatilho/evento ou texto. Não cobrar recurso outra vez. |

## Zumbi padrão — Nv3

Fonte: `conteudo/aventura-no-cemiterio/zumbi-padrao-3.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Tenacidade cadavérica · `tenacidade-morta` | passiva-ou-traco | null | [] | Sem declaração avulsa normal; consultar gatilho/evento ou texto. Não cobrar recurso outra vez. |

## Zumbi reanimado

Fonte: `conteudo/aventura-no-cemiterio/zumbi-reanimado.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Fortitude de Morto-vivo · `fortitude` | passiva-ou-traco | null | [] | Sem declaração avulsa normal; consultar gatilho/evento ou texto. Não cobrar recurso outra vez. |

## Dragoberto

Fonte: `site/fichas/dragoberto.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ajudar  /  ação · `ajudar-acao-7` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Esconder  /  ação · `esconder-se-acao-8` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Preparar  /  ação · `preparar-acao-9` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Procurar  /  ação · `procurar-acao-10` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Analisar  /  ação · `estudar-acao-11` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Influenciar  /  ação · `influenciar-acao-12` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Objeto  /  ação · `utilizar-acao-13` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Magia  /  ação · `usar-magia-acao-14` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade  /  reação · `ataque-de-oportunidade-reacao-15` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Presa do Caçador · `presa-do-cacador-16` | seletor-ou-resumo | null | [] | Resumo de escolha/recursos, não efeito independente a cobrar. |
| (Habilitado) Destruidor de Hordas · `habilitado-destruidor-de-hordas-18` | dependencia-de-ataque | {"aposAtaque":true,"tagsAtaqueAnterior":["arma"],"umaVezPorTurno":"habilitado-destruidor-de-hordas-18","alvoDiferenteDoAnterior":true,"distanciaDoAlvoAnteriorM":1.5,"somenteNoProprioTurno":true,"alvoNaoAtacadoNoTurno":true} | [] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |
| 1º  /  Golpe Constritor · `1-golpe-constritor-26` | dependencia-de-ataque | {"aposAcerto":true,"tagsAtaqueAnterior":["arma"],"alvoIgualAoAnterior":true} | [{"tipo":"bonus","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |
| Gastar Dado de Vida · `gastar-dado-de-vida` | mecanica-configurada | {"somenteForaCombate":true} | [{"tipo":"recurso","id":"dados-de-vida","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Fora de combate não comprova descanso concluído nem tempo transcorrido. |

## Draven Thorne

Fonte: `site/fichas/draven-thorne.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ajudar  /  ação · `ajudar-acao-8` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Esconder  /  ação · `esconder-se-acao-9` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Preparar  /  ação · `preparar-acao-10` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Procurar  /  ação · `procurar-acao-11` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Analisar  /  ação · `estudar-acao-12` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Influenciar  /  ação · `influenciar-acao-13` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Objeto  /  ação · `utilizar-acao-14` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Magia  /  ação · `usar-magia-acao-15` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade  /  reação · `ataque-de-oportunidade-reacao-16` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Manobras · `manobras-17` | seletor-ou-resumo | null | [] | Resumo de escolha/recursos, não efeito independente a cobrar. |
| Ataque Prostrador · `manobra-prostrar` | adicional-pos-acerto | apos_acerto | [{"tipo":"recurso","id":"dados-de-superioridade","quantidade":1}] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |
| Ataque Ameaçador · `manobra-ameacador` | adicional-pos-acerto | apos_acerto | [{"tipo":"recurso","id":"dados-de-superioridade","quantidade":1}] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |
| Ataque de Desarme · `manobra-desarmar` | adicional-pos-acerto | apos_acerto | [{"tipo":"recurso","id":"dados-de-superioridade","quantidade":1}] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |
| Queimadura de Fogo · `queimadura-de-fogo-apos-acerto` | adicional-pos-acerto | apos_acerto | [{"tipo":"recurso","id":"queimadura-de-fogo","quantidade":1}] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |
| Gastar Dado de Vida · `gastar-dado-de-vida` | mecanica-configurada | {"somenteForaCombate":true} | [{"tipo":"recurso","id":"dados-de-vida","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Fora de combate não comprova descanso concluído nem tempo transcorrido. |

## Hannah Montana

Fonte: `site/fichas/hannah-montana.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ajudar  /  ação · `ajudar-acao-7` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Esconder  /  ação · `esconder-se-acao-8` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Preparar  /  ação · `preparar-acao-9` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Procurar  /  ação · `procurar-acao-10` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Analisar  /  ação · `estudar-acao-11` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Influenciar  /  ação · `influenciar-acao-12` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Objeto  /  ação · `utilizar-acao-13` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Magia  /  ação · `usar-magia-acao-14` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade  /  reação · `ataque-de-oportunidade-reacao-15` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Manto de Inspiração · `manto-de-inspiracao-16` | hibrida | null | [{"tipo":"bonus","quantidade":1},{"tipo":"recurso","id":"inspiracao-de-bardo","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| 2º  /  Arrombar · `2-arrombar-23` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-2","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| 2º  /  Reflexos · Glamour, sempre · `2-reflexos-glamour-sempre-24` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-2","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| 1º  /  Detectar Magia · Ritual, Concentração · `1-detectar-magia-ritual-concentracao-26` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| 1º  /  Enfeitiçar Pessoa · Glamour, sempre · `1-enfeiticar-pessoa-glamour-sempre-27` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| 1º  /  Falar com Animais · Ritual · `1-falar-com-animais-ritual-28` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Truque  /  Arte Druídica · Elfo · `truque-arte-druidica-elfo-33` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Truque  /  Ilusão Menor · `truque-ilusao-menor-34` | hibrida | null | [{"tipo":"acao","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Gastar Dado de Vida · `gastar-dado-de-vida` | mecanica-configurada | {"somenteForaCombate":true} | [{"tipo":"recurso","id":"dados-de-vida","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Fora de combate não comprova descanso concluído nem tempo transcorrido. |
| Adaga +4  /  ação bônus · `item-d7ccb7f2-8ed8-57ce-913a-400e40f3c6c8-2-corpo_a_corpo` | dependencia-de-ataque | {"aposAtaque":true,"tagsAtaqueAnterior":["arma","leve"]} | [{"tipo":"bonus","quantidade":1}] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |
| Adaga · arremesso +4  /  ação bônus · `item-d7ccb7f2-8ed8-57ce-913a-400e40f3c6c8-2-arremesso` | dependencia-de-ataque | {"aposAtaque":true,"tagsAtaqueAnterior":["arma","leve"]} | [{"tipo":"bonus","quantidade":1}] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |

## Loteria

Fonte: `site/fichas/loteria.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ajudar  /  ação · `ajudar-acao-9` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Esconder  /  ação · `esconder-se-acao-10` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Preparar  /  ação · `preparar-acao-11` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Procurar  /  ação · `procurar-acao-12` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Analisar  /  ação · `estudar-acao-13` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Influenciar  /  ação · `influenciar-acao-14` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Objeto  /  ação · `utilizar-acao-15` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Magia  /  ação · `usar-magia-acao-16` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade  /  reação · `ataque-de-oportunidade-reacao-17` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Defletir Ataques · `defletir-ataques-20` | reacao | ser_atingido | [{"tipo":"reacao","quantidade":1}] | Automática antes do dano; manual bloqueada. |
| Mão de Dolo · `mao-de-dolo-21` | adicional-pos-acerto | apos_acerto | [{"tipo":"recurso","id":"pontos-de-foco","quantidade":1}] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |
| Metabolismo Incomum · `metabolismo-incomum-acao` | iniciativa-contextual | rolar_iniciativa | [{"tipo":"recurso","id":"metabolismo-incomum","quantidade":1}] | Janela específica; uso avulso bloqueado. |
| Gastar Dado de Vida · `gastar-dado-de-vida` | mecanica-configurada | {"somenteForaCombate":true} | [{"tipo":"recurso","id":"dados-de-vida","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Fora de combate não comprova descanso concluído nem tempo transcorrido. |
| Valentão de Taverna · empurrar 1,5 m · `valentao-empurrar` | dependencia-de-ataque | {"aposAcerto":true,"tagsAtaqueAnterior":["desarmado"],"alvoIgualAoAnterior":true,"umaVezPorTurno":"valentao-de-taverna"} | [] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |
| Mão de Dolo · golpe da Torrente · `mao-de-dolo-torrente` | dependencia-de-ataque | {"aposAcerto":true,"tagsAtaqueAnterior":["desarmado"],"alvoIgualAoAnterior":true,"umaVezPorTurno":"mao-de-dolo-21"} | [{"tipo":"recurso","id":"pontos-de-foco","quantidade":1}] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |

## Nikki Lauda

Fonte: `site/fichas/nikki.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ajudar  /  ação · `866a7e13-2281-5051-9a5a-c35e6718fede` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Esconder  /  ação · `b0fd4ecc-f5c3-580b-998c-e1da88d849d0` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Preparar  /  ação · `355f8cfb-6aa4-5f61-9230-5d06693242e6` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Procurar  /  ação · `9eda9e03-0434-5c10-832d-ae5619d99b13` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Analisar  /  ação · `f534510d-692f-51e8-b717-96fb81736185` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Influenciar  /  ação · `5dc8b70d-95d9-532f-b4e1-5b69f19fae76` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Objeto  /  ação · `94f4d9da-561f-5550-92eb-4391a00512c0` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Magia  /  ação · `a0f3b6fe-0514-510c-ad96-c9a6a904e9a3` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade  /  reação · `0cea639a-ec47-5e72-853f-62b6c65f8b28` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Magia Duplicada  /  ao conjurar · `dfbea7cf-87b9-56c6-9947-23d1fecf7a81` | metamagia-na-conjuracao | null | [{"tipo":"recurso","quantidade":1,"id":"feiticaria"}] | Escolha no compositor da magia; não tratar como magia avulsa. |
| Magia Potencializada  /  ao rolar dano · `ec6fb8a2-8918-5243-815c-641dcc25c382` | rerrolagem-contextual | apos_rolagem_dano | [{"tipo":"recurso","quantidade":1,"id":"feiticaria"}] | Integrada ao pedido/resultado identificado, não cria rerrolagem em uso avulso. |
| Fala Telepática  /  ação bônus · `eddac04f-02a6-5c62-b418-689b784068db` | declaracao-assistida | null | [{"tipo":"bonus","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| 2º  /  Acalmar Emoções · salva de CAR · concentração · aberrante · `e1239dce-62e4-53ba-8bfd-970cb4faacb3` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","quantidade":1,"id":"espaco-2"}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| 2º  /  Detectar Pensamentos · sondagem · concentração · aberrante · `58cc56ae-8d2b-5b21-b9e3-89661a708e38` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","quantidade":1,"id":"espaco-2"}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| 1º  /  Repreensão Diabólica · reação · salva de DES · infernal · `af0ac3c8-7d39-5ef0-97e9-25839f116262` | reacao | sofrer_dano | [{"tipo":"reacao","quantidade":1},{"tipo":"recurso","quantidade":1,"id":"espaco-1"}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| 1º  /  Detectar Magia · ritual · concentração · classe · `4a8dd984-a70f-540b-9260-1864589e63eb` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","quantidade":1,"id":"espaco-1"}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| 1º  /  Queda Suave · reação · classe · `1cb80c0f-ca47-5d69-a977-ca7f4b116555` | reacao | null | [{"tipo":"reacao","quantidade":1},{"tipo":"recurso","quantidade":1,"id":"espaco-1"}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Truque  /  Mãos Mágicas · utilidade · classe · `5fbeafc9-0922-5880-b672-b5ef59286e54` | hibrida | null | [{"tipo":"acao","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Gastar Dado de Vida · `gastar-dado-de-vida` | mecanica-configurada | {"somenteForaCombate":true} | [{"tipo":"recurso","id":"dv","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Fora de combate não comprova descanso concluído nem tempo transcorrido. |
| Adaga +4  /  ação bônus · `item-71b23b93-2133-553f-824a-d9667fa2929d-2-corpo_a_corpo` | dependencia-de-ataque | {"aposAtaque":true,"tagsAtaqueAnterior":["arma","leve"]} | [{"tipo":"bonus","quantidade":1}] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |
| Adaga · arremesso +4  /  ação bônus · `item-71b23b93-2133-553f-824a-d9667fa2929d-2-arremesso` | dependencia-de-ataque | {"aposAtaque":true,"tagsAtaqueAnterior":["arma","leve"]} | [{"tipo":"bonus","quantidade":1}] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |

## Arqueiro do Reino · nível 3

Fonte: `site/fichas/reino-arqueiro-3.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ajudar  /  ação · `ajudar` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Tocar o sino — AÇÃO DA MISSÃO · `9733d2ac-3544-575c-90a9-fe057e862788` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade — REAÇÃO · `cae79d30-a752-5e58-af9d-8befa34d4ea3` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Disparo preparado — 1 vez por combate · `reino-arqueiro-3-habilidade-4` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"disparo-preparado","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |

## Comandante do Reino · nível 4

Fonte: `site/fichas/reino-comandante-4.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ajudar  /  ação · `ajudar` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Tocar o sino — AÇÃO DA MISSÃO · `9733d2ac-3544-575c-90a9-fe057e862788` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade — REAÇÃO · `cae79d30-a752-5e58-af9d-8befa34d4ea3` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Golpe de comando — 1 vez por combate · `reino-comandante-4-habilidade-4` | dependencia-de-ataque | {"aposAcerto":true} | [{"tipo":"recurso","id":"golpe-comando","quantidade":1}] | Há requisito estruturado, mas o ramo sem automação encerra antes da validação específica. |
| Reposicionar soldado — AÇÃO BÔNUS / 3 por descanso longo · `reino-comandante-4-habilidade-5` | declaracao-assistida | null | [{"tipo":"bonus","quantidade":1},{"tipo":"recurso","id":"reposicionar","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Aparar — REAÇÃO · `reino-comandante-4-habilidade-6` | reacao | null | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |

## Mago do Reino · nível 3

Fonte: `site/fichas/reino-mago-3.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ajudar  /  ação · `ajudar` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Tocar o sino — AÇÃO DA MISSÃO · `9733d2ac-3544-575c-90a9-fe057e862788` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade — REAÇÃO · `cae79d30-a752-5e58-af9d-8befa34d4ea3` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Graxa — 1º CÍRCULO / AÇÃO · `reino-mago-3-habilidade-7` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Escudo Arcano (Shield) — 1º CÍRCULO / REAÇÃO · `reino-mago-3-habilidade-8` | reacao | ser_atingido | [{"tipo":"reacao","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Automática antes do dano; manual bloqueada. |

## Soldado do Reino · nível 3

Fonte: `site/fichas/reino-soldado-3.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ajudar  /  ação · `ajudar` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Tocar o sino — AÇÃO DA MISSÃO · `9733d2ac-3544-575c-90a9-fe057e862788` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade — REAÇÃO · `cae79d30-a752-5e58-af9d-8befa34d4ea3` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Conter avanço — 1 vez por turno · `reino-soldado-3-habilidade-4` | dependencia-de-ataque | {"aposAcerto":true,"umaVezPorTurno":"conter-avanco"} | [] | Há requisito estruturado, mas o ramo sem automação encerra antes da validação específica. |

## Skimi

Fonte: `site/fichas/skimi.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Astúcia Mágica · `astucia-magica-acao` | mecanica-configurada | {"somenteForaCombate":true} | [{"tipo":"recurso","id":"astucia-magica","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Fora de combate não comprova descanso concluído nem tempo transcorrido. |
| Mente Desperta · `mente-desperta-acao` | hibrida | null | [{"tipo":"bonus","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Ajudar  /  ação · `ajudar-acao-8` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Esconder  /  ação · `esconder-se-acao-9` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Preparar  /  ação · `preparar-acao-10` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Procurar  /  ação · `procurar-acao-11` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Analisar  /  ação · `estudar-acao-12` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Influenciar  /  ação · `influenciar-acao-13` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Objeto  /  ação · `utilizar-acao-14` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Magia  /  ação · `usar-magia-acao-15` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade  /  reação · `ataque-de-oportunidade-reacao-16` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| 2º  /  Força Fantasmagórica · `2-forca-fantasmagorica-22` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-2","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| 2º  /  Detectar Pensamentos · `2-detectar-pensamentos-23` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-2","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| 2º  /  Sugestão · `2-sugestao-26` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-2","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| 1º  /  Compreender Idiomas · `1-compreender-idiomas-28` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| 1º  /  Disfarçar-se · `1-disfarcar-se-29` | hibrida | null | [{"tipo":"acao","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| 1º  /  Encontrar Familiar · `1-encontrar-familiar-30` | hibrida | {"somenteForaCombate":true} | [] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| 1º  /  Enfeitiçar Pessoa · `1-enfeiticar-pessoa-31` | hibrida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-2","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Truque  /  Amizade · `truque-amizade-34` | hibrida | null | [{"tipo":"acao","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Truque  /  Mãos Mágicas · `truque-maos-magicas-35` | hibrida | null | [{"tipo":"acao","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Parte interpretativa/externa necessita arbitragem; ver tabela revisada na arquitetura. |
| Truque  /  Mensagem · `truque-mensagem-36` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ponto de Sorte · `ponto-sorte-rerrolagem` | rerrolagem-contextual | apos_rolagem_d20 | [{"tipo":"recurso","id":"pontos-de-sorte","quantidade":1}] | Integrada ao pedido/resultado identificado, não cria rerrolagem em uso avulso. |
| Gastar Dado de Vida · `gastar-dado-de-vida` | mecanica-configurada | {"somenteForaCombate":true} | [{"tipo":"recurso","id":"dados-de-vida","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Fora de combate não comprova descanso concluído nem tempo transcorrido. |
| Inspiração Heroica · `inspiracao-heroica-rerrolagem` | rerrolagem-contextual | apos_rolagem_d20 | [{"tipo":"recurso","id":"inspiracao-heroica","quantidade":1}] | Integrada ao pedido/resultado identificado, não cria rerrolagem em uso avulso. |
| Adaga +4  /  ação bônus · `item-82ce2b66-29ce-4ca9-a248-7101d18d4b94-2-corpo_a_corpo` | dependencia-de-ataque | {"aposAtaque":true,"tagsAtaqueAnterior":["arma","leve"]} | [{"tipo":"bonus","quantidade":1}] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |
| Adaga · arremesso +4  /  ação bônus · `item-82ce2b66-29ce-4ca9-a248-7101d18d4b94-2-arremesso` | dependencia-de-ataque | {"aposAtaque":true,"tagsAtaqueAnterior":["arma","leve"]} | [{"tipo":"bonus","quantidade":1}] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |

## Soldado da guarda

Fonte: `site/fichas/soldado.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Tocar o sino — AÇÃO DA MISSÃO · `9733d2ac-3544-575c-90a9-fe057e862788` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade — REAÇÃO · `cae79d30-a752-5e58-af9d-8befa34d4ea3` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |

## Zurich

Fonte: `site/fichas/zurich.json`.

| Habilidade / ID | Grupo | Gatilho / requisito | Custo | Observação |
|---|---|---|---|---|
| Ajudar  /  ação · `ajudar-acao-9` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Esconder  /  ação · `esconder-se-acao-10` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Preparar  /  ação · `preparar-acao-11` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Procurar  /  ação · `procurar-acao-12` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Analisar  /  ação · `estudar-acao-13` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Influenciar  /  ação · `influenciar-acao-14` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Objeto  /  ação · `utilizar-acao-15` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Usar Magia  /  ação · `usar-magia-acao-16` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Ataque de oportunidade  /  reação · `ataque-de-oportunidade-reacao-17` | reacao | sair_alcance | [{"tipo":"reacao","quantidade":1}] | Caminho reagir manual apenas cobra/registra; janela automática é diferente. |
| Assassino de Colossos · `assassino-de-colossos-18` | adicional-pos-acerto | apos_acerto | [] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |
| 1º  /  Saraivada de Espinhos · `1-saraivada-de-espinhos-26` | adicional-pos-acerto | apos_acerto | [{"tipo":"bonus","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Automação integrada ao dano; uso avulso pode virar só declaração/custo. |
| 1º  /  Falar com Animais · Ritual · `1-falar-com-animais-ritual-30` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1},{"tipo":"recurso","id":"espaco-1","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Truque  /  Arte Druídica · Elfo · `truque-arte-druidica-elfo-34` | declaracao-assistida | null | [{"tipo":"acao","quantidade":1}] | Custo/registro e eventual concentração; efeito não automatizado no caminho usar. |
| Gastar Dado de Vida · `gastar-dado-de-vida` | mecanica-configurada | {"somenteForaCombate":true} | [{"tipo":"recurso","id":"dados-de-vida","quantidade":1}] | Automação declarada; condições gerais do cenário não são prova de elegibilidade. Fora de combate não comprova descanso concluído nem tempo transcorrido. |
| Espada Curta +5  /  na ação Atacar · Ágil · `item-746a489e-3118-5b0d-8d97-885ca01c7ff2-corpo_a_corpo` | dependencia-de-ataque | {"aposAtaque":true,"tagsAtaqueAnterior":["arma","leve"],"umaVezPorTurno":"maestria-agil","itemAtaqueAnterior":"6e35b573-f770-57cd-8c00-632ec9b47442"} | [] | Requisitos verificados no ramo mecânico; vincular evento/turno/alvo. |
