# Segunda verificação de habilidades: momento de uso e resolução assistida

Estudo de 21/11/2026 sobre a versão publicada **0.8.82**, commit `9c66d74d6642dff22efadc131c72a4174cca4bb1`. Proposta para revisão do responsável: **não implementa popup, não altera regras, fichas, catálogo nem publicação**.

Atualização posterior: o responsável autorizou o desenvolvimento. A [implementação local e seus testes](IMPLEMENTACAO-SEGUNDA-VERIFICACAO-2026-11-21.md) estão documentados separadamente; as observações abaixo preservam o diagnóstico anterior à correção.

## 1. Objetivo e escopo

Antes de executar e gastar recursos, avisar quando a habilidade depende de um evento que não está vinculado, ou quando o efeito será resolvido total/parcialmente pelo mestre. A confirmação precisa dizer **o que será cobrado, o que será aplicado e o que continuará manual**. Não apresentar um gasto como se fosse dano, cura ou reação já resolvidos.

Foram lidas as 327 definições do catálogo e normalizadas 24 fichas locais: 13 em `site/fichas/` (exceto schema), mais 11 da aventura do cemitério. Resultam **399 opções e 58 passivas**, incluindo ataques gerados por equipamento. **122 opções** dessas fichas não têm `automacao`; no catálogo bruto são **130 definições** sem esse campo. Isso não equivale a 122/130 efeitos narrativos: há adicionais, rerrolagens, metamagia, resumos de testes e passivas integrados por outros campos.

As contagens do catálogo e das instâncias se sobrepõem e não devem ser somadas como habilidades únicas. O inventário registra variante, ID, fonte e portador. Não foi inspecionada a sala autenticada; fichas antigas ou autorais importadas apenas nela exigem classificação em tempo de execução. Opções concedidas por efeitos são um escopo dinâmico adicional.

- [Inventário por personagem, com candidatos contextuais/assistidos](mapeamento-uso-habilidades/INVENTARIO-POR-PERSONAGEM.md).
- [JSON completo: 327 definições e 457 instâncias de opções/passivas](mapeamento-uso-habilidades/inventario.json).
- [CSV de todas as instâncias](mapeamento-uso-habilidades/instancias.csv).
- [20 provas locais de comportamento atual](mapeamento-uso-habilidades/provas-20-cenarios.json).

Geração: `node mapear-uso-habilidades.mjs`. Repetição das provas, sobre cópias em memória: `node estudar-uso-habilidades.mjs`. Não são comandos de alteração da mesa.

## 2. Achados verificados no código

### 2.1 Adicionais automatizados podem virar só gasto quando usados avulsos

O motor oferece `aprimoramento` após o acerto, `rerrolagem` nos resultados e `modificadorDano` na rolagem apropriada. Porém, `usar` sem `automacao` aceita `assistido`, cobra custos e encerra como declaração narrativa. O caminho não garante que a opção tenha uma resolução avulsa válida. As provas P01–P05 confirmam consumo sem rolagem ou aplicação da mecânica.

No mesmo caminho, `requisitosUso` pode ficar sem validação: Golpe de Comando e Conter Avanço não têm `automacao`; o retorno da declaração acontece antes dos ramos que chamam `validarRequisitosUso`. P07/P18 aceitam ausência de acerto; o primeiro cobra o uso. A HUD pode desabilitar o botão por requisitos em combate, mas isso não cobre o motor, rotas alternativas nem o modo fora de combate.

### 2.2 Reação automática e declaração manual são fluxos distintos

`hud-controller.mjs` transforma opções com custo Reação em `reagir`. Esse comando cobra e registra, mas não executa a salvaguarda/dano/ataque de `o.automacao`; o histórico diz que gatilho e efeito foram conferidos pela mesa. Repreensão e Oportunidade manuais comprovam isso em P08/P09/P19. A opção Escudo Arcano/Defletir, com `ser_atingido`, bloqueia essa rota e exige a janela automática (P10).

Reagir fora do próprio turno **é normal quando o gatilho existe**. Estar fora do turno, sozinho, não deve disparar aviso de uso errado. O risco é ausência de evento, evento diferente ou efeito já resolvido. A janela automática existente comprova melhor esse contexto do que a posição na ordem de turnos.

Queda Suave é um caso de divergência: a documentação aprova reação narrativa inclusive fora de combate, mas `reagir` exige `fase==='turnos'`, e P11 é recusada. Um popup sozinho não resolve isso; será necessário um caminho contextual de exploração, preservando os custos aprovados e sem inventar uma queda.

### 2.3 Fora de combate não significa descanso ou tempo concluído

Gastar Dado de Vida cura e consome dado fora de combate sem sessão de descanso (P12). Astúcia Mágica recupera o espaço e consome seu uso sem aguardar um minuto (P13). A última é bloqueada em combate (P20). O futuro módulo de descanso já tem arquitetura aprovada; a confirmação não deve substituí-lo ou autorizar gastar Dados de Vida em qualquer momento.

### 2.4 Há efeitos mecânicos descritos, mas ainda assistidos

Reflexos cobra espaço sem simular as cópias/deflexão de ataques (P14). Disparo Preparado, Golpe de Comando, Conter Avanço, Aparar, Mira Firme e Reposicionar Soldado também têm mecânicas que a descrição deixa para a mesa. Nomear apenas “narrativo” pode ocultar essa limitação. A mensagem deve dizer “efeito mecânico assistido: o sistema só registrará/cobrará...”.

### 2.5 Não confundir três consentimentos existentes

`assistido` é hoje a indicação de declaração sem automação; `confirmado` é usado, entre outros fluxos, para o mestre agir por PJ; o clique Executar na carta é a confirmação comum. Nenhum deles contém identidade do evento/resultado e razões da nova segunda verificação. A proposta cria um campo próprio, sem sobrecarregar esses sinais.

Pontos de código consultados na 0.8.82: `engine.mjs` 1309–1380 (adicionais/rerrolagens), 1402 (requisitos), 1508 (validação anterior ao custo), 2509/2519 (iniciativa/reação contextual), 2648 (`reagir`), 2839–2860 (`assistido`, custo e retorno sem regra); `hud-controller.mjs` 492–529 (preparo), 874–884 (confirmação); `ui.mjs` 538–549 (rota da ficha); `executions.mjs` 8 (recursos bloqueados pela execução).

## 3. Famílias prioritárias e tratamento proposto

### 3.1 Pós-acerto, pós-ataque e modificadores da rolagem — P0

| Habilidade / portador | O que já existe | Onde deve operar / confirmação avulsa |
|---|---|---|
| Ataque Prostrador, Ameaçador e de Desarme — Draven | Adicionais com dado, salvaguarda e efeito | Dentro do dano do acerto compatível; avulso deve encaminhar à rolagem, ou declarar explicitamente custo/efeito manual. |
| Queimadura de Fogo — Draven | Dano adicional pós-acerto | Mesmo acerto/arma/tags; impedir novo gasto sobre evento já consumido. |
| Mão de Dolo — Loteria | Adicional necrótico após acerto desarmado | Dano da rolagem; não tratar ausência de `automacao` como falta de implementação. |
| Mão de Dolo · golpe da Torrente — Loteria | Ação de dano direto com requisitos | Validar o mesmo alvo/acerto, limite compartilhado e impedir uso junto do adicional duplicado no mesmo turno. |
| Saraivada de Espinhos — Zurich | Adicional pós-acerto e salvaguardas de área | Vincular acerto à distância/arma. Preservar o fix da Marca: fontes de dano explícitas, sem repetir dano da Marca. |
| Assassino de Colossos — Zurich | Adicional contextual, elegibilidade de PV | Preservar critério de alvo ferido e limite; não oferecer declaração genérica como dano automático. |
| Golpe Constritor — Dragoberto | Salvaguarda/condição com requisitos de acerto | Já rejeita sem acerto. Confirmar não deve liberar alvo/tags errados ou acerto antigo de outro turno. |
| Destruidor de Hordas — Dragoberto | Oferta/composição usando arma anterior | Outro alvo, distância ao alvo anterior, próprio turno e limite; encaminhar à oferta existente. |
| Valentão de Taverna · empurrar — Loteria | Movimento forçado depois de acerto desarmado | Mesmo alvo; não usar aviso para substituir o requisito. |
| Segunda arma/mão fraca e Ágil — Hannah, Nikki, Skimi, Zurich | Ataques gerados pelo equipamento, requisitos de ataque anterior | Reavaliar arma equipada, Leve/Ágil, ataque anterior e uso; não salvar exceção permanente no favorito. |
| Golpe de Comando e Conter Avanço — NPCs do Reino | Declarações assistidas com requisitos de pós-acerto | Corrigir a verificação anterior ao custo. Conter Avanço também exige limite de turno, mesmo sem custo numérico. |
| Ataque Furtivo — Irineu; Dano por Vantagem — goblins | Adicionais integrados, com critérios que a mesa completa | Aviso contextual só dos critérios não comprovados: vantagem/aliado/tipo de arma. Dano deve ficar na mesma rolagem. |
| Ácido do Mímico | Adicional obrigatório automático em ataques elegíveis | Não abrir confirmação para cada parcela automática; não permitir executá-lo isoladamente como novo ataque. |
| Magia Potencializada — Nikki | Rerrolagem de dados de dano | Resultado de dano mágico ativo, dados escolhidos, limite e uso; avulso hoje só gasta. |
| Ponto de Sorte e Inspiração Heroica — Skimi | Rerrolagens de d20 | Vincular pedido e versão do resultado; sem d20 ativo, abrir/indicar a rolagem correta. |
| Atacante Selvagem — Draven | Passiva automática na rolagem da arma | Sem gasto/ativação avulsa. Não duplicar a vantagem de dados com confirmação manual. |
| Magia Duplicada — Nikki | Escolha no compositor da magia | Validar magia/círculo/alvos elegíveis; manter o espaço escolhido e custo adicional. Hoje oculta nas listas normais. |

As 11 instâncias normalizadas de adicionais pós-acerto incluem as variantes dos goblins e o ácido do mímico; as três rerrolagens são famílias distintas. O inventário inclui os IDs exatos, não apenas os nomes da tabela.

### 3.2 Reações — P0

| Família | Evento certo | Cobertura e proposta |
|---|---|---|
| Ataque de Oportunidade — comuns | Saída voluntária do alcance elegível, sem proteção que impeça oportunidade | Janela automática existente. Manual apenas declara/gasta Reação: dizer que não fará ataque/dano automaticamente nesse modo. Vínculo com alvo/segmento de movimento evita aplicar tarde. |
| Repreensão Diabólica — Nikki | Sofrer dano, origem/alvo elegível | Janela automática resolve DES/dano. Uso manual deve avisar a diferença e o plano exato de custo (uso gratuito ou espaço), antes de cobrar. |
| Defletir Ataques — Loteria | Ataque atingindo, dano compatível, antes da conclusão | Usar a reação preventiva existente. Não liberar avulso por popup; dano já aplicado precisa de correção explícita separada. |
| Escudo Arcano — Drow/Mago do Reino e variantes do catálogo | Acerto ou Mísseis Mágicos, antes da conclusão | Janela preventiva, +5 CA e duração existentes. Não registrar como defesa efetiva após o dano já encerrado. |
| Queda Suave — Nikki | Você/alvos caindo dentro do alcance | Narrativa, incluindo fora de combate conforme decisão documentada; confirmar queda, beneficiários e custo. A rota fora de combate precisa ser adaptada. |
| Aparar — Comandante | Acerto corpo a corpo visível, espada empunhada, sem incapacidade | Assistida; não muda CA automaticamente hoje. Avisar que +2 vale apenas naquele ataque e que a Reação será gasta. |
| Mãos da Sepultura — Seu Furtado | Criatura tenta se afastar a 1,5 m, antes de sair | Assistida; salvaguarda/Agarrado e parada do movimento dependem da mesa. Não confundir com ataque de oportunidade normal. |
| Ação preparada, movimento de Manto de Inspiração e Reposicionar Soldado | Gatilho declarado ou concessão específica | Essas descrições não criam toda a cadeia automaticamente. Exigem contexto para a reação do beneficiário e aviso dos passos manuais; não retirar recursos de outro ator só com a confirmação do conjurador. |

Reações podem ocorrer no próprio turno ou em outro turno. A confirmação usa o evento e o saldo atual, não a regra “fora da vez = errado”. Sem Reação disponível continua bloqueado. Não tratar disponibilidade infinita da apresentação fora de combate como autorização para descartar o espaço/uso exigido por Queda Suave.

### 3.3 Resolução pelo mestre e ações assistidas — P1

| Grupo | Portadores/fontes | Aviso útil antes de gastar |
|---|---|---|
| Ajudar | PJs/guardas | O sistema não aplica toda ajuda narrativa/vantagem do próximo aliado. Ajudar · Estabilizar é outra opção automatizada e não deve receber este mesmo rótulo. |
| Esconder, Procurar, Analisar, Influenciar | PJs e versões NPC | Condições do cenário e teste/CD definidos pela mesa. Declarar a ação não rola automaticamente a perícia. Evitar cobrar ação de novo ao fazer o teste separado. |
| Preparar | Comuns | Definir gatilho/ação reservada, concentração e eventual espaço da magia preparada; a extensão não agenda toda a reação automaticamente. Avisar agora e depois não cobrar a mesma magia duas vezes. |
| Usar Objeto, Usar Magia, Tocar o Sino | Comuns/missão | São declarações genéricas; não executam automaticamente item ou magia da lista. Escolher modo de declaração/ativação real para impedir gasto de Ação duplicado. Sino depende de acesso, mão e distância ao objeto. |
| Falar com Animais, Arte Druídica, Mensagem, Compreender Idiomas, Arrombar | Hannah/Skimi | Conversa/conteúdo/objetos/barreiras/barulho resolvidos pela mesa. Mostrar modo ritual ou uso normal e o custo real escolhido. |
| Detectar Pensamentos, Detectar Magia, Fala Telepática | Nikki/Skimi/Hannah e variantes | Informação privada, idioma, visibilidade e sondagem são externos. Não anunciar que todo teste, alcance ou comunicação foi resolvido automaticamente. Detectar Magia do Padre tem marcador próprio, cobertura diferente. |
| Reflexos | Hannah | Efeito defensivo mecânico assistido, não meramente visual: espaço será gasto; cópias e desvio de ataques não serão simulados hoje. |
| Disparo Preparado; Reposicionar Soldado; Graxa | NPCs do Reino | Informar o que fica manual: vantagem/ataque e movimento zero; reação/movimento do aliado e oportunidades; zona/terreno/testes de Graxa. O fato de existir motor genérico semelhante não significa que estas definições já o utilizem. |
| Ação Ardilosa/Fuga Ágil · Esconder, Mira Firme, Mãos Rápidas | Irineu/goblins | Testes e condições externas; Mira Firme depende de não ter se movido e não zera movimento automaticamente hoje. |
| Mudar Forma | Mímico | Consome bônus; aparência/aderência e interações com objetos são assistidas. Não presumir troca automática de arte de token. |
| Manobras; Presa do Caçador | Draven/Dragoberto | São resumos/seletores. Melhor abrir a escolha ou explicar o traço, sem confirmação de gasto fictício. Não permitir Assassino e Destruidor simultaneamente por esse resumo. |

Resolução narrativa não é erro de horário. Uma habilidade narrativa válida no próprio turno deve dizer só que o mestre resolve o efeito, sem acusar uso incorreto. Em exploração, Ação/Bônus não são debitadas pelo caminho normal `usar`; recursos limitados continuam sujeitos ao plano real. A mensagem não deve reproduzir o custo nominal de combate como se fosse o débito efetivo.

### 3.4 Híbridas e limites dos protótipos — P1, por modo

| Habilidade | Parte automática a preservar | Parte que pode precisar de confirmação |
|---|---|---|
| Disfarçar-se; Mente Desperta | Marcadores/duração/encerramento | Aparência, conversa, idioma e distância arbitrada. Não prometer troca de token ou transmissão de mensagens. |
| Ilusão Menor | Peça estática visual | Som e credibilidade/reação dos NPCs; confirmar apenas o modo relevante. |
| Mãos Mágicas; Encontrar Familiar | Entidade/peça, controle e posição suportados | Interagir com objetos, sentidos e tarefas; Encontrar Familiar tem tempo/ritual no texto que precisa de tratamento explícito. |
| Taumaturgia | Regra autoral de vantagem em Intimidação e marcador | Outros prodígios são narrativos. Há definições dos PJs e protótipo do Padre; não mudar a regra autoral ao adicionar o aviso. |
| Enfeitiçar Pessoa, Amizade, Sugestão, Força Fantasmagórica | Salvaguardas/condições/marcadores/dano suportados | Entender idioma, comandos aceitáveis, interpretação da ilusão, hostilidade e conhecimento do encanto. Dano da ilusão concedido dinamicamente precisa do efeito vivo e do turno correto. |
| Manto de Inspiração | PV temporários suportados | Reações e movimento dos beneficiários; não inferir que os alvos já se moveram. |
| Animar Mortos | Transformação imediata, sobreposição, custo, token e loot preservados | Ordens, controle prolongado e componentes não automatizados. **Preservar expressamente a decisão de transformação instantânea da aventura.** |
| Luz; Detectar Magia do Padre | Marcador/duração e raios registrados | Luz não configura outros plugins; auras/escolas ocultas dependem do mestre. |
| Proteção contra o Bem e o Mal | Componentes cadastrados e proteções suportadas | Possessão, situações preexistentes e efeitos externos. Não consumir componente da missão inadequado. |
| Prece de Cura | Dez minutos registrados, cura e recuperação configurada | Dados de Vida e escolhas de descanso ainda assistidos; integrar o plano de descanso aprovado posteriormente. Não repetir gastos/avisos ao retomar a conjuração. |
| Acalmar Emoções | Prototipagem de supressão/indiferença no Padre; definição de Nikki tem cobertura diferente | Hostilidade/agressão a aliados. Classificar pela definição/modo efetivo, não apenas pelo nome da magia. |
| Dissipar Magia; Remover Maldição | Efeitos com metadados suportados | Objetos/efeitos externos e vínculo de item amaldiçoado. Preservar o rito próprio das adagas. |
| Revivificar | Elegibilidade temporal/componente/PV suportados | Condições narrativas que a ficha não registra. Não transformar esse aviso em uma ressurreição de qualquer cadáver. |
| Expulsar Mortos-vivos | Salvaguardas/condições/dano suportados | Direção/movimento de fuga decidido pela mesa. |
| Fortitude/Tenacidade dos mortos-vivos, Aderência do Mímico | Algumas defesas são automáticas | Gatilhos de passivas assistidas precisam de proposta no evento adequado, não de botão de gasto fictício. Defesas cadavéricas radiante ×2/necrótico ×¼ permanecem. |

Nem todo protótipo precisa de popup. Auxílio, curas, dano, Restauração Menor, Bênção, PV temporários etc. não entram só pelo rótulo protótipo. Advertir apenas um limite relevante do modo escolhido. Sopro de Dragão e sua ação concedida devem manter integralmente o fix publicado.

## 4. Classificação da segunda verificação

O avaliador recebe o contexto e devolve um resultado composto: uma ação pode ser simultaneamente fora do evento e assistida. Não escolher apenas o primeiro motivo.

| Resultado | Comportamento |
|---|---|
| Permitido e coberto | Executar pela confirmação comum; sem novo popup. |
| Assistido/narrativo | Segunda verificação com custo e escopo, Cancelar / Confirmar declaração e gasto. |
| Híbrido com limite relevante | Explicar a parte automática e a parte manual; uma confirmação para todos os motivos aplicáveis. |
| Evento obrigatório ausente, mas há pedido adequado ativo | Oferecer Ir para a rolagem/reação; não cobrar nem executar a habilidade avulsa. |
| Gatilho externo que o sistema não consegue comprovar | Avisar “gatilho não verificado”, sem afirmar que ele não ocorreu. Pode permitir declaração assistida se essa modalidade estiver prevista. |
| Violação objetiva | Bloquear ou encaminhar ao fluxo correto. Popup não autoriza falta de saldo, personagem sem controle, alvo inválido, habilidade inativa, limite esgotado, evento já consumido ou exceção de turno proibida. |
| Resumo/passiva sem uso independente | Abrir explicação/escolha; sem cobrança ou evento de execução fictício. |

**Recomendação:** não transformar o botão Confirmar numa permissão geral para usar qualquer coisa fora da hora. Para declarar excepcionalmente algo incompatível com o estado, seria necessário um modo manual explícito e separado, sujeito às regras da mesa; não faz parte da implementação inicial proposta. Uma declaração assistida válida informa que o efeito ficará com o mestre, sem inventar retroativamente um acerto, queda ou reação.

## 5. Popup proposto

Abre **após clicar Executar na instância e antes de qualquer gasto, rolagem, movimento ou alteração de concentração**. A preparação/seleção anterior permanece sem custo. Se movimento dinâmico estiver envolvido, o aviso vem antes da primeira etapa que efetivamente se move; a conclusão da caminhada revalida contexto e custo.

Exemplo de pós-acerto aberto avulso:

> **Mão de Dolo — uso sem acerto vinculado**
>
> Esta habilidade funciona depois de acertar um golpe desarmado. Nenhum acerto elegível está ligado a esta instância.
>
> Na declaração assistida, será gasto **1 Foco**. **O sistema não aplicará o dano necrótico nesta declaração.**
>
> Cancelar · Ir para a rolagem · Confirmar declaração assistida (somente quando essa modalidade estiver habilitada)

Exemplo narrativo:

> **Reflexos — efeito mecânico assistido**
>
> Será gasto **1 Ação e 1 espaço de 2º círculo**. As cópias e o desvio dos próximos ataques serão resolvidos pela mesa.
>
> Cancelar · Confirmar uso e gasto

Exemplo de reação:

> **Repreensão Diabólica — reação manual**
>
> O sistema não identificou uma janela de dano vinculada. Este caminho registra o uso e cobra **1 Reação + o uso gratuito disponível**, sem rolar dano ou salvaguarda automaticamente.
>
> Cancelar · Abrir reação pendente (se houver) · Confirmar declaração assistida

Os custos acima são ilustrativos. A UI deve usar `planoCustoOpcao` para círculo, modo gratuito/automático, composição, metamagia, itens/componentes e saldo atual. Mostrar custo/saldo e também concentração substituída, perda de proteção relevante e etapa futura de cobrança em conjuração longa. Sem bandeira genérica “não perguntar novamente” para riscos contextuais; no máximo uma preferência futura para lembretes narrativos sem efeito de autorização.

Cancelar volta à instância com escolhas conservadas e sem gasto. Botão padrão/foco inicial em Cancelar; Enter/duplo clique que acionou Executar não deve confirmar o novo popup. Menu não deve cobrir a tela com janelas transparentes órfãs; usar um popover visível delimitado, fechável por Cancelar/Escape. Fechar por fora equivale a cancelar a verificação, sem finalizar a jogada indevidamente.

## 6. Arquitetura técnica proposta

### 6.1 Avaliação pura e cobertura explícita

Novo módulo proposto `site/skill-use-review.mjs`, com `avaliarUsoHabilidade(estado,ator,opcao,intencao,contexto,usuario)`. Retorno conceitual:

```js
{
  resultado: 'permitir' | 'confirmar' | 'encaminhar' | 'bloquear' | 'informar',
  motivos: [{codigo, severidade, texto, evidencia}],
  cobertura: {registro, custos, rolagens, efeitos, parteManual},
  custoEfetivo: [],
  consequencias: [],
  vinculo: {atividadeId, execucaoId, pedidoId, etapaVersao, eventoId, turnoId},
  alternativas: [],
  impressao: 'identidade-do-plano-e-contexto'
}
```

O avaliador não lança dados, não debita nada e não marca `usosTurno`. O atual `validarRequisitosUso` tem mutação ao marcar limites: separar consultar de consumir antes de reutilizá-lo na prévia. A autoridade deve usar a mesma política e revalidar o plano completo antes de aplicar, cobrindo `usar`, `reagir`, `resolverReacao`, `responderIniciativa`, composições e declarações assistidas.

Metadados de cobertura devem descrever resolução total/assistida/híbrida/contextual e campos manuais, por definição e modo; não inferir apenas de `!automacao`, nome, texto ou categoria. Preferir IDs de catálogo/metadados existentes. As correspondências por texto do gerador deste estudo são **triagem**, não devem ser copiadas como autorização do motor. Itens, concessões por efeito e fichas locais precisam de cobertura derivada e fallback honesto.

### 6.2 Identidade do evento e prevenção de uso tardio

Persistir referências estáveis do acerto/ataque/resultado/reação, turno/rodada e versão da etapa. `eventosTurno` já é ponto de partida, mas não substitui sozinho um vínculo de consumo da habilidade à mesma resolução. Identificar alvo, arma/modo, tags, crítico, fontes adicionais, limite utilizado e estado de conclusão.

- Uma manobra vinculada a um acerto não pode migrar para outro alvo/turno por reconexão.
- Uma rerrolagem só pode alterar a versão atual do resultado ainda elegível.
- Não acrescentar uma fonte de dano a uma execução encerrada sem correção explícita auditável.
- Oportunidade deve saber qual saída/segmento de movimento está respondendo.
- Exceções de percepção/idioma/objeto invisíveis no estado aparecem como não verificáveis, sem alegar certeza.

### 6.3 Consentimento separado e idempotência

Campo novo sugerido `confirmacaoUso: {id, versao, impressao, codigosAceitos, modalidade}`. Não reutilizar `confirmado:true`, nem confiar em um boolean enviado pelo player. Ligar ao usuário, ator, opção, alvos, círculo, custos, modo, efeitos consequentes e evento atual. A autoridade recalcula a avaliação; diferença relevante invalida o aceite e pede revisar o novo plano. Mudança de revisão sem relação com esse ator não precisa, sozinha, repetir o popup: comparar dependências pertinentes.

Reutilizar ID da atividade/execução. Clique duplo, mensagem reenviada, F5 e assumir pelo mestre não podem cobrar novamente. Uma confirmação cobre os motivos daquela intenção e daquela versão; não se torna autorização de qualquer ação futura. Falha antes de debitar não consome; após persistir, reentrega restaura o resultado já registrado.

### 6.4 HUD, ficha, Favoritos e protocolos

- `hud-ui.mjs` e `hud-controller.mjs`: renderizar aviso único, encaminhar ao evento adequado e preservar carta ao cancelar/fechar. O botão direito dos Favoritos continua só gerindo preferências; adicionar/remover favorito não abre aviso de gasto.
- `hud-part.mjs` e `hud-protocol.mjs`: mensagens com documento/sessão/ator e intenção correspondentes; limpar popup ao trocar de personagem/recolher quando necessário. Conteúdo do aviso e nomes de habilidades escapados.
- `ui.mjs` (ficha): mesmo avaliador e resumo. A confirmação comum existente deve incorporar motivos, não criar uma rota sem segunda verificação.
- `bridge.mjs`/`executions.mjs`: avaliação na autoridade, diário de consentimento/recibo e recuperação. Declarações independentes não precisam bloquear toda a mesa; hoje tipos diferentes de `usar`/`teste` tendem ao recurso global `mesa`, o que deve ser revisto com testes específicos.
- `ficha.schema.json`, validador, catálogo/compactação/importação: aceitar os novos metadados de cobertura com padrão para legado, sem exigir reimportar fichas cuja resolução possa ser derivada com segurança.
- `prototipos-cemiterio.mjs`: cobertura por modo, sem alterar transformações, cura, componentes e durações existentes.

### 6.5 Atividades e mestre

Uma intenção em segunda verificação continua sendo a mesma atividade, com indicação “Aguardando confirmação de uso”. É pendência do executante, sem disparar rolagens. Quando confirmada como narrativa, mostrar “Declarada — efeito com o mestre”, com custo efetivamente gasto e limites da automação. Pode existir um acompanhamento de arbitragem, mas ele não debita novamente, não bloqueia os demais atores e não deve ficar pendente para sempre sem comando de encerrar.

Não exigir aprovação prévia do mestre para **todas** as habilidades narrativas: o objetivo inicial é a segunda confirmação de quem está executando. O mestre vê a declaração/histórico e resolve a parte manual. Se assumir a mesma atividade, continua o fluxo existente; consentimento do jogador e agir pelo jogador são permissões distintas.

Privacidade: GM vê dados de NPC; jogadores não recebem PV/recursos ocultos, textos privados de pensamento nem motivos que revelem um NPC escondido. Avisos baseados em critérios secretos devem ser genéricos ou resolvidos pela autoridade.

## 7. Sequência de implementação proposta

1. **P0 — unificar classificação e pré-validação antes do custo.** Corrigir o salto dos requisitos de opções assistidas e impedir consumo acidental de adicionais/rerrolagens avulsos. Preservar os bloqueios já corretos.
2. **P0 — vincular eventos e encaminhar.** Acerto/dano/d20, iniciativa e reação automática; demonstrar ausência de repetição de fontes. Nenhuma mudança nas regras de Marca/Saraivada ou Sopro de Dragão.
3. **P1 — segunda verificação e declaração explícita.** Mensagens específicas, custo real, parte manual, modal delimitado e mesmos critérios na ficha/HUD/Favoritos.
4. **P1 — exploração, tempo e híbridas.** Queda Suave fora de combate, ritual/tempo, Dados de Vida pelo descanso aprovado; limites por modo de protótipo. Não “consertar” tempo ou ritual apenas com texto de popup que mantenha cobrança errada.
5. **P2 — legado, autorais e manutenção.** Metadados novos, relatórios por ficha, cobertura desconhecida e registro auditável de arbitragem encerrada.

## 8. Decisões propostas para o responsável

1. **Aviso não contorna regra:** manter bloqueios objetivos; encaminhar pós-acerto/rerrolagem ao evento em vez de prometer resolução avulsa.
2. **Declaração manual explícita:** se permitida, exigir texto “registrar e gastar; efeito com o mestre”. Não usar o rótulo executar dano nesse caminho.
3. **Uma segunda confirmação por intenção:** agrupar narrativa + gatilho não verificado + concentração/custos; não empilhar popups para cada dado/beneficiário.
4. **Reações fora do turno são válidas:** avaliar evento, não o número da vez.
5. **Fallback para autoral/legado:** classificação desconhecida deve ser assumida/assistida com aviso, nunca alegar automação completa; erros estruturais continuam inválidos.
6. **Sem aprovação GM obrigatória para toda declaração:** segundo aceite do executante e registro para o mestre, mantendo a experiência fluida. Exceções reais de regra ficam para modo próprio a aprovar depois.
7. **Seletores não gastam:** Manobras/Presa, passivas e modificadores automáticos abrem informação ou fluxo contextual apropriado.
8. **Sem “não avisar nunca mais” para fora de contexto:** aceite vinculado ao evento e custo atual. Popup não deve reaparecer a cada reentrega da mesma intenção confirmada.

Estas decisões são recomendações deste estudo, **ainda não aprovadas como alteração de comportamento**. A arquitetura de descanso curto anteriormente aceita permanece válida.

## 9. Matriz de testes para a implementação

- Pós-acerto com/sem acerto, erro/crítico, tags erradas, alvo errado, turno anterior e limite já usado. Adicional já embutido versus variante direta, fonte de dano e uso gratuito.
- Rerrolagem antes/depois do resultado, dados permitidos, versão antiga, resultado encerrado e mestre assumindo a mesma execução.
- Reação válida fora do turno, sem gatilho, sem saldo, após dano aplicado, saída impedida, Repreensão com uso gratuito/espaço e Queda Suave em exploração.
- Narrativas comuns válidas, ações genéricas/Preparar sem gasto duplo, resumo/passiva sem custo, habilidades híbridas por modo e aspectos secretos.
- Ritual versus magia com espaço; conjuração longa interrompida/retomada; Dados de Vida sem descanso; Astúcia sem tempo; Prece e futura sessão de descanso.
- Modificar alvo/círculo/modo/saldo/concentração enquanto popup está aberto; mudança irrelevante em outro ator não repete aviso. Troca de personagem, favorito, filtro, compactar, F5, desconexão, cena e duas abas.
- Cancelar/Escape sem gasto, duplo clique/Enter não aceitam dois passos, falha/reenvio sem duplicar, ação em paralelo de outro jogador continua, GM/NPC/PJ com controle correto.
- Regressão de alcance/hitbox, movimento dinâmico/oportunidades, A e cliques através do HUD, imagens sem piscadas, status compactos, Favoritos, privacidade e tráfego.

## 10. Evidência resumida — vinte provas no motor atual

As provas chamam o motor diretamente em cópias locais e não representam cliques na sala do responsável. São sondagens de comportamento: aceitar uma declaração assistida não prova que todos os botões da HUD estejam habilitados naquele momento. Todas usam custo/saldo disponíveis e sem ataque/acerto prévio, salvo contexto explicitado pelo nome. No JSON ficam comandos selecionados, custos/saldos e mensagens de recusa.

| Prova | Resultado observado |
|---|---|
| P01 Mão de Dolo avulsa | Aceita; Foco 3→2; nenhuma rolagem/aplicação de dano. |
| P02 Ataque Prostrador avulso | Aceita; Superioridade 4→3; nenhuma rolagem. |
| P03 Saraivada avulsa | Aceita; espaço de 1º 3→2; nenhuma rolagem. |
| P04 Magia Potencializada avulsa | Aceita; Feitiçaria 3→2; nenhuma rerrolagem. |
| P05 Ponto de Sorte avulso | Aceita; Sorte 2→1; nenhuma rerrolagem. |
| P06 Golpe Constritor sem acerto | Recusa: exige acerto neste turno. |
| P07 Golpe de Comando sem acerto | Aceita pelo GM; uso 1→0; nenhuma rolagem. |
| P08 Repreensão manual | Aceita; Reação 1→0 e uso gratuito 1→0; nenhuma salvaguarda/dano. |
| P09 Oportunidade manual | Aceita; Reação 1→0; nenhum ataque/dano. |
| P10 Escudo Arcano manual | Recusa: exige janela automática ao acerto. |
| P11 Queda Suave fora de combate | Recusa: Reação indisponível nessa fase. |
| P12 Dado de Vida sem descanso | Aceita; dado 3→2; cura 1→6 PV, sem sessão de descanso. |
| P13 Astúcia Mágica sem espera | Aceita; recupera espaço e gasta o uso; nenhuma etapa de tempo. |
| P14 Reflexos | Aceita; espaço de 2º 2→1; nenhuma simulação de cópias. |
| P15 Ajudar | Aceita como declaração assistida; nenhuma perícia automática. |
| P16 Metabolismo avulso | Recusa: exige janela de iniciativa. |
| P17 Segunda arma sem ataque | Recusa: exige ataque anterior no turno. |
| P18 Conter Avanço sem acerto | Aceita pelo GM; nenhuma rolagem ou redução automática. |
| P19 Repreensão no turno do outro | Aceita como declaração manual; consome uso/Reação sem resolver dano. |
| P20 Astúcia Mágica em combate | Recusa: somente fora de combate. |

## 11. Preservações obrigatórias

Sopro de Dragão publicado; Marca/Saraivada e origem das parcelas; instâncias e salvaguardas persistentes; Dados de Vida/recursos atuais; regras autorais de reanimação instantânea, sobreposição, token e loot; CA e Luvas; proteção dos componentes/rito das adagas; defesas dos zumbis; privacidade de NPCs; geometria pequena de popovers e cliques no mapa. Nenhuma dessas decisões é redefinida pelo popup.

Referências internas de interpretação e protótipos: [habilidades de interpretação](HABILIDADES-DE-INTERPRETACAO.md), [protótipos do cemitério](PROTOTIPOS-HABILIDADES-CEMITERIO.md), [descanso curto aprovado](ARQUITETURA-DESCANSO-CURTO-DADOS-DE-VIDA.md).
